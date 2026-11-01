"""
Weather Context & Environmental Feasibility Panel
AI-Driven Intelligent Greywater Management and Smart Reuse Routing System
"""

import streamlit as st
from typing import Dict, Any


def render_weather_panel(weather_data: Dict[str, Any], final_route: str = "Restricted Irrigation"):
    """
    Renders environmental context (temperature, precipitation, humidity)
    and landscape irrigation feasibility analysis (Phase 9 module).
    """
    st.markdown("### 🌤️ **Environmental Context & Meteorological Constraints**")
    st.caption("Meteorological context informing operational dispatch feasibility without altering underlying water quality classification.")

    temp_c = float(weather_data.get("temperature_C", 22.5))
    humidity = float(weather_data.get("humidity", 65.0))
    rain_mm = float(weather_data.get("rainfall_mm", 0.0))
    precip_prob = float(weather_data.get("precipitation_probability", 0.15)) * 100
    condition = weather_data.get("weather_condition", "Partly Cloudy")
    weather_status = weather_data.get("status", "FAVORABLE")

    # Metrics Row
    col1, col2, col3, col4, col5 = st.columns(5)
    with col1:
        st.metric("Ambient Temp", f"{temp_c:.1f} °C")
    with col2:
        st.metric("Relative Humidity", f"{humidity:.0f} %")
    with col3:
        st.metric("Rainfall (Active)", f"{rain_mm:.1f} mm")
    with col4:
        st.metric("Precip Probability", f"{precip_prob:.0f} %")
    with col5:
        st.metric("Condition", condition)

    st.markdown("---")

    # Irrigation Feasibility Analysis
    st.markdown("##### 🌾 **Landscape Irrigation Feasibility**")

    is_irrigation = "Irrigation" in final_route
    w_unfavorable = weather_status == "UNFAVORABLE" or rain_mm >= 5.0 or precip_prob >= 50.0

    if is_irrigation:
        if w_unfavorable:
            st.warning(
                "🌧️ **IRRIGATION CONTEXT: UNFAVORABLE (DEFERRED)**\n\n"
                "**Operational Policy:** *Route retained, action deferred because environmental conditions are unfavorable.*\n\n"
                f"Active precipitation ({rain_mm:.1f} mm) or high forecast probability ({precip_prob:.0f}%) risks soil "
                "waterlogging and hydraulic runoff. Water remains classified as Restricted Irrigation, but physical valve "
                "dispatch is temporarily redirected to storage buffer (`STORE_FOR_LATER`)."
            )
        else:
            st.success(
                "☀️ **IRRIGATION CONTEXT: FAVORABLE**\n\n"
                "Environmental conditions (dry soil conditions, low precipitation forecast) are optimal for landscape application."
            )
    else:
        st.info(
            f"ℹ️ **CURRENT ROUTE ({final_route}) IS HYDRAULICALLY DECOUPLED**\n\n"
            "Indoor reuse and treatment bio-filtration pathways operate independent of ambient meteorological conditions."
        )

    st.caption("Context rules enforce safety precedence: Favorable weather CANNOT override contaminated water.")
