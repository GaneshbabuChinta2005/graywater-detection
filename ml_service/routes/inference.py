"""
Inference API Routes
AI-Driven Intelligent Greywater Management and Smart Reuse Routing System
"""

from typing import Dict, Any, List
from fastapi import APIRouter, HTTPException, status
from ml_service.schemas.inference_schema import AnalyzeRequest, BatchAnalyzeRequest
from ml_service.services.ml_service import MLService

router = APIRouter(prefix="/api/inference", tags=["Inference"])


@router.post("/analyze", status_code=status.HTTP_200_OK)
def analyze_sample(req: AnalyzeRequest) -> Dict[str, Any]:
    """
    Execute full end-to-end evaluation on a single water telemetry sample:
    15 Physicochemical Parameters -> XGBoost -> Isolation Forest -> Safety Rules -> Weather -> Storage -> SHAP
    """
    try:
        ml_svc = MLService.get_instance()
        sample_dict = req.model_dump(exclude={"override_weather", "override_storage"})
        weather_dict = req.override_weather.model_dump(exclude_none=True) if req.override_weather else None
        storage_dict = req.override_storage.model_dump(exclude_none=True) if req.override_storage else None

        result = ml_svc.run_complete_analysis(
            sample=sample_dict,
            override_weather=weather_dict,
            override_storage=storage_dict
        )
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Inference execution failed: {str(e)}"
        )


@router.post("/batch", status_code=status.HTTP_200_OK)
def analyze_batch(req: BatchAnalyzeRequest) -> List[Dict[str, Any]]:
    """Execute end-to-end batch evaluation over multiple water quality records."""
    try:
        ml_svc = MLService.get_instance()
        sample_list = [item.model_dump() for item in req.samples]
        results = ml_svc.run_batch_analysis(sample_list)
        return results
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Batch inference failed: {str(e)}"
        )
