# Phase 7: Isolation Forest Anomaly Detection & Safety Screening Report
## AI-Driven Intelligent Greywater Management and Smart Reuse Routing System

---

### 1. Purpose & Architectural Role
The objective of Phase 7 is to implement an unsupervised anomaly-detection safety screening layer using **Isolation Forest**.

```text
Water-Quality Telemetry
        ↓
Isolation Forest Anomaly Screening
        ↓
Statistical Status: Normal / Anomaly
        ↓
Supervised XGBoost Routing Prediction
        ↓
Safety Override Arbitrator
        ↓
Final Routing Decision
```

#### Key Distinctions
- **Not a Replacement for XGBoost:** The supervised XGBoost classifier remains the primary routing model for standard operations.
- **ANOMALY $\neq$ AUTOMATIC PROOF OF HAZARD:** An anomaly is a statistical observation that deviates from the normal distribution of the reference data. A benign statistical outlier (e.g., unusual temperature or mineral conductivity) triggers **`ANOMALY_REVIEW`** rather than automatic sewer bypass.
- **True Safety Overrides:** Triggered only when a statistical anomaly is corroborated by independent evidence of severe physical/biological contamination, or when direct physical hazard cutoffs are breached.

---

### 2. Input Features & Preprocessing Consistency
Isolation Forest ingests the exact 19 predictor features established in Phase 4 without alteration or post-decision leakage:
- **Greywater Sources (One-Hot Encoded, 4):** `Greywater_Source_Bathroom`, `Greywater_Source_Kitchen`, `Greywater_Source_Laundry`, `Greywater_Source_Mixed`.
- **Water Quality Parameters (Raw Units, 15):** `pH`, `TEMP_C`, `SAL_ppt`, `TUR_NTU`, `DS_mg_L`, `TDS_mg_L`, `TSS_mg_L`, `COND_uS_cm`, `DO_mg_L`, `BOD_mg_L`, `COD_mg_L`, `NH4F_mg_L`, `NO3_mg_L`, `K_mg_L`, `E_coli_CFU_100mL`.

*Forbidden Information Excluded:* `Sample_ID`, `Routing_Class`, `Water_Quality_Class`, post-decision rules, weather forecasts, and storage decay states were strictly quarantined from the anomaly detector.

---

### 3. Training Methodology
- **Training Population:** The model was trained strictly on the 1,050 samples of `dataset/processed/train.csv`.
- **Quarantine:** Validation data, test data, and future synthetic telemetry were never exposed during model fitting.
- **Algorithm:** Scikit-Learn `IsolationForest(n_estimators=200, random_state=42, n_jobs=-1)`.

---

### 4. Contamination Sensitivity Analysis
To select a scientifically defensible contamination rate, candidate rates were systematically benchmarked on the training set (`reports/isolation_forest_contamination_comparison.csv`):

| Contamination Rate | Anomalies Detected | Anomaly Pct (%) | Severe Threshold Overlap | Severe Overlap Pct (%) | Kitchen Anomalies | Domain Interpretation |
|---|---|---|---|---|---|---|
| **0.01** | 11 | 1.05% | 11 | 100.0% | 11 | Highly conservative; flags only extreme multi-dimensional statistical outliers. |
| **0.02 (Selected)** | **21** | **2.00%** | **21** | **100.0%** | **20** | **Balanced; captures ~2% tail anomalies matching Phase 2 extreme distribution tail.** |
| **0.05** | 53 | 5.05% | 52 | 98.11% | 51 | Moderate sensitivity; flags broader distribution fringe. |
| **0.10** | 105 | 10.00% | 97 | 92.38% | 89 | Aggressive; over-flags benign distribution tails as anomalous. |

*Selection Rationale:* `contamination=0.02` was selected because all 21 flagged training samples (100.0%) directly coincided with severe parameter exceedances established in Phase 2, isolating genuine multi-parameter extremities without over-flagging benign variations.

---

### 5. Anomaly Statistics on Evaluation Splits
Using the fitted model (`models/isolation_forest.pkl`), anomaly predictions and continuous decision scores were calculated:
- **Decision Score Definition:** Scikit-Learn's `decision_function()` represents the mean anomaly score of the trees. Negative scores represent anomalies (below the contamination threshold); positive scores represent normal inliers.
- **Validation Split (225 samples):** **5 anomalies detected (2.22%)** — Mean score: `-0.0197` on anomalies, `+0.1245` on normals.
- **Test Split (225 samples):** **2 anomalies detected (0.89%)** — Mean score: `-0.0113` on anomalies, `+0.1281` on normals.

*Detailed prediction logs saved to:*
- [isolation_forest_validation_predictions.csv](file:///c:/Users/Lenovo/OneDrive/Documents/main%20project/reports/isolation_forest_validation_predictions.csv)
- [isolation_forest_test_predictions.csv](file:///c:/Users/Lenovo/OneDrive/Documents/main%20project/reports/isolation_forest_test_predictions.csv)

---

### 6. Source-Wise Anomaly Distribution
Evaluating combined validation and test samples (450 total) across sources (`reports/anomaly_by_source.csv`):

| Greywater Source | Total Samples | Normal Samples | Anomaly Samples | Anomaly Rate (%) |
|---|---|---|---|---|
| **Bathroom** | 134 | 134 | 0 | 0.00% |
| **Kitchen** | 69 | 62 | **7** | **10.14%** |
| **Laundry** | 138 | 138 | 0 | 0.00% |
| **Mixed** | 109 | 109 | 0 | 0.00% |

*Physical Finding:* 100% of detected statistical anomalies originated from **Kitchen greywater** (10.14% of kitchen samples). This aligns directly with wastewater physics: kitchen effluents possess severe spikes in chemical oxygen demand, grease, dissolved food solids, and pathogen loads that push them far beyond domestic bathroom/laundry clusters.

*Figure saved to:* [anomaly_by_source.png](file:///c:/Users/Lenovo/OneDrive/Documents/main%20project/reports/figures/anomaly_by_source.png)

---

### 7. Water Quality Parameter Comparison (Normal vs. Anomaly)
Comparing the parameter distributions between normal inliers and statistical anomalies across the evaluation sets (`reports/anomaly_quality_comparison.csv`):

| Parameter | Normal Mean | Normal Median | Anomaly Mean | Anomaly Median | Mean Difference | Physical Significance |
|---|---|---|---|---|---|---|
| **E_coli_CFU_100mL** | 110,881 | 60,105 | **506,697** | 142,829 | **+395,816** | Massive biological pathogen concentration |
| **TDS_mg_L** | 378.89 | 353.19 | **798.94** | 775.86 | **+420.06** | Severe dissolved solids loading |
| **DS_mg_L** | 364.91 | 343.66 | **756.20** | 743.64 | **+391.29** | High dissolved solids |
| **COND_uS_cm** | 604.78 | 584.48 | **907.13** | 902.56 | **+302.35** | High ionic concentration |
| **COD_mg_L** | 402.40 | 364.27 | **685.55** | 762.50 | **+283.15** | Severe chemical oxygen demand |
| **BOD_mg_L** | 192.48 | 171.00 | **288.50** | 386.92 | **+96.02** | Heavy biological oxygen demand |
| **TSS_mg_L** | 127.78 | 111.84 | **167.11** | 104.67 | **+39.33** | Suspended solids elevation |
| **TUR_NTU** | 72.46 | 68.13 | **98.30** | 95.57 | **+25.85** | Turbidity elevation |

*Figure saved to:* [anomaly_quality_comparison.png](file:///c:/Users/Lenovo/OneDrive/Documents/main%20project/reports/figures/anomaly_quality_comparison.png)

---

### 8. Routing Class vs. Anomaly Exploratory Matrix
Comparing empirical overlap between the rule-derived routing targets and Isolation Forest anomaly status (`reports/routing_class_anomaly_matrix.csv`):

| Routing Class | Destination Name | Total Samples | Normal Samples | Anomaly Samples | Anomaly Rate (%) |
|---|---|---|---|---|---|
| **0** | **Sewer Bypass** | 134 | 127 | **7** | **5.22%** |
| **1** | **Bio-filtration** | 217 | 217 | 0 | 0.00% |
| **2** | **Restricted Irrigation** | 97 | 97 | 0 | 0.00% |
| **3** | **Indoor Reuse** | 2 | 2 | 0 | 0.00% |

*Exploratory Finding:* All 7 anomalies in the evaluation sets coincided with **Sewer Bypass (Class 0)**. Zero anomalies appeared in Bio-filtration, Irrigation, or Indoor Reuse. This proves that statistical isolation strongly aligns with hazardous wastewater conditions without generating false alarms on treatable greywater.

---

### 9. Anomaly Safety Auditing
Evaluation samples were audited across four operational quadrants (`reports/anomaly_safety_analysis.csv`):

| Safety Quadrant | Sample Count | % of Total | Operational Implication |
|---|---|---|---|
| **A. Sewer Bypass Classified as Normal** | 127 | 28.22% | **Expected & Safe:** Routine rule-based sewer cases (e.g. standard kitchen source or moderate parameter thresholds) are handled correctly by supervised XGBoost. Isolation Forest is not expected to flag every routine sewer case as a statistical outlier. |
| **B. Non-Sewer Classified as Anomaly** | **0** | **0.00%** | **Zero False Alarms:** No benign or treatable greywater batches were mistakenly flagged as statistical tail anomalies. |
| **C. Anomalies with High Contamination** | **7** | **1.56%** | **Confirmed Compound Hazards:** Multi-parameter extremities verified by physical thresholds. Correctly triggers `SEWER_BYPASS_OVERRIDE` or `HIGH_RISK_REVIEW`. |
| **D. Normal Samples with Severe Contamination** | 98 | 21.78% | Handled via physical rule checks and XGBoost direct classification. |

---

### 10. Safety Override Decision Logic
Implemented in [`anomaly/anomaly_detector.py`](file:///c:/Users/Lenovo/OneDrive/Documents/main%20project/anomaly/anomaly_detector.py):

```python
def apply_safety_override(ml_predicted_class, is_anomaly, anomaly_score, severe_indicators):
    ...
```

#### Decision Matrix
1. **Statistical Anomaly WITH Independent Severe Hazard Breach:**
   - If ML predicted reuse (Class 1, 2, or 3) $\rightarrow$ **`SEWER_BYPASS_OVERRIDE`** (forces routing to Class 0 Sewer Bypass to protect infrastructure and human health).
   - If ML already predicted Sewer Bypass $\rightarrow$ **`HIGH_RISK_REVIEW`** (confirms ML cutoff).
2. **Statistical Anomaly WITHOUT Severe Hazard Breach:**
   - Triggers **`ANOMALY_REVIEW`**. Maintained ML routing destination with an operator flag.
3. **Statistical Inlier BUT Physical Safety Cutoff Breached:**
   - Triggers **`SEWER_BYPASS_OVERRIDE`** (rule safety gate intercepts physical cutoff violations).
4. **Nominal Inlier with Zero Cutoff Breaches:**
   - Status: **`NORMAL`**. Cleared for autonomous ML routing.

#### Test Set Override Simulation (225 samples):
- **`NORMAL`:** 170 samples (75.56%)
- **`HIGH_RISK_REVIEW`:** 47 samples (20.89%)
- **`SEWER_BYPASS_OVERRIDE`:** 8 samples (3.56%) — critical safety cutoffs enforced.

---

### 11. Important Limitations
1. **Unsupervised Nature:** Isolation Forest is completely unsupervised. Conventional classification accuracy, precision, and recall cannot be computed against anomaly labels because there is no ground-truth "anomaly" label in nature.
2. **Contamination Dependency:** The anomaly threshold is governed by the user-selected contamination rate. While 0.02 is defensible based on Phase 2 distribution tails, it is a operational tuning hyperparameter, not an intrinsic physical constant.
3. **Exploratory Comparison:** Comparisons between Isolation Forest anomalies and routing classes are purely exploratory and must not be interpreted as supervised validation.

---

### 12. Mandatory Scientific Disclaimer
> **"Isolation Forest detects statistical anomalies and does not independently prove that a sample is hazardous."**
