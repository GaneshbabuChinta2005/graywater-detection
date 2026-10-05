"""
Comprehensive Unit Tests for the Smart Context-Aware Routing Engine
AI-Driven Intelligent Greywater Management and Smart Reuse Routing System

Test Coverage:
1. Normal sample -> model route retained
2. Critical water quality -> Sewer Bypass safety override
3. Anomaly only -> Anomaly Review (model route retained with advisory)
4. Anomaly + critical contamination -> Sewer Bypass override
5. Irrigation + high rainfall -> Irrigation Deferred (action STORE_FOR_LATER / DEFER_ROUTE)
6. Indoor reuse + rain -> no automatic weather override (hydraulic decoupling)
7. High storage deterioration -> Storage Review
8. Low model confidence -> Review Required
9. Conflicting conditions -> strict priority hierarchy applied
10. Missing weather -> routing operates safely with UNAVAILABLE status
11. Missing storage -> routing operates safely with UNAVAILABLE status
12. Missing ML model -> clear MODEL_UNAVAILABLE response
13. Safety Invariant: Favorable weather can NEVER override CRITICAL safety
14. Anomaly Invariant: Statistical anomaly alone can NEVER automatically force Sewer Bypass
"""

import pytest

from routing.decision_schema import (
    RoutingInput,
    ROUTE_SEWER_BYPASS,
    ROUTE_BIO_FILTRATION,
    ROUTE_RESTRICTED_IRRIGATION,
    ROUTE_INDOOR_REUSE,
    ACTION_ALLOW_ROUTE,
    ACTION_DEFER_ROUTE,
    ACTION_STORE_FOR_LATER,
    ACTION_DISCHARGE_TO_SEWER,
    ACTION_SAFETY_OVERRIDE,
    ACTION_REVIEW_REQUIRED,
    DECISION_STATUS_APPROVED,
    DECISION_STATUS_ADVISORY,
    DECISION_STATUS_DEFERRED,
    DECISION_STATUS_OVERRIDDEN,
    DECISION_STATUS_FLAGGED_FOR_REVIEW,
    SAFETY_SAFE_FOR_MODEL_REVIEW,
    SAFETY_CRITICAL,
    SAFETY_HIGH_RISK
)
import routing.reason_codes as rc
from routing.routing_engine import SmartRoutingEngine


@pytest.fixture
def clean_bathroom_input():
    return RoutingInput(
        greywater_source="Bathroom",
        pH=7.2, TEMP_C=22.0, SAL_ppt=0.15, TUR_NTU=10.0, DS_mg_L=120.0,
        TDS_mg_L=130.0, TSS_mg_L=15.0, COND_uS_cm=200.0, DO_mg_L=5.8,
        BOD_mg_L=22.0, COD_mg_L=48.0, NH4F_mg_L=2.0, NO3_mg_L=3.5,
        K_mg_L=5.0, E_coli_CFU_100mL=800.0
    )


@pytest.fixture
def moderate_laundry_input():
    return RoutingInput(
        greywater_source="Laundry",
        pH=7.6, TEMP_C=25.0, SAL_ppt=0.30, TUR_NTU=42.0, DS_mg_L=350.0,
        TDS_mg_L=380.0, TSS_mg_L=55.0, COND_uS_cm=490.0, DO_mg_L=3.4,
        BOD_mg_L=80.0, COD_mg_L=190.0, NH4F_mg_L=5.5, NO3_mg_L=6.0,
        K_mg_L=12.0, E_coli_CFU_100mL=5000.0
    )


# =============================================================================
# TEST 1: Normal Sample -> Model Route Retained
# =============================================================================
def test_01_normal_sample_model_retained(clean_bathroom_input):
    """Verify that a normal sample with high confidence retains the ML recommendation."""
    engine = SmartRoutingEngine()
    dec = engine.evaluate(
        routing_input=clean_bathroom_input,
        predicted_class=3,  # Indoor Reuse
        prediction_confidence=0.92,
        is_anomaly=False,
        weather_data={"rainfall_mm": 0.0, "precipitation_probability": 5.0, "weather_status": "LIVE"},
        storage_data={"deterioration_index": 0.05, "stagnation_status": "NORMAL"}
    )
    assert dec.final_route == ROUTE_INDOOR_REUSE
    assert dec.decision_status == DECISION_STATUS_APPROVED
    assert dec.override_applied is False
    assert rc.ROUTE_INDOOR_REUSE in dec.reason_codes
    assert rc.WQ_ACCEPTABLE in dec.reason_codes


# =============================================================================
# TEST 2: Critical Water Quality -> Sewer Bypass Override
# =============================================================================
def test_02_critical_water_quality_sewer_bypass(clean_bathroom_input):
    """Verify that extreme pathogen count forces Sewer Bypass override regardless of ML."""
    engine = SmartRoutingEngine()
    # Inject acute biological hazard (E. coli >= 500,000 CFU)
    clean_bathroom_input.E_coli_CFU_100mL = 850000.0

    dec = engine.evaluate(
        routing_input=clean_bathroom_input,
        predicted_class=3,  # XGBoost naively predicts Indoor Reuse
        prediction_confidence=0.88,
        is_anomaly=False,
        weather_data={"rainfall_mm": 0.0, "precipitation_probability": 0.0, "weather_status": "LIVE"}
    )
    assert dec.final_route == ROUTE_SEWER_BYPASS
    assert dec.final_action == ACTION_SAFETY_OVERRIDE
    assert dec.decision_status == DECISION_STATUS_OVERRIDDEN
    assert dec.override_applied is True
    assert rc.OVERRIDE_SAFETY_CRITICAL in dec.reason_codes
    assert rc.WQ_HIGH_ECOLI in dec.reason_codes


# =============================================================================
# TEST 3: Anomaly Only -> Anomaly Review (Model Route Retained)
# =============================================================================
def test_03_anomaly_only_review(moderate_laundry_input):
    """Verify that statistical anomaly alone does NOT force Sewer Bypass."""
    engine = SmartRoutingEngine()
    dec = engine.evaluate(
        routing_input=moderate_laundry_input,
        predicted_class=2,  # Restricted Irrigation
        prediction_confidence=0.84,
        is_anomaly=True,  # Statistical anomaly flagged
        anomaly_score=0.15,
        weather_data={"rainfall_mm": 0.0, "precipitation_probability": 10.0, "weather_status": "LIVE"}
    )
    # Must retain model route under advisory review
    assert dec.final_route == ROUTE_RESTRICTED_IRRIGATION
    assert dec.anomaly_status == "ANOMALY_REVIEW"
    assert dec.decision_status == DECISION_STATUS_ADVISORY
    assert dec.override_applied is False
    assert rc.ANOMALY_REVIEW in dec.reason_codes


# =============================================================================
# TEST 4: Anomaly + Critical Contamination -> Sewer Bypass
# =============================================================================
def test_04_anomaly_plus_critical_contamination(moderate_laundry_input):
    """Verify that anomaly accompanied by acute hazard forces Sewer Bypass."""
    engine = SmartRoutingEngine()
    # Severe COD dump + anomaly
    moderate_laundry_input.COD_mg_L = 920.0  # Acute COD cutoff >= 800

    dec = engine.evaluate(
        routing_input=moderate_laundry_input,
        predicted_class=1,  # Bio-filtration
        prediction_confidence=0.75,
        is_anomaly=True,
        anomaly_score=0.25
    )
    assert dec.final_route == ROUTE_SEWER_BYPASS
    assert dec.final_action == ACTION_SAFETY_OVERRIDE
    assert dec.override_applied is True


# =============================================================================
# TEST 5: Irrigation + High Rainfall -> Irrigation Deferred
# =============================================================================
def test_05_irrigation_high_rainfall_deferred(moderate_laundry_input):
    """Verify that heavy rainfall defers irrigation without changing route class."""
    engine = SmartRoutingEngine()
    dec = engine.evaluate(
        routing_input=moderate_laundry_input,
        predicted_class=2,  # Restricted Irrigation
        prediction_confidence=0.89,
        is_anomaly=False,
        weather_data={"rainfall_mm": 18.0, "precipitation_probability": 85.0, "weather_status": "LIVE"}
    )
    # Route remains Restricted Irrigation; action becomes STORE_FOR_LATER
    assert dec.final_route == ROUTE_RESTRICTED_IRRIGATION
    assert dec.final_action in (ACTION_STORE_FOR_LATER, ACTION_DEFER_ROUTE)
    assert dec.decision_status == DECISION_STATUS_DEFERRED
    assert rc.HIGH_RAINFALL in dec.reason_codes
    assert rc.IRRIGATION_DEFERRED in dec.reason_codes


# =============================================================================
# TEST 6: Indoor Reuse + Rain -> No Automatic Weather Override
# =============================================================================
def test_06_indoor_reuse_rain_decoupled(clean_bathroom_input):
    """Verify that indoor toilet flushing is unaffected by heavy rainfall."""
    engine = SmartRoutingEngine()
    dec = engine.evaluate(
        routing_input=clean_bathroom_input,
        predicted_class=3,  # Indoor Reuse
        prediction_confidence=0.91,
        is_anomaly=False,
        weather_data={"rainfall_mm": 35.0, "precipitation_probability": 95.0, "weather_status": "LIVE"}
    )
    assert dec.final_route == ROUTE_INDOOR_REUSE
    assert dec.final_action == ACTION_ALLOW_ROUTE
    assert dec.decision_status == DECISION_STATUS_APPROVED
    assert rc.INDOOR_DECOUPLED in dec.reason_codes


# =============================================================================
# TEST 7: High Storage Deterioration -> Storage Review
# =============================================================================
def test_07_high_storage_deterioration_review(moderate_laundry_input):
    """Verify that high deterioration index flags storage review."""
    engine = SmartRoutingEngine()
    dec = engine.evaluate(
        routing_input=moderate_laundry_input,
        predicted_class=2,  # Restricted Irrigation
        prediction_confidence=0.86,
        is_anomaly=False,
        weather_data={"rainfall_mm": 0.0, "precipitation_probability": 5.0, "weather_status": "LIVE"},
        storage_data={"deterioration_index": 0.78, "stagnation_status": "HIGH_STAGNATION_RISK", "storage_age_hours": 42.0}
    )
    assert dec.storage_status == "HIGH_DETERIORATION"
    assert dec.final_action == ACTION_REVIEW_REQUIRED
    assert dec.decision_status == DECISION_STATUS_FLAGGED_FOR_REVIEW
    assert rc.STORAGE_HIGH_DETERIORATION in dec.reason_codes


# =============================================================================
# TEST 8: Low Model Confidence -> Review Required
# =============================================================================
def test_08_low_model_confidence_review(clean_bathroom_input):
    """Verify that low ML prediction confidence flags decision for review."""
    engine = SmartRoutingEngine(min_acceptable_confidence=0.60)
    dec = engine.evaluate(
        routing_input=clean_bathroom_input,
        predicted_class=3,
        prediction_confidence=0.45,  # Below 0.60 threshold
        is_anomaly=False
    )
    assert dec.final_action == ACTION_REVIEW_REQUIRED
    assert dec.decision_status == DECISION_STATUS_FLAGGED_FOR_REVIEW
    assert rc.MODEL_LOW_CONFIDENCE in dec.reason_codes


# =============================================================================
# TEST 9: Conflicting Conditions -> Priority Hierarchy Applied
# =============================================================================
def test_09_conflicting_conditions_priority_hierarchy(clean_bathroom_input):
    """
    Conflict test:
    ML = Indoor Reuse (Priority 3)
    Weather = Favorable (Priority 5)
    Storage = Stagnant (Priority 4)
    Water Quality = Severe Acid Dump pH 4.5 (Priority 1)
    Outcome: Priority 1 MUST win -> Sewer Bypass.
    """
    engine = SmartRoutingEngine()
    clean_bathroom_input.pH = 4.5  # Critical acid dump

    dec = engine.evaluate(
        routing_input=clean_bathroom_input,
        predicted_class=3,  # Indoor Reuse
        prediction_confidence=0.95,
        is_anomaly=False,
        weather_data={"rainfall_mm": 0.0, "precipitation_probability": 0.0, "weather_status": "LIVE"},
        storage_data={"deterioration_index": 0.10, "stagnation_status": "NORMAL"}
    )
    assert dec.final_route == ROUTE_SEWER_BYPASS
    assert dec.final_action == ACTION_SAFETY_OVERRIDE
    assert dec.override_applied is True
    assert rc.OVERRIDE_SAFETY_CRITICAL in dec.reason_codes


# =============================================================================
# TEST 10: Missing Weather -> Routing Still Operates
# =============================================================================
def test_10_missing_weather_operates_safely(clean_bathroom_input):
    """Verify that pipeline operates gracefully when weather telemetry is unavailable."""
    engine = SmartRoutingEngine()
    dec = engine.evaluate(
        routing_input=clean_bathroom_input,
        predicted_class=3,
        prediction_confidence=0.90,
        is_anomaly=False,
        weather_data=None  # Weather missing
    )
    assert dec.weather_status == "UNAVAILABLE"
    assert dec.final_route == ROUTE_INDOOR_REUSE
    assert rc.WEATHER_UNAVAILABLE in dec.reason_codes


# =============================================================================
# TEST 11: Missing Storage Information -> Routing Still Operates
# =============================================================================
def test_11_missing_storage_operates_safely(clean_bathroom_input):
    """Verify that pipeline operates gracefully when storage metrics are unavailable."""
    engine = SmartRoutingEngine()
    dec = engine.evaluate(
        routing_input=clean_bathroom_input,
        predicted_class=3,
        prediction_confidence=0.90,
        is_anomaly=False,
        storage_data=None  # Storage missing
    )
    assert dec.storage_status == "UNAVAILABLE"
    assert dec.final_route == ROUTE_INDOOR_REUSE
    assert rc.STORAGE_UNAVAILABLE in dec.reason_codes


# =============================================================================
# TEST 12: Missing ML Model -> Clear MODEL_UNAVAILABLE Response
# =============================================================================
def test_12_missing_ml_model_response(clean_bathroom_input):
    """Verify that unpredicted sample falls back to clear MODEL_UNAVAILABLE code."""
    engine = SmartRoutingEngine()
    dec = engine.evaluate(
        routing_input=clean_bathroom_input,
        predicted_class=None,  # No model prediction
        prediction_confidence=None
    )
    assert rc.MODEL_UNAVAILABLE in dec.reason_codes
    assert dec.final_route == ROUTE_SEWER_BYPASS  # Safe default cutoff


# =============================================================================
# TEST 13: Safety Invariant: Favorable Weather Can NEVER Override CRITICAL Safety
# =============================================================================
def test_13_weather_never_overrides_critical_safety(moderate_laundry_input):
    """
    MANDATORY SAFETY TEST:
    Verify that perfect sunny weather, zero rain, warm temperature CANNOT convert
    a critical water quality contamination sample into a safe reuse route.
    """
    engine = SmartRoutingEngine()
    moderate_laundry_input.E_coli_CFU_100mL = 999999.0  # Lethal pathogen loading
    moderate_laundry_input.BOD_mg_L = 550.0            # Putrefaction hazard

    perfect_weather = {
        "temperature_C": 26.0,
        "humidity": 40.0,
        "rainfall_mm": 0.0,
        "precipitation_probability": 0.0,
        "weather_condition": "Clear / Sunny",
        "weather_status": "LIVE"
    }

    dec = engine.evaluate(
        routing_input=moderate_laundry_input,
        predicted_class=2,  # Model hypothetically says irrigation
        prediction_confidence=0.98,
        weather_data=perfect_weather
    )

    assert dec.final_route == ROUTE_SEWER_BYPASS
    assert dec.final_action == ACTION_SAFETY_OVERRIDE
    assert dec.final_route != ROUTE_RESTRICTED_IRRIGATION
    assert dec.final_route != ROUTE_INDOOR_REUSE


# =============================================================================
# TEST 14: Anomaly Invariant: Statistical Anomaly Alone Can NEVER Force Sewer Bypass
# =============================================================================
def test_14_anomaly_alone_never_forces_sewer_bypass(clean_bathroom_input):
    """
    MANDATORY ANOMALY TEST:
    Verify that an unsupervised statistical outlier with completely clean/safe
    water quality is NOT discarded into the sewer.
    """
    engine = SmartRoutingEngine()
    
    dec = engine.evaluate(
        routing_input=clean_bathroom_input,
        predicted_class=3,  # Indoor Reuse
        prediction_confidence=0.92,
        is_anomaly=True,    # Statistical outlier flagged
        anomaly_score=0.35, # High divergence score
        weather_data={"rainfall_mm": 0.0, "precipitation_probability": 5.0, "weather_status": "LIVE"}
    )

    # Anomaly alone must NEVER force Sewer Bypass
    assert dec.final_route == ROUTE_INDOOR_REUSE
    assert dec.final_route != ROUTE_SEWER_BYPASS
    assert dec.anomaly_status == "ANOMALY_REVIEW"
    assert dec.decision_status == DECISION_STATUS_ADVISORY
