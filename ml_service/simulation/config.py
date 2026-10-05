"""
Digital Twin Simulation Configuration
AI-Driven Intelligent Greywater Management and Smart Reuse Routing System

Centralized configuration parameters for synthetic telemetry generation,
physical tank accounting, sensor noise injection, sensor fault modeling,
and controlled contamination testing events.
"""

# Default Simulation Timing
DEFAULT_RANDOM_SEED = 42
DEFAULT_SIMULATION_INTERVAL_MIN = 5  # 5-minute timestep
DEFAULT_SIMULATION_STEPS = 288       # 288 steps = 24 hours at 5-minute intervals
DEFAULT_START_TIMESTAMP = "2026-10-02 06:00:00"

# Physical Storage Tank Parameters
DEFAULT_TANK_CAPACITY_L = 1000.0  # 1000 Liters maximum capacity
DEFAULT_INITIAL_TANK_LEVEL_L = 250.0  # Initial water volume
DEFAULT_DISCHARGE_OUTFLOW_L_MIN = 12.0 # Standard treatment pump draw when active

# Source-Specific Inflow Rates (L/min)
FLOW_RATE_RANGES_L_MIN = {
    "Bathroom": (8.0, 22.0),
    "Kitchen": (4.0, 14.0),
    "Laundry": (12.0, 30.0),
    "Mixed": (10.0, 35.0)
}

# Measurement Sensor Noise (standard deviation as a fraction of empirical parameter std)
SENSOR_NOISE_FRACTION = 0.03  # 3% Gaussian measurement noise

# Physical and Chemical Parameter Absolute Bounds
PARAMETER_PHYSICAL_BOUNDS = {
    "pH": (4.0, 11.0),
    "TEMP_C": (10.0, 60.0),
    "SAL_ppt": (0.0, 5.0),
    "TUR_NTU": (0.0, 400.0),
    "DS_mg_L": (0.0, 2000.0),
    "TDS_mg_L": (0.0, 2000.0),
    "TSS_mg_L": (0.0, 800.0),
    "COND_uS_cm": (50.0, 3000.0),
    "DO_mg_L": (0.0, 12.0),
    "BOD_mg_L": (0.0, 1500.0),
    "COD_mg_L": (0.0, 2500.0),
    "NH4F_mg_L": (0.0, 60.0),
    "NO3_mg_L": (0.0, 40.0),
    "K_mg_L": (0.0, 80.0),
    "E_coli_CFU_100mL": (0.0, 5000000.0)
}

# Controlled Synthetic Contamination and Fault Events (for testing anomaly and routing pipelines)
SYNTHETIC_EVENTS = {
    "normal": {
        "description": "Nominal operational telemetry without abnormalities",
        "affected_parameters": {},
        "sensor_fault": None
    },
    "high_turbidity": {
        "description": "Suspended sediment shock load causing turbidity elevation",
        "affected_parameters": {"TUR_NTU": 165.0, "TSS_mg_L": 320.0},
        "sensor_fault": None
    },
    "high_tds": {
        "description": "Dissolved mineral salt discharge exceeding safe reuse limit",
        "affected_parameters": {"TDS_mg_L": 820.0, "DS_mg_L": 790.0, "COND_uS_cm": 980.0, "SAL_ppt": 0.68},
        "sensor_fault": None
    },
    "high_organic_load": {
        "description": "Severe food waste and grease loading spiking COD and BOD",
        "affected_parameters": {"COD_mg_L": 890.0, "BOD_mg_L": 520.0, "DO_mg_L": 0.3},
        "sensor_fault": None
    },
    "abnormal_ph": {
        "description": "Extreme chemical detergent dumping causing alkaline surge",
        "affected_parameters": {"pH": 9.8, "COND_uS_cm": 1100.0},
        "sensor_fault": None
    },
    "microbial_spike": {
        "description": "Severe biological pathogen surge from cross-contamination",
        "affected_parameters": {"E_coli_CFU_100mL": 850000.0, "TUR_NTU": 110.0},
        "sensor_fault": None
    },
    "multi_parameter_event": {
        "description": "Catastrophic compound contamination event",
        "affected_parameters": {
            "pH": 5.4,
            "TUR_NTU": 190.0,
            "COD_mg_L": 960.0,
            "TSS_mg_L": 340.0,
            "E_coli_CFU_100mL": 1200000.0
        },
        "sensor_fault": None
    },
    "sensor_fault_stuck": {
        "description": "Turbidity sensor hardware failure causing frozen output",
        "affected_parameters": {},
        "sensor_fault": {"type": "stuck", "parameter": "TUR_NTU", "value": 75.0}
    },
    "sensor_fault_drift": {
        "description": "Electrochemical pH sensor calibration drift",
        "affected_parameters": {},
        "sensor_fault": {"type": "drift", "parameter": "pH", "drift_rate": 0.1}
    }
}
