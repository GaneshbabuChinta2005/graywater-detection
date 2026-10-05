"""
Decision Schema and Structured Types for the Smart Context-Aware Routing Engine
AI-Driven Intelligent Greywater Management and Smart Reuse Routing System

Defines unified input structures, safety flags, operational routing classes,
actions, decision statuses, and the canonical output schema.
"""

from typing import Dict, Any, List, Optional, Union
from dataclasses import dataclass, field, asdict

# Canonical Four-Class Routing Constants (Project Operational Categories)
CLASS_SEWER_BYPASS = 0
CLASS_BIO_FILTRATION = 1
CLASS_RESTRICTED_IRRIGATION = 2
CLASS_INDOOR_REUSE = 3

ROUTE_SEWER_BYPASS = "Sewer Bypass"
ROUTE_BIO_FILTRATION = "Bio-filtration"
ROUTE_RESTRICTED_IRRIGATION = "Restricted Irrigation"
ROUTE_INDOOR_REUSE = "Indoor Reuse"

CLASS_MAP = {
    0: ROUTE_SEWER_BYPASS,
    1: ROUTE_BIO_FILTRATION,
    2: ROUTE_RESTRICTED_IRRIGATION,
    3: ROUTE_INDOOR_REUSE
}

NAME_TO_CLASS = {
    ROUTE_SEWER_BYPASS: 0,
    ROUTE_BIO_FILTRATION: 1,
    ROUTE_RESTRICTED_IRRIGATION: 2,
    ROUTE_INDOOR_REUSE: 3,
    "SEWER_BYPASS": 0,
    "BIO_FILTRATION": 1,
    "RESTRICTED_IRRIGATION": 2,
    "INDOOR_REUSE": 3
}

# Operational Action Categories (Separated from Route Class)
ACTION_ALLOW_ROUTE = "ALLOW_ROUTE"
ACTION_DEFER_ROUTE = "DEFER_ROUTE"
ACTION_STORE_FOR_LATER = "STORE_FOR_LATER"
ACTION_DISCHARGE_TO_SEWER = "DISCHARGE_TO_SEWER"
ACTION_PROCEED_WITH_TREATMENT = "PROCEED_WITH_TREATMENT"
ACTION_REVIEW_REQUIRED = "REVIEW_REQUIRED"
ACTION_SAFETY_OVERRIDE = "SAFETY_OVERRIDE"

# Overall Decision Statuses
DECISION_STATUS_APPROVED = "APPROVED"
DECISION_STATUS_ADVISORY = "ADVISORY"
DECISION_STATUS_DEFERRED = "DEFERRED"
DECISION_STATUS_OVERRIDDEN = "OVERRIDDEN"
DECISION_STATUS_FLAGGED_FOR_REVIEW = "FLAGGED_FOR_REVIEW"

# Safety Levels
SAFETY_SAFE_FOR_MODEL_REVIEW = "SAFE_FOR_MODEL_REVIEW"
SAFETY_REVIEW_REQUIRED = "REVIEW_REQUIRED"
SAFETY_HIGH_RISK = "HIGH_RISK"
SAFETY_CRITICAL = "CRITICAL"


@dataclass
class SafetyFlag:
    """Individual parameter safety breach record."""
    parameter: str
    observed_value: float
    threshold: Any
    reason: str
    severity: str  # "LOW", "MEDIUM", "HIGH", "CRITICAL"

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


@dataclass
class RoutingInput:
    """Unified input encapsulation for the smart routing decision engine."""
    # Water-Quality Features
    greywater_source: str
    pH: float
    TEMP_C: float
    SAL_ppt: float
    TUR_NTU: float
    DS_mg_L: float
    TDS_mg_L: float
    TSS_mg_L: float
    COND_uS_cm: float
    DO_mg_L: float
    BOD_mg_L: float
    COD_mg_L: float
    NH4F_mg_L: float
    NO3_mg_L: float
    K_mg_L: float
    E_coli_CFU_100mL: float

    # Operational & Tank Telemetry (Optional / Defaults provided)
    timestamp: str = "2026-10-02 12:00:00 UTC"
    flow_rate: float = 12.0
    tank_level_liters: Optional[float] = None
    tank_capacity_liters: float = 1000.0
    storage_age_hours: Optional[float] = None
    storage_temperature_C: Optional[float] = None
    deterioration_index: Optional[float] = None
    stagnation_status: Optional[str] = None
    storage_status: Optional[str] = None

    # Weather Context (Optional / Defaults provided)
    weather_temperature_C: Optional[float] = None
    weather_humidity: Optional[float] = None
    weather_rainfall_mm: Optional[float] = None
    weather_precipitation_probability: Optional[float] = None
    weather_condition: Optional[str] = None
    weather_status: Optional[str] = None

    # Upstream Model Signals (If precomputed)
    predicted_class: Optional[int] = None
    class_probabilities: Optional[Dict[str, float]] = None
    prediction_confidence: Optional[float] = None
    anomaly_prediction: Optional[bool] = None
    anomaly_score: Optional[float] = None


@dataclass
class FinalDecisionOutput:
    """Canonical Phase 11 smart routing decision response schema."""
    timestamp: str
    source: str

    predicted_route: str
    predicted_class: int
    prediction_confidence: float

    anomaly_status: str
    anomaly_score: float

    safety_status: str
    safety_flags: List[Dict[str, Any]]

    weather_status: str
    weather_action: str

    storage_status: str
    deterioration_index: Optional[float]
    stagnation_status: str

    final_route: str
    final_action: str
    decision_status: str

    override_applied: bool
    override_reason: str

    reason_codes: List[str]
    human_readable_reason: str

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)
