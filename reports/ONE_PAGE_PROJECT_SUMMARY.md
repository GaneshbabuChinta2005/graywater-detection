# One-Page Project Executive Summary
## AI-Driven Intelligent Greywater Management and Smart Reuse Routing System

---

### Project Overview
* **Title:** AI-Driven Intelligent Greywater Management and Smart Reuse Routing System
* **Domain:** Cyber-Physical Systems, Water Informatics, Decentralized Wastewater Reclamation, Applied Machine Learning, Explainable AI (XAI).

---

### Problem & Challenge
Domestic greywater accounts for 50–70% of residential wastewater. Reusing it is critical for urban water security, but influent quality fluctuates drastically across domestic fixtures (Bathroom, Laundry, Kitchen). Existing static plumbing diverters lack real-time intelligence, causing biological filter fouling from kitchen grease, hazardous landscape runoff during rainstorms, and foul anaerobic septic stagnation during prolonged storage. Pure machine-learning approaches lack deterministic guarantees, making them unacceptable under strict public health regulations.

---

### Proposed Solution
A prototype cyber-physical software platform that couples supervised machine learning, unsupervised anomaly screening, deterministic physical safety precedence, real-time meteorological weather context, hydraulic storage decay kinetics, and Shapley additive explanations (TreeSHAP) into an autonomous, 6-tier hierarchical routing engine.

---

### System Pipeline & Inputs
* **Input Data:** Ingests fixture source (Bathroom, Laundry, Kitchen, Mixed) and 14 physicochemical and biological parameters: $pH$, Temperature, Salinity, Turbidity, DS, TDS, TSS, Electrical Conductivity, Dissolved Oxygen, BOD, COD, $NH_4F$, $NO_3$, $K$, and *E. coli*.
* **Preprocessing:** Leak-free 19-dimensional canonical feature vector with stratified 70/15/15 train/validation/test partitioning.

---

### Machine Learning Models
* **Primary Classifier:** Optimized XGBoost (`xgboost_optimized.pkl`, 120 trees, depth 5, learning rate 0.08).
* **Comparison Baseline:** Optimized Random Forest (`random_forest_optimized.pkl`, 150 trees).
* **Anomaly Detector:** Unsupervised Isolation Forest (`isolation_forest.pkl`, 100 trees, 5% contamination).
* **Explainability Engine:** Exact multiclass TreeSHAP (`shap.TreeExplainer`).

---

### System Outputs
* **Final Route:** 4 operational reuse destinations: `Class 0: Sewer Bypass`, `Class 1: Bio-filtration`, `Class 2: Restricted Irrigation`, `Class 3: Indoor Reuse`.
* **Final Action:** Actuator instructions: `ALLOW_ROUTE`, `STORE_FOR_LATER`, `RECIRCULATE`, `REVIEW_REQUIRED`, `SAFETY_OVERRIDE`.
* **Audit Trail:** Standardized reason codes (e.g., `ML_PREDICTION_ACCEPTED`, `WQ_CRITICAL_PH`, `METEO_FAVORABLE`).

---

### Key Verified Results
* **XGBoost Test Accuracy:** **97.78%** on holdout test set ($n=225$).
* **Model Macro F1 / Weighted F1:** **0.7346** / **0.9756**.
* **Sewer Bypass Hazard Recall:** **97.01%** (ensuring dangerous water is diverted to sewer).
* **Anomaly Screening Sensitivity:** **100.0%** on acute chemical/temperature shock vectors.
* **Automated Verification:** **132 / 132 automated tests passed (100% pass rate)** in 130.62 seconds.
* **Safety Override Precedence:** Verified in 100% of test cases; acute hazards unconditionally force Sewer Bypass.

---

### Core Limitations
1. **Rule-Derived Labels:** Accuracy measures fidelity in emulating engineered operational rules, not independent clinical safety.
2. **Synthetic Telemetry:** Telemetry originates from a physics-constrained Digital Twin simulator, not physical IoT hardware.
3. **Storage Kinetics:** Modeled via mechanistic Arrhenius equations; exact real-world shelf-life requires empirical laboratory culturing.
4. **Domain Boundary:** Calibrated strictly for domestic residential greywater; inapplicable to hospital or industrial wastewater.

---

### Future Roadmap
1. Port inference logic to embedded microcontrollers (ESP32) interfaced with industrial ISFET pH and optical turbidity sensors.
2. Acquire longitudinal microbiological degradation datasets from a physical $1000\text{ L}$ bench-scale recycling rig.
3. Implement Model Predictive Control (MPC) and edge TinyML quantization for autonomous low-power municipal deployment.
