# Synthetic Digital Twin Simulation Documentation
## AI-Driven Intelligent Greywater Management and Smart Reuse Routing System

---

### 1. Purpose & Cyber-Physical Concept

> [!IMPORTANT]
> **SYNTHETIC DIGITAL TWIN SPECIFICATION:**
> **The telemetry data described herein is generated via a physics-constrained numerical simulation. This software platform is a simulation prototype and does NOT represent a physical hardware or physical sensor deployment.**

The primary purpose of the Digital Twin layer is to emulate the continuous, time-varying hydraulic and water-quality dynamics of a decentralized residential greywater recycling installation. Because real-world continuous sampling of 14 simultaneous parameters is cost-prohibitive in academic and pre-deployment prototyping, the Digital Twin provides realistic telemetry streams to stress-test downstream machine learning, anomaly screening, weather context, and storage arbitration.

* **Module Location:** `simulation/` (`digital_twin.py`, `greywater_simulator.py`, `telemetry_generator.py`)
* **Output Telemetry File:** `simulation/synthetic_telemetry.csv`

---

### 2. Time Progression & Diurnal Flow Modeling

The Digital Twin advances time using discrete 15-minute simulation intervals ($\Delta t = 15\text{ min}$) over a 24- to 72-hour operational cycle.

#### Diurnal Residential Patterns
Residential water consumption is non-uniform. The simulation models three diurnal loading cycles:
1. **Morning Surge (06:30 – 09:30):** Dominated by bathroom showers and wash basins ($15-25\text{ L/min}$ flow). Characterized by high dissolved oxygen, low organic load (BOD $< 60\text{ mg/L}$), and moderate surfactants.
2. **Midday Wash (11:30 – 14:00):** Dominated by laundry washing machine cycles ($8-18\text{ L/min}$). Characterized by alkaline pH ($7.8-8.4$), elevated temperature ($30-40^\circ\text{C}$), high suspended microfibers, and surfactant turbidity.
3. **Evening Cleanup (18:00 – 21:30):** Dominated by kitchen sink wash-up ($5-15\text{ L/min}$). Characterized by high organic spikes (BOD $> 300\text{ mg/L}$, COD $> 700\text{ mg/L}$), food particulates, high fecal coliforms, and dissolved oxygen depression ($DO < 1.5\text{ mg/L}$).
4. **Nocturnal Baseflow (23:00 – 05:00):** Minimal intermittent flow ($< 2\text{ L/min}$), during which storage decay and stagnation kinetics dominate.

---

### 3. Physicochemical Parameter Simulation & Stochastic Noise

For each 15-minute step, water-quality parameters are drawn from source-conditioned baseline distributions observed in `dataset/main.csv`, coupled with physics-governed relationships:
* **Thermal Dissipation:** Influent hot wash water cools toward ambient temperature via Newton's law of cooling:
  $$\frac{dT}{dt} = -k_{\text{cool}} (T - T_{\text{ambient}})$$
* **Oxygen Depletion:** High chemical and biochemical oxygen demand depresses dissolved oxygen according to reaeration-consumption balance.
* **Colloidal Coupling:** Total Suspended Solids (`TSS_mg_L`) and Turbidity (`TUR_NTU`) are co-varied through positive covariance matrices.
* **Gaussian Measurement Noise:** Zero-mean Gaussian noise ($\mathcal{N}(0, \sigma^2)$) is injected into simulated sensor channels to emulate optical drift, pH electrode impedance, and electromagnetic flow meter jitter.

---

### 4. Storage Tank State Integration

The Digital Twin tracks a physical atmospheric storage vessel:
* **Nominal Capacity:** $1000.0\text{ L}$
* **Hydraulic Mass Balance:**
  $$V(t + \Delta t) = \max\left(0, \min\left(V_{\max}, V(t) + (Q_{\text{in}} - Q_{\text{out}}) \cdot \Delta t\right)\right)$$
* **Tank Alarms:**
  * High-Level Overflow Cutoff: $90\%$ capacity ($900\text{ L}$). Shuts off inflow divert valves.
  * Low-Level Suction Cutoff: $10\%$ capacity ($100\text{ L}$). Disengages reuse pump to prevent pump cavitation.

---

### 5. Contamination Scenarios & Sensor Fault Injection

The Digital Twin includes programmed edge-case injection modules to validate pipeline resilience:
1. **Acute Acidic/Alkaline Bleach Dump:** Injects sudden pH drops ($pH < 5.5$) or caustic spikes ($pH > 9.5$) into bathroom streams to test immediate safety overrides.
2. **Food Scraps / Oil Spike:** Injects high-strength organic shock loads ($COD > 1000\text{ mg/L}$, $BOD > 400\text{ mg/L}$) to test bio-filter protection rules.
3. **Sensor Drift Fault:** Simulates a stuck optical turbidity reading or linear calibration drift over 24 hours to evaluate Isolation Forest outlier sensitivity.
4. **Communication Drop:** Emulates missing sensor packets (NaN injection) to verify robust preprocessing validation.

---

### 6. Simulation Limitations

1. **Synthetic Nature:** All time-series data is synthetically generated; the system has not been calibrated against physical in-pipe sensors.
2. **Simplified CFD / Mixing:** The $1000\text{ L}$ tank assumes idealized stratified/FIFO or perfectly mixed zones; complex internal computational fluid dynamics (CFD) dead-zones are not modeled.
3. **Environmental Boundary:** Ambient temperature fluctuations are modeled deterministically rather than from micro-climate boundary layer turbulence.
