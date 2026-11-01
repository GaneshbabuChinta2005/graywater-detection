"""
Storage Tank Monitor & Biochemical Decay Panel
AI-Driven Intelligent Greywater Management and Smart Reuse Routing System
"""

import streamlit as st
from typing import Dict, Any


def render_tank_monitor(storage_data: Dict[str, Any], telemetry_data: Optional[Dict[str, Any]] = None):
    """
    Renders storage tank level gauge, biochemical retention time,
    stagnation dormancy status, and deterioration indices.
    """
    st.markdown("### 🛢️ **Storage Tank Monitoring & Deterioration Kinetics**")
    st.caption("Mass-balance fluid conservation and biochemical staling tracking (Phase 10 module).")

    # Resolve values
    capacity_l = 1000.0
    current_level_l = 500.0
    if telemetry_data:
        current_level_l = float(telemetry_data.get("tank_level_L", telemetry_data.get("tank_level_liters", 500.0)))
        capacity_l = float(telemetry_data.get("tank_capacity_L", 1000.0))

    fill_pct = min(max((current_level_l / capacity_l) * 100.0, 0.0), 100.0)
    det_idx = float(storage_data.get("deterioration_index", 0.15))
    det_status = storage_data.get("status", "NORMAL")
    stag_status = storage_data.get("stagnation_status", "NORMAL")
    storage_age_hrs = float(storage_data.get("storage_age_hours", 4.5))

    col_tank_visual, col_tank_metrics = st.columns([1, 1.8])

    with col_tank_visual:
        st.markdown("##### 📊 **Physical Capacity & Level**")
        st.metric("Current Stored Volume", f"{current_level_l:.1f} L", f"{fill_pct:.1f}% Capacity")
        
        # Color progress based on level
        st.progress(fill_pct / 100.0)
        st.caption(f"Rated Tank Capacity: {capacity_l:,.0f} L • Headroom: {capacity_l - current_level_l:.1f} L")

        # Vertical Tank Representation via styled HTML
        tank_fill_color = "#38bdf8" if det_idx < 0.50 else ("#f59e0b" if det_idx < 0.75 else "#ef4444")
        st.markdown(
            f"""
            <div style="width:120px; height:180px; border:3px solid #334155; border-radius:8px 8px 16px 16px; margin:15px auto; position:relative; background:#f1f5f9; overflow:hidden;">
                <div style="position:absolute; bottom:0; width:100%; height:{fill_pct}%; background:{tank_fill_color}; transition:height 0.5s ease;"></div>
                <div style="position:absolute; width:100%; text-align:center; top:40%; font-weight:800; font-size:1.1rem; color:#0f172a; text-shadow:0 0 4px #ffffff;">
                    {fill_pct:.0f}%
                </div>
            </div>
            """, unsafe_allow_html=True
        )

    with col_tank_metrics:
        st.markdown("##### ⏳ **Biochemical Deterioration State**")
        
        m_col1, m_col2 = st.columns(2)
        with m_col1:
            st.metric("Fluid Age (Retention)", f"{storage_age_hrs:.1f} hrs")
            st.metric("Stagnation Dormancy", stag_status)
        with m_col2:
            st.metric("Deterioration Index", f"{det_idx:.2f}", delta=f"Status: {det_status}")
            st.metric("Biological Stability", "MONITOR" if det_idx > 0.40 else "STABLE")

        st.markdown("---")
        st.markdown("##### 🔬 **Shelf-Life Assessment**")
        
        # Mandatory scientific limitation disclaimer
        st.markdown(
            """
            <div style="background-color: #fff8e1; border-left: 4px solid #f57f17; padding: 10px 14px; border-radius: 4px; font-size: 0.85rem; color: #7c2d12;">
                <strong>Scientific Limitation Notice:</strong><br/>
                <em>Exact shelf-life prediction is not empirically validated.</em><br/>
                The primary dataset lacks longitudinal storage samples. Degradation estimates reflect kinetic Arrhenius proxies (BOD/COD decay and DO consumption).
            </div>
            """, unsafe_allow_html=True
        )

        if det_idx >= 0.75:
            st.error("⚠️ **HIGH BIOChemical DETERIORATION**: Anaerobic staling and DO depletion detected. Recirculation or sewer discharge recommended.")
        elif det_idx >= 0.50:
            st.warning("⚠️ **STORAGE AGING**: Water has exceeded standard residence threshold. Prioritize immediate reuse.")
        else:
            st.success("✓ **FRESH / NORMAL**: Biochemical state compliant with standard operational retention.")
