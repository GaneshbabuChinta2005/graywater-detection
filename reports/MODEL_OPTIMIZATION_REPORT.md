# Phase 6: Model Optimization, Robust Evaluation, and SHAP Preparation Report
## AI-Driven Intelligent Greywater Management and Smart Reuse Routing System

---

### 1. Baseline Performance Review (Phase 5 Summary)
In Phase 5, un-tuned baseline models were established using the 70/15/15 stratified splits (1,050 train, 225 validation, 225 test samples):
- **Baseline XGBoost:** Validation Accuracy = 97.33%, Macro F1 = 0.7317, Weighted F1 = 0.9712, Sewer Bypass Recall = 0.9851 (1 false negative).
- **Baseline Random Forest:** Validation Accuracy = 95.11%, Macro F1 = 0.7162, Weighted F1 = 0.9491, Sewer Bypass Recall = 0.9851 (1 false negative).
- **Cross-Validation Benchmarks (5-Fold Stratified on Training Set):**
  - XGBoost: Accuracy = 0.9714 ± 0.0080, Macro F1 = 0.7785 ± 0.0992
  - Random Forest: Accuracy = 0.9476 ± 0.0120, Macro F1 = 0.7614 ± 0.0989

---

### 2. Optimization Methodology & Objective
Greywater reuse routing involves a severe operational class imbalance:
- Class 0 (Sewer Bypass): 29.7%
- Class 1 (Bio-filtration): 48.1%
- Class 2 (Restricted Irrigation): 21.7%
- Class 3 (Indoor Reuse): **0.40%** (only 4 samples in train, 1 in val, 1 in test)

Because overall accuracy masks complete failure on minority classes, the optimization objective was defined with a strict hierarchy:
1. **Primary Metric:** **Macro F1** (unweighted arithmetic mean of F1 scores across all four classes, penalizing failure on minority classes).
2. **Safety Metric:** **Sewer Bypass Recall** (ensuring dangerous, high-pathogen greywater is diverted away from reuse systems).
3. **Secondary Metrics:** Weighted F1, Macro Recall, Macro Precision, and Overall Accuracy.

*Strict Data Governance Rule:* The test set was completely isolated during all parameter tuning, feature assessments, and model selection. Only training data was used for cross-validation; only validation data was used for model selection.

---

### 3. XGBoost Hyperparameter Search Space
Controlled search was performed over tree depth, learning rate, subsampling, and regularization on the training set:
- `n_estimators`: [100, 150, 200, 250, 300, 350, 400, 500]
- `max_depth`: [3, 4, 5, 6]
- `learning_rate`: [0.015, 0.02, 0.03, 0.04, 0.05, 0.06, 0.08, 0.10]
- `subsample`: [0.70, 0.75, 0.80, 0.85, 0.90]
- `colsample_bytree`: [0.70, 0.75, 0.80, 0.85, 0.90]
- `min_child_weight`: [1, 2, 3]
- `gamma`: [0.0, 0.02, 0.05, 0.10, 0.20]
- `reg_alpha`: [0.0, 0.01, 0.02, 0.05, 0.10]
- `reg_lambda`: [1.0, 1.2, 1.5, 2.0, 2.5, 3.0, 5.0]

#### Optimal XGBoost Parameters (`reports/best_xgboost_parameters.json`):
```json
{
  "n_estimators": 400,
  "max_depth": 3,
  "learning_rate": 0.04,
  "subsample": 0.85,
  "colsample_bytree": 0.85,
  "min_child_weight": 1,
  "gamma": 0.02,
  "reg_alpha": 0.01,
  "reg_lambda": 1.0
}
```
*Tuning Insight:* Reducing `max_depth` from 4 to 3 while expanding tree estimators to 400 with a slightly lower learning rate (0.04) and feature subsampling (0.85) improved boundary smoothness and mitigated overfitting.

---

### 4. Random Forest Hyperparameter Search Space
Controlled search evaluated tree ensemble size, depth bounds, splitting criteria, and class weighting:
- `n_estimators`: [200, 250, 300, 350, 400]
- `max_depth`: [8, 12, 14, 16, 18, None]
- `min_samples_split`: [2, 3, 4, 5]
- `min_samples_leaf`: [1, 2]
- `max_features`: ['sqrt', 'log2', 0.5, 0.6]
- `class_weight`: ['balanced', 'balanced_subsample', None]

#### Optimal Random Forest Parameters (`reports/best_random_forest_parameters.json`):
```json
{
  "n_estimators": 300,
  "max_depth": 16,
  "min_samples_split": 2,
  "min_samples_leaf": 1,
  "max_features": "sqrt",
  "class_weight": null
}
```

---

### 5. Cross-Validation Methodology & Results
Cross-validation was conducted strictly on `train.csv` (1,050 rows) using 5-Fold Stratified Cross-Validation (`StratifiedKFold(n_splits=5, shuffle=True, random_state=42)`):

| Model Search | Top Rank CV Macro F1 | Std Macro F1 | Mean CV Accuracy | Mean Sewer Bypass Recall |
|---|---|---|---|---|
| **Optimized XGBoost** | **0.7795** | ±0.0989 | **0.9724** | 0.9680 |
| **Optimized Random Forest** | 0.7735 | ±0.0972 | 0.9648 | **0.9776** |

---

### 6. Validation Comparison (Baselines vs Optimized)
All four candidate models were evaluated on the 225-sample validation set (`reports/optimized_validation_comparison.csv`):

| Model | Accuracy | Macro Precision | Macro Recall | Macro F1 | Weighted Precision | Weighted Recall | Weighted F1 | Sewer Bypass Recall | Sewer Bypass False Negatives |
|---|---|---|---|---|---|---|---|---|---|
| **Baseline XGBoost** | 0.9733 | 0.7294 | 0.7342 | 0.7317 | 0.9692 | 0.9733 | 0.9712 | 0.9851 | 1 |
| **Optimized XGBoost** | **0.9778** | **0.7329** | **0.7365** | **0.7347** | **0.9735** | **0.9778** | **0.9756** | **0.9851** | **1** |
| **Baseline Random Forest** | 0.9511 | 0.7111 | 0.7226 | 0.7162 | 0.9489 | 0.9511 | 0.9491 | 0.9851 | 1 |
| **Optimized Random Forest** | 0.9600 | 0.7200 | 0.7259 | 0.7228 | 0.9563 | 0.9600 | 0.9580 | 0.9701 | 2 |

---

### 7. Model Selection Rationale
Applying the transparent, pre-registered selection hierarchy:
1. **Macro F1:** Optimized XGBoost achieved the highest Macro F1 (**0.7347** vs. 0.7317 baseline XGB, 0.7228 optimized RF).
2. **Sewer Bypass Recall:** Optimized XGBoost maintained maximum recall (**0.9851**, 66/67 true bypass events correctly identified, only 1 false negative).
3. **Generalization:** Optimized XGBoost demonstrated the highest overall accuracy (**0.9778**) and highest weighted F1 score (**0.9756**).

**Selected Candidate:** **Optimized XGBoost** was selected according to the predefined optimization criteria.

---

### 8. Final Test Set Evaluation (Single Touchpoint)
The selected model (**Optimized XGBoost**) was evaluated exactly ONCE on the untouched test set (225 samples):

| Metric | Score | Note |
|---|---|---|
| **Test Accuracy** | **0.9778** | 220 out of 225 samples correctly routed |
| **Macro Precision** | **0.7342** | Average across all 4 classes |
| **Macro Recall** | **0.7350** | Average across all 4 classes |
| **Macro F1** | **0.7346** | High harmonic mean across unbalanced tiers |
| **Weighted Precision** | **0.9735** | Frequency-weighted precision |
| **Weighted Recall** | **0.9778** | Frequency-weighted recall |
| **Weighted F1** | **0.9756** | Frequency-weighted harmonic mean |
| **Sewer Bypass Precision** | **0.9848** | 65 true bypass out of 66 predicted bypass |
| **Sewer Bypass Recall** | **0.9701** | 65 true bypass caught out of 67 actual cases |
| **Sewer Bypass F1** | **0.9774** | Strong balance of safety and efficiency |

---

### 9. Per-Class Detailed Performance (Final Test Set)

| Class | Routing Destination | Precision | Recall | F1-Score | Support | Status |
|---|---|---|---|---|---|---|
| **0** | **Sewer Bypass** | 0.98 | 0.97 | 0.98 | 67 | Highly accurate safety cutoff |
| **1** | **Bio-filtration** | 0.97 | 0.99 | 0.98 | 109 | Excellent treatment routing |
| **2** | **Restricted Irrigation** | 0.98 | 0.98 | 0.98 | 48 | Outstanding precision & recall |
| **3** | **Indoor Reuse** | 0.00 | 0.00 | 0.00 | 1 | Unrepresented due to sample scarcity (0.4%) |

*Note on Class 3:* With only 1 test sample (and 4 train samples), the supervised model conservatively routes this single ultra-clean sample to Class 2 (Restricted Irrigation). This pull down Macro F1 to ~0.73 while Weighted F1 remains at 0.98. This routing decision is operational-safe (routing cleaner water to lower-demand reuse).

---

### 10. Sewer Bypass Safety Performance
In autonomous water management, **missed contaminated batches** (False Negatives) cause irreversible biological or chemical contamination in irrigation networks or bio-filters.
- **True Sewer Bypass Cases in Test Set:** 67
- **Correctly Routed to Bypass (True Positives):** 65 (97.01%)
- **Dangerous False Negatives (FN):** **2** (Samples 183 and 324 misclassified as Bio-filtration)
- **False Alarm False Positives (FP):** **1** (Sample 731 misclassified as Sewer Bypass)
- **Operational Safety Verdict:** The system achieves a **97.01% critical hazard interception rate** with only a 0.44% false alarm penalty.

---

### 11. Test Error Analysis
Only 5 misclassifications occurred out of 225 test samples (`reports/final_test_errors.csv`):

| Sample ID | True Class | True Class Name | Predicted Class | Predicted Class Name | Prediction Confidence | Directional Risk Profile |
|---|---|---|---|---|---|---|
| **183** | 0 | Sewer Bypass | 1 | Bio-filtration | 0.5495 | **Borderline Low Confidence (Hazard)** |
| **324** | 0 | Sewer Bypass | 1 | Bio-filtration | 0.9499 | Critical False Negative (Hazard) |
| **731** | 1 | Bio-filtration | 0 | Sewer Bypass | 0.8895 | Benign False Alarm (Safe) |
| **116** | 2 | Restricted Irrigation | 1 | Bio-filtration | 0.8697 | Conservative Treatment (Safe) |
| **855** | 3 | Indoor Reuse | 2 | Restricted Irrigation | 0.8175 | Conservative Reuse (Safe) |

*Key Takeaway:* 3 out of the 5 errors (60%) are conservative in direction (routing water to stricter treatment than necessary). Only 2 cases represent safety-critical under-treatment. Notice that Sample 183 has low confidence (0.5495), which an automated low-confidence triage gate can intercept in production!

---

### 12. Prediction Confidence & Calibration
Analyzing the maximum softmax output for each test sample (`reports/final_prediction_confidence.csv`):
- **Mean Prediction Confidence:** **0.9757**
- **Median Prediction Confidence:** **0.9909**
- **Low Confidence Predictions (< 0.70):** Only **2 samples** (0.89% of test set)
- **Accuracy on High Confidence (>= 0.70):** **98.21%** (219 / 223)
- **Finding:** The model is well-polarized with high certainty on standard water quality profiles; uncertainty concentrates on boundary samples.

---

### 13. Feature Importance Analysis
Using built-in feature importance (Gain for XGBoost, Mean Decrease in Impurity for Random Forest):

#### Top 5 Features in Optimized XGBoost (Gain)
1. `Greywater_Source_Bathroom` (0.3341) — Critical source determinant for organic and surfactant loading.
2. `Greywater_Source_Mixed` (0.2482) — Composite source indicator.
3. `Greywater_Source_Laundry` (0.1126) — Associated with alkaline detergent and phosphorus content.
4. `Greywater_Source_Kitchen` (0.0715) — Direct sewer bypass cutoff determinant.
5. `COD_mg_L` (0.0592) — Chemical oxygen demand, primary metric for chemical contamination.

#### Top 5 Features in Optimized Random Forest (MDI)
1. `COD_mg_L` (0.1384)
2. `TSS_mg_L` (0.1311)
3. `TUR_NTU` (0.1255)
4. `BOD_mg_L` (0.1012)
5. `Greywater_Source_Bathroom` (0.0987)

*Scientific Note:* Feature importance indicates decision-tree splitting utility within the empirical dataset; it does not demonstrate causal chemical or biological mechanisms.

---

### 14. SHAP Readiness Verification
- **Framework:** `shap.TreeExplainer` successfully linked to the serialized `XGBClassifier`.
- **Tensor Output:** Explaining a representative validation batch produced a 3-dimensional attribution tensor of shape `(5, 19, 4)` spanning all 5 samples, 19 sensor features, and 4 destination classes.
- **Verification Status:** **100% Deterministic & Error-Free** (`reports/shap_readiness_check.md`).
- **Reproducible Dataset Sample:** Created `reports/shap_sample_indices.csv` containing 50 deterministic samples sampled strictly from training and validation splits (`random_state=42`), preserving total isolation of the test set.

---

### 15. Important Scientific Limitation
> **"The model is being evaluated against rule-derived routing labels. Therefore, performance measures agreement with the routing-label framework and should not be interpreted as independent real-world safety validation."**
