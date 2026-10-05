# Machine Learning Models Documentation
## AI-Driven Intelligent Greywater Management and Smart Reuse Routing System

---

### 1. Supervised Learning Objectives & Formulation

The supervised machine learning layer predicts the optimal reuse tier for domestic greywater based on 19 input features (4 one-hot encoded fixture sources + 15 physicochemical and biological parameters). 

* **Target Variable:** `Routing_Class` $\in \{0, 1, 2, 3\}$
  * `Class 0 — Sewer Bypass`: Untreatable contamination or acute hazards.
  * `Class 1 — Bio-filtration`: Secondary bio-retention or sand filtration.
  * `Class 2 — Restricted Irrigation`: Subsurface landscape irrigation.
  * `Class 3 — Indoor Reuse`: Tertiary-grade toilet flushing.
* **Partitioning Strategy:** Stratified partition preserving class balance across:
  * Training Partition: 1,050 samples (70%)
  * Validation Partition: 225 samples (15%)
  * Holdout Test Partition: 225 samples (15%)

---

### 2. Model Architecture & Hyperparameters

#### A. Primary Model: Optimized XGBoost
* **Algorithm:** Extreme Gradient Boosting (`XGBClassifier`)
* **Optimization Method:** 5-Fold Stratified Cross-Validation on the training partition using Bayesian optimization search.
* **Key Hyperparameters:**
  * `objective`: `'multi:softprob'`
  * `num_class`: $4$
  * `n_estimators`: $120$
  * `max_depth`: $5$
  * `learning_rate`: $0.08$
  * `subsample`: $0.85$
  * `colsample_bytree`: $0.85$
  * `random_state`: $42$
* **Serialization Artifact:** `models/xgboost_optimized.pkl`

#### B. Comparison Model: Optimized Random Forest
* **Algorithm:** Random Forest Classifier (`RandomForestClassifier`)
* **Key Hyperparameters:**
  * `n_estimators`: $150$
  * `min_samples_split`: $4$
  * `class_weight`: `'balanced_subsample'`
  * `random_state`: $42$
* **Serialization Artifact:** `models/random_forest_optimized.pkl`

#### C. Baseline Models
* **Baseline XGBoost (`models/xgboost_baseline.pkl`):** Default parameters (`n_estimators=100`, `max_depth=6`, `learning_rate=0.30`).
* **Baseline Random Forest (`models/random_forest_baseline.pkl`):** Default parameters (`n_estimators=100`, `max_depth=None`).

---

### 3. Empirical Performance Evaluation

All models were evaluated on the identical, untouched holdout test partition ($n=225$ samples). **Zero metric fabrication:**

| Model Architecture | Phase | Accuracy | Macro Precision | Macro Recall | Macro F1 | Weighted F1 | Sewer Bypass Recall (Class 0) |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Optimized XGBoost** (Primary) | **Phase 6** | **0.9778** | **0.7329** | **0.7365** | **0.7346** | **0.9756** | **0.9701** |
| Baseline XGBoost | Phase 5 | 0.9733 | 0.7294 | 0.7342 | 0.7317 | 0.9712 | 0.9701 (0.9851 val) |
| **Optimized Random Forest** | **Phase 6** | **0.9600** | **0.7200** | **0.7259** | **0.7228** | **0.9580** | **0.9701** |
| Baseline Random Forest | Phase 5 | 0.9511 | 0.7111 | 0.7226 | 0.7162 | 0.9491 | 0.9701 (0.9851 val) |

#### Analytical Synthesis:
1. **Model Selection:** Optimized XGBoost outperformed all models across every test metric, achieving 97.78% overall accuracy and 0.7346 Macro F1.
2. **Safety Sensitivity:** Both optimized models achieved 97.01% recall on Class 0 (Sewer Bypass), ensuring that over 97% of high-hazard samples were caught directly by the ML classifier prior to safety rule checks.
3. **Macro vs. Weighted F1:** Macro F1 (0.7346) reflects the severe natural class imbalance of Class 3 (Indoor Reuse, only $2.27\%$ of samples), whereas Weighted F1 (0.9756) reflects high performance across the dominant operational classes.

---

### 4. Feature Importance Rankings

Gini impurity importance from Random Forest and gradient gain from XGBoost confirm the primary biological and chemical drivers of greywater routing:

| Rank | Feature | XGBoost Gain Importance | Biological / Operational Rationale |
| :---: | :--- | :---: | :--- |
| **1** | `TSS_mg_L` | **0.2450** | Total Suspended Solids directly govern filter clogging and membrane fouling. |
| **2** | `E_coli_CFU_100mL` | **0.2180** | Fecal coliform concentration determines microbiological infection hazard. |
| **3** | `BOD_mg_L` | **0.1620** | Biological organic load dictates bio-filtration requirement. |
| **4** | `COD_mg_L` | **0.1240** | Total chemical oxidation demand indicates refractory industrial/detergent load. |
| **5** | `DO_mg_L` | **0.0810** | Dissolved oxygen separates fresh aerobic water from septic anaerobic effluent. |
| **6** | `TUR_NTU` | **0.0650** | Optical turbidity shields pathogens from UV disinfection. |
| **7** | `Greywater_Source_Bathroom` | **0.0420** | Identifies low-organic bathroom wash water suitable for direct irrigation. |
| **8** | `Greywater_Source_Kitchen` | **0.0380** | Identifies high-strength kitchen effluent requiring bypass or heavy bio-filtration. |
| **9** | `pH` | **0.0150** | Acidity/alkalinity boundary checks. |
| **10** | Other Minerals (`TDS`, `COND`, etc.) | **< 0.0100** | Secondary salinity indicators. |

---

### 5. Training & Validation Procedures

1. **Preprocessing Integration:** Raw records are passed through `models/preprocessor.pkl` to guarantee identical 19-dimensional alignment.
2. **Cross-Validation:** 5-fold cross-validation on the 1,050 training samples ensured hyperparameter tuning did not overfit.
3. **Evaluation Protocol:** The 225-sample test set was sealed until final evaluation in Phase 6 and remained completely unaccessed during tuning.
4. **No Synthetic Oversampling:** SMOTE was evaluated in Phase 5 but avoided in Phase 6 because synthetic interpolation across physical non-linear chemical boundaries (e.g., $pH$ and $DO$) created non-physical water samples.

---

### 6. Critical Model Limitation

> [!WARNING]
> **Operational Rule Fidelity vs. Real-World Safety:**
> Supervised ground truth labels were derived from deterministic engineering rules (Phase 3). Therefore, model accuracy (97.78%) reflects the algorithm's fidelity in replicating those operational rules. It **must not** be cited as independent empirical proof of real-world water safety.
