"""
Weather Context and Environmental Decision Arbitration Engine
AI-Driven Intelligent Greywater Management and Smart Reuse Routing System

Arbitrates between initial water quality routing predictions and real-time
meteorological context (rainfall, precipitation probability, freeze risk)
under strict safety hierarchy.

SAFETY AXIOM:
Weather is a contextual optimization variable. Weather information provides
operational context and does not independently establish water safety.
Weather MUST NEVER override a severe water-quality safety condition.
"""

from context.config import (
    HIGH_RAINFALL_THRESHOLD_MM,
    HIGH_PRECIP_PROBABILITY_THRESHOLD,
    FREEZING_TEMP_THRESHOLD_C,
    TORRENTIAL_WASHOUT_RAIN_MM
)

ROUTE_NAMES = {
    0: "Sewer Bypass",
    1: "Bio-filtration",
    2: "Restricted Irrigation",
    3: "Indoor Reuse"
}


class WeatherStatus:
    FAVORABLE = "FAVORABLE"
    UNFAVORABLE = "UNFAVORABLE"
    NEUTRAL = "NEUTRAL"
    UNAVAILABLE = "UNAVAILABLE"


class WeatherAdjustment:
    NONE = "NONE"
    SUPPRESS_IRRIGATION = "SUPPRESS_IRRIGATION"
    DEFER_IRRIGATION = "DEFER_IRRIGATION"
    MONITOR_OUTDOOR_RUNOFF = "MONITOR_OUTDOOR_RUNOFF"


class FinalContextRecommendation:
    ALLOW_ROUTE = "ALLOW_ROUTE"
    DEFER_ROUTE = "DEFER_ROUTE"
    STORE_FOR_LATER = "STORE_FOR_LATER"
    REVIEW_REQUIRED = "REVIEW_REQUIRED"
    SAFETY_OVERRIDE = "SAFETY_OVERRIDE"


class WeatherEvaluationResult(dict):
    """Structured dictionary wrapper for weather evaluation outputs."""
    pass


def normalize_route_name(route_input):
    """Convert integer or string routing class to canonical destination name."""
    if isinstance(route_input, int):
        return ROUTE_NAMES.get(route_input, "Unknown")
    elif isinstance(route_input, str):
        # Match case-insensitively
        for k, name in ROUTE_NAMES.items():
            if route_input.lower().replace(" ", "_") == name.lower().replace(" ", "_"):
                return name
        return route_input
    return "Unknown"


def evaluate_weather_context(initial_route, weather_data, water_quality_status=None):
    """
    Evaluate weather conditions against the initial routing decision under strict safety hierarchy.
    
    Parameters
    ----------
    initial_route : int or str
        Initial route from ML/rules (0: Sewer, 1: Bio-filtration, 2: Irrigation, 3: Indoor).
    weather_data : dict
        Normalized weather record.
    water_quality_status : str or dict, optional
        Safety status from anomaly detector ('NORMAL', 'ANOMALY_REVIEW', 'HIGH_RISK_REVIEW', 'SEWER_BYPASS_OVERRIDE').
        
    Returns
    -------
    dict
        'weather_status': 'FAVORABLE' | 'UNFAVORABLE' | 'NEUTRAL' | 'UNAVAILABLE',
        'weather_adjustment': str,
        'final_context_recommendation': 'ALLOW_ROUTE' | 'DEFER_ROUTE' | 'STORE_FOR_LATER' | 'REVIEW_REQUIRED' | 'SAFETY_OVERRIDE',
        'reason': str
    """
    route_name = normalize_route_name(initial_route)
    
    # Extract safety status string if passed as dict
    status_str = ""
    if isinstance(water_quality_status, dict):
        status_str = water_quality_status.get("safety_status", "")
    elif isinstance(water_quality_status, str):
        status_str = water_quality_status
        
    # =========================================================================
    # PRIORITY 1 & 2: SEVERE WATER-QUALITY SAFETY & ANOMALY CUTOFFS TAKE PRECEDENCE
    # =========================================================================
    if route_name == "Sewer Bypass" or status_str in ("SEWER_BYPASS_OVERRIDE", "HIGH_RISK_REVIEW"):
        return {
            "weather_status": "NEUTRAL",
            "weather_adjustment": "NONE",
            "final_context_recommendation": "SAFETY_OVERRIDE",
            "reason": (
                "SAFETY PRIORITY PRECEDENCE: Severe water-quality or critical hazard condition detected. "
                "Sewer Bypass is an absolute health cutoff and CANNOT be overridden by favorable weather."
            )
        }
        
    # =========================================================================
    # PRIORITY 3: WEATHER DATA AVAILABILITY CHECK
    # =========================================================================
    if not weather_data or weather_data.get("weather_status") == "UNAVAILABLE":
        err_msg = weather_data.get("error_reason", "Weather API unreachable.") if weather_data else "No weather data."
        return {
            "weather_status": "UNAVAILABLE",
            "weather_adjustment": "NONE",
            "final_context_recommendation": "REVIEW_REQUIRED",
            "reason": (
                f"WEATHER TELEMETRY UNAVAILABLE: {err_msg} "
                f"Proceeding safely with ML baseline route '{route_name}' under operator advisory."
            )
        }
        
    rainfall = float(weather_data.get("rainfall_mm", 0.0))
    precip_prob = float(weather_data.get("precipitation_probability", 0.0))
    temp_c = float(weather_data.get("temperature_C", 20.0))
    
    # =========================================================================
    # PRIORITY 4: ROUTE-SPECIFIC METEOROLOGICAL CONTEXT
    # =========================================================================
    
    # --- 1. RESTRICTED IRRIGATION (Class 2) ---
    if route_name == "Restricted Irrigation":
        # Check rainfall and precipitation probability
        if rainfall >= HIGH_RAINFALL_THRESHOLD_MM or precip_prob >= HIGH_PRECIP_PROBABILITY_THRESHOLD:
            return {
                "weather_status": "UNFAVORABLE",
                "weather_adjustment": "SUPPRESS_IRRIGATION",
                "final_context_recommendation": "STORE_FOR_LATER",
                "reason": (
                    f"SOIL SATURATION SUPPRESSION: Ambient rainfall ({rainfall:.1f} mm) or forecast precipitation "
                    f"probability ({precip_prob:.1f}%) exceeds threshold. Surface application risks ponding and "
                    f"nutrient runoff. Deferring irrigation; greywater diverted to storage."
                )
            }
        elif temp_c < FREEZING_TEMP_THRESHOLD_C:
            return {
                "weather_status": "UNFAVORABLE",
                "weather_adjustment": "DEFER_IRRIGATION",
                "final_context_recommendation": "DEFER_ROUTE",
                "reason": (
                    f"FREEZING TEMPERATURE RISK: Ambient temperature ({temp_c:.1f} °C < {FREEZING_TEMP_THRESHOLD_C} °C). "
                    f"Risk of pipe freeze and frozen surface soil impermeable to water. Irrigation deferred."
                )
            }
        else:
            return {
                "weather_status": "FAVORABLE",
                "weather_adjustment": "NONE",
                "final_context_recommendation": "ALLOW_ROUTE",
                "reason": (
                    f"FAVORABLE IRRIGATION CONDITIONS: Low rainfall ({rainfall:.1f} mm) and low precipitation probability "
                    f"({precip_prob:.1f}%) with warm temperature ({temp_c:.1f} °C). Direct irrigation approved."
                )
            }
            
    # --- 2. INDOOR REUSE (Class 3) ---
    elif route_name == "Indoor Reuse":
        # Indoor toilet flushing / non-potable domestic circulation is hydraulically decoupled from rain
        return {
            "weather_status": "NEUTRAL",
            "weather_adjustment": "NONE",
            "final_context_recommendation": "ALLOW_ROUTE",
            "reason": (
                "INDOOR HYDRAULIC DECOUPLING: Non-potable indoor reuse (toilet flushing, laundry) operates within "
                "enclosed plumbing and is not inhibited by ambient precipitation or outdoor weather."
            )
        }
        
    # --- 3. BIO-FILTRATION (Class 1) ---
    elif route_name == "Bio-filtration":
        if rainfall >= TORRENTIAL_WASHOUT_RAIN_MM:
            return {
                "weather_status": "UNFAVORABLE",
                "weather_adjustment": "MONITOR_OUTDOOR_RUNOFF",
                "final_context_recommendation": "REVIEW_REQUIRED",
                "reason": (
                    f"TORRENTIAL STORM ADVISORY: Extreme rainfall ({rainfall:.1f} mm >= {TORRENTIAL_WASHOUT_RAIN_MM} mm) "
                    f"poses hydraulic washout risk to outdoor bio-filter reed beds. Operator review required."
                )
            }
        else:
            return {
                "weather_status": "NEUTRAL",
                "weather_adjustment": "NONE",
                "final_context_recommendation": "ALLOW_ROUTE",
                "reason": "Nominal outdoor meteorological profile. Secondary biological filtration approved."
            }
            
    # Fallback
    return {
        "weather_status": "NEUTRAL",
        "weather_adjustment": "NONE",
        "final_context_recommendation": "ALLOW_ROUTE",
        "reason": f"No specific weather constraint applicable to '{route_name}'."
    }
