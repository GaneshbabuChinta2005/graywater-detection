"""
End-to-End Context-Aware Routing Inference Pipeline
AI-Driven Intelligent Greywater Management and Smart Reuse Routing System

Executes automated end-to-end evaluation connecting feature formatting,
serialized XGBoost and Isolation Forest models, safety screening, weather context,
storage deterioration monitoring, and central routing decision synthesis.
"""

import os
import sys
import types
from typing import Dict, Any, List, Optional, Union
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

from anomaly.anomaly_detector import EXPECTED_FEATURES
from routing.decision_schema import (
    RoutingInput,
    FinalDecisionOutput,
    CLASS_MAP
)
from routing.routing_engine import SmartRoutingEngine
import context
import storage


class ContextAwareRoutingPipeline:
    """
    Unified inference pipeline orchestrating machine learning, anomaly detection,
    safety checks, weather context, and storage state tracking.
    """
    def __init__(
        self,
        xgb_model_path: Optional[str] = None,
        iso_model_path: Optional[str] = None,
        routing_engine: Optional[SmartRoutingEngine] = None,
        weather_provider: Optional[context.ModularWeatherProvider] = None,
        storage_monitor: Optional[storage.StorageMonitor] = None
    ):
        project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
        
        if xgb_model_path is None:
            xgb_model_path = os.path.join(project_root, "models", "xgboost_optimized.pkl")
        if iso_model_path is None:
            iso_model_path = os.path.join(project_root, "models", "isolation_forest.pkl")

        if not os.path.exists(xgb_model_path):
            raise FileNotFoundError(f"XGBoost model missing: {xgb_model_path}")
        if not os.path.exists(iso_model_path):
            raise FileNotFoundError(f"Isolation Forest model missing: {iso_model_path}")

        self.xgb_model = joblib.load(xgb_model_path)
        self.iso_model = joblib.load(iso_model_path)
        self.expected_features = EXPECTED_FEATURES

        self.routing_engine = routing_engine if routing_engine is not None else SmartRoutingEngine()
        self.weather_provider = weather_provider if weather_provider is not None else context.ModularWeatherProvider(offline_mode=True)
        self.storage_monitor = storage_monitor if storage_monitor is not None else storage.StorageMonitor()

    def format_features(self, record: Union[Dict[str, Any], pd.Series]) -> pd.DataFrame:
        """Construct canonical 19-feature vector matching training schema."""
        if hasattr(record, "to_dict"):
            r_dict = record.to_dict()
        elif isinstance(record, dict):
            r_dict = record
        else:
            raise TypeError(f"Unsupported record format: {type(record)}")

        source = r_dict.get("Greywater_Source") or r_dict.get("greywater_source")
        
        row = {}
        # If source string is provided
        if source and isinstance(source, str):
            for s in ["Bathroom", "Kitchen", "Laundry", "Mixed"]:
                row[f"Greywater_Source_{s}"] = 1 if str(source).lower() == s.lower() else 0
        else:
            # Check if one-hot columns are already in input
            for s in ["Bathroom", "Kitchen", "Laundry", "Mixed"]:
                col = f"Greywater_Source_{s}"
                if col in r_dict:
                    row[col] = float(r_dict[col])
                else:
                    row[col] = 0.0

        for feat in self.expected_features:
            if not feat.startswith("Greywater_Source_"):
                if feat not in r_dict:
                    raise ValueError(f"Input missing required water quality feature: {feat}")
                row[feat] = float(r_dict[feat])

        return pd.DataFrame([row])[self.expected_features]

    def evaluate_sample(
        self,
        sample: Union[Dict[str, Any], pd.Series],
        override_weather: Optional[Dict[str, Any]] = None,
        override_storage: Optional[Dict[str, Any]] = None
    ) -> FinalDecisionOutput:
        """Evaluate a single greywater sample or telemetry reading."""
        if hasattr(sample, "to_dict"):
            s_dict = sample.to_dict()
        elif isinstance(sample, dict):
            s_dict = dict(sample)
        else:
            raise TypeError("Sample must be dict or pandas Series.")

        # 1. Format features and run ML models
        feat_df = self.format_features(s_dict)
        
        # XGBoost prediction
        probs = self.xgb_model.predict_proba(feat_df)[0]
        pred_class = int(np.argmax(probs))
        confidence = float(np.max(probs))
        prob_dict = {CLASS_MAP[i]: float(probs[i]) for i in range(4)}

        # Isolation Forest prediction
        is_anom = bool(self.iso_model.predict_anomaly(feat_df)[0])
        anom_score = float(self.iso_model.calculate_anomaly_score(feat_df)[0])

        # 2. Acquire Weather Context
        if override_weather is not None:
            w_data = override_weather
        elif "rainfall_mm" in s_dict or "weather_rainfall_mm" in s_dict:
            w_data = {
                "rainfall_mm": float(s_dict.get("rainfall_mm", s_dict.get("weather_rainfall_mm", 0.0))),
                "precipitation_probability": float(s_dict.get("precipitation_probability", s_dict.get("weather_precipitation_probability", 0.0))),
                "temperature_C": float(s_dict.get("weather_temperature_C", s_dict.get("TEMP_C", 20.0))),
                "weather_status": s_dict.get("weather_status", "LIVE")
            }
        else:
            w_data = self.weather_provider.get_weather()

        # 3. Acquire Storage Context
        if override_storage is not None:
            st_data = override_storage
        elif "deterioration_index" in s_dict:
            st_data = {
                "deterioration_index": float(s_dict["deterioration_index"]),
                "stagnation_status": s_dict.get("stagnation_status", "NORMAL"),
                "storage_age_hours": float(s_dict.get("storage_age_hours", 0.0))
            }
        else:
            st_data = {
                "deterioration_index": 0.0,
                "stagnation_status": "NORMAL",
                "storage_age_hours": 0.0
            }

        # Resolve source name
        source_name = s_dict.get("Greywater_Source") or s_dict.get("greywater_source")
        if not source_name:
            for s in ["Bathroom", "Kitchen", "Laundry", "Mixed"]:
                if float(s_dict.get(f"Greywater_Source_{s}", 0.0)) == 1.0:
                    source_name = s
                    break
        if not source_name:
            source_name = "Mixed"

        # 4. Construct unified RoutingInput
        routing_in = RoutingInput(
            greywater_source=source_name,
            pH=float(s_dict["pH"]),
            TEMP_C=float(s_dict["TEMP_C"]),
            SAL_ppt=float(s_dict["SAL_ppt"]),
            TUR_NTU=float(s_dict["TUR_NTU"]),
            DS_mg_L=float(s_dict["DS_mg_L"]),
            TDS_mg_L=float(s_dict["TDS_mg_L"]),
            TSS_mg_L=float(s_dict["TSS_mg_L"]),
            COND_uS_cm=float(s_dict["COND_uS_cm"]),
            DO_mg_L=float(s_dict["DO_mg_L"]),
            BOD_mg_L=float(s_dict["BOD_mg_L"]),
            COD_mg_L=float(s_dict["COD_mg_L"]),
            NH4F_mg_L=float(s_dict["NH4F_mg_L"]),
            NO3_mg_L=float(s_dict["NO3_mg_L"]),
            K_mg_L=float(s_dict["K_mg_L"]),
            E_coli_CFU_100mL=float(s_dict["E_coli_CFU_100mL"]),
            timestamp=str(s_dict.get("timestamp", "2026-10-02 12:00:00 UTC")),
            predicted_class=pred_class,
            prediction_confidence=confidence,
            class_probabilities=prob_dict,
            anomaly_prediction=is_anom,
            anomaly_score=anom_score
        )

        # 5. Evaluate through SmartRoutingEngine
        decision = self.routing_engine.evaluate(
            routing_input=routing_in,
            predicted_class=pred_class,
            prediction_confidence=confidence,
            class_probabilities=prob_dict,
            is_anomaly=is_anom,
            anomaly_score=anom_score,
            weather_data=w_data,
            storage_data=st_data
        )

        return decision

    def evaluate_batch(
        self,
        data: Union[pd.DataFrame, str],
        output_csv_path: Optional[str] = None
    ) -> pd.DataFrame:
        """
        Execute batch routing evaluation across a DataFrame or CSV file.
        """
        if isinstance(data, str):
            df = pd.read_csv(data)
        elif isinstance(data, pd.DataFrame):
            df = data.copy()
        else:
            raise TypeError("Data must be pandas DataFrame or filepath string.")

        results = []
        for idx, row in df.iterrows():
            dec = self.evaluate_sample(row)
            rec = {
                "Sample_ID": row.get("Sample_ID", idx + 1),
                "source": dec.source,
                "predicted_class": dec.predicted_class,
                "predicted_class_name": dec.predicted_route,
                "prediction_confidence": dec.prediction_confidence,
                "anomaly_status": dec.anomaly_status,
                "anomaly_score": dec.anomaly_score,
                "safety_status": dec.safety_status,
                "weather_status": dec.weather_status,
                "storage_status": dec.storage_status,
                "final_route": dec.final_route,
                "final_action": dec.final_action,
                "decision_status": dec.decision_status,
                "override_applied": dec.override_applied,
                "reason_codes": "|".join(dec.reason_codes),
                "human_readable_reason": dec.human_readable_reason
            }
            results.append(rec)

        res_df = pd.DataFrame(results)

        if output_csv_path is not None:
            os.makedirs(os.path.dirname(output_csv_path), exist_ok=True)
            res_df.to_csv(output_csv_path, index=False)
            print(f"Batch decisions saved to: {output_csv_path} ({len(res_df)} records)")

        return res_df
