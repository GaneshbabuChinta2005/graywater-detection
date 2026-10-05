"""
Digital Twin Model Inference Adapter
AI-Driven Intelligent Greywater Management and Smart Reuse Routing System

Connects synthetic telemetry observations from the Digital Twin to the serialized
Isolation Forest anomaly detector and Optimized XGBoost routing classifier without
retraining either model.
"""

import os
import sys

# Ensure project root is in sys.path when executed directly
project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if project_root not in sys.path:
    sys.path.insert(0, project_root)

import types
import joblib
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
    m2.EpsilonInsensitive = DummyLoss
    m2.Hinge = DummyLoss
    m2.ModifiedHuber = DummyLoss
    m2.SquaredEpsilonInsensitive = DummyLoss
    m2.SquaredHinge = DummyLoss
    m2._plain_sgd32 = lambda *a, **kw: None
    m2._plain_sgd64 = lambda *a, **kw: None
    sys.modules['sklearn.linear_model._sgd_fast'] = m2

from anomaly.anomaly_detector import (
    GreywaterAnomalyDetector,
    apply_safety_override,
    EXPECTED_FEATURES
)

CLASS_NAMES = {
    0: "Sewer Bypass",
    1: "Bio-filtration",
    2: "Restricted Irrigation",
    3: "Indoor Reuse"
}


class ModelInferenceAdapter:
    """
    Inference adapter providing seamless input translation and dual-model execution.
    """
    def __init__(self, xgb_model_path=None, iso_model_path=None):
        project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
        
        if xgb_model_path is None:
            xgb_model_path = os.path.join(project_root, "models", "xgboost_optimized.pkl")
        if iso_model_path is None:
            iso_model_path = os.path.join(project_root, "models", "isolation_forest.pkl")
            
        if not os.path.exists(xgb_model_path):
            raise FileNotFoundError(f"Missing XGBoost model at {xgb_model_path}")
        if not os.path.exists(iso_model_path):
            raise FileNotFoundError(f"Missing Isolation Forest model at {iso_model_path}")
            
        self.xgb_model = joblib.load(xgb_model_path)
        self.iso_model = joblib.load(iso_model_path)
        self.expected_features = EXPECTED_FEATURES

    def format_telemetry_features(self, telemetry_record):
        """
        Convert a DigitalTwinState or dict into a single-row DataFrame matching the 19 features.
        
        Parameters
        ----------
        telemetry_record : dict, pd.Series, or DigitalTwinState
        
        Returns
        -------
        pd.DataFrame
            Single-row DataFrame with columns matching self.expected_features exactly.
        """
        if hasattr(telemetry_record, "to_dict"):
            t_dict = telemetry_record.to_dict()
        elif isinstance(telemetry_record, pd.Series):
            t_dict = telemetry_record.to_dict()
        elif isinstance(telemetry_record, dict):
            t_dict = telemetry_record
        else:
            raise TypeError("Unsupported telemetry record type.")
            
        source = t_dict.get("greywater_source") or t_dict.get("Greywater_Source")
        if not source:
            raise ValueError("Telemetry record missing 'greywater_source' field.")
            
        row = {}
        # One-hot encoding for the 4 sources
        for s in ["Bathroom", "Kitchen", "Laundry", "Mixed"]:
            row[f"Greywater_Source_{s}"] = 1 if source.lower() == s.lower() else 0
            
        # Numerical water-quality parameters
        for feat in self.expected_features:
            if not feat.startswith("Greywater_Source_"):
                if feat not in t_dict:
                    raise ValueError(f"Telemetry record missing required parameter: {feat}")
                row[feat] = float(t_dict[feat])
                
        # Construct DataFrame ensuring strict column ordering
        feat_df = pd.DataFrame([row])[self.expected_features]
        return feat_df

    def predict(self, telemetry_record):
        """
        Execute full inference pipeline:
        1. Feature alignment
        2. Isolation Forest anomaly screening
        3. XGBoost routing prediction
        4. Safety override arbitration
        
        Returns
        -------
        dict
            Comprehensive decision dictionary containing ML routing, anomaly scores,
            and final safety-arbitrated destination.
        """
        features_df = self.format_telemetry_features(telemetry_record)
        
        # 1. Isolation Forest Anomaly Screening
        is_anom = bool(self.iso_model.predict_anomaly(features_df)[0])
        anom_score = float(self.iso_model.calculate_anomaly_score(features_df)[0])
        
        # 2. XGBoost Routing Prediction
        probs = self.xgb_model.predict_proba(features_df)[0]
        ml_pred_class = int(np.argmax(probs))
        confidence = float(np.max(probs))
        
        # 3. Safety Override Arbitration
        if hasattr(telemetry_record, "to_dict"):
            raw_dict = telemetry_record.to_dict()
        elif isinstance(telemetry_record, pd.Series):
            raw_dict = telemetry_record.to_dict()
        else:
            raw_dict = telemetry_record
            
        override = apply_safety_override(
            ml_predicted_class=ml_pred_class,
            is_anomaly=is_anom,
            anomaly_score=anom_score,
            severe_indicators=raw_dict
        )
        
        return {
            "is_anomaly": is_anom,
            "anomaly_score": round(anom_score, 4),
            "ml_predicted_class": ml_pred_class,
            "ml_predicted_name": CLASS_NAMES[ml_pred_class],
            "prediction_confidence": round(confidence, 4),
            "class_probabilities": {
                CLASS_NAMES[i]: round(float(probs[i]), 4) for i in range(4)
            },
            "safety_status": override["safety_status"],
            "final_routing_class": override["final_routing_class"],
            "final_routing_name": CLASS_NAMES[override["final_routing_class"]],
            "override_applied": override["override_applied"],
            "safety_reason": override["reason"]
        }


def predict_telemetry(telemetry_record):
    """Convenience helper to run inference on a single record."""
    adapter = ModelInferenceAdapter()
    return adapter.predict(telemetry_record)


if __name__ == "__main__":
    print("=" * 60)
    print("Digital Twin Model Inference Adapter - Operational Test")
    print("=" * 60)
    test_adapter = ModelInferenceAdapter()
    from simulation.digital_twin import DigitalTwinEngine
    engine = DigitalTwinEngine(random_seed=42)
    state = engine.create_initial_state(initial_source="Kitchen")
    pred = test_adapter.predict(state)
    print("Inference Output:")
    print(f"  Source          : {state.greywater_source}")
    print(f"  Anomaly Flag    : {pred['is_anomaly']} (score: {pred['anomaly_score']:.4f})")
    print(f"  ML Class        : {pred['ml_predicted_name']} ({pred['prediction_confidence']*100:.1f}% confidence)")
    print(f"  Safety Status   : {pred['safety_status']}")
    print(f"  Final Decision  : {pred['final_routing_name']}")
    print("=" * 60)
    print("Model Inference Adapter test executed successfully.")

