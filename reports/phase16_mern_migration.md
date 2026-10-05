# Phase 16 — Streamlit to MERN Migration Engineering Report
**AI-Driven Intelligent Greywater Management and Smart Reuse Routing System**
**Date:** October 2026  
**Status:** Completed & Verified  

---

## 1. Executive Summary & Objective

In Phase 16, the presentation and dashboard tier of the Intelligent Greywater Management System was migrated from the prototyping Streamlit environment to a high-performance, enterprise-grade **MERN stack** (React 18 + Vite, Node.js + Express, MongoDB with in-memory persistence fallback) coupled with a dedicated **Python FastAPI Microservice** (`ml_service/`).

### Critical Architectural Invariants Preserved
1. **Zero Retraining:** The optimized production XGBoost model ([`models/xgboost_optimized.pkl`](file:///c:/Users/Lenovo/OneDrive/Documents/main%20project/models/xgboost_optimized.pkl)) and Isolation Forest detector ([`models/isolation_forest.pkl`](file:///c:/Users/Lenovo/OneDrive/Documents/main%20project/models/isolation_forest.pkl)) were **NOT** retrained, modified, or converted to JavaScript.
2. **Deterministic Rules Intact:** All water-quality safety thresholds (Phase 4), deterministic override rules (Phase 7), weather contextual criteria (Phase 9), storage biochemical decay equations (Phase 10), and SHAP explainability attribution algorithms (Phase 12) remain preserved and executed exclusively in Python.
3. **Dataset Immutability:** [`dataset/main.csv`](file:///c:/Users/Lenovo/OneDrive/Documents/main%20project/dataset/main.csv) remains unaltered.
4. **Legacy Preservation:** The existing Streamlit interface is preserved in [`dashboard_legacy/`](file:///c:/Users/Lenovo/OneDrive/Documents/main%20project/dashboard_legacy/) as an audited fallback.

---

## 2. Architecture Comparison

### 2.1 Legacy Architecture (Streamlit Monolith)
```
Streamlit Web UI (dashboard/app.py)
       ↓ [Direct Python imports]
DashboardService (dashboard/services/dashboard_service.py)
       ↓
DecisionExplainer (explainability/decision_explainer.py)
       ↓
ContextAwareRoutingPipeline (routing/inference_pipeline.py)
       ↓
[XGBoost] + [Isolation Forest] + [Deterministic Safety Rules] + [Weather] + [Storage] + [TreeSHAP]
```
*Limitations:* Synchronous Python UI thread blocking during TreeSHAP calculations, lack of distributed API endpoints for industrial SCADA/IoT clients, session state re-execution on every widget interaction.

### 2.2 New Architecture (Distributed MERN + FastAPI)
```
┌────────────────────────────────────────────────────────┐
│               React + Vite Frontend (Port 5173)        │
│  - Glassmorphic Dashboard, Water Quality, Smart Routing│
│  - Storage Tank, Weather, Anomaly, SHAP Waterfall, Twin│
└───────────────────────────▲────────────────────────────┘
                            │ REST / JSON (HTTP Proxy)
┌───────────────────────────▼────────────────────────────┐
│              Node.js / Express Gateway (Port 5000)     │
│  - Security (Helmet, CORS, Rate Limiting, JWT Auth)    │
│  - Input Validation (15 Physicochemical Parameters)    │
│  - Persistence Orchestrator (MongoDB + Memory Fallback)│
│  - History, Reports, Telemetry Caching                 │
└───────────────────────────▲────────────────────────────┘
                            │ REST / JSON (Internal IPC)
┌───────────────────────────▼────────────────────────────┐
│             Python FastAPI ML Service (Port 8000)      │
│  - Singleton Model Loader (Models loaded once at start)│
│  - XGBoost Multi-Class Classifier                      │
│  - Isolation Forest Unsupervised Anomaly Detector      │
│  - Deterministic Safety Screening Engine (Phase 4)     │
│  - Modular Weather Environmental Context Engine        │
│  - Biochemical Storage Decay Model (Phase 10)          │
│  - TreeSHAP Local & Global Feature Attribution Engine  │
│  - Digital Twin Virtual Telemetry Simulator (Phase 8)  │
└────────────────────────────────────────────────────────┘
```

---

## 3. Why ML Logic Remains in Python

Machine learning and mathematical modeling were intentionally retained in Python for fundamental scientific and engineering reasons:
1. **Mathematical Fidelity:** XGBoost and TreeSHAP utilize optimized C/C++ compiled binaries (`libxgboost`, `shap.TreeExplainer`). Attempting to reimplement or port TreeSHAP tree traversal to Node.js would lose floating-point parity and introduce numerical discrepancies.
2. **Preservation of Preprocessing Logic:** The canonical feature ordering (15 physicochemical parameters + 4 one-hot encoded source indicators) is handled identically by [`routing/inference_pipeline.py`](file:///c:/Users/Lenovo/OneDrive/Documents/main%20project/routing/inference_pipeline.py).
3. **Decoupled Scalability:** Computationally intensive TreeSHAP evaluations and Digital Twin differential decay equations execute in Python worker threads without stalling the Express event loop.

---

## 4. Subsystem Responsibilities

| Subsystem | Technology | Port | Core Responsibilities |
| :--- | :--- | :--- | :--- |
| **Frontend** | React 18, Vite, Lucide Icons, Vanilla CSS Design System | 5173 | Visual presentation, interactive decision pipeline, SHAP waterfalls, real-time polling, manual analysis form, batch CSV drag-and-drop, digital twin controls. |
| **Backend Gateway** | Node.js, Express, Mongoose, JWT, Helmet | 5000 | API security, JWT role authentication (`ADMIN`, `OPERATOR`, `VIEWER`), request payload schema validation, batch CSV parsing, MongoDB database storage with in-memory resilience fallback. |
| **ML Engine** | Python 3.14, FastAPI, Uvicorn, Pydantic | 8000 | Model lifecycle management (loads `.pkl` once on startup), feature validation, XGBoost inference, Isolation Forest anomaly scoring, safety rule evaluation, weather/storage context resolution, TreeSHAP generation, and simulation stepping. |
| **Persistence** | MongoDB (Mongoose) + Memory Store Fallback | 27017 | Permanent storage of analysis history, historical telemetry, routing decisions, batch reports, and user credentials. |

---

## 5. API Endpoint Specifications

### 5.1 Python FastAPI ML Service (`http://localhost:8000`)
- `GET  /api/health` — Returns model loading status (`xgboost`, `isolation_forest`) and service state.
- `POST /api/inference/analyze` — Receives 15 physicochemical parameters + greywater source; returns unified XGBoost prediction, Isolation Forest anomaly score, safety screening, weather context, storage decay, routing action, and SHAP attributions.
- `POST /api/inference/batch` — High-throughput array analysis for CSV batch processing.
- `POST /api/simulation/start` — Initializes diurnal digital twin simulation loop.
- `POST /api/simulation/stop` — Halts simulation loop.
- `POST /api/simulation/step` — Generates next virtual telemetry step and executes inference pipeline.
- `GET  /api/simulation/current` — Returns latest synthetic telemetry snapshot.
- `GET  /api/weather/current` — Returns ambient temperature, rainfall, and irrigation recommendation.
- `GET  /api/storage/current` — Returns tank capacity, level, fill %, storage age, and usability status.
- `GET  /api/explanation/{analysis_id}` — Returns cached TreeSHAP waterfall values and decision explanation.

### 5.2 Node.js Express Gateway (`http://localhost:5000`)
- `GET  /api/health` — Probes Express gateway, MongoDB connectivity, and proxies health of FastAPI service.
- `POST /api/auth/register` & `POST /api/auth/login` — Issues JWT tokens with role-based access.
- `GET  /api/dashboard/summary` — Aggregates latest telemetry, routing decision, storage level, and 24h trends for the overview dashboard.
- `GET  /api/telemetry/latest` & `GET /api/telemetry/history` — Water quality parameter telemetry.
- `GET  /api/analysis/latest` & `GET /api/analysis/history` & `GET /api/analysis/:id` — Past inference records with full explainability.
- `POST /api/analysis` — Validates all 15 parameters, forwards to Python ML service, persists to database, returns unified decision.
- `POST /api/analysis/batch` — Accepts multipart CSV upload or JSON array, performs batch inference, saves report, returns distribution metrics.
- `GET  /api/routing/latest` — Latest smart routing decision with reason codes.
- `GET  /api/storage/latest` & `GET /api/weather/latest` — Proxies environmental and tank states.
- `GET  /api/reports` — Batch summary reports and audit logs.
- `POST /api/simulation/step` & `POST /api/simulation/start` & `POST /api/simulation/stop` — Digital Twin control interface.

---

## 6. End-to-End Data Flow

```
1. User enters water quality parameters on React Manual Analysis page (/analysis)
   or uploads a CSV file on Batch Analysis.
2. React sends HTTP POST /api/analysis to Node.js Express backend.
3. Express validate middleware validates all 15 physicochemical & biological parameters
   (pH in [0, 14], non-negative concentrations, valid Greywater_Source).
4. Express mlClient forwards payload to Python FastAPI POST /api/inference/analyze.
5. FastAPI passes payload to MLService:
   a. Canonical feature encoding via ContextAwareRoutingPipeline.
   b. XGBoost calculates class probabilities (Confidence: 0.9972).
   c. Isolation Forest computes anomaly score (-0.5 to 0.5) and binary flag.
   d. Deterministic safety rules check for exceedances (e.g., E. coli, Turbidity).
   e. Weather engine checks rainfall and temperature.
   f. Storage engine calculates biochemical retention and stagnation index.
   g. SmartRoutingEngine synthesizes inputs to generate finalRoute and reasonCodes.
   h. TreeSHAP calculates feature contributions and waterfall directions.
6. FastAPI returns complete analysis JSON to Express.
7. Express persists record to MongoDB (or memory store fallback).
8. Express returns { success: true, analysis: {...} } to React.
9. React renders:
   - Route badge (e.g., "Bio-filtration", "PROCEED_WITH_TREATMENT")
   - Interactive 6-stage Decision Pipeline visualizer
   - SHAP Waterfall Chart showing positive/negative parameter impacts
   - Safety violations and meteorological flags
```

---

## 7. Security & Resilience Architecture

1. **Defense-in-Depth Middleware:** Express applies `helmet` for secure HTTP headers, `cors` configured for `http://localhost:5173`, and `express-rate-limit` (100 req/min).
2. **Decoupled Error Isolation (`ML_SERVICE_UNAVAILABLE`):** If the Python ML microservice is stopped or restarting, Node.js catches the connection error and returns a structured 503 response. The React dashboard gracefully renders an alert without crashing.
3. **Database Graceful Fallback:** If MongoDB is offline, Node.js transparently switches to an in-memory persistence store with 50 pre-seeded telemetry and analysis records. When MongoDB is online, it persists via Mongoose schemas.
4. **Environment Isolation:** Zero secrets are committed. All secrets (`JWT_SECRET`, `MONGO_URI`, `WEATHER_API_KEY`) are managed via `.env` files.

---

## 8. Verification & Test Results

### 8.1 Python ML Microservice Tests (`tests/test_ml_service.py`)
- `test_01_health_endpoint`: **PASSED** (Models verified loaded in memory)
- `test_02_analyze_sample`: **PASSED** (Full XGBoost + Isolation Forest + SHAP pipeline verified)
- `test_03_batch_inference`: **PASSED** (Batch multi-sample inference verified)
- `test_04_simulation_endpoints`: **PASSED** (Digital Twin step and state retrieval verified)
- `test_05_weather_and_storage_endpoints`: **PASSED** (Context resolution verified)
**Result:** 5 passed in 9.42s.

### 8.2 End-to-End Integration Suite (`tests/test_end_to_end.py`)
- Step 1 (GET /api/health): **PASSED**
- Step 2 (GET /api/dashboard/summary): **PASSED**
- Step 3 (GET /api/telemetry/latest): **PASSED**
- Step 4 (GET /api/storage/latest & weather): **PASSED**
- Step 5 (POST /api/analysis with 15 parameters): **PASSED** (Final Route: `Bio-filtration`, Action: `PROCEED_WITH_TREATMENT`, Top SHAP: `TSS_mg_L`)
- Step 6 (GET /api/analysis/history): **PASSED**
- Step 7 (POST /api/simulation/step): **PASSED**
**Result:** 7/7 passed.

### 8.3 Frontend Build Verification (`client/`)
- `npm run build`: **PASSED** (Vite build completed with 0 errors).

---

## 9. Streamlit Deprecation & Legacy Status

In accordance with Phase 16 specifications, the original Streamlit application has been cloned to [`dashboard_legacy/`](file:///c:/Users/Lenovo/OneDrive/Documents/main%20project/dashboard_legacy/) and marked as **DEPRECATED**. The primary user interface of the system is now the React + Vite frontend.
