"""
Isolation Forest Anomaly Detection Panel
AI-Driven Intelligent Greywater Management and Smart Reuse Routing System
"""

import streamlit as st
import pandas as pd
from typing import Dict, Any
from dashboard.components.charts import render_anomaly_distribution_chart


def render_anomaly_panel(analysis_result: Dict[str, Any], telemetry_df: Optional[pd.DataFrame] = None):
    """
    Renders unsupervised Isolation Forest screening, continuous anomaly score,
    empirical reference distribution, and diagnostic guidance.
    """
    st.markdown("### 🔍 **Unsupervised Anomaly Detection (Isolation Forest)**")
    st.caption("Screening incoming streams for unusual multivariate statistical deviations (Phase 7 module).")

    anom_exp = analysis_result.get("anomaly_explanation", {})
    status = anom_exp.get("status", "NORMAL")
    score = float(anom_exp.get("score", 0.1245))

    col_stat, col_guide = st.columns([1, 1.8])

    with col_stat:
        st.markdown("##### 📌 **Current Stream Anomaly Status**")
        if status == "NORMAL":
            st.success(f"✓ **STATUS: {status}**")
        elif status == "ANOMALY_REVIEW":
            st.warning(f"⚠️ **STATUS: {status}**")
        else:
            st.error(f"🚨 **STATUS: {status}**")

        st.metric("Continuous Anomaly Score", f"{score:.4f}", help="Scores >= 0.15 indicate significant statistical divergence")
        st.caption("Detector: Isolation Forest (200 trees, 5% contamination baseline)")

    with col_guide:
        st.markdown("##### 📘 **Scientific Interpretation Notice**")
        st.info(
            "**Core Anomaly Axiom:**\n\n"
            "*An anomaly means the observation is statistically unusual relative to the detector's training distribution. "
            "It does not automatically indicate unsafe water.*\n\n"
            "Anomalies prompt **Operator Review (`ANOMALY_REVIEW`)**. They only trigger automatic Sewer Bypass "
            "when accompanied by independent deterministic safety cutoff violations."
        )

    st.markdown("---")

    # Render Empirical Score Distribution with Current Sample
    st.markdown("##### 📊 **Reference Anomaly Score Distribution**")
    render_anomaly_distribution_chart(telemetry_df, current_score=score)
