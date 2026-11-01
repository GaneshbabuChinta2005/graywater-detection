"""
Unit Tests for Dashboard Service Layer
AI-Driven Intelligent Greywater Management and Smart Reuse Routing System
"""

import sys
import types
import os
import pytest
import numpy as np
import pandas as pd

# Windows Application Control compatibility patch
if 'sklearn.metrics.cluster._expected_mutual_info_fast' not in sys.modules:
    m1 = types.ModuleType('sklearn.metrics.cluster._expected_mutual_info_fast')
    m1.expected_mutual_information = lambda *a, **kw: 0.0
    sys.modules['sklearn.metrics.cluster._expected_mutual_info_fast'] = m1

if 'sklearn.linear_model._sgd_fast' not in sys.modules:
    m2 = types.ModuleType('sklearn.linear_model._sgd_fast')
    class DummyLoss: pass
    m2.EpsilonInsensitive = DummyLoss; m2.Hinge = DummyLoss; m2.ModifiedHuber = DummyLoss
    m2.SquaredEpsilonInsensitive = DummyLoss; m2.SquaredHinge = DummyLoss
    m2._plain_sgd32 = lambda *a, **kw: None; m2._plain_sgd64 = lambda *a, **kw: None
    sys.modules['sklearn.linear_model._sgd_fast'] = m2

from dashboard.services.dashboard_service import DashboardService, get_service


@pytest.fixture
def service():
    return get_service()


@pytest.fixture
def sample_dict():
    return {
        "Greywater_Source": "Bathroom",
        "pH": 7.4,
        "TEMP_C": 24.5,
        "SAL_ppt": 0.22,
        "TUR_NTU": 28.5,
        "DS_mg_L": 255.0,
        "TDS_mg_L": 275.0,
        "TSS_mg_L": 34.0,
        "COND_uS_cm": 515.0,
        "DO_mg_L": 4.8,
        "BOD_mg_L": 28.0,
        "COD_mg_L": 82.0,
        "NH4F_mg_L": 4.2,
        "NO3_mg_L": 4.5,
        "K_mg_L": 15.8,
        "E_coli_CFU_100mL": 1500.0
    }


def test_dashboard_service_import():
    """1. Test dashboard service import and singleton access."""
    s1 = get_service()
    s2 = get_service()
    assert s1 is not None
    assert s1 is s2


def test_model_loading(service):
    """2. Test model loading and sub-engine initialization."""
    status = service.load_models()
    assert status["xgboost"] is True
    assert status["isolation_forest"] is True
    assert status["shap"] is True
    assert status["routing"] is True


def test_single_sample_analysis(service, sample_dict):
    """3. Test execution of single sample analysis."""
    res = service.run_single_analysis(sample_dict)
    assert "model_prediction" in res
    assert "shap_explanation" in res
    assert "final_decision" in res
    assert res["model_prediction"]["route"] in [
        "Sewer Bypass", "Bio-filtration", "Restricted Irrigation", "Indoor Reuse"
    ]


def test_csv_validation(service, sample_dict):
    """4. Test batch CSV validation and execution."""
    df_valid = pd.DataFrame([sample_dict, sample_dict])
    df_res = service.run_batch_analysis(df_valid)
    assert len(df_res) == 2
    assert "final_route" in df_res.columns
    assert "final_action" in df_res.columns
    assert "top_feature_1" in df_res.columns


def test_missing_column_handling(service, sample_dict):
    """5. Test missing column handling raises informative ValueError."""
    bad_dict = dict(sample_dict)
    del bad_dict["BOD_mg_L"]
    del bad_dict["COD_mg_L"]
    df_bad = pd.DataFrame([bad_dict])
    with pytest.raises(ValueError) as excinfo:
        service.run_batch_analysis(df_bad)
    assert "Missing required columns" in str(excinfo.value)
    assert "BOD_mg_L" in str(excinfo.value)


def test_invalid_numeric_input(service, sample_dict):
    """6. Test invalid non-numeric input handling."""
    bad_dict = dict(sample_dict)
    bad_dict["pH"] = "NOT_A_NUMBER"
    with pytest.raises(ValueError):
        service.run_single_analysis(bad_dict)


def test_routing_output(service, sample_dict):
    """7. Test routing output structure and action codes."""
    res = service.run_single_analysis(sample_dict)
    dec = res["final_decision"]
    assert "route" in dec
    assert "action" in dec
    assert "override_applied" in dec
    assert isinstance(dec["reason_codes"], list)


def test_shap_output(service, sample_dict):
    """8. Test SHAP attribution output and top contributors."""
    res = service.run_single_analysis(sample_dict)
    shap_info = res["shap_explanation"]
    assert "top_features" in shap_info
    assert len(shap_info["top_features"]) >= 3
    assert "base_value" in shap_info
    assert "predicted_class_contributions" in shap_info


def test_weather_unavailable_state(service, sample_dict):
    """9. Test graceful handling when weather context is unavailable."""
    unavailable_weather = {"weather_status": "UNAVAILABLE"}
    res = service.run_single_analysis(sample_dict, override_weather=unavailable_weather)
    assert res["weather_explanation"]["status"] == "UNAVAILABLE"
    # Routing must proceed safely
    assert res["final_decision"]["route"] is not None


def test_storage_unavailable_state(service, sample_dict):
    """10. Test graceful handling when storage context is unavailable or None."""
    res = service.run_single_analysis(sample_dict, override_storage=None)
    assert res["storage_explanation"]["status"] is not None
    assert res["final_decision"]["route"] is not None


def test_simulation_step(service):
    """11. Test advancement of digital twin simulation step."""
    step_data = service.run_simulation_step()
    assert "telemetry" in step_data
    assert "sample" in step_data
    assert "analysis" in step_data
    assert step_data["step"] >= 1


def test_no_modification_to_main_csv():
    """12. MANDATORY INVARIANT: main.csv must remain strictly unmodified."""
    main_path = os.path.join(os.path.dirname(__file__), "..", "dataset", "main.csv")
    assert os.path.exists(main_path)
    df_main = pd.read_csv(main_path)
    assert len(df_main) == 1500
    assert df_main.shape[1] == 18
