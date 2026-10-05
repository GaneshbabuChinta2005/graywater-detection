"""
Storage Adapter and Digital Twin / Weather Integration
AI-Driven Intelligent Greywater Management and Smart Reuse Routing System

Connects the Phase 8 Digital Twin synthetic telemetry streams and Phase 9 weather
environmental context with the Phase 10 StorageTank and StorageMonitor.

SCIENTIFIC DISCLAIMER:
All telemetry and deterioration outputs are synthetic simulation data.
The storage module provides an operational monitoring model, not an empirically
validated prediction of exact greywater shelf life.
"""

import os
import sys

# Ensure project root is in sys.path when executed directly
project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if project_root not in sys.path:
    sys.path.insert(0, project_root)

from datetime import datetime, timedelta, timezone
from typing import Dict, Any, List, Optional
import pandas as pd
import numpy as np

from storage.storage_manager import StorageTank, parse_timestamp
from storage.shelf_life import StorageMonitor
from storage.decay_model import BiochemicalDecayModel
from storage.config import (
    DEFAULT_TANK_CAPACITY_L,
    DEFAULT_INITIAL_LEVEL_L,
    TEMP_SOURCE_DIGITAL_TWIN,
    TEMP_SOURCE_WEATHER,
    TEMP_SOURCE_SIMULATION_DEFAULT
)
import context


class StorageSimulationAdapter:
    """
    Adapter coupling Digital Twin fluid dynamics and weather temperature context
    into the storage tank management subsystem.
    """
    def __init__(
        self,
        tank: Optional[StorageTank] = None,
        monitor: Optional[StorageMonitor] = None,
        use_weather_temperature: bool = False
    ):
        self.tank = tank if tank is not None else StorageTank(
            tank_id="TANK_PRIMARY_01",
            capacity_liters=DEFAULT_TANK_CAPACITY_L,
            initial_level_liters=DEFAULT_INITIAL_LEVEL_L
        )
        self.monitor = monitor if monitor is not None else StorageMonitor()
        self.use_weather_temperature = use_weather_temperature
        self.weather_provider = context.ModularWeatherProvider(offline_mode=True) if use_weather_temperature else None

    def process_telemetry_step(
        self,
        telemetry_row: Dict[str, Any],
        outflow_liters: float = 0.0,
        timestep_minutes: float = 5.0,
        water_quality_safety_status: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Process a single discrete telemetry record from the Digital Twin.
        
        Parameters
        ----------
        telemetry_row : dict
            Digital Twin sensor snapshot.
        outflow_liters : float
            Volume discharged from the tank during this interval.
        timestep_minutes : float
            Duration of the simulation step in minutes.
        water_quality_safety_status : str, optional
            Anomaly or safety status (e.g. 'NORMAL', 'SEWER_BYPASS_OVERRIDE').
            
        Returns
        -------
        dict
            Combined storage state and shelf-life assessment.
        """
        ts = telemetry_row.get("timestamp", datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC"))
        source = telemetry_row.get("greywater_source", "Mixed")
        flow_rate = float(telemetry_row.get("flow_rate_L_min", 10.0))
        inflow_vol = max(0.0, flow_rate * timestep_minutes)

        # Resolve temperature context
        temp_c = float(telemetry_row.get("TEMP_C", 22.0))
        temp_source = TEMP_SOURCE_DIGITAL_TWIN

        if self.use_weather_temperature and self.weather_provider:
            try:
                weather_data = self.weather_provider.get_weather()
                if weather_data.get("weather_status") != "UNAVAILABLE":
                    temp_c = float(weather_data.get("temperature_C", temp_c))
                    temp_source = TEMP_SOURCE_WEATHER
            except Exception:
                temp_source = TEMP_SOURCE_DIGITAL_TWIN

        # Quality features dictionary
        quality_keys = [
            "pH", "TEMP_C", "SAL_ppt", "TUR_NTU", "DS_mg_L", "TDS_mg_L", "TSS_mg_L",
            "COND_uS_cm", "DO_mg_L", "BOD_mg_L", "COD_mg_L", "NH4F_mg_L", "NO3_mg_L",
            "K_mg_L", "E_coli_CFU_100mL"
        ]
        quality_features = {k: float(telemetry_row[k]) for k in quality_keys if k in telemetry_row}

        # Outflow first (if any)
        if outflow_liters > 0:
            actual_outflow = min(outflow_liters, self.tank.current_level_liters)
            if actual_outflow > 0:
                self.tank.remove_outflow(actual_outflow, ts)

        # Inflow second (clamped to available capacity to prevent unhandled overflow in simulation)
        avail = self.tank.get_available_capacity()
        actual_inflow = min(inflow_vol, avail)
        if actual_inflow > 0:
            self.tank.add_inflow(
                volume=actual_inflow,
                timestamp=ts,
                source=source,
                quality_data=quality_features,
                temperature_C=temp_c,
                temperature_source=temp_source
            )
        else:
            self.tank.update_temperature(temp_c, temp_source)

        # Assess state and shelf life
        tank_state = self.tank.get_state(current_timestamp=ts)
        assessment = self.monitor.assess_shelf_life(
            tank_state=tank_state,
            initial_water_quality_status=water_quality_safety_status
        )

        return {
            "timestamp": ts,
            "tank_id": self.tank.tank_id,
            "source": source,
            "current_level_liters": assessment["current_level_liters"],
            "capacity_liters": self.tank.capacity_liters,
            "fill_percentage": assessment["fill_percentage"],
            "storage_age_hours": assessment["storage_age_hours"],
            "temperature_C": assessment["temperature_C"],
            "temperature_source": assessment["temperature_source"],
            "deterioration_index": assessment["deterioration_index"],
            "deterioration_status": assessment["deterioration_status"],
            "stagnation_status": assessment["stagnation_status"],
            "shelf_life_status": assessment["shelf_life_status"],
            "estimated_remaining_time_hours": assessment["estimated_remaining_time_hours"],
            "microbial_risk_status": assessment["microbial_risk_status"],
            "recommended_storage_action": assessment["recommended_storage_action"],
            "inflow_volume_liters": round(actual_inflow, 2),
            "outflow_volume_liters": round(outflow_liters, 2)
        }


def run_storage_simulation(
    telemetry_path: str = "simulation/data/synthetic_telemetry.csv",
    output_path: str = "simulation/data/storage_monitoring_output.csv"
) -> pd.DataFrame:
    """
    Run complete 24-hour storage simulation over Phase 8 synthetic telemetry.
    """
    if not os.path.exists(telemetry_path):
        raise FileNotFoundError(f"Telemetry file not found: {telemetry_path}")

    df_telemetry = pd.read_csv(telemetry_path)
    
    # Initialize StorageTank with 250L initial level
    tank = StorageTank(
        tank_id="TANK_PRIMARY_01",
        capacity_liters=1000.0,
        initial_level_liters=250.0,
        initial_timestamp=df_telemetry.iloc[0]["timestamp"],
        initial_temperature_C=float(df_telemetry.iloc[0].get("TEMP_C", 22.0))
    )
    monitor = StorageMonitor()
    adapter = StorageSimulationAdapter(tank=tank, monitor=monitor)

    results = []
    
    # Simulate realistic intermittent outflow (e.g. pump cycle every 30 minutes)
    for idx, row in df_telemetry.iterrows():
        # Every 6 steps (30 min), if tank level > 300L, draw 40L for treatment/irrigation
        outflow = 0.0
        if idx % 6 == 0 and tank.current_level_liters > 300.0:
            outflow = 45.0

        event_name = str(row.get("event_name", "normal"))
        safety_status = "NORMAL"
        if event_name in ("microbial_spike", "multi_parameter_event", "high_organic_load"):
            safety_status = "SEWER_BYPASS_OVERRIDE"

        res = adapter.process_telemetry_step(
            telemetry_row=row.to_dict(),
            outflow_liters=outflow,
            timestep_minutes=5.0,
            water_quality_safety_status=safety_status
        )
        results.append(res)

    df_out = pd.DataFrame(results)
    
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    df_out.to_csv(output_path, index=False)
    print(f"Saved storage monitoring output to: {output_path} ({len(df_out)} rows)")
    return df_out


if __name__ == "__main__":
    print("=" * 60)
    print("Storage Simulation Adapter - Operational Test")
    print("=" * 60)
    adapter = StorageSimulationAdapter()
    sample_telemetry = {
        "timestamp": "2026-10-02 06:00:00",
        "greywater_source": "Bathroom",
        "TEMP_C": 22.5,
        "DO_mg_L": 4.5,
        "flow_rate_L_min": 15.0,
        "tank_level_L": 250.0
    }
    result = adapter.process_telemetry_step(sample_telemetry, outflow_liters=10.0)
    rem_h = result.get('estimated_remaining_time_hours')
    rem_str = f"{rem_h:.1f} hours" if isinstance(rem_h, (int, float)) else "N/A (Fresh / Unconstrained)"
    print("Storage Step Processed:")
    print(f"  Tank Level     : {result['current_level_liters']:.1f} L")
    print(f"  Shelf Life     : {result['shelf_life_status']}")
    print(f"  Remaining Life : {rem_str}")
    print(f"  Storage Action : {result['recommended_storage_action']}")
    print("=" * 60)
    print("Storage Simulation Adapter test executed successfully.")

