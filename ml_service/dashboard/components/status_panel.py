"""
System Information and Status Panel Component
AI-Driven Intelligent Greywater Management and Smart Reuse Routing System
"""

import streamlit as st
import os
from dashboard.config import APP_TITLE, APP_SUBTITLE, APP_VERSION
from dashboard.services.dashboard_service import get_service


def render_status_panel():
    """
    Renders comprehensive system health audit, component statuses,
    model artifact paths, dataset statistics, and academic limitations.
    """
    service = get_service()
    sys_status = service.get_system_status()

    st.markdown(f"### ℹ️ **System Information & Architecture Status**")
    st.caption(f"{APP_TITLE} • {APP_SUBTITLE} • Version: {APP_VERSION}")

    # Operational Badge
    if sys_status["system_ready"]:
        st.success("✓ **ALL SUBSYSTEMS OPERATIONAL & VALIDATED** (Phases 1 through 13 Completed)")
    else:
        st.warning("⚠️ Some modules are initializing or running under fallback.")

    # 1. Modules Status Table
    st.markdown("#### 📦 **Architecture Subsystems**")
    cols = st.columns(3)
    modules = sys_status["modules"]
    for i, mod in enumerate(modules):
        col_idx = i % 3
        with cols[col_idx]:
            icon = "✓" if mod["status"] in ["OPERATIONAL", "ACTIVE"] else "⚠️"
            st.markdown(
                f"""
                <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:6px; padding:8px 12px; margin-bottom:8px;">
                    <span style="color:#16a34a; font-weight:800;">{icon}</span> 
                    <strong style="color:#0f172a; font-size:0.85rem;">{mod['name']}</strong>
                    <div style="font-size:0.75rem; color:#64748b; margin-left:18px;">Status: {mod['status']}</div>
                </div>
                """, unsafe_allow_html=True
            )

    st.markdown("---")

    # 2. Model Artifacts Information
    st.markdown("#### 🤖 **Trained Model Artifacts**")
    m_info = sys_status["models"]
    m_col1, m_col2, m_col3 = st.columns(3)
    with m_col1:
        st.markdown(f"**Primary Classifier:** `XGBoost`")
        st.markdown(f"**Artifact Path:** `{os.path.basename(m_info['xgboost_path'])}`")
        st.markdown(f"**Status:** `{'Present & Frozen' if m_info['xgboost_exists'] else 'Missing'}`")
        st.caption("Config: 400 trees, depth 4, multiclass softprob")
    with m_col2:
        st.markdown(f"**Baseline Classifier:** `Random Forest`")
        st.markdown(f"**Artifact Path:** `{os.path.basename(m_info['rf_path'])}`")
        st.markdown(f"**Status:** `{'Present & Frozen' if m_info['rf_exists'] else 'Missing'}`")
        st.caption("Config: 200 trees, max depth 10")
    with m_col3:
        st.markdown(f"**Anomaly Detector:** `Isolation Forest`")
        st.markdown(f"**Artifact Path:** `{os.path.basename(m_info['iso_path'])}`")
        st.markdown(f"**Status:** `{'Present & Frozen' if m_info['iso_exists'] else 'Missing'}`")
        st.caption("Config: 200 trees, 5% contamination baseline")

    st.markdown("---")

    # 3. Dataset Information
    st.markdown("#### 📊 **Dataset Specification**")
    d_info = sys_status["dataset"]
    d_col1, d_col2, d_col3, d_col4 = st.columns(4)
    with d_col1:
        st.metric("Total Raw Samples", "1,500")
        st.caption("File: dataset/main.csv (Untouched)")
    with d_col2:
        st.metric("Training Partition", f"{d_info['train_samples']} samples", "70% Split")
        st.caption("File: train.csv")
    with d_col3:
        st.metric("Validation Partition", f"{d_info['validation_samples']} samples", "15% Split")
        st.caption("File: validation.csv")
    with d_col4:
        st.metric("Test Partition", f"{d_info['test_samples']} samples", "15% Split")
        st.caption("File: test.csv")

    st.markdown("---")

    # 4. Mandatory Academic & Scientific Disclaimers
    st.markdown("#### ⚖️ **Mandatory Scientific & Regulatory Limitations**")
    st.markdown(
        """
        1. **Decision Support Only:** This software is an engineering decision-support tool. It does **not** grant regulatory authorization or certified potable reuse guarantees.
        2. **Synthetic Telemetry Labeling:** In simulation mode, real-time sensor streams reflect the Phase 8 Digital Twin mathematical generator; no physical telemetry sensors are currently attached.
        3. **Explainability Attribution:** SHAP feature attributions reflect mathematical credit allocation in XGBoost decision trees and do not establish biological causation.
        4. **Shelf-Life Kinetics:** Storage tank decay calculations are based on first-order Arrhenius organic kinetics and DO depletion proxies; empirical microbiological decay validation remains future work.
        """
    )
