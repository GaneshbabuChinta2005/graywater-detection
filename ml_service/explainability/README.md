# Phase 12: SHAP Explainability & Decision Transparency

## Overview
This module implements scientific SHAP (SHapley Additive exPlanations) for the optimized XGBoost greywater routing classifier, coupled with transparent context-aware decision arbitration.

### Scientific Interpretation Rule
**SHAP values describe how features influence the trained model's output. They should NOT be interpreted as causal effects, biological mechanisms, or regulatory safety criteria.**

Furthermore, because the supervised routing labels are rule-derived operational labels, SHAP primarily explains how the model learned that operational labeling framework rather than independently validated real-world reuse outcomes.

---

## Architecture

```
Water Quality Input (19 features)
        ↓
Feature Alignment & Preprocessing
        ↓
XGBoost Routing Classifier
        ↓
shap.TreeExplainer (Multiclass)
        ↓
ML Feature Attributions (SHAP)
        ↓
Phase 11 Smart Routing Engine
(Safety Cutoffs + Anomaly Screening + Weather Context + Storage Tank Decay)
        ↓
Unified Final Decision & Transparent Rationale
```

---

## Modules

1. **`shap_explainer.py` (`ShapRoutingExplainer`)**:
   - Manages the `shap.TreeExplainer` lifecycle for the optimized XGBoost model.
   - Enforces exact canonical 19-feature alignment (one-hot sources + 15 water quality parameters).
   - Handles multiclass SHAP output tensors `(N, 19, 4)` and baseline expectations.

2. **`global_explainer.py` (`GlobalShapExplainer`)**:
   - Computes global mean absolute SHAP values: $\text{GlobalImportance}(f) = \frac{1}{N \cdot C} \sum_{i, c} |\phi_{i, c}(f)|$.
   - Computes class-specific importance for all four routing routes.
   - Exports `reports/shap_global_importance.csv` and `reports/shap_class_importance.csv`.
   - Generates publication-ready figures in `reports/figures/shap/`:
     - `global_bar.png`
     - `global_beeswarm.png`
     - `class_0_importance.png` to `class_3_importance.png`
     - Feature dependence plots (`dependence_TSS.png`, `dependence_COD.png`, `dependence_BOD.png`).

3. **`local_explainer.py` (`LocalShapExplainer`)**:
   - Extracts sample-level top positive, negative, and absolute contributors.
   - Produces localized waterfall (`sample_1_waterfall.png`) and horizontal bar charts (`sample_1_bar.png`).
   - Generates human-readable explanatory narratives using valid directional terminology.

4. **`decision_explainer.py` (`DecisionExplainer`)**:
   - Synthesizes ML SHAP explanation with independent safety rules, anomaly status, weather context, and storage degradation.
   - Clearly separates ML predictions from deterministic rule overrides (e.g. safety cutoffs or weather deferrals).
   - Batch processes test sets to `dataset/processed/routing_decisions_explained.csv`.

---

## Output Schema

```json
{
  "model_prediction": {
    "class": 2,
    "route": "Restricted Irrigation",
    "confidence": 0.9908
  },
  "shap_explanation": {
    "top_features": ["TSS_mg_L", "COD_mg_L", "BOD_mg_L", "TUR_NTU", "E_coli_CFU_100mL"],
    "base_value": -1.24,
    "predicted_class_contributions": [...]
  },
  "anomaly_explanation": {
    "status": "NORMAL",
    "score": 0.0975,
    "reason": "..."
  },
  "safety_explanation": {
    "status": "SAFE_FOR_MODEL_REVIEW",
    "flags": [],
    "reason": "..."
  },
  "weather_explanation": {
    "status": "FAVORABLE",
    "reason": "..."
  },
  "storage_explanation": {
    "status": "NORMAL",
    "deterioration_index": 0.0,
    "reason": "..."
  },
  "final_decision": {
    "route": "Restricted Irrigation",
    "action": "ALLOW_ROUTE",
    "override_applied": false,
    "reason_codes": ["WQ_ACCEPTABLE", "ANOMALY_CLEAN", "ROUTE_IRRIGATION"]
  },
  "human_readable_explanation": "..."
}
```
