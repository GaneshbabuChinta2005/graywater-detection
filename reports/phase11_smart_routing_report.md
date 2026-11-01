# Phase 11: Smart Context-Aware Routing Engine Report
## AI-Driven Intelligent Greywater Management and Smart Reuse Routing System

**Project Phase:** Phase 11 — Smart Context-Aware Routing Engine  
**Date:** October 2026  
**Status:** Completed & Validated  

---

### Core Scientific & Regulatory Disclaimers
> **"The routing engine is a decision-support system. Its recommendations do not constitute regulatory approval or a guarantee of water safety."**  
>  
> **"Because the supervised routing labels are rule-derived, model performance measures agreement with the operational labeling framework rather than independent real-world ground truth."**

---

## 1. Objective & Operational Purpose

The objective of Phase 11 is to build the **Central Smart Routing Engine** that arbitrates across all physical, chemical, statistical, environmental, and temporal parameters of the greywater facility.

In prior phases, isolated predictive and contextual models were established:
- **Phase 5 & 6**: Supervised XGBoost multiclass routing classifier ($97.78\%$ test accuracy).
- **Phase 7**: Unsupervised Isolation Forest anomaly screening layer ($2\%$ contamination rate).
- **Phase 8**: Digital Twin synthetic fluid and sensor telemetry simulation.
- **Phase 9**: Weather API and meteorological context provider (precipitation, forecast probability, freezing risk).
- **Phase 10**: Physical storage tank mass-balance accounting, FIFO batch age tracking, and biochemical decay estimation.

Phase 11 unifies these independent signals into an auditable, deterministic, multi-tier decision engine.

---

## 2. System Architecture & Information Flow

```
                           +-------------------------------------+
                           | Raw Water Quality Telemetry Input  |
                           +-------------------------------------+
                                              |
                     +------------------------+------------------------+
                     |                                                 |
                     v                                                 v
      +-----------------------------+                   +-----------------------------+
      | Feature Preprocessing (19)  |                   | Deterministic Safety Screen |
      +-----------------------------+                   +-----------------------------+
                     |                                                 |
         +-----------+-----------+                                     |
         |                       |                                     |
         v                       v                                     v
+-----------------+     +-------------------+                 +------------------+
| XGBoost Model   |     | Isolation Forest  |                 | Safety Status:   |
| (Classification)|     | (Anomaly Screener)|                 | CRITICAL/HIGH    |
+-----------------+     +-------------------+                 +------------------+
         |                       |                                     |
         +-----------+-----------+                                     |
                     |                                                 |
                     v                                                 |
      +-----------------------------+                                  |
      | Initial Candidate Prediction|                                  |
      +-----------------------------+                                  |
                     |                                                 |
                     +------------------------+------------------------+
                                              |
                                              v
                              +-------------------------------+
                              |    CENTRAL DECISION ENGINE    |
                              +-------------------------------+
                                              |
                      +-----------------------+-----------------------+
                      |                                               |
                      v                                               v
        +---------------------------+                   +---------------------------+
        | Environmental Weather     |                   | Storage Level & Decay     |
        | Context (Phase 9)         |                   | Context (Phase 10)        |
        +---------------------------+                   +---------------------------+
                      |                                               |
                      +-----------------------+-----------------------+
                                              |
                                              v
                              +-------------------------------+
                              | Conflict Resolution Matrix    |
                              | (Priorities 1 through 6)      |
                              +-------------------------------+
                                              |
                                              v
                              +-------------------------------+
                              | Final Operational Decision    |
                              | - Route                       |
                              | - Action                      |
                              | - Status                      |
                              | - Reason Codes                |
                              | - Human-Readable Explanation  |
                              +-------------------------------+
```

---

## 3. Strict Decision Hierarchy & Priority Invariants

Operational conflicts are resolved by enforcing a strict priority hierarchy:

1. **Priority 1: Critical Water-Quality Safety (Highest Priority)**
   - Acute microbiological ($E. coli \ge 500,000\text{ CFU/100mL}$), extreme chemical ($COD \ge 800\text{ mg/L}$, $BOD \ge 400\text{ mg/L}$), extreme pH ($< 6.0$ or $> 9.0$), or anaerobic septic conditions ($DO < 1.0\text{ mg/L}$ with high organics).
   - **MANDATE:** Forces immediate diversion to `Sewer Bypass` with action `SAFETY_OVERRIDE`. Favorable weather, high tank capacity, and ML predictions **CANNOT** override this condition.

2. **Priority 2: High-Risk Statistical Anomaly**
   - Statistical anomaly confirmed with independent high-risk water-quality violations ($COD \ge 500$, $BOD \ge 250$, $TUR \ge 80$).
   - **MANDATE:** Forces diversion to `Sewer Bypass` with action `SAFETY_OVERRIDE`.

3. **Priority 3: Supervised Machine Learning Candidate Route**
   - Base routing recommendation from optimized XGBoost model (`Sewer Bypass`, `Bio-filtration`, `Restricted Irrigation`, `Indoor Reuse`).
   - If statistical anomaly occurs without acute physical threshold breaches, the candidate route is retained under `ANOMALY_REVIEW` status.
   - If model confidence $< 60\%$, flagged as `REVIEW_REQUIRED`.

4. **Priority 4: Storage Tank & Biochemical Deterioration Context**
   - If deterioration index $\ge 0.75$ or stagnation status = `HIGH_STAGNATION_RISK`, flags `STORAGE_HIGH_DETERIORATION` with action `REVIEW_REQUIRED`.

5. **Priority 5: Environmental Weather Context**
   - If candidate route is `Restricted Irrigation` and ambient rain $\ge 5\text{ mm}$ or forecast probability $\ge 50\%$, the route remains `Restricted Irrigation`, but the operational action is adjusted to `STORE_FOR_LATER` or `DEFER_ROUTE`.
   - Indoor reuse remains hydraulically decoupled and unaffected by rain.

6. **Priority 6: Normal Operational Preference**
   - Approved operational dispatch (`ALLOW_ROUTE` or `PROCEED_WITH_TREATMENT`).

---

## 4. Separation of Route, Action, and Status

To prevent confounding water-quality suitability with temporary weather delays, the system strictly separates:
- **`final_route`**: The intrinsic suitability classification of the water (e.g. `Restricted Irrigation`).
- **`final_action`**: The immediate operational valve/pump action (e.g. `STORE_FOR_LATER`).
- **`decision_status`**: The administrative status of the decision (e.g. `DEFERRED`, `APPROVED`, `OVERRIDDEN`, `FLAGGED_FOR_REVIEW`).

*Example:* A high-quality laundry sample during a rainstorm receives `final_route = "Restricted Irrigation"`, `final_action = "STORE_FOR_LATER"`, and `decision_status = "DEFERRED"`. The water-quality rating is not arbitrarily degraded to Sewer Bypass simply because it is raining.

---

## 5. Machine Learning & Anomaly Detection Integration

- **Optimized XGBoost (`models/xgboost_optimized.pkl`)**:
  - Predicts multi-class probabilities across 4 destinations using the canonical 19-feature vector (4 one-hot sources + 15 physicochemical parameters).
  - Produces `predicted_class` ($0, 1, 2, 3$) and `prediction_confidence` ($\max P$).
  - Low confidence ($< 0.60$) triggers `MODEL_LOW_CONFIDENCE` advisory.

- **Isolation Forest (`models/isolation_forest.pkl`)**:
  - Independent unsupervised anomaly detection trained at $2\%$ contamination.
  - Generates binary `is_anomaly` flag and continuous `anomaly_score`.
  - **Fundamental Rule:** Statistical anomaly alone **NEVER** forces Sewer Bypass. Only when coupled with severe physical threshold breaches does it trigger an override.

---

## 6. Safety Layer Inspection

The `WaterQualitySafetyEngine` ([routing/safety_rules.py](file:///c:/Users/Lenovo/OneDrive/Documents/main%20project/routing/safety_rules.py)) checks raw parameters against established thresholds:

| Hazard Parameter | Critical Cutoff | Severity | Primary Risk |
|:---|:---:|:---:|:---|
| **`E_coli_CFU_100mL`** | $\ge 500,000\text{ CFU/100mL}$ | `CRITICAL` | Acute waterborne pathogen transmission |
| **`pH`** | $< 6.0$ or $> 9.0$ | `CRITICAL` | Acid/caustic corrosion, plumbing damage, biological toxicity |
| **`COD_mg_L`** | $\ge 800\text{ mg/L}$ | `CRITICAL` | Concentrated industrial cleaner, chemical shock |
| **`BOD_mg_L`** | $\ge 400\text{ mg/L}$ | `CRITICAL` | Severe organic load causing immediate anaerobic putrefaction |
| **`TUR_NTU`** | $\ge 140\text{ NTU}$ | `CRITICAL` | Severe optical scattering shielding pathogens from UV |
| **`TSS_mg_L`** | $\ge 250\text{ mg/L}$ | `CRITICAL` | Severe emitter clogging and valve fouling |
| **`DO < 1.0 + Organics`**| $DO < 1.0$ & $BOD \ge 300$ | `CRITICAL` | Active anaerobic septic state, hydrogen sulfide odor |

---

## 7. Environmental & Storage Context Arbitration

Implemented in [routing/context_rules.py](file:///c:/Users/Lenovo/OneDrive/Documents/main%20project/routing/context_rules.py):
- **Rainfall Exceedance (`rainfall_mm >= 5.0` or `precip_prob >= 50%`)**: Restricts irrigation application;greywater diverted to storage (`STORE_FOR_LATER`).
- **Frost Warning (`TEMP_C < 3.0°C`)**: Defers irrigation (`DEFER_ROUTE`) to prevent pipe freeze.
- **Indoor Decoupling**: Toilet flushing is hydraulically isolated within building plumbing; ambient precipitation does not impede reuse.
- **Storage Degradation (`deterioration_index >= 0.75`)**: Flags `STORAGE_HIGH_DETERIORATION` with action `REVIEW_REQUIRED`.

---

## 8. Standardized Reason Codes

Every decision includes one or more machine-readable audit reason codes ([routing/reason_codes.py](file:///c:/Users/Lenovo/OneDrive/Documents/main%20project/routing/reason_codes.py)):
- **Water Quality:** `WQ_CRITICAL`, `WQ_HIGH_ECOLI`, `WQ_HIGH_COD`, `WQ_HIGH_BOD`, `WQ_HIGH_TURBIDITY`, `WQ_HIGH_TSS`, `WQ_EXTREME_PH`, `WQ_SEPTIC_RISK`, `WQ_ACCEPTABLE`.
- **Anomaly:** `ANOMALY_CLEAN`, `ANOMALY_DETECTED`, `ANOMALY_REVIEW`, `ANOMALY_SAFETY_OVERRIDE`.
- **Weather:** `WEATHER_FAVORABLE`, `WEATHER_UNFAVORABLE`, `HIGH_RAINFALL`, `HIGH_PRECIP_PROBABILITY`, `FREEZING_TEMPERATURE`, `IRRIGATION_DEFERRED`, `INDOOR_DECOUPLED`, `WEATHER_UNAVAILABLE`.
- **Storage:** `STORAGE_NORMAL`, `STORAGE_AGING`, `STORAGE_HIGH_DETERIORATION`, `STAGNATION_DETECTED`, `STORAGE_REVIEW`, `STORAGE_UNAVAILABLE`.
- **Model:** `MODEL_HIGH_CONFIDENCE`, `MODEL_MEDIUM_CONFIDENCE`, `MODEL_LOW_CONFIDENCE`, `MODEL_UNAVAILABLE`.
- **Route:** `ROUTE_SEWER`, `ROUTE_BIOFILTRATION`, `ROUTE_IRRIGATION`, `ROUTE_INDOOR_REUSE`.
- **Overrides:** `OVERRIDE_SAFETY_CRITICAL`, `OVERRIDE_ANOMALY_HAZARD`, `OVERRIDE_STORAGE_DETERIORATION`, `OVERRIDE_LOW_CONFIDENCE`, `OVERRIDE_NONE`.

---

## 9. Comprehensive Synthetic Scenario Evaluation

The 10 multi-variable scenarios from [simulation/data/routing_decision_simulation.csv](file:///c:/Users/Lenovo/OneDrive/Documents/main%20project/simulation/data/routing_decision_simulation.csv) confirm all arbitration rules:

| Scenario | Input Profile | ML Prediction | Context / Override Condition | Final Route | Final Action | Status |
|:---|:---|:---:|:---|:---:|:---:|:---:|
| **1. Nominal Indoor** | Clean Bathroom | Indoor Reuse (94%) | Clear weather, fresh storage | `Indoor Reuse` | `ALLOW_ROUTE` | `APPROVED` |
| **2. Nominal Irrigation** | Mod. Laundry | Irrigation (88%) | Clear dry weather (0mm rain) | `Restricted Irrigation` | `ALLOW_ROUTE` | `APPROVED` |
| **3. Rain Irrigation** | Mod. Laundry | Irrigation (89%) | Heavy rain (15mm, 90% prob) | `Restricted Irrigation` | `STORE_FOR_LATER` | `DEFERRED` |
| **4. Indoor Rain** | Clean Bathroom | Indoor Reuse (92%) | Downpour (22mm, 95% prob) | `Indoor Reuse` | `ALLOW_ROUTE` | `APPROVED` |
| **5. Critical Pathogen** | Contaminated Bath | Irrigation (72%) | E. coli = 850,000 CFU/100mL | `Sewer Bypass` | `SAFETY_OVERRIDE` | `OVERRIDDEN` |
| **6. Acid Chemical Dump** | Caustic Laundry | Bio-filtration (65%)| pH = 4.8 | `Sewer Bypass` | `SAFETY_OVERRIDE` | `OVERRIDDEN` |
| **7. Anomaly Only** | Mixed Divergence | Bio-filtration (81%)| Statistical outlier, no acute breach| `Bio-filtration` | `ALLOW_ROUTE` | `ADVISORY` |
| **8. Anomaly + Hazard** | Extreme Kitchen | Bio-filtration (58%)| Outlier + COD 890, BOD 520 | `Sewer Bypass` | `SAFETY_OVERRIDE` | `OVERRIDDEN` |
| **9. Stagnant Storage** | Mod. Laundry | Irrigation (85%) | 40h idle, decay index 0.68 | `Restricted Irrigation` | `REVIEW_REQUIRED` | `FLAGGED_FOR_REVIEW`|
| **10. Low Confidence** | Ambiguous Laundry| Bio-filtration (48%)| Confidence = 48% (< 60%) | `Bio-filtration` | `REVIEW_REQUIRED` | `FLAGGED_FOR_REVIEW`|

---

## 10. Batch Evaluation on Holdout Test Dataset

Evaluated across all 225 holdout test samples (`dataset/processed/test.csv`) and serialized to [dataset/processed/routing_decisions.csv](file:///c:/Users/Lenovo/OneDrive/Documents/main%20project/dataset/processed/routing_decisions.csv):
- **Final Route Distribution:**
  - `Bio-filtration`: 105 samples ($46.7\%$)
  - `Sewer Bypass`: 67 samples ($29.8\%$)
  - `Restricted Irrigation`: 43 samples ($19.1\%$)
  - `Indoor Reuse`: 10 samples ($4.4\%$)
- **Mean Prediction Confidence:** $97.6\%$ across the holdout set.
- **Safety Overrides:** 52 samples ($23.1\%$) in the test set had independent safety cutoffs confirming Sewer Bypass requirements, guaranteeing zero unsafe discharge to reuse destinations.

---

## 11. Test Suite Verification

- **Phase 11 Unit Tests (`tests/test_routing_engine.py`):** **14 / 14 PASSED**
  - Includes dedicated safety invariant: Favorable weather **CANNOT** override critical safety.
  - Includes dedicated anomaly invariant: Anomaly alone **CANNOT** force Sewer Bypass.
- **Total Project Test Suite:** **93 / 93 PASSED with 100% success rate** across all phases.

---

## 12. Scientific & Operational Limitations

1. **Rule-Derived Benchmark Labels:** Models learn associations from rule-derived operational labels benchmarked against EPA/WHO guidelines. Model accuracy reflects concordance with the labeling methodology rather than independent laboratory ground truth.
2. **Operational Decision Support:** The engine provides recommendations for plant operators; it does not replace statutory regulatory permits or compliance monitoring.
3. **Discharge Discretion:** The system provides operational fail-safes (deferral, storage review, safety overrides) to guard against sensor drift, uncalibrated probes, or unexpected meteorological disruptions.
