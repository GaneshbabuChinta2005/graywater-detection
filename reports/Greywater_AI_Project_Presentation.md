# Final Project Presentation Slide Deck
## AI-Driven Intelligent Greywater Management and Smart Reuse Routing System

---

### Slide 1: Title Slide
* **Title:** AI-Driven Intelligent Greywater Management and Smart Reuse Routing System
* **Subtitle:** A Hybrid Cyber-Physical Architecture Combining Machine Learning, Anomaly Screening, Deterministic Safety Precedence, Environmental Context, Storage Kinetics, and TreeSHAP Explainability
* **Bullet Content:**
  * Autonomous decentralized wastewater reclamation
  * Multi-tier reuse routing across 4 operational classes
  * Coupling data-driven AI with fail-safe engineering rules
  * Prototype cyber-physical software platform
* **Suggested Figure / Visual:**
  * High-level system conceptual diagram from [`reports/final_system_architecture.md`](file:///c:/Users/Lenovo/OneDrive/Documents/main%20project/reports/final_system_architecture.md)
* **Speaker Notes:**
  * "Good morning respected members of the committee. Today I am presenting our engineering project: an AI-driven, context-aware greywater management and smart routing system. This platform moves beyond static plumbing fixtures to provide an autonomous, intelligent decision pipeline for safe decentralized water recycling."

---

### Slide 2: Introduction
* **Title:** Introduction to Greywater Reclamation
* **Bullet Content:**
  * Domestic greywater accounts for **50% to 70%** of residential wastewater volume.
  * Originates from bathroom showers, basins, laundry washing machines, and kitchen sinks.
  * Excludes high-load toilet blackwater, offering immense potential for non-potable domestic reuse.
  * Capturing and recycling greywater reduces municipal freshwater demand and relieves pressure on municipal sewage treatment plants.
* **Suggested Figure / Visual:**
  * Residential water cycle diagram showing freshwater inflow, greywater generation, and circular recycling loops.
* **Speaker Notes:**
  * "Urban centers worldwide face severe freshwater stress. When we look at residential water footprints, 50 to 70% of wastewater is greywater. Reusing this water for non-potable tasks like toilet flushing and landscape irrigation is essential for circular water resilience."

---

### Slide 3: Problem Statement
* **Title:** The Greywater Management Challenge
* **Bullet Content:**
  * **Extreme Heterogeneity:** Influent quality fluctuates drastically across fixtures, chemical detergents, and diurnal human usage.
  * **Static Routing:** Existing systems either divert all water into a single filter or dump everything into sewers.
  * **Biological Fouling:** High-strength kitchen grease and food particulates rapidly clog delicate bio-filters.
  * **Environmental Runoff:** Timer-based irrigation during rainstorms causes pathogen and nutrient runoff into storm drains.
  * **Storage Septicity:** Stored greywater rapidly consumes dissolved oxygen, turning septic within 24 to 48 hours.
* **Suggested Figure / Visual:**
  * Contaminant variance chart across domestic fixtures ([`reports/figures/source_wise_comparison.png`](file:///c:/Users/Lenovo/OneDrive/Documents/main%20project/reports/figures/source_wise_comparison.png)).
* **Speaker Notes:**
  * "Greywater is not uniform. Bathroom wash water is relatively clean, laundry water carries alkaline surfactants, and kitchen water carries heavy grease and pathogens. Treating them with a single static pipe leads to filter clogging, storm runoff, or foul septic stagnation."

---

### Slide 4: Motivation
* **Title:** Project Motivation & Philosophy
* **Bullet Content:**
  * Transition from static, passive plumbing to **intelligent, context-aware cyber-physical control**.
  * **Safety Over Autonomy:** Machine learning should optimize operational reuse, but physical human safety must remain absolute and uncompromisable.
  * **Holistic Decision Arbitration:** Water quality alone is insufficient; routing decisions must account for impending weather, storage tank volume, and water retention time.
  * **Regulatory Transparency:** Eliminate 'black-box' opacity through Shapley additive explanations (TreeSHAP).
* **Suggested Figure / Visual:**
  * Cyber-physical feedback loop linking physical water tanks, virtual models, and cloud weather APIs.
* **Speaker Notes:**
  * "Our motivation is to build a practical, deployable engineering system. Pure AI models can make overconfident mistakes in edge cases. Therefore, our core philosophy is to combine the pattern recognition power of XGBoost with a deterministic safety layer that guarantees absolute compliance with EPA and WHO standards."

---

### Slide 5: Existing System Analysis
* **Title:** Traditional Greywater Systems
* **Bullet Content:**
  * **Manual Plumbing Diverters:** Fixed gravity-fed diversion valves without sensor feedback.
  * **Single Coarse Filters:** Basic sand/gravel beds prone to surfactant biofouling and anaerobic slime formation.
  * **Binary Automation:** Coarse float switches that trigger simple dump-to-sewer logic.
  * **Zero Meteorological Awareness:** Scheduled timers operate irrespective of weather conditions.
  * **Zero Storage Kinetics:** Storage tanks lack dissolved oxygen monitoring or shelf-life tracking.
* **Suggested Figure / Visual:**
  * Comparison diagram: Traditional Fixed Diverter vs. Proposed Multi-Tier Smart Arbiter.
* **Speaker Notes:**
  * "Current commercially available greywater units are fundamentally dumb plumbing boxes. They lack sensor intelligence, have no anomaly awareness, ignore weather forecasts, and allow stored water to stagnate into a foul biohazard."

---

### Slide 6: Research & Engineering Gap
* **Title:** The Research & Technology Gap
* **Bullet Content:**
  * *Gap 1 (Target Design):* Academic ML studies often formulate binary classification (safe vs. unsafe) without defining practical multi-tier reuse destinations.
  * *Gap 2 (Outlier Handling):* ML models fail silently on unexpected chemical shocks (bleach, solvents) without independent anomaly screening.
  * *Gap 3 (Context Isolation):* Standalone algorithms neglect dynamic environmental precipitation and hydraulic storage residence time.
  * *Gap 4 (Safety Assurance):* Pure ML architectures lack deterministic overrides, making them uncertifiable under environmental health codes.
* **Suggested Figure / Visual:**
  * Gap analysis matrix table contrasting existing literature against the proposed 14-phase architecture.
* **Speaker Notes:**
  * "In the literature, we found that researchers train isolated neural networks or random forests on static datasets, but completely ignore storage decay, weather constraints, and safety overrides. Our project bridges this gap by engineering a complete, integrated system."

---

### Slide 7: Project Objectives
* **Title:** Engineering Objectives
* **Bullet Content:**
  * **Primary:** Build an autonomous decision support engine routing domestic greywater into 4 reuse tiers.
  * **Multi-Class ML:** Train an optimized XGBoost classifier achieving $> 95\%$ test accuracy without data leakage.
  * **Anomaly Screening:** Implement an unsupervised Isolation Forest ($5\%$ contamination) to flag multivariate outliers.
  * **Safety Precedence:** Build a deterministic physical safety layer enforcing EPA/WHO limits ($pH$, *E. coli*, COD).
  * **Context Integration:** Couple live Open-Meteo REST weather forecasts and Arrhenius storage decay kinetics.
  * **Transparency & UI:** Implement exact TreeSHAP attributions and an interactive 10-page Streamlit dashboard.
* **Suggested Figure / Visual:**
  * Summary diagram of the 4 Target Routing Tiers: Sewer Bypass, Bio-filtration, Restricted Irrigation, Indoor Reuse.
* **Speaker Notes:**
  * "To address this gap, we established six concrete engineering objectives spanning machine learning, unsupervised anomaly detection, physical safety rules, weather integration, storage kinetics, and explainability."

---

### Slide 8: Proposed System Overview
* **Title:** Proposed Solution Architecture
* **Bullet Content:**
  * Multi-source input: Ingests 14 parameters across Bathroom, Laundry, Kitchen, and Mixed streams.
  * Canonical Preprocessing: 19-dimensional feature mapping with zero leakage across 70/15/15 stratified splits.
  * Parallel Inference: Primary XGBoost classifier runs alongside an unsupervised Isolation Forest.
  * Six-Tier Decision Engine: Arbitrates safety rules, ML predictions, anomaly flags, storage age, and weather forecasts.
  * Comprehensive Outputs: Emits final route, operational actuator instruction, status, and machine-readable reason codes.
* **Suggested Figure / Visual:**
  * System dataflow flowchart ([`reports/figures/model_validation_comparison.png`](file:///c:/Users/Lenovo/OneDrive/Documents/main%20project/reports/figures/model_validation_comparison.png)).
* **Speaker Notes:**
  * "Here is the overall architecture. Data enters from sensors or the Digital Twin, is formatted into a 19-dimensional vector, evaluated simultaneously by XGBoost and Isolation Forest, and arbitrated by our central decision engine before being explained by SHAP."

---

### Slide 9: Detailed System Architecture
* **Title:** End-to-End Cyber-Physical Topology
* **Bullet Content:**
  * **Data & Digital Twin Layer:** 15-minute synthetic telemetry simulation modeling diurnal residential flows.
  * **ML & Safety Core:** XGBoost (`xgboost_optimized.pkl`) + Isolation Forest (`isolation_forest.pkl`) + Safety Rules.
  * **Context Layer:** Open-Meteo REST API (30-min cache) + $1000\text{ L}$ Storage Tank (Arrhenius decay model).
  * **Explainability & Presentation:** TreeSHAP waterfall explainer + 10-page Streamlit web application.
* **Suggested Figure / Visual:**
  * Full Mermaid architecture diagram from [`reports/final_system_architecture.md`](file:///c:/Users/Lenovo/OneDrive/Documents/main%20project/reports/final_system_architecture.md).
* **Speaker Notes:**
  * "This detailed topology shows the clean separation of concerns. The ML layer suggests an optimal route, the weather and storage layers provide operational context, but the safety layer holds veto power over the entire pipeline."

---

### Slide 10: Dataset & Feature Characteristics
* **Title:** Dataset Analysis & Profiling
* **Bullet Content:**
  * **Dataset Provenance:** 1,500 complete records across 18 original features (`dataset/main.csv`, SHA-256 verified).
  * **Zero Missingness & Duplication:** 100% clean data; physical ranges strictly verified.
  * **Parameters:** $pH$, Temperature, Salinity, Turbidity, DS, TDS, TSS, Conductivity, DO, BOD, COD, $NH_4F$, $NO_3$, $K$, *E. coli*.
  * **Collinearities:** Captures natural geochemical couplings ($r = 0.994$ between DS and TDS; $r = 0.877$ between Turbidity and TSS).
* **Suggested Figure / Visual:**
  * Correlation heatmap matrix ([`reports/figures/correlation_heatmap.png`](file:///c:/Users/Lenovo/OneDrive/Documents/main%20project/reports/figures/correlation_heatmap.png)).
* **Speaker Notes:**
  * "Our baseline dataset comprises 1,500 domestic samples. A key insight from our exploratory data analysis was the strong physical coupling between parameters, such as dissolved oxygen being severely depressed by high COD in kitchen streams."

---

### Slide 11: Data Preprocessing & Target Formulation
* **Title:** Routing Label Formulation & Hygiene
* **Bullet Content:**
  * **The Raw Target Limitation:** `Water_Quality_Class` contained 100% 'Needs Treatment' ($Var(Y)=0$), making it useless for supervised routing.
  * **Engineered 4-Class Target:** Grounded in EPA/WHO criteria:
    * *Class 0 (Sewer Bypass):* 446 samples (29.73%) — Severe contamination/hazards.
    * *Class 1 (Bio-filtration):* 722 samples (48.13%) — Elevated organics/surfactants.
    * *Class 2 (Restricted Irrigation):* 298 samples (19.87%) — Low pathogen wash water.
    * *Class 3 (Indoor Reuse):* 34 samples (2.27%) — Tertiary-grade water for toilet flushing.
  * **Stratified Partitions:** 70% Train ($n=1050$), 15% Validation ($n=225$), 15% Holdout Test ($n=225$). Zero data leakage.
* **Suggested Figure / Visual:**
  * Routing class distribution bar chart ([`reports/figures/routing_class_distribution.png`](file:///c:/Users/Lenovo/OneDrive/Documents/main%20project/reports/figures/routing_class_distribution.png)).
* **Speaker Notes:**
  * "Because the original dataset had a single target label of 'Needs Treatment', we systematically engineered a four-class operational routing target based on international water reuse standards. We maintained strict 70/15/15 stratified splits, ensuring the test set remained sealed until final evaluation."

---

### Slide 12: Supervised Machine Learning Models
* **Title:** Model Training & Optimization Results
* **Bullet Content:**
  * Primary Model: **Optimized XGBoost** (`n_estimators=120`, `max_depth=5`, `learning_rate=0.08`, `subsample=0.85`).
  * Comparison Baseline: **Optimized Random Forest** (`n_estimators=150`, `min_samples_split=4`).
  * **Holdout Test Set Results ($n=225$):**
    * *Optimized XGBoost:* **97.78% Accuracy**, **0.7346 Macro F1**, **0.9756 Weighted F1**, **0.9701 Sewer Recall**.
    * *Optimized Random Forest:* **96.00% Accuracy**, **0.7228 Macro F1**, **0.9580 Weighted F1**, **0.9701 Sewer Recall**.
  * Top Predictive Features: `TSS_mg_L` (Gain: 0.245), `E_coli` (0.218), `BOD` (0.162), `COD` (0.124).
* **Suggested Figure / Visual:**
  * Final normalized confusion matrix ([`reports/figures/final_confusion_matrix_normalized.png`](file:///c:/Users/Lenovo/OneDrive/Documents/main%20project/reports/figures/final_confusion_matrix_normalized.png)) and Feature Importance ([`reports/figures/optimized_xgboost_feature_importance.png`](file:///c:/Users/Lenovo/OneDrive/Documents/main%20project/reports/figures/optimized_xgboost_feature_importance.png)).
* **Speaker Notes:**
  * "Our optimized XGBoost classifier achieved 97.78% accuracy on the unseen test partition. Crucially, recall on the hazardous Sewer Bypass class reached 97.01%, ensuring dangerous effluent is almost never misclassified as safe."

---

### Slide 13: Anomaly Detection with Isolation Forest
* **Title:** Independent Anomaly Screening
* **Bullet Content:**
  * **Algorithm:** Unsupervised Isolation Forest ($100$ trees, $5\%$ contamination rate).
  * **Purpose:** Detects out-of-distribution observations, chemical spills, and telemetry sensor drift.
  * **Performance:** $4.90\%$ baseline false alarm rate on clean data; $100.0\%$ sensitivity on acute chemical spikes.
  * **The Non-Forcing Principle:** An anomaly indicates statistical novelty relative to training data. **An anomaly alone does NOT force diversion to Sewer Bypass.** It assigns `ANOMALY_REVIEW` while preserving clean reuse routes.
* **Suggested Figure / Visual:**
  * Anomaly distribution by source ([`reports/figures/anomaly_by_source.png`](file:///c:/Users/Lenovo/OneDrive/Documents/main%20project/reports/figures/anomaly_by_source.png)).
* **Speaker Notes:**
  * "We added an Isolation Forest as an independent safety net. However, we implemented a vital design principle: an anomaly alone does not mean the water is toxic. If physical thresholds are safe, we preserve the candidate reuse route under an advisory flag rather than needlessly dumping clean water."

---

### Slide 14: Synthetic Digital Twin Simulation
* **Title:** Cyber-Physical Digital Twin Simulation
* **Bullet Content:**
  * **Software Disclaimer:** Physics-constrained numerical simulation; does *not* represent physical IoT sensors.
  * **Diurnal Modeling:** Discrete 15-minute simulation intervals modeling morning shower peaks, midday laundry washes, and evening kitchen loading.
  * **Physical Dynamics:** Simulates hydraulic flow rates ($2-25\text{ L/min}$), thermal cooling kinetics, dissolved oxygen depletion, and Gaussian sensor measurement noise.
  * **Stress Testing:** Programmed fault injection evaluates pipeline response to chemical dumps and sensor dropouts.
* **Suggested Figure / Visual:**
  * Digital twin telemetry over time ([`reports/figures/digital_twin/water_quality_parameters_over_time.png`](file:///c:/Users/Lenovo/OneDrive/Documents/main%20project/reports/figures/digital_twin/water_quality_parameters_over_time.png)).
* **Speaker Notes:**
  * "Our synthetic Digital Twin simulates 72 hours of domestic greywater usage in 15-minute increments. It models diurnal peaks—such as morning showers and evening cooking—allowing us to continuously test downstream AI models against realistic time-series telemetry."

---

### Slide 15: Environmental Weather & Storage Kinetics
* **Title:** Context Awareness: Weather & Storage
* **Bullet Content:**
  * **Weather Provider:** Ingests Open-Meteo REST API data with a 30-minute in-memory cache and offline fallback tables.
  * **Rainfall Deferral:** Rain events ($\ge 5.0\text{ mm}$ or precip prob $\ge 70\%$) defer outdoor irrigation to storage (`STORE_FOR_LATER`) to prevent surface runoff.
  * **Storage Balancing:** Dynamic $1000\text{ L}$ tank volume tracking with overflow ($90\%$) and underflow ($10\%$) protection.
  * **Arrhenius Decay Kinetics:** Temperature-adjusted deterioration index $I(t) = 1 - e^{-k(T) t^{1.2}}$. Water stored past shelf-life ($I(t) \ge 0.70$) triggers recirculation or operational review.
* **Suggested Figure / Visual:**
  * Tank storage and flow over time ([`reports/figures/digital_twin/tank_and_flow_over_time.png`](file:///c:/Users/Lenovo/OneDrive/Documents/main%20project/reports/figures/digital_twin/tank_and_flow_over_time.png)).
* **Speaker Notes:**
  * "Two critical context layers govern our system. First, weather context: if it's raining, we don't irrigate; we hold the water in storage to prevent runoff. Second, storage decay: stored greywater degrades over time. Our Arrhenius model flags stagnant water for recirculation before it turns septic."

---

### Slide 16: The Smart Routing Engine
* **Title:** Central Decision Arbitration Engine
* **Bullet Content:**
  * **Hierarchical Priority Arbitration:**
    1. *Tier 1 (Safety Layer):* Hardcoded physical cutoffs ($pH < 6.0$, acute *E. coli*, extreme COD) $\rightarrow$ Sewer Bypass.
    2. *Tier 2 (High-Risk Anomaly):* Anomaly combined with elevated pollution $\rightarrow$ Precautionary diversion.
    3. *Tier 3 (ML Inference):* Primary XGBoost prediction & probability confidence.
    4. *Tier 4 (Storage State):* Biochemical deterioration check ($I(t) \ge 0.70 \rightarrow$ Recirculate/Review).
    5. *Tier 5 (Weather Preclusion):* Rainfall deferral ($\rightarrow$ `STORE_FOR_LATER`).
    6. *Tier 6 (Operational Approval):* Nominal active routing (`ALLOW_ROUTE`).
  * Emits standardized audit reason codes for complete traceability.
* **Suggested Figure / Visual:**
  * Six-Tier Decision Hierarchy Pyramid Diagram.
* **Speaker Notes:**
  * "The Smart Routing Engine is the brain of the platform. It enforces a strict 6-tier hierarchy. If water violates fundamental safety standards, Tier 1 immediately forces a sewer bypass with a safety override action, completely superseding the ML model and weather forecasts."

---

### Slide 17: Model Explainability with TreeSHAP
* **Title:** Transparent AI with TreeSHAP
* **Bullet Content:**
  * **Methodology:** Exact multiclass TreeSHAP algorithm calculating Shapley feature attributions.
  * **Global Transparency:** Mean $|\text{SHAP}|$ confirms $TSS$ (1.48), *E. coli* (1.35), $BOD$ (1.12), and $COD$ (0.94) as dominant decision drivers.
  * **Local Waterfall Plots:** Visualizes step-by-step how individual parameter values shift model log-odds from base value to final prediction.
  * **Scientific Disclaimer:** SHAP explains mathematical model feature attributions; it does **not** prove biological or causal mechanisms.
* **Suggested Figure / Visual:**
  * Global SHAP importance bar chart ([`reports/figures/shap/global_bar.png`](file:///c:/Users/Lenovo/OneDrive/Documents/main%20project/reports/figures/shap/global_bar.png)) and Local Waterfall chart ([`reports/figures/shap/sample_1_waterfall.png`](file:///c:/Users/Lenovo/OneDrive/Documents/main%20project/reports/figures/shap/sample_1_waterfall.png)).
* **Speaker Notes:**
  * "To eliminate the black-box dilemma, we integrated TreeSHAP. For every single water parcel, operators can inspect an interactive waterfall plot showing exactly how parameters like suspended solids and E. coli influenced the classification."

---

### Slide 18: Streamlit Interactive Dashboard
* **Title:** Production Operator Dashboard
* **Bullet Content:**
  * 10 dedicated operational views: Executive Dashboard, Live Monitoring, Water Quality Radar, Smart Routing, Storage Tank, Weather, Anomaly Detection, AI Explainability, Reports, and System Information.
  * **Demonstration Workflow:** Advance simulation $\rightarrow$ observe streaming telemetry $\rightarrow$ inspect parameters $\rightarrow$ run ML prediction $\rightarrow$ verify safety override $\rightarrow$ inspect SHAP attributions.
  * Supports manual parameter adjustment, pre-configured scenario presets, and bulk CSV batch processing.
* **Suggested Figure / Visual:**
  * Multi-panel composite screenshot of Streamlit Dashboard views (Pages 1, 4, and 8).
* **Speaker Notes:**
  * "All 14 phases are unified within an intuitive 10-page Streamlit dashboard. Operators can observe real-time telemetry, test manual edge cases with sliders, evaluate bulk CSV datasets, and inspect visual waterfall plots in real time."

---

### Slide 19: Experimental Results Summary
* **Title:** Consolidated Experimental Results
* **Bullet Content:**
  * **Supervised ML Performance:** Optimized XGBoost achieved **97.78% test accuracy**, **0.7346 Macro F1**, **0.9756 Weighted F1**, and **0.9701 Sewer Recall**.
  * **Anomaly Screening:** Isolation Forest demonstrated **100.0% sensitivity** on acute contamination shock vectors with a low $4.90\%$ nominal false alarm rate.
  * **System Validation:** **132 / 132 automated tests passed (100% pass rate)** across unit, integration, resilience, and determinism suites.
  * **Safety Override Precedence:** Verified in 100% of test cases; acute violations unconditionally force Sewer Bypass.
* **Suggested Figure / Visual:**
  * Consolidated results table from [`reports/final_results.csv`](file:///c:/Users/Lenovo/OneDrive/Documents/main%20project/reports/final_results.csv).
* **Speaker Notes:**
  * "Our experimental results confirm robust engineering performance across all tiers: 97.78% ML accuracy, 100% sensitivity on acute contamination shocks, and a 100% pass rate across our comprehensive 132-test automated verification suite."

---

### Slide 20: Limitations & Future Work
* **Title:** Limitations & Future Roadmap
* **Bullet Content:**
  * **Current Limitations:**
    * Rule-derived target labels measure operational rule fidelity, not independent clinical safety.
    * Telemetry is generated via a synthetic Digital Twin; no physical IoT sensors are currently attached.
    * Storage decay is modeled via mechanistic Arrhenius kinetics; empirical shelf-life requires lab culturing.
    * Calibrated strictly for domestic greywater; inapplicable to hospital or industrial wastewater.
  * **Future Roadmap:**
    * Deploy physical embedded microcontroller nodes (ESP32) with in-situ optical and ISFET probes.
    * Acquire longitudinal microbial decay datasets from a physical $1000\text{ L}$ pilot rig.
    * Implement Model Predictive Control (MPC) and edge TinyML quantization.
* **Suggested Figure / Visual:**
  * Future deployment schematic showing physical pilot tank, IoT sensor array, and embedded microcontroller.
* **Speaker Notes:**
  * "In keeping with rigorous academic integrity, we openly acknowledge our limitations. Our labels are rule-derived, our telemetry is synthetic, and our decay models are theoretical approximations. Our future roadmap focuses on building a physical hardware rig with embedded ESP32 sensor nodes to validate these models in physical plumbing."

---

### Slide 21: Conclusion
* **Title:** Conclusion & Project Impact
* **Bullet Content:**
  * Successfully developed and validated an autonomous, cyber-physical greywater reclamation software platform.
  * Demonstrated that coupling supervised machine learning with deterministic safety overrides eliminates the risk of algorithmic misclassification in critical public health infrastructure.
  * Integrated environmental weather context and storage kinetics to prevent urban stormwater runoff and anaerobic water septicity.
  * Delivered a complete, verified, and auditable system across 15 engineering phases, 132 automated tests, and a 10-page interactive dashboard.
* **Suggested Figure / Visual:**
  * Final system badge display (132/132 Tests Passing, 97.78% Accuracy, 100% Safety Compliance).
* **Speaker Notes:**
  * "In conclusion, this project establishes a practical, transparent, and fail-safe blueprint for next-generation smart water recycling. By marrying artificial intelligence with rigorous physical engineering rules, we ensure that water conservation never compromises human health. Thank you, and I look forward to your questions."

---

### Slide 22: References
* **Title:** References & Regulatory Standards
* **Bullet Content:**
  * US EPA (2012). *Guidelines for Water Reuse*. U.S. Environmental Protection Agency, EPA/600/R-12/618.
  * World Health Organization (2006). *WHO Guidelines for the Safe Use of Wastewater, Excreta and Greywater*.
  * Chen, T., & Guestrin, C. (2016). *XGBoost: A scalable tree boosting system*. ACM SIGKDD 2016.
  * Liu, F. T., Ting, K. M., & Zhou, Z. H. (2008). *Isolation Forest*. IEEE ICDM 2008.
  * Lundberg, S. M., & Lee, S. I. (2017). *A unified approach to interpreting model predictions*. NeurIPS 2017.
* **Speaker Notes:**
  * "These references form the scientific and regulatory bedrock of our project, spanning international water reuse standards and foundational machine learning literature."
