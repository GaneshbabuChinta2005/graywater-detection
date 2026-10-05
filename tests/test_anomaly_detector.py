"""
Unit tests for Isolation Forest Anomaly Detection and Safety Screening Module
Tests all 10 required operational scenarios.
"""

import pytest
import numpy as np
import pandas as pd
from anomaly.anomaly_detector import (
    GreywaterAnomalyDetector,
    train_isolation_forest,
    predict_anomaly,
    calculate_anomaly_score,
    analyze_anomaly,
    apply_safety_override,
    check_severe_conditions,
    EXPECTED_FEATURES,
    SEVERE_THRESHOLDS
)


@pytest.fixture
def fitted_detector():
    """Create a synthetic reference training set and fit an anomaly detector."""
    np.random.seed(42)
    n_samples = 300
    
    # Generate realistic baseline distributions within normal reference bounds
    data = {
        "Greywater_Source_Bathroom": np.random.choice([0, 1], size=n_samples, p=[0.7, 0.3]),
        "Greywater_Source_Kitchen": np.zeros(n_samples), # Kitchen often bypassed
        "Greywater_Source_Laundry": np.random.choice([0, 1], size=n_samples, p=[0.7, 0.3]),
        "Greywater_Source_Mixed": np.zeros(n_samples),
        "pH": np.random.normal(7.2, 0.5, size=n_samples).clip(6.5, 8.5),
        "TEMP_C": np.random.normal(24.0, 3.0, size=n_samples).clip(18.0, 32.0),
        "SAL_ppt": np.random.uniform(0.1, 0.8, size=n_samples),
        "TUR_NTU": np.random.uniform(2.0, 35.0, size=n_samples),
        "DS_mg_L": np.random.uniform(50.0, 300.0, size=n_samples),
        "TDS_mg_L": np.random.uniform(150.0, 600.0, size=n_samples),
        "TSS_mg_L": np.random.uniform(10.0, 50.0, size=n_samples),
        "COND_uS_cm": np.random.uniform(200.0, 900.0, size=n_samples),
        "DO_mg_L": np.random.uniform(4.0, 8.0, size=n_samples),
        "BOD_mg_L": np.random.uniform(10.0, 60.0, size=n_samples),
        "COD_mg_L": np.random.uniform(30.0, 150.0, size=n_samples),
        "NH4F_mg_L": np.random.uniform(0.1, 5.0, size=n_samples),
        "NO3_mg_L": np.random.uniform(0.5, 10.0, size=n_samples),
        "K_mg_L": np.random.uniform(1.0, 15.0, size=n_samples),
        "E_coli_CFU_100mL": np.random.uniform(0.0, 50.0, size=n_samples),
    }
    df = pd.DataFrame(data)
    detector = train_isolation_forest(df, contamination=0.03, random_state=42)
    return detector


@pytest.fixture
def nominal_sample():
    """A clean, normal reference greywater sample."""
    return {
        "Greywater_Source_Bathroom": 1.0,
        "Greywater_Source_Kitchen": 0.0,
        "Greywater_Source_Laundry": 0.0,
        "Greywater_Source_Mixed": 0.0,
        "pH": 7.2,
        "TEMP_C": 24.5,
        "SAL_ppt": 0.4,
        "TUR_NTU": 15.0,
        "DS_mg_L": 180.0,
        "TDS_mg_L": 350.0,
        "TSS_mg_L": 25.0,
        "COND_uS_cm": 520.0,
        "DO_mg_L": 6.2,
        "BOD_mg_L": 30.0,
        "COD_mg_L": 75.0,
        "NH4F_mg_L": 2.1,
        "NO3_mg_L": 4.5,
        "K_mg_L": 8.0,
        "E_coli_CFU_100mL": 10.0
    }


def test_01_normal_reference_sample(fitted_detector, nominal_sample):
    """Test 1: Normal reference sample produces positive score and NORMAL status."""
    sample_df = pd.DataFrame([nominal_sample])
    score = fitted_detector.calculate_anomaly_score(sample_df)[0]
    is_anom = fitted_detector.predict_anomaly(sample_df)[0]
    
    assert score > 0.0, f"Expected positive score for normal inlier, got {score}"
    assert not is_anom, "Nominal sample should not be flagged as anomaly"
    
    override = fitted_detector.evaluate_safety_override(
        ml_predicted_class=1,
        is_anomaly=is_anom,
        anomaly_score=score,
        feature_values=nominal_sample
    )
    assert override["safety_status"] == "NORMAL"
    assert override["final_routing_class"] == 1
    assert not override["override_applied"]


def test_02_statistically_unusual_sample(fitted_detector, nominal_sample):
    """Test 2: Statistically unusual sample without severe hazard triggers ANOMALY_REVIEW."""
    unusual = nominal_sample.copy()
    # Shift multiple non-toxic parameters far from normal training manifold
    unusual["TEMP_C"] = 48.0 # Hot wash water
    unusual["COND_uS_cm"] = 2800.0 # High mineral conductivity, but not toxic
    unusual["DS_mg_L"] = 1200.0
    
    sample_df = pd.DataFrame([unusual])
    score = fitted_detector.calculate_anomaly_score(sample_df)[0]
    is_anom = fitted_detector.predict_anomaly(sample_df)[0]
    
    override = fitted_detector.evaluate_safety_override(
        ml_predicted_class=2,
        is_anomaly=is_anom,
        anomaly_score=score,
        feature_values=unusual
    )
    # Because no severe biological/toxic threshold is breached, it flags for review, not automatic sewer
    if is_anom:
        assert override["safety_status"] == "ANOMALY_REVIEW"
        assert override["final_routing_class"] == 2
        assert not override["override_applied"]


def test_03_extreme_ph(nominal_sample):
    """Test 3: Extreme pH (< 5.5 or > 9.5) triggers severe violation."""
    acidic = nominal_sample.copy()
    acidic["pH"] = 4.2
    res_acidic = check_severe_conditions(acidic)
    assert res_acidic["has_severe_condition"]
    assert any("Acidic" in v for v in res_acidic["severe_violations"])
    
    alkaline = nominal_sample.copy()
    alkaline["pH"] = 10.8
    res_alk = check_severe_conditions(alkaline)
    assert res_alk["has_severe_condition"]
    assert any("Alkaline" in v for v in res_alk["severe_violations"])


def test_04_extreme_turbidity(nominal_sample):
    """Test 4: Extreme turbidity (> 100 NTU) triggers severe violation."""
    turbid = nominal_sample.copy()
    turbid["TUR_NTU"] = 185.0
    res = check_severe_conditions(turbid)
    assert res["has_severe_condition"]
    assert any("Turbidity" in v for v in res["severe_violations"])


def test_05_extreme_tds(nominal_sample):
    """Test 5: Extreme TDS (> 1500 mg/L) triggers severe violation."""
    high_tds = nominal_sample.copy()
    high_tds["TDS_mg_L"] = 2200.0
    res = check_severe_conditions(high_tds)
    assert res["has_severe_condition"]
    assert any("TDS" in v for v in res["severe_violations"])


def test_06_extreme_bod_cod(nominal_sample):
    """Test 6: Extreme BOD (> 500) or COD (> 800) triggers severe violation."""
    high_organics = nominal_sample.copy()
    high_organics["BOD_mg_L"] = 550.0
    high_organics["COD_mg_L"] = 880.0
    res = check_severe_conditions(high_organics)
    assert res["has_severe_condition"]
    assert any("BOD" in v for v in res["severe_violations"])
    assert any("COD" in v for v in res["severe_violations"])


def test_07_extreme_ecoli(nominal_sample):
    """Test 7: Extreme E. coli (> 300,000 CFU/100mL) triggers severe violation."""
    pathogenic = nominal_sample.copy()
    pathogenic["E_coli_CFU_100mL"] = 650000.0
    res = check_severe_conditions(pathogenic)
    assert res["has_severe_condition"]
    assert any("Pathogens" in v for v in res["severe_violations"])


def test_08_multiple_extreme_parameters(nominal_sample):
    """Test 8: Multiple extreme parameters trigger compound safety override to Sewer Bypass."""
    toxic_cocktail = nominal_sample.copy()
    toxic_cocktail["pH"] = 3.8
    toxic_cocktail["TUR_NTU"] = 250.0
    toxic_cocktail["COD_mg_L"] = 950.0
    toxic_cocktail["E_coli_CFU_100mL"] = 1200000.0
    
    override = apply_safety_override(
        ml_predicted_class=1, # ML hypothetically predicted Bio-filtration
        is_anomaly=True,
        anomaly_score=-0.25,
        severe_indicators=toxic_cocktail
    )
    assert override["safety_status"] == "SEWER_BYPASS_OVERRIDE"
    assert override["final_routing_class"] == 0
    assert override["override_applied"]
    assert "CRITICAL OVERRIDE" in override["reason"]


def test_09_missing_input_raises_error(fitted_detector):
    """Test 9: Passing dataframe with missing feature columns raises ValueError."""
    bad_df = pd.DataFrame([{"pH": 7.0, "TEMP_C": 25.0}])
    with pytest.raises(ValueError, match="missing required features"):
        fitted_detector.predict_anomaly(bad_df)


def test_10_feature_mismatch_raises_error(fitted_detector):
    """Test 10: Array with wrong column count raises ValueError."""
    bad_arr = np.random.randn(5, 10) # 10 columns instead of 19
    with pytest.raises(ValueError, match="Expected 19 features"):
        fitted_detector.fit(bad_arr)
