"""
Smart Context-Aware Routing Engine Package
AI-Driven Intelligent Greywater Management and Smart Reuse Routing System
"""

from routing.decision_schema import (
    CLASS_SEWER_BYPASS,
    CLASS_BIO_FILTRATION,
    CLASS_RESTRICTED_IRRIGATION,
    CLASS_INDOOR_REUSE,
    ROUTE_SEWER_BYPASS,
    ROUTE_BIO_FILTRATION,
    ROUTE_RESTRICTED_IRRIGATION,
    ROUTE_INDOOR_REUSE,
    CLASS_MAP,
    NAME_TO_CLASS,
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
    SAFETY_CRITICAL,
    SafetyFlag,
    RoutingInput,
    FinalDecisionOutput
)
from routing.safety_rules import WaterQualitySafetyEngine, evaluate_safety_conditions
from routing.context_rules import ContextArbitrationEngine
from routing.routing_engine import SmartRoutingEngine
from routing.inference_pipeline import ContextAwareRoutingPipeline
from routing.routing_rules import evaluate_routing, DEFAULT_THRESHOLDS

__all__ = [
    "CLASS_SEWER_BYPASS",
    "CLASS_BIO_FILTRATION",
    "CLASS_RESTRICTED_IRRIGATION",
    "CLASS_INDOOR_REUSE",
    "ROUTE_SEWER_BYPASS",
    "ROUTE_BIO_FILTRATION",
    "ROUTE_RESTRICTED_IRRIGATION",
    "ROUTE_INDOOR_REUSE",
    "CLASS_MAP",
    "NAME_TO_CLASS",
    "ACTION_ALLOW_ROUTE",
    "ACTION_DEFER_ROUTE",
    "ACTION_STORE_FOR_LATER",
    "ACTION_DISCHARGE_TO_SEWER",
    "ACTION_PROCEED_WITH_TREATMENT",
    "ACTION_REVIEW_REQUIRED",
    "ACTION_SAFETY_OVERRIDE",
    "DECISION_STATUS_APPROVED",
    "DECISION_STATUS_ADVISORY",
    "DECISION_STATUS_DEFERRED",
    "DECISION_STATUS_OVERRIDDEN",
    "DECISION_STATUS_FLAGGED_FOR_REVIEW",
    "SAFETY_SAFE_FOR_MODEL_REVIEW",
    "SAFETY_REVIEW_REQUIRED",
    "SAFETY_HIGH_RISK",
    "SAFETY_CRITICAL",
    "SafetyFlag",
    "RoutingInput",
    "FinalDecisionOutput",
    "WaterQualitySafetyEngine",
    "evaluate_safety_conditions",
    "ContextArbitrationEngine",
    "SmartRoutingEngine",
    "ContextAwareRoutingPipeline",
    "evaluate_routing",
    "DEFAULT_THRESHOLDS"
]
