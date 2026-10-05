"""
Metric Cards Component — improved readability
AI-Driven Intelligent Greywater Management and Smart Reuse Routing System
"""

import streamlit as st
from typing import Dict, Any, Optional
from dashboard.config import ROUTE_COLORS, STATUS_COLORS


# Route display names and icons for human readability
ROUTE_DISPLAY = {
    "Sewer Bypass":       ("🚫", "Diverted to sewer — too contaminated to reuse"),
    "Bio-filtration":     ("🌿", "Sent to biological filter — moderate organic load"),
    "Restricted Irrigation": ("💧", "Safe for outdoor garden/landscape irrigation"),
    "Indoor Reuse":       ("🏠", "High quality — safe for toilet flushing"),
}

ACTION_DISPLAY = {
    "ALLOW_ROUTE":    ("✅", "green", "Route approved for dispatch"),
    "SAFETY_OVERRIDE":("🚨", "red",   "Blocked by safety rules"),
    "STORE_FOR_LATER":("🕐", "blue",  "Held in tank — not dispatched yet"),
    "RECIRCULATE":    ("🔄", "orange","Recirculated for re-treatment"),
    "DEFER_ROUTE":    ("⏸️", "orange","Temporarily deferred"),
}


def _kpi_card(col, accent: str, icon: str, label: str, value: str,
              sub: str, desc: str, value_color: str = "#0f172a"):
    """Render a single KPI card with description."""
    with col:
        st.markdown(
            f"""
            <div style="
                background:#ffffff;
                border:1px solid #e2e8f0;
                border-radius:12px;
                padding:14px 14px 10px 14px;
                border-top:4px solid {accent};
                box-shadow:0 2px 8px rgba(0,0,0,0.05);
                height:100%;
                transition:transform 0.2s;
            ">
                <div style="font-size:0.7rem; color:#64748b; font-weight:700;
                            text-transform:uppercase; letter-spacing:0.06em; margin-bottom:4px;">
                    {icon}&nbsp;{label}
                </div>
                <div style="font-size:1.45rem; font-weight:800; color:{value_color};
                            line-height:1.2; margin-bottom:2px;">
                    {value}
                </div>
                <div style="font-size:0.74rem; color:#94a3b8;">{sub}</div>
                <div style="font-size:0.70rem; color:#64748b; margin-top:7px;
                            padding-top:6px; border-top:1px solid #f1f5f9;
                            font-style:italic; line-height:1.35;">
                    {desc}
                </div>
            </div>
            """,
            unsafe_allow_html=True
        )


def render_metric_cards(analysis_result: Dict[str, Any],
                        telemetry_data: Optional[Dict[str, Any]] = None):
    """
    Renders 6 executive KPI cards with plain-English descriptions.
    """
    final_dec  = analysis_result.get("final_decision", {})
    model_pred = analysis_result.get("model_prediction", {})
    anom_exp   = analysis_result.get("anomaly_explanation", {})
    safety_exp = analysis_result.get("safety_explanation", {})
    storage_exp= analysis_result.get("storage_explanation", {})

    route_name = final_dec.get("route", "Restricted Irrigation")
    action     = final_dec.get("action", "ALLOW_ROUTE")
    confidence = model_pred.get("confidence", 0.98) * 100

    # Water quality safety
    safety_st = safety_exp.get("status", "SAFE_FOR_MODEL_REVIEW")
    is_critical = safety_st in ["CRITICAL", "HIGH_RISK"]
    wq_label    = "⚠️ CRITICAL" if is_critical else "✅ NORMAL"
    wq_color    = "#dc2626" if is_critical else "#16a34a"
    wq_desc     = ("High-risk contaminants detected — safety override active."
                   if is_critical else
                   "Water parameters are within safe operational thresholds.")

    # Route display
    route_icon, route_desc = ROUTE_DISPLAY.get(route_name, ("📍", "Routing decision pending"))
    route_color = ROUTE_COLORS.get(route_name, "#0275d8")

    # Action display
    act_icon, act_color_name, act_desc = ACTION_DISPLAY.get(
        action, ("📋", "blue", "Action determined by arbitration engine"))
    action_color_map = {"green":"#16a34a","red":"#dc2626","blue":"#0284c7","orange":"#d97706"}
    act_color = action_color_map.get(act_color_name, "#0284c7")

    # Anomaly
    anom_st = anom_exp.get("status", "NORMAL")
    anom_score = anom_exp.get("score", 0.12)
    anom_color = "#dc2626" if anom_st == "ANOMALY" else "#16a34a"
    anom_label = f"⚠️ {anom_st}" if anom_st == "ANOMALY" else f"✅ {anom_st}"
    anom_desc = ("Unusual water composition detected — flagged for review."
                 if anom_st == "ANOMALY" else
                 "Water composition is statistically normal compared to training data.")

    # Tank
    tank_level  = float((telemetry_data or {}).get("tank_level_L",
                         (telemetry_data or {}).get("tank_level_liters", 500.0)))
    storage_age = float((telemetry_data or {}).get("storage_age_hours", 4.2))
    tank_pct    = (tank_level / 1000.0) * 100
    tank_bar_color = "#ef4444" if tank_pct > 90 else ("#f59e0b" if tank_pct > 75 else "#0284c7")
    storage_status = storage_exp.get("status", "NORMAL")
    storage_desc   = ("Water is fresh and safe for dispatch." if storage_status == "NORMAL"
                      else "Water has been stored too long — recirculation recommended.")

    # Confidence description
    conf_desc = ("Very high model certainty." if confidence >= 95
                 else "Good model certainty." if confidence >= 80
                 else "Lower confidence — review recommended.")

    col1, col2, col3, col4, col5, col6 = st.columns(6)

    _kpi_card(col1, wq_color, "🧪", "Water Quality",
              wq_label, f"Safety screening: {safety_st}", wq_desc, wq_color)

    _kpi_card(col2, route_color, route_icon, "Final Route",
              route_name, f"Action: {action}", route_desc, route_color)

    _kpi_card(col3, tank_bar_color, "🛢️", "Tank Level",
              f"{tank_level:.0f} L",
              f"{tank_pct:.0f}% of 1,000 L capacity",
              f"{'⚠️ Near full' if tank_pct > 85 else '✅ Normal'} — headroom {1000-tank_level:.0f} L remaining")

    _kpi_card(col4, "#6366f1", "⏱️", "Water Age",
              f"{storage_age:.1f} hrs",
              f"Storage status: {storage_status}",
              storage_desc)

    _kpi_card(col5, anom_color, "🔬", "Anomaly Check",
              anom_label, f"Outlier score: {anom_score:.3f}",
              anom_desc, anom_color)

    _kpi_card(col6, "#10b981", "🤖", "AI Confidence",
              f"{confidence:.1f}%",
              "XGBoost routing model",
              conf_desc)
