# Phase 13 Technical Report: Streamlit Dashboard & Complete User Interface

**Project:** AI-Driven Intelligent Greywater Management and Smart Reuse Routing System  
**Phase:** 13 — Streamlit Dashboard & Complete User Interface  
**Date:** October 2026  
**Status:** Completed & Validated (125/125 Unit Tests Passing)

---

## 1. Dashboard Objective

Phase 13 delivers an interactive, operational-grade user interface powered by **Streamlit** and **Plotly**. The dashboard serves as the central visualization and decision-support portal, synthesizing all analytical and physical modeling subsystems developed across Phases 1 through 12.

Key design mandates:
- Call existing backend modules directly without duplicating business logic.
- Prominently distinguish simulated telemetry (`"SIMULATION MODE"`) from physical sensors.
- Maintain an unambiguous firewall between predictive ML outputs, deterministic safety cutoffs, and environmental deferrals.
- Strictly adhere to academic and scientific disclaimers: dashboard recommendations are engineering decision-support advisories, **not** regulatory or statutory potable water certifications.

---

## 2. System Architecture

```
                                  STREAMLIT DASHBOARD (dashboard/app.py)
                                                │
                 ┌──────────────────────────────┼──────────────────────────────┐
                 ▼                              ▼                              ▼
        Sidebar Navigation            Executive Metrics Cards          Interactive Plotly Charts
                 │                              │                              │
                 └──────────────────────────────┼──────────────────────────────┘
                                                │
                                                ▼
                                    DASHBOARD SERVICE LAYER
                              (dashboard/services/dashboard_service.py)
                                                │
          ┌─────────────────────┬───────────────┴───────────────┬─────────────────────┐
          ▼                     ▼                               ▼                     ▼
     Digital Twin          ML Models                     Decision Engine        SHAP Explainer
   (simulation/)        (models/xgboost)                (routing/pipeline)     (explainability/)
   - Synthetic Stream   - 400 boosted trees             - Safety Screening     - TreeExplainer
   - Fluid Dynamics     - Isolation Forest (200 trees)  - Weather Context      - Local Attributions
   - Tank Mass Balance  - Feature Alignment (19)        - Storage Kinetics     - Global Rankings
```

---

## 3. Page Structure & Navigation

The user interface features a clean, responsive sidebar navigation supporting 10 dedicated functional pages:

| Page Index | Page Name | Primary Focus & Visual Components |
|:---:|:---|:---|
| **1** | **Dashboard** | Executive overview: 6 primary metric cards, prominent routing decision card, 7-stage precedence pipeline, water quality summary, storage & weather panels, separated 3-tier explanations. |
| **2** | **Live Monitoring** | Real-time virtual sensor view: 6 interactive Plotly time-series charts (Tank Volume, Inflow Rate, BOD/COD, Turbidity/TSS, pH/DO) labeled *Synthetic Digital Twin Telemetry*. |
| **3** | **Water Quality** | Parameter screening categorized into Physical (7), Chemical (7), and Microbiological (1) metrics with semantic status tags (`NORMAL`, `ELEVATED`, `REVIEW`, `HIGH`, `CRITICAL`). |
| **4** | **Smart Routing** | Complete decision transparency: Model vs Final Route, authorized dispatch action, diagnostic reason codes, and precedence pipeline audit. |
| **5** | **Storage Tank** | Physical mass-balance accounting: Vertical fluid tank gauge, fill %, retention time (hours), stagnation status, Arrhenius organic decay index, and shelf-life disclaimer. |
| **6** | **Weather Context** | Ambient meteorological monitoring: Live temperature, relative humidity, active precipitation, forward probability, and landscape irrigation feasibility analysis. |
| **7** | **Anomaly Detection** | Unsupervised statistical screening: Isolation Forest anomaly status (`NORMAL`, `ANOMALY_REVIEW`), continuous anomaly score, and empirical reference histogram with current sample marker. |
| **8** | **AI Explainability** | Game-theoretic SHAP interpretability: Top 5 feature attribution table, directional horizontal bar chart, local waterfall plot, and global mean absolute SHAP rankings. |
| **9** | **Reports** | Centralized documentation library: Direct file inspection and single-click markdown downloads for all completed technical reports across Phases 2 through 13. |
| **10** | **System Information** | Architecture diagnostics: Subsystem health checklist (13/13 operational), model artifact specifications, dataset partition metadata, and academic disclaimers. |

---

## 4. Backend Integration & Service Layer

All user interface operations route through a decoupled singleton service: [`dashboard/services/dashboard_service.py`](file:///c:/Users/Lenovo/OneDrive/Documents/main%20project/dashboard/services/dashboard_service.py).
- **Zero Business Logic in UI:** Streamlit components render data passed from `DashboardService`; no routing rules or SHAP algorithms are hardcoded into frontend scripts.
- **Resource Caching:** ML models (XGBoost, Isolation Forest) and the SHAP TreeExplainer are loaded once during initialization and retained in memory.
- **Fault-Tolerant Fallbacks:** Subsystem failures (e.g. weather API timeout or network disconnection) degrade gracefully to neutral or simulated states without terminating the Streamlit application.

---

## 5. Digital Twin Integration (Phase 8)

- **Telemetry Source:** [`simulation/data/synthetic_telemetry.csv`](file:///c:/Users/Lenovo/OneDrive/Documents/main%20project/simulation/data/synthetic_telemetry.csv) (289 discrete temporal steps simulating domestic diurnal demand cycles).
- **Stepping Engine:** `service.run_simulation_step()` advances simulation state on user command, updating storage volume, hydraulic inflow, and parameter fluctuations dynamically.
- **Labeling Standard:** All simulated telemetry is explicitly tagged: `"SIMULATION MODE — Synthetic Digital Twin Telemetry. No live physical sensors attached."`

---

## 6. Supervised ML Integration (Phase 6)

- **Primary Classifier:** Frozen optimized XGBoost model (`models/xgboost_optimized.pkl`).
- **Feature Alignment:** Automated formatting to the canonical 19-dimensional feature space (4 one-hot source indicators + 15 physico-chemical metrics).
- **Output:** Predicted class, class probabilities, and prediction confidence reported to UI widgets.

---

## 7. Anomaly Screening Integration (Phase 7)

- **Unsupervised Model:** Isolation Forest (`models/isolation_forest.pkl`).
- **Score Representation:** Continuous decision function score displayed alongside empirical background score distributions.
- **Interpretation Rule:** Prominently displays the Phase 7 core axiom: *"An anomaly indicates statistical divergence from the baseline training distribution. It does not automatically prove water toxicity or hazard."*

---

## 8. Environmental Weather Integration (Phase 9)

- **Provider:** Modular weather adapter supporting live REST polling and offline meteorological profiles.
- **Irrigation Feasibility:** 
  - Favorable: Dry weather permits landscape application.
  - Unfavorable: Rain $\ge 5\text{ mm}$ or precipitation forecast $\ge 50\%$ defers irrigation (`STORE_FOR_LATER`) while preserving the underlying water-quality route.
  - Decoupled: Indoor reuse operates independently of weather conditions.

---

## 9. Storage Tank & Biochemical Decay Integration (Phase 10)

- **Mass-Balance Accounting:** Tracks tank storage ($0 \le V \le 1,000\text{ L}$), fluid retention age, and stagnation dormancy.
- **Kinetic Degradation:** Computes the multi-factor biochemical deterioration index ($0.0 \le DI \le 1.0$) based on first-order organic decay and Dissolved Oxygen depletion.
- **Shelf-Life Disclaimer:** Mandates clear visual notice: *"Exact shelf-life prediction is not empirically validated."*

---

## 10. Smart Routing Precedence Integration (Phase 11)

- **Engine:** `SmartRoutingEngine` enforcing the strict priority hierarchy:
  1. *Priority 1:* Critical Water-Quality Safety Cutoffs
  2. *Priority 2:* High-Risk Anomaly Violations
  3. *Priority 3:* Supervised XGBoost Prediction
  4. *Priority 4:* Storage Retention & Degradation State
  5. *Priority 5:* Meteorological Context Feasibility
  6. *Priority 6:* Normal Operational Preference
- **Visual Precedence Pipeline:** Visual 7-step tracker highlighting the exact stage where decisions are ratified or overridden.

---

## 11. SHAP Explainability Integration (Phase 12)

- **Engine:** `ShapRoutingExplainer` using multiclass `shap.TreeExplainer`.
- **Directional Terminology:**
  - `POSITIVE`: Feature pushed model output **toward** predicted class.
  - `NEGATIVE`: Feature pushed model output **away from** predicted class.
- **Visuals:** Waterfall plots, local horizontal attribution bars, and global importance rankings embedded directly in the UI.

---

## 12. Manual Single-Sample Analysis Mode

Operators can toggle the sidebar to `Single Sample Manual Input` to test hypothetical water quality streams:
- Interactive numeric input widgets for all 15 water quality metrics.
- Source stream selector (`Bathroom`, `Kitchen`, `Laundry`, `Mixed`) with auto-populating baseline presets.
- Single-click analysis button executing feature alignment, ML prediction, anomaly detection, safety screening, weather arbitration, storage evaluation, and SHAP attribution.

---

## 13. CSV Batch Analysis Mode

Operators can upload arbitrary telemetry CSV datasets for batch operational analysis:
- **Strict Header Validation:** Enforces presence of required numerical water quality features; missing columns raise clean, descriptive error notifications rather than silent failures.
- **Batch Processing:** Evaluates all observations and exports results to `routing_decisions_explained.csv`.
- **Single-Click Download:** Provides an immediate browser download button for the evaluated dataset.

---

## 14. Error Handling & Robustness

The dashboard incorporates defensive error boundaries:
- **Missing Telemetry:** Defaults gracefully to canonical baseline profiles.
- **Invalid CSV Data:** Rejects non-numeric values and warns the user without crashing the application.
- **Headless Compatibility:** All Matplotlib and Plotly renderers run in non-interactive aggregation mode (`Agg`), ensuring clean performance on Windows without GUI thread conflicts.

---

## 15. Security & Secret Protection

- Zero hardcoded API keys, tokens, or credentials exist in Python code or configuration files.
- Environmental weather queries utilize open public meteorological endpoints or local simulation adapters.
- File system access is restricted strictly to the project workspace directory.

---

## 16. Verification & Automated Testing

A dedicated test suite was implemented in [`tests/test_dashboard_service.py`](file:///c:/Users/Lenovo/OneDrive/Documents/main%20project/tests/test_dashboard_service.py):

| Test ID | Verification Area | Result |
|:---:|:---|:---:|
| `test_dashboard_service_import` | Service singleton access and import integrity | **PASSED** |
| `test_model_loading` | Initialization of XGBoost, Isolation Forest, SHAP, and Routing | **PASSED** |
| `test_single_sample_analysis` | Execution of end-to-end single sample analysis | **PASSED** |
| `test_csv_validation` | Validation of valid batch CSV execution | **PASSED** |
| `test_missing_column_handling` | Rejection of incomplete CSV schemas with descriptive errors | **PASSED** |
| `test_invalid_numeric_input` | Rejection of corrupt non-numeric values | **PASSED** |
| `test_routing_output` | Compliance with Phase 11 decision schema | **PASSED** |
| `test_shap_output` | Compliance with Phase 12 SHAP attribution schema | **PASSED** |
| `test_weather_unavailable_state` | Fault-tolerant handling when weather data is unavailable | **PASSED** |
| `test_storage_unavailable_state` | Fault-tolerant handling when storage context is omitted | **PASSED** |
| `test_simulation_step` | Advancement of Digital Twin synthetic telemetry | **PASSED** |
| `test_no_modification_to_main_csv` | Invariance check: `dataset/main.csv` strictly unchanged | **PASSED** |

**Total Test Suite Status:** **125 passed, 0 failed** across all 13 phases.

---

## 17. How to Launch the Application

From the project root directory, run:

```powershell
& "C:\Users\Lenovo\AppData\Local\Python\pythoncore-3.14-64\python.exe" -m streamlit run dashboard/app.py
```

The application will start on `http://localhost:8501`.

---

## 18. Mandatory Academic & Scientific Disclaimers

> **SCIENTIFIC & REGULATORY NOTICE:**
> 1. **Decision-Support Prototype:** This system is an engineering research prototype designed for operational decision support. Output classifications and recommendations do **not** constitute clinical, biological, or statutory potable reuse certification.
> 2. **Synthetic Telemetry:** Telemetry displayed in simulation mode originates from the Phase 8 Digital Twin mathematical model; no physical sensors are currently connected.
> 3. **Mathematical Attribution vs Causality:** SHAP values represent statistical feature attributions within XGBoost decision trees and should not be construed as physical or biological causal mechanisms.
> 4. **Shelf-Life Kinetics:** Storage tank decay estimates reflect first-order organic Arrhenius models and DO consumption proxies rather than empirically validated longitudinal greywater aging trials.
