"""
Unit Tests for Local SHAP Explainer and Visualizations
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

from explainability.local_explainer import LocalShapExplainer
from explainability.shap_explainer import ShapRoutingExplainer


@pytest.fixture
def local_explainer():
    return LocalShapExplainer()


@pytest.fixture
def clean_sample():
    # Bathroom greywater suitable for irrigation / reuse
    return {
        "Greywater_Source": "Bathroom",
        "pH": 7.5,
        "TEMP_C": 23.0,
        "SAL_ppt": 0.15,
        "TUR_NTU": 15.0,
        "DS_mg_L": 220.0,
        "TDS_mg_L": 240.0,
        "TSS_mg_L": 25.0,
        "COND_uS_cm": 480.0,
        "DO_mg_L": 5.5,
        "BOD_mg_L": 20.0,
        "COD_mg_L": 65.0,
        "NH4F_mg_L": 3.0,
        "NO3_mg_L": 5.0,
        "K_mg_L": 14.0,
        "E_coli_CFU_100mL": 800.0
    }


@pytest.fixture
def contaminated_sample():
    # Laundry/Kitchen greywater requiring sewer bypass
    return {
        "Greywater_Source": "Laundry",
        "pH": 6.2,
        "TEMP_C": 31.0,
        "SAL_ppt": 0.45,
        "TUR_NTU": 125.0,
        "DS_mg_L": 320.0,
        "TDS_mg_L": 350.0,
        "TSS_mg_L": 210.0,
        "COND_uS_cm": 610.0,
        "DO_mg_L": 0.4,
        "BOD_mg_L": 220.0,
        "COD_mg_L": 820.0,
        "NH4F_mg_L": 15.0,
        "NO3_mg_L": 0.5,
        "K_mg_L": 24.0,
        "E_coli_CFU_100mL": 180000.0
    }


def test_explain_instance_schema(local_explainer, clean_sample):
    """Verify local explanation schema matches Phase 12 specification."""
    res = local_explainer.explain_instance(clean_sample)
    
    assert "predicted_class" in res
    assert "predicted_route" in res
    assert "prediction_confidence" in res
    assert "base_value" in res
    assert "top_positive_features" in res
    assert "top_negative_features" in res
    assert "top_absolute_contributors" in res
    assert "explanation_text" in res
    
    # Check contributor structure
    for feat in res["top_absolute_contributors"]:
        assert "feature" in feat
        assert "value" in feat
        assert "shap_value" in feat
        assert "direction" in feat
        assert "importance_rank" in feat
        assert feat["direction"] in ["POSITIVE", "NEGATIVE"]


def test_directional_terminology(local_explainer, clean_sample):
    """Verify positive vs negative direction terminology adheres to scientific guidelines."""
    res = local_explainer.explain_instance(clean_sample)
    for pos_f in res["top_positive_features"]:
        assert pos_f["shap_value"] >= 0
        assert pos_f["direction"] == "POSITIVE"
    for neg_f in res["top_negative_features"]:
        assert neg_f["shap_value"] < 0
        assert neg_f["direction"] == "NEGATIVE"


def test_explanation_narrative_text(local_explainer, contaminated_sample):
    """Verify that generated narrative text clearly states model prediction, confidence, and contributors."""
    res = local_explainer.explain_instance(contaminated_sample)
    text = res["explanation_text"]
    assert "XGBoost predicted" in text
    assert "confidence" in text
    assert "The strongest model contributors were" in text


def test_waterfall_plot_generation(local_explainer, clean_sample, tmp_path):
    """Verify waterfall plot creates a valid, non-empty image file."""
    plot_file = os.path.join(tmp_path, "waterfall_test.png")
    out_path = local_explainer.generate_waterfall_plot(clean_sample, plot_file)
    assert os.path.exists(out_path)
    assert os.path.getsize(out_path) > 1000


def test_bar_plot_generation(local_explainer, clean_sample, tmp_path):
    """Verify local bar plot creates a valid, non-empty image file."""
    plot_file = os.path.join(tmp_path, "bar_test.png")
    out_path = local_explainer.generate_bar_plot(clean_sample, plot_file)
    assert os.path.exists(out_path)
    assert os.path.getsize(out_path) > 1000


def test_multiple_classes_handling(local_explainer, clean_sample, contaminated_sample):
    """Verify that explain_instance produces valid explanations across different classes."""
    res_clean = local_explainer.explain_instance(clean_sample)
    res_contam = local_explainer.explain_instance(contaminated_sample)
    
    assert res_contam["predicted_route"] == "Sewer Bypass"
    assert res_clean["predicted_route"] in ["Restricted Irrigation", "Indoor Reuse", "Bio-filtration"]
