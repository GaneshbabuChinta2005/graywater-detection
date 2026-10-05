"""
Unit tests for Digital Twin and Synthetic Telemetry Simulation Engine
Tests all 12 required scenarios specified in Phase 8.
"""

import pytest
import numpy as np
import pandas as pd
from datetime import datetime

from simulation.digital_twin import DigitalTwinEngine, DigitalTwinState
from simulation.model_inference import ModelInferenceAdapter
from simulation.config import (
    DEFAULT_RANDOM_SEED,
    DEFAULT_SIMULATION_INTERVAL_MIN,
    DEFAULT_TANK_CAPACITY_L,
    PARAMETER_PHYSICAL_BOUNDS
)


@pytest.fixture
def engine():
    """Create a Digital Twin Engine instance with fixed seed."""
    return DigitalTwinEngine(random_seed=42)


def test_01_initial_state(engine):
    """Test 1: Engine initializes correctly with defined attributes and initial volume."""
    state = engine.create_initial_state(start_timestamp="2026-10-02 06:00:00", initial_source="Bathroom")
    assert isinstance(state, DigitalTwinState)
    assert state.timestamp == "2026-10-02 06:00:00"
    assert state.greywater_source == "Bathroom"
    assert state.tank_level_L == 250.0
    assert state.tank_capacity_L == DEFAULT_TANK_CAPACITY_L
    assert state.sensor_status == "OK"
    assert state.event_name == "normal"
    assert state.flow_rate_L_min > 0.0


def test_02_state_update(engine):
    """Test 2: State update advances step counter and produces valid numeric readings."""
    engine.create_initial_state()
    initial_step = engine.current_step
    next_state = engine.update_state(source="Kitchen")
    
    assert engine.current_step == initial_step + 1
    assert next_state.greywater_source == "Kitchen"
    assert isinstance(next_state.pH, float)
    assert isinstance(next_state.COD_mg_L, float)
    assert next_state.COD_mg_L > 0.0


def test_03_timestamp_progression(engine):
    """Test 3: Timestamps progress by exactly interval_min (5 minutes)."""
    s0 = engine.create_initial_state(start_timestamp="2026-10-02 08:00:00")
    s1 = engine.update_state()
    
    t0 = datetime.strptime(s0.timestamp, "%Y-%m-%d %H:%M:%S")
    t1 = datetime.strptime(s1.timestamp, "%Y-%m-%d %H:%M:%S")
    delta_min = (t1 - t0).total_seconds() / 60.0
    assert delta_min == float(DEFAULT_SIMULATION_INTERVAL_MIN)


def test_04_tank_level_calculation(engine):
    """Test 4: Physical mass balance: level = prev + (inflow - outflow) * delta_t."""
    prev_level = 500.0
    inflow_rate = 20.0 # L/min
    outflow_rate = 10.0 # L/min
    # Delta t = 5 min -> net inflow = (20 - 10) * 5 = +50 L
    new_level = engine.update_tank(prev_level, inflow_rate, outflow_rate)
    assert new_level == 550.0


def test_05_tank_overflow_prevention(engine):
    """Test 5: Tank level never exceeds tank_capacity_L even with massive inflow."""
    prev_level = 980.0
    huge_inflow = 150.0 # L/min -> +750 L over 5 min
    new_level = engine.update_tank(prev_level, huge_inflow, outflow_rate_L_min=0.0)
    assert new_level == engine.tank_capacity_L
    assert new_level <= DEFAULT_TANK_CAPACITY_L


def test_06_negative_level_prevention(engine):
    """Test 6: Tank level never falls below 0.0 L even with zero inflow and high pump draw."""
    prev_level = 20.0
    zero_inflow = 0.0
    huge_outflow = 50.0 # L/min -> -250 L
    new_level = engine.update_tank(prev_level, zero_inflow, outflow_rate_L_min=huge_outflow)
    assert new_level == 0.0


def test_07_sensor_noise_bounds(engine):
    """Test 7: Noise is applied and respects physical bounds (no negative values, bounded pH)."""
    base_readings = {
        "pH": 7.0,
        "TUR_NTU": 1.0,
        "COD_mg_L": 2.0,
        "E_coli_CFU_100mL": 0.0
    }
    noisy = engine.apply_sensor_noise(base_readings)
    for p, val in noisy.items():
        low, high = PARAMETER_PHYSICAL_BOUNDS[p]
        assert low <= val <= high, f"Parameter {p} value {val} out of bounds [{low}, {high}]"


def test_08_normal_event(engine):
    """Test 8: Normal event maintains baseline source readings."""
    engine.create_initial_state(initial_source="Bathroom")
    state = engine.update_state(event_name="normal")
    assert state.event_name == "normal"
    assert state.sensor_status == "OK"
    assert state.TUR_NTU < 150.0 # Standard bathroom turbidity


def test_09_abnormal_event(engine):
    """Test 9: Synthetic shock event alters target parameters (high turbidity shock)."""
    engine.create_initial_state()
    state = engine.update_state(event_name="high_turbidity")
    assert state.event_name == "high_turbidity"
    assert state.TUR_NTU >= 150.0 # Injected turbidity shock
    assert state.TSS_mg_L >= 300.0


def test_10_sensor_fault(engine):
    """Test 10: Sensor fault flags degraded status and simulates hardware fault."""
    engine.create_initial_state()
    state = engine.update_state(event_name="sensor_fault_stuck")
    assert "FAULT_STUCK" in state.sensor_status
    assert state.TUR_NTU == 75.0 # Stuck sensor value


def test_11_reproducibility_using_random_seed():
    """Test 11: Two engines initialized with the same seed generate identical trajectories."""
    e1 = DigitalTwinEngine(random_seed=123)
    e2 = DigitalTwinEngine(random_seed=123)
    
    e1.create_initial_state()
    e2.create_initial_state()
    
    s1 = e1.update_state(source="Laundry")
    s2 = e2.update_state(source="Laundry")
    
    assert s1.to_dict() == s2.to_dict()


def test_12_model_input_compatibility(engine):
    """Test 12: ModelInferenceAdapter formats telemetry and produces valid inference output."""
    adapter = ModelInferenceAdapter()
    state = engine.create_initial_state(initial_source="Kitchen")
    
    features_df = adapter.format_telemetry_features(state)
    assert features_df.shape == (1, 19)
    assert list(features_df.columns) == adapter.expected_features
    assert features_df["Greywater_Source_Kitchen"].iloc[0] == 1
    assert features_df["Greywater_Source_Bathroom"].iloc[0] == 0
    
    # Run full inference
    pred = adapter.predict(state)
    assert "is_anomaly" in pred
    assert "anomaly_score" in pred
    assert "ml_predicted_class" in pred
    assert "ml_predicted_name" in pred
    assert "safety_status" in pred
    assert "final_routing_class" in pred
    assert pred["final_routing_class"] in [0, 1, 2, 3]
