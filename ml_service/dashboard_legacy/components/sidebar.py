"""
Sidebar Component
AI-Driven Intelligent Greywater Management and Smart Reuse Routing System
"""

import streamlit as st
from dashboard.config import (
    APP_TITLE,
    APP_SUBTITLE,
    APP_VERSION,
    PAGES,
    PAGE_DASHBOARD
)
from dashboard.services.dashboard_service import get_service


def render_sidebar():
    """
    Renders sidebar navigation, simulation controllers, data source selector,
    and operational state indicators.
    """
    service = get_service()

    with st.sidebar:
        st.markdown(f"## 💧 **Greywater AI**")
        st.caption(f"{APP_SUBTITLE} • v{APP_VERSION}")
        st.markdown("---")

        # Operational System Status Banner
        st.markdown(
            """
            <div style="background-color: #d4edda; border: 1px solid #c3e6cb; border-radius: 6px; padding: 6px 12px; margin-bottom: 12px; display: flex; align-items: center; justify-content: space-between;">
                <span style="color: #155724; font-weight: 700; font-size: 0.85rem;">● SYSTEM READY</span>
                <span style="color: #155724; font-size: 0.75rem; font-weight: 600;">11/11 OK</span>
            </div>
            """,
            unsafe_allow_html=True
        )

        # Simulation Mode Banner (Mandatory Labeling)
        st.markdown(
            """
            <div style="background-color: #fff3cd; border: 1px solid #ffeeba; border-radius: 6px; padding: 8px 12px; margin-bottom: 15px;">
                <span style="color: #856404; font-weight: 700; font-size: 0.85rem;">⚠️ SIMULATION MODE</span><br/>
                <span style="color: #856404; font-size: 0.75rem;">Digital Twin Synthetic Telemetry. No live physical sensors attached.</span>
            </div>
            """,
            unsafe_allow_html=True
        )

        # Top-Level Navigation
        st.markdown("### 🧭 **Navigation**")
        selected_page = st.radio(
            "Select Page",
            PAGES,
            index=PAGES.index(st.session_state.get("current_page", PAGE_DASHBOARD)),
            label_visibility="collapsed"
        )
        st.session_state["current_page"] = selected_page
        st.markdown("---")

        # Data Source Selector
        st.markdown("### 📊 **Data Source**")
        data_source = st.radio(
            "Telemetry Source Mode",
            ["Digital Twin Simulation", "Single Sample Manual Input", "CSV Batch Dataset"],
            index=0,
            label_visibility="collapsed"
        )
        st.session_state["data_source"] = data_source

        # Source Selector Preset
        sources = ["Bathroom", "Kitchen", "Laundry", "Mixed"]
        current_source = st.selectbox(
            "Greywater Source Stream",
            sources,
            index=sources.index(st.session_state.get("selected_source", "Bathroom"))
        )
        st.session_state["selected_source"] = current_source

        st.markdown("---")

        # Simulation Controls
        st.markdown("### ⚙️ **Simulation Controls**")
        col_step, col_reset = st.columns(2)
        with col_step:
            if st.button("▶ Step Next", use_container_width=True, help="Advance Digital Twin simulation by 1 step"):
                sim_res = service.run_simulation_step()
                st.session_state["current_analysis"] = sim_res["analysis"]
                st.session_state["current_telemetry"] = sim_res["telemetry"]
                st.session_state["current_sample"] = sim_res["sample"]
                st.session_state["sim_step"] = sim_res["step"]
                st.rerun()

        with col_reset:
            if st.button("↺ Reset", use_container_width=True, help="Reset simulation to initial time"):
                service.reset_simulation()
                st.session_state["sim_step"] = 0
                st.rerun()

        if st.button("🔄 Refresh Data", use_container_width=True):
            st.rerun()

        st.markdown("---")
        st.caption("AI-Driven Intelligent Greywater Management System\nFinal Academic Prototype")

    return selected_page
