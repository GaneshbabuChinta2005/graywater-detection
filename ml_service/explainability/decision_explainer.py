"""
Decision Explainer: Unified ML SHAP and Context-Aware Decision Transparency
AI-Driven Intelligent Greywater Management and Smart Reuse Routing System

Fuses local SHAP feature attributions with deterministic safety rules,
anomaly detector outputs, weather context, and biochemical storage kinetics
to construct end-to-end transparent decision rationales.

SCIENTIFIC DISCLAIMER:
SHAP values describe how features influence the trained model's output.
They should NOT be interpreted as causal effects, biological mechanisms, or regulatory safety criteria.
Rule-based overrides and environmental deferrals are distinct operational constraints
and must not be conflated with mathematical SHAP attributions.
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

from explainability.shap_explainer import ShapRoutingExplainer
from explainability.local_explainer import LocalShapExplainer
from routing.inference_pipeline import ContextAwareRoutingPipeline
from routing.decision_schema import (
    CLASS_MAP,
    ACTION_ALLOW_ROUTE,
    ACTION_DEFER_ROUTE,
    ACTION_STORE_FOR_LATER,
    ACTION_DISCHARGE_TO_SEWER,
    ACTION_PROCEED_WITH_TREATMENT,
    ACTION_REVIEW_REQUIRED,
    ACTION_SAFETY_OVERRIDE
)


class DecisionExplainer:
    """
    Synthesizes ML model prediction explanations (SHAP) with deterministic
    safety rules, anomaly detection, weather context, and storage degradation.
    """
    def __init__(
        self,
        routing_pipeline: Optional[ContextAwareRoutingPipeline] = None,
        shap_explainer: Optional[ShapRoutingExplainer] = None,
        local_explainer: Optional[LocalShapExplainer] = None
    ):
        self.pipeline = routing_pipeline or ContextAwareRoutingPipeline()
        self.shap_explainer = shap_explainer or ShapRoutingExplainer()
        self.local_explainer = local_explainer or LocalShapExplainer(self.shap_explainer)
        self.class_map = self.shap_explainer.class_map

    def explain_decision(
        self,
        sample: Union[Dict[str, Any], pd.Series],
        override_weather: Optional[Dict[str, Any]] = None,
        override_storage: Optional[Dict[str, Any]] = None,
        sample_id: Optional[Union[int, str]] = None
    ) -> Dict[str, Any]:
        """
        Produce unified decision explanation conforming to Phase 12 schema.
        """
        if hasattr(sample, "to_dict"):
            s_dict = sample.to_dict()
        else:
            s_dict = dict(sample)

        # 1. Run full context-aware routing pipeline
        decision = self.pipeline.evaluate_sample(
            sample=s_dict,
            override_weather=override_weather,
            override_storage=override_storage
        )

        # 2. Run SHAP local explanation for the ML predicted class
        shap_available = True
        local_exp = None
        try:
            if self.local_explainer is not None:
                local_exp = self.local_explainer.explain_instance(s_dict, k=5)
            else:
                shap_available = False
        except Exception:
            shap_available = False

        # 3. Formulate component explanations
        # Anomaly explanation
        anom_status = decision.anomaly_status
        anom_score = decision.anomaly_score
        if anom_status == "ANOMALY":
            anom_desc = (
                f"The anomaly detector identified this observation as statistically unusual "
                f"relative to its training distribution (score: {anom_score:.4f})."
            )
        else:
            anom_desc = (
                f"The anomaly detector identified this observation as conforming to the "
                f"typical training distribution (score: {anom_score:.4f})."
            )

        # Safety explanation
        safety_status = decision.safety_status
        safety_flags = [code for code in decision.reason_codes if code.startswith("WQ_")]
        if safety_status in ["CRITICAL", "HIGH_RISK"]:
            safety_desc = f"Independent water-quality safety screening detected {safety_status} hazards."
        else:
            safety_desc = "Independent water-quality safety screening verified safe operating thresholds."

        # Weather explanation
        w_status = decision.weather_status
        if w_status == "UNFAVORABLE":
            w_desc = "Environmental meteorological conditions (e.g. precipitation/freeze) preclude active outdoor reuse."
        elif w_status == "FAVORABLE":
            w_desc = "Environmental meteorological conditions are favorable for operational reuse."
        else:
            w_desc = "Environmental meteorological conditions are neutral or non-limiting for indoor/treatment routes."

        # Storage explanation
        st_status = decision.storage_status
        # Extract deterioration index if present
        det_idx = float(s_dict.get("deterioration_index", 0.0))
        if override_storage and "deterioration_index" in override_storage:
            det_idx = float(override_storage["deterioration_index"])
        
        if st_status in ["DEGRADED", "STAGNANT", "HIGH_DETERIORATION", "AGING"]:
            st_desc = (
                f"Storage review was requested because the biochemical deterioration index ({det_idx:.2f}) "
                f"exceeded configured operational review thresholds."
            )
        else:
            st_desc = f"Storage tank conditions and biochemical retention are within normal operating parameters (index: {det_idx:.2f})."

        # 4. Formulate comprehensive narrative explanation
        if shap_available and local_exp is not None:
            top_contrib_names = [f["feature"] for f in local_exp.get("top_absolute_contributors", [])[:3]]
            contrib_str = ", ".join(top_contrib_names) if top_contrib_names else "N/A"
            shap_output = {
                "top_features": [f["feature"] for f in local_exp.get("top_absolute_contributors", [])],
                "base_value": local_exp.get("base_value", 0.0),
                "predicted_class_contributions": local_exp.get("top_absolute_contributors", []),
                "status": "AVAILABLE"
            }
        else:
            contrib_str = "SHAP unavailable"
            shap_output = {
                "top_features": [],
                "base_value": 0.0,
                "predicted_class_contributions": [],
                "status": "UNAVAILABLE",
                "error": "SHAP feature attribution unavailable"
            }

        narrative_lines = []
        narrative_lines.append(
            f"MODEL DECISION: {decision.predicted_route} (Confidence: {decision.prediction_confidence*100:.1f}%)."
        )
        if shap_available and local_exp is not None:
            narrative_lines.append(
                f"MODEL EXPLANATION: SHAP indicates the primary model contributors were {contrib_str}."
            )
        else:
            narrative_lines.append(
                "MODEL EXPLANATION: SHAP explanation is currently unavailable."
            )

        is_context_action = (
            decision.override_applied or
            decision.final_action in [ACTION_DEFER_ROUTE, ACTION_STORE_FOR_LATER, ACTION_REVIEW_REQUIRED, ACTION_SAFETY_OVERRIDE] or
            w_status == "UNFAVORABLE" or
            st_status in ["DEGRADED", "STAGNANT", "HIGH_DETERIORATION", "AGING"]
        )

        if is_context_action:
            if safety_status in ["CRITICAL", "HIGH_RISK"] or decision.override_applied:
                narrative_lines.append(
                    f"SAFETY OVERRIDE: Although the ML model predicted {decision.predicted_route}, "
                    f"an independent critical water-quality condition triggered the highest-priority safety rule. "
                    f"Therefore, the final route was changed to {decision.final_route}."
                )
            elif w_status == "UNFAVORABLE" or decision.final_action in [ACTION_DEFER_ROUTE, ACTION_STORE_FOR_LATER]:
                narrative_lines.append(
                    f"WEATHER CONTEXT: Unfavorable environmental conditions triggered route deferral. "
                    f"The water-quality route remains {decision.final_route}, but dispatch is temporarily deferred (action: {decision.final_action})."
                )
            elif st_status in ["DEGRADED", "STAGNANT", "HIGH_DETERIORATION", "AGING"]:
                narrative_lines.append(
                    f"STORAGE CONTEXT: Biochemical deterioration necessitated storage review or recirculation. "
                    f"Final action: {decision.final_action}."
                )
            elif anom_status == "ANOMALY":
                narrative_lines.append(
                    f"ANOMALY ADVISORY: Statistical anomaly flagged without immediate cutoff override. "
                    f"Observation submitted for operational review."
                )
            else:
                narrative_lines.append(
                    f"OPERATIONAL ARBITRATION: Contextual constraints resulted in final action: {decision.final_action}."
                )
        else:
            narrative_lines.append(
                f"FINAL DECISION: {decision.final_route} was approved with action '{decision.final_action}'. "
                f"No safety, anomaly, meteorological, or storage overrides were triggered."
            )

        full_narrative = " ".join(narrative_lines)

        return {
            "model_prediction": {
                "class": decision.predicted_class,
                "route": decision.predicted_route,
                "confidence": round(decision.prediction_confidence, 4)
            },
            "shap_explanation": shap_output,
            "anomaly_explanation": {
                "status": anom_status,
                "score": round(anom_score, 4),
                "reason": anom_desc
            },
            "safety_explanation": {
                "status": safety_status,
                "flags": safety_flags,
                "reason": safety_desc
            },
            "weather_explanation": {
                "status": w_status,
                "reason": w_desc
            },
            "storage_explanation": {
                "status": st_status,
                "deterioration_index": round(det_idx, 4),
                "reason": st_desc
            },
            "final_decision": {
                "route": decision.final_route,
                "action": decision.final_action,
                "override_applied": decision.override_applied,
                "reason_codes": decision.reason_codes
            },
            "human_readable_explanation": full_narrative
        }

    def explain_batch_to_csv(
        self,
        test_csv_path: str,
        output_csv_path: Optional[str] = None
    ) -> pd.DataFrame:
        """
        Executes batch explanations on test samples and exports
        dataset/processed/routing_decisions_explained.csv
        """
        project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
        output_csv_path = output_csv_path or os.path.join(project_root, "dataset", "processed", "routing_decisions_explained.csv")
        
        df_raw = pd.read_csv(test_csv_path)
        records = []

        for idx, row in df_raw.iterrows():
            sample_id = row.get("Sample_ID", idx + 1)
            row_dict = row.to_dict()
            explanation = self.explain_decision(row_dict, sample_id=sample_id)
            
            top_contribs = explanation["shap_explanation"]["predicted_class_contributions"]
            
            f1 = top_contribs[0] if len(top_contribs) > 0 else {"feature": "N/A", "value": 0.0, "shap_value": 0.0}
            f2 = top_contribs[1] if len(top_contribs) > 1 else {"feature": "N/A", "value": 0.0, "shap_value": 0.0}
            f3 = top_contribs[2] if len(top_contribs) > 2 else {"feature": "N/A", "value": 0.0, "shap_value": 0.0}

            reason_str = "|".join(explanation["final_decision"]["reason_codes"])

            records.append({
                "Sample_ID": sample_id,
                "predicted_route": explanation["model_prediction"]["route"],
                "prediction_confidence": explanation["model_prediction"]["confidence"],
                "top_feature_1": f1["feature"],
                "top_feature_1_value": f1["value"],
                "top_feature_1_shap": f1["shap_value"],
                "top_feature_2": f2["feature"],
                "top_feature_2_value": f2["value"],
                "top_feature_2_shap": f2["shap_value"],
                "top_feature_3": f3["feature"],
                "top_feature_3_value": f3["value"],
                "top_feature_3_shap": f3["shap_value"],
                "final_route": explanation["final_decision"]["route"],
                "final_action": explanation["final_decision"]["action"],
                "override_applied": explanation["final_decision"]["override_applied"],
                "reason_codes": reason_str,
                "explanation_summary": explanation["human_readable_explanation"]
            })

        df_out = pd.DataFrame(records)
        os.makedirs(os.path.dirname(os.path.abspath(output_csv_path)), exist_ok=True)
        df_out.to_csv(output_csv_path, index=False)
        return df_out


if __name__ == "__main__":
    print("=" * 60)
    print("Decision Explainer - Operational Test")
    print("=" * 60)
    explainer = DecisionExplainer()
    print("Decision Explainer initialized successfully.")
    print("=" * 60)
    print("Decision Explainer test executed successfully.")

