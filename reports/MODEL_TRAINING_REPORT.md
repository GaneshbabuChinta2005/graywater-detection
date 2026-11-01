# Phase 5: Supervised Baseline Model Training Report
## AI-Driven Intelligent Greywater Management and Smart Reuse Routing System

---

### 1. Dataset Used
- **Source Splits:** Strict stratified splits created in Phase 4 from `dataset/main.csv` (1,500 total samples) via `models/preprocessing/preprocessor.py`.
- **Training Set (`dataset/processed/train.csv`):** 1,050 samples (70.0%)
- **Validation Set (`dataset/processed/validation.csv`):** 225 samples (15.0%)
- **Test Set (`dataset/processed/test.csv`):** 225 samples (15.0%) — held out untouched until final baseline assessment.
- **Data Integrity:** Zero missing values, zero data contamination across splits, and strictly separated metadata/Sample_IDs.

---

### 2. Target Classes & Operational Definitions
The routing target is `Routing_Class`, an ordinal 4-class operational classification established in Phase 3 based on international water reuse standards (EPA Guidelines for Water Reuse, ISO 16075, NSF/ANSI 350):

| Class | Destination Name | Operational Definition & Criteria | Total Dataset Count | Distribution (%) |
|---|---|---|---|---|
| **0** | **Sewer Bypass** | Severe contamination cutoff (pH < 6.0 or > 9.0, E. coli > 200 CFU/100mL, COD > 400 mg/L, or Kitchen source). Diverted immediately to municipality sewer to protect treatment equipment and health. | 446 | 29.73% |
| **1** | **Bio-filtration** | Moderately contaminated greywater requiring secondary biological filtration / gravel reed beds before discharge/reuse (TSS > 30 mg/L, BOD > 25 mg/L, Turbidity > 10 NTU). | 722 | 48.13% |
| **2** | **Restricted Irrigation** | Low-hazard water compliant with non-food surface irrigation standards (pathogens non-detectable, low solids, neutral pH). | 326 | 21.73% |
| **3** | **Indoor Reuse** | Highly stringent non-potable domestic circulation (toilet flushing, laundry reuse) requiring near-drinking clarity (Turbidity < 2 NTU, BOD < 5 mg/L, E. coli = 0). | 6 | 0.40% |

#### Split Class Distribution Breakdown
- **Train (1,050):** Class 0: 312 (29.71%) | Class 1: 505 (48.10%) | Class 2: 229 (21.81%) | Class 3: 4 (0.38%)
- **Validation (225):** Class 0: 67 (29.78%) | Class 1: 108 (48.00%) | Class 2: 49 (21.78%) | Class 3: 1 (0.44%)
- **Test (225):** Class 0: 67 (29.78%) | Class 1: 109 (48.44%) | Class 2: 48 (21.33%) | Class 3: 1 (0.44%)

---

### 3. Model Features
19 total input features (retaining raw engineering units to preserve domain interpretability):
- **Greywater Sources (One-Hot Encoded):** `Greywater_Source_Bathroom`, `Greywater_Source_Kitchen`, `Greywater_Source_Laundry`, `Greywater_Source_Mixed`.
- **Physical & Chemical Water Quality Parameters (15):** `pH`, `TEMP_C`, `SAL_ppt`, `TUR_NTU`, `DS_mg_L`, `TDS_mg_L`, `TSS_mg_L`, `COND_uS_cm`, `DO_mg_L`, `BOD_mg_L`, `COD_mg_L`, `NH4F_mg_L`, `NO3_mg_L`, `K_mg_L`, `E_coli_CFU_100mL`.

---

### 4. Random Forest Baseline Configuration
A non-tuned bagged ensemble baseline model trained strictly on `train.csv`:
```python
RandomForestClassifier(
    n_estimators=300,
    random_state=42,
    n_jobs=-1,
    class_weight="balanced"
)
```
*Rationale for `class_weight="balanced"`:* Class 3 represents only 0.40% of samples (4 samples in train). Balanced weighting penalizes errors on scarce classes inversely proportional to class frequencies, preventing total suppression during tree bagging.

---

### 5. XGBoost Baseline Configuration
A non-tuned gradient boosted decision tree classifier trained strictly on `train.csv`:
```python
XGBClassifier(
    objective="multi:softprob",
    num_class=4,
    n_estimators=300,
    max_depth=4,
    learning_rate=0.05,
    subsample=0.8,
    colsample_bytree=0.8,
    random_state=42,
    eval_metric="mlogloss"
)
```

---

### 6. Validation Results
Evaluated on the 225-sample validation set:

| Model | Accuracy | Macro Precision | Macro Recall | Macro F1 | Weighted Precision | Weighted Recall | Weighted F1 |
|---|---|---|---|---|---|---|---|
| **Random Forest** | 0.9511 | 0.7111 | 0.7226 | 0.7162 | 0.9489 | 0.9511 | 0.9491 |
| **XGBoost** | **0.9733** | **0.7294** | **0.7342** | **0.7317** | **0.9692** | **0.9733** | **0.9712** |

---

### 7. Cross-Validation Results (5-Fold Stratified on Training Set)
5-Fold Stratified Cross-Validation on the 1,050 training samples confirms model stability:

| Model | Mean Accuracy | Std Accuracy | Mean Macro F1 | Std Macro F1 | Mean Weighted F1 | Std Weighted F1 |
|---|---|---|---|---|---|---|
| **Random Forest** | 0.9476 | ±0.0120 | 0.7614 | ±0.0989 | 0.9459 | ±0.0124 |
| **XGBoost** | **0.9714** | **±0.0080** | **0.7785** | **±0.0992** | **0.9696** | **±0.0083** |

---

### 8. Test Results (Single Touchpoint Evaluation)
Evaluated once on the untouched 225-sample test set:

| Model | Test Accuracy | Macro Precision | Macro Recall | Macro F1 | Weighted Precision | Weighted Recall | Weighted F1 |
|---|---|---|---|---|---|---|---|
| **Random Forest** | 0.9644 | 0.7208 | 0.7296 | 0.7250 | 0.9607 | 0.9644 | 0.9623 |
| **XGBoost** | **0.9733** | **0.7320** | **0.7313** | **0.7316** | **0.9692** | **0.9733** | **0.9711** |

---

### 9. Per-Class Detailed Performance (Validation Set)

#### Random Forest Baseline
| Class Name | Precision | Recall | F1-Score | Support |
|---|---|---|---|---|
| **Sewer Bypass** | 0.90 | 0.99 | 0.94 | 67 |
| **Bio-filtration** | 0.98 | 0.93 | 0.95 | 108 |
| **Restricted Irrigation** | 0.96 | 0.98 | 0.97 | 49 |
| **Indoor Reuse** | 0.00 | 0.00 | 0.00 | 1 |

#### XGBoost Baseline
| Class Name | Precision | Recall | F1-Score | Support |
|---|---|---|---|---|
| **Sewer Bypass** | 0.96 | 0.99 | 0.97 | 67 |
| **Bio-filtration** | 0.98 | 0.97 | 0.98 | 108 |
| **Restricted Irrigation** | 0.98 | 0.98 | 0.98 | 49 |
| **Indoor Reuse** | 0.00 | 0.00 | 0.00 | 1 |

---

### 10. Sewer Bypass Safety-Focused Error Analysis
In an autonomous water recycling facility, **directional risk asymmetry** is paramount:
- **False Negative (FN) on Sewer Bypass:** A hazardous batch (high E. coli, toxic COD, or extreme pH) is mistakenly classified as safe for bio-filtration or irrigation. This causes direct human pathogen exposure, soil toxic accumulation, or bio-fouling of membrane bioreactors. **This is an extreme operational hazard.**
- **False Positive (FP) on Sewer Bypass:** A benign batch is routed to municipal sewer. This incurs a slight water volume loss but zero health or infrastructure hazard.

#### Validation Safety Comparison
| Model | True Bypass Cases | True Positives | Dangerous False Negatives | False Alarm Positives | Sewer Bypass Recall | Sewer Bypass Precision |
|---|---|---|---|---|---|---|
| **Random Forest** | 67 | 66 | **1** | 7 | **0.9851** | 0.9041 |
| **XGBoost** | 67 | 66 | **1** | 3 | **0.9851** | **0.9565** |

#### Test Safety Comparison
| Model | True Bypass Cases | True Positives | Dangerous False Negatives | False Alarm Positives | Sewer Bypass Recall | Sewer Bypass Precision |
|---|---|---|---|---|---|---|
| **Random Forest** | 67 | 66 | **1** | 4 | **0.9851** | 0.9429 |
| **XGBoost** | 67 | 64 | **3** | 1 | **0.9552** | **0.9846** |

*Crucial Finding:* Although XGBoost achieved higher overall test accuracy (97.33% vs 96.44%), Random Forest exhibited superior safety on the test set with **98.51% Sewer Bypass recall** (1 false negative vs. XGBoost's 3 false negatives). This reinforces that overall accuracy must not be the sole model selection criterion.

---

### 11. Feature Importance Analysis
Feature importances highlight which sensor attributes govern split decisions:

#### Top 5 Features: Random Forest (Mean Decrease Impurity)
1. `COD_mg_L` (0.1470)
2. `TSS_mg_L` (0.1373)
3. `TUR_NTU` (0.1282)
4. `Greywater_Source_Bathroom` (0.1063)
5. `BOD_mg_L` (0.0962)

#### Top 5 Features: XGBoost (Gain)
1. `Greywater_Source_Bathroom` (0.3958)
2. `Greywater_Source_Mixed` (0.2305)
3. `Greywater_Source_Laundry` (0.1038)
4. `Greywater_Source_Kitchen` (0.0660)
5. `COD_mg_L` (0.0557)

*Scientific Note:* Feature importance measures association and splitting power within decision trees. It does not prove biological or physical causation.

---

### 12. Model Confidence Analysis
Confidence is defined as the maximum softmax probability across the 4 classes:

| Model | Split | Mean Confidence | Median Confidence | Min Confidence | Low Conf (<0.70) Count | Low Conf (%) | Low Conf Accuracy |
|---|---|---|---|---|---|---|---|
| **XGBoost** | Validation | 0.9676 | 0.9953 | 0.5392 | 7 | 3.11% | 0.5714 |
| **Random Forest** | Validation | 0.8510 | 0.8967 | 0.5167 | 31 | 13.78% | 0.7419 |
| **XGBoost** | Test | 0.9775 | 0.9943 | 0.6796 | 1 | 0.44% | 0.0000 |
| **Random Forest** | Test | 0.8509 | 0.9000 | 0.5033 | 32 | 14.22% | 0.8125 |

XGBoost is significantly more polarized in its probability distribution (mean confidence 96.8%–97.8%), while Random Forest exhibits softer, smoother ensemble averages (mean confidence ~85.1%).

---

### 13. Model Selection Rationale for Baseline
- **Primary Model Candidate:** **XGBoost** exhibits superior overall accuracy (97.33% val / 97.33% test), highest Weighted F1 (0.9712 val / 0.9711 test), and lowest cross-validation variance (±0.0080).
- **Baseline Comparison Model:** **Random Forest** demonstrates robust safety preservation with an exceptional 98.51% recall on the critical Sewer Bypass class across both validation and test sets.
- Both models are preserved for hyperparameter tuning, class-weight calibration, and safety threshold adjustment.

---

### 14. Important Scientific Limitation
> **"The supervised models are currently learning rule-derived operational routing labels. Their performance indicates agreement with the labeling framework rather than independent validation against experimentally measured expert ground truth."**
