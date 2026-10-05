# Phase 10: Storage Tank Monitoring and Biochemical Deterioration Report
## AI-Driven Intelligent Greywater Management and Smart Reuse Routing System

**Project Phase:** Phase 10 — Storage Tank Monitoring + Biochemical Decay / Shelf-Life Estimation  
**Date:** October 2026  
**Status:** Completed & Validated  

---

### Mandatory Scientific Disclaimer
> **"The current dataset does not contain longitudinal storage experiments. Therefore, this module provides a configurable mechanistic/operational deterioration estimate rather than an empirically validated prediction of exact greywater shelf life."**
>
> All kinetic degradation constants ($k_{ref}$), Arrhenius activation energies ($E_a$), and temperature coefficients ($\theta$) are unvalidated operational parameters for simulation. They do not represent experimentally verified safe shelf lives.

---

## 1. Objective & Operational Purpose

The objective of Phase 10 is to build an intelligent physical storage monitoring layer and mechanistic biochemical deterioration estimation subsystem.

In an intelligent greywater recycling facility:
- When environmental context (Phase 9 weather) suppresses or defers landscape irrigation due to heavy rainfall, greywater must be temporarily diverted into retention storage tanks.
- Stored greywater undergoes continuous biochemical changes: residual dissolved oxygen (DO) is consumed by heterotrophic bacteria, organic matter exerts biochemical oxygen demand (BOD/COD), and stagnant conditions increase pathogen risk.
- Phase 10 monitors mass balance, volume-weighted fluid age, thermal acceleration, stagnation dormancy, and multi-factor deterioration indices to determine whether stored greywater remains fresh, requires prioritization, or must be emptied to prevent biohazardous septic conditions.

---

## 2. End-to-End System Integration Architecture

```
                    +------------------------------------------+
                    |  Digital Twin Telemetry (Phase 8)        |
                    +------------------------------------------+
                                         |
                                         v
                    +------------------------------------------+
                    | Isolation Forest Anomaly Filter (Phase 7)|
                    +------------------------------------------+
                                         |
                                         v
                    +------------------------------------------+
                    | XGBoost 4-Class Initial Route (Phase 6)  |
                    +------------------------------------------+
                                         |
                                         v
                    +------------------------------------------+
                    | Weather Context Evaluation (Phase 9)     |
                    +------------------------------------------+
                                         |
                                (STORE_FOR_LATER / DEFER)
                                         |
                                         v
==================> [PHASE 10: STORAGE & DECAY MONITORING] <==================
+----------------------------------------------------------------------------+
| 1. Physical Tank Accounting:  V_t = V_{t-1} + V_in - V_out                |
| 2. Batch FIFO Age Tracking:   Age_weighted = sum(V_i * Age_i) / sum(V_i)   |
| 3. Kinetic Decay Kinetics:    C(t) = C0 * exp(-k(T) * t)                   |
| 4. Thermal Arrhenius Model:   k(T) = k_ref * exp[-Ea/R * (1/T - 1/T_ref)]  |
| 5. Multi-Factor Index:        Deterioration Score in [0.0, 1.0]            |
| 6. Stagnation Detection:      Turnover & Inactivity Monitoring             |
+----------------------------------------------------------------------------+
                                         |
                                         v
                    +------------------------------------------+
                    | Smart Context-Aware Routing (Phase 11)   |
                    +------------------------------------------+
```

---

## 3. Storage Tank Physical Model & Mass Balance

The `StorageTank` class ([storage/storage_manager.py](file:///c:/Users/Lenovo/OneDrive/Documents/main%20project/storage/storage_manager.py)) enforces physical fluid mechanics and conservation of mass:

$$V_t = V_{t-1} + V_{in} - V_{out}$$

### Physical Invariants & Operational Protections
1. **Capacity Clamping**: $0 \le V_t \le V_{capacity}$ ($V_{capacity} = 1000.0\text{ L}$).
2. **Overflow Prevention**: If $V_{in} > (V_{capacity} - V_{t-1})$, the tank rejects the excess inflow and raises `ValueError`.
3. **Underflow Prevention**: If $V_{out} > V_t$, the tank rejects the withdrawal and raises `ValueError`.
4. **Non-Negative Volume Rejection**: Inflows or outflows with volume $\le 0\text{ L}$ are strictly rejected.
5. **Dynamic Metrics**:
   $$\text{Fill Percentage} = \left(\frac{V_t}{V_{capacity}}\right) \times 100\%$$
   $$\text{Available Capacity} = V_{capacity} - V_t$$

---

## 4. Batch-Aware FIFO Storage Age Tracking

A simplistic approach that resets tank age whenever new inflow arrives under-reports the presence of stagnant water. Conversely, taking only the oldest drop ignores diluting fresh inflows.

The system implements **Batch-Aware FIFO Volume-Weighted Age Tracking**:
- Each inflow is logged as a discrete `StorageBatch`:
  - `batch_id`: Unique identifier (e.g. `B_a1b2c3`)
  - `volume_liters`: Fluid volume of batch
  - `inflow_timestamp`: Inflow entry time
  - `source`: Greywater source category (`Bathroom`, `Kitchen`, `Laundry`, `Mixed`)
  - `quality_data`: Baseline water quality parameters
- **FIFO Outflow Drainage**: Outflows drain the oldest batch first. Once depleted, the batch is removed from memory.
- **Composite Fluid Age**:
  $$\text{Storage Age}_{weighted} = \frac{\sum_{i=1}^N \left(V_i \times \text{Age}_i(t)\right)}{\sum_{i=1}^N V_i}$$
  where $\text{Age}_i(t) = t - t_{inflow, i}$.
- If the tank is completely drained ($V_t = 0\text{ L}$), age resets to $0.0\text{ hours}$.

---

## 5. Temperature Context Resolution

Water temperature profoundly influences bacterial metabolism and chemical kinetics. Temperature is resolved hierarchically without fabricating live environmental data:
1. `DIGITAL_TWIN`: Real-time temperature from telemetry sensor streams.
2. `WEATHER`: Ambient dry-bulb temperature from the Phase 9 weather provider.
3. `USER_CONFIGURED`: Operator set-point.
4. `SIMULATION_DEFAULT`: Default neutral reference ($20.0^\circ\text{C}$).
5. `UNAVAILABLE`: Explicit flag triggering temperature-neutral operation.

---

## 6. Biochemical Decay Equations & Kinetic Models

Parameter evolution is governed by modular mechanistic formulations:

### First-Order Decay Kinetics
$$C(t) = C_0 \cdot \exp\left(-k(T) \cdot t\right)$$
where $C_0$ is the initial concentration, $t$ is the elapsed storage time in decimal hours, and $k(T)$ is the temperature-adjusted degradation rate ($\text{hr}^{-1}$).

### Temperature Dependence: Arrhenius Equation
To account for thermal kinetic acceleration:
$$k(T) = k_{ref} \cdot \exp\left[-\frac{E_a}{R}\left(\frac{1}{T_K} - \frac{1}{T_{ref, K}}\right)\right]$$
where:
- $T_K = T_{^\circ\text{C}} + 273.15$ (Kelvin)
- $T_{ref, K} = 293.15\text{ K}$ ($20^\circ\text{C}$)
- $R = 8.314\text{ J}/(\text{mol}\cdot\text{K})$
- $E_a$ is the activation energy ($\text{J}/\text{mol}$)

---

## 7. Parameter Sources, Status, and Model Categories

Parameters are separated into three rigorously documented categories ([storage/config.py](file:///c:/Users/Lenovo/OneDrive/Documents/main%20project/storage/config.py)):

| Parameter | Model Category | Parameter Status | Default $k_{ref}$ ($\text{hr}^{-1}$) | Activation Energy $E_a$ | Empirical Basis / Description |
|:---|:---:|:---:|:---:|:---:|:---|
| **`BOD_mg_L`** | `SUPPORTED_KINETIC_MODEL` | `UNVALIDATED` | 0.025 | $45,000\text{ J/mol}$ | First-order aerobic microbial oxidation of organic substrate |
| **`COD_mg_L`** | `SUPPORTED_KINETIC_MODEL` | `UNVALIDATED` | 0.012 | $35,000\text{ J/mol}$ | Chemical oxygen demand stabilization |
| **`DO_mg_L`** | `RELATIVE_RISK_PROXY` | `UNVALIDATED` | 0.080 (depletion) | — | Heterotrophic respiration leading to oxygen depletion & anoxia |
| **`TUR_NTU`** | `RELATIVE_RISK_PROXY` | `UNVALIDATED` | 0.015 (settling) | — | Gravitational clarification / sedimentation in quiescent tank |
| **`E_coli_CFU_100mL`** | `NOT_MODELED` | `UNVALIDATED` | N/A | N/A | **`microbial_risk_status = "NOT_EMPIRICALLY_VALIDATED"`** |

*Crucial Distinction:* Microbial pathogen populations (*E. coli*) do not adhere to simplistic first-order decay in raw greywater; bacterial regrowth, nutrient availability, and surfactant toxicity require empirical culturing. The system preserves the original *E. coli* count and flags `microbial_risk_status="NOT_EMPIRICALLY_VALIDATED"`.

---

## 8. Multi-Factor Deterioration Index

The composite deterioration index $[0.0, 1.0]$ combines 5 normalized operational factors:

$$\text{Index} = w_1 \cdot f_{age} + w_2 \cdot f_{temp} + w_3 \cdot f_{organic} + w_4 \cdot f_{oxygen} + w_5 \cdot f_{stagnation}$$

### Factor Definitions & Weights
1. **$f_{age}$ (Weight: 0.35)**: $\min(1.0, \text{Storage Age} / 48.0\text{ hrs})$.
2. **$f_{temp}$ (Weight: 0.20)**: $\min(1.0, \max(0.0, (T - 15.0) / 25.0))$.
3. **$f_{organic}$ (Weight: 0.20)**: Exertion fraction: $1 - \frac{BOD(t)}{BOD_0}$.
4. **$f_{oxygen}$ (Weight: 0.15)**: Depletion fraction: $1 - \frac{DO(t)}{DO_0}$.
5. **$f_{stagnation}$ (Weight: 0.10)**: Inactivity fraction: $\min(1.0, \text{Idle Hours} / 24.0\text{ hrs})$.

### Operational Deterioration Bands
- **`0.00 – 0.25: LOW_DETERIORATION`**: Freshly collected greywater; nominal conditions.
- **`0.25 – 0.50: MODERATE_DETERIORATION`**: Stored greywater aging; monitor closely.
- **`0.50 – 0.75: HIGH_DETERIORATION`**: Significant degradation; prioritize consumption.
- **`0.75 – 1.00: CRITICAL_REVIEW`**: Excessive retention; empty and reassess.

---

## 9. Stagnation Detection

Operational stagnation monitoring detects prolonged lack of hydraulic turnover:
- **`NORMAL`**: Inactive $< 12.0\text{ hours}$. Active fluid turnover.
- **`LOW_TURNOVER`**: Inactive between $12.0$ and $24.0\text{ hours}$.
- **`STAGNANT`**: Inactive $\ge 24.0\text{ hours}$ or composite age $\ge 24.0\text{ hours}$.
- **`HIGH_STAGNATION_RISK`**: Inactive $\ge 36.0\text{ hours}$, or inactive $\ge 24.0\text{ hours}$ with deterioration index $\ge 0.50$.

---

## 10. Operational Shelf-Life Estimation

Because cross-sectional data cannot empirically prove exact expiry timestamps:
- **`estimated_remaining_time_hours = null`** (transparently avoided inventing arbitrary hours).
- **`shelf_life_status`**:
  - `FRESH` (Index $< 0.25$)
  - `MONITOR` ($0.25 \le \text{Index} < 0.50$)
  - `AGING` ($0.50 \le \text{Index} < 0.75$)
  - `HIGH_RISK_REVIEW` ($\text{Index} \ge 0.75$)
  - `NOT_VALIDATED_FOR_EXACT_SHELF_LIFE` (Strict mode)

### Recommended Storage Operational Actions
- `CONTINUE_MONITORING`: Tank level and age within nominal bounds.
- `PRIORITIZE_USE`: Greywater aging; dispatch to available reuse pathways.
- `REDUCE_STORAGE_TIME`: Low turnover detected; cycle storage volume.
- `REVIEW_WATER_QUALITY`: High deterioration; verify parameters prior to discharge.
- `EMPTY_AND_REASSESS`: Stagnation risk or severe decay; drain tank.
- `SAFETY_REVIEW`: Upstream water quality safety override triggered.

---

## 11. Digital Twin Integration & Verification

The storage subsystem was coupled to the Phase 8 Digital Twin via [simulation/storage_adapter.py](file:///c:/Users/Lenovo/OneDrive/Documents/main%20project/simulation/storage_adapter.py).

Telemetry from [simulation/data/synthetic_telemetry.csv](file:///c:/Users/Lenovo/OneDrive/Documents/main%20project/simulation/data/synthetic_telemetry.csv) (288 timesteps, 24 hours) was processed step-by-step with intermittent treatment pump draws. Output was successfully serialized to [simulation/data/storage_monitoring_output.csv](file:///c:/Users/Lenovo/OneDrive/Documents/main%20project/simulation/data/storage_monitoring_output.csv).

---

## 12. Weather Module Integration

Weather temperature context from Phase 9 (`context/weather_provider.py`) feeds the temperature context engine when sensor probes are uncalibrated or during outdoor ambient temperature tracking.
- Weather availability failures cleanly fall back to `DIGITAL_TWIN` or default reference ($20^\circ\text{C}$).
- Weather context **NEVER** overrides storage safety cutoffs.

---

## 13. Controlled Simulation Verification Scenarios

| Scenario | Conditions | Observed Storage State | Resulting Action |
|:---|:---|:---|:---|
| **Scenario A: Fresh Inflow** | Fresh $150\text{ L}$ inflow at $t=0.5\text{ h}$ | Age: $0.5\text{ h}$, Index: $0.054$, `FRESH` | `CONTINUE_MONITORING` |
| **Scenario B: Continuous Inflow** | Continuous inflow over 24 hours | Fluid volume tracked continuously within $0–1000\text{ L}$ | `CONTINUE_MONITORING` / `PRIORITIZE_USE` |
| **Scenario C: Long Storage Period** | Retained for $36\text{ hours}$ | Age: $36.0\text{ h}$, Index: $0.663$, `AGING` | `EMPTY_AND_REASSESS` |
| **Scenario D: Thermal Sensitivity** | $36\text{ h}$ at $18^\circ\text{C}$ vs $35^\circ\text{C}$ | Index increased from $0.635$ ($18^\circ\text{C}$) to $0.849$ ($35^\circ\text{C}$) | Accelerated decay verified |
| **Scenario E: Extended Inactivity** | $30\text{ h}$ without outflow | Stagnation: `HIGH_STAGNATION_RISK` | `EMPTY_AND_REASSESS` |
| **Scenario F: High-Risk Water Quality** | Influent with `SEWER_BYPASS_OVERRIDE` | Immediate override | `SAFETY_REVIEW` |

---

## 14. Validation Limitations

1. **No Longitudinal Sensor Data**: The project dataset (`dataset/main.csv`) contains cross-sectional snapshots of diverse greywater samples, not decay over hours or days.
2. **First-Order Approximation**: Real microbial greywater degradation involves complex enzymatic hydrolysis and biofilm kinetics that deviate from ideal first-order decay.
3. **Quiescent Settling**: Hydraulic mixing and sediment resuspension during pump cycles are simplified into bulk batch properties.

---

## 15. Safety Limitations

1. **Safety Precedence**: Water quality safety (extreme $E. coli$, toxic chemicals, low pH) strictly supersedes storage retention.
2. **No Disinfection Claim**: Deterioration indices measure degradation progress, not purification or disinfection.
3. **Anaerobic Hazard**: Greywater stored beyond 24–48 hours without aeration risks hydrogen sulfide ($H_2S$) generation and severe odor nuisance.

---

## 16. Future Experimental Validation Roadmap

When pilot-scale experimental testbeds become available:
1. Conduct 72-hour batch storage experiments with sampling every 2 hours under controlled temperatures ($15^\circ\text{C}, 25^\circ\text{C}, 35^\circ\text{C}$).
2. Perform non-linear regression to fit empirical $k_{BOD}$, $k_{COD}$, and Arrhenius $E_a$ parameters.
3. Quantify microbiological regrowths and biofilm formation rates.
4. Replace unvalidated configuration parameters with empirically verified constants.
