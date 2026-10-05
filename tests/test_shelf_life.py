"""
Unit Tests for Deterioration Index, Stagnation Detection, and Shelf-Life Assessment
AI-Driven Intelligent Greywater Management and Smart Reuse Routing System

Test Coverage:
1. Low deterioration evaluation (fresh water, short storage time)
2. Moderate deterioration evaluation (mid-range storage duration)
3. High deterioration evaluation (extended storage, high thermal load)
4. Stagnation detection (prolonged idle interval without outflow)
5. Unavailable exact shelf-life estimation (null estimate, explicit scientific disclaimer)
6. Water quality safety priority override over storage status
"""

import pytest

from storage.shelf_life import StorageMonitor
from storage.config import (
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
    ACTION_EMPTY_AND_REASSESS,
    ACTION_SAFETY_REVIEW
)


def test_01_low_deterioration():
    """Verify that recently filled tank exhibits low deterioration index and FRESH status."""
    monitor = StorageMonitor()
    tank_state = {
        "tank_id": "TEST_TANK",
        "current_level_liters": 400.0,
        "capacity_liters": 1000.0,
        "fill_percentage": 40.0,
        "storage_age_hours": 2.0,  # 2 hours old
        "storage_temperature_C": 20.0,
        "temperature_source": "DIGITAL_TWIN",
        "last_outflow_timestamp": "2026-10-02 07:00:00 UTC",
        "last_inflow_timestamp": "2026-10-02 08:00:00 UTC"
    }
    res = monitor.assess_shelf_life(tank_state)
    assert res["deterioration_index"] < 0.25
    assert res["deterioration_status"] == "LOW_DETERIORATION"
    assert res["shelf_life_status"] == SHELF_LIFE_STATUS_FRESH
    assert res["stagnation_status"] == STAGNATION_STATUS_NORMAL
    assert res["recommended_storage_action"] == ACTION_CONTINUE_MONITORING


def test_02_moderate_deterioration():
    """Verify that greywater stored for intermediate duration exhibits moderate deterioration."""
    monitor = StorageMonitor()
    tank_state = {
        "tank_id": "TEST_TANK",
        "current_level_liters": 400.0,
        "capacity_liters": 1000.0,
        "fill_percentage": 40.0,
        "storage_age_hours": 18.0,  # 18 hours old
        "storage_temperature_C": 24.0,
        "temperature_source": "DIGITAL_TWIN",
        "last_outflow_timestamp": "2026-10-02 00:00:00 UTC",
        "last_inflow_timestamp": "2026-10-02 08:00:00 UTC"
    }
    res = monitor.assess_shelf_life(tank_state)
    assert 0.25 <= res["deterioration_index"] < 0.50
    assert res["deterioration_status"] == "MODERATE_DETERIORATION"
    assert res["shelf_life_status"] == SHELF_LIFE_STATUS_MONITOR
    assert res["recommended_storage_action"] in (ACTION_PRIORITIZE_USE, ACTION_CONTINUE_MONITORING)


def test_03_high_deterioration():
    """Verify that prolonged storage under warm conditions triggers high deterioration."""
    monitor = StorageMonitor()
    tank_state = {
        "tank_id": "TEST_TANK",
        "current_level_liters": 800.0,
        "capacity_liters": 1000.0,
        "fill_percentage": 80.0,
        "storage_age_hours": 42.0,  # 42 hours old
        "storage_temperature_C": 32.0,  # Warm temperature accelerates kinetics
        "temperature_source": "DIGITAL_TWIN",
        "last_outflow_timestamp": None,
        "last_inflow_timestamp": "2026-10-01 10:00:00 UTC"
    }
    res = monitor.assess_shelf_life(tank_state)
    assert res["deterioration_index"] >= 0.50
    assert res["deterioration_status"] in ("HIGH_DETERIORATION", "CRITICAL_REVIEW")
    assert res["shelf_life_status"] in (SHELF_LIFE_STATUS_AGING, SHELF_LIFE_STATUS_HIGH_RISK)


def test_04_stagnation_detection():
    """Verify that prolonged lack of outflow flags stagnation correctly."""
    monitor = StorageMonitor()
    
    # 1. Normal active turnover
    status_norm = monitor.evaluate_stagnation(idle_hours_since_outflow=3.0, storage_age_hours=3.0, deterioration_index=0.1, fill_percentage=50.0)
    assert status_norm == STAGNATION_STATUS_NORMAL

    # 2. Low turnover (14 hours idle)
    status_low = monitor.evaluate_stagnation(idle_hours_since_outflow=14.0, storage_age_hours=14.0, deterioration_index=0.2, fill_percentage=50.0)
    assert status_low == STAGNATION_STATUS_LOW_TURNOVER

    # 3. Stagnant (26 hours idle)
    status_stag = monitor.evaluate_stagnation(idle_hours_since_outflow=26.0, storage_age_hours=26.0, deterioration_index=0.35, fill_percentage=50.0)
    assert status_stag == STAGNATION_STATUS_STAGNANT

    # 4. Critical Stagnation Risk (38 hours idle)
    status_crit = monitor.evaluate_stagnation(idle_hours_since_outflow=38.0, storage_age_hours=38.0, deterioration_index=0.6, fill_percentage=50.0)
    assert status_crit == STAGNATION_STATUS_HIGH_RISK


def test_05_unavailable_exact_shelf_life_estimate():
    """Verify that exact remaining hours returns None (null) and status is unvalidated in strict mode."""
    monitor_strict = StorageMonitor(strict_shelf_life_validation=True)
    tank_state = {
        "tank_id": "TEST_TANK",
        "current_level_liters": 300.0,
        "capacity_liters": 1000.0,
        "fill_percentage": 30.0,
        "storage_age_hours": 10.0,
        "storage_temperature_C": 20.0,
        "temperature_source": "SIMULATION_DEFAULT"
    }
    res = monitor_strict.assess_shelf_life(tank_state)
    assert res["estimated_remaining_time_hours"] is None
    assert res["shelf_life_status"] == SHELF_LIFE_STATUS_NOT_VALIDATED
    assert res["microbial_risk_status"] == "NOT_EMPIRICALLY_VALIDATED"


def test_06_safety_override_precedence():
    """Verify that upstream severe water-quality override forces SAFETY_REVIEW action."""
    monitor = StorageMonitor()
    tank_state = {
        "tank_id": "TEST_TANK",
        "current_level_liters": 200.0,
        "capacity_liters": 1000.0,
        "fill_percentage": 20.0,
        "storage_age_hours": 1.0,  # Fresh water physically
        "storage_temperature_C": 20.0
    }
    # Pass SEWER_BYPASS_OVERRIDE from upstream anomaly detector
    res = monitor.assess_shelf_life(tank_state, initial_water_quality_status="SEWER_BYPASS_OVERRIDE")
    assert res["recommended_storage_action"] == ACTION_SAFETY_REVIEW
