"""
SHAP TreeExplainer Wrapper and Feature Alignment
AI-Driven Intelligent Greywater Management and Smart Reuse Routing System

Initializes shap.TreeExplainer on the serialized optimized XGBoost model,
validates feature alignment, and handles multiclass SHAP output tensors.

SCIENTIFIC DISCLAIMER:
SHAP values describe how features influence the trained model's mathematical output.
They do NOT establish causality, biological mechanisms, or regulatory water safety.
"""

import sys
import os

# Ensure project root is in sys.path when executed directly
project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if project_root not in sys.path:
    sys.path.insert(0, project_root)

import types
from typing import Dict, Any, List, Optional, Tuple, Union
import numpy as np
import pandas as pd
import joblib

# Windows Application Control compatibility patch for sklearn C-extensions
if 'sklearn.metrics.cluster._expected_mutual_info_fast' not in sys.modules:
    m1 = types.ModuleType('sklearn.metrics.cluster._expected_mutual_info_fast')
    m1.expected_mutual_information = lambda *a, **kw: 0.0
    sys.modules['sklearn.metrics.cluster._expected_mutual_info_fast'] = m1

if 'sklearn.linear_model._sgd_fast' not in sys.modules:
    m2 = types.ModuleType('sklearn.linear_model._sgd_fast')
    class DummyLoss: pass
    m2.EpsilonInsensitive = DummyLoss
    m2.Hinge = DummyLoss
    m2.ModifiedHuber = DummyLoss
    m2.SquaredEpsilonInsensitive = DummyLoss
    m2.SquaredHinge = DummyLoss
    m2._plain_sgd32 = lambda *a, **kw: None
    m2._plain_sgd64 = lambda *a, **kw: None
    sys.modules['sklearn.linear_model._sgd_fast'] = m2

import shap
from anomaly.anomaly_detector import EXPECTED_FEATURES
from routing.decision_schema import CLASS_MAP, NAME_TO_CLASS


class ShapRoutingExplainer:
    """
    Manages TreeExplainer lifecycle, feature formatting, and multiclass SHAP calculations
    for the optimized XGBoost greywater routing classifier.
    """
    def __init__(self, model_path: Optional[str] = None):
        project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
        if model_path is None:
            model_path = os.path.join(project_root, "models", "xgboost_optimized.pkl")

        if not os.path.exists(model_path):
            raise FileNotFoundError(f"Serialized XGBoost model not found at {model_path}")

        self.model = joblib.load(model_path)
        self.feature_names = EXPECTED_FEATURES
        self.class_map = CLASS_MAP
        self.num_classes = len(self.class_map)
        
        # Initialize TreeExplainer
        self.explainer = shap.TreeExplainer(self.model)

    @classmethod
    def load_model(cls, model_path: str):
        """Class method to load an arbitrary XGBoost model."""
        return joblib.load(model_path)

    def create_explainer(self, model=None) -> shap.TreeExplainer:
        """Create or recreate the TreeExplainer for the given or initialized model."""
        if model is not None:
            self.model = model
        self.explainer = shap.TreeExplainer(self.model)
        return self.explainer

    def format_input(self, data: Union[Dict[str, Any], pd.Series, pd.DataFrame]) -> pd.DataFrame:
        """
        Convert arbitrary sample dictionary or DataFrame into the canonical 19-feature vector.
        """
        if isinstance(data, pd.DataFrame):
            df = data.copy()
            # If one-hot columns already exist, ensure columns match feature_names
            if all(col in df.columns for col in self.feature_names):
                return df[self.feature_names]
            # Otherwise convert rows individually
            records = [self.format_input(row.to_dict()).iloc[0] for _, row in df.iterrows()]
            return pd.DataFrame(records)[self.feature_names]

        if hasattr(data, "to_dict"):
            d = data.to_dict()
        elif isinstance(data, dict):
            d = dict(data)
        else:
            raise TypeError(f"Unsupported input type: {type(data)}")

        row = {}
        source = d.get("Greywater_Source") or d.get("greywater_source")

        if source and isinstance(source, str):
            for s in ["Bathroom", "Kitchen", "Laundry", "Mixed"]:
                row[f"Greywater_Source_{s}"] = 1.0 if str(source).lower() == s.lower() else 0.0
        else:
            for s in ["Bathroom", "Kitchen", "Laundry", "Mixed"]:
                col = f"Greywater_Source_{s}"
                row[col] = float(d.get(col, 0.0))

        for feat in self.feature_names:
            if not feat.startswith("Greywater_Source_"):
                if feat not in d:
                    raise ValueError(f"Input missing required water quality feature: {feat}")
                row[feat] = float(d[feat])

        return pd.DataFrame([row])[self.feature_names]

    def explain_sample(self, sample_input: Union[Dict[str, Any], pd.Series, pd.DataFrame]) -> shap.Explanation:
        """
        Compute SHAP explanation for a single sample.
        Returns Explanation object of shape (1, 19, 4).
        """
        feat_df = self.format_input(sample_input)
        exp = self.explainer(feat_df)
        return exp

    def explain_batch(self, batch_data: Union[pd.DataFrame, str]) -> Tuple[shap.Explanation, pd.DataFrame]:
        """
        Compute SHAP explanations for a batch of samples.
        Returns Explanation object of shape (N, 19, 4) and formatted DataFrame.
        """
        if isinstance(batch_data, str):
            df_raw = pd.read_csv(batch_data)
        else:
            df_raw = batch_data

        formatted_df = self.format_input(df_raw)
        exp = self.explainer(formatted_df)
        return exp, formatted_df

    def predict(self, sample_input: Union[Dict[str, Any], pd.Series]) -> Tuple[int, str, float, Dict[str, float]]:
        """
        Generate XGBoost class prediction and probabilities for a sample without modifying SHAP.
        """
        feat_df = self.format_input(sample_input)
        probs = self.model.predict_proba(feat_df)[0]
        pred_class = int(np.argmax(probs))
        confidence = float(np.max(probs))
        class_name = self.class_map[pred_class]
        prob_dict = {self.class_map[i]: float(probs[i]) for i in range(self.num_classes)}
        return pred_class, class_name, round(confidence, 4), prob_dict

    def get_top_features(self, sample_input: Union[Dict[str, Any], pd.Series], k: int = 5, target_class: Optional[int] = None) -> List[Dict[str, Any]]:
        """
        Extract top k feature contributions for a sample. Defaults to the predicted class.
        """
        feat_df = self.format_input(sample_input)
        exp = self.explainer(feat_df)
        if target_class is None:
            probs = self.model.predict_proba(feat_df)[0]
            target_class = int(np.argmax(probs))

        shap_vals = exp.values[0, :, target_class]
        feat_vals = feat_df.iloc[0].values

        records = []
        for i, feat in enumerate(self.feature_names):
            s_val = float(shap_vals[i])
            records.append({
                "feature": feat,
                "value": float(feat_vals[i]),
                "shap_value": round(s_val, 4),
                "direction": "POSITIVE" if s_val >= 0 else "NEGATIVE",
                "abs_shap": abs(s_val)
            })

        # Sort by absolute SHAP value descending
        records.sort(key=lambda x: x["abs_shap"], reverse=True)
        for rank, rec in enumerate(records, start=1):
            rec["importance_rank"] = rank
            del rec["abs_shap"]

        return records[:k]

    def get_global_importance(self, data: Union[pd.DataFrame, str], target_class: Optional[int] = None) -> pd.DataFrame:
        """
        Calculate global feature importance (mean absolute SHAP).
        If target_class is None, averages across all samples and classes.
        """
        exp, _ = self.explain_batch(data)
        vals = exp.values  # (N, num_features, num_classes)
        if target_class is not None:
            mean_abs = np.mean(np.abs(vals[:, :, target_class]), axis=0)
        else:
            # Mean absolute SHAP across all classes and samples
            mean_abs = np.mean(np.abs(vals), axis=(0, 2))

        df_imp = pd.DataFrame({
            "feature": self.feature_names,
            "mean_abs_shap": mean_abs
        }).sort_values("mean_abs_shap", ascending=False).reset_index(drop=True)
        df_imp["rank"] = df_imp.index + 1
        return df_imp

    def generate_explanation(self, sample_input: Union[Dict[str, Any], pd.Series], k: int = 5) -> Dict[str, Any]:
        """
        Generate local explanation schema for an individual prediction.
        """
        feat_df = self.format_input(sample_input)
        pred_class, pred_route, confidence, prob_dict = self.predict(sample_input)
        exp = self.explainer(feat_df)
        
        base_val = float(exp.base_values[0, pred_class]) if hasattr(exp.base_values, "shape") and len(exp.base_values.shape) > 1 else float(exp.base_values[0])
        all_features = self.get_top_features(sample_input, k=len(self.feature_names), target_class=pred_class)

        top_abs = all_features[:k]
        top_pos = [f for f in all_features if f["direction"] == "POSITIVE"][:k]
        top_neg = [f for f in all_features if f["direction"] == "NEGATIVE"][:k]

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


if __name__ == "__main__":
    print("=" * 60)
    print("SHAP TreeExplainer Wrapper - Operational Test")
    print("=" * 60)
    explainer = ShapRoutingExplainer()
    print("SHAP Explainer initialized successfully.")
    print(f"Expected Features: {len(explainer.feature_names)}")
    print("=" * 60)
    print("SHAP Explainer test executed successfully.")


