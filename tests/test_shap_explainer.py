"""
Unit Tests for SHAP TreeExplainer Wrapper and Feature Alignment
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

from explainability.shap_explainer import ShapRoutingExplainer
from anomaly.anomaly_detector import EXPECTED_FEATURES
from routing.decision_schema import CLASS_MAP


@pytest.fixture
def explainer():
    return ShapRoutingExplainer()


@pytest.fixture
def sample_dict():
    return {
        "Greywater_Source": "Bathroom",
        "pH": 7.4,
        "TEMP_C": 24.5,
        "SAL_ppt": 0.25,
        "TUR_NTU": 35.0,
        "DS_mg_L": 280.0,
        "TDS_mg_L": 310.0,
        "TSS_mg_L": 45.0,
        "COND_uS_cm": 520.0,
        "DO_mg_L": 4.8,
        "BOD_mg_L": 42.0,
        "COD_mg_L": 120.0,
        "NH4F_mg_L": 5.2,
        "NO3_mg_L": 3.8,
        "K_mg_L": 18.5,
        "E_coli_CFU_100mL": 1500.0
    }


def test_model_loading_and_features(explainer):
    """Test model loads properly with exact 19 feature names and 4 classes."""
    assert explainer.model is not None
    assert explainer.explainer is not None
    assert len(explainer.feature_names) == 19
    assert explainer.feature_names == EXPECTED_FEATURES
    assert explainer.num_classes == 4
    assert explainer.class_map == CLASS_MAP


def test_format_input_alignment(explainer, sample_dict):
    """Test feature formatting transforms arbitrary inputs into exact 19 features."""
    df_formatted = explainer.format_input(sample_dict)
    assert df_formatted.shape == (1, 19)
    assert list(df_formatted.columns) == explainer.feature_names
    assert df_formatted["Greywater_Source_Bathroom"].iloc[0] == 1.0
    assert df_formatted["Greywater_Source_Kitchen"].iloc[0] == 0.0
    assert df_formatted["TSS_mg_L"].iloc[0] == 45.0


def test_single_sample_explanation_shape(explainer, sample_dict):
    """Test single sample explanation generates multiclass tensor of shape (1, 19, 4)."""
    exp = explainer.explain_sample(sample_dict)
    assert exp.values.shape == (1, 19, 4)
    # Check base values shape: either (1, 4) or scalar
    assert exp.base_values.shape in [(1, 4), (4,)]


def test_batch_explanation_shape(explainer):
    """Test batch explanation on test.csv produces (N, 19, 4) tensor."""
    test_path = os.path.join(os.path.dirname(__file__), "..", "dataset", "processed", "test.csv")
    exp, df_formatted = explainer.explain_batch(test_path)
    assert exp.values.shape == (225, 19, 4)
    assert df_formatted.shape == (225, 19)


def test_shap_does_not_change_prediction(explainer, sample_dict):
    """MANDATORY INVARIANT: SHAP calculation must NOT alter the underlying model's predictions."""
    pred1, route1, conf1, probs1 = explainer.predict(sample_dict)
    # Perform SHAP calculation
    _ = explainer.explain_sample(sample_dict)
    pred2, route2, conf2, probs2 = explainer.predict(sample_dict)
    
    assert pred1 == pred2
    assert route1 == route2
    assert conf1 == conf2
    assert probs1 == probs2


def test_shap_does_not_retrain_model(explainer):
    """MANDATORY INVARIANT: Model parameters must remain frozen; no retraining occurs."""
    booster_before = explainer.model.get_booster()
    trees_before = booster_before.num_boosted_rounds()
    
    sample = {"Greywater_Source": "Laundry", "pH": 6.8, "TEMP_C": 26.0, "SAL_ppt": 0.4,
              "TUR_NTU": 110.0, "DS_mg_L": 300.0, "TDS_mg_L": 320.0, "TSS_mg_L": 180.0,
              "COND_uS_cm": 580.0, "DO_mg_L": 0.8, "BOD_mg_L": 190.0, "COD_mg_L": 650.0,
              "NH4F_mg_L": 12.0, "NO3_mg_L": 0.9, "K_mg_L": 22.0, "E_coli_CFU_100mL": 120000.0}
    _ = explainer.explain_sample(sample)
    
    booster_after = explainer.model.get_booster()
    trees_after = booster_after.num_boosted_rounds()
    assert trees_before == trees_after


def test_top_features_extraction(explainer, sample_dict):
    """Test extraction of top k features sorted by absolute SHAP magnitude."""
    top5 = explainer.get_top_features(sample_dict, k=5)
    assert len(top5) == 5
    for rank, feat_info in enumerate(top5, start=1):
        assert feat_info["importance_rank"] == rank
        assert feat_info["direction"] in ["POSITIVE", "NEGATIVE"]
        assert "feature" in feat_info
        assert "value" in feat_info
        assert "shap_value" in feat_info


def test_global_importance(explainer):
    """Test global importance calculation (mean absolute SHAP)."""
    test_path = os.path.join(os.path.dirname(__file__), "..", "dataset", "processed", "test.csv")
    df_global = explainer.get_global_importance(test_path)
    assert len(df_global) == 19
    assert list(df_global.columns) == ["feature", "mean_abs_shap", "rank"]
    assert df_global["mean_abs_shap"].is_monotonic_decreasing
    assert (df_global["mean_abs_shap"] >= 0).all()
