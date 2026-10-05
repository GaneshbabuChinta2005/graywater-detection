# Dashboard Module

## Overview
This module will provide the interactive web-based graphical user interface for the AI-Driven Greywater Management and Smart Reuse Routing System using Streamlit.

## Planned Capabilities (Future Phases)
1. **Real-Time Telemetry Monitor**:
   - Live streaming metric gauges for physicochemical parameters (pH, Turbidity, TDS, DO, COD, E. coli).
   - Time-series parameter history and sensor drift indicators.

2. **System Health & Anomaly Visualizer**:
   - Visual alerts when Isolation Forest flags incoming streams as anomalous.
   - Status indicators for sensor hardware status and data integrity.

3. **Routing Decision Center**:
   - Live visual flow diagram highlighting active routing destination (`Indoor Reuse`, `Restricted Irrigation`, `Bio-filtration`, or `Sewer Bypass`).
   - Weather context display (live temperature, precipitation forecast, soil saturation).
   - Storage tank volume, hydraulic retention time, and biochemical shelf-life counters.

4. **Explainable AI (XAI) Panel**:
   - Embedded interactive SHAP force plots and waterfall plots explaining the feature drivers behind each routing decision.

5. **Manual Override & Scenario Simulation**:
   - Allows facility operators to simulate hypothetical contamination events or manually override automated valve routing.
