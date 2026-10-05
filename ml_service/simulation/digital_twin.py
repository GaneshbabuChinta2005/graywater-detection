"""
Digital Twin Simulation Engine
AI-Driven Intelligent Greywater Management and Smart Reuse Routing System

This module simulates the physical, chemical, and fluid operational dynamics of an
intelligent greywater recycling plant. It maintains continuous state accounting
for greywater sources, sensor readings, measurement noise, sensor hardware faults,
controlled contamination test events, and physical storage tank levels over time.

SCIENTIFIC DISCLAIMER:
The Digital Twin telemetry is synthetic simulation data derived from the statistical
characteristics of the project dataset. It is not a substitute for physical sensor
measurements.
"""

import os
import sys

# Ensure project root is in sys.path when executed directly
project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if project_root not in sys.path:
    sys.path.insert(0, project_root)

from dataclasses import dataclass, asdict
from datetime import datetime, timedelta
import json
from typing import Optional, Dict, Any
import numpy as np
import pandas as pd

from simulation.config import (
    DEFAULT_RANDOM_SEED,
    DEFAULT_SIMULATION_INTERVAL_MIN,
    DEFAULT_TANK_CAPACITY_L,
    DEFAULT_INITIAL_TANK_LEVEL_L,
    DEFAULT_DISCHARGE_OUTFLOW_L_MIN,
    FLOW_RATE_RANGES_L_MIN,
    SENSOR_NOISE_FRACTION,
    PARAMETER_PHYSICAL_BOUNDS,
    SYNTHETIC_EVENTS
)


@dataclass
class DigitalTwinState:
    """Represents a discrete time snapshot of the virtual greywater management system."""
    timestamp: str
    greywater_source: str
    
    # 15 Physicochemical and Biological Parameters
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
    
    # Fluid and Storage State
    flow_rate_L_min: float
    tank_capacity_L: float
    tank_level_L: float
    
    # Telemetry Health & Event State
    sensor_status: str
    event_name: str

    def to_dict(self):
        return asdict(self)


class DigitalTwinEngine:
    """
    Simulation engine managing temporal state progression, physical storage balance,
    source transitions, sensor noise, hardware faults, and contamination shocks.
    """
    current_step: int
    current_time: Optional[datetime]
    current_state: Optional[DigitalTwinState]
    fault_state: dict[str, float]

    def __init__(
        self,
        random_seed=DEFAULT_RANDOM_SEED,
        interval_min=DEFAULT_SIMULATION_INTERVAL_MIN,
        tank_capacity_L=DEFAULT_TANK_CAPACITY_L,
        initial_tank_level_L=DEFAULT_INITIAL_TANK_LEVEL_L,
        profiles_path=None
    ):
        self.random_seed = random_seed
        self.rng = np.random.default_rng(self.random_seed)
        self.interval_min = interval_min
        self.tank_capacity_L = tank_capacity_L
        self.initial_tank_level_L = initial_tank_level_L
        
        # Load empirical source statistical profiles
        if profiles_path is None:
            profiles_path = os.path.join(
                os.path.dirname(__file__), "source_statistical_profiles.json"
            )
        with open(profiles_path, "r") as f:
            self.source_profiles = json.load(f)
            
        self.current_step = 0
        self.current_time = None
        self.current_state = None
        self.fault_state = {}

    def create_initial_state(
        self,
        start_timestamp="2026-10-02 06:00:00",
        initial_source="Bathroom"
    ):
        """Initialize the Digital Twin state at step 0."""
        self.current_step = 0
        self.current_time = datetime.strptime(start_timestamp, "%Y-%m-%d %H:%M:%S")
        self.fault_state = {}
        
        telemetry = self._generate_base_telemetry(initial_source)
        flow = self._generate_flow_rate(initial_source)
        
        self.current_state = DigitalTwinState(
            timestamp=self.current_time.strftime("%Y-%m-%d %H:%M:%S"),
            greywater_source=initial_source,
            pH=telemetry["pH"],
            TEMP_C=telemetry["TEMP_C"],
            SAL_ppt=telemetry["SAL_ppt"],
            TUR_NTU=telemetry["TUR_NTU"],
            DS_mg_L=telemetry["DS_mg_L"],
            TDS_mg_L=telemetry["TDS_mg_L"],
            TSS_mg_L=telemetry["TSS_mg_L"],
            COND_uS_cm=telemetry["COND_uS_cm"],
            DO_mg_L=telemetry["DO_mg_L"],
            BOD_mg_L=telemetry["BOD_mg_L"],
            COD_mg_L=telemetry["COD_mg_L"],
            NH4F_mg_L=telemetry["NH4F_mg_L"],
            NO3_mg_L=telemetry["NO3_mg_L"],
            K_mg_L=telemetry["K_mg_L"],
            E_coli_CFU_100mL=telemetry["E_coli_CFU_100mL"],
            flow_rate_L_min=flow,
            tank_capacity_L=self.tank_capacity_L,
            tank_level_L=self.initial_tank_level_L,
            sensor_status="OK",
            event_name="normal"
        )
        return self.current_state

    def _generate_base_telemetry(self, source):
        """Generate baseline water quality readings from source-specific empirical distributions."""
        prof = self.source_profiles[source]
        readings = {}
        for param, stats in prof.items():
            # Sample from source-specific normal distribution
            val = self.rng.normal(stats["mean"], stats["std"] * 0.85)
            # Clip within physical bounds
            low, high = PARAMETER_PHYSICAL_BOUNDS[param]
            val = float(np.clip(val, low, high))
            readings[param] = round(val, 2) if param != "E_coli_CFU_100mL" else round(val, 1)
        return readings

    def _generate_flow_rate(self, source):
        """Sample flow rate (L/min) within source-specific operational bounds."""
        low, high = FLOW_RATE_RANGES_L_MIN[source]
        val = float(self.rng.uniform(low, high))
        return round(val, 2)

    def apply_sensor_noise(self, readings):
        """Inject parameter-specific bounded measurement noise."""
        noisy = {}
        for param, val in readings.items():
            if param in PARAMETER_PHYSICAL_BOUNDS:
                # Noise proportional to parameter scale
                low_b, high_b = PARAMETER_PHYSICAL_BOUNDS[param]
                scale = (high_b - low_b) * 0.005  # 0.5% full-scale sensor noise
                noise = self.rng.normal(0, scale)
                val_noisy = float(np.clip(val + noise, low_b, high_b))
                noisy[param] = round(val_noisy, 2) if param != "E_coli_CFU_100mL" else round(val_noisy, 1)
            else:
                noisy[param] = val
        return noisy

    def apply_event(self, readings, event_name):
        """Inject controlled synthetic contamination shocks or sensor abnormalities."""
        if event_name not in SYNTHETIC_EVENTS:
            raise ValueError(f"Unknown synthetic event: {event_name}")
            
        event_cfg = SYNTHETIC_EVENTS[event_name]
        modified = readings.copy()
        
        # Apply parameter overrides/offsets
        affected = event_cfg.get("affected_parameters")
        if isinstance(affected, dict):
            for param, target_val in affected.items():
                if isinstance(param, str) and isinstance(target_val, (int, float)):
                    # Add slight variance to the shock
                    noise = self.rng.normal(0, float(target_val) * 0.02)
                    if param in PARAMETER_PHYSICAL_BOUNDS:
                        low_b, high_b = PARAMETER_PHYSICAL_BOUNDS[param]
                        val = float(np.clip(float(target_val) + noise, low_b, high_b))
                        modified[param] = round(val, 2) if param != "E_coli_CFU_100mL" else round(val, 1)
            
        return modified

    def apply_sensor_fault(self, readings, event_name):
        """Simulate hardware sensor malfunctions (stuck values, drift)."""
        event_cfg = SYNTHETIC_EVENTS.get(event_name, {})
        fault_cfg = event_cfg.get("sensor_fault") if isinstance(event_cfg, dict) else None
        
        status = "OK"
        modified = readings.copy()
        
        if isinstance(fault_cfg, dict):
            fault_type = fault_cfg.get("type")
            param = fault_cfg.get("parameter")
            
            if isinstance(param, str):
                if fault_type == "stuck":
                    status = f"FAULT_STUCK_{param}"
                    if "value" in fault_cfg:
                        val = fault_cfg["value"]
                        if isinstance(val, (int, float)):
                            modified[param] = float(val)
                    
                elif fault_type == "drift":
                    status = f"FAULT_DRIFT_{param}"
                    drift_rate_val = fault_cfg.get("drift_rate", 0.0)
                    drift_rate = float(drift_rate_val) if isinstance(drift_rate_val, (int, float)) else 0.0
                    accum_drift = self.fault_state.get(param, 0.0) + drift_rate
                    self.fault_state[param] = accum_drift
                    if param in PARAMETER_PHYSICAL_BOUNDS:
                        low_b, high_b = PARAMETER_PHYSICAL_BOUNDS[param]
                        curr_val = float(modified.get(param, 0.0))
                        modified[param] = float(np.clip(curr_val + accum_drift, low_b, high_b))
                
        return modified, status

    def update_tank(self, current_level, inflow_rate_L_min, outflow_rate_L_min=None):
        """
        Calculate fluid mass balance over the simulation interval:
        new_level = previous_level + (inflow - outflow) * delta_t
        Strictly clamped between 0 and tank_capacity_L.
        """
        if outflow_rate_L_min is None:
            # Active outflow if tank is above 15% capacity
            outflow_rate_L_min = DEFAULT_DISCHARGE_OUTFLOW_L_MIN if current_level > (self.tank_capacity_L * 0.15) else 0.0
            
        delta_t = float(self.interval_min)
        inflow_volume = max(0.0, inflow_rate_L_min) * delta_t
        outflow_volume = max(0.0, outflow_rate_L_min) * delta_t
        
        net_change = inflow_volume - outflow_volume
        new_level = current_level + net_change
        
        # Physical non-overflow and non-negative clamping
        clamped_level = float(np.clip(new_level, 0.0, self.tank_capacity_L))
        return round(clamped_level, 2)

    def update_state(
        self,
        source=None,
        event_name="normal",
        outflow_rate_L_min=None
    ):
        """Advance simulation by one time interval."""
        if self.current_state is None or self.current_time is None:
            raise RuntimeError("Engine must be initialized with create_initial_state() before update_state().")
            
        self.current_step += 1
        self.current_time = self.current_time + timedelta(minutes=self.interval_min)
        
        # Source selection
        active_source = source if source is not None else self.current_state.greywater_source
        
        # Generate base telemetry
        telemetry = self._generate_base_telemetry(active_source)
        
        # Apply synthetic event (if active)
        telemetry = self.apply_event(telemetry, event_name)
        
        # Apply measurement noise
        telemetry = self.apply_sensor_noise(telemetry)
        
        # Apply sensor faults
        telemetry, sensor_status = self.apply_sensor_fault(telemetry, event_name)
        
        # Generate flow rate
        flow_rate = self._generate_flow_rate(active_source)
        
        # Update storage tank
        new_tank_level = self.update_tank(
            current_level=self.current_state.tank_level_L,
            inflow_rate_L_min=flow_rate,
            outflow_rate_L_min=outflow_rate_L_min
        )
        
        self.current_state = DigitalTwinState(
            timestamp=self.current_time.strftime("%Y-%m-%d %H:%M:%S"),
            greywater_source=active_source,
            pH=telemetry["pH"],
            TEMP_C=telemetry["TEMP_C"],
            SAL_ppt=telemetry["SAL_ppt"],
            TUR_NTU=telemetry["TUR_NTU"],
            DS_mg_L=telemetry["DS_mg_L"],
            TDS_mg_L=telemetry["TDS_mg_L"],
            TSS_mg_L=telemetry["TSS_mg_L"],
            COND_uS_cm=telemetry["COND_uS_cm"],
            DO_mg_L=telemetry["DO_mg_L"],
            BOD_mg_L=telemetry["BOD_mg_L"],
            COD_mg_L=telemetry["COD_mg_L"],
            NH4F_mg_L=telemetry["NH4F_mg_L"],
            NO3_mg_L=telemetry["NO3_mg_L"],
            K_mg_L=telemetry["K_mg_L"],
            E_coli_CFU_100mL=telemetry["E_coli_CFU_100mL"],
            flow_rate_L_min=flow_rate,
            tank_capacity_L=self.tank_capacity_L,
            tank_level_L=new_tank_level,
            sensor_status=sensor_status,
            event_name=event_name
        )
        return self.current_state

    def reset_simulation(self):
        """Reset the engine back to initial uninitialized state."""
        self.rng = np.random.default_rng(self.random_seed)
        self.current_step = 0
        self.current_time = None
        self.current_state = None
        self.fault_state = {}


def create_initial_state(start_timestamp="2026-10-02 06:00:00", source="Bathroom", random_seed=42):
    """Factory helper to instantiate engine and return initial state."""
    engine = DigitalTwinEngine(random_seed=random_seed)
    return engine.create_initial_state(start_timestamp=start_timestamp, initial_source=source)


if __name__ == "__main__":
    print("=" * 60)
    print("Digital Twin Simulation Engine - Operational Test")
    print("=" * 60)
    test_engine = DigitalTwinEngine(random_seed=42)
    s0 = test_engine.create_initial_state(start_timestamp="2026-10-02 06:00:00", initial_source="Bathroom")
    print("Step 0 Initialized:")
    print(f"  Timestamp    : {s0.timestamp}")
    print(f"  Source       : {s0.greywater_source}")
    print(f"  Tank Level   : {s0.tank_level_L:.1f} / {s0.tank_capacity_L:.1f} L")
    print(f"  Inflow Rate  : {s0.flow_rate_L_min:.2f} L/min")
    print(f"  Sensor Status: {s0.sensor_status}")
    print(f"  Event        : {s0.event_name}")
    print(f"  Key Parameters: pH={s0.pH:.2f}, Turbidity={s0.TUR_NTU:.1f} NTU, COD={s0.COD_mg_L:.1f} mg/L, TDS={s0.TDS_mg_L:.1f} mg/L")
    print("-" * 60)
    s1 = test_engine.update_state(source="Kitchen")
    print("Step 1 Advanced (+5 min):")
    print(f"  Timestamp    : {s1.timestamp}")
    print(f"  Source       : {s1.greywater_source}")
    print(f"  Tank Level   : {s1.tank_level_L:.1f} L")
    print(f"  Key Parameters: pH={s1.pH:.2f}, Turbidity={s1.TUR_NTU:.1f} NTU, COD={s1.COD_mg_L:.1f} mg/L, TDS={s1.TDS_mg_L:.1f} mg/L")
    print("=" * 60)
    print("Digital Twin Engine test executed successfully.")

