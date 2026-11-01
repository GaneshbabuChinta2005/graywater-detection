"""
Context Rules for Environmental Weather and Storage Tank Arbitration
AI-Driven Intelligent Greywater Management and Smart Reuse Routing System

Applies meteorological and storage state constraints without modifying underlying
water quality safety classifications.
"""

from typing import Dict, Any, Tuple, List, Optional
import routing.reason_codes as rc
from routing.decision_schema import (
    ACTION_ALLOW_ROUTE,
    ACTION_DEFER_ROUTE,
    ACTION_STORE_FOR_LATER,
    ACTION_REVIEW_REQUIRED,
    ROUTE_SEWER_BYPASS,
    ROUTE_BIO_FILTRATION,
    ROUTE_RESTRICTED_IRRIGATION,
    ROUTE_INDOOR_REUSE
)
from context.config import (
    HIGH_RAINFALL_THRESHOLD_MM,
    HIGH_PRECIP_PROBABILITY_THRESHOLD,
    FREEZING_TEMP_THRESHOLD_C,
    TORRENTIAL_WASHOUT_RAIN_MM
)
from storage.config import (
    STAGNATION_STATUS_HIGH_RISK,
    STAGNATION_STATUS_STAGNANT,
    STAGNATION_STATUS_LOW_TURNOVER
)


class ContextArbitrationEngine:
    """
    Arbitrates environmental weather and storage deterioration constraints.
    """
    def __init__(
        self,
        high_rainfall_threshold_mm: float = HIGH_RAINFALL_THRESHOLD_MM,
        high_precip_prob_threshold: float = HIGH_PRECIP_PROBABILITY_THRESHOLD,
        freezing_temp_threshold_c: float = FREEZING_TEMP_THRESHOLD_C
    ):
        self.high_rainfall_threshold_mm = high_rainfall_threshold_mm
        self.high_precip_prob_threshold = high_precip_prob_threshold
        self.freezing_temp_threshold_c = freezing_temp_threshold_c

    def evaluate_weather_context(
        self,
        route_name: str,
        weather_data: Optional[Dict[str, Any]]
    ) -> Tuple[str, str, List[str]]:
        """
        Evaluate weather impact on the designated route.
        
        Returns
        -------
        tuple:
            - weather_status: 'FAVORABLE' | 'UNFAVORABLE' | 'NEUTRAL' | 'UNAVAILABLE'
            - weather_action: 'ALLOW_ROUTE' | 'DEFER_ROUTE' | 'STORE_FOR_LATER' | 'REVIEW_REQUIRED'
            - reason_codes: list of str
        """
        if not weather_data or weather_data.get("weather_status") == "UNAVAILABLE":
            return "UNAVAILABLE", ACTION_ALLOW_ROUTE, [rc.WEATHER_UNAVAILABLE]

        rain_mm = float(weather_data.get("rainfall_mm", 0.0))
        precip_prob = float(weather_data.get("precipitation_probability", 0.0))
        temp_c = float(weather_data.get("temperature_C", 20.0))
        codes = []

        # 1. Restricted Irrigation Context
        if route_name == ROUTE_RESTRICTED_IRRIGATION:
            if rain_mm >= self.high_rainfall_threshold_mm or precip_prob >= self.high_precip_prob_threshold:
                if rain_mm >= self.high_rainfall_threshold_mm:
                    codes.append(rc.HIGH_RAINFALL)
                if precip_prob >= self.high_precip_prob_threshold:
                    codes.append(rc.HIGH_PRECIP_PROBABILITY)
                codes.append(rc.IRRIGATION_DEFERRED)
                codes.append(rc.WEATHER_UNFAVORABLE)
                return "UNFAVORABLE", ACTION_STORE_FOR_LATER, codes
            elif temp_c < self.freezing_temp_threshold_c:
                codes.append(rc.FREEZING_TEMPERATURE)
                codes.append(rc.IRRIGATION_DEFERRED)
                codes.append(rc.WEATHER_UNFAVORABLE)
                return "UNFAVORABLE", ACTION_DEFER_ROUTE, codes
            else:
                codes.append(rc.WEATHER_FAVORABLE)
                return "FAVORABLE", ACTION_ALLOW_ROUTE, codes

        # 2. Indoor Reuse Context (Hydraulically Decoupled)
        elif route_name == ROUTE_INDOOR_REUSE:
            codes.append(rc.INDOOR_DECOUPLED)
            return "NEUTRAL", ACTION_ALLOW_ROUTE, codes

        # 3. Bio-filtration Context
        elif route_name == ROUTE_BIO_FILTRATION:
            if rain_mm >= TORRENTIAL_WASHOUT_RAIN_MM:
                codes.append(rc.HIGH_RAINFALL)
                codes.append(rc.WEATHER_UNFAVORABLE)
                return "UNFAVORABLE", ACTION_REVIEW_REQUIRED, codes
            return "NEUTRAL", ACTION_ALLOW_ROUTE, [rc.WEATHER_FAVORABLE]

        # 4. Sewer Bypass (Weather has zero effect)
        elif route_name == ROUTE_SEWER_BYPASS:
            return "NEUTRAL", ACTION_ALLOW_ROUTE, []

        return "NEUTRAL", ACTION_ALLOW_ROUTE, []

    def evaluate_storage_context(
        self,
        route_name: str,
        storage_data: Optional[Dict[str, Any]]
    ) -> Tuple[str, str, List[str]]:
        """
        Evaluate storage deterioration and stagnation impact on the designated route.
        
        Returns
        -------
        tuple:
            - storage_status: 'NORMAL' | 'AGING' | 'HIGH_DETERIORATION' | 'UNAVAILABLE'
            - storage_action: 'ALLOW_ROUTE' | 'REVIEW_REQUIRED' | 'PRIORITIZE_USE' | 'EMPTY_AND_REASSESS'
            - reason_codes: list of str
        """
        if not storage_data:
            return "UNAVAILABLE", ACTION_ALLOW_ROUTE, [rc.STORAGE_UNAVAILABLE]

        det_index = storage_data.get("deterioration_index")
        stag_status = storage_data.get("stagnation_status", "NORMAL")
        codes = []

        if det_index is None:
            return "UNAVAILABLE", ACTION_ALLOW_ROUTE, [rc.STORAGE_UNAVAILABLE]

        det_val = float(det_index)

        # Critical or High Deterioration
        if det_val >= 0.75 or stag_status == STAGNATION_STATUS_HIGH_RISK:
            codes.append(rc.STORAGE_HIGH_DETERIORATION)
            if stag_status == STAGNATION_STATUS_HIGH_RISK:
                codes.append(rc.STAGNATION_DETECTED)
            return "HIGH_DETERIORATION", ACTION_REVIEW_REQUIRED, codes

        # Moderate Aging
        elif det_val >= 0.50 or stag_status == STAGNATION_STATUS_STAGNANT:
            codes.append(rc.STORAGE_AGING)
            if stag_status == STAGNATION_STATUS_STAGNANT:
                codes.append(rc.STAGNATION_DETECTED)
            codes.append(rc.STORAGE_REVIEW)
            return "AGING", ACTION_REVIEW_REQUIRED, codes

        elif det_val >= 0.25 or stag_status == STAGNATION_STATUS_LOW_TURNOVER:
            codes.append(rc.STORAGE_AGING)
            return "AGING", ACTION_ALLOW_ROUTE, codes

        codes.append(rc.STORAGE_NORMAL)
        return "NORMAL", ACTION_ALLOW_ROUTE, codes
