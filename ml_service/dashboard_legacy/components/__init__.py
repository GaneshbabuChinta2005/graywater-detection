"""
Dashboard UI Components Package
AI-Driven Intelligent Greywater Management and Smart Reuse Routing System
"""

from dashboard.components.sidebar import render_sidebar
from dashboard.components.metric_cards import render_metric_cards
from dashboard.components.charts import (
    render_telemetry_charts,
    render_anomaly_distribution_chart,
    render_feature_importance_chart
)
from dashboard.components.routing_card import render_routing_card, render_decision_pipeline
from dashboard.components.water_quality import render_water_quality_panel
from dashboard.components.tank_monitor import render_tank_monitor
from dashboard.components.weather_panel import render_weather_panel
from dashboard.components.anomaly_panel import render_anomaly_panel
from dashboard.components.shap_panel import render_shap_panel
from dashboard.components.explanation_panel import render_explanation_panel
from dashboard.components.status_panel import render_status_panel

__all__ = [
    "render_sidebar",
    "render_metric_cards",
    "render_telemetry_charts",
    "render_anomaly_distribution_chart",
    "render_feature_importance_chart",
    "render_routing_card",
    "render_decision_pipeline",
    "render_water_quality_panel",
    "render_tank_monitor",
    "render_weather_panel",
    "render_anomaly_panel",
    "render_shap_panel",
    "render_explanation_panel",
    "render_status_panel"
]
