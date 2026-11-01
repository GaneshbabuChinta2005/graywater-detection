"""
Water Quality Parameter Grouping & Display Component
AI-Driven Intelligent Greywater Management and Smart Reuse Routing System
"""

import streamlit as st
from typing import Dict, Any, List
from dashboard.config import STATUS_COLORS, STATUS_NORMAL, STATUS_ELEVATED, STATUS_REVIEW, STATUS_HIGH, STATUS_CRITICAL
from dashboard.services.dashboard_service import get_service


def render_water_quality_panel(sample_dict: Dict[str, Any]):
    """
    Renders structured water quality telemetry grouped into
    Physical, Chemical, and Microbiological domains.
    """
    service = get_service()
    categorized = service.get_water_quality(sample_dict)
    source_name = sample_dict.get("Greywater_Source", "Bathroom")

    st.markdown(f"### 🧪 **Water Quality Telemetry — Source: `{source_name}`**")
    st.caption("Physicochemical & microbiological telemetry screening. Statuses indicate boundary conformity, not regulatory potable approval.")

    # 1. Physical Parameters
    st.markdown("#### 🔹 **Physical Characteristics**")
    cols_phys = st.columns(len(categorized["Physical"]))
    for i, p in enumerate(categorized["Physical"]):
        status = p["status"]
        st_color = STATUS_COLORS.get(status, "#64748b")
        with cols_phys[i]:
            st.markdown(
                f"""
                <div style="background:#ffffff; border:1px solid #e2e8f0; border-radius:6px; padding:10px; border-top:3px solid {st_color};">
                    <div style="font-size:0.75rem; color:#64748b; font-weight:600;">{p['label']}</div>
                    <div style="font-size:1.25rem; font-weight:700; color:#1e293b;">{p['value']}</div>
                    <div style="font-size:0.7rem; font-weight:700; color:{st_color}; margin-top:2px;">{status}</div>
                </div>
                """, unsafe_allow_html=True
            )

    st.markdown("<br/>", unsafe_allow_html=True)

    # 2. Chemical Parameters
    st.markdown("#### 🔹 **Chemical & Organic Load**")
    chem_items = categorized["Chemical"]
    cols_chem1 = st.columns(4)
    cols_chem2 = st.columns(3)

    for i in range(4):
        p = chem_items[i]
        status = p["status"]
        st_color = STATUS_COLORS.get(status, "#64748b")
        with cols_chem1[i]:
            st.markdown(
                f"""
                <div style="background:#ffffff; border:1px solid #e2e8f0; border-radius:6px; padding:10px; border-top:3px solid {st_color};">
                    <div style="font-size:0.75rem; color:#64748b; font-weight:600;">{p['label']}</div>
                    <div style="font-size:1.25rem; font-weight:700; color:#1e293b;">{p['value']}</div>
                    <div style="font-size:0.7rem; font-weight:700; color:{st_color}; margin-top:2px;">{status}</div>
                </div>
                """, unsafe_allow_html=True
            )

    for i in range(4, len(chem_items)):
        p = chem_items[i]
        status = p["status"]
        st_color = STATUS_COLORS.get(status, "#64748b")
        with cols_chem2[i - 4]:
            st.markdown(
                f"""
                <div style="background:#ffffff; border:1px solid #e2e8f0; border-radius:6px; padding:10px; border-top:3px solid {st_color};">
                    <div style="font-size:0.75rem; color:#64748b; font-weight:600;">{p['label']}</div>
                    <div style="font-size:1.25rem; font-weight:700; color:#1e293b;">{p['value']}</div>
                    <div style="font-size:0.7rem; font-weight:700; color:{st_color}; margin-top:2px;">{status}</div>
                </div>
                """, unsafe_allow_html=True
            )

    st.markdown("<br/>", unsafe_allow_html=True)

    # 3. Microbiological Parameters
    st.markdown("#### 🔹 **Microbiological Pathogen Indicator**")
    cols_micro = st.columns([1, 2])
    with cols_micro[0]:
        for p in categorized["Microbiological"]:
            status = p["status"]
            st_color = STATUS_COLORS.get(status, "#64748b")
            st.markdown(
                f"""
                <div style="background:#ffffff; border:1px solid #e2e8f0; border-radius:6px; padding:12px; border-top:4px solid {st_color};">
                    <div style="font-size:0.8rem; color:#64748b; font-weight:700;">{p['label']}</div>
                    <div style="font-size:1.6rem; font-weight:800; color:#1e293b;">{p['value']:,} <span style="font-size:0.85rem; font-weight:500;">CFU/100mL</span></div>
                    <div style="font-size:0.8rem; font-weight:800; color:{st_color}; margin-top:4px;">{status}</div>
                </div>
                """, unsafe_allow_html=True
            )
    with cols_micro[1]:
        st.markdown(
            """
            <div style="background:#f8fafc; border:1px solid #cbd5e1; border-radius:6px; padding:12px; font-size:0.8rem; color:#475569; line-height:1.4;">
                <strong>Microbiological Screening Thresholds:</strong><br/>
                • <strong>≤ 2,000 CFU/100mL</strong>: High Clarity / Unrestricted Potential (WHO/EPA non-potable benchmark)<br/>
                • <strong>≤ 75,000 CFU/100mL</strong>: Restricted Landscape Irrigation permissible<br/>
                • <strong>&gt; 500,000 CFU/100mL</strong>: <strong>CRITICAL ACUTE PATHOGEN CUTOFF</strong> → Automatic Sewer Bypass override
            </div>
            """, unsafe_allow_html=True
        )
