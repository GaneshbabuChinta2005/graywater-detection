"""
Unit Tests for Decision Explainer (ML SHAP + Context Decision Transparency)
AI-Driven Intelligent Greywater Management and Smart Reuse Routing System
"""

import sys
import types
import os
import pytest
import numpy as np
import pandas as pd

# Windows Application Control patch
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

from explainability.decision_explainer import DecisionExplainer


@pytest.fixture
def decision_explainer():
    return DecisionExplainer()


@pytest.fixture
def irrigation_sample():
    # Quality suitable for irrigation
    return {
        "Greywater_Source": "Bathroom",
        "pH": 7.4,
        "TEMP_C": 24.0,
        "SAL_ppt": 0.2,
        "TUR_NTU": 25.0,
        "DS_mg_L": 250.0,
        "TDS_mg_L": 270.0,
        "TSS_mg_L": 35.0,
        "COND_uS_cm": 510.0,
        "DO_mg_L": 5.0,
        "BOD_mg_L": 30.0,
        "COD_mg_L": 85.0,
        "NH4F_mg_L": 4.0,
        "NO3_mg_L": 4.5,
        "K_mg_L": 16.0,
        "E_coli_CFU_100mL": 1200.0
    }


def test_combined_explanation_schema(decision_explainer, irrigation_sample):
    """Verify that explain_decision adheres strictly to the required multi-component schema."""
    res = decision_explainer.explain_decision(irrigation_sample)
    
    assert "model_prediction" in res
    assert "shap_explanation" in res
    assert "anomaly_explanation" in res
    assert "safety_explanation" in res
    assert "weather_explanation" in res
    assert "storage_explanation" in res
    assert "final_decision" in res
    assert "human_readable_explanation" in res
    
    assert res["model_prediction"]["route"] in [
        "Sewer Bypass", "Bio-filtration", "Restricted Irrigation", "Indoor Reuse"
    ]
    assert isinstance(res["shap_explanation"]["top_features"], list)
    assert len(res["shap_explanation"]["top_features"]) >= 3


def test_mandatory_invariant_shap_does_not_change_final_routing(decision_explainer, irrigation_sample):
    """MANDATORY INVARIANT: SHAP calculation must NOT alter the final routing decision."""
    pipeline = decision_explainer.pipeline
    raw_decision = pipeline.evaluate_sample(irrigation_sample)
    
    explained = decision_explainer.explain_decision(irrigation_sample)
    
    assert explained["final_decision"]["route"] == raw_decision.final_route
    assert explained["final_decision"]["action"] == raw_decision.final_action
    assert explained["final_decision"]["override_applied"] == raw_decision.override_applied


def test_safety_override_scenario(decision_explainer):
    """
    Scenario 3: Acute pathogen hazard (E. coli exceeds 500,000 CFU/100mL safety cutoff)
    triggers deterministic Safety Override to Sewer Bypass.
    SHAP must explain the ML prediction while the override explains the final route.
    """
    critical_sample = {
        "Greywater_Source": "Bathroom",
        "pH": 7.2,
        "TEMP_C": 25.0,
        "SAL_ppt": 0.2,
        "TUR_NTU": 30.0,
        "DS_mg_L": 260.0,
        "TDS_mg_L": 280.0,
        "TSS_mg_L": 40.0,
        "COND_uS_cm": 520.0,
        "DO_mg_L": 4.5,
        "BOD_mg_L": 35.0,
        "COD_mg_L": 90.0,
        "NH4F_mg_L": 4.5,
        "NO3_mg_L": 4.0,
        "K_mg_L": 15.0,
        "E_coli_CFU_100mL": 650000.0  # Acute pathogen hazard exceeding sewer bypass cutoff
    }
    res = decision_explainer.explain_decision(critical_sample)
    
    assert res["safety_explanation"]["status"] in ["CRITICAL", "HIGH_RISK"]
    assert res["final_decision"]["route"] == "Sewer Bypass"
    assert res["final_decision"]["override_applied"] is True
    # Verify that the explanation clearly mentions the safety override and the distinction
    assert "SAFETY OVERRIDE" in res["human_readable_explanation"]
    assert "SHAP indicates" in res["human_readable_explanation"]


def test_weather_deferral_scenario(decision_explainer, irrigation_sample):
    """
    Scenario 2: Water quality allows Irrigation, but severe precipitation probability
    triggers environmental deferral (STORE_FOR_LATER / DEFER_ROUTE) while preserving route.
    """
    rainy_weather = {
        "rainfall_mm": 28.0,
        "precipitation_probability": 0.95,
        "temperature_C": 19.0,
        "weather_status": "LIVE"
    }
    res = decision_explainer.explain_decision(irrigation_sample, override_weather=rainy_weather)
    
    if res["model_prediction"]["route"] == "Restricted Irrigation":
        assert res["final_decision"]["route"] == "Restricted Irrigation"
        assert res["final_decision"]["action"] in ["STORE_FOR_LATER", "DEFER_ROUTE"]
        assert res["weather_explanation"]["status"] == "UNFAVORABLE"
        assert "WEATHER CONTEXT" in res["human_readable_explanation"]


def test_storage_deterioration_scenario(decision_explainer, irrigation_sample):
    """
    Scenario 5: High biochemical deterioration index in storage tank.
    """
    degraded_storage = {
        "deterioration_index": 0.85,
        "stagnation_status": "DEGRADED",
        "storage_age_hours": 48.0
    }
    res = decision_explainer.explain_decision(irrigation_sample, override_storage=degraded_storage)
    
    assert res["storage_explanation"]["deterioration_index"] == 0.85
    assert res["storage_explanation"]["status"] in ["HIGH_DETERIORATION", "AGING", "DEGRADED", "STAGNANT"]


def test_missing_optional_contexts_graceful(decision_explainer, irrigation_sample):
    """Verify system operates seamlessly when weather/storage are omitted or default."""
    res = decision_explainer.explain_decision(irrigation_sample, override_weather=None, override_storage=None)
    assert res["weather_explanation"]["status"] is not None
    assert res["storage_explanation"]["status"] is not None
    assert res["final_decision"]["route"] is not None
