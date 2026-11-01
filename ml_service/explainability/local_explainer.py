"""
Local SHAP Explainer and Instance Visualization
AI-Driven Intelligent Greywater Management and Smart Reuse Routing System

Generates sample-level SHAP explanations, top positive/negative feature breakdowns,
and local visual explanations (waterfall plots and local horizontal bar charts).

SCIENTIFIC DISCLAIMER:
SHAP values describe how features influence the trained model's mathematical output.
They should NOT be interpreted as causal effects, biological mechanisms, or regulatory safety criteria.
"""

import sys
import types
import os
from typing import Dict, Any, List, Optional, Tuple, Union
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

import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import shap

from explainability.shap_explainer import ShapRoutingExplainer


class LocalShapExplainer:
    """
    Produces instance-level SHAP attributions, direction breakdowns,
    and individual explanation artifacts for single greywater samples.
    """
    def __init__(self, explainer: Optional[ShapRoutingExplainer] = None):
        self.explainer = explainer or ShapRoutingExplainer()
        self.feature_names = self.explainer.feature_names
        self.class_map = self.explainer.class_map
        self.num_classes = self.explainer.num_classes

    def explain_instance(
        self,
        sample_input: Union[Dict[str, Any], pd.Series, pd.DataFrame],
        k: int = 5,
        target_class: Optional[int] = None
    ) -> Dict[str, Any]:
        """
        Generate detailed feature attributions conforming to Phase 12 schema.
        """
        feat_df = self.explainer.format_input(sample_input)
        pred_class, pred_route, confidence, prob_dict = self.explainer.predict(sample_input)
        
        # Default to predicted class if target_class is not specified
        c_eval = pred_class if target_class is None else target_class
        c_eval_name = self.class_map[c_eval]

        exp = self.explainer.explainer(feat_df)
        
        # Base value extraction
        if hasattr(exp.base_values, "shape") and len(exp.base_values.shape) > 1:
            base_val = float(exp.base_values[0, c_eval])
        else:
            base_val = float(exp.base_values[0])

        shap_vals = exp.values[0, :, c_eval]
        feat_vals = feat_df.iloc[0].values

        all_records = []
        for i, feat in enumerate(self.feature_names):
            s_val = float(shap_vals[i])
            all_records.append({
                "feature": feat,
                "value": float(feat_vals[i]),
                "shap_value": round(s_val, 4),
                "direction": "POSITIVE" if s_val >= 0 else "NEGATIVE",
                "abs_shap": abs(s_val)
            })

        # Rank by absolute magnitude
        all_records.sort(key=lambda x: x["abs_shap"], reverse=True)
        for rank, rec in enumerate(all_records, start=1):
            rec["importance_rank"] = rank
            del rec["abs_shap"]

        top_abs = all_records[:k]
        top_pos = [f for f in all_records if f["direction"] == "POSITIVE"][:k]
        top_neg = [f for f in all_records if f["direction"] == "NEGATIVE"][:k]

        top_names = [f["feature"] for f in top_abs]
        pos_names = [f["feature"] for f in top_pos[:2]]
        neg_names = [f["feature"] for f in top_neg[:2]]

        narrative_parts = [
            f"XGBoost predicted {pred_route} with {confidence*100:.1f}% confidence.",
            f"The strongest model contributors were {', '.join(top_names[:5])}."
        ]
        if pos_names:
            narrative_parts.append(f"{' and '.join(pos_names)} contributed positively toward the model's {pred_route} output.")
        if neg_names:
            narrative_parts.append(f"{' and '.join(neg_names)} contributed negatively, pushing model output away from {pred_route}.")

        return {
            "predicted_class": pred_class,
            "predicted_route": pred_route,
            "prediction_confidence": confidence,
            "base_value": round(base_val, 4),
            "top_positive_features": top_pos,
            "top_negative_features": top_neg,
            "top_absolute_contributors": top_abs,
            "explanation_text": " ".join(narrative_parts)
        }

    def generate_waterfall_plot(
        self,
        sample_input: Union[Dict[str, Any], pd.Series, pd.DataFrame],
        save_path: str,
        target_class: Optional[int] = None,
        max_display: int = 10
    ) -> str:
        """
        Generate and save a SHAP waterfall plot for an individual sample.
        """
        feat_df = self.explainer.format_input(sample_input)
        pred_class, pred_route, confidence, _ = self.explainer.predict(sample_input)
        c_eval = pred_class if target_class is None else target_class
        c_name = self.class_map[c_eval]

        exp = self.explainer.explainer(feat_df)
        # Sliced Explanation for class c_eval
        single_exp = exp[0, :, c_eval]

        os.makedirs(os.path.dirname(os.path.abspath(save_path)), exist_ok=True)
        plt.figure(figsize=(9, 6), dpi=150)
        shap.plots.waterfall(single_exp, max_display=max_display, show=False)
        plt.title(f"SHAP Waterfall — {c_name} (Pred: {pred_route}, Conf: {confidence*100:.1f}%)", fontsize=11, pad=12)
        plt.tight_layout()
        plt.savefig(save_path, dpi=150, bbox_inches="tight")
        plt.close()
        return save_path

    def generate_bar_plot(
        self,
        sample_input: Union[Dict[str, Any], pd.Series, pd.DataFrame],
        save_path: str,
        target_class: Optional[int] = None,
        max_display: int = 10
    ) -> str:
        """
        Generate and save a horizontal bar chart of local SHAP contributions.
        """
        explanation = self.explain_instance(sample_input, k=max_display, target_class=target_class)
        top_features = explanation["top_absolute_contributors"]
        c_eval = explanation["predicted_class"] if target_class is None else target_class
        c_name = self.class_map[c_eval]

        # Order ascending for horizontal bar chart
        top_features_sorted = sorted(top_features, key=lambda x: x["shap_value"])
        features = [f["feature"] for f in top_features_sorted]
        values = [f["shap_value"] for f in top_features_sorted]
        colors = ["#d9534f" if v < 0 else "#2ca02c" for v in values]

        os.makedirs(os.path.dirname(os.path.abspath(save_path)), exist_ok=True)
        fig, ax = plt.subplots(figsize=(9, 6), dpi=150)
        ax.barh(features, values, color=colors, edgecolor="black", alpha=0.85)
        ax.axvline(0, color="grey", linestyle="--", linewidth=1.0)
        ax.set_title(f"Local SHAP Contributions — {c_name} (Pred: {explanation['predicted_route']})", fontsize=11, pad=12)
        ax.set_xlabel("SHAP Value (Contribution toward Output Space)")
        ax.grid(axis="x", linestyle=":", alpha=0.6)
        plt.tight_layout()
        plt.savefig(save_path, dpi=150, bbox_inches="tight")
        plt.close()
        return save_path
