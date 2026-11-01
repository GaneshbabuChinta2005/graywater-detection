"""
Separated Explanations Panel
AI-Driven Intelligent Greywater Management and Smart Reuse Routing System
"""

import streamlit as st
from typing import Dict, Any


def render_explanation_panel(analysis_result: Dict[str, Any]):
    """
    Renders 3 strictly separated explanations:
    1. MODEL EXPLANATION (Why XGBoost made its prediction via SHAP)
    2. DECISION EXPLANATION (Why weather, storage, or operational rules determined dispatch)
    3. SAFETY EXPLANATION (Why critical public health cutoffs triggered overrides)
    """
    st.markdown("### 🗣️ **Decision Transparency & Explanation Separation**")
    st.caption("Strict separation between mathematical machine learning explanations and deterministic regulatory/environmental policies.")

    final_dec = analysis_result.get("final_decision", {})
    model_pred = analysis_result.get("model_prediction", {})
    safety_exp = analysis_result.get("safety_explanation", {})
    weather_exp = analysis_result.get("weather_explanation", {})
    storage_exp = analysis_result.get("storage_explanation", {})
    shap_exp = analysis_result.get("shap_explanation", {})

    top_names = shap_exp.get("top_features", [])[:4]
    top_str = ", ".join(top_names) if top_names else "water quality parameters"

    col_model, col_decision, col_safety = st.columns(3)

    # 1. MODEL EXPLANATION
    with col_model:
        st.markdown(
            f"""
            <div style="background:#ffffff; border:1px solid #cbd5e1; border-top:4px solid #3b82f6; border-radius:8px; padding:15px; min-height:220px;">
                <div style="font-weight:700; color:#1e40af; font-size:0.95rem; margin-bottom:6px;">1. MODEL EXPLANATION (SHAP)</div>
                <div style="font-size:0.85rem; color:#334155; line-height:1.4;">
                    XGBoost predicted <strong>{model_pred.get('route')}</strong> with 
                    <strong>{model_pred.get('confidence', 0.95)*100:.1f}%</strong> confidence.
                    <br/><br/>
                    SHAP indicates the primary mathematical contributors pushing model output space were 
                    <strong>{top_str}</strong>.
                </div>
                <div style="margin-top:12px; font-size:0.75rem; color:#64748b;">
                    <em>Explains internal mathematical loss, NOT causality or water safety.</em>
                </div>
            </div>
            """, unsafe_allow_html=True
        )

    # 2. DECISION EXPLANATION
    with col_decision:
        action_val = final_dec.get("action", "ALLOW_ROUTE")
        weather_st = weather_exp.get("status", "FAVORABLE")
        storage_st = storage_exp.get("status", "NORMAL")

        decision_text = f"The authorized route is <strong>{final_dec.get('route')}</strong> (Action: <code>{action_val}</code>)."
        if "DEFER" in action_val or "STORE" in action_val:
            decision_text += " Irrigation is temporarily deferred because meteorological conditions indicate high precipitation risk."
        elif "REVIEW" in action_val:
            decision_text += " Operational supervisory review was triggered due to biochemical storage aging or statistical anomaly flag."
        else:
            decision_text += " All operational environmental and storage criteria were satisfied for immediate dispatch."

        st.markdown(
            f"""
            <div style="background:#ffffff; border:1px solid #cbd5e1; border-top:4px solid #f59e0b; border-radius:8px; padding:15px; min-height:220px;">
                <div style="font-weight:700; color:#b45309; font-size:0.95rem; margin-bottom:6px;">2. DECISION EXPLANATION (Context)</div>
                <div style="font-size:0.85rem; color:#334155; line-height:1.4;">
                    {decision_text}
                </div>
                <div style="margin-top:12px; font-size:0.75rem; color:#64748b;">
                    <em>Weather Status: {weather_st} • Storage Status: {storage_st}</em>
                </div>
            </div>
            """, unsafe_allow_html=True
        )

    # 3. SAFETY EXPLANATION
    with col_safety:
        safety_status = safety_exp.get("status", "NORMAL")
        is_override = final_dec.get("override_applied", False)

        if is_override and safety_status in ["CRITICAL", "HIGH_RISK"]:
            safety_html = (
                f"<strong>CRITICAL OVERRIDE ACTIVATED:</strong> An acute biological or toxic cutoff triggered "
                f"Priority 1 precedence. Machine learning prediction was superseded to contain hazard."
            )
            top_color = "#dc2626"
            title_color = "#991b1b"
        else:
            safety_html = "All primary water quality cutoffs (pathogens, septicity, toxicity) are within permissible safe operating thresholds."
            top_color = "#10b981"
            title_color = "#065f46"

        st.markdown(
            f"""
            <div style="background:#ffffff; border:1px solid #cbd5e1; border-top:4px solid {top_color}; border-radius:8px; padding:15px; min-height:220px;">
                <div style="font-weight:700; color:{title_color}; font-size:0.95rem; margin-bottom:6px;">3. SAFETY EXPLANATION (Cutoffs)</div>
                <div style="font-size:0.85rem; color:#334155; line-height:1.4;">
                    {safety_html}
                </div>
                <div style="margin-top:12px; font-size:0.75rem; color:#64748b;">
                    <em>Safety Status: {safety_status} • Precedence: Priority 1</em>
                </div>
            </div>
            """, unsafe_allow_html=True
        )
