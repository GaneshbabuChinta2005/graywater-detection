"""
Routing Decision Card & Pipeline Flow Component — improved readability
AI-Driven Intelligent Greywater Management and Smart Reuse Routing System
"""

import streamlit as st
from typing import Dict, Any
from dashboard.config import ROUTE_COLORS, STATUS_COLORS

# Plain-English route descriptions for general users
ROUTE_PLAIN = {
    "Sewer Bypass":           "❌ Too contaminated — sent to municipal sewer",
    "Bio-filtration":         "🌿 Moderate load — routed to biological filter",
    "Restricted Irrigation":  "💧 Safe for garden/landscape irrigation",
    "Indoor Reuse":           "🏠 High quality — approved for toilet flushing",
}

ROUTE_WHAT_MEANS = {
    "Sewer Bypass":
        "The water has exceeded safe limits for any form of reuse. It is being diverted to the "
        "municipal sewer network for centralized treatment.",
    "Bio-filtration":
        "The water contains elevated organic compounds or surfactants. It is being sent to a "
        "constructed wetland or sand filter to reduce pollutant levels before secondary reuse.",
    "Restricted Irrigation":
        "The water meets quality thresholds for subsurface landscape irrigation. "
        "It should not be used for potable purposes or direct human contact.",
    "Indoor Reuse":
        "The water has reached near-tertiary quality and is cleared for non-potable indoor "
        "uses such as toilet flushing.",
}

ACTION_PLAIN = {
    "ALLOW_ROUTE":     "✅ Water dispatched — route is clear and safe",
    "SAFETY_OVERRIDE": "🚨 Blocked by safety rules — route overridden",
    "STORE_FOR_LATER": "🕐 Held in tank — waiting for better conditions",
    "RECIRCULATE":     "🔄 Sent back for re-treatment — quality degraded",
    "DEFER_ROUTE":     "⏸️ Temporarily paused — conditions not yet met",
}

STAGE_PLAIN = {
    0: ("📡", "Sensor Data",    "Is incoming telemetry valid and aligned?"),
    1: ("🤖", "AI Model",       "What route does XGBoost predict?"),
    2: ("🔬", "Anomaly Check",  "Is the water composition unusual?"),
    3: ("🛡️", "Safety Rules",   "Do physical safety limits allow reuse?"),
    4: ("🌤️", "Weather",        "Do weather conditions permit outdoor use?"),
    5: ("🛢️", "Tank Status",    "Is stored water still fresh enough?"),
    6: ("🎯", "Final Decision", "What is the final authorized route?"),
}


def render_decision_pipeline(analysis_result: Dict[str, Any]):
    """Renders visual step-by-step pipeline with plain-English labels and arrows."""

    safety_st   = analysis_result.get("safety_explanation", {}).get("status", "NORMAL")
    anom_st     = analysis_result.get("anomaly_explanation", {}).get("status", "NORMAL")
    weather_st  = analysis_result.get("weather_explanation", {}).get("status", "NEUTRAL")
    storage_st  = analysis_result.get("storage_explanation", {}).get("status", "NORMAL")
    final_route = analysis_result.get("final_decision", {}).get("route", "Restricted Irrigation")
    override    = analysis_result.get("final_decision", {}).get("override_applied", False)

    safety_ok  = safety_st not in ["CRITICAL", "HIGH_RISK"]
    anom_ok    = anom_st != "ANOMALY"
    weather_ok = weather_st != "UNFAVORABLE"
    storage_ok = storage_st not in ["DEGRADED", "STAGNANT", "HIGH_DETERIORATION"]

    def stage_card(icon, name, question, status_text, ok: bool, is_final=False):
        bg      = "#f0fdf4" if ok else "#fff1f2"
        border  = "#22c55e" if ok else "#ef4444"
        txt_c   = "#15803d" if ok else "#dc2626"
        if is_final:
            route_c = ROUTE_COLORS.get(final_route, "#0284c7")
            bg      = f"{route_c}12"
            border  = route_c
            txt_c   = route_c
        return f"""
        <div style="
            background:{bg};
            border:2px solid {border};
            border-radius:10px;
            padding:10px 8px;
            text-align:center;
            flex:1;
            min-width:0;
        ">
            <div style="font-size:1.3rem; line-height:1;">{icon}</div>
            <div style="font-size:0.8rem; font-weight:700; color:#1e293b;
                        margin:4px 0 2px 0; line-height:1.2;">{name}</div>
            <div style="font-size:0.65rem; color:#64748b; margin-bottom:5px;
                        line-height:1.3; font-style:italic;">{question}</div>
            <div style="font-size:0.75rem; font-weight:700; color:{txt_c};">{status_text}</div>
        </div>"""

    anom_text   = f"⚠️ {anom_st}"   if not anom_ok   else "✅ Normal"
    safety_text = f"🚨 {safety_st}" if not safety_ok  else "✅ Safe"
    weather_text= "🌧️ Unfavorable"  if not weather_ok else "✅ Favorable"
    storage_text= f"⏳ {storage_st}" if not storage_ok else "✅ Fresh"
    final_text  = ROUTE_PLAIN.get(final_route, final_route)

    arrow = '<div style="color:#cbd5e1;font-size:1.3rem;padding:0 3px;align-self:center;">→</div>'

    html = '<div style="display:flex;align-items:stretch;gap:0;margin:0.5rem 0 1.2rem 0;">'
    html += stage_card("📡", "Sensor Data", "Valid telemetry?",    "✅ Aligned",    True)
    html += arrow
    html += stage_card("🤖", "AI Model",    "Route predicted?",    "✅ Predicted",  True)
    html += arrow
    html += stage_card("🔬", "Anomaly",     "Normal composition?", anom_text,       anom_ok)
    html += arrow
    html += stage_card("🛡️", "Safety",      "Limits passed?",      safety_text,     safety_ok)
    html += arrow
    html += stage_card("🌤️", "Weather",     "OK to dispatch?",     weather_text,    weather_ok)
    html += arrow
    html += stage_card("🛢️", "Tank",        "Water still fresh?",  storage_text,    storage_ok)
    html += arrow
    html += stage_card("🎯", "Decision",    "Final authorized route", final_text,    True, is_final=True)
    html += '</div>'

    st.markdown(
        "<div style='font-size:1.05rem; font-weight:700; color:#0f172a; margin-bottom:8px;'>"
        "⚡ How the Decision Was Made — Step by Step</div>",
        unsafe_allow_html=True
    )
    st.markdown(html, unsafe_allow_html=True)


def render_routing_card(analysis_result: Dict[str, Any]):
    """Renders comprehensive routing decision summary with plain-English explanations."""

    final_dec   = analysis_result.get("final_decision", {})
    model_pred  = analysis_result.get("model_prediction", {})
    safety_exp  = analysis_result.get("safety_explanation", {})
    anom_exp    = analysis_result.get("anomaly_explanation", {})
    weather_exp = analysis_result.get("weather_explanation", {})
    storage_exp = analysis_result.get("storage_explanation", {})

    final_route     = final_dec.get("route", "Restricted Irrigation")
    action          = final_dec.get("action", "ALLOW_ROUTE")
    override        = final_dec.get("override_applied", False)
    route_color     = ROUTE_COLORS.get(final_route, "#0275d8")
    confidence      = model_pred.get("confidence", 0.98) * 100
    reason_codes    = final_dec.get("reason_codes", [])

    # Draw pipeline
    render_decision_pipeline(analysis_result)

    # Override alert
    if override:
        if safety_exp.get("status") in ["CRITICAL", "HIGH_RISK"]:
            st.error(
                "🚨 **Safety Override Activated** — A critical contamination condition was detected. "
                "The AI prediction was **overruled** by mandatory safety rules, and water has been "
                "diverted to the sewer. This protects public health and the environment."
            )
        else:
            st.warning(
                f"⚠️ **Operational Override Applied** — Conditions (weather, storage age, or anomaly) "
                f"modified the routing action to: **{action}**."
            )

    # Three-column decision detail
    col_ml, col_ctx, col_final = st.columns([1, 1, 1.2])

    with col_ml:
        st.markdown(
            """<div style='font-size:0.85rem; font-weight:700; color:#1e40af;
                           margin-bottom:8px;'>🤖 What the AI Model Said</div>""",
            unsafe_allow_html=True
        )
        ml_route = model_pred.get("route", "Restricted Irrigation")
        st.markdown(
            f"""
            <div style='background:#eff6ff; border-radius:8px; padding:10px 12px;'>
                <div style='font-size:0.8rem; color:#64748b;'>Predicted route</div>
                <div style='font-size:1.1rem; font-weight:700; color:#1e40af;'>{ml_route}</div>
                <div style='font-size:0.8rem; color:#64748b; margin-top:6px;'>Confidence</div>
                <div style='font-size:1rem; font-weight:700; color:#1e40af;'>{confidence:.1f}%</div>
                <div style='font-size:0.75rem; color:#64748b; margin-top:6px;'>Model</div>
                <div style='font-size:0.8rem; color:#374151;'>XGBoost Classifier (97.78% accuracy on test data)</div>
            </div>
            """, unsafe_allow_html=True
        )
        top_feats = analysis_result.get("shap_explanation", {}).get("top_features", [])[:3]
        if top_feats:
            feat_labels = {"TSS_mg_L":"Total Suspended Solids", "E_coli_CFU_100mL":"E. coli count",
                           "BOD_mg_L":"Organic load (BOD)", "COD_mg_L":"Chemical demand (COD)",
                           "TUR_NTU":"Turbidity (cloudiness)","DO_mg_L":"Dissolved oxygen",
                           "Greywater_Source_Bathroom":"Source: Bathroom",
                           "Greywater_Source_Kitchen":"Source: Kitchen",
                           "Greywater_Source_Laundry":"Source: Laundry"}
            readable_feats = [feat_labels.get(f, f) for f in top_feats]
            st.caption(f"🔑 Key factors: {' → '.join(readable_feats)}")

    with col_ctx:
        st.markdown(
            """<div style='font-size:0.85rem; font-weight:700; color:#9a3412;
                           margin-bottom:8px;'>🛡️ Context & Safety Checks</div>""",
            unsafe_allow_html=True
        )
        checks = [
            ("🛡️ Safety cutoff", safety_exp.get("status","SAFE_FOR_MODEL_REVIEW"),
             "Hardcoded physical limits (pH, E.coli, COD)"),
            ("🔬 Anomaly screen", f"{anom_exp.get('status','NORMAL')} (score: {anom_exp.get('score',0.12):.3f})",
             "Statistical outlier check"),
            ("🌤️ Weather", weather_exp.get("status","FAVORABLE"),
             "Is outdoor dispatch safe right now?"),
            ("🛢️ Storage age", f"{storage_exp.get('status','NORMAL')} (decay: {storage_exp.get('deterioration_index',0.0):.2f})",
             "Is stored water still fresh?"),
        ]
        for icon_label, val, desc in checks:
            is_ok = any(kw in val for kw in ["NORMAL","SAFE","FAVORABLE","FRESH"])
            val_color = "#16a34a" if is_ok else "#dc2626"
            st.markdown(
                f"""
                <div style='background:#fff7ed; border-radius:7px; padding:8px 10px; margin-bottom:6px;'>
                    <div style='font-size:0.72rem; color:#64748b;'>{icon_label}</div>
                    <div style='font-size:0.88rem; font-weight:700; color:{val_color};'>{val}</div>
                    <div style='font-size:0.68rem; color:#94a3b8; font-style:italic;'>{desc}</div>
                </div>
                """, unsafe_allow_html=True
            )

    with col_final:
        st.markdown(
            """<div style='font-size:0.85rem; font-weight:700; color:#14532d;
                           margin-bottom:8px;'>🎯 Final Decision</div>""",
            unsafe_allow_html=True
        )
        action_plain = ACTION_PLAIN.get(action, action)
        route_what   = ROUTE_WHAT_MEANS.get(final_route, "")
        st.markdown(
            f"""
            <div style='
                background:{route_color}12;
                border:2px solid {route_color};
                border-radius:10px;
                padding:14px 16px;
                margin-bottom:10px;
            '>
                <div style='font-size:0.7rem; font-weight:700; text-transform:uppercase;
                            letter-spacing:0.08em; color:{route_color}; margin-bottom:4px;'>
                    AUTHORIZED ROUTE
                </div>
                <div style='font-size:1.35rem; font-weight:800; color:{route_color}; line-height:1.2;'>
                    {final_route}
                </div>
                <div style='font-size:0.8rem; color:#475569; margin-top:8px; line-height:1.4;'>
                    {route_what}
                </div>
                <hr style='border:none; border-top:1px solid {route_color}40; margin:10px 0 8px 0;'/>
                <div style='font-size:0.82rem; font-weight:600; color:#374151;'>
                    {action_plain}
                </div>
            </div>
            <div style='font-size:0.78rem; color:#64748b;'>
                {"🔴 Override was applied — safety took priority over AI prediction" if override
                 else "🟢 No override — AI prediction accepted and dispatched"}
            </div>
            """, unsafe_allow_html=True
        )

    # Reason codes with plain labels
    REASON_PLAIN = {
        "WQ_ACCEPTABLE":       "Water quality: Acceptable",
        "ANOMALY_CLEAN":       "No anomalies detected",
        "MODEL_HIGH_CONFIDENCE":"AI confidence: High",
        "ROUTE_IRRIGATION":    "Route: Irrigation",
        "ROUTE_BIOFILTRATION": "Route: Bio-filtration",
        "ROUTE_INDOOR":        "Route: Indoor reuse",
        "ROUTE_SEWER":         "Route: Sewer bypass",
        "STORAGE_NORMAL":      "Storage: Normal",
        "WEATHER_FAVORABLE":   "Weather: Favorable",
        "SAFETY_OVERRIDE_APPLIED":"Safety override applied",
        "WEATHER_DEFER":       "Weather: Deferred",
        "STORAGE_DECAY":       "Storage: Degraded",
    }
    if reason_codes:
        st.markdown(
            "<div style='font-size:0.82rem; font-weight:700; color:#374151; margin:8px 0 5px 0;'>"
            "📋 Decision Reason Codes (what triggered this outcome)</div>",
            unsafe_allow_html=True
        )
        chips_html = '<div style="display:flex;flex-wrap:wrap;gap:6px;">'
        for code in reason_codes:
            label = REASON_PLAIN.get(code, code)
            chips_html += (
                f'<span style="background:#f1f5f9;color:#475569;border:1px solid #e2e8f0;'
                f'border-radius:20px;padding:3px 10px;font-size:0.72rem;font-weight:600;'
                f'font-family:monospace;" title="{code}">{label}</span>'
            )
        chips_html += '</div>'
        st.markdown(chips_html, unsafe_allow_html=True)

    # Narrative — shown in expandable box
    narrative = analysis_result.get("human_readable_explanation", "")
    if narrative:
        with st.expander("📖 Full Decision Rationale (click to expand)", expanded=False):
            st.info(narrative)
