# Project Objectives Specification
## AI-Driven Intelligent Greywater Management and Smart Reuse Routing System

This document outlines the formal, verified objectives realized throughout the 14-phase engineering lifecycle of the project. Every listed objective corresponds strictly to implemented modules, verified codebases, and empirical evaluations.

---

### 1. Primary Objective

To design, develop, integrate, and validate an autonomous, context-aware, cyber-physical decision support system that dynamically classifies, monitors, and routes domestic greywater into four operational reuse destinations (*Sewer Bypass*, *Bio-filtration*, *Restricted Irrigation*, *Indoor Reuse*) based on real-time water quality, multivariate anomaly screening, deterministic physical safety precedence, meteorological weather context, hydraulic storage decay kinetics, and transparent TreeSHAP explainability.

---

### 2. Secondary Objectives

1. **Circular Water Conservation:** Maximize the beneficial reuse of residential greywater by diverting treatable bathroom and laundry wash streams away from municipal sewers into non-potable domestic applications.
2. **Infrastructure Protection:** Shield decentralized filtration media (e.g., bio-retention cells, constructed wetlands) from irreversible lipid fouling and particulate overloading by proactively diverting high-strength kitchen effluent.
3. **Environmental Runoff Mitigation:** Prevent saturated soil nutrient and pathogen runoff by dynamically withholding landscape irrigation during precipitation events.
4. **Public Health Risk Elimination:** Eliminate human exposure to pathogen-rich or septic greywater by coupling machine-learning classification with deterministic physical safety cutoffs.

---

### 3. Technical Objectives

1. **Multivariate Water Quality Profiling:** Ingest and process 14 physicochemical and microbiological parameters:
   * *Physical:* $pH$, Temperature (`TEMP_C`), Salinity (`SAL_ppt`), Turbidity (`TUR_NTU`), Dissolved Solids (`DS_mg_L`), Total Dissolved Solids (`TDS_mg_L`), Total Suspended Solids (`TSS_mg_L`), Electrical Conductivity (`COND_uS_cm`).
   * *Chemical:* Dissolved Oxygen (`DO_mg_L`), Biochemical Oxygen Demand (`BOD_mg_L`), Chemical Oxygen Demand (`COD_mg_L`), Ammonium Fluoride (`NH4F_mg_L`), Nitrate (`NO3_mg_L`), Potassium (`K_mg_L`).
   * *Microbiological:* *Escherichia coli* concentration (`E_coli_CFU_100mL`).
2. **Canonical Preprocessing Pipeline:** Construct a leak-free 19-dimensional feature engineering transformer that one-hot encodes fixture source categories (`Bathroom`, `Laundry`, `Kitchen`, `Mixed`) and scales numerical variables using training split statistics exclusively.
3. **Four-Class Target Formulation:** Engineer a scientifically defensible operational routing target compliant with EPA/WHO water recycling standards to replace the non-informative raw target (100% "Needs Treatment").
4. **Hydraulic & Arrhenius Storage Modeling:** Implement a dynamic $1000\text{ L}$ storage tank monitor tracking FIFO hydraulic queues, residence time, and temperature-dependent biochemical deterioration index $I(t) \in [0.0, 1.0]$.
5. **Meteorological REST Provider:** Implement an Open-Meteo REST API client equipped with a 30-minute in-memory cache and offline fallback tables for robust environmental context ingestion.

---

### 4. AI/ML Objectives

1. **High-Fidelity Supervised Classification:** Train, tune, and evaluate an optimized multi-class XGBoost classifier and a Random Forest comparison baseline under strict stratified 70/15/15 train/validation/test partitioning.
2. **Safety-Oriented Recall Maximization:** Optimize classification decision boundaries to achieve $> 96\%$ recall on the high-hazard *Sewer Bypass* class to prevent false-negative safety breaches.
3. **Unsupervised Outlier Detection:** Train an independent Isolation Forest on nominal baseline water quality ($5\%$ contamination parameter) to screen for statistical anomalies without allowing novelty alone to force sewer bypass.
4. **Explainable AI (XAI) Integration:** Implement exact multiclass TreeSHAP to calculate Shapley values across all 19 features, generating local instance waterfall plots and global feature importance summaries.
5. **Fault-Tolerant Explainability:** Implement resilient exception handling ensuring that SHAP calculation failures fall back gracefully to `SHAP_UNAVAILABLE` without interrupting real-time routing.

---

### 5. System Objectives

1. **Synthetic Digital Twin Simulation:** Build a physics-constrained simulator modeling domestic diurnal consumption peaks (morning, midday, evening), stochastic sensor noise, and thermal dissipation over 15-minute discrete time steps.
2. **Deterministic Safety Precedence Layer:** Build an independent physical safety engine enforcing uncompromisable cutoffs ($pH < 6.0$, acute *E. coli*, extreme COD) that unconditionally override ML predictions.
3. **Six-Tier Context-Aware Routing Engine:** Develop a central decision engine arbitrating safety cutoffs, ML confidence, anomaly flags, storage kinetics, weather constraints, and operational actions (`ALLOW_ROUTE`, `STORE_FOR_LATER`, `SAFETY_OVERRIDE`, `REVIEW_REQUIRED`).
4. **Production Interactive UI:** Develop a 10-page Streamlit web dashboard providing executive monitoring, streaming telemetry charts, single-sample analysis, batch CSV processing, storage tracking, and full decision auditing.

---

### 6. Evaluation Objectives

1. **End-to-End Pipeline Integrity:** Verify that every major component returns structured, valid dataclasses without manual intervention across all 132 automated unit and integration tests.
2. **Deterministic Consistency Verification:** Validate that repeated sequential evaluations of identical input vectors yield mathematically identical predictions, anomaly scores, routing actions, and SHAP attributions.
3. **Resilience & Failure Testing:** Verify that complete outages of the Weather API, SHAP library, or storage monitor fail gracefully without crashing the core routing pipeline.
4. **Demonstration Scenario Validation:** Formulate and validate 5 deterministic end-to-end operational scenarios (Nominal, Safety Override, Anomaly Review, Rain Deferral, Storage Decay) for academic viva and technical defense.
