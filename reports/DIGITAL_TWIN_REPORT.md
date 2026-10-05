# Phase 8: Digital Twin & Synthetic Telemetry Simulation Report
## AI-Driven Intelligent Greywater Management and Smart Reuse Routing System

---

### 1. Digital Twin Architecture
The Digital Twin is a discrete-time virtual model representing the operational physics and chemistry of an intelligent greywater recycling plant. It maintains continuous state accounting for multi-source greywater inflows, 15 sensor readings, physical storage tank accumulation, transducer noise, sensor hardware faults, and controlled contamination shocks.

```text
Greywater Source Dynamics (Bathroom / Kitchen / Laundry / Mixed)
                          ↓
        Digital Twin Telemetry Simulation Engine
       (Mass Balance, Physical Bounds, Sensor Noise)
                          ↓
      Synthetic Telemetry Stream (288 steps / 24 hours)
                          ↓
    Model Inference Adapter (Zero Retraining / Real-Time)
     ├── Isolation Forest (Statistical Anomaly Screening)
     ├── Optimized XGBoost (4-Tier Routing Classification)
     └── Safety Override Arbitrator (Physical Cutoff Verification)
                          ↓
            Smart Actionable Routing Output
```

---

### 2. Reference Dataset & Empirical Profiles
The Digital Twin does not sample synthetic rows blindly. Instead, it anchors its generative distributions directly to the empirical statistical distributions computed from `dataset/processed/train.csv` (1,050 samples) across the 4 greywater sources (`simulation/source_statistical_profiles.json`):
- **Bathroom:** Mean pH = 6.99, Turbidity = 35.39 NTU, COD = 133.36 mg/L, TDS = 286.02 mg/L, E. coli = 37,693 CFU/100mL (Cleanest domestic source).
- **Kitchen:** Mean pH = 7.40, Turbidity = 116.77 NTU, COD = 755.04 mg/L, TDS = 607.25 mg/L, E. coli = 281,109 CFU/100mL (Heavily contaminated source).
- **Laundry:** Mean pH = 6.90, Turbidity = 94.06 NTU, COD = 579.12 mg/L, TDS = 434.19 mg/L, E. coli = 130,044 CFU/100mL (Elevated solids & surfactants).
- **Mixed:** Mean pH = 7.27, Turbidity = 67.17 NTU, COD = 326.18 mg/L, TDS = 323.91 mg/L, E. coli = 114,986 CFU/100mL (Composite intermediate source).

---

### 3. State Variables
The state of the virtual facility is captured at every discrete timestep by the `DigitalTwinState` data structure:
- **Temporal & Metadata (2):** `timestamp` (ISO format string), `greywater_source` (`Bathroom`, `Kitchen`, `Laundry`, `Mixed`)
- **Water Quality Sensors (15):** `pH`, `TEMP_C`, `SAL_ppt`, `TUR_NTU`, `DS_mg_L`, `TDS_mg_L`, `TSS_mg_L`, `COND_uS_cm`, `DO_mg_L`, `BOD_mg_L`, `COD_mg_L`, `NH4F_mg_L`, `NO3_mg_L`, `K_mg_L`, `E_coli_CFU_100mL`
- **Hydraulic & Storage State (3):** `flow_rate_L_min`, `tank_capacity_L` (1,000 L default), `tank_level_L` (volume in Liters)
- **Telemetry Health & Event Flags (2):** `sensor_status` (`OK`, `FAULT_STUCK_...`, `FAULT_DRIFT_...`), `event_name` (`normal`, `high_turbidity`, `high_organic_load`, `microbial_spike`, `multi_parameter_event`)

---

### 4. Telemetry Generation Mechanism
For each timestep:
1. Base water-quality values are drawn from source-conditional Gaussian distributions parameterized by empirical means and standard deviations.
2. Controlled contamination shocks are overlaid if an event is active.
3. Parameter-specific bounded measurement noise is added.
4. Sensor hardware faults (stuck values, electrochemical drift) are applied if configured.
5. All values are hard-clamped to physical bounds (e.g., pH in [4.0, 11.0], concentrations $\ge 0.0$).

---

### 5. Source-Specific Simulation Dynamics
Greywater sources transition dynamically following a realistic 24-hour domestic schedule:
- **06:00 to 09:00:** Morning showers (Bathroom source, high DO, low solids).
- **09:00 to 12:00:** Breakfast cooking & washing (Kitchen source, grease & organics).
- **12:00 to 16:00:** Afternoon laundry cycles (Laundry source, detergent alkalinity & solids).
- **16:00 to 20:00:** Evening dinner prep (Kitchen source, high COD/BOD & bacteria).
- **20:00 to 23:00:** Night showers (Bathroom source).
- **23:00 to 06:00:** Low-flow composite domestic circulation (Mixed source).

---

### 6. Temporal Simulation
- **Timestep:** 5 minutes (`DEFAULT_SIMULATION_INTERVAL_MIN = 5`)
- **Horizon:** 288 consecutive steps (24 hours full cycle)
- **Determinism:** Seeded random generator (`random_seed = 42`) guarantees exact numerical reproducibility.

---

### 7. Fluid Flow Model
Inflow rate $Q_{in}$ (L/min) is sampled continuously within source-specific operational capacity ranges:
- Bathroom: 8.0 to 22.0 L/min
- Kitchen: 4.0 to 14.0 L/min
- Laundry: 12.0 to 30.0 L/min
- Mixed: 10.0 to 35.0 L/min
- Constraint: $Q_{in} \ge 0.0$ strictly enforced.

---

### 8. Physical Storage Tank Mass Balance
Storage tank fluid dynamics follow mass conservation:
$$\text{Level}_{t+1} = \text{Level}_t + (Q_{in} - Q_{out}) \cdot \Delta t$$
- **Capacity Constraint:** Clamped strictly within $[0.0, \text{Capacity}]$ ($0 \le \text{Level} \le 1000\text{ L}$).
- **Outflow Management:** Discharges at 12.0 L/min treatment draw when tank level exceeds 15% capacity (150 L), preventing dry pump operation while preventing overflow.
- *Decay Modeling:* Reserved for Phase 9 biochemical decay modeling; physical fluid accounting only in Phase 8.

---

### 9. Sensor Noise Injection
Simulates real-world transducer jitter using bounded Gaussian noise ($0.5\%$ of parameter full-scale range). Values are clipped against non-negativity and thermodynamic limits.

---

### 10. Sensor Fault Simulation
The engine supports configurable hardware fault injection:
- **`sensor_fault_stuck`:** Simulates frozen sensor output at a constant value (e.g., Turbidity frozen at 75 NTU).
- **`sensor_fault_drift`:** Simulates electrochemical electrode degradation with cumulative drift rate $+0.1$ pH units/timestep.

---

### 11. Controlled Synthetic Contamination Test Events
To validate downstream safety overrides, 5 controlled shock events were scheduled across the 24-hour run:
1. **High Turbidity Event (Steps 50–65):** Turbidity surges to 165 NTU, TSS to 320 mg/L.
2. **High Organic Load Event (Steps 110–125):** COD spikes to 890 mg/L, BOD to 520 mg/L, DO drops to 0.3 mg/L.
3. **Microbial Pathogen Spike (Steps 170–185):** E. coli surges to 850,000 CFU/100mL.
4. **Sensor Drift Fault (Steps 215–230):** pH sensor drifts upward by +0.1 per step.
5. **Compound Contamination Event (Steps 250–265):** Simultaneous acidic pH (5.4), Turbidity (190 NTU), COD (960 mg/L), and E. coli (1,200,000 CFU/100mL).

---

### 12. Model Inference Integration (No Retraining)
The inference adapter [`simulation/model_inference.py`](file:///c:/Users/Lenovo/OneDrive/Documents/main%20project/simulation/model_inference.py) ingests raw telemetry, formats it into the 19 canonical features (with one-hot source indicators), and executes:
1. **Isolation Forest:** Outputs anomaly status (`True`/`False`) and continuous decision score.
2. **Optimized XGBoost:** Generates softmax probabilities across the 4 routing destinations.
3. **Safety Override Arbitrator:** Evaluates physical hazard thresholds.
*Result across 288 steps:*
- `NORMAL`: 178 steps (61.8%)
- `HIGH_RISK_REVIEW`: 86 steps (29.9%)
- `SEWER_BYPASS_OVERRIDE`: 24 steps (8.3%) — successfully intercepted all synthetic shock events!

---

### 13. Data Quality Validation
All 288 generated records were subjected to automated data quality checks (`reports/digital_twin_validation.md`):
- No negative concentrations: **PASSED (0 violations)**
- Physically bounded pH [4.0, 11.0]: **PASSED (0 violations)**
- Tank overflow prevention: **PASSED (0 violations)**
- Non-negative tank volume: **PASSED (0 violations)**
- Non-negative inflow rate: **PASSED (0 violations)**
- Strictly ordered timestamps: **PASSED (100% monotonic)**
- Zero unexpected NaNs: **PASSED (0 missing values)**

---

### 14. Important Scientific Limitation
> **"The Digital Twin telemetry is synthetic simulation data derived from the statistical characteristics of the supplied dataset. It is not a substitute for physical sensor measurements."**
