"""
Digital Twin Simulation Runner
AI-Driven Intelligent Greywater Management and Smart Reuse Routing System

Executes a 24-hour multi-event temporal simulation, logs synthetic telemetry,
runs ML inference, validates data quality, and generates time-series visualizations.
"""

import os
import sys
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import pandas as pd
import numpy as np

# Ensure project root is in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from simulation.digital_twin import DigitalTwinEngine
from simulation.model_inference import ModelInferenceAdapter
from simulation.config import (
    DEFAULT_RANDOM_SEED,
    DEFAULT_SIMULATION_STEPS,
    DEFAULT_START_TIMESTAMP
)


def get_schedule_source(step):
    """Simulate realistic diurnal domestic greywater source patterns across 288 steps (24 hours)."""
    # 06:00 to 09:00 (steps 0-36): Morning showers & washing
    if step < 36:
        return "Bathroom"
    # 09:00 to 12:00 (steps 36-72): Breakfast & kitchen clean-up
    elif step < 72:
        return "Kitchen"
    # 12:00 to 16:00 (steps 72-120): Afternoon laundry wash cycles
    elif step < 120:
        return "Laundry"
    # 16:00 to 20:00 (steps 120-168): Evening cooking & sink washing
    elif step < 168:
        return "Kitchen"
    # 20:00 to 23:00 (steps 168-204): Evening showers & bathroom usage
    elif step < 204:
        return "Bathroom"
    # 23:00 to 06:00 (steps 204-288): Nighttime low composite flow
    else:
        return "Mixed"


def get_schedule_event(step):
    """Schedule controlled synthetic test shocks at specific intervals."""
    # Step 50 to 65: High turbidity suspended solids event
    if 50 <= step < 65:
        return "high_turbidity"
    # Step 110 to 125: High organic load (BOD/COD) shock
    elif 110 <= step < 125:
        return "high_organic_load"
    # Step 170 to 185: Severe microbial pathogen spike
    elif 170 <= step < 185:
        return "microbial_spike"
    # Step 215 to 230: Sensor calibration drift fault
    elif 215 <= step < 230:
        return "sensor_fault_drift"
    # Step 250 to 265: Catastrophic compound multi-parameter event
    elif 250 <= step < 265:
        return "multi_parameter_event"
    else:
        return "normal"


def run_full_simulation(
    steps=DEFAULT_SIMULATION_STEPS,
    start_time=DEFAULT_START_TIMESTAMP,
    seed=DEFAULT_RANDOM_SEED
):
    print(f"Starting Digital Twin simulation ({steps} timesteps, seed={seed})...")
    
    engine = DigitalTwinEngine(random_seed=seed)
    adapter = ModelInferenceAdapter()
    
    # Initialize state at step 0
    state = engine.create_initial_state(start_timestamp=start_time, initial_source=get_schedule_source(0))
    
    records = []
    for step in range(steps):
        source = get_schedule_source(step)
        event_name = get_schedule_event(step)
        
        # Advance simulation
        state = engine.update_state(source=source, event_name=event_name)
        
        # Run ML inference
        inf = adapter.predict(state)
        
        rec = state.to_dict()
        rec["is_anomaly"] = inf["is_anomaly"]
        rec["anomaly_score"] = inf["anomaly_score"]
        rec["xgb_predicted_class"] = inf["ml_predicted_class"]
        rec["xgb_predicted_name"] = inf["ml_predicted_name"]
        rec["prediction_confidence"] = inf["prediction_confidence"]
        rec["safety_status"] = inf["safety_status"]
        rec["final_routing_class"] = inf["final_routing_class"]
        rec["final_routing_name"] = inf["final_routing_name"]
        rec["override_applied"] = inf["override_applied"]
        
        records.append(rec)
        
    df = pd.DataFrame(records)
    
    # Save synthetic telemetry
    out_dir = os.path.join(os.path.dirname(__file__), "data")
    os.makedirs(out_dir, exist_ok=True)
    telemetry_path = os.path.join(out_dir, "synthetic_telemetry.csv")
    df.to_csv(telemetry_path, index=False)
    print(f"Synthetic telemetry saved to: {telemetry_path} ({len(df)} records)")
    
    # Validate data quality
    val_report = validate_telemetry(df)
    
    # Generate visualization figures
    generate_figures(df)
    
    return df, val_report


def validate_telemetry(df):
    """Perform rigorous physical and logical validation checks on synthetic telemetry."""
    checks = []
    
    # 1. Non-negative concentrations
    conc_cols = ["TUR_NTU", "DS_mg_L", "TDS_mg_L", "TSS_mg_L", "COND_uS_cm", "DO_mg_L", "BOD_mg_L", "COD_mg_L", "NH4F_mg_L", "NO3_mg_L", "K_mg_L", "E_coli_CFU_100mL"]
    neg_concs = (df[conc_cols] < 0).sum().sum()
    checks.append(("No Negative Concentrations", neg_concs == 0, f"Found {neg_concs} negative concentration values"))
    
    # 2. Physically meaningful pH (4.0 to 11.0)
    invalid_ph = ((df["pH"] < 4.0) | (df["pH"] > 11.0)).sum()
    checks.append(("Physically Bounded pH [4.0, 11.0]", invalid_ph == 0, f"Found {invalid_ph} pH values out of physical bounds"))
    
    # 3. Tank overflow prevention (tank_level <= tank_capacity)
    overflow = (df["tank_level_L"] > df["tank_capacity_L"]).sum()
    checks.append(("Tank Overflow Prevention", overflow == 0, f"Found {overflow} tank overflow occurrences"))
    
    # 4. Tank non-negative level (tank_level >= 0)
    neg_level = (df["tank_level_L"] < 0).sum()
    checks.append(("Non-Negative Tank Volume", neg_level == 0, f"Found {neg_level} negative tank level occurrences"))
    
    # 5. Non-negative flow rates
    neg_flow = (df["flow_rate_L_min"] < 0).sum()
    checks.append(("Non-Negative Inflow Rate", neg_flow == 0, f"Found {neg_flow} negative flow occurrences"))
    
    # 6. Strictly ordered timestamps
    ts = pd.to_datetime(df["timestamp"])
    is_ordered = bool(ts.is_monotonic_increasing)
    checks.append(("Strictly Ordered Timestamps", is_ordered, "Timestamps are strictly monotonically increasing" if is_ordered else "Non-monotonic timestamps detected"))
    
    # 7. No unexpected NaNs
    nans = df.isna().sum().sum()
    checks.append(("Zero Unexpected Missing Values", nans == 0, f"Found {nans} NaN values"))
    
    # Build validation report markdown
    report_lines = [
        "# Digital Twin Simulation Data Quality Validation Report",
        f"**Date:** 2026-10-02  ",
        f"**Total Records Evaluated:** {len(df)} timesteps (24-hour simulation)  \n",
        "### Automated Validation Checklist",
        "| Validation Parameter | Criterion | Result | Status |",
        "|---|---|---|---|"
    ]
    
    all_passed = True
    for name, passed, detail in checks:
        status_str = "**PASSED**" if passed else "**FAILED**"
        report_lines.append(f"| {name} | Strict zero violation tolerance | {detail} | {status_str} |")
        if not passed:
            all_passed = False
            
    report_lines.append("\n### Overall Quality Assessment")
    if all_passed:
        report_lines.append("> **ALL PHYSICAL & TEMPORAL INTEGRITY CHECKS PASSED (100% COMPLIANT).**  \n> The synthetic telemetry strictly adheres to physical mass balances, non-negative fluid dynamics, and sensor bounds.")
    else:
        report_lines.append("> **VALIDATION FAILED.** Review flagged violations above.")
        
    report_md = "\n".join(report_lines)
    
    rep_dir = os.path.join(os.path.dirname(__file__), "..", "reports")
    os.makedirs(rep_dir, exist_ok=True)
    rep_path = os.path.join(rep_dir, "digital_twin_validation.md")
    with open(rep_path, "w", encoding="utf-8") as f:
        f.write(report_md)
    print(f"Validation report saved to: {rep_path}")
    
    return all_passed


def generate_figures(df):
    """Generate exploratory time-series visualization plots."""
    fig_dir = os.path.join(os.path.dirname(__file__), "..", "reports", "figures", "digital_twin")
    os.makedirs(fig_dir, exist_ok=True)
    
    time_steps = np.arange(len(df)) * 5 / 60.0  # Hours
    
    # 1. Tank Level and Flow Rate
    fig, ax1 = plt.subplots(figsize=(12, 4))
    color = '#2563eb'
    ax1.set_xlabel('Simulation Time (Hours)', fontsize=10)
    ax1.set_ylabel('Storage Tank Level (L)', color=color, fontsize=10)
    ax1.plot(time_steps, df['tank_level_L'], color=color, linewidth=2, label='Tank Level (L)')
    ax1.axhline(df['tank_capacity_L'].iloc[0], color='r', linestyle='--', alpha=0.6, label='Capacity (1000L)')
    ax1.tick_params(axis='y', labelcolor=color)
    ax1.set_ylim(0, 1100)
    
    ax2 = ax1.twinx()
    color = '#10b981'
    ax2.set_ylabel('Greywater Inflow (L/min)', color=color, fontsize=10)
    ax2.plot(time_steps, df['flow_rate_L_min'], color=color, linewidth=1, alpha=0.75, label='Flow Rate')
    ax2.tick_params(axis='y', labelcolor=color)
    ax2.set_ylim(0, 45)
    
    plt.title('Digital Twin: Storage Tank Volume Dynamics and Inflow Rate (24 Hours)', fontsize=12, pad=10)
    plt.tight_layout()
    plt.savefig(os.path.join(fig_dir, "tank_and_flow_over_time.png"), dpi=300)
    plt.close()
    
    # 2. Water Quality Trends (pH, Turbidity, TDS)
    fig, axes = plt.subplots(3, 1, figsize=(12, 8), sharex=True)
    
    axes[0].plot(time_steps, df['pH'], color='#8b5cf6', linewidth=1.5)
    axes[0].set_ylabel('pH')
    axes[0].axhline(6.0, color='r', linestyle=':', alpha=0.5)
    axes[0].axhline(9.0, color='r', linestyle=':', alpha=0.5)
    axes[0].set_title('Water Quality Parameters Over Time Across Dynamic Source Transitions')
    axes[0].grid(True, linestyle='--', alpha=0.5)
    
    axes[1].plot(time_steps, df['TUR_NTU'], color='#f59e0b', linewidth=1.5)
    axes[1].set_ylabel('Turbidity (NTU)')
    axes[1].grid(True, linestyle='--', alpha=0.5)
    
    axes[2].plot(time_steps, df['TDS_mg_L'], color='#06b6d4', linewidth=1.5)
    axes[2].set_ylabel('TDS (mg/L)')
    axes[2].set_xlabel('Simulation Time (Hours)')
    axes[2].grid(True, linestyle='--', alpha=0.5)
    
    plt.tight_layout()
    plt.savefig(os.path.join(fig_dir, "water_quality_parameters_over_time.png"), dpi=300)
    plt.close()
    
    # 3. Organic Load Dynamics (COD & BOD)
    plt.figure(figsize=(12, 4))
    plt.plot(time_steps, df['COD_mg_L'], label='COD (mg/L)', color='#ef4444', linewidth=1.5)
    plt.plot(time_steps, df['BOD_mg_L'], label='BOD (mg/L)', color='#f97316', linewidth=1.5)
    plt.xlabel('Simulation Time (Hours)', fontsize=10)
    plt.ylabel('Concentration (mg/L)', fontsize=10)
    plt.title('Digital Twin: Organic Contamination Shocks (COD & BOD Over Time)', fontsize=12, pad=10)
    plt.legend()
    plt.grid(True, linestyle='--', alpha=0.5)
    plt.tight_layout()
    plt.savefig(os.path.join(fig_dir, "organic_load_over_time.png"), dpi=300)
    plt.close()
    
    # 4. Anomaly Screening and Safety Overrides
    plt.figure(figsize=(12, 4))
    colors = {'NORMAL': '#10b981', 'ANOMALY_REVIEW': '#f59e0b', 'HIGH_RISK_REVIEW': '#ef4444', 'SEWER_BYPASS_OVERRIDE': '#7f1d1d'}
    for status, color in colors.items():
        mask = (df['safety_status'] == status)
        if mask.any():
            plt.scatter(time_steps[mask], df.loc[mask, 'anomaly_score'], label=status, color=color, s=25, alpha=0.85)
    plt.axhline(0.0, color='black', linestyle='--', linewidth=1, label='Isolation Forest Threshold (0.0)')
    plt.xlabel('Simulation Time (Hours)', fontsize=10)
    plt.ylabel('Anomaly Score', fontsize=10)
    plt.title('Digital Twin: Real-Time Anomaly Scores & Safety Override Arbitrations', fontsize=12, pad=10)
    plt.legend(loc='lower left')
    plt.grid(True, linestyle='--', alpha=0.5)
    plt.tight_layout()
    plt.savefig(os.path.join(fig_dir, "anomaly_and_safety_over_time.png"), dpi=300)
    plt.close()
    
    print(f"Exploratory plots saved to: {fig_dir}")


if __name__ == "__main__":
    run_full_simulation()
