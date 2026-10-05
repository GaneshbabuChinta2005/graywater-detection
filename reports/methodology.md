# Project Methodology Specification
## AI-Driven Intelligent Greywater Management and Smart Reuse Routing System

---

### 1. Overview of Methodology

The engineering methodology follows an end-to-end, cyber-physical pipeline architecture designed to process heterogeneous domestic greywater streams, predict reuse suitability, screen for multivariate anomalies, evaluate deterministic safety constraints, arbitrate environmental context, monitor storage kinetics, explain mathematical decisions, and render operational controls in an interactive dashboard.

```
       [Stage 1: Greywater Input]
                   │
                   ▼
     [Stage 2: Data Preprocessing]
                   │
                   ▼
    [Stage 3: Water Quality Analysis]
                   │
                   ▼
  [Stage 4: XGBoost / Random Forest ML]
                   │
                   ▼
   [Stage 5: Isolation Forest Anomaly]
                   │
                   ▼
    [Stage 6: Synthetic Digital Twin]
                   │
                   ▼
      [Stage 7: Weather Context]
                   │
                   ▼
 [Stage 8: Storage + Decay Monitoring]
                   │
                   ▼
  [Stage 9: Smart Routing Decision Engine]
                   │
                   ▼
    [Stage 10: SHAP Explainability]
                   │
                   ▼
   [Stage 11: Streamlit Dashboard UI]
```

---

### 2. Detailed Stage-by-Stage Methodology

#### Stage 1: Greywater Input Acquisition
* **Description:** Ingests water-quality records from either physical laboratory grab-samples (`dataset/main.csv`), single user input dictionaries, batch CSV uploads, or continuous synthetic telemetry feeds.
* **Input Schema:** Captures the fixture origin (`Greywater_Source`: Bathroom, Laundry, Kitchen, Mixed) alongside 14 physicochemical and biological features: $pH$, Temperature (`TEMP_C`), Salinity (`SAL_ppt`), Turbidity (`TUR_NTU`), Dissolved Solids (`DS_mg_L`), Total Dissolved Solids (`TDS_mg_L`), Total Suspended Solids (`TSS_mg_L`), Conductivity (`COND_uS_cm`), Dissolved Oxygen (`DO_mg_L`), Biochemical Oxygen Demand (`BOD_mg_L`), Chemical Oxygen Demand (`COD_mg_L`), Ammonium Fluoride (`NH4F_mg_L`), Nitrate (`NO3_mg_L`), Potassium (`K_mg_L`), and *Escherichia coli* (`E_coli_CFU_100mL`).

#### Stage 2: Data Preprocessing & Feature Engineering
* **Module:** `models/preprocessor.pkl`, `preprocessing/`
* **Method:** Converts heterogeneous input records into a strict, immutable 19-dimensional numerical feature vector:
  $$\vec{x} = [\text{Src}_{\text{Bath}}, \text{Src}_{\text{Kitch}}, \text{Src}_{\text{Laund}}, \text{Src}_{\text{Mix}}, pH, \text{TEMP\_C}, \dots, \text{E\_coli}]$$
* **Data Hygiene & Partitioning:** The 1,500 baseline samples are partitioned into stratified training (70%, $n=1050$), validation (15%, $n=225$), and holdout test (15%, $n=225$) splits. Normalization parameters are fitted exclusively on training data to guarantee zero data leakage.

#### Stage 3: Water Quality Analysis & Profiling
* **Description:** Analyzes parameter distributions, physical correlations, and source-specific discrepancies.
* **Key Observations:**
  * Kitchen effluent carries severe organic and microbial loading (Mean BOD: $349.4\text{ mg/L}$, COD: $755.0\text{ mg/L}$, *E. coli*: $281,109\text{ CFU}/100\text{mL}$, low DO: $0.88\text{ mg/L}$).
  * Bathroom effluent exhibits low organic loading (Mean BOD: $54.6\text{ mg/L}$, DO: $4.18\text{ mg/L}$) and represents the prime candidate for immediate reuse.
  * Laundry effluent exhibits elevated pH ($7.8-8.4$) and surfactants.
  * Strong collinearities ($r = 0.994$ between DS and TDS; $r = 0.877$ between Turbidity and TSS) are captured naturally by tree-based models without requiring lossy feature pruning.

#### Stage 4: Supervised ML Routing Classification (XGBoost / Random Forest)
* **Modules:** `models/xgboost_optimized.pkl`, `models/random_forest_optimized.pkl`
* **Methodology:** Gradient-boosted decision trees (XGBoost) and an ensemble of bagging decision trees (Random Forest) are trained on the 19-dimensional feature vectors to predict the 4 operational routing classes:
  * `0`: Sewer Bypass
  * `1`: Bio-filtration
  * `2`: Restricted Irrigation
  * `3`: Indoor Reuse
* **Optimization:** Hyperparameters were tuned via 5-fold cross-validation on the training set using Bayesian search. The primary model (Optimized XGBoost) achieved **97.78% test accuracy** and **0.9701 Sewer Bypass recall**, outperforming Random Forest (96.00% accuracy).

#### Stage 5: Unsupervised Anomaly Detection (Isolation Forest)
* **Module:** `anomaly/anomaly_detector.py`, `models/isolation_forest.pkl`
* **Methodology:** An Isolation Forest ($100$ isolation trees, $5\%$ contamination rate) is fitted on nominal baseline samples to recursively isolate multivariate outliers.
* **Core Design Principle:** An anomaly indicates statistical novelty relative to the training manifold (e.g., unusual temperature or mineral spikes). Crucially, **an anomaly alone does not force diversion to Sewer Bypass.** It assigns an advisory flag (`ANOMALY_REVIEW`) while preserving the candidate reuse route, preventing wasteful disposal of safe water.

#### Stage 6: Synthetic Digital Twin Simulation
* **Module:** `simulation/` (`digital_twin.py`, `greywater_simulator.py`)
* **Methodology:** Implements a discrete-event, physics-constrained simulation environment modeling household diurnal flow profiles (morning bathroom peak, midday laundry, evening dinner preparation).
* **Dynamics:** Generates 15-minute time-series telemetry capturing hydraulic flow rates ($2-25\text{ L/min}$), thermal cooling kinetics, and stochastic sensor noise. Explicitly designated as **SYNTHETIC DIGITAL TWIN** to maintain scientific honesty.

#### Stage 7: Environmental & Weather Context Integration
* **Module:** `context/` (`weather_provider.py`, `weather_cache.py`, `config.py`)
* **Methodology:** Queries Open-Meteo REST endpoints for real-time precipitation, precipitation probability, and ambient temperature. Features a 30-minute in-memory cache and offline fallback tables.
* **Context Arbitration:** If outdoor irrigation is predicted but heavy rainfall ($> 5.0\text{ mm}$ or precip prob $> 70\%$) is forecasted, the route is retained as *Restricted Irrigation* but dispatch is deferred (`STORE_FOR_LATER`) to prevent surface runoff.

#### Stage 8: Hydraulic Storage & Arrhenius Decay Modeling
* **Module:** `storage/` (`storage_manager.py`, `shelf_life_estimator.py`, `water_decay_model.py`)
* **Methodology:** Simulates an atmospheric $1000\text{ L}$ storage tank with FIFO hydraulic queue tracking. Couples physical volume balancing with a temperature-dependent Arrhenius deterioration model:
  $$k(T) = k_{20} \cdot \theta^{(T - 20)}, \quad I(t) = 1.0 - \exp\left(-k(T) \cdot t^{1.2}\right)$$
* **Escalation:** When greywater residence time exceeds shelf-life ($> 24-48\text{ h}$) or the deterioration index $I(t) \ge 0.70$, the operational action is escalated to `REVIEW_REQUIRED` or `RECIRCULATE`.

#### Stage 9: Central Smart Routing Decision Engine
* **Module:** `routing/routing_engine.py`, `routing/inference_pipeline.py`
* **Methodology:** Synthesizes outputs from Stages 4 through 8 via a deterministic 6-tier hierarchical arbitration logic:
  1. *Tier 1 (Safety Layer):* Hardcoded physical cutoffs ($pH < 6.0$, acute *E. coli*, extreme COD) immediately override ML predictions, forcing `Sewer Bypass` + `SAFETY_OVERRIDE`.
  2. *Tier 2 (ML Inference):* Ingests XGBoost class probability distribution and prediction confidence.
  3. *Tier 3 (Anomaly Advisory):* Attaches `ANOMALY_REVIEW` if out-of-distribution without forcing bypass.
  4. *Tier 4 (Storage State):* Evaluates tank volume and biochemical deterioration index $I(t)$.
  5. *Tier 5 (Weather Preclusion):* Evaluates rainfall preclusion and converts active irrigation to storage.
  6. *Tier 6 (Action Assignment):* Emits final route, operational action, and structured reason audit codes.

#### Stage 10: Model Explainability with TreeSHAP
* **Module:** `explainability/` (`shap_explainer.py`, `local_explainer.py`, `global_explainer.py`, `decision_explainer.py`)
* **Methodology:** Utilizes the exact multiclass TreeSHAP algorithm to compute Shapley feature attributions. Generates local instance waterfall plots, identifying top positive and negative features influencing model log-odds.
* **Resilience:** Implements graceful fallback to `SHAP_UNAVAILABLE` to ensure explainability never breaks the real-time routing pipeline.

#### Stage 11: Interactive Streamlit Dashboard UI
* **Module:** `dashboard/app.py`, `dashboard/services/dashboard_service.py`
* **Methodology:** Encapsulates the entire multi-stage backend into an intuitive, 10-page Streamlit web application. Provides executive KPIs, live Digital Twin streaming, water-quality radar comparisons, single-sample evaluation, batch CSV processing, storage gauges, meteorological forecasts, anomaly scatter plots, SHAP waterfall charts, and downloadable system audit logs.
