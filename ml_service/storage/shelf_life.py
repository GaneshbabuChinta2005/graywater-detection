"""
Operational Deterioration Index, Stagnation Detection, and Shelf-Life Assessment
AI-Driven Intelligent Greywater Management and Smart Reuse Routing System

Calculates multi-factor operational deterioration scores, tracks stagnation risks,
and evaluates storage actionable states under explicit scientific caveats.

SCIENTIFIC DISCLAIMER:
The project dataset is cross-sectional and does NOT contain longitudinal storage experiments.
This module provides a configurable operational deterioration estimate rather than
an experimentally validated prediction of exact greywater shelf life.
"""

from datetime import datetime, timezone
from typing import Dict, Any, Optional

from storage.config import (
    DETERIORATION_BANDS,
    DETERIORATION_WEIGHTS,
    MAX_SAFE_STORAGE_HOURS,
    STAGNATION_THRESHOLDS,
    STAGNATION_STATUS_NORMAL,
    STAGNATION_STATUS_LOW_TURNOVER,
    STAGNATION_STATUS_STAGNANT,
    STAGNATION_STATUS_HIGH_RISK,
    SHELF_LIFE_STATUS_FRESH,
    SHELF_LIFE_STATUS_MONITOR,
    SHELF_LIFE_STATUS_AGING,
    SHELF_LIFE_STATUS_HIGH_RISK,
    SHELF_LIFE_STATUS_NOT_VALIDATED,
    ACTION_CONTINUE_MONITORING,
    ACTION_PRIORITIZE_USE,
    ACTION_REDUCE_STORAGE_TIME,
    ACTION_REVIEW_WATER_QUALITY,
    ACTION_EMPTY_AND_REASSESS,
    ACTION_SAFETY_REVIEW,
    MICROBIAL_RISK_STATUS_DEFAULT
)
from storage.decay_model import BiochemicalDecayModel


class StorageMonitor:
    """
    Evaluates storage conditions, computes composite deterioration indices,
    flags stagnation events, and generates structured operational recommendations.
    """
    def __init__(
        self,
        decay_model: Optional[BiochemicalDecayModel] = None,
        weights: Optional[Dict[str, float]] = None,
        strict_shelf_life_validation: bool = False
    ):
        self.decay_model = decay_model if decay_model is not None else BiochemicalDecayModel()
        self.weights = dict(weights) if weights else dict(DETERIORATION_WEIGHTS)
        self.strict_shelf_life_validation = strict_shelf_life_validation

    def calculate_deterioration_index(
        self,
        storage_age_hours: float,
        temperature_C: float,
        initial_features: Optional[Dict[str, Any]] = None,
        idle_hours_since_outflow: float = 0.0,
        is_empty: bool = False
    ) -> Dict[str, Any]:
        """
        Compute normalized multi-factor deterioration index in [0.0, 1.0].
        
        Sub-factors:
        1. storage_age_factor: Normalized operational age relative to nominal safe ceiling (48h).
        2. temperature_factor: Elevated temperatures accelerate biochemical kinetics (15°C to 40°C).
        3. organic_decay_factor: Modeled BOD/COD exertion progress.
        4. oxygen_depletion_factor: Modeled dissolved oxygen depletion toward anoxic conditions.
        5. stagnation_factor: Prolonged outflow inactivity.
        """
        if is_empty or storage_age_hours <= 0.0:
            return {
                "deterioration_index": 0.0,
                "deterioration_status": "LOW_DETERIORATION",
                "sub_factors": {
                    "storage_age_factor": 0.0,
                    "temperature_factor": 0.0,
                    "organic_decay_factor": 0.0,
                    "oxygen_depletion_factor": 0.0,
                    "stagnation_factor": 0.0
                }
            }

        # 1. Age Factor (Linear up to MAX_SAFE_STORAGE_HOURS)
        age_factor = min(1.0, max(0.0, storage_age_hours / MAX_SAFE_STORAGE_HOURS))

        # 2. Temperature Factor (Scaled 15°C -> 40°C)
        temp_factor = min(1.0, max(0.0, (temperature_C - 15.0) / 25.0))

        # 3. Organic Decay Factor (Modeled BOD exertion)
        bod_decay_res = self.decay_model.estimate_parameter_decay(
            "BOD_mg_L", initial_value=100.0, elapsed_hours=storage_age_hours, temperature_C=temperature_C
        )
        # Proportion of original organic matter exerted
        organic_decay_factor = min(1.0, max(0.0, 1.0 - (bod_decay_res["estimated_value"] / 100.0)))

        # 4. Oxygen Depletion Factor (Modeled DO depletion)
        do_decay_res = self.decay_model.estimate_parameter_decay(
            "DO_mg_L", initial_value=6.0, elapsed_hours=storage_age_hours, temperature_C=temperature_C
        )
        oxygen_depletion_factor = min(1.0, max(0.0, 1.0 - (do_decay_res["estimated_value"] / 6.0)))

        # 5. Stagnation Factor (Inactivity relative to 24h)
        stagnation_factor = min(1.0, max(0.0, idle_hours_since_outflow / STAGNATION_THRESHOLDS["HIGH_STAGNATION_HOURS"]))

        # Weighted Sum
        composite_index = (
            self.weights.get("storage_age_factor", 0.35) * age_factor +
            self.weights.get("temperature_factor", 0.20) * temp_factor +
            self.weights.get("organic_decay_factor", 0.20) * organic_decay_factor +
            self.weights.get("oxygen_depletion_factor", 0.15) * oxygen_depletion_factor +
            self.weights.get("stagnation_factor", 0.10) * stagnation_factor
        )
        composite_index = round(min(1.0, max(0.0, composite_index)), 3)

        # Categorize into deterioration band
        status = "LOW_DETERIORATION"
        for band_name, (low, high) in DETERIORATION_BANDS.items():
            if low <= composite_index <= high:
                status = band_name
                break

        return {
            "deterioration_index": composite_index,
            "deterioration_status": status,
            "sub_factors": {
                "storage_age_factor": round(age_factor, 3),
                "temperature_factor": round(temp_factor, 3),
                "organic_decay_factor": round(organic_decay_factor, 3),
                "oxygen_depletion_factor": round(oxygen_depletion_factor, 3),
                "stagnation_factor": round(stagnation_factor, 3)
            }
        }

    def evaluate_stagnation(
        self,
        idle_hours_since_outflow: float,
        storage_age_hours: float,
        deterioration_index: float,
        fill_percentage: float
    ) -> str:
        """
        Evaluate operational fluid stagnation status based on turnover intervals and storage duration.
        """
        if storage_age_hours <= 0.0 or fill_percentage <= 0.0:
            return STAGNATION_STATUS_NORMAL

        # Critical prolonged stagnation
        if idle_hours_since_outflow >= 36.0 or (idle_hours_since_outflow >= 24.0 and deterioration_index >= 0.50):
            return STAGNATION_STATUS_HIGH_RISK

        # Stagnant threshold
        if idle_hours_since_outflow >= STAGNATION_THRESHOLDS["HIGH_STAGNATION_HOURS"] or storage_age_hours >= 24.0:
            return STAGNATION_STATUS_STAGNANT

        # Low turnover threshold
        if idle_hours_since_outflow >= STAGNATION_THRESHOLDS["MAX_IDLE_HOURS"]:
            return STAGNATION_STATUS_LOW_TURNOVER

        return STAGNATION_STATUS_NORMAL

    def assess_shelf_life(
        self,
        tank_state: Dict[str, Any],
        initial_water_quality_status: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Perform complete shelf-life, deterioration, and operational action evaluation.
        
        Parameters
        ----------
        tank_state : dict
            State dictionary produced by StorageTank.get_state().
        initial_water_quality_status : str, optional
            Upstream safety status (e.g. 'NORMAL', 'SEWER_BYPASS_OVERRIDE', 'HIGH_RISK_REVIEW').
            
        Returns
        -------
        dict
            Canonical Phase 10 storage decision output schema.
        """
        level = float(tank_state.get("current_level_liters", 0.0))
        capacity = float(tank_state.get("capacity_liters", 1000.0))
        fill_pct = float(tank_state.get("fill_percentage", 0.0))
        age_hours = float(tank_state.get("storage_age_hours", 0.0))
        temp_c = float(tank_state.get("storage_temperature_C", 20.0))
        temp_source = str(tank_state.get("temperature_source", "SIMULATION_DEFAULT"))
        tank_id = str(tank_state.get("tank_id", "TANK_01"))

        # Compute hours since last outflow
        last_outflow_str = tank_state.get("last_outflow_timestamp")
        last_inflow_str = tank_state.get("last_inflow_timestamp")
        
        # Operational approximation for idle time
        idle_hours = age_hours
        if last_outflow_str is None and last_inflow_str is not None:
            idle_hours = age_hours
        elif last_outflow_str is not None:
            # If outflow occurred, use age as proxy or delta
            idle_hours = min(age_hours, 12.0)

        # 1. Compute composite deterioration index
        is_empty = (level <= 0.0)
        det_res = self.calculate_deterioration_index(
            storage_age_hours=age_hours,
            temperature_C=temp_c,
            initial_features=tank_state.get("current_quality_features"),
            idle_hours_since_outflow=idle_hours,
            is_empty=is_empty
        )
        det_index = det_res["deterioration_index"]
        det_status = det_res["deterioration_status"]

        # 2. Evaluate Stagnation
        stag_status = self.evaluate_stagnation(
            idle_hours_since_outflow=idle_hours,
            storage_age_hours=age_hours,
            deterioration_index=det_index,
            fill_percentage=fill_pct
        )

        # 3. Determine Shelf-Life Status
        # Scientific caveat: exact time is unvalidated in cross-sectional data
        if self.strict_shelf_life_validation:
            shelf_status = SHELF_LIFE_STATUS_NOT_VALIDATED
            estimated_remaining_hours = None
        else:
            # Operational status categorization
            if det_index < 0.25:
                shelf_status = SHELF_LIFE_STATUS_FRESH
            elif det_index < 0.50:
                shelf_status = SHELF_LIFE_STATUS_MONITOR
            elif det_index < 0.75:
                shelf_status = SHELF_LIFE_STATUS_AGING
            else:
                shelf_status = SHELF_LIFE_STATUS_HIGH_RISK
            # Do NOT invent exact shelf life numbers without longitudinal empirical validation
            estimated_remaining_hours = None

        # 4. Formulate Recommended Storage Action
        # Priority 1: Water quality safety override takes absolute precedence
        if initial_water_quality_status in ("SEWER_BYPASS_OVERRIDE", "HIGH_RISK_REVIEW"):
            rec_action = ACTION_SAFETY_REVIEW
        elif is_empty:
            rec_action = ACTION_CONTINUE_MONITORING
        elif det_index >= 0.75 or stag_status == STAGNATION_STATUS_HIGH_RISK:
            rec_action = ACTION_EMPTY_AND_REASSESS
        elif det_index >= 0.50:
            rec_action = ACTION_REVIEW_WATER_QUALITY
        elif det_index >= 0.25 or stag_status == STAGNATION_STATUS_STAGNANT:
            rec_action = ACTION_PRIORITIZE_USE
        elif stag_status == STAGNATION_STATUS_LOW_TURNOVER:
            rec_action = ACTION_REDUCE_STORAGE_TIME
        else:
            rec_action = ACTION_CONTINUE_MONITORING

        return {
            "tank_id": tank_id,
            "current_level_liters": round(level, 2),
            "fill_percentage": round(fill_pct, 2),
            "storage_age_hours": round(age_hours, 2),
            "temperature_C": round(temp_c, 1),
            "temperature_source": temp_source,
            "deterioration_index": det_index,
            "deterioration_status": det_status,
            "stagnation_status": stag_status,
            "shelf_life_status": shelf_status,
            "estimated_remaining_time_hours": estimated_remaining_hours,
            "microbial_risk_status": MICROBIAL_RISK_STATUS_DEFAULT,
            "recommended_storage_action": rec_action,
            "sub_factors": det_res["sub_factors"]
        }
