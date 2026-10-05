"""
Smart Context-Aware Routing Engine
AI-Driven Intelligent Greywater Management and Smart Reuse Routing System

The central decision engine fusing water-quality supervised machine learning,
unsupervised anomaly screening, deterministic safety cutoffs, environmental weather
context, and storage tank deterioration kinetics.
"""

from typing import Dict, Any, List, Optional, Tuple
import numpy as np

from routing.decision_schema import (
    RoutingInput,
    FinalDecisionOutput,
    CLASS_MAP,
    NAME_TO_CLASS,
    ROUTE_SEWER_BYPASS,
    ROUTE_BIO_FILTRATION,
    ROUTE_RESTRICTED_IRRIGATION,
    ROUTE_INDOOR_REUSE,
    ACTION_ALLOW_ROUTE,
    ACTION_DEFER_ROUTE,
    ACTION_STORE_FOR_LATER,
    ACTION_DISCHARGE_TO_SEWER,
    ACTION_PROCEED_WITH_TREATMENT,
    ACTION_REVIEW_REQUIRED,
    ACTION_SAFETY_OVERRIDE,
    DECISION_STATUS_APPROVED,
    DECISION_STATUS_ADVISORY,
    DECISION_STATUS_DEFERRED,
    DECISION_STATUS_OVERRIDDEN,
    DECISION_STATUS_FLAGGED_FOR_REVIEW,
    SAFETY_SAFE_FOR_MODEL_REVIEW,
    SAFETY_REVIEW_REQUIRED,
    SAFETY_HIGH_RISK,
    SAFETY_CRITICAL
)
import routing.reason_codes as rc
from routing.safety_rules import WaterQualitySafetyEngine
from routing.context_rules import ContextArbitrationEngine


class SmartRoutingEngine:
    """
    Central decision arbitration engine enforcing strict priority hierarchy:
      Priority 1: Critical Water-Quality Safety
      Priority 2: High-Risk Anomaly
      Priority 3: Model Routing Prediction
      Priority 4: Storage Tank Deterioration Condition
      Priority 5: Weather / Environmental Context
      Priority 6: Normal Operational Preference
    """
    def __init__(
        self,
        safety_engine: Optional[WaterQualitySafetyEngine] = None,
        context_engine: Optional[ContextArbitrationEngine] = None,
        min_high_confidence: float = 0.75,
        min_acceptable_confidence: float = 0.60
    ):
        self.safety_engine = safety_engine if safety_engine is not None else WaterQualitySafetyEngine()
        self.context_engine = context_engine if context_engine is not None else ContextArbitrationEngine()
        self.min_high_confidence = min_high_confidence
        self.min_acceptable_confidence = min_acceptable_confidence

    def evaluate(
        self,
        routing_input: RoutingInput,
        predicted_class: Optional[int] = None,
        prediction_confidence: Optional[float] = None,
        class_probabilities: Optional[Dict[str, float]] = None,
        is_anomaly: Optional[bool] = None,
        anomaly_score: Optional[float] = None,
        weather_data: Optional[Dict[str, Any]] = None,
        storage_data: Optional[Dict[str, Any]] = None
    ) -> FinalDecisionOutput:
        """
        Execute full context-aware routing decision arbitration.
        """
        reason_codes: List[str] = []
        override_applied = False
        override_reason = "No override applied; model routing approved."

        # Extract features dictionary for safety engine
        wq_features = {
            "Greywater_Source": routing_input.greywater_source,
            "pH": routing_input.pH,
            "TEMP_C": routing_input.TEMP_C,
            "SAL_ppt": routing_input.SAL_ppt,
            "TUR_NTU": routing_input.TUR_NTU,
            "DS_mg_L": routing_input.DS_mg_L,
            "TDS_mg_L": routing_input.TDS_mg_L,
            "TSS_mg_L": routing_input.TSS_mg_L,
            "COND_uS_cm": routing_input.COND_uS_cm,
            "DO_mg_L": routing_input.DO_mg_L,
            "BOD_mg_L": routing_input.BOD_mg_L,
            "COD_mg_L": routing_input.COD_mg_L,
            "NH4F_mg_L": routing_input.NH4F_mg_L,
            "NO3_mg_L": routing_input.NO3_mg_L,
            "K_mg_L": routing_input.K_mg_L,
            "E_coli_CFU_100mL": routing_input.E_coli_CFU_100mL
        }

        # -------------------------------------------------------------
        # STEP 1: SAFETY LAYER INSPECTION
        # -------------------------------------------------------------
        safety_status, safety_flags, wq_codes = self.safety_engine.evaluate_safety(wq_features)
        reason_codes.extend(wq_codes)

        # -------------------------------------------------------------
        # STEP 2: ANOMALY SCREENING EVALUATION
        # -------------------------------------------------------------
        anom_detected = is_anomaly if is_anomaly is not None else routing_input.anomaly_prediction
        anom_sc = anomaly_score if anomaly_score is not None else routing_input.anomaly_score
        anom_detected = bool(anom_detected) if anom_detected is not None else False
        anom_sc = float(anom_sc) if anom_sc is not None else 0.0

        if anom_detected:
            anomaly_status = "ANOMALY_DETECTED"
            reason_codes.append(rc.ANOMALY_DETECTED)
        else:
            anomaly_status = "NORMAL"
            reason_codes.append(rc.ANOMALY_CLEAN)

        # -------------------------------------------------------------
        # STEP 3: ML MODEL INFERENCE EVALUATION
        # -------------------------------------------------------------
        ml_class = predicted_class if predicted_class is not None else routing_input.predicted_class
        conf = prediction_confidence if prediction_confidence is not None else routing_input.prediction_confidence
        
        if ml_class is None:
            # Model unavailable fallback
            ml_class = 0
            conf = 0.0
            ml_route = ROUTE_SEWER_BYPASS
            reason_codes.append(rc.MODEL_UNAVAILABLE)
            confidence_level = "UNAVAILABLE"
        else:
            ml_route = CLASS_MAP.get(ml_class, ROUTE_SEWER_BYPASS)
            conf = float(conf) if conf is not None else 1.0
            if conf >= self.min_high_confidence:
                confidence_level = "HIGH"
                reason_codes.append(rc.MODEL_HIGH_CONFIDENCE)
            elif conf >= self.min_acceptable_confidence:
                confidence_level = "MEDIUM"
                reason_codes.append(rc.MODEL_MEDIUM_CONFIDENCE)
            else:
                confidence_level = "LOW"
                reason_codes.append(rc.MODEL_LOW_CONFIDENCE)

        # Map candidate route code
        if ml_route == ROUTE_SEWER_BYPASS:
            reason_codes.append(rc.ROUTE_SEWER)
        elif ml_route == ROUTE_BIO_FILTRATION:
            reason_codes.append(rc.ROUTE_BIOFILTRATION)
        elif ml_route == ROUTE_RESTRICTED_IRRIGATION:
            reason_codes.append(rc.ROUTE_IRRIGATION)
        elif ml_route == ROUTE_INDOOR_REUSE:
            reason_codes.append(rc.ROUTE_INDOOR_REUSE)

        # -------------------------------------------------------------
        # STEP 4: STORAGE CONTEXT
        # -------------------------------------------------------------
        # If storage_data not directly passed, build from routing_input
        st_data = storage_data
        if st_data is None and routing_input.deterioration_index is not None:
            st_data = {
                "deterioration_index": routing_input.deterioration_index,
                "stagnation_status": routing_input.stagnation_status or "NORMAL",
                "storage_age_hours": routing_input.storage_age_hours or 0.0
            }
        storage_status, storage_action, storage_codes = self.context_engine.evaluate_storage_context(
            ml_route, st_data
        )
        reason_codes.extend(storage_codes)

        # -------------------------------------------------------------
        # STEP 5: WEATHER CONTEXT
        # -------------------------------------------------------------
        w_data = weather_data
        if w_data is None and routing_input.weather_rainfall_mm is not None:
            w_data = {
                "rainfall_mm": routing_input.weather_rainfall_mm,
                "precipitation_probability": routing_input.weather_precipitation_probability or 0.0,
                "temperature_C": routing_input.weather_temperature_C or 20.0,
                "weather_status": routing_input.weather_status or "LIVE"
            }
        weather_status, weather_action, weather_codes = self.context_engine.evaluate_weather_context(
            ml_route, w_data
        )
        reason_codes.extend(weather_codes)

        # -------------------------------------------------------------
        # STEP 6: CONFLICT RESOLUTION (PRIORITY HIERARCHY)
        # -------------------------------------------------------------
        final_route = ml_route
        final_action = ACTION_ALLOW_ROUTE
        decision_status = DECISION_STATUS_APPROVED

        # PRIORITY 1: CRITICAL WATER-QUALITY SAFETY
        if safety_status == SAFETY_CRITICAL:
            final_route = ROUTE_SEWER_BYPASS
            final_action = ACTION_SAFETY_OVERRIDE
            decision_status = DECISION_STATUS_OVERRIDDEN
            override_applied = True
            override_reason = (
                "CRITICAL WATER-QUALITY SAFETY PRECEDENCE: Acute biological, chemical, or septic hazard detected. "
                "Immediate diversion to Sewer Bypass required. Weather and storage cannot override."
            )
            reason_codes.append(rc.OVERRIDE_SAFETY_CRITICAL)

        # PRIORITY 2: HIGH-RISK ANOMALY
        elif anom_detected and safety_status in (SAFETY_HIGH_RISK, SAFETY_CRITICAL):
            final_route = ROUTE_SEWER_BYPASS
            final_action = ACTION_SAFETY_OVERRIDE
            decision_status = DECISION_STATUS_OVERRIDDEN
            override_applied = True
            override_reason = (
                "ANOMALY SAFETY OVERRIDE: Statistical outlier confirmed with independent high-risk water-quality violations. "
                "Routing directly to Sewer Bypass."
            )
            reason_codes.append(rc.ANOMALY_SAFETY_OVERRIDE)

        # PRIORITY 3: ANOMALY WITHOUT SEVERE HAZARD (ANOMALY_REVIEW)
        elif anom_detected:
            # Retain ML route, flag review
            anomaly_status = "ANOMALY_REVIEW"
            final_route = ml_route
            decision_status = DECISION_STATUS_ADVISORY
            reason_codes.append(rc.ANOMALY_REVIEW)
            override_reason = (
                "ANOMALY ADVISORY: Statistical divergence detected without severe physical threshold breach. "
                "Retaining ML candidate route under operator advisory."
            )

        # Check Model Low Confidence
        if not override_applied and confidence_level == "LOW":
            decision_status = DECISION_STATUS_FLAGGED_FOR_REVIEW
            final_action = ACTION_REVIEW_REQUIRED
            reason_codes.append(rc.OVERRIDE_LOW_CONFIDENCE)

        # PRIORITY 4: STORAGE DETERIORATION CONFLICT
        if not override_applied:
            if storage_status == "HIGH_DETERIORATION":
                decision_status = DECISION_STATUS_FLAGGED_FOR_REVIEW
                final_action = ACTION_REVIEW_REQUIRED
                override_reason = (
                    "STORAGE DETERIORATION ADVISORY: High deterioration index or critical stagnation. "
                    "Operator quality review mandated before reuse dispatch."
                )
                reason_codes.append(rc.OVERRIDE_STORAGE_DETERIORATION)
            elif storage_status == "AGING" and final_action == ACTION_ALLOW_ROUTE:
                final_action = ACTION_REVIEW_REQUIRED
                decision_status = DECISION_STATUS_ADVISORY

        # PRIORITY 5: WEATHER CONTEXT (Restricted Irrigation Deferral)
        if not override_applied and final_route == ROUTE_RESTRICTED_IRRIGATION:
            if weather_action in (ACTION_DEFER_ROUTE, ACTION_STORE_FOR_LATER):
                # Route class remains Restricted Irrigation; action becomes DEFER_ROUTE or STORE_FOR_LATER
                final_action = weather_action
                decision_status = DECISION_STATUS_DEFERRED
                override_reason = (
                    "ENVIRONMENTAL CONTEXT ADJUSTMENT: Surface precipitation or elevated precipitation forecast "
                    "risks soil saturation and nutrient runoff. Direct irrigation deferred; divert water to storage."
                )

        # Action assignment for nominal routes
        if not override_applied and decision_status == DECISION_STATUS_APPROVED:
            if final_route == ROUTE_SEWER_BYPASS:
                final_action = ACTION_DISCHARGE_TO_SEWER
            elif final_route == ROUTE_BIO_FILTRATION:
                final_action = ACTION_PROCEED_WITH_TREATMENT
            else:
                final_action = ACTION_ALLOW_ROUTE

        # -------------------------------------------------------------
        # STEP 7: HUMAN-READABLE EXPLANATION SYNTHESIS
        # -------------------------------------------------------------
        human_explanation = self._synthesize_explanation(
            source=routing_input.greywater_source,
            ml_route=ml_route,
            confidence=conf,
            final_route=final_route,
            final_action=final_action,
            safety_status=safety_status,
            override_applied=override_applied,
            is_anomaly=anom_detected,
            weather_status=weather_status,
            weather_action=weather_action,
            storage_status=storage_status
        )

        # Clean and deduplicate reason codes
        unique_reason_codes = list(dict.fromkeys(reason_codes))

        det_idx_val = st_data.get("deterioration_index") if st_data else None
        stag_st_val = st_data.get("stagnation_status", "NORMAL") if st_data else "NORMAL"

        return FinalDecisionOutput(
            timestamp=routing_input.timestamp,
            source=routing_input.greywater_source,
            predicted_route=ml_route,
            predicted_class=ml_class,
            prediction_confidence=round(conf, 4),
            anomaly_status=anomaly_status,
            anomaly_score=round(anom_sc, 4),
            safety_status=safety_status,
            safety_flags=[f.to_dict() for f in safety_flags],
            weather_status=weather_status,
            weather_action=weather_action,
            storage_status=storage_status,
            deterioration_index=round(float(det_idx_val), 3) if det_idx_val is not None else None,
            stagnation_status=stag_st_val,
            final_route=final_route,
            final_action=final_action,
            decision_status=decision_status,
            override_applied=override_applied,
            override_reason=override_reason,
            reason_codes=unique_reason_codes,
            human_readable_reason=human_explanation
        )

    def _synthesize_explanation(
        self,
        source: str,
        ml_route: str,
        confidence: float,
        final_route: str,
        final_action: str,
        safety_status: str,
        override_applied: bool,
        is_anomaly: bool,
        weather_status: str,
        weather_action: str,
        storage_status: str
    ) -> str:
        """Generate concise, scientifically accurate explanation."""
        if override_applied:
            return (
                f"Critical water-quality or safety cutoff detected ({safety_status}). Although supervised model "
                f"predicted {ml_route} ({confidence*100:.1f}% confidence), the safety layer overrode the decision "
                f"and selected {final_route} for hazard containment."
            )

        if final_route == ROUTE_RESTRICTED_IRRIGATION and final_action in (ACTION_DEFER_ROUTE, ACTION_STORE_FOR_LATER):
            return (
                f"Supervised model classified this {source} sample as {ml_route} with {confidence*100:.1f}% confidence. "
                f"No safety violation was detected. However, environmental conditions indicate {weather_status.lower()} "
                f"irrigation weather, so direct application is deferred and the volume should be stored for later reuse."
            )

        if is_anomaly:
            return (
                f"Supervised model recommended {final_route} ({confidence*100:.1f}% confidence). An unsupervised statistical "
                f"anomaly was flagged without acute physical threshold violations; route retained under operator review advisory."
            )

        if storage_status == "HIGH_DETERIORATION":
            return (
                f"Sample classified as {final_route}. High storage retention age or stagnation was detected; "
                f"retesting or prioritized usage is recommended before discharge."
            )

        return (
            f"Supervised model classified this {source} sample as {final_route} with {confidence*100:.1f}% confidence. "
            f"All independent safety, anomaly, meteorological, and storage checks were satisfied for operational dispatch."
        )
