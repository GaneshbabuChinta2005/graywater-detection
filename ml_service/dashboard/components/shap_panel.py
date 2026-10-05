"""
SHAP Explainability & Feature Attribution Panel
AI-Driven Intelligent Greywater Management and Smart Reuse Routing System
"""

import streamlit as st
import pandas as pd
import os
from typing import Dict, Any
from dashboard.components.charts import render_feature_importance_chart
from dashboard.config import REPORTS_DIR


def render_shap_panel(analysis_result: Dict[str, Any]):
    """
    Renders instance-level SHAP attributions, top 5 feature table,
    waterfall plot, directional attribution bar chart, and global importance rankings.
    """
    st.markdown("### 🧠 **AI Explainability & SHAP Feature Attributions**")
    st.caption("Game-theoretic Shapley Additive exPlanations for the optimized XGBoost classifier (Phase 12 module).")

    # Mandatory Scientific Disclaimer
    st.markdown(
        """
        <div style="background-color: #f1f5f9; border-left: 4px solid #475569; padding: 10px 14px; border-radius: 4px; font-size: 0.85rem; color: #334155; margin-bottom: 15px;">
            <strong>Mandatory Scientific Interpretation:</strong><br/>
            <em>SHAP explains how the trained ML model arrived at its mathematical prediction. It does not establish biological causality or independently determine regulatory water safety.</em>
        </div>
        """, unsafe_allow_html=True
    )

    model_pred = analysis_result.get("model_prediction", {})
    shap_exp = analysis_result.get("shap_explanation", {})
    pred_route = model_pred.get("route", "Restricted Irrigation")
    conf = model_pred.get("confidence", 0.98) * 100

    col_meta1, col_meta2, col_meta3 = st.columns(3)
    with col_meta1:
        st.metric("Predicted Target Class", pred_route)
    with col_meta2:
        st.metric("Model Confidence", f"{conf:.2f}%")
    with col_meta3:
        st.metric("Model Baseline (Log-Odds)", f"{shap_exp.get('base_value', 0.0):.4f}")

    st.markdown("---")

    # Top 5 SHAP Contributors Table
    st.markdown("##### 📋 **Top Contributing Features (Local Attribution)**")
    top_contribs = shap_exp.get("predicted_class_contributions", [])
    if top_contribs:
        table_rows = []
        for f in top_contribs:
            table_rows.append({
                "Rank": f.get("importance_rank", 1),
                "Feature Parameter": f.get("feature"),
                "Recorded Value": f"{f.get('value', 0.0):,.2f}",
                "SHAP Contribution (Log-Odds)": f"{f.get('shap_value', 0.0):+.4f}",
                "Influence Direction": f"Push Toward {pred_route}" if f.get("direction") == "POSITIVE" else f"Push Away from {pred_route}"
            })
        st.table(pd.DataFrame(table_rows))
    else:
        st.info("No local SHAP attributions generated for this sample.")

    st.markdown("---")

    # Local SHAP Bar Chart
    col_chart, col_wf = st.columns(2)
    with col_chart:
        st.markdown("##### 📊 **Local SHAP Attribution Bar Chart**")
        render_feature_importance_chart(top_contribs, title=f"Feature Contributions toward {pred_route}")

    with col_wf:
        st.markdown("##### 🌊 **SHAP Waterfall Attribution**")
        wf_path = os.path.join(REPORTS_DIR, "figures", "shap", "sample_1_waterfall.png")
        if os.path.exists(wf_path):
            st.image(wf_path, caption=f"Waterfall Attribution — Stepwise Impact from Baseline to Output", use_container_width=True)
        else:
            st.info("Sample waterfall figure available in reports/figures/shap/.")

    st.markdown("---")

    # Global Feature Importance Table / Chart
    st.markdown("##### 🌐 **Global Model Feature Importance (Mean |SHAP|)**")
    global_csv = os.path.join(REPORTS_DIR, "shap_global_importance.csv")
    if os.path.exists(global_csv):
        df_global = pd.read_csv(global_csv)
        st.dataframe(df_global.head(10), use_container_width=True)
    else:
        st.info("Global importance rankings available in reports/shap_global_importance.csv.")
