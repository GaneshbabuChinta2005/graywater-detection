# Phase 14 Deterministic Demonstration Scenarios
## AI-Driven Intelligent Greywater Management and Smart Reuse Routing System

This document outlines 5 deterministic, end-to-end demonstration scenarios designed for viva examination, technical reviews, and live simulation testing. Every scenario has been validated through the complete production pipeline:
$$\text{Input Data} \longrightarrow \text{Preprocessing} \longrightarrow \text{XGBoost} \longrightarrow \text{Isolation Forest} \longrightarrow \text{Safety Rules} \longrightarrow \text{Weather} \longrightarrow \text{Storage} \longrightarrow \text{Smart Routing} \longrightarrow \text{SHAP}$$

---

### Summary Table of Demonstration Scenarios

| Scenario # | Title / Objective | Water Quality Status | Anomaly Flag | Weather Status | Storage Tank Status | Initial ML Prediction | Final Route | Final Action | Override Triggered? |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Scenario 1** | **Normal Operational Flow** | SAFE_FOR_MODEL_REVIEW | NORMAL | FAVORABLE | NORMAL (det: 0.12) | Restricted Irrigation (98.7%) | **Restricted Irrigation** | `ALLOW_ROUTE` | No (0) |
| **Scenario 2** | **Critical Safety Override** | CRITICAL (Acidic pH 5.4) | NORMAL | FAVORABLE | NORMAL (det: 0.10) | Restricted Irrigation (99.2%) | **Sewer Bypass** | `SAFETY_OVERRIDE` | **Yes (1)** |
| **Scenario 3** | **Statistical Anomaly Review** | SAFE_FOR_MODEL_REVIEW | ANOMALY_REVIEW | FAVORABLE | NORMAL (det: 0.15) | Restricted Irrigation (98.2%) | **Restricted Irrigation** | `ALLOW_ROUTE` | No (0) |
| **Scenario 4** | **Weather Preclusion / Deferral**| SAFE_FOR_MODEL_REVIEW | NORMAL | UNFAVORABLE (18.5mm rain) | NORMAL (det: 0.15) | Restricted Irrigation (98.7%) | **Restricted Irrigation** | `STORE_FOR_LATER` | No (0) |
| **Scenario 5** | **Storage Tank Deterioration** | SAFE_FOR_MODEL_REVIEW | NORMAL | FAVORABLE | HIGH_DETERIORATION (det: 0.82) | Restricted Irrigation (97.0%) | **Restricted Irrigation** | `REVIEW_REQUIRED` | No (0) |

---

### Detailed Scenario Specifications

#### Scenario 1: Normal Operational Sample
* **Objective:** Demonstrate nominal pipeline execution under optimal water quality, calm weather, and fresh storage conditions.
* **Input Parameters:**
  ```json
  {
    "Greywater_Source": "Bathroom",
    "pH": 7.40,
    "TEMP_C": 24.5,
    "SAL_ppt": 0.22,
    "TUR_NTU": 28.5,
    "DS_mg_L": 255.0,
    "TDS_mg_L": 275.0,
    "TSS_mg_L": 34.0,
    "COND_uS_cm": 515.0,
    "DO_mg_L": 4.8,
    "BOD_mg_L": 28.0,
    "COD_mg_L": 82.0,
    "NH4F_mg_L": 4.2,
    "NO3_mg_L": 4.5,
    "K_mg_L": 15.8,
    "E_coli_CFU_100mL": 1500.0
  }
  ```
* **Context Conditions:**
  * Weather: `FAVORABLE` (Rainfall: 0.0 mm, Precip Prob: 5%, Temp: 24.0°C)
  * Storage: `NORMAL` (Deterioration Index: 0.12, Age: 3.0 h)
* **Pipeline Results:**
  * **ML Prediction:** `Restricted Irrigation` (Confidence: 98.69%, Class: 2)
  * **Anomaly Status:** `NORMAL` (Score: +0.1320)
  * **Safety Status:** `SAFE_FOR_MODEL_REVIEW` (`WQ_ACCEPTABLE`)
  * **Weather Status:** `FAVORABLE`
  * **Storage Status:** `NORMAL`
  * **Final Route:** `Restricted Irrigation`
  * **Final Action:** `ALLOW_ROUTE`
  * **Override Applied:** `False`
* **Operational Explanation:**
  > "MODEL DECISION: Restricted Irrigation (Confidence: 98.7%). MODEL EXPLANATION: SHAP indicates the primary model contributors were TSS_mg_L, E_coli_CFU_100mL, Greywater_Source_Bathroom. FINAL DECISION: Restricted Irrigation was approved with action 'ALLOW_ROUTE'. No safety, anomaly, meteorological, or storage overrides were triggered."

---

#### Scenario 2: High Contamination (Safety Override Precedence)
* **Objective:** Verify that acute physical/biological hazards immediately supersede ML predictions and favorable weather, forcing a direct override to Sewer Bypass.
* **Input Parameters:**
  ```json
  {
    "Greywater_Source": "Bathroom",
    "pH": 5.40,
    "TEMP_C": 24.0,
    "SAL_ppt": 0.20,
    "TUR_NTU": 30.0,
    "DS_mg_L": 260.0,
    "TDS_mg_L": 280.0,
    "TSS_mg_L": 40.0,
    "COND_uS_cm": 520.0,
    "DO_mg_L": 4.5,
    "BOD_mg_L": 35.0,
    "COD_mg_L": 90.0,
    "NH4F_mg_L": 4.5,
    "NO3_mg_L": 4.0,
    "K_mg_L": 15.0,
    "E_coli_CFU_100mL": 1500.0
  }
  ```
* **Context Conditions:**
  * Weather: `FAVORABLE` (Rainfall: 0.0 mm, Precip Prob: 5%, Temp: 24.0°C)
  * Storage: `NORMAL` (Deterioration Index: 0.10, Age: 2.0 h)
* **Pipeline Results:**
  * **ML Prediction:** `Restricted Irrigation` (Confidence: 99.25%, Class: 2)
  * **Anomaly Status:** `NORMAL` (Score: +0.1141)
  * **Safety Status:** `CRITICAL` (Breach: `WQ_EXTREME_PH` [< 6.0], `WQ_CRITICAL`)
  * **Weather Status:** `FAVORABLE`
  * **Storage Status:** `NORMAL`
  * **Final Route:** `Sewer Bypass`
  * **Final Action:** `SAFETY_OVERRIDE`
  * **Override Applied:** `True`
* **Operational Explanation:**
  > "MODEL DECISION: Restricted Irrigation (Confidence: 99.2%). MODEL EXPLANATION: SHAP indicates the primary model contributors were TSS_mg_L, E_coli_CFU_100mL, Greywater_Source_Bathroom. SAFETY OVERRIDE: Although the ML model predicted Restricted Irrigation, an independent critical water-quality condition triggered the highest-priority safety rule. Therefore, the final route was changed to Sewer Bypass."

---

#### Scenario 3: Anomaly Alone (Non-Forcing Isolation Forest Flag)
* **Objective:** Prove that statistical anomalies alone do NOT force diversion to Sewer Bypass if physical safety limits are respected.
* **Input Parameters:**
  ```json
  {
    "Greywater_Source": "Bathroom",
    "pH": 7.40,
    "TEMP_C": 38.0,
    "SAL_ppt": 0.35,
    "TUR_NTU": 25.0,
    "DS_mg_L": 620.0,
    "TDS_mg_L": 680.0,
    "TSS_mg_L": 35.0,
    "COND_uS_cm": 1150.0,
    "DO_mg_L": 7.8,
    "BOD_mg_L": 25.0,
    "COD_mg_L": 75.0,
    "NH4F_mg_L": 9.5,
    "NO3_mg_L": 14.0,
    "K_mg_L": 26.0,
    "E_coli_CFU_100mL": 1200.0
  }
  ```
* **Context Conditions:**
  * Weather: `FAVORABLE` (Rainfall: 0.0 mm, Temp: 22.0°C)
  * Storage: `NORMAL` (Deterioration Index: 0.15, Age: 4.0 h)
* **Pipeline Results:**
  * **ML Prediction:** `Restricted Irrigation` (Confidence: 98.21%, Class: 2)
  * **Anomaly Status:** `ANOMALY_REVIEW` (Isolation Forest Score: -0.0194, Flag: 1)
  * **Safety Status:** `SAFE_FOR_MODEL_REVIEW` (`WQ_ACCEPTABLE`)
  * **Weather Status:** `FAVORABLE`
  * **Storage Status:** `NORMAL`
  * **Final Route:** `Restricted Irrigation`
  * **Final Action:** `ALLOW_ROUTE` (Advisory flag attached)
  * **Override Applied:** `False`
* **Operational Explanation:**
  > "MODEL DECISION: Restricted Irrigation (Confidence: 98.2%). MODEL EXPLANATION: SHAP indicates the primary model contributors were TSS_mg_L, E_coli_CFU_100mL, Greywater_Source_Bathroom. FINAL DECISION: Restricted Irrigation was approved with action 'ALLOW_ROUTE'. No safety, anomaly, meteorological, or storage overrides were triggered."

---

#### Scenario 4: Irrigation with Unfavorable Weather (Dispatch Deferral)
* **Objective:** Demonstrate meteorological context arbitration. The candidate reuse route is retained, but active application is temporarily deferred to prevent runoff.
* **Input Parameters:**
  ```json
  {
    "Greywater_Source": "Bathroom",
    "pH": 7.40,
    "TEMP_C": 24.5,
    "SAL_ppt": 0.22,
    "TUR_NTU": 28.5,
    "DS_mg_L": 255.0,
    "TDS_mg_L": 275.0,
    "TSS_mg_L": 34.0,
    "COND_uS_cm": 515.0,
    "DO_mg_L": 4.8,
    "BOD_mg_L": 28.0,
    "COD_mg_L": 82.0,
    "NH4F_mg_L": 4.2,
    "NO3_mg_L": 4.5,
    "K_mg_L": 15.8,
    "E_coli_CFU_100mL": 1500.0
  }
  ```
* **Context Conditions:**
  * Weather: `UNFAVORABLE` (Rainfall: 18.5 mm, Precip Prob: 90%, Temp: 19.0°C)
  * Storage: `NORMAL` (Deterioration Index: 0.15, Age: 5.0 h)
* **Pipeline Results:**
  * **ML Prediction:** `Restricted Irrigation` (Confidence: 98.69%, Class: 2)
  * **Anomaly Status:** `NORMAL` (Score: +0.1320)
  * **Safety Status:** `SAFE_FOR_MODEL_REVIEW` (`WQ_ACCEPTABLE`)
  * **Weather Status:** `UNFAVORABLE` (Precipitation threshold exceeded)
  * **Storage Status:** `NORMAL`
  * **Final Route:** `Restricted Irrigation` (Route preserved)
  * **Final Action:** `STORE_FOR_LATER` (Dispatch deferred)
  * **Override Applied:** `False`
* **Operational Explanation:**
  > "MODEL DECISION: Restricted Irrigation (Confidence: 98.7%). MODEL EXPLANATION: SHAP indicates the primary model contributors were TSS_mg_L, E_coli_CFU_100mL, Greywater_Source_Bathroom. WEATHER CONTEXT: Unfavorable environmental conditions triggered route deferral. The water-quality route remains Restricted Irrigation, but dispatch is temporarily deferred (action: STORE_FOR_LATER)."

---

#### Scenario 5: Storage Tank Deterioration (Biochemical Shelf-Life Degradation)
* **Objective:** Demonstrate storage state tracking and biochemical degradation. Prolonged hydraulic residence time triggers an operational review or recirculation.
* **Input Parameters:**
  ```json
  {
    "Greywater_Source": "Bathroom",
    "pH": 7.10,
    "TEMP_C": 25.0,
    "SAL_ppt": 0.25,
    "TUR_NTU": 35.0,
    "DS_mg_L": 260.0,
    "TDS_mg_L": 280.0,
    "TSS_mg_L": 40.0,
    "COND_uS_cm": 530.0,
    "DO_mg_L": 4.0,
    "BOD_mg_L": 30.0,
    "COD_mg_L": 85.0,
    "NH4F_mg_L": 5.0,
    "NO3_mg_L": 4.0,
    "K_mg_L": 16.0,
    "E_coli_CFU_100mL": 1800.0
  }
  ```
* **Context Conditions:**
  * Weather: `FAVORABLE` (Rainfall: 0.0 mm, Temp: 25.0°C)
  * Storage: `DEGRADED` (Deterioration Index: 0.82 [> 0.70 threshold], Age: 52.0 h)
* **Pipeline Results:**
  * **ML Prediction:** `Restricted Irrigation` (Confidence: 96.95%, Class: 2)
  * **Anomaly Status:** `NORMAL` (Score: +0.1490)
  * **Safety Status:** `SAFE_FOR_MODEL_REVIEW` (`WQ_ACCEPTABLE`)
  * **Weather Status:** `FAVORABLE`
  * **Storage Status:** `HIGH_DETERIORATION`
  * **Final Route:** `Restricted Irrigation`
  * **Final Action:** `REVIEW_REQUIRED` (Recirculation/aeration needed)
  * **Override Applied:** `False`
* **Operational Explanation:**
  > "MODEL DECISION: Restricted Irrigation (Confidence: 97.0%). MODEL EXPLANATION: SHAP indicates the primary model contributors were TSS_mg_L, E_coli_CFU_100mL, Greywater_Source_Bathroom. STORAGE CONTEXT: Biochemical deterioration necessitated storage review or recirculation. Final action: REVIEW_REQUIRED."

---

### Mandatory Limitations & Disclaimers

1. **Supervised Target Origin:** The operational routing targets were derived from deterministic water-quality rules defined in Phase 3. Supervised accuracy measures model fidelity in replicating those operational rules, not independent clinical or ecological validation.
2. **Synthetic Telemetry:** Digital Twin telemetry is generated through physics-constrained stochastic simulation. It does not originate from live physical sensors.
3. **Storage Kinetics:** Shelf-life estimation uses a simplified Arrhenius-style biochemical decay formulation. Exact shelf-life is subject to biological variability and requires laboratory testing in real deployments.
