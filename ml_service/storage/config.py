"""
Storage Tank Monitoring and Biochemical Deterioration Configuration
AI-Driven Intelligent Greywater Management and Smart Reuse Routing System

Configures physical storage tank limits, batch tracking parameters, kinetic decay rates,
temperature dependence factors, deterioration index weights, and operational stagnation thresholds.

SCIENTIFIC DISCLAIMER:
The project dataset is cross-sectional and does NOT contain longitudinal storage measurements.
All kinetic rates and decay parameters are UNVALIDATED configuration parameters for
mechanistic and operational simulation. They do NOT represent experimentally verified safe shelf lives.
"""

import os
from typing import Dict, Any

# Physical Tank Defaults
DEFAULT_TANK_ID = "TANK_PRIMARY_01"
DEFAULT_TANK_CAPACITY_L = float(os.getenv("STORAGE_TANK_CAPACITY_L", "1000.0"))
DEFAULT_INITIAL_LEVEL_L = float(os.getenv("STORAGE_INITIAL_LEVEL_L", "200.0"))
MIN_TANK_LEVEL_L = 0.0

# Batch & Age Tracking
DEFAULT_TRACKING_MODE = "batch_fifo"  # Options: "batch_fifo", "weighted_average"
MAX_BATCH_HISTORY = 100

# Temperature Context
DEFAULT_REFERENCE_TEMP_C = 20.0  # Reference temperature for kinetic rates (20°C / 293.15 K)
GAS_CONSTANT_R = 8.314  # J / (mol * K)
TEMP_SOURCE_DIGITAL_TWIN = "DIGITAL_TWIN"
TEMP_SOURCE_WEATHER = "WEATHER"
TEMP_SOURCE_USER_CONFIGURED = "USER_CONFIGURED"
TEMP_SOURCE_SIMULATION_DEFAULT = "SIMULATION_DEFAULT"
TEMP_SOURCE_UNAVAILABLE = "UNAVAILABLE"

# Kinetic Model Status and Parameter Classifications
PARAMETER_STATUS_UNVALIDATED = "UNVALIDATED"
MODEL_CATEGORY_KINETIC = "SUPPORTED_KINETIC_MODEL"
MODEL_CATEGORY_PROXY = "RELATIVE_RISK_PROXY"
MODEL_CATEGORY_NOT_MODELED = "NOT_MODELED"
MICROBIAL_RISK_STATUS_DEFAULT = "NOT_EMPIRICALLY_VALIDATED"

# Unvalidated Mechanistic Decay Parameters (First-Order Kinetics: C(t) = C0 * exp(-k*t))
# Reference rates at T_ref = 20°C (hr^-1)
DECAY_PARAMETERS: Dict[str, Dict[str, Any]] = {
    "BOD_mg_L": {
        "model_category": MODEL_CATEGORY_KINETIC,
        "parameter_status": PARAMETER_STATUS_UNVALIDATED,
        "k_ref_per_hour": 0.025,  # First-order aerobic degradation rate (approx 50% decay over 28 hrs)
        "activation_energy_J_mol": 45000.0,  # Arrhenius Ea (J/mol)
        "theta_temp_coeff": 1.047,  # Standard Streeter-Phelps temperature coefficient
        "description": "Biochemical Oxygen Demand exertion during storage"
    },
    "COD_mg_L": {
        "model_category": MODEL_CATEGORY_KINETIC,
        "parameter_status": PARAMETER_STATUS_UNVALIDATED,
        "k_ref_per_hour": 0.012,  # Slower chemical oxidation rate
        "activation_energy_J_mol": 35000.0,
        "theta_temp_coeff": 1.035,
        "description": "Chemical Oxygen Demand stabilization"
    },
    "DO_mg_L": {
        "model_category": MODEL_CATEGORY_PROXY,
        "parameter_status": PARAMETER_STATUS_UNVALIDATED,
        "depletion_rate_per_hour": 0.08,  # First-order DO depletion factor
        "saturation_DO_20C": 9.08,  # Dissolved oxygen saturation at 20°C in water
        "description": "Dissolved oxygen depletion due to microbial respiration"
    },
    "TUR_NTU": {
        "model_category": MODEL_CATEGORY_PROXY,
        "parameter_status": PARAMETER_STATUS_UNVALIDATED,
        "settling_rate_per_hour": 0.015,  # Gravitational settling reduction in calm tank
        "description": "Particulate gravitational sedimentation"
    },
    "E_coli_CFU_100mL": {
        "model_category": MODEL_CATEGORY_NOT_MODELED,
        "parameter_status": PARAMETER_STATUS_UNVALIDATED,
        "microbial_risk_status": MICROBIAL_RISK_STATUS_DEFAULT,
        "description": "Microbial pathogen dynamics (not empirically modeled; requires specific microbiological assay)"
    }
}

# Deterioration Index Configuration (Scale 0.0 - 1.0)
DETERIORATION_BANDS = {
    "LOW_DETERIORATION": (0.0, 0.25),
    "MODERATE_DETERIORATION": (0.25, 0.50),
    "HIGH_DETERIORATION": (0.50, 0.75),
    "CRITICAL_REVIEW": (0.75, 1.00)
}

# Multi-factor Deterioration Weights (Total = 1.0)
DETERIORATION_WEIGHTS = {
    "storage_age_factor": 0.35,      # Dominant operational age factor
    "temperature_factor": 0.20,      # Thermal acceleration of degradation
    "organic_decay_factor": 0.20,    # Relative BOD/COD degradation progress
    "oxygen_depletion_factor": 0.15, # Anoxia / septic risk indicator
    "stagnation_factor": 0.10        # Turnover dormancy penalty
}

# Operational Age Normalization
NOMINAL_HALF_LIFE_HOURS = 24.0   # 24 hours nominal greywater storage benchmark
MAX_SAFE_STORAGE_HOURS = 48.0    # 48 hours typical regulatory storage cutoff before septic risk

# Operational Stagnation Thresholds
STAGNATION_THRESHOLDS = {
    "MAX_IDLE_HOURS": 12.0,          # Outflow inactivity threshold
    "HIGH_STAGNATION_HOURS": 24.0,   # Prolonged no-turnover period
    "LOW_TURNOVER_RATIO": 0.15       # Outflow to capacity ratio in 24h
}

# Stagnation Status Categories
STAGNATION_STATUS_NORMAL = "NORMAL"
STAGNATION_STATUS_LOW_TURNOVER = "LOW_TURNOVER"
STAGNATION_STATUS_STAGNANT = "STAGNANT"
STAGNATION_STATUS_HIGH_RISK = "HIGH_STAGNATION_RISK"

# Shelf-Life Status Categories
SHELF_LIFE_STATUS_FRESH = "FRESH"
SHELF_LIFE_STATUS_MONITOR = "MONITOR"
SHELF_LIFE_STATUS_AGING = "AGING"
SHELF_LIFE_STATUS_HIGH_RISK = "HIGH_RISK_REVIEW"
SHELF_LIFE_STATUS_NOT_VALIDATED = "NOT_VALIDATED_FOR_EXACT_SHELF_LIFE"

# Recommended Storage Operational Actions
ACTION_CONTINUE_MONITORING = "CONTINUE_MONITORING"
ACTION_PRIORITIZE_USE = "PRIORITIZE_USE"
ACTION_REDUCE_STORAGE_TIME = "REDUCE_STORAGE_TIME"
ACTION_REVIEW_WATER_QUALITY = "REVIEW_WATER_QUALITY"
ACTION_EMPTY_AND_REASSESS = "EMPTY_AND_REASSESS"
ACTION_SAFETY_REVIEW = "SAFETY_REVIEW"
