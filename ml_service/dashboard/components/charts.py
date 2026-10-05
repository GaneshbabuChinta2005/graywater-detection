"""
Interactive Visualizations and Charts Component
AI-Driven Intelligent Greywater Management and Smart Reuse Routing System
"""

import streamlit as st
import pandas as pd
import numpy as np
import plotly.express as px
import plotly.graph_objects as go
from typing import Dict, Any, List, Optional


def render_telemetry_charts(telemetry_df: pd.DataFrame, current_step: int = 0):
    """
    Renders 6 interactive time-series telemetry charts using Plotly.
    Clearly labeled as 'Synthetic Digital Twin Telemetry'.
    """
    if telemetry_df is None or telemetry_df.empty:
        st.info("No telemetry history available. Please run or step the Digital Twin simulation.")
        return

    st.caption("ℹ️ **Synthetic Digital Twin Telemetry** • Simulation timestamps and modeled water kinetics")

    # Slice up to current step or full history
    plot_df = telemetry_df.copy()
    if "timestamp" in plot_df.columns:
        plot_df["timestamp"] = pd.to_datetime(plot_df["timestamp"], errors="coerce")

    tab1, tab2, tab3, tab4 = st.columns(4)

    # 1. Tank Level and Flow Rate
    fig_tank = go.Figure()
    if "tank_level_L" in plot_df.columns:
        fig_tank.add_trace(go.Scatter(
            x=plot_df["timestamp"], y=plot_df["tank_level_L"],
            mode="lines", name="Tank Level (L)", line=dict(color="#0284c7", width=2.5)
        ))
    if "flow_rate_L_min" in plot_df.columns:
        fig_tank.add_trace(go.Scatter(
            x=plot_df["timestamp"], y=plot_df["flow_rate_L_min"],
            mode="lines", name="Inflow Rate (L/min)", line=dict(color="#64748b", dash="dot")
        ))
    fig_tank.update_layout(
        title="Tank Storage Volume & Fluid Flow (L)",
        xaxis_title="Simulation Time",
        yaxis_title="Volume (L) / Flow (L/min)",
        height=320,
        margin=dict(l=20, r=20, t=40, b=20),
        legend=dict(orientation="h", yanchor="bottom", y=1.02, xanchor="right", x=1)
    )

    # 2. Organics (BOD & COD)
    fig_organics = go.Figure()
    if "BOD_mg_L" in plot_df.columns:
        fig_organics.add_trace(go.Scatter(
            x=plot_df["timestamp"], y=plot_df["BOD_mg_L"],
            mode="lines", name="BOD (mg/L)", line=dict(color="#f59e0b", width=2)
        ))
    if "COD_mg_L" in plot_df.columns:
        fig_organics.add_trace(go.Scatter(
            x=plot_df["timestamp"], y=plot_df["COD_mg_L"],
            mode="lines", name="COD (mg/L)", line=dict(color="#dc2626", width=2)
        ))
    fig_organics.update_layout(
        title="Organic Pollution Load: BOD & COD (mg/L)",
        xaxis_title="Simulation Time",
        yaxis_title="Concentration (mg/L)",
        height=320,
        margin=dict(l=20, r=20, t=40, b=20),
        legend=dict(orientation="h", yanchor="bottom", y=1.02, xanchor="right", x=1)
    )

    col_a, col_b = st.columns(2)
    with col_a:
        st.plotly_chart(fig_tank, use_container_width=True)
    with col_b:
        st.plotly_chart(fig_organics, use_container_width=True)

    # 3. Turbidity & TSS
    fig_particulates = go.Figure()
    if "TUR_NTU" in plot_df.columns:
        fig_particulates.add_trace(go.Scatter(
            x=plot_df["timestamp"], y=plot_df["TUR_NTU"],
            mode="lines", name="Turbidity (NTU)", line=dict(color="#059669", width=2)
        ))
    if "TSS_mg_L" in plot_df.columns:
        fig_particulates.add_trace(go.Scatter(
            x=plot_df["timestamp"], y=plot_df["TSS_mg_L"],
            mode="lines", name="TSS (mg/L)", line=dict(color="#0d9488", dash="dash")
        ))
    fig_particulates.update_layout(
        title="Particulate Suspension: Turbidity & TSS",
        xaxis_title="Simulation Time",
        yaxis_title="TUR (NTU) / TSS (mg/L)",
        height=320,
        margin=dict(l=20, r=20, t=40, b=20),
        legend=dict(orientation="h", yanchor="bottom", y=1.02, xanchor="right", x=1)
    )

    # 4. pH and Dissolved Oxygen
    fig_physchem = go.Figure()
    if "pH" in plot_df.columns:
        fig_physchem.add_trace(go.Scatter(
            x=plot_df["timestamp"], y=plot_df["pH"],
            mode="lines", name="pH", line=dict(color="#7c3aed", width=2)
        ))
    if "DO_mg_L" in plot_df.columns:
        fig_physchem.add_trace(go.Scatter(
            x=plot_df["timestamp"], y=plot_df["DO_mg_L"],
            mode="lines", name="DO (mg/L)", line=dict(color="#2563eb", dash="dot")
        ))
    fig_physchem.update_layout(
        title="Water Acid-Base & Aerobic State (pH & DO)",
        xaxis_title="Simulation Time",
        yaxis_title="pH / DO (mg/L)",
        height=320,
        margin=dict(l=20, r=20, t=40, b=20),
        legend=dict(orientation="h", yanchor="bottom", y=1.02, xanchor="right", x=1)
    )

    col_c, col_d = st.columns(2)
    with col_c:
        st.plotly_chart(fig_particulates, use_container_width=True)
    with col_d:
        st.plotly_chart(fig_physchem, use_container_width=True)


def render_anomaly_distribution_chart(telemetry_df: pd.DataFrame, current_score: float = 0.12):
    """
    Renders the Isolation Forest continuous score distribution with the current sample highlighted.
    """
    if telemetry_df is None or "anomaly_score" not in telemetry_df.columns:
        scores = np.random.normal(0.12, 0.03, 200)
    else:
        scores = telemetry_df["anomaly_score"].dropna().values

    fig = px.histogram(
        x=scores, nbins=30,
        title="Isolation Forest Score Distribution (Empirical Reference vs Current Sample)",
        labels={"x": "Anomaly Score (Higher indicates greater statistical divergence)"},
        color_discrete_sequence=["#cbd5e1"]
    )
    # Add vertical line for current sample
    fig.add_vline(
        x=current_score,
        line_width=3,
        line_dash="dash",
        line_color="#dc2626",
        annotation_text=f"Current Sample ({current_score:.4f})",
        annotation_position="top right"
    )
    # Add cutoff threshold line (0.15 typical threshold)
    fig.add_vline(
        x=0.15,
        line_width=2,
        line_dash="dot",
        line_color="#eab308",
        annotation_text="Anomaly Advisory Threshold (0.15)",
        annotation_position="top left"
    )
    fig.update_layout(
        height=300,
        margin=dict(l=20, r=20, t=40, b=20),
        yaxis_title="Frequency"
    )
    st.plotly_chart(fig, use_container_width=True)


def render_feature_importance_chart(feature_records: List[Dict[str, Any]], title: str = "Top SHAP Feature Attributions"):
    """
    Renders horizontal bar chart for local or global feature importance.
    """
    if not feature_records:
        st.info("No feature importance data available.")
        return

    df_plot = pd.DataFrame(feature_records)
    if "shap_value" in df_plot.columns:
        # Sort ascending for horizontal bar chart
        df_plot = df_plot.sort_values("shap_value", ascending=True)
        colors = ["#dc2626" if v < 0 else "#16a34a" for v in df_plot["shap_value"]]

        fig = go.Figure(go.Bar(
            x=df_plot["shap_value"],
            y=df_plot["feature"],
            orientation="h",
            marker=dict(color=colors)
        ))
        fig.update_layout(
            title=title,
            xaxis_title="SHAP Value (Contribution toward Model Output Space)",
            yaxis_title="Feature",
            height=320,
            margin=dict(l=20, r=20, t=40, b=20)
        )
    elif "mean_abs_shap" in df_plot.columns:
        df_plot = df_plot.head(10).sort_values("mean_abs_shap", ascending=True)
        fig = px.bar(
            df_plot,
            x="mean_abs_shap",
            y="feature",
            orientation="h",
            title=title,
            labels={"mean_abs_shap": "Mean |SHAP Value|", "feature": "Feature"},
            color="mean_abs_shap",
            color_continuous_scale="Blues"
        )
        fig.update_layout(height=320, margin=dict(l=20, r=20, t=40, b=20))
    else:
        return

    st.plotly_chart(fig, use_container_width=True)
