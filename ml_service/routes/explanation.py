"""
SHAP and Decision Explanation API Routes
AI-Driven Intelligent Greywater Management and Smart Reuse Routing System
"""

from typing import Dict, Any
from fastapi import APIRouter, HTTPException, status
from ml_service.services.ml_service import MLService

router = APIRouter(prefix="/api/explanation", tags=["Explanation"])


@router.get("/{analysis_id}")
def get_explanation(analysis_id: str) -> Dict[str, Any]:
    """Retrieve full SHAP feature attributions and transparent decision rationale by analysis ID."""
    ml_svc = MLService.get_instance()
    cached = ml_svc.get_cached_explanation(analysis_id)
    if not cached:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Analysis with ID '{analysis_id}' not found in active session cache."
        )
    return {
        "analysis_id": analysis_id,
        "timestamp": cached.get("timestamp"),
        "source": cached.get("source"),
        "prediction": cached.get("prediction"),
        "routing": cached.get("routing"),
        "shap": cached.get("shap"),
        "explanation": cached.get("explanation")
    }
