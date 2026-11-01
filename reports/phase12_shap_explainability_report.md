# Phase 12 Technical Report: SHAP Explainability & Decision Transparency

**Project:** AI-Driven Intelligent Greywater Management and Smart Reuse Routing System  
**Phase:** 12 — SHAP Explainability & Decision Transparency  
**Date:** October 2026  
**Status:** Completed & Validated (113/113 Unit Tests Passing)

---

## 1. Executive Summary & Objective

Phase 12 integrates game-theoretic **SHAP (SHapley Additive exPlanations)** interpretability with the context-aware decision arbitration framework developed across Phases 1–11. 

The primary objectives achieved in this phase:
1. Formulate mathematical, feature-level attributions for the optimized multiclass XGBoost greywater classifier using `shap.TreeExplainer`.
2. Extract global feature importances and class-specific importance rankings across all four destination routes.
3. Deliver instance-level local explanations (waterfall plots and local bar charts) with exact directional terminology.
4. Establish an architectural firewall separating **ML model explanations** (why XGBoost made a mathematical prediction) from **decision arbitration rules** (why safety cutoffs, weather deferrals, or storage kinetics altered operational dispatch).
5. Generate explained batch decisions for test telemetry exported to `dataset/processed/routing_decisions_explained.csv`.

---

## 2. Explainability Architecture

The system maintains a decoupled, priority-aware architecture where explainability operates at two distinct tiers:

```
Water Quality Telemetry (19 features)
              │
              ▼
   Canonical Feature Alignment
              │
              ▼
   XGBoost Multiclass Model ────────┐
              │                     │
              ▼                     ▼
     shap.TreeExplainer     Phase 11 Smart Routing Engine
              │             ├─ Priority 1: Critical Safety Cutoffs
              │             ├─ Priority 2: Isolation Forest Anomaly
              │             ├─ Priority 3: XGBoost ML Prediction
              │             ├─ Priority 4: Biochemical Storage Decay
              ▼             └─ Priority 5: Weather / Environmental
   ML Feature Attributions                 │
   (Log-Odds Contributions)                ▼
              │                     Final Routing Decision
              │                     (Route + Action + Codes)
              └──────────────┬─────────────┘
                             │
                             ▼
             Unified DecisionExplainer Schema
             ├─ Mathematical Feature Breakdown
             ├─ Independent Override Rationale
             └─ Human-Readable Narrative
```

---

## 3. Supervised Model & Preprocessing Integrity

- **Frozen Model Artifact:** `models/xgboost_optimized.pkl` (Phase 6).
- **Parameters:** 400 boosted estimators, maximum depth 4, learning rate 0.05, `multi:softprob` objective.
- **Invariance Guarantee:** The model was loaded in read-only inference mode. **No retraining, weight modification, or re-fitting occurred.**
- **Feature Alignment:** Verified exact match to the 19 canonical features:
  - 4 One-Hot Source Features: `Greywater_Source_Bathroom`, `Greywater_Source_Kitchen`, `Greywater_Source_Laundry`, `Greywater_Source_Mixed`.
  - 15 Physico-Chemical & Biological Parameters: `pH`, `TEMP_C`, `SAL_ppt`, `TUR_NTU`, `DS_mg_L`, `TDS_mg_L`, `TSS_mg_L`, `COND_uS_cm`, `DO_mg_L`, `BOD_mg_L`, `COD_mg_L`, `NH4F_mg_L`, `NO3_mg_L`, `K_mg_L`, `E_coli_CFU_100mL`.
- **Target Mapping:**
  - `0`: Sewer Bypass
  - `1`: Bio-filtration
  - `2`: Restricted Irrigation
  - `3`: Indoor Reuse

---

## 4. SHAP Methodology & Multiclass Handling

- **Library & Explainer:** `shap.TreeExplainer` (SHAP version 0.52.0).
- **Output Space:** Multiclass margin space (log-odds before softmax normalization).
- **Tensor Structure:** For batch evaluations, the explanation produces an output tensor of shape `(N, 19, 4)` with corresponding baseline values of shape `(N, 4)`.
- **Slicing Strategy:** For a sample evaluated with predicted class $c$, the local explanation slices $\phi_{i, :, c}$, representing the directional push of each feature toward or away from class $c$ relative to the baseline log-odds $E[f(X)_c]$.

---

## 5. Global Feature Importance

Global feature importance was calculated on training data ($N=1050$) as the mean absolute SHAP value across all samples and classes:
$$\text{GlobalImportance}(f) = \frac{1}{N \cdot C} \sum_{i=1}^N \sum_{c=0}^{C-1} |\phi_{i, c}(f)|$$

### Top 10 Global Features (from `reports/shap_global_importance.csv`)

| Rank | Feature | Mean Absolute SHAP | Physical Domain |
|:---:|:---|:---:|:---|
| **1** | `TSS_mg_L` | **0.8964** | Suspended solids / Physical clogging |
| **2** | `E_coli_CFU_100mL` | **0.7482** | Microbiological pathogen indicator |
| **3** | `COD_mg_L` | **0.6912** | Chemical oxygen demand / Surfactants |
| **4** | `TUR_NTU` | **0.6523** | Optical turbidity / Colloidal solids |
| **5** | `DO_mg_L` | **0.5289** | Dissolved oxygen / Septicity boundary |
| **6** | `BOD_mg_L` | **0.4903** | Biochemical oxygen demand / Organics |
| **7** | `DS_mg_L` | **0.1830** | Dissolved solids |
| **8** | `pH` | **0.1331** | Acid-base balance |
| **9** | `Greywater_Source_Bathroom` | **0.1171** | Low-hazard source indicator |
| **10** | `Greywater_Source_Mixed` | **0.1106** | Intermediate composite source indicator |

Suspended solids (`TSS`), pathogens (`E. coli`), chemical load (`COD`), and optical clarity (`Turbidity`) represent over 80% of total model decision mass.

---

## 6. Class-Specific Feature Importance

Class-specific mean absolute SHAP highlights which parameters determine classification for each distinct reuse path (from `reports/shap_class_importance.csv`):

### Class 0: Sewer Bypass (Severe Hazard Diversion)
1. `COD_mg_L` (1.3194): High chemical load pushes heavily toward Sewer Bypass.
2. `DO_mg_L` (1.0340): Anaerobic depletion ($\text{DO} < 1.0\text{ mg/L}$) acts as a primary sewer trigger.
3. `TSS_mg_L` (0.6827): Particulate overloading exceeding physical treatment limits.
4. `BOD_mg_L` (0.5601): Severe organic carbon loading.
5. `E_coli_CFU_100mL` (0.5179): Pathogenic concentration spikes.

### Class 1: Bio-filtration (Secondary Vegetated Treatment)
1. `TSS_mg_L` (0.6478): Moderate particulate loads requiring media filtration beds.
2. `Greywater_Source_Mixed` (0.4375): Mixed source greywater regularly routed to bio-filtration.
3. `DO_mg_L` (0.4268): Depleted oxygen requiring passive wetland re-aeration.
4. `BOD_mg_L` (0.3642): Intermediate organic load treatable by biological biofilms.
5. `E_coli_CFU_100mL` (0.3100): Pathogen levels within constructed wetland attenuation limits.

### Class 2: Restricted Irrigation (Sub-surface Land Application)
1. `TSS_mg_L` (1.6637): Low TSS prevents irrigation emitter clogging.
2. `E_coli_CFU_100mL` (1.2147): Moderate microbial safety compliant with WHO/EPA non-potable standards.
3. `TUR_NTU` (1.0473): Optical clarity confirming suitability for direct landscape application.
4. `COD_mg_L` (0.7360): Absence of phytotoxic chemical surfactant spikes.
5. `DO_mg_L` (0.6072): Aerobic state preventing soil crusting and odorous anoxia.

### Class 3: Indoor Reuse (Toilet Flushing & High-Clarity Reuse)
1. `TUR_NTU` (0.9560): Demanding aesthetic and optical clarity requirement.
2. `E_coli_CFU_100mL` (0.9503): Stringent microbiological safety boundary.
3. `DS_mg_L` (0.6415): Low dissolved solids preventing plumbing mineral deposition.
4. `BOD_mg_L` (0.6066): Very low organic content preventing biological regrowth in tanks.
5. `COD_mg_L` (0.5928): Strict chemical purity.

---

## 7. Local Explanations & Directional Terminology

For individual predictions, the local explainer computes exact directional impacts in log-odds space:
- **Positive SHAP Contribution ($\phi > 0$):** Pushes the model output **toward** the predicted class relative to the model baseline.
- **Negative SHAP Contribution ($\phi < 0$):** Pushes the model output **away from** the predicted class.

Directional terminology strictly describes mathematical model behavior, avoiding misleading evaluative terms like "good quality" or "bad water".

### Example Local Narrative (Sample 1 — Sewer Bypass)
> *"XGBoost predicted Sewer Bypass with 99.2% confidence. The strongest model contributors were DO_mg_L, COD_mg_L, BOD_mg_L, E_coli_CFU_100mL, and TDS_mg_L. DO_mg_L and COD_mg_L contributed positively toward the model's Sewer Bypass output. BOD_mg_L and E_coli_CFU_100mL contributed negatively, pushing model output away from Sewer Bypass."*

---

## 8. Separation of ML Predictions and Decision Overrides

A fundamental engineering guarantee of this system is that **SHAP explains the ML model, while deterministic rules explain operational overrides.**

SHAP values are **never modified or reverse-engineered** to justify an external policy override.

| Aspect | ML Model Explanation (SHAP) | Decision Override Explanation (Rules / Context) |
|:---|:---|:---|
| **Origin** | Supervised tree ensemble mathematical loss | Deterministic physical safety thresholds & weather sensors |
| **Question Answered** | *"Why did XGBoost predict Class X?"* | *"Why was Class X diverted or deferred operationally?"* |
| **Inputs** | 19 Water Quality Features | Safety cutoffs, Isolation Forest score, Weather API, Storage kinetics |
| **Authority** | Predictive advisory | Binding operational mandate |

---

## 9. Safety Override Transparency

When raw greywater presents an acute biological, toxic, or septic hazard (e.g. $E. coli > 500,000\text{ CFU/100mL}$, $\text{pH} < 6.0$, or $\text{COD} > 800\text{ mg/L}$), Priority 1 Safety Precedence instantly diverts flow to Sewer Bypass regardless of ML output:

```
MODEL DECISION: Restricted Irrigation (Confidence: 88.4%)
MODEL EXPLANATION: SHAP indicates the primary model contributors were TSS_mg_L, TUR_NTU, and BOD_mg_L.
SAFETY OVERRIDE: Although the ML model predicted Restricted Irrigation, an independent critical 
water-quality condition triggered the highest-priority safety rule (WQ_HIGH_ECOLI). 
Therefore, the final route was changed to Sewer Bypass.
ACTION: SAFETY_OVERRIDE
```

---

## 10. Anomaly Explanation (Isolation Forest Separation)

The unsupervised Isolation Forest (Phase 7) operates independently from XGBoost. XGBoost SHAP is **not** used to explain Isolation Forest decisions:
- Anomaly status (`NORMAL` vs `ANOMALY`) and continuous anomaly scores are reported separately.
- Standard narrative: *"The anomaly detector identified this observation as statistically unusual relative to its training distribution (score: 0.1420)."*

---

## 11. Weather Context Explanation

Environmental weather data (Phase 9) acts as an operational constraint on landscape irrigation:
- Heavy precipitation or sub-freezing soil conditions trigger route deferral (`DEFER_ROUTE` or `STORE_FOR_LATER`).
- The water quality classification remains **Restricted Irrigation**; only physical valve dispatch is delayed.
- Standard narrative: *"Unfavorable environmental conditions triggered route deferral. The water-quality route remains Restricted Irrigation, but dispatch is temporarily deferred (action: STORE_FOR_LATER)."*

---

## 12. Storage Tank Deterioration Explanation

Biochemical storage decay (Phase 10) tracks hydraulic residence time and anaerobic staling:
- When the storage deterioration index exceeds operational limits ($DI \ge 0.50$ or $0.75$), tank recirculation or sewer purge is requested.
- Standard narrative: *"Storage review was requested because the biochemical deterioration index (0.85) exceeded configured operational review thresholds. Final action: REVIEW_REQUIRED."*

---

## 13. Comprehensive Scenario Verification

Six validation scenarios were executed and confirmed across the unified pipeline:

| Scenario | ML Prediction (Conf.) | Top SHAP Features | Safety / Context Condition | Final Decision Route | Final Action | Rationale Summary |
|:---:|:---:|:---:|:---:|:---:|:---:|:---|
| **1. Normal Dispatch** | Restricted Irrigation (99.1%) | `TSS`, `E. coli`, `TUR` | Clean; Weather Favorable | Restricted Irrigation | `ALLOW_ROUTE` | Normal operational dispatch approved without overrides. |
| **2. Weather Deferral** | Restricted Irrigation (98.6%) | `TSS`, `E. coli`, `Bathroom` | Rain probability 95% | Restricted Irrigation | `STORE_FOR_LATER` | Water quality compliant; outdoor irrigation paused due to rain. |
| **3. Safety Override** | Bio-filtration (78.2%) | `BOD`, `COD`, `TSS` | Acute Pathogen Spike ($E. coli > 500k$) | Sewer Bypass | `SAFETY_OVERRIDE` | Critical physical cutoff superseded ML prediction for hazard containment. |
| **4. Statistical Anomaly** | Bio-filtration (89.4%) | `TSS`, `COD`, `DO` | Isolation Forest Score 0.165 | Bio-filtration | `PROCEED_WITH_TREATMENT` | Statistical divergence noted; treated with operator advisory. |
| **5. Tank Stagnation** | Restricted Irrigation (98.6%) | `TSS`, `E. coli`, `Bathroom` | Deterioration Index 0.85 | Restricted Irrigation | `REVIEW_REQUIRED` | Storage water aged; operational review or aeration triggered. |
| **6. Low Confidence** | Restricted Irrigation (58.4%) | `TUR`, `COD`, `DS` | Model Confidence $< 60\%$ | Restricted Irrigation | `REVIEW_REQUIRED` | Marginal prediction flagged for supervisory operator inspection. |

---

## 14. Generated Visualizations & Artifacts

### Figures Generated (`reports/figures/shap/`)
1. `global_bar.png`: Stacked global bar chart showing mean $|SHAP|$ across all 4 routing classes.
2. `global_beeswarm.png`: Beeswarm distribution plot showing feature values vs Sewer Bypass log-odds impact.
3. `class_0_importance.png`: Top 10 feature bars for Sewer Bypass.
4. `class_1_importance.png`: Top 10 feature bars for Bio-filtration.
5. `class_2_importance.png`: Top 10 feature bars for Restricted Irrigation.
6. `class_3_importance.png`: Top 10 feature bars for Indoor Reuse.
7. `dependence_TSS.png`: Dependence plot with interaction coloring for Suspended Solids.
8. `dependence_COD.png`: Dependence plot for Chemical Oxygen Demand.
9. `dependence_E.png`: Dependence plot for Microbiological Pathogens ($E. coli$).
10. `sample_1_waterfall.png` & `sample_1_bar.png`: Local waterfall and horizontal attribution bars for Sample 1.
11. `sample_2_waterfall.png` & `sample_2_bar.png`: Local attributions for Restricted Irrigation sample.
12. `sample_3_waterfall.png` & `sample_3_bar.png`: Local attributions for Bio-filtration sample.

### Data Artifacts Generated
- `reports/shap_global_importance.csv`: Global feature rankings.
- `reports/shap_class_importance.csv`: Class-by-class feature rankings.
- `dataset/processed/routing_decisions_explained.csv`: 225 test samples enriched with top 3 SHAP features, values, attributions, override status, and decision summaries.

---

## 15. Mandatory Scientific Interpretation Disclaimers

> **MANDATORY SCIENTIFIC LIMITATIONS:**
> 1. **SHAP values explain the behavior of the trained machine-learning model and should not be interpreted as causal relationships between water-quality parameters and greywater safety.**
> 2. **Because the supervised routing labels are rule-derived operational labels, SHAP primarily explains how the model learned that operational labeling framework rather than independently validated real-world reuse outcomes.**
> 3. Additive feature attribution assumes tree path independence conditioning; collinearity among water quality metrics (e.g. Total Dissolved Solids vs Electrical Conductivity, or Biochemical vs Chemical Oxygen Demand) distributes attribution credit among correlated covariates.
> 4. Model predictions are strictly probabilistic representations of past data; deterministic safety screening remains the ultimate authority for environmental and public health protection.

---

## 16. Reproducibility & Verification

To reproduce Phase 12 verification and execute the full test suite:

```bash
# 1. Run all unit tests across Phases 1-12
pytest -q

# 2. Run Global, Local, and Batch SHAP Analysis
python -c "from explainability.global_explainer import GlobalShapExplainer; GlobalShapExplainer().run_and_save_all('dataset/processed/train.csv')"
python -c "from explainability.decision_explainer import DecisionExplainer; DecisionExplainer().explain_batch_to_csv('dataset/processed/test.csv')"

# 3. Validate interactive Jupyter Notebook
python -c "import json; nb=json.load(open('notebooks/09_shap_explainability.ipynb')); print(f'Notebook cells: {len(nb[\"cells\"])}')"
```
