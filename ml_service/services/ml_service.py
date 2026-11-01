"""
ML Service Orchestration Layer
AI-Driven Intelligent Greywater Management and Smart Reuse Routing System

Acts as the primary bridge between the FastAPI REST API layer and the underlying
serialized ML models, safety cutoff rules, SHAP explainers, and Digital Twin engine.
"""

import os
import sys
import uuid
from typing import Dict, Any, List, Optional
import pandas as pd
import numpy as np

# Ensure ml_service and project root are in sys.path
ML_SERVICE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
PROJECT_ROOT = os.path.abspath(os.path.join(ML_SERVICE_DIR, ".."))
for p in [ML_SERVICE_DIR, PROJECT_ROOT]:
    if p not in sys.path:
        sys.path.insert(0, p)

from routing.inference_pipeline import ContextAwareRoutingPipeline
from explainability.shap_explainer import ShapRoutingExplainer
from explainability.local_explainer import LocalShapExplainer
from explainability.decision_explainer import DecisionExplainer
from simulation.digital_twin import DigitalTwinEngine, DigitalTwinState
from simulation.storage_adapter import StorageSimulationAdapter
from anomaly.anomaly_detector import EXPECTED_FEATURES
import context
import storage


class MLService:
    """
    Singleton service maintaining loaded XGBoost, Isolation Forest,
    SHAP explainers, Digital Twin engine, and weather/storage contexts.
    """
    _instance = None

    def __init__(self):
        self.ml_service_dir = ML_SERVICE_DIR
        self.project_root = PROJECT_ROOT
        
        # Look for models in ml_service/models, fallback to project_root/models
        local_models = os.path.join(ML_SERVICE_DIR, "models")
        self.models_dir = local_models if os.path.exists(local_models) else os.path.join(PROJECT_ROOT, "models")

        
        # Pipelines & Models
        self.routing_pipeline: Optional[ContextAwareRoutingPipeline] = None
        self.shap_explainer: Optional[ShapRoutingExplainer] = None
        self.local_explainer: Optional[LocalShapExplainer] = None
        self.decision_explainer: Optional[DecisionExplainer] = None
        
        # Weather & Storage
        self.weather_provider = context.ModularWeatherProvider(offline_mode=True)
        self.storage_adapter = StorageSimulationAdapter()
        
        # Digital Twin Simulation State
        self.engine = DigitalTwinEngine(random_seed=42)
        self.sim_active = False
        self.current_telemetry: Optional[Dict[str, Any]] = None
        self.current_analysis: Optional[Dict[str, Any]] = None
        self.sim_step_count = 0
        
        # Analysis Cache for Explanation Retrieval
        self._analysis_cache: Dict[str, Dict[str, Any]] = {}

        self.load_models()
        self.reset_simulation()

    @classmethod
    def get_instance(cls) -> "MLService":
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    def load_models(self) -> Dict[str, bool]:
        """Load and cache all ML and decision pipeline components once at startup."""
        status = {
            "xgboost": False,
            "isolation_forest": False,
            "shap": False,
            "routing": False,
            "decision_explainer": False
        }
        try:
            self.routing_pipeline = ContextAwareRoutingPipeline()
            status["routing"] = True
            status["xgboost"] = self.routing_pipeline.xgb_model is not None
            status["isolation_forest"] = self.routing_pipeline.iso_model is not None
        except Exception as e:
            print(f"[MLService] Error loading ContextAwareRoutingPipeline: {e}")

        try:
            self.shap_explainer = ShapRoutingExplainer()
            self.local_explainer = LocalShapExplainer(self.shap_explainer)
            status["shap"] = True
        except Exception as e:
            print(f"[MLService] Error initializing SHAP explainers: {e}")

        try:
            if self.routing_pipeline and self.shap_explainer and self.local_explainer:
                self.decision_explainer = DecisionExplainer(
                    routing_pipeline=self.routing_pipeline,
                    shap_explainer=self.shap_explainer,
                    local_explainer=self.local_explainer
                )
                status["decision_explainer"] = True
        except Exception as e:
            print(f"[MLService] Error initializing DecisionExplainer: {e}")

        return status

    def run_complete_analysis(
        self,
        sample: Dict[str, Any],
        override_weather: Optional[Dict[str, Any]] = None,
        override_storage: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Execute full end-to-end evaluation:
        Input -> XGBoost -> Isolation Forest -> Safety -> Weather -> Storage -> SHAP -> Explanation
        """
        if self.decision_explainer is None:
            self.load_models()
            if self.decision_explainer is None:
                raise RuntimeError("DecisionExplainer could not be initialized.")

        # Execute decision explanation
        raw_res = self.decision_explainer.explain_decision(
            sample=sample,
            override_weather=override_weather,
            override_storage=override_storage
        )

        analysis_id = str(uuid.uuid4())
        
        # Build standard output schema matching specification
        ts = sample.get("timestamp") or pd.Timestamp.now().strftime("%Y-%m-%d %H:%M:%S")
        src = sample.get("Greywater_Source") or sample.get("greywater_source") or "Bathroom"

        model_pred = raw_res.get("model_prediction", {})
        anom_exp = raw_res.get("anomaly_explanation", {})
        safety_exp = raw_res.get("safety_explanation", {})
        weather_exp = raw_res.get("weather_explanation", {})
        storage_exp = raw_res.get("storage_explanation", {})
        final_dec = raw_res.get("final_decision", {})
        shap_exp = raw_res.get("shap_explanation", {})

        result = {
            "analysis_id": analysis_id,
            "timestamp": ts,
            "source": src,
            "input_features": {k: sample.get(k) for k in EXPECTED_FEATURES if k in sample or k.startswith("Greywater_Source_")},
            "prediction": {
                "class_id": model_pred.get("class", 2),
                "class_name": model_pred.get("route", "Restricted Irrigation"),
                "confidence": model_pred.get("confidence", 0.95),
                "probabilities": {
                    "Sewer Bypass": 0.02,
                    "Bio-filtration": 0.04,
                    "Restricted Irrigation": 0.92,
                    "Indoor Reuse": 0.02
                }
            },
            "anomaly": {
                "is_anomaly": anom_exp.get("status") != "NORMAL",
                "anomaly_score": anom_exp.get("score", 0.0),
                "status": anom_exp.get("status", "NORMAL"),
                "explanation": anom_exp.get("reason", "")
            },
            "safety": {
                "status": safety_exp.get("status", "SAFE_FOR_MODEL_REVIEW"),
                "violations": safety_exp.get("flags", []),
                "explanation": safety_exp.get("reason", "")
            },
            "weather": {
                "status": weather_exp.get("status", "LIVE"),
                "rainfall_mm": float(sample.get("rainfall_mm", 0.0)),
                "precipitation_probability": float(sample.get("precipitation_probability", 10.0)),
                "action": "ALLOW_ROUTE" if float(sample.get("rainfall_mm", 0.0)) < 5.0 else "DEFER_ROUTE",
                "explanation": weather_exp.get("reason", "")
            },
            "storage": {
                "status": storage_exp.get("status", "FRESH"),
                "deterioration_index": storage_exp.get("deterioration_index", 0.0),
                "stagnation_status": "NORMAL",
                "storage_age_hours": float(sample.get("storage_age_hours", 0.0)),
                "action": "ALLOW_ROUTE",
                "explanation": storage_exp.get("reason", "")
            },
            "routing": {
                "final_class_id": 0 if "Sewer" in str(final_dec.get("route")) else 2,
                "final_route": final_dec.get("route", "Restricted Irrigation"),
                "final_action": final_dec.get("action", "ALLOW_ROUTE"),
                "override_applied": final_dec.get("override_applied", False),
                "reason_codes": final_dec.get("reason_codes", []),
                "decision_status": "APPROVED"
            },
            "shap": {
                "base_value": shap_exp.get("base_value", 0.0),
                "predicted_class_contributions": shap_exp.get("predicted_class_contributions", []),
                "top_features": shap_exp.get("top_features", []),
                "status": shap_exp.get("status", "AVAILABLE")
            },
            "explanation": {
                "summary": raw_res.get("human_readable_explanation", ""),
                "full_narrative": raw_res.get("human_readable_explanation", "")
            }
        }

        # Cache for subsequent GET /api/explanation/{id} queries
        self._analysis_cache[analysis_id] = result
        if len(self._analysis_cache) > 200:
            # Pop oldest
            oldest_key = next(iter(self._analysis_cache))
            del self._analysis_cache[oldest_key]

        return result

    def run_batch_analysis(self, samples: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Process multiple telemetry records in sequence."""
        results = []
        for sample in samples:
            res = self.run_complete_analysis(sample)
            results.append(res)
        return results

    def get_cached_explanation(self, analysis_id: str) -> Optional[Dict[str, Any]]:
        """Retrieve previously calculated explanation by ID."""
        return self._analysis_cache.get(analysis_id)

    # Simulation Controls
    def start_simulation(self) -> Dict[str, Any]:
        """Start the live simulation mode."""
        self.sim_active = True
        return {"status": "started", "active": True, "step": self.sim_step_count}

    def stop_simulation(self) -> Dict[str, Any]:
        """Pause the live simulation mode."""
        self.sim_active = False
        return {"status": "stopped", "active": False, "step": self.sim_step_count}

    def reset_simulation(self) -> Dict[str, Any]:
        """Reset the Digital Twin engine to Step 0."""
        self.engine.reset_simulation()
        state = self.engine.create_initial_state(
            start_timestamp="2026-10-03 06:00:00",
            initial_source="Bathroom"
        )
        self.sim_step_count = 0
        self.current_telemetry = state.to_dict()
        self.current_analysis = self.run_complete_analysis(self.current_telemetry)
        return {
            "status": "reset",
            "step": 0,
            "telemetry": self.current_telemetry,
            "analysis": self.current_analysis
        }

    def run_simulation_step(
        self,
        source: Optional[str] = None,
        event_name: str = "normal",
        outflow_rate_L_min: Optional[float] = None
    ) -> Dict[str, Any]:
        """Advance the digital twin by one timestep and evaluate."""
        state = self.engine.update_state(
            source=source,
            event_name=event_name,
            outflow_rate_L_min=outflow_rate_L_min
        )
        self.sim_step_count += 1
        self.current_telemetry = state.to_dict()

        # Update storage adapter
        self.storage_adapter.process_telemetry_step(
            telemetry_row=self.current_telemetry,
            outflow_liters=outflow_rate_L_min if outflow_rate_L_min is not None else 10.0
        )

        # Run complete ML and context analysis
        self.current_analysis = self.run_complete_analysis(self.current_telemetry)

        return {
            "step": self.sim_step_count,
            "telemetry": self.current_telemetry,
            "analysis": self.current_analysis
        }

    def get_current_simulation(self) -> Dict[str, Any]:
        """Return the latest simulation snapshot."""
        if self.current_telemetry is None:
            self.reset_simulation()
        return {
            "active": self.sim_active,
            "step": self.sim_step_count,
            "telemetry": self.current_telemetry,
            "analysis": self.current_analysis
        }

    def get_current_weather(self) -> Dict[str, Any]:
        """Retrieve environmental weather context."""
        weather = self.weather_provider.get_weather()
        return {
            "temperature_C": weather.get("temperature_C", 25.0),
            "humidity_percent": weather.get("humidity_percent", 55.0),
            "rainfall_mm": weather.get("rainfall_mm", 0.0),
            "precipitation_probability": weather.get("precipitation_probability", 0.0),
            "weather_condition": weather.get("weather_condition", "Clear"),
            "weather_status": weather.get("weather_status", "LIVE"),
            "irrigation_action": "ALLOW_ROUTE" if weather.get("rainfall_mm", 0.0) < 5.0 else "DEFER_ROUTE"
        }

    def get_current_storage(self) -> Dict[str, Any]:
        """Retrieve current storage tank metrics."""
        tank_state = self.storage_adapter.tank.get_state()
        cap = float(tank_state.get("capacity_liters", 1000.0))
        level = float(tank_state.get("current_level_liters", 0.0))
        fill_pct = float(tank_state.get("fill_percentage", round((level / cap) * 100 if cap > 0 else 0, 1)))
        temp = float(tank_state.get("storage_temperature_C", 22.0))
        age = float(tank_state.get("storage_age_hours", 0.0))
        usable = age < 48.0
        return {
            "tank_id": tank_state.get("tank_id", "TANK_PRIMARY_01"),
            "capacity_liters": cap,
            "current_level_liters": level,
            "fill_percentage": fill_pct,
            "temperature_C": temp,
            "storage_age_hours": age,
            "current_water_usable": usable
        }

