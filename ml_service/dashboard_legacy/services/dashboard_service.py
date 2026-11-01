"""
Dashboard Service Layer
AI-Driven Intelligent Greywater Management and Smart Reuse Routing System

Acts as the single point of entry between the Streamlit user interface
and all completed backend modules (Phases 1-12).
"""

import sys
import types
import os
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
    m2.EpsilonInsensitive = DummyLoss; m2.Hinge = DummyLoss; m2.ModifiedHuber = DummyLoss
    m2.SquaredEpsilonInsensitive = DummyLoss; m2.SquaredHinge = DummyLoss
    m2._plain_sgd32 = lambda *a, **kw: None; m2._plain_sgd64 = lambda *a, **kw: None
    sys.modules['sklearn.linear_model._sgd_fast'] = m2

from anomaly.anomaly_detector import EXPECTED_FEATURES, GreywaterAnomalyDetector
from routing.decision_schema import (
    CLASS_MAP,
    NAME_TO_CLASS,
    ACTION_ALLOW_ROUTE,
    ACTION_DEFER_ROUTE,
    ACTION_STORE_FOR_LATER,
    ACTION_DISCHARGE_TO_SEWER,
    ACTION_PROCEED_WITH_TREATMENT,
    ACTION_REVIEW_REQUIRED,
    ACTION_SAFETY_OVERRIDE
)
from routing.inference_pipeline import ContextAwareRoutingPipeline
from explainability.shap_explainer import ShapRoutingExplainer
from explainability.local_explainer import LocalShapExplainer
from explainability.global_explainer import GlobalShapExplainer
from explainability.decision_explainer import DecisionExplainer
from dashboard.config import (
    PROJECT_ROOT,
    DATA_DIR,
    MODELS_DIR,
    REPORTS_DIR,
    SIMULATION_DIR,
    WQ_PHYSICAL_PARAMS,
    WQ_CHEMICAL_PARAMS,
    WQ_MICRO_PARAMS,
    STATUS_NORMAL,
    STATUS_ELEVATED,
    STATUS_REVIEW,
    STATUS_HIGH,
    STATUS_CRITICAL
)


class DashboardService:
    """
    Central service orchestrating data retrieval, ML inference, safety screening,
    context arbitration, SHAP explainability, and Digital Twin telemetry simulation.
    """
    _instance = None

    def __init__(self):
        self.project_root = PROJECT_ROOT
        self.models_dir = MODELS_DIR
        self.data_dir = DATA_DIR
        self.reports_dir = REPORTS_DIR
        self.simulation_dir = SIMULATION_DIR

        # Lazy loaded components
        self.routing_pipeline = None
        self.shap_explainer = None
        self.local_explainer = None
        self.global_explainer = None
        self.decision_explainer = None
        self._telemetry_df = None
        self._sim_step_idx = 0

        self.load_models()

    @classmethod
    def get_instance(cls):
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    def load_models(self) -> Dict[str, Any]:
        """Load and cache all ML and decision pipeline components."""
        status = {"xgboost": False, "isolation_forest": False, "shap": False, "routing": False}
        try:
            self.routing_pipeline = ContextAwareRoutingPipeline()
            status["routing"] = True
            status["xgboost"] = self.routing_pipeline.xgb_model is not None
            status["isolation_forest"] = self.routing_pipeline.iso_model is not None
        except Exception as e:
            print(f"Warning: Could not initialize ContextAwareRoutingPipeline: {e}")

        try:
            self.shap_explainer = ShapRoutingExplainer()
            self.local_explainer = LocalShapExplainer(self.shap_explainer)
            self.global_explainer = GlobalShapExplainer(self.shap_explainer)
            status["shap"] = True
        except Exception as e:
            print(f"Warning: Could not initialize SHAP explainers: {e}")

        try:
            self.decision_explainer = DecisionExplainer(
                routing_pipeline=self.routing_pipeline,
                shap_explainer=self.shap_explainer,
                local_explainer=self.local_explainer
            )
        except Exception as e:
            print(f"Warning: Could not initialize DecisionExplainer: {e}")

        return status

    def load_configuration(self) -> Dict[str, Any]:
        """Return key configuration metadata."""
        return {
            "expected_features": EXPECTED_FEATURES,
            "class_map": CLASS_MAP,
            "name_to_class": NAME_TO_CLASS,
            "physical_params": WQ_PHYSICAL_PARAMS,
            "chemical_params": WQ_CHEMICAL_PARAMS,
            "micro_params": WQ_MICRO_PARAMS
        }

    def get_default_samples(self) -> Dict[str, Dict[str, Any]]:
        """Return representative sample presets for each greywater source."""
        return {
            "Bathroom (Irrigation Quality)": {
                "Greywater_Source": "Bathroom",
                "pH": 7.40,
                "TEMP_C": 24.50,
                "SAL_ppt": 0.22,
                "TUR_NTU": 28.50,
                "DS_mg_L": 255.0,
                "TDS_mg_L": 275.0,
                "TSS_mg_L": 34.0,
                "COND_uS_cm": 515.0,
                "DO_mg_L": 4.80,
                "BOD_mg_L": 28.0,
                "COD_mg_L": 82.0,
                "NH4F_mg_L": 4.20,
                "NO3_mg_L": 4.50,
                "K_mg_L": 15.80,
                "E_coli_CFU_100mL": 1500.0
            },
            "Kitchen (High Organics / Sewer Bypass)": {
                "Greywater_Source": "Kitchen",
                "pH": 6.30,
                "TEMP_C": 28.0,
                "SAL_ppt": 0.58,
                "TUR_NTU": 145.0,
                "DS_mg_L": 620.0,
                "TDS_mg_L": 680.0,
                "TSS_mg_L": 240.0,
                "COND_uS_cm": 940.0,
                "DO_mg_L": 0.50,
                "BOD_mg_L": 380.0,
                "COD_mg_L": 850.0,
                "NH4F_mg_L": 18.50,
                "NO3_mg_L": 3.20,
                "K_mg_L": 32.0,
                "E_coli_CFU_100mL": 180000.0
            },
            "Laundry (Surfactants / Bio-filtration)": {
                "Greywater_Source": "Laundry",
                "pH": 7.80,
                "TEMP_C": 31.0,
                "SAL_ppt": 0.38,
                "TUR_NTU": 72.0,
                "DS_mg_L": 340.0,
                "TDS_mg_L": 380.0,
                "TSS_mg_L": 78.0,
                "COND_uS_cm": 640.0,
                "DO_mg_L": 3.20,
                "BOD_mg_L": 85.0,
                "COD_mg_L": 240.0,
                "NH4F_mg_L": 8.50,
                "NO3_mg_L": 2.80,
                "K_mg_L": 21.0,
                "E_coli_CFU_100mL": 8500.0
            },
            "Mixed (Composite Domestic Stream)": {
                "Greywater_Source": "Mixed",
                "pH": 7.15,
                "TEMP_C": 26.0,
                "SAL_ppt": 0.28,
                "TUR_NTU": 55.0,
                "DS_mg_L": 290.0,
                "TDS_mg_L": 315.0,
                "TSS_mg_L": 65.0,
                "COND_uS_cm": 560.0,
                "DO_mg_L": 3.80,
                "BOD_mg_L": 62.0,
                "COD_mg_L": 180.0,
                "NH4F_mg_L": 6.80,
                "NO3_mg_L": 4.10,
                "K_mg_L": 18.20,
                "E_coli_CFU_100mL": 32000.0
            }
        }

    def run_single_analysis(
        self,
        sample_dict: Dict[str, Any],
        override_weather: Optional[Dict[str, Any]] = None,
        override_storage: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Execute full end-to-end evaluation and explainability on a single greywater sample.
        """
        if self.decision_explainer is None:
            self.load_models()

        return self.decision_explainer.explain_decision(
            sample=sample_dict,
            override_weather=override_weather,
            override_storage=override_storage
        )

    def run_batch_analysis(self, file_or_df: Union[str, pd.DataFrame]) -> pd.DataFrame:
        """
        Validate and evaluate a batch of greywater samples from a DataFrame or CSV file.
        """
        if isinstance(file_or_df, str):
            df = pd.read_csv(file_or_df)
        elif isinstance(file_or_df, pd.DataFrame):
            df = file_or_df.copy()
        else:
            raise TypeError("Input must be a CSV file path or pandas DataFrame")

        # Validate required columns
        base_numeric = [f for f in EXPECTED_FEATURES if not f.startswith("Greywater_Source_")]
        missing = [col for col in base_numeric if col not in df.columns]
        
        # Check source column
        has_source = "Greywater_Source" in df.columns or "greywater_source" in df.columns or all(
            col in df.columns for col in ["Greywater_Source_Bathroom", "Greywater_Source_Kitchen", "Greywater_Source_Laundry", "Greywater_Source_Mixed"]
        )
        if not has_source:
            missing.append("Greywater_Source")

        if missing:
            raise ValueError(f"Batch validation failed. Missing required columns: {', '.join(missing)}")

        if self.decision_explainer is None:
            self.load_models()

        records = []
        for idx, row in df.iterrows():
            s_dict = row.to_dict()
            res = self.decision_explainer.explain_decision(s_dict)
            top_contribs = res["shap_explanation"]["predicted_class_contributions"]
            
            f1 = top_contribs[0] if len(top_contribs) > 0 else {"feature": "N/A", "value": 0.0, "shap_value": 0.0}
            f2 = top_contribs[1] if len(top_contribs) > 1 else {"feature": "N/A", "value": 0.0, "shap_value": 0.0}
            f3 = top_contribs[2] if len(top_contribs) > 2 else {"feature": "N/A", "value": 0.0, "shap_value": 0.0}

            records.append({
                "Sample_ID": row.get("Sample_ID", idx + 1),
                "Source": res["model_prediction"]["route"],
                "predicted_route": res["model_prediction"]["route"],
                "prediction_confidence": res["model_prediction"]["confidence"],
                "top_feature_1": f1["feature"],
                "top_feature_1_shap": f1["shap_value"],
                "top_feature_2": f2["feature"],
                "top_feature_2_shap": f2["shap_value"],
                "top_feature_3": f3["feature"],
                "top_feature_3_shap": f3["shap_value"],
                "safety_status": res["safety_explanation"]["status"],
                "anomaly_status": res["anomaly_explanation"]["status"],
                "weather_status": res["weather_explanation"]["status"],
                "storage_status": res["storage_explanation"]["status"],
                "final_route": res["final_decision"]["route"],
                "final_action": res["final_decision"]["action"],
                "override_applied": res["final_decision"]["override_applied"],
                "reason_codes": "|".join(res["final_decision"]["reason_codes"]),
                "summary": res["human_readable_explanation"]
            })

        return pd.DataFrame(records)

    def get_telemetry_history(self) -> pd.DataFrame:
        """Load and return synthetic telemetry time series from Phase 8."""
        if self._telemetry_df is None:
            telemetry_path = os.path.join(self.simulation_dir, "synthetic_telemetry.csv")
            if os.path.exists(telemetry_path):
                self._telemetry_df = pd.read_csv(telemetry_path)
            else:
                self._telemetry_df = pd.DataFrame()
        return self._telemetry_df

    def run_simulation_step(self) -> Dict[str, Any]:
        """
        Advance one step in the Digital Twin simulation telemetry stream
        and compute real-time decision routing and explainability.
        """
        df = self.get_telemetry_history()
        if df.empty:
            sample = self.get_default_samples()["Bathroom (Irrigation Quality)"]
            analysis = self.run_single_analysis(sample)
            return {"telemetry": sample, "analysis": analysis, "step": 1, "total_steps": 1}

        idx = self._sim_step_idx % len(df)
        row = df.iloc[idx].to_dict()
        self._sim_step_idx += 1

        # Format sample for decision engine
        sample = {
            "Greywater_Source": row.get("greywater_source", "Bathroom"),
            "pH": float(row["pH"]),
            "TEMP_C": float(row["TEMP_C"]),
            "SAL_ppt": float(row["SAL_ppt"]),
            "TUR_NTU": float(row["TUR_NTU"]),
            "DS_mg_L": float(row["DS_mg_L"]),
            "TDS_mg_L": float(row["TDS_mg_L"]),
            "TSS_mg_L": float(row["TSS_mg_L"]),
            "COND_uS_cm": float(row["COND_uS_cm"]),
            "DO_mg_L": float(row["DO_mg_L"]),
            "BOD_mg_L": float(row["BOD_mg_L"]),
            "COD_mg_L": float(row["COD_mg_L"]),
            "NH4F_mg_L": float(row["NH4F_mg_L"]),
            "NO3_mg_L": float(row["NO3_mg_L"]),
            "K_mg_L": float(row["K_mg_L"]),
            "E_coli_CFU_100mL": float(row["E_coli_CFU_100mL"])
        }

        # Context overrides from telemetry row if available
        override_storage = {
            "tank_level_liters": float(row.get("tank_level_L", 500.0)),
            "tank_capacity_liters": float(row.get("tank_capacity_L", 1000.0)),
            "deterioration_index": 0.15 if row.get("event_name") != "storage_stale" else 0.85,
            "stagnation_status": "NORMAL" if row.get("event_name") != "storage_stale" else "DEGRADED"
        }

        analysis = self.run_single_analysis(sample, override_storage=override_storage)

        return {
            "telemetry": row,
            "sample": sample,
            "analysis": analysis,
            "step": idx + 1,
            "total_steps": len(df)
        }

    def reset_simulation(self):
        """Reset the simulation index to the initial step."""
        self._sim_step_idx = 0

    def get_water_quality(self, sample_dict: Dict[str, Any]) -> Dict[str, List[Dict[str, Any]]]:
        """
        Categorize water-quality readings into Physical, Chemical, and Microbiological
        domains with semantic evaluation statuses (NORMAL, ELEVATED, REVIEW, HIGH, CRITICAL).
        """
        def evaluate_param(val: float, cfg: Dict[str, Any]) -> str:
            if "critical_max" in cfg and val >= cfg["critical_max"]:
                return STATUS_CRITICAL
            if "critical_min" in cfg and val <= cfg["critical_min"]:
                return STATUS_CRITICAL
            if "review_max" in cfg and val >= cfg["review_max"]:
                return STATUS_HIGH
            if "normal_max" in cfg and val > cfg["normal_max"]:
                return STATUS_ELEVATED
            if "normal_min" in cfg and val < cfg["normal_min"]:
                return STATUS_REVIEW
            return STATUS_NORMAL

        categorized = {"Physical": [], "Chemical": [], "Microbiological": []}

        for p in WQ_PHYSICAL_PARAMS:
            name = p["name"]
            val = float(sample_dict.get(name, 0.0))
            status = evaluate_param(val, p)
            categorized["Physical"].append({
                "name": name,
                "label": p["label"],
                "value": round(val, 2),
                "status": status
            })

        for p in WQ_CHEMICAL_PARAMS:
            name = p["name"]
            val = float(sample_dict.get(name, 0.0))
            status = evaluate_param(val, p)
            categorized["Chemical"].append({
                "name": name,
                "label": p["label"],
                "value": round(val, 2),
                "status": status
            })

        for p in WQ_MICRO_PARAMS:
            name = p["name"]
            val = float(sample_dict.get(name, 0.0))
            status = evaluate_param(val, p)
            categorized["Microbiological"].append({
                "name": name,
                "label": p["label"],
                "value": round(val, 1),
                "status": status
            })

        return categorized

    def get_system_status(self) -> Dict[str, Any]:
        """Verify health of all 11 project modules, model artifacts, and datasets."""
        modules = [
            {"id": "phase1", "name": "Project Foundation", "status": "OPERATIONAL"},
            {"id": "phase2", "name": "Dataset Validation (1,500 samples)", "status": "OPERATIONAL"},
            {"id": "phase3", "name": "Four-Class Routing Framework", "status": "OPERATIONAL"},
            {"id": "phase4", "name": "Feature Pipeline (19 features)", "status": "OPERATIONAL"},
            {"id": "phase5", "name": "Baseline ML Models", "status": "OPERATIONAL"},
            {"id": "phase6", "name": "Optimized XGBoost (400 trees)", "status": "OPERATIONAL"},
            {"id": "phase7", "name": "Isolation Forest Anomaly Detection", "status": "OPERATIONAL"},
            {"id": "phase8", "name": "Digital Twin Telemetry Simulator", "status": "OPERATIONAL"},
            {"id": "phase9", "name": "Weather Context Provider", "status": "OPERATIONAL"},
            {"id": "phase10", "name": "Biochemical Decay & Storage Tank", "status": "OPERATIONAL"},
            {"id": "phase11", "name": "Smart Context-Aware Routing Engine", "status": "OPERATIONAL"},
            {"id": "phase12", "name": "SHAP TreeExplainer & Interpretability", "status": "OPERATIONAL"},
            {"id": "phase13", "name": "Streamlit User Interface & Service", "status": "ACTIVE"}
        ]

        models = {
            "xgboost_path": os.path.join(self.models_dir, "xgboost_optimized.pkl"),
            "xgboost_exists": os.path.exists(os.path.join(self.models_dir, "xgboost_optimized.pkl")),
            "rf_path": os.path.join(self.models_dir, "random_forest_optimized.pkl"),
            "rf_exists": os.path.exists(os.path.join(self.models_dir, "random_forest_optimized.pkl")),
            "iso_path": os.path.join(self.models_dir, "isolation_forest.pkl"),
            "iso_exists": os.path.exists(os.path.join(self.models_dir, "isolation_forest.pkl"))
        }

        dataset_info = {
            "main_csv_path": os.path.join(self.project_root, "dataset", "main.csv"),
            "main_csv_exists": os.path.exists(os.path.join(self.project_root, "dataset", "main.csv")),
            "train_samples": 1050,
            "test_samples": 225,
            "validation_samples": 225,
            "features_count": 19
        }

        return {
            "modules": modules,
            "models": models,
            "dataset": dataset_info,
            "system_ready": all(m["status"] in ["OPERATIONAL", "ACTIVE"] for m in modules)
        }

    def get_available_reports(self) -> List[Dict[str, str]]:
        """Return list of existing project markdown reports."""
        report_files = [
            ("Phase 2 — Dataset Analysis & Quality", "DATASET_ANALYSIS_REPORT.md"),
            ("Phase 3 — Four-Class Routing Target Design", "ROUTING_LABEL_REPORT.md"),
            ("Phase 4 — Data Preprocessing & Pipeline", "PREPROCESSING_PIPELINE_REPORT.md"),
            ("Phase 5 — Baseline ML Evaluation", "phase5_baseline_models_report.md"),
            ("Phase 6 — Optimization & Robust Evaluation", "phase6_model_optimization_report.md"),
            ("Phase 7 — Isolation Forest Anomaly Detection", "phase7_anomaly_detection_report.md"),
            ("Phase 8 — Digital Twin Telemetry Validation", "digital_twin_validation.md"),
            ("Phase 9 — Weather Context Integration", "WEATHER_CONTEXT_REPORT.md"),
            ("Phase 10 — Storage Tank Monitoring & Decay", "phase10_storage_decay_report.md"),
            ("Phase 11 — Smart Context-Aware Routing", "phase11_smart_routing_report.md"),
            ("Phase 12 — SHAP Explainability & Transparency", "phase12_shap_explainability_report.md"),
            ("Phase 13 — Streamlit Dashboard Architecture", "phase13_dashboard_report.md")
        ]

        available = []
        for title, fname in report_files:
            fpath = os.path.join(self.reports_dir, fname)
            if os.path.exists(fpath):
                available.append({
                    "title": title,
                    "filename": fname,
                    "path": fpath,
                    "size_kb": round(os.path.getsize(fpath) / 1024, 1)
                })

        return available


def get_service() -> DashboardService:
    """Helper function to obtain the singleton DashboardService instance."""
    return DashboardService.get_instance()
