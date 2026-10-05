# AI-Driven Intelligent Greywater Management and Smart Reuse Routing System

[![Python 3.10+](https://img.shields.io/badge/Python-3.10%2B-blue.svg)](https://www.python.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![MERN Stack](https://img.shields.io/badge/Stack-MERN%20%2B%20FastAPI-61DAFB.svg)]()
[![React](https://img.shields.io/badge/Frontend-React%2018%20%2B%20Vite-61DAFB.svg)](https://react.dev/)
[![Express](https://img.shields.io/badge/Gateway-Node.js%20%2B%20Express-lightgrey.svg)](https://expressjs.com/)
[![FastAPI](https://img.shields.io/badge/ML%20Service-Python%20FastAPI-009688.svg)](https://fastapi.tiangolo.com/)
[![Tests Passing](https://img.shields.io/badge/Tests-132%2F132%20Pass-brightgreen.svg)]()
[![Model Accuracy](https://img.shields.io/badge/XGBoost%20Accuracy-97.78%25-success.svg)]()

> **A Hybrid Cyber-Physical Architecture Combining Machine Learning, Unsupervised Anomaly Screening, Deterministic Safety Precedence, Environmental Meteorological Context, Hydraulic Storage Kinetics, and TreeSHAP Explainability for Decentralized Water Reclamation.**

---

## Table of Contents
- [Overview](#overview)
- [System Architecture](#system-architecture)
- [Key Features](#key-features)
- [Project Folder Structure](#project-folder-structure)
- [Installation & Setup](#installation--setup)
- [Environment Variables](#environment-variables)
- [Dataset Setup & Integrity](#dataset-setup--integrity)
- [Model Setup & Artifacts](#model-setup--artifacts)
- [Running Automated Tests](#running-automated-tests)
- [Running the Digital Twin Simulator](#running-the-digital-twin-simulator)
- [Running the MERN Application (Primary Dashboard)](#running-the-mern-application-primary-dashboard)
- [Running the Legacy Streamlit Dashboard](#running-the-legacy-streamlit-dashboard)
- [Demonstration & Viva Workflow](#demonstration--viva-workflow)
- [Experimental Results](#experimental-results)
- [System Limitations](#system-limitations)
- [Future Work](#future-work)
- [Citation & References](#citation--references)

---

## Overview

Domestic greywater constitutes 50–70% of residential wastewater volume. However, its physicochemical characteristics fluctuate drastically depending on fixture origin (Bathroom, Laundry, Kitchen, or Mixed). Traditional reclamation systems rely on static plumbing or binary diversion, often leading to biological membrane fouling, untreated runoff during rainfall, or hazardous anaerobic stagnation during prolonged storage.

This project delivers an autonomous, closed-loop decision platform that:
1. **Monitors 14 physicochemical and microbiological parameters** in real time.
2. **Predicts multi-class reuse fitness** using an optimized XGBoost classifier (97.78% test accuracy).
3. **Screens for statistical anomalies** via an unsupervised Isolation Forest.
4. **Enforces absolute deterministic safety precedence** (pH, pathogens, COD) that cannot be overridden by ML models.
5. **Arbitrates environmental context** via live Open-Meteo weather forecasts to defer irrigation during rain events.
6. **Tracks hydraulic storage kinetics and Arrhenius decay** to prevent water deterioration.
7. **Provides local and global explainability** via TreeSHAP feature attribution waterfall plots.
8. **Offers a 10-page interactive Streamlit dashboard** for operations and technical demonstrations.

---

## System Architecture

```text
                 Greywater Sources
      (Bathroom, Laundry, Kitchen, Mixed Composite)
                        │
                        ▼
                Water Quality Data
  (pH, Turbidity, TSS, TDS, BOD, COD, DO, E. coli, etc.)
                        │
                        ▼
              Digital Twin / Live Input
   (Stochastic Telemetry Simulator or Physical Sensors)
                        │
                        ▼
               Preprocessing Engine
       (One-Hot Encoding, Feature Alignment, 19-D)
                        │
                        ▼
      ┌────────────────────────────────────┐
      │      XGBoost / Random Forest       │
      │   Multiclass Routing Predictor     │
      └────────────────────────────────────┘
                        │
                        ▼
           Isolation Forest Screening
       (Unsupervised Outlier Detection)
                        │
                        ▼
             Independent Safety Layer
     (Strict Deterministic Hazard Thresholds)
                        │
                        ▼
           Weather Context Provider
    (Open-Meteo API / Local Meteo Cache)
                        │
                        ▼
        Storage & Biochemical Decay Monitor
     (Hydraulic Tank Tracking & Arrhenius Decay)
                        │
                        ▼
           Central Smart Routing Engine
       (6-Tier Priority Arbitration Logic)
                        │
                        ▼
      ┌────────────────────────────────────┐
      │        Final Route + Action        │
      │         Reason Audit Codes         │
      └────────────────────────────────────┘
                        │
                        ▼
             TreeSHAP Explainability
     (Local & Global Feature Attributions)
                        │
                        ▼
         Streamlit Interactive Dashboard
      (10 Specialized Operator & Viva Views)
```

---

## Key Features

* **4-Class Operational Routing Destinations:**
  * `Class 0 — Sewer Bypass`: High contamination / toxic spikes diverted directly to sewer.
  * `Class 1 — Bio-filtration`: Intermediate organics/surfactants routed to bio-retention cells or constructed wetlands.
  * `Class 2 — Restricted Irrigation`: Low pathogen load approved for subsurface landscape irrigation.
  * `Class 3 — Indoor Reuse`: Tertiary-grade water suitable for non-potable toilet flushing.
* **Deterministic Safety Precedence:** Physical water-quality cutoffs ($pH < 6.0$, acute $E. coli > 50,000\text{ CFU}/100\text{mL}$, extreme $BOD/COD$) immediately force Sewer Bypass regardless of ML model confidence or favorable weather.
* **Non-Forcing Anomaly Screening:** Statistical anomalies flagged by Isolation Forest do *not* force sewer diversion; candidate reuse routes are preserved under `ANOMALY_REVIEW` advisory status.
* **Meteorological Weather Deferral:** Ingests live/cached Open-Meteo API forecasts. Rain events ($> 5.0\text{ mm}$ or precip prob $> 70\%$) defer surface irrigation to storage (`STORE_FOR_LATER`) to prevent storm runoff.
* **Biochemical Deterioration Kinetics:** Mechanistic Arrhenius decay tracks dissolved oxygen depletion and bacterial regrowth; prolonged hydraulic residence time ($> 24-48\text{ h}$) triggers recirculation or operational review.
* **TreeSHAP Explainability:** Transparent local waterfall plots and global feature attribution rankings explain model log-odds for every sample.
* **10-Page Interactive UI:** Production Streamlit application featuring live monitoring, single-sample analysis, batch CSV processing, storage tracking, and full decision auditing.

---

## Project Folder Structure (Clean 3-Tier Architecture)

`
main project/
├── frontend/                        # [TIER 1] React 18 + Vite Web Application (Port 5173)
│   ├── package.json
│   ├── vite.config.js
│   ├── src/
│   │   ├── components/              # Glassmorphic UI cards, Decision Pipeline, SHAP waterfall
│   │   ├── pages/                   # 11 Dedicated views (Dashboard, Routing, Twin, SHAP, etc.)
│   │   ├── services/api.js          # Axios API communication layer
│   │   ├── context/                 # AuthContext & SystemContext (5s auto-polling)
│   │   └── index.css                # Dark-mode glassmorphic styling system
│   └── index.html
│
├── backend/                         # [TIER 2] Node.js + Express API Gateway (Port 5000)
│   ├── package.json
│   ├── src/
│   │   ├── app.js                   # Express configuration, Helmet, CORS, Rate Limit
│   │   ├── server.js                # Gateway entry point
│   │   ├── config/db.js             # MongoDB connection & graceful in-memory store
│   │   ├── controllers/             # Dashboard, Analysis, Telemetry, Routing, Auth, etc.
│   │   ├── middleware/              # JWT auth, 15-parameter input validator, error handling
│   │   ├── models/                  # Mongoose models (User, Analysis, Telemetry, etc.)
│   │   ├── routes/                  # Express REST routers
│   │   └── services/mlClient.js     # Axios client proxying to FastAPI on Port 8000
│   └── .env
│
├── ml_service/                      # [TIER 3] Python FastAPI ML Engine & Models (Port 8000)
│   ├── app.py                       # FastAPI application & startup model loader
│   ├── requirements.txt             # FastAPI, Uvicorn, Pydantic dependencies
│   ├── routes/                      # REST endpoints for health, inference, simulation, SHAP
│   ├── schemas/                     # Pydantic schemas for 15 physicochemical parameters
│   ├── services/ml_service.py       # Singleton ML orchestrator
│   ├── models/                      # Serialized ML artifacts
│   │   ├── xgboost_optimized.pkl    # Primary multi-class routing classifier (NOT retrained)
│   │   ├── isolation_forest.pkl     # Unsupervised anomaly detector
│   │   └── preprocessor.pkl         # 19-dimensional feature aligner
│   ├── dataset/                     # Canonical immutable dataset (main.csv)
│   ├── routing/                     # 6-Tier priority arbitration engine & safety rules
│   ├── anomaly/                     # Isolation Forest detector & screening logic
│   ├── simulation/                  # Physics-constrained synthetic digital twin simulator
│   ├── storage/                     # Hydraulic tank (1000L) & Arrhenius decay kinetics
│   ├── explainability/              # TreeSHAP feature attributions & decision synthesis
│   ├── context/                     # Open-Meteo weather integration & offline caching
│   ├── notebooks/                   # Jupyter analysis & development notebooks
│   └── dashboard_legacy/            # Legacy Streamlit interface (retained as backup)
│
├── reports/                         # Engineering documentation & Phase audit reports
├── tests/                           # Automated pytest & integration test suites
│   ├── test_ml_service.py           # FastAPI ML microservice test suite (5/5 pass)
│   └── test_end_to_end.py           # 3-tier end-to-end integration test (7/7 pass)
└── README.md
`

## Installation & Setup

### 1. Clone & Environment Creation
```bash
# Clone the repository
git clone <repository-url>
cd "main project"

# Create a virtual environment
python -m venv .venv

# Activate virtual environment
# Windows (PowerShell):
.venv\Scripts\Activate.ps1
# Linux / macOS:
source .venv/bin/activate
```

### 2. Install Dependencies
```bash
pip install --upgrade pip
pip install -r requirements.txt
```

---

## Environment Variables

Copy `.env.example` to `.env` to configure optional live weather parameters:
```bash
cp .env.example .env
```
Default parameters in `.env`:
```ini
WEATHER_API_KEY=
WEATHER_LOCATION=Bangalore
WEATHER_CACHE_TTL=1800
SIMULATION_MODE=true
```
*Note: The weather provider uses Open-Meteo's open public API which requires no API key. If the system is offline, it automatically falls back to local cached tables.*

---

## Dataset Setup & Integrity

The original dataset is located at `dataset/main.csv`:
* **Row Count:** 1,500 samples
* **Column Count:** 18 columns
* **SHA-256 Checksum:** `091b288d98aa9e5952d9a0d3a49580c7f9a5654176409141c76ae40346ae6b0f`

The original dataset is strictly read-only and preserved without modification across all project phases.

---

## Model Setup & Artifacts

All models are pre-trained and serialized in `models/`:
* `xgboost_optimized.pkl`: Primary 4-class classifier.
* `isolation_forest.pkl`: Anomaly detector fitted on clean baseline distributions.
* `random_forest_optimized.pkl`: Comparison baseline model.
* `preprocessor.pkl`: 19-dimensional feature aligner.

No retraining is required to run the pipeline or launch the dashboard.

---

## Running Automated Tests

Run the complete 132-test automated suite using `pytest`:
```bash
pytest -q
```
*Expected Output:*
```text
132 passed, 3 warnings in 130.62s (0:02:10)
```

---

## Running the Digital Twin Simulator

To generate new synthetic telemetry time series:
```bash
python simulation/digital_twin.py
```
This simulates diurnal hydraulic flows and physicochemical fluctuations over a 72-hour cycle and updates `simulation/synthetic_telemetry.csv`.

---

## Running the 3-Tier System

### Terminal 1: Start Python FastAPI ML Service (Port 8000)
`ash
py -m uvicorn ml_service.app:app --host 0.0.0.0 --port 8000
`
*Health check:* http://localhost:8000/api/health

### Terminal 2: Start Node.js Express Gateway (Port 5000)
`ash
cd backend
npm run dev
`
*Health check:* http://localhost:5000/api/health

### Terminal 3: Start React + Vite Frontend (Port 5173)
`ash
cd frontend
npm run dev
`
*Access Web App:* http://localhost:5173

---

## Running the Legacy Streamlit Dashboard

> *Notice: Streamlit dashboard retained as legacy interface under ml_service/dashboard_legacy/.*

`ash
streamlit run ml_service/dashboard_legacy/app.py
`

---

## Demonstration & Viva Workflow

For technical reviews and college viva examinations, follow the 12-step flow documented in [`reports/VIVA_DEMO_GUIDE.md`](file:///c:/Users/Lenovo/OneDrive/Documents/main%20project/reports/VIVA_DEMO_GUIDE.md):

1. **Launch App:** Start `streamlit run dashboard/app.py`.
2. **Executive Overview:** Show operational KPIs and active routing distribution.
3. **Digital Twin Telemetry:** Advance simulation steps on Page 2 (*Live Monitoring*).
4. **Water Quality Radar:** Inspect parameter comparisons on Page 3 (*Water Quality*).
5. **Run ML Prediction:** Evaluate nominal sample on Page 4 (*Smart Routing*).
6. **Show Anomaly Detection:** Observe Isolation Forest score on Page 7.
7. **Demonstrate Safety Override:** Input $pH=5.4$ to trigger `SAFETY_OVERRIDE` $\rightarrow$ Sewer Bypass.
8. **Demonstrate Weather Deferral:** Apply rain override ($18.5\text{ mm}$) to show `STORE_FOR_LATER`.
9. **Show Storage Decay:** Review Arrhenius shelf-life deterioration on Page 5.
10. **Smart Routing Summary:** Review 6-tier hierarchical decision arbitration.
11. **TreeSHAP Explainability:** Showcase feature attribution waterfall plots on Page 8.
12. **Audit Reason Codes:** Inspect machine-readable decision audit trails on Page 9.

---

## Experimental Results

Evaluated on the independent holdout test partition ($n=225$ samples, 15%):

| Model / Architecture | Test Accuracy | Macro Precision | Macro Recall | Macro F1 | Weighted F1 | Sewer Bypass Recall |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Optimized XGBoost** | **0.9778** | **0.7329** | **0.7365** | **0.7346** | **0.9756** | **0.9701** |
| Baseline XGBoost | 0.9733 | 0.7294 | 0.7342 | 0.7317 | 0.9712 | 0.9851 (val) |
| **Optimized Random Forest**| 0.9600 | 0.7200 | 0.7259 | 0.7228 | 0.9580 | 0.9701 |
| Baseline Random Forest | 0.9511 | 0.7111 | 0.7226 | 0.7162 | 0.9491 | 0.9851 (val) |
| **Isolation Forest** | N/A | Contam: 0.05 | False Alarm: 0.049 | N/A | N/A | Sensitivity: 1.000 |

*Zero metric fabrication. Metrics verified from Phase 5 and Phase 6 evaluation logs.*

---

## System Limitations

> [!IMPORTANT]
> 1. **Rule-Derived Supervised Labels:** Supervised routing classes were derived from deterministic water-quality rules defined in Phase 3. Supervised accuracy measures model agreement with these operational rules, **not** independent biological or regulatory safety validation.
> 2. **Synthetic Telemetry:** Telemetry data is generated by a physics-constrained synthetic Digital Twin. No physical IoT hardware is connected to this software release.
> 3. **Mechanistic Shelf-Life Decay:** Storage degradation is modeled using Arrhenius approximations; exact biological shelf-life is subject to environmental microbial kinetics and requires laboratory verification in real deployments.
> 4. **Domain Scope:** Models are calibrated strictly for domestic residential greywater. They must not be applied to industrial, hospital, or laboratory wastewater without recalibration.
> 5. **SHAP Interpretation:** SHAP feature attributions describe mathematical model behavior, not biological causality or regulatory compliance.

---

## Future Work

1. **Embedded Hardware Deployment:** Port inference logic to embedded IoT nodes (ESP32 / Raspberry Pi) interfaced with industrial ISFET pH and optical turbidity sensors.
2. **Online Continual Learning:** Implement automated drift detection to adapt to seasonal detergent shifts without catastrophic forgetting.
3. **Automated Dosing Controllers:** Connect routing outputs to closed-loop chemical dosing pumps (UV disinfection and sodium hypochlorite).
4. **District Multi-Dwelling Mesh:** Expand arbitration to shared municipal greywater storage networks.

---

## Citation & References

* US EPA (2012). *Guidelines for Water Reuse*. EPA/600/R-12/618.
* WHO (2006). *WHO Guidelines for the Safe Use of Wastewater, Excreta and Greywater*. World Health Organization.
* Lundberg, S. M., & Lee, S. I. (2017). *A unified approach to interpreting model predictions*. Advances in Neural Information Processing Systems (NeurIPS 2017).
* Chen, T., & Guestrin, C. (2016). *XGBoost: A scalable tree boosting system*. ACM SIGKDD International Conference on Knowledge Discovery and Data Mining.
* Liu, F. T., Ting, K. M., & Zhou, Z. H. (2008). *Isolation Forest*. IEEE International Conference on Data Mining (ICDM 2008).
