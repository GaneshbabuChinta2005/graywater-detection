"""
Health Check Route
AI-Driven Intelligent Greywater Management and Smart Reuse Routing System
"""

from fastapi import APIRouter
from ml_service.services.ml_service import MLService

router = APIRouter(tags=["Health"])


@router.get("/api/health")
def health_check():
    """Return runtime service health and model loading status."""
    ml_svc = MLService.get_instance()
    models_ready = (
        ml_svc.routing_pipeline is not None and
        ml_svc.routing_pipeline.xgb_model is not None and
        ml_svc.routing_pipeline.iso_model is not None and
        ml_svc.shap_explainer is not None
    )
    return {
        "status": "ok",
        "service": "ml-service",
        "models_loaded": models_ready,
        "framework": "FastAPI + XGBoost + Isolation Forest + SHAP"
    }
