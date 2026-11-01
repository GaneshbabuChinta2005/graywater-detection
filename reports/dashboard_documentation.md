# Streamlit User Interface & Dashboard Documentation
## AI-Driven Intelligent Greywater Management and Smart Reuse Routing System

---

### 1. Dashboard Architecture & User Experience

The interactive user interface is built on **Streamlit** (`dashboard/app.py`), backed by a centralized singleton service layer (`dashboard/services/dashboard_service.py`) and custom CSS stylesheets (`dashboard/styles/custom.css`). The application connects all 14 engineering phases into a cohesive, production-grade cyber-physical control panel.

* **Launch Command:** `streamlit run dashboard/app.py`
* **Default Port:** `http://localhost:8501`
* **Theme:** Curated slate dark/light theme, modern typography (Inter), glassmorphism metric containers, and interactive Plotly visual charts.

---

### 2. Comprehensive Page-by-Page Documentation

The dashboard is structured into 10 dedicated operational pages accessible via the primary sidebar navigation:

#### Page 1: Executive Dashboard (`dashboard/components/page_dashboard.py`)
* **Purpose:** High-level operational command center for facility operators and plant managers.
* **Key Components:**
  * System Mode Status Badge: Confirms operational state (`Simulation / Digital Twin`).
  * 4 Primary KPI Metric Cards: Current Routing Destination, 24h Reclaimed Volume, Storage Tank Level, and Active Alert Count.
  * Operational Flow Gauge: Live hydraulic inflow versus outflow meter ($L/\min$).
  * Recent Decision Log: Real-time table of recent water parcel dispatches with timestamps and reason codes.

#### Page 2: Live Monitoring (`dashboard/components/page_live_monitoring.py`)
* **Purpose:** Real-time streaming visualization of the synthetic Digital Twin simulator.
* **Key Components:**
  * Time-Series Streaming Charts: Multiline Plotly chart tracking $pH$, Turbidity, and DO over simulated diurnal cycles.
  * Diurnal Cycle Indicator: Displays current simulated cycle (Morning Bathroom Peak, Midday Laundry, Evening Kitchen Load).
  * Interactive Simulation Stepper: Click **"Advance Simulation (+15 min)"** to generate new synthetic telemetry packets and watch charts update dynamically.

#### Page 3: Water Quality Analysis (`dashboard/components/page_water_quality.py`)
* **Purpose:** Detailed laboratory-grade physicochemical and biological parameter inspection.
* **Key Components:**
  * Source Quality Comparison Radar: Polar radar chart contrasting contaminant profiles across Bathroom, Laundry, Kitchen, and Mixed streams.
  * Parameter Distribution Violins: Interactive box/violin plots displaying parameter ranges ($BOD$, $COD$, $TSS$, $E. coli$).
  * Threshold Hazard Indicators: Visual color-coded warning chips for parameters exceeding EPA/WHO standards.

#### Page 4: Smart Routing Engine (`dashboard/components/page_smart_routing.py`)
* **Purpose:** Central evaluation workspace supporting single-sample evaluation, scenario presets, and batch CSV processing.
* **Input Modes:**
  1. *Preset Selection:* Instantly loads calibrated reference presets (e.g., "Bathroom (Irrigation Quality)", "Kitchen (High Organics)").
  2. *Manual Numeric Sliders:* Real-time interactive adjustment of all 15 water-quality parameters.
  3. *Batch CSV Upload:* Upload arbitrary multi-row CSV files for automated bulk pipeline processing.
* **Decision Cards Emitted:**
  * Initial ML Prediction Card (XGBoost route and confidence percentage).
  * Anomaly Screening Card (Isolation Forest score and normal/outlier flag).
  * Safety Layer Card (Deterministic safety compliance status and hazard codes).
  * Environmental Weather Card (Live/cached weather conditions and rain deferral flags).
  * Final Smart Routing Card (Arbitrated final route, operational action instruction, and audit reason codes).

#### Page 5: Storage Tank & Shelf-Life (`dashboard/components/page_storage.py`)
* **Purpose:** Physical storage vessel balancing and biochemical deterioration monitoring.
* **Key Components:**
  * Cylindrical Tank Fill Gauge: Interactive visual tank container illustrating fill percentage ($0 - 1000\text{ L}$).
  * Residence Time & Aging Meter: Elapsed storage age in hours.
  * Arrhenius Deterioration Curve: Visual kinetic trajectory of deterioration index $I(t)$ over time.
  * Action Trigger: Displays automatic aeration or recirculation alerts when $I(t) \ge 0.70$.

#### Page 6: Weather & Environmental Context (`dashboard/components/page_weather.py`)
* **Purpose:** Real-time meteorological surveillance and outdoor irrigation advisories.
* **Key Components:**
  * Live Forecast Card: Ingests current temperature, precipitation rate, and rain probability from Open-Meteo REST API.
  * 24-Hour Precipitation Timeline: Hourly rain forecast chart.
  * Irrigation Advisory Banner: Color-coded operational banner (`PERMITTED`, `ADVISORY DEFERRAL`, `SUSPENDED`).
  * Manual Weather Override: Allows operators to simulate storm events ($18.5\text{ mm}$ rain) to test deferral logic.

#### Page 7: Anomaly Detection (`dashboard/components/page_anomaly.py`)
* **Purpose:** Unsupervised machine learning diagnostics and outlier visualization.
* **Key Components:**
  * 2D PCA / t-SNE Embedding Scatter: Projects 19-dimensional feature vectors into 2D space, coloring normal points in teal and anomalies in crimson.
  * Anomaly Score Distribution: Histogram showing score separation across nominal training data versus injected chemical shocks.
  * Outlier Diagnostic Breakdown: Identifies the specific parameters that deviated farthest from the training manifold.

#### Page 8: AI Explainability (TreeSHAP) (`dashboard/components/page_explainability.py`)
* **Purpose:** Transparent mathematical auditability of XGBoost model predictions.
* **Key Components:**
  * Interactive SHAP Waterfall Plot: Explains the exact sample evaluated on Page 4, showing how each parameter pushed log-odds toward or away from the predicted class.
  * Top Contributor Tables: Ranked lists of top positive and negative features with numerical Shapley attributions.
  * Global Feature Importance Summary: Bar chart of mean absolute SHAP values across all 19 features.

#### Page 9: Reports & Export (`dashboard/components/page_reports.py`)
* **Purpose:** Compliance reporting, engineering documentation download, and dataset export.
* **Key Components:**
  * Verification Logs: In-browser viewing of test execution audits and model evaluation summaries.
  * Batch Results Download: One-click export of batch analysis results to `reports/example_batch_results.csv`.
  * Technical Report Access: Direct links to architectural specifications and scenario documentation.

#### Page 10: System Information & Health (`dashboard/components/page_system_info.py`)
* **Purpose:** Diagnostic health check and software configuration audit.
* **Key Components:**
  * Model Checksums & Paths: Validates presence and SHA-256 hashes of all `.pkl` artifacts.
  * Runtime Environment: Displays Python version, operating system, and installed library versions.
  * Architecture Topology Diagram: Full mermaid rendering of the 14-phase cyber-physical pipeline.

---

### 3. Operational Input Modes & Batch Evaluation

1. **Simulation Mode:** Automatically driven by the Digital Twin; streams continuous synthetic telemetry without manual intervention.
2. **Interactive Manual Mode:** Allows operators, judges, or researchers to modify individual parameters via precision numerical sliders to test edge cases.
3. **Batch Analysis Mode:** Allows operators to upload a CSV file containing hundreds of water samples. The engine processes rows sequentially, executing ML inference, safety checks, anomaly detection, weather context, and SHAP attributions, returning a downloadable annotated CSV.

---

### 4. Robust Error Handling & Fault Display

* **Missing / Malformed Columns:** Displays structured Streamlit error boxes detailing exactly which required columns are missing from uploaded CSVs.
* **Network / API Timeouts:** Displays a gentle yellow warning banner stating that weather data is temporarily unavailable and that safe offline defaults are active; **the UI never crashes or displays unhandled Python tracebacks.**
* **SHAP Fallback:** If TreeSHAP encounters an unsupported tensor shape, the explanation tab displays `"SHAP Feature Attribution Unavailable"` while preserving the central routing cards.
