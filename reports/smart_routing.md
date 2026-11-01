# Context-Aware Smart Routing Engine Documentation
## AI-Driven Intelligent Greywater Management and Smart Reuse Routing System

---

### 1. Engine Purpose & Overview

The **Smart Routing Engine** is the central decision arbiter of the entire platform. Standalone machine learning models, anomaly detectors, weather APIs, and storage monitors cannot safely govern real-world cyber-physical infrastructure without a unified, fail-safe orchestration layer. The engine synthesizes multivariate inputs into an unambiguous, safe, and transparent operational dispatch command.

* **Module Location:** `routing/` (`routing_engine.py`, `inference_pipeline.py`, `decision_schema.py`, `reason_codes.py`)

---

### 2. Critical Architectural Distinction: Route vs. Action vs. Status

> [!IMPORTANT]
> **CONCEPT SEPARATION:**
> To prevent operational ambiguity, the system strictly separates **Route**, **Action**, and **Status**:

1. **Route (`final_route`):** The intended physical destination for the water parcel.
   * `Sewer Bypass`: Diverted to municipal sewage.
   * `Bio-filtration`: Dispatched to constructed wetland or sand/gravel bio-filter.
   * `Restricted Irrigation`: Dispatched to subsurface landscape irrigation.
   * `Indoor Reuse`: Dispatched to tertiary holding tank for toilet flushing.
2. **Action (`final_action`):** The immediate operational control instruction issued to physical actuators (solenoid valves and pumps).
   * `ALLOW_ROUTE`: Open discharge valves and engage active routing immediately.
   * `DEFER_ROUTE` / `STORE_FOR_LATER`: Hold water in storage; do not dispatch until environmental conditions clear.
   * `RECIRCULATE`: Engage aeration / recirculation pumps to restore dissolved oxygen.
   * `REVIEW_REQUIRED`: Hold water in quarantine for manual operator inspection.
   * `SAFETY_OVERRIDE`: Immediately close reuse valves and force bypass to sewer.
3. **Status (`decision_status` / `safety_status`):** The health and compliance state of the decision.
   * `SAFE_FOR_MODEL_REVIEW`: Water meets all baseline safety boundaries.
   * `REVIEW_REQUIRED`: Non-critical edge case or anomaly detected.
   * `HIGH_RISK`: Elevated parameters requiring precautionary diversion.
   * `CRITICAL`: Severe physical/pathogen hazard detected.

* **Illustrative Example:** During a heavy rainstorm, water classified as clean irrigation effluent has:
  * **Route:** `Restricted Irrigation` (the water is physically suitable for plants).
  * **Action:** `STORE_FOR_LATER` (dispatch is withheld to prevent surface runoff).
  * **Status:** `OPERATIONAL_DEFERRAL`.

---

### 3. The 6-Tier Hierarchical Decision Priority

The routing engine arbitrates decisions through a strict, deterministic 6-tier hierarchy where higher tiers unconditionally supersede lower tiers:

```
[Tier 1: Critical Water-Quality Safety] ──> Absolute Priority (pH, E. coli, COD breaches force Sewer Bypass)
                   │
                   ▼
[Tier 2: High-Risk Multivariate Anomaly] ──> Critical anomaly combined with elevated hazard forces Sewer Bypass
                   │
                   ▼
[Tier 3: Supervised ML Model Inference] ──> Primary XGBoost class prediction & probability confidence
                   │
                   ▼
[Tier 4: Storage Tank Deterioration State] ──> Stagnant water (I(t) >= 0.70) triggers recirculation/review
                   │
                   ▼
[Tier 5: Environmental Weather Context] ──> Rainfall / freeze defers active irrigation to storage
                   │
                   ▼
[Tier 6: Normal Operational Preference] ──> Immediate route approval (ALLOW_ROUTE)
```

#### Tier 1: Independent Physical Safety Layer
* Enforces hardcoded, uncompromisable cutoffs derived from US EPA and WHO standards:
  * Acidic breach ($pH < 6.0$) or Alkaline breach ($pH > 9.0$).
  * Acute pathogen spike ($E. coli > 50,000\text{ CFU}/100\text{mL}$).
  * Severe organic overload ($BOD > 200\text{ mg/L}$ or $COD > 400\text{ mg/L}$).
  * Extreme salinity ($TDS > 1000\text{ mg/L}$).
* **Action:** Overrides all other layers immediately to `Sewer Bypass` + `SAFETY_OVERRIDE`.

#### Tier 2: High-Risk Anomaly Screening
* Evaluates Isolation Forest output alongside secondary chemical indicators. If an anomaly co-occurs with elevated (but sub-critical) pollutants, it triggers precautionary sewer diversion.

#### Tier 3: Supervised ML Inference
* Evaluates the multi-class probability distribution from the optimized XGBoost classifier. Requires minimum high confidence ($\ge 0.75$) for direct routing; low-confidence predictions ($\le 0.60$) trigger `REVIEW_REQUIRED`.

#### Tier 4: Storage Tank & Biochemical Stagnation
* Evaluates residence time and Arrhenius deterioration index $I(t)$. Water exceeding biological shelf-life ($I(t) \ge 0.70$) is diverted to `Bio-filtration` or held for aeration.

#### Tier 5: Environmental Meteorological Context
* Evaluates rainfall rate ($\ge 5.0\text{ mm}$) and precipitation probability ($\ge 70\%$). If outdoor irrigation was approved by Tiers 1–4, Tier 5 preserves the route but updates the action to `STORE_FOR_LATER`.

#### Tier 6: Operational Approval
* In the absence of any safety, anomaly, meteorological, or storage constraints, the candidate ML route is approved for immediate dispatch (`ALLOW_ROUTE`).

---

### 4. Detailed Description of the Four Operational Routes

1. **Sewer Bypass (Class 0):**
   * *Purpose:* Safe disposal of hazardous, foul, or untreatable wastewater.
   * *Criteria:* Kitchen sink effluent, extreme chemical/pathogen contamination, or septic stored water.
   * *Destiny:* Direct diversion into the municipal sanitary sewer network.
2. **Bio-filtration (Class 1):**
   * *Purpose:* Secondary biological treatment for moderately loaded greywater.
   * *Criteria:* Laundry wash streams with surfactants, moderate suspended solids ($50-120\text{ mg/L}$), or elevated BOD ($40-150\text{ mg/L}$).
   * *Destiny:* Gravel-bed constructed wetlands, sand bio-filters, or vegetated swales.
3. **Restricted Irrigation (Class 2):**
   * *Purpose:* Beneficial outdoor reuse for non-edible landscape vegetation and turf.
   * *Criteria:* Low pathogen load ($E. coli < 2000\text{ CFU}/100\text{mL}$), low solids ($TSS < 50\text{ mg/L}$), neutral pH ($6.5-8.2$).
   * *Destiny:* Subsurface drip irrigation lines (avoiding human spray contact).
4. **Indoor Reuse (Class 3):**
   * *Purpose:* High-value domestic reuse replacing potable municipal supply.
   * *Criteria:* Tertiary-grade effluent ($E. coli < 100\text{ CFU}/100\text{mL}$, Turbidity $< 5\text{ NTU}$, $DO > 4.0\text{ mg/L}$).
   * *Destiny:* Toilet cistern flushing and external utility washing.

---

### 5. Auditability & Machine-Readable Reason Codes

Every decision emitted by the engine includes an array of standardized reason codes (e.g., `ML_PREDICTION_ACCEPTED`, `WQ_ACCEPTABLE`, `METEO_FAVORABLE`, `WQ_CRITICAL_PH`, `SAFETY_OVERRIDE_TRIGGERED`) logged in `reports/example_batch_results.csv`, ensuring full traceability for regulatory compliance.
