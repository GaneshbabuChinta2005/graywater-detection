# Storage Tank Monitoring & Biochemical Decay Kinetics Documentation
## AI-Driven Intelligent Greywater Management and Smart Reuse Routing System

---

### 1. Purpose & Cyber-Physical Need

Decentralized water recycling systems inevitably require storage vessels to decouple intermittent residential generation peaks from downstream reuse demand. However, unlike chlorinated drinking water, raw or coarsely treated domestic greywater is a biologically active medium containing organic matter, nitrogen, phosphorus, and live microorganisms.

If greywater is stored beyond its biological shelf-life, three critical degradation processes occur:
1. **Dissolved Oxygen Depletion:** Aerobic heterotrophic bacteria rapidly consume dissolved oxygen (DO) to metabolize readily biodegradable COD.
2. **Septic Transition:** When DO falls below $\sim 1.0\text{ mg/L}$, anaerobic bacteria proliferate, reducing sulfates into toxic, corrosive, and malodorous hydrogen sulfide ($H_2S$).
3. **Bacterial Regrowth:** Opportunistic pathogens and coliforms regrow, turning safe water into a severe biological health hazard.

To monitor and prevent stagnation, the system couples hydraulic storage balancing with an Arrhenius-based biochemical decay model.

* **Module Location:** `storage/` (`storage_manager.py`, `shelf_life_estimator.py`, `water_decay_model.py`)

---

### 2. Hydraulic Tank Specifications & Volume Balance

The physical storage component simulates an atmospheric cylindrical polyethylene storage vessel:
* **Nominal Tank Capacity ($V_{\max}$):** $1000.0\text{ L}$
* **Inflow / Outflow Balance:**
  $$V(t + \Delta t) = \max\left(0, \min\left(V_{\max}, V(t) + (Q_{\text{in}} - Q_{\text{out}}) \cdot \Delta t\right)\right)$$
* **Hydraulic Queue Management:** Employs a First-In, First-Out (FIFO) parcel tracking queue to monitor parcel-specific hydraulic residence time.
* **Volume Thresholds & Safeguards:**
  * *High-Level Warning ($90\% = 900\text{ L}$):* Triggers overflow prevention; disables incoming diversion valves.
  * *Low-Level Warning ($10\% = 100\text{ L}$):* Triggers underflow protection; disengages suction pumps to prevent dry-running and impeller cavitation.

---

### 3. Mechanistic Arrhenius Deterioration Kinetic Formulation

Biochemical decay is driven by water temperature ($T$) and storage residence time ($t$ in hours).

#### A. Temperature-Adjusted Decay Rate ($k(T)$)
Biological enzyme kinetics accelerate exponentially with temperature according to the modified Arrhenius relationship:
$$k(T) = k_{20} \cdot \theta^{(T - 20)}$$
where:
* $k_{20} = 0.045\text{ h}^{-1}$ is the baseline decomposition rate at $20.0^\circ\text{C}$.
* $\theta = 1.072$ is the dimensionless Arrhenius temperature coefficient for aquatic microbial respiration.
* $T$ is the measured water temperature in $^\circ\text{C}$ (higher temperatures dramatically shorten shelf-life).

#### B. Dimensionless Deterioration Index ($I(t)$)
The cumulative deterioration index $I(t) \in [0.0, 1.0]$ represents the fractional loss of biological quality (dissolved oxygen collapse and coliform resurgence):
$$I(t) = 1.0 - \exp\left(-k(T) \cdot t^{\alpha}\right)$$
where $\alpha = 1.2$ accounts for the accelerating lag-phase to exponential growth transition of aquatic bacteria.

#### C. Operational Shelf-Life Thresholds
* **Normal / Fresh ($I(t) < 0.40$):** Water is fresh, aerobic, and approved for active reuse (`ALLOW_ROUTE`).
* **Aging / Advisory ($0.40 \le I(t) < 0.70$):** Water is nearing shelf-life limits; triggers advisory monitoring.
* **High Deterioration / Stagnant ($I(t) \ge 0.70$):** Critical biological degradation; water action escalated to **`REVIEW_REQUIRED`** or **`RECIRCULATE`** (aeration pump engagement).
* **Septic State ($I(t) \ge 0.90$ or $t > 48\text{ h}$):** Complete septic collapse; candidate route downgraded to **`Sewer Bypass`**.

---

### 4. Storage State Arbitration in Smart Routing

When evaluated by the central Smart Routing Engine:
1. **Fresh Water ($I(t) < 0.40$):** Dispatched normally without operational constraints.
2. **Elevated Deterioration ($I(t) \ge 0.70$):** Even if the influent originally qualified for *Restricted Irrigation*, stored water cannot be sprayed without recirculation or UV treatment. The action is changed to `REVIEW_REQUIRED`.
3. **Physical Safety Precedence:** If water quality violates fundamental cutoffs ($pH < 6.0$, acute pathogens), safety rules immediately override storage rules to force `Sewer Bypass`.

---

### 5. Parameter Limitations & Empirical Disclaimer

> [!WARNING]
> **MANDATORY SCIENTIFIC DISCLAIMER ON EXPERIMENTAL VALIDATION:**
> 
> * **Mechanistic Approximation:** The Arrhenius decay formulations and coefficients ($k_{20} = 0.045$, $\theta = 1.072$) represent established theoretical biochemical approximations from environmental engineering literature.
> * **Lack of Empirical Validation:** **Exact real-world shelf-life is NOT experimentally validated in the current implementation.**
> * **Real-World Variations:** In a physical plumbing deployment, actual decay rates vary drastically based on biofilm wall accumulation, presence of residual chlorine, organic substrate composition, and dissolved oxygen reaeration via surface turbulence. Physical deployment requires laboratory microbial culturing to calibrate site-specific parameters.
