"""
Unit Tests for Biochemical Decay and Mechanistic Deterioration Model
AI-Driven Intelligent Greywater Management and Smart Reuse Routing System

Test Coverage:
1. t=0 behavior (conservation of initial value)
2. Positive elapsed time (first-order exponential decay)
3. Temperature conversion and thermal acceleration (Arrhenius effect)
4. Invalid temperature handling (below absolute zero, non-numeric)
5. Parameter validation (negative time, negative initial concentration)
6. Unvalidated parameter status and microbial disclaimer verification
"""

import pytest
import math

from storage.decay_model import BiochemicalDecayModel
from storage.config import (
    PARAMETER_STATUS_UNVALIDATED,
    MODEL_CATEGORY_KINETIC,
    MODEL_CATEGORY_PROXY,
    MODEL_CATEGORY_NOT_MODELED,
    MICROBIAL_RISK_STATUS_DEFAULT
)


def test_01_t_zero_behavior():
    """Verify that at elapsed time t = 0, parameter values remain strictly identical to initial."""
    model = BiochemicalDecayModel()
    
    # Test across multiple parameters
    for param, init_val in [("BOD_mg_L", 250.0), ("COD_mg_L", 500.0), ("DO_mg_L", 6.5), ("E_coli_CFU_100mL", 50000.0)]:
        res = model.estimate_parameter_decay(param, initial_value=init_val, elapsed_hours=0.0, temperature_C=20.0)
        assert res["initial_value"] == init_val
        assert res["estimated_value"] == init_val
        assert res["relative_change_pct"] == 0.0
        assert res["elapsed_hours"] == 0.0


def test_02_positive_elapsed_time():
    """Verify that positive elapsed time produces monotonic first-order decay for BOD/COD."""
    model = BiochemicalDecayModel()
    init_bod = 200.0
    
    res_12h = model.estimate_parameter_decay("BOD_mg_L", initial_value=init_bod, elapsed_hours=12.0, temperature_C=20.0)
    res_24h = model.estimate_parameter_decay("BOD_mg_L", initial_value=init_bod, elapsed_hours=24.0, temperature_C=20.0)
    
    assert res_12h["estimated_value"] < init_bod
    assert res_24h["estimated_value"] < res_12h["estimated_value"]
    assert res_24h["model_category"] == MODEL_CATEGORY_KINETIC
    assert res_24h["parameter_status"] == PARAMETER_STATUS_UNVALIDATED

    # Verify mathematical consistency with C0 * exp(-k*t)
    k = res_24h["rate_k_per_hour"]
    expected_24h = init_bod * math.exp(-k * 24.0)
    assert abs(res_24h["estimated_value"] - expected_24h) < 0.01


def test_03_temperature_conversion():
    """Verify that higher temperature accelerates decay kinetics according to Arrhenius equation."""
    model = BiochemicalDecayModel(use_arrhenius=True)
    
    k_15C = model.calculate_adjusted_rate("BOD_mg_L", temperature_C=15.0)
    k_20C = model.calculate_adjusted_rate("BOD_mg_L", temperature_C=20.0)  # reference
    k_30C = model.calculate_adjusted_rate("BOD_mg_L", temperature_C=30.0)
    
    assert k_15C < k_20C < k_30C

    # Verify that warmer temperature results in lower residual BOD after identical duration
    res_cold = model.estimate_parameter_decay("BOD_mg_L", 200.0, elapsed_hours=24.0, temperature_C=15.0)
    res_hot = model.estimate_parameter_decay("BOD_mg_L", 200.0, elapsed_hours=24.0, temperature_C=30.0)
    assert res_hot["estimated_value"] < res_cold["estimated_value"]


def test_04_invalid_temperature():
    """Verify that non-numeric or physically impossible temperatures raise explicit exceptions."""
    model = BiochemicalDecayModel()

    with pytest.raises(TypeError, match="must be numeric"):
        model.calculate_adjusted_rate("BOD_mg_L", temperature_C="hot")

    with pytest.raises(ValueError, match="absolute zero"):
        model.calculate_adjusted_rate("BOD_mg_L", temperature_C=-300.0)


def test_05_parameter_validation():
    """Verify that negative elapsed time or negative initial values raise ValueError."""
    model = BiochemicalDecayModel()

    with pytest.raises(ValueError, match="cannot be negative"):
        model.estimate_parameter_decay("BOD_mg_L", initial_value=-10.0, elapsed_hours=5.0)

    with pytest.raises(ValueError, match="cannot be negative"):
        model.estimate_parameter_decay("BOD_mg_L", initial_value=100.0, elapsed_hours=-2.0)


def test_06_unvalidated_parameter_warning():
    """Verify that decay parameters carry unvalidated flags and E. coli carries explicit disclaimer."""
    model = BiochemicalDecayModel()
    
    res_bod = model.estimate_parameter_decay("BOD_mg_L", 150.0, elapsed_hours=10.0)
    assert res_bod["parameter_status"] == PARAMETER_STATUS_UNVALIDATED
    
    # E. coli is NOT modeled as an empirical population curve
    res_ecoli = model.estimate_parameter_decay("E_coli_CFU_100mL", 80000.0, elapsed_hours=10.0)
    assert res_ecoli["model_category"] == MODEL_CATEGORY_NOT_MODELED
    assert res_ecoli["microbial_risk_status"] == MICROBIAL_RISK_STATUS_DEFAULT
    assert res_ecoli["estimated_value"] == 80000.0  # Kept unchanged without speculation
