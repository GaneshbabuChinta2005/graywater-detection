# SHAP Explainability & Decision Transparency Documentation
## AI-Driven Intelligent Greywater Management and Smart Reuse Routing System

---

### 1. Explainability Purpose & Motivation

Water recycling decisions are subject to strict environmental and public health regulations. Machine learning models like XGBoost, while highly accurate, function as complex ensembles of non-linear decision trees. Without interpretable explanations:
1. Facility operators cannot verify *why* a particular effluent stream was approved for indoor flushing versus bio-filtration.
2. Regulators cannot audit whether model decisions align with environmental standards or rely on spurious correlations.
3. Edge-case misclassifications cannot be diagnosed or resolved.

To provide mathematical interpretability, this project implements **TreeSHAP** (SHapley Additive exPlanations) for the primary optimized XGBoost model.

* **Module Location:** `explainability/` (`shap_explainer.py`, `local_explainer.py`, `global_explainer.py`, `decision_explainer.py`)

---

### 2. Scientific Disclaimer on Causality

> [!WARNING]
> **MANDATORY SCIENTIFIC DISCLAIMER:**
> **"SHAP explains model behavior and should not be interpreted as causal evidence."**
> 
> * **Mathematical vs. Physical Reality:** SHAP values quantify the additive contribution of each input feature toward shifting the model's output log-odds away from the expected base value.
> * **Absence of Causality:** A high positive SHAP value for a feature (e.g., $TSS$ or $DO$) indicates that the feature strongly influenced the model's mathematical prediction. It does **not** prove that manipulating that feature in isolation will biologically or causally guarantee safe water quality.

---

### 3. TreeExplainer Formulation & Multiclass Alignment

* **Explainer Algorithm:** `shap.TreeExplainer`
  * Exact, polynomial-time algorithm designed specifically for tree ensembles.
* **Input Dimensionality:** Strict 19-dimensional feature alignment matching the canonical preprocessor:
  $$\text{Vector} = [\text{Src}_{\text{Bathroom}}, \text{Src}_{\text{Kitchen}}, \text{Src}_{\text{Laundry}}, \text{Src}_{\text{Mixed}}, pH, \text{TEMP\_C}, \dots, \text{E\_coli}]$$
* **Multiclass Output Tensors:**
  * XGBoost outputs probability distributions across 4 classes.
  * TreeSHAP generates a 3-dimensional tensor of Shapley values:
    $$\Phi \in \mathbb{R}^{N \times 19 \times 4}$$
    where each slice $\Phi[:, :, c]$ represents feature attributions for routing class $c \in \{0, 1, 2, 3\}$.
* **Additive Efficiency Property:**
  $$f(x)_c = \mathbb{E}[f(x)_c] + \sum_{i=1}^{19} \phi_{i, c}$$
  The sum of all feature attributions plus the expected base value equals the model's raw output logit for class $c$.

---

### 4. Global Feature Importance & Class-Specific Drivers

Global importance is computed by taking the mean absolute SHAP value across all samples in the test partition:
$$I_i = \frac{1}{N} \sum_{j=1}^N |\phi_{i}^{(j)}|$$

#### Verified Global Rankings:
1. **`TSS_mg_L` (Mean $|\text{SHAP}| = 1.48$):** The globally dominant driver. High suspended solids push log-odds strongly toward Sewer Bypass or Bio-filtration; low solids promote Restricted Irrigation and Indoor Reuse.
2. **`E_coli_CFU_100mL` (Mean $|\text{SHAP}| = 1.35$):** Critical microbiological barrier. Elevated coliforms suppress Indoor Reuse and Restricted Irrigation.
3. **`BOD_mg_L` (Mean $|\text{SHAP}| = 1.12$):** Biochemical organic loading governing bio-filtration requirements.
4. **`COD_mg_L` (Mean $|\text{SHAP}| = 0.94$):** Refractory chemical oxygen demand separating treatable streams from sewer bypass.
5. **`DO_mg_L` (Mean $|\text{SHAP}| = 0.68$):** Fresh aerobic streams versus depleted anaerobic effluent.
6. **`TUR_NTU` (Mean $|\text{SHAP}| = 0.52$):** Optical clarity indicator.
7. **`Greywater_Source_Bathroom` / `Kitchen` (Mean $|\text{SHAP}| \approx 0.35$):** Fixture source indicators provide contextual baselines.

#### Class-Specific Behavior:
* **Class 0 (Sewer Bypass):** Dominated by positive contributions from extreme $E. coli$, $BOD$, and Kitchen source flags.
* **Class 1 (Bio-filtration):** Dominated by moderate $TSS$, Laundry source flags, and elevated $pH$.
* **Class 2 (Restricted Irrigation):** Driven by low $TSS$, low $E. coli$, and Bathroom source flags.
* **Class 3 (Indoor Reuse):** Requires near-zero $TSS$, minimal $E. coli$, and high dissolved oxygen ($DO > 4.0\text{ mg/L}$).

---

### 5. Local Explanations & Waterfall Visualizations

For every evaluated sample, `local_explainer.py` extracts instance-level attributions:
* **Waterfall Charts:** Illustrate step-by-step how each parameter pushes the model prediction from the base expected value $E[f(x)]$ to the final output score $f(x)$.
* **Top Contributors:** Ranks the top-5 positive contributors (features increasing the predicted class likelihood) and top-5 negative contributors (features decreasing the predicted class likelihood).

---

### 6. Unified Decision Explanation & Fault Tolerance

The `decision_explainer.py` module synthesizes mathematical SHAP attributions with operational context into human-readable narrative paragraphs displayed in the Streamlit UI:
* Example: *"MODEL DECISION: Restricted Irrigation (Confidence: 98.7%). MODEL EXPLANATION: SHAP indicates the primary model contributors were TSS_mg_L, E_coli_CFU_100mL, Greywater_Source_Bathroom. FINAL DECISION: Restricted Irrigation was approved with action 'ALLOW_ROUTE'."*

#### Fault-Tolerant Resilience:
If SHAP computations fail due to memory constraints or library omission, the system catches the exception and returns `"SHAP_UNAVAILABLE"`. The central routing engine continues uninterrupted, ensuring that explainability diagnostics never jeopardize real-time physical water routing.
