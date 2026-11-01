"""
Unit tests for Greywater Multi-Tier Routing Rules Decision Engine.
Verifies safety prioritization, conflict handling, and boundary conditions.
Runnable via standard python (python tests/test_routing_rules.py) or pytest.
"""

import sys
import os

# Add root directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from routing.routing_rules import (
    evaluate_routing,
    CLASS_SEWER_BYPASS,
    CLASS_BIO_FILTRATION,
    CLASS_RESTRICTED_IRRIGATION,
    CLASS_INDOOR_REUSE,
    CLASS_NAMES
)


def get_base_sample():
    """Returns an ideal pristine baseline greywater sample."""
    return {
        "Sample_ID": 101,
        "Greywater_Source": "Bathroom",
        "pH": 7.2,
        "TEMP_C": 24.0,
        "SAL_ppt": 0.20,
        "TUR_NTU": 15.0,
        "DS_mg_L": 220.0,
        "TDS_mg_L": 230.0,
        "TSS_mg_L": 25.0,
        "COND_uS_cm": 400.0,
        "DO_mg_L": 4.5,
        "BOD_mg_L": 30.0,
        "COD_mg_L": 80.0,
        "NH4F_mg_L": 5.0,
        "NO3_mg_L": 4.0,
        "K_mg_L": 12.0,
        "E_coli_CFU_100mL": 8000
    }


def test_normal_acceptable_profile():
    """Case 1: Normal pristine sample qualifies for Indoor Reuse."""
    sample = get_base_sample()
    cls, name, reason, triggers, treatment, flag = evaluate_routing(sample)
    assert cls == CLASS_INDOOR_REUSE
    assert name == "Indoor Reuse"
    assert "Indoor" in reason
    assert "Package" in treatment


def test_high_ecoli_severe():
    """Case 2A: Extremely high E. coli (>500,000 CFU) triggers Sewer Bypass."""
    sample = get_base_sample()
    sample["E_coli_CFU_100mL"] = 850000
    cls, name, reason, triggers, treatment, flag = evaluate_routing(sample)
    assert cls == CLASS_SEWER_BYPASS
    assert name == "Sewer Bypass"
    assert "E_coli_severe" in triggers


def test_high_ecoli_elevated():
    """Case 2B: Elevated E. coli (e.g. 120,000 CFU) triggers Bio-filtration."""
    sample = get_base_sample()
    sample["E_coli_CFU_100mL"] = 120000
    cls, name, reason, triggers, treatment, flag = evaluate_routing(sample)
    assert cls == CLASS_BIO_FILTRATION
    assert name == "Bio-filtration"
    assert "E_coli_elevated" in triggers


def test_high_bod_cod_severe():
    """Case 3A: Severe BOD (>400) or COD (>800) triggers Sewer Bypass."""
    sample = get_base_sample()
    sample["BOD_mg_L"] = 450.0
    sample["COD_mg_L"] = 900.0
    cls, name, reason, triggers, treatment, flag = evaluate_routing(sample)
    assert cls == CLASS_SEWER_BYPASS
    assert "BOD_severe" in triggers
    assert "COD_severe" in triggers


def test_high_bod_cod_elevated():
    """Case 3B: Elevated BOD/COD triggers Bio-filtration."""
    sample = get_base_sample()
    sample["BOD_mg_L"] = 180.0
    sample["COD_mg_L"] = 380.0
    cls, name, reason, triggers, treatment, flag = evaluate_routing(sample)
    assert cls == CLASS_BIO_FILTRATION
    assert "BOD_elevated" in triggers


def test_high_turbidity_tss():
    """Case 4: Severe turbidity (>140 NTU) or TSS (>250 mg/L) triggers Sewer Bypass."""
    sample = get_base_sample()
    sample["TUR_NTU"] = 160.0
    sample["TSS_mg_L"] = 290.0
    cls, name, reason, triggers, treatment, flag = evaluate_routing(sample)
    assert cls == CLASS_SEWER_BYPASS
    assert "TUR_severe" in triggers


def test_extreme_ph():
    """Case 5: Extreme pH outside 6.0-9.0 triggers immediate Sewer Bypass."""
    sample_low = get_base_sample()
    sample_low["pH"] = 5.2
    cls, name, _, triggers, _, _ = evaluate_routing(sample_low)
    assert cls == CLASS_SEWER_BYPASS
    assert "pH_extreme" in triggers

    sample_high = get_base_sample()
    sample_high["pH"] = 9.8
    cls_h, _, _, triggers_h, _, _ = evaluate_routing(sample_high)
    assert cls_h == CLASS_SEWER_BYPASS
    assert "pH_extreme" in triggers_h


def test_high_tds_salinity():
    """Case 6: High TDS (>800 mg/L) or Salinity (>0.60 ppt) triggers Sewer Bypass."""
    sample = get_base_sample()
    sample["TDS_mg_L"] = 920.0
    sample["SAL_ppt"] = 0.68
    cls, name, _, triggers, _, _ = evaluate_routing(sample)
    assert cls == CLASS_SEWER_BYPASS
    assert "TDS_severe" in triggers or "SAL_severe" in triggers


def test_multiple_severe_parameters():
    """Case 7: Multiple severe parameters all recorded in triggered list."""
    sample = get_base_sample()
    sample["pH"] = 5.5
    sample["BOD_mg_L"] = 520.0
    sample["TUR_NTU"] = 175.0
    cls, name, _, triggers, _, _ = evaluate_routing(sample)
    assert cls == CLASS_SEWER_BYPASS
    assert "pH_extreme" in triggers
    assert "BOD_severe" in triggers
    assert "TUR_severe" in triggers


def test_conflicting_parameters():
    """Case 8: Acceptable TDS and pH, but elevated TSS/BOD/E.coli -> MUST NOT be Indoor Reuse."""
    sample = get_base_sample()
    sample["pH"] = 7.1
    sample["TDS_mg_L"] = 210.0
    sample["BOD_mg_L"] = 75.0          # Exceeds indoor (<=45), but below bio-filtration cut (<=120)
    sample["E_coli_CFU_100mL"] = 35000  # Exceeds indoor (<=20000), but below bio cut (<=75000)
    cls, name, reason, triggers, _, _ = evaluate_routing(sample)
    # Must correctly drop down to Restricted Irrigation
    assert cls == CLASS_RESTRICTED_IRRIGATION
    assert name == "Restricted Irrigation"
    assert cls != CLASS_INDOOR_REUSE


def test_missing_required_input():
    """Case 9: Missing mandatory field handled safely with Sewer Bypass failsafe."""
    incomplete_sample = {"Sample_ID": 999, "pH": 7.0}
    cls, name, reason, triggers, _, flag = evaluate_routing(incomplete_sample)
    assert cls == CLASS_SEWER_BYPASS
    assert "Input Validation Failure" in reason
    assert "Corrupt Data" in flag


def test_boundary_values():
    """Case 10: Boundary testing around threshold points."""
    # Test exactly on BOD 400.0 (boundary for sewer bypass is > 400)
    sample_400 = get_base_sample()
    sample_400["BOD_mg_L"] = 400.0
    sample_400["COD_mg_L"] = 500.0  # bio-filtration range
    cls, name, _, _, _, _ = evaluate_routing(sample_400)
    assert cls == CLASS_BIO_FILTRATION

    # Test at 400.1 (exceeds 400 -> sewer bypass)
    sample_400_1 = get_base_sample()
    sample_400_1["BOD_mg_L"] = 400.1
    cls_sev, _, _, triggers, _, _ = evaluate_routing(sample_400_1)
    assert cls_sev == CLASS_SEWER_BYPASS
    assert "BOD_severe" in triggers


if __name__ == "__main__":
    all_tests = [
        test_normal_acceptable_profile,
        test_high_ecoli_severe,
        test_high_ecoli_elevated,
        test_high_bod_cod_severe,
        test_high_bod_cod_elevated,
        test_high_turbidity_tss,
        test_extreme_ph,
        test_high_tds_salinity,
        test_multiple_severe_parameters,
        test_conflicting_parameters,
        test_missing_required_input,
        test_boundary_values
    ]
    print(f"Running {len(all_tests)} routing rules test cases...")
    for test in all_tests:
        test()
        print(f"  [PASS] {test.__name__}")
    print(f"ALL {len(all_tests)} UNIT TESTS COMPLETED SUCCESSFULLY!")
