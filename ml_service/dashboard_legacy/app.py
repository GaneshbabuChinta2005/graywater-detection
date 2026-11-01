"""
Main Streamlit Application Entry Point
AI-Driven Intelligent Greywater Management and Smart Reuse Routing System

Run command:
    streamlit run dashboard/app.py
"""

import sys
import os
import streamlit as st
import pandas as pd
import numpy as np

# Ensure project root is in sys.path
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from dashboard.config import (
    APP_TITLE,
    APP_SUBTITLE,
    APP_VERSION,
    PAGE_DASHBOARD,
    PAGE_LIVE_MONITORING,
    PAGE_WATER_QUALITY,
    PAGE_SMART_ROUTING,
    PAGE_STORAGE_TANK,
    PAGE_WEATHER_CONTEXT,
    PAGE_ANOMALY_DETECTION,
    PAGE_AI_EXPLAINABILITY,
    PAGE_REPORTS,
    PAGE_SYSTEM_INFO,
    STYLES_DIR
)
from dashboard.services.dashboard_service import get_service
from dashboard.components import (
    render_sidebar,
    render_metric_cards,
    render_telemetry_charts,
    render_routing_card,
    render_water_quality_panel,
    render_tank_monitor,
    render_weather_panel,
    render_anomaly_panel,
    render_shap_panel,
    render_explanation_panel,
    render_status_panel
)

# 1. Page Configuration
st.set_page_config(
    page_title="Greywater AI Management System",
    page_icon="💧",
    layout="wide",
    initial_sidebar_state="expanded"
)

# 2. Inject CSS
css_file = os.path.join(STYLES_DIR, "dashboard.css")
if os.path.exists(css_file):
    with open(css_file, "r") as f:
        st.markdown(f"<style>{f.read()}</style>", unsafe_allow_html=True)

# 3. Initialize Service & Session State
service = get_service()

if "current_sample" not in st.session_state:
    presets = service.get_default_samples()
    st.session_state["current_sample"] = presets["Bathroom (Irrigation Quality)"]

if "current_analysis" not in st.session_state:
    st.session_state["current_analysis"] = service.run_single_analysis(st.session_state["current_sample"])

if "current_telemetry" not in st.session_state:
    st.session_state["current_telemetry"] = {
        "tank_level_L": 520.0,
        "tank_capacity_L": 1000.0,
        "flow_rate_L_min": 14.5,
        "storage_age_hours": 3.8
    }

if "sim_step" not in st.session_state:
    st.session_state["sim_step"] = 1

# 4. Render Sidebar Navigation & Global Controls
current_page = render_sidebar()

# Handle Source Selection Change
selected_source = st.session_state.get("selected_source", "Bathroom")
presets = service.get_default_samples()
preset_key = f"{selected_source} (Irrigation Quality)" if selected_source == "Bathroom" else (
    f"{selected_source} (High Organics / Sewer Bypass)" if selected_source == "Kitchen" else (
        f"{selected_source} (Surfactants / Bio-filtration)" if selected_source == "Laundry" else (
            f"{selected_source} (Composite Domestic Stream)"
        )
    )
)
if preset_key in presets and st.session_state.get("last_source") != selected_source:
    st.session_state["last_source"] = selected_source
    st.session_state["current_sample"] = presets[preset_key]
    st.session_state["current_analysis"] = service.run_single_analysis(st.session_state["current_sample"])

# Global Header
st.markdown(
    f"""
    <div class="main-header">
        <h1 style="margin-bottom:4px; font-weight:800; color:#f0f9ff;">💧 Greywater AI Management System</h1>
        <div class="main-header-subtitle">
            AI-Driven • Anomaly Detection • Safety Rules • Weather Context • Storage Kinetics • Explainable AI
        </div>
        <div style="margin-top:12px; display:flex; gap:10px; flex-wrap:wrap;">
            <span style="background:#1e40af22; border:1px solid #3b82f6; color:#93c5fd;
                         border-radius:20px; padding:3px 10px; font-size:0.75rem; font-weight:600;">
                🤖 XGBoost 97.78% accuracy
            </span>
            <span style="background:#16a34a22; border:1px solid #22c55e; color:#86efac;
                         border-radius:20px; padding:3px 10px; font-size:0.75rem; font-weight:600;">
                ✅ 132/132 tests passing
            </span>
            <span style="background:#d97706AA; border:1px solid #fbbf24; color:#fef3c7;
                         border-radius:20px; padding:3px 10px; font-size:0.75rem; font-weight:600;">
                ⚠️ Simulation Mode — Synthetic Telemetry
            </span>
        </div>
    </div>
    """,
    unsafe_allow_html=True
)

data_source_mode = st.session_state.get("data_source", "Digital Twin Simulation")
analysis = st.session_state.get("current_analysis", {})
telemetry = st.session_state.get("current_telemetry", {})
sample = st.session_state.get("current_sample", {})

# ==============================================================================
# SECONDARY MODES: SINGLE SAMPLE INPUT OR CSV BATCH INPUT
# ==============================================================================
if data_source_mode == "Single Sample Manual Input":
    st.markdown("### ✍️ **Manual Single Sample Telemetry Input**")
    st.caption("Adjust water quality metrics below and execute full Phase 1-12 analysis.")

    with st.expander("🛠️ **Configure Water Quality Readings**", expanded=True):
        col_s1, col_s2, col_s3, col_s4 = st.columns(4)
        with col_s1:
            input_source = st.selectbox("Source", ["Bathroom", "Kitchen", "Laundry", "Mixed"], index=["Bathroom", "Kitchen", "Laundry", "Mixed"].index(selected_source))
            val_ph = st.number_input("pH", min_value=4.0, max_value=11.0, value=float(sample.get("pH", 7.4)), step=0.1)
            val_temp = st.number_input("Temp (°C)", min_value=10.0, max_value=50.0, value=float(sample.get("TEMP_C", 24.5)), step=0.5)
            val_sal = st.number_input("Salinity (ppt)", min_value=0.0, max_value=2.0, value=float(sample.get("SAL_ppt", 0.22)), step=0.05)
        with col_s2:
            val_tur = st.number_input("Turbidity (NTU)", min_value=0.0, max_value=300.0, value=float(sample.get("TUR_NTU", 28.5)), step=1.0)
            val_tss = st.number_input("TSS (mg/L)", min_value=0.0, max_value=500.0, value=float(sample.get("TSS_mg_L", 34.0)), step=2.0)
            val_tds = st.number_input("TDS (mg/L)", min_value=0.0, max_value=1500.0, value=float(sample.get("TDS_mg_L", 275.0)), step=10.0)
            val_ds = st.number_input("Dissolved Solids (mg/L)", min_value=0.0, max_value=1200.0, value=float(sample.get("DS_mg_L", 255.0)), step=10.0)
        with col_s3:
            val_cond = st.number_input("Conductivity (µS/cm)", min_value=100.0, max_value=2000.0, value=float(sample.get("COND_uS_cm", 515.0)), step=10.0)
            val_do = st.number_input("DO (mg/L)", min_value=0.0, max_value=10.0, value=float(sample.get("DO_mg_L", 4.8)), step=0.1)
            val_bod = st.number_input("BOD (mg/L)", min_value=0.0, max_value=800.0, value=float(sample.get("BOD_mg_L", 28.0)), step=5.0)
            val_cod = st.number_input("COD (mg/L)", min_value=0.0, max_value=1500.0, value=float(sample.get("COD_mg_L", 82.0)), step=10.0)
        with col_s4:
            val_nh4 = st.number_input("NH4F (mg/L)", min_value=0.0, max_value=50.0, value=float(sample.get("NH4F_mg_L", 4.2)), step=0.5)
            val_no3 = st.number_input("NO3 (mg/L)", min_value=0.0, max_value=40.0, value=float(sample.get("NO3_mg_L", 4.5)), step=0.5)
            val_k = st.number_input("Potassium (mg/L)", min_value=0.0, max_value=60.0, value=float(sample.get("K_mg_L", 15.8)), step=0.5)
            val_ecoli = st.number_input("E. coli (CFU/100mL)", min_value=0.0, max_value=1500000.0, value=float(sample.get("E_coli_CFU_100mL", 1500.0)), step=1000.0)

        if st.button("🚀 Run Analysis on Custom Sample", use_container_width=True):
            custom_sample = {
                "Greywater_Source": input_source,
                "pH": val_ph, "TEMP_C": val_temp, "SAL_ppt": val_sal, "TUR_NTU": val_tur,
                "DS_mg_L": val_ds, "TDS_mg_L": val_tds, "TSS_mg_L": val_tss, "COND_uS_cm": val_cond,
                "DO_mg_L": val_do, "BOD_mg_L": val_bod, "COD_mg_L": val_cod, "NH4F_mg_L": val_nh4,
                "NO3_mg_L": val_no3, "K_mg_L": val_k, "E_coli_CFU_100mL": val_ecoli
            }
            st.session_state["current_sample"] = custom_sample
            st.session_state["current_analysis"] = service.run_single_analysis(custom_sample)
            st.success("Analysis executed successfully!")
            st.rerun()

elif data_source_mode == "CSV Batch Dataset":
    st.markdown("### 📁 **CSV Batch Telemetry Upload & Evaluation**")
    st.caption("Upload a dataset containing water quality observations to execute batch routing, safety screening, and SHAP explainability.")

    uploaded_file = st.file_uploader("Upload CSV Telemetry File", type=["csv"])
    if uploaded_file is not None:
        try:
            df_upload = pd.read_csv(uploaded_file)
            st.markdown(f"**Uploaded Samples:** `{len(df_upload)} rows`")
            st.dataframe(df_upload.head(3), use_container_width=True)

            if st.button("⚡ Run Batch Analysis", use_container_width=True):
                with st.spinner("Executing end-to-end evaluation and SHAP explanations..."):
                    df_explained = service.run_batch_analysis(df_upload)
                    st.success(f"Batch evaluation complete! Evaluated {len(df_explained)} observations.")
                    st.dataframe(df_explained.head(10), use_container_width=True)

                    csv_data = df_explained.to_csv(index=False).encode('utf-8')
                    st.download_button(
                        label="📥 Download Explained Decisions (CSV)",
                        data=csv_data,
                        file_name="routing_decisions_explained.csv",
                        mime="text/csv",
                        use_container_width=True
                    )
        except Exception as e:
            st.error(f"Error processing CSV: {e}")

# ==============================================================================
# MAIN PAGE NAVIGATION CONTROLLERS
# ==============================================================================
if current_page == PAGE_DASHBOARD:
    # 1. Top Executive Metrics
    render_metric_cards(analysis, telemetry)
    st.markdown("<br/>", unsafe_allow_html=True)

    # 2. Routing Decision Summary & Visual Precedence Pipeline
    render_routing_card(analysis)
    st.markdown("<br/>", unsafe_allow_html=True)

    # 3. Water Quality Quick Summary — color-coded with safety info
    st.markdown(
        "<div style='font-size:1.05rem; font-weight:700; color:#0f172a; margin-bottom:8px;'>"
        "🧪 Water Quality Parameters — Current Reading</div>",
        unsafe_allow_html=True
    )
    st.caption("Color coding: 🟢 Safe range   🟡 Borderline / caution zone   🔴 Exceeds safe limit")

    # Parameter definitions: (display_name, key, unit, safe_max, what_it_means)
    WQ_PARAMS = [
        ("pH",                   "pH",               "",         (6.5, 8.5),  "Acidity/alkalinity. Outside 6.5–8.5 harms reuse."),
        ("Turbidity",            "TUR_NTU",          "NTU",      (0, 50),     "Cloudiness/particles. >50 NTU = too murky."),
        ("Total Dissolved Solids","TDS_mg_L",        "mg/L",     (0, 500),    "Dissolved salts. High TDS harms plants."),
        ("Suspended Solids",     "TSS_mg_L",         "mg/L",     (0, 60),     "Floating particles. High TSS clogs filters."),
        ("Organic Load (BOD)",   "BOD_mg_L",         "mg/L",     (0, 40),     "Biological oxygen demand. High = organic pollution."),
        ("Chemical Demand (COD)","COD_mg_L",         "mg/L",     (0, 120),    "Chemical pollution level. >120 mg/L = sewer."),
        ("Dissolved Oxygen",     "DO_mg_L",          "mg/L",     (3, 10),     "Oxygen in water. <3 mg/L = anaerobic / septic."),
        ("E. coli (Bacteria)",   "E_coli_CFU_100mL", "CFU/100mL",(0, 200),    "Fecal bacteria count. >200 = health hazard."),
    ]

    q_cols = st.columns(4)
    for idx, (name, key, unit, (safe_lo, safe_hi), meaning) in enumerate(WQ_PARAMS):
        raw = sample.get(key, 0)
        val = float(raw) if raw is not None else 0.0
        display_val = f"{val:,.0f}" if val >= 100 else f"{val:.1f}"
        display_str = f"{display_val} {unit}".strip()

        # Determine safety zone
        if key == "DO_mg_L":   # DO — low is bad
            ok = val >= safe_lo
        else:
            ok = val <= safe_hi

        if not ok:
            border = "4px solid #ef4444"
            bg     = "#fff1f2"
            dot    = "🔴"
            val_c  = "#dc2626"
        elif (key != "DO_mg_L" and val > safe_hi * 0.75) or (key == "DO_mg_L" and val < safe_lo + 1):
            border = "4px solid #f59e0b"
            bg     = "#fffbeb"
            dot    = "🟡"
            val_c  = "#92400e"
        else:
            border = "4px solid #22c55e"
            bg     = "#f0fdf4"
            dot    = "🟢"
            val_c  = "#15803d"

        with q_cols[idx % 4]:
            st.markdown(
                f"""
                <div style="background:{bg}; border-left:{border}; border-radius:8px;
                            padding:10px 12px; margin-bottom:8px;
                            box-shadow:0 1px 4px rgba(0,0,0,0.04);">
                    <div style="font-size:0.7rem; color:#64748b; font-weight:700;
                                text-transform:uppercase; letter-spacing:0.05em;">
                        {dot} {name}
                    </div>
                    <div style="font-size:1.25rem; font-weight:800; color:{val_c}; margin:2px 0;">
                        {display_str}
                    </div>
                    <div style="font-size:0.68rem; color:#94a3b8;">
                        Safe: {safe_lo}–{safe_hi} {unit}
                    </div>
                    <div style="font-size:0.68rem; color:#64748b; font-style:italic; margin-top:3px;">
                        {meaning}
                    </div>
                </div>
                """, unsafe_allow_html=True
            )
    st.markdown("<br/>", unsafe_allow_html=True)

    # 4. Storage & Weather Columns
    col_st, col_wt = st.columns(2)
    with col_st:
        render_tank_monitor(analysis.get("storage_explanation", {}), telemetry)
    with col_wt:
        render_weather_panel(analysis.get("weather_explanation", {}), analysis.get("final_decision", {}).get("route"))

    st.markdown("<br/>", unsafe_allow_html=True)

    # 5. Separated Explanations
    render_explanation_panel(analysis)

elif current_page == PAGE_LIVE_MONITORING:
    st.markdown("### 📡 **Digital Twin Telemetry & Dynamic Monitoring**")
    st.caption("Continuous virtual system telemetry tracking inflow dynamics, fluid decay, and parameter time series.")
    render_metric_cards(analysis, telemetry)
    st.markdown("<br/>", unsafe_allow_html=True)
    telemetry_hist = service.get_telemetry_history()
    render_telemetry_charts(telemetry_hist, current_step=st.session_state.get("sim_step", 1))

elif current_page == PAGE_WATER_QUALITY:
    render_water_quality_panel(sample)

elif current_page == PAGE_SMART_ROUTING:
    st.markdown("### 🚦 **Smart Context-Aware Routing Engine**")
    st.caption("Multi-tier arbitration: Critical Water Safety > High-Risk Anomaly > Model Prediction > Storage Decay > Weather Context.")
    render_routing_card(analysis)
    st.markdown("---")
    render_explanation_panel(analysis)

elif current_page == PAGE_STORAGE_TANK:
    render_tank_monitor(analysis.get("storage_explanation", {}), telemetry)

elif current_page == PAGE_WEATHER_CONTEXT:
    render_weather_panel(analysis.get("weather_explanation", {}), analysis.get("final_decision", {}).get("route"))

elif current_page == PAGE_ANOMALY_DETECTION:
    telemetry_hist = service.get_telemetry_history()
    render_anomaly_panel(analysis, telemetry_hist)

elif current_page == PAGE_AI_EXPLAINABILITY:
    render_shap_panel(analysis)

elif current_page == PAGE_REPORTS:
    st.markdown("### 📄 **Project Reports & Technical Documentation**")
    st.caption("Access all validated technical reports produced across Phases 1 through 13.")
    reports = service.get_available_reports()
    
    for r in reports:
        col_t, col_btn = st.columns([3, 1])
        with col_t:
            st.markdown(f"**{r['title']}** (`{r['filename']}` • {r['size_kb']} KB)")
        with col_btn:
            if os.path.exists(r["path"]):
                with open(r["path"], "r", encoding="utf-8", errors="ignore") as f:
                    content = f.read()
                st.download_button(
                    label="📥 Download Markdown",
                    data=content,
                    file_name=r["filename"],
                    mime="text/markdown",
                    key=f"dl_{r['filename']}",
                    use_container_width=True
                )
        st.markdown("---")

elif current_page == PAGE_SYSTEM_INFO:
    render_status_panel()

# Footer
st.markdown("---")
st.markdown(
    """
    <div class="disclaimer-box">
        <strong>Academic & Regulatory Notice:</strong> This software is an engineering research decision-support prototype. 
        It integrates machine learning (XGBoost), unsupervised anomaly detection (Isolation Forest), environmental context (Open-Meteo), 
        storage tank kinetics, and game-theoretic SHAP explainability. Recommendations do not constitute clinical, biological, or statutory potable approval.
    </div>
    """, unsafe_allow_html=True
)
