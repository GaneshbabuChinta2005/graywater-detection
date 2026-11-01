"""
Weather and Storage Context API Routes
AI-Driven Intelligent Greywater Management and Smart Reuse Routing System
"""

from typing import Dict, Any
from fastapi import APIRouter
from ml_service.services.ml_service import MLService

router = APIRouter(tags=["Context"])


@router.get("/api/weather/current")
def get_current_weather() -> Dict[str, Any]:
    """Retrieve live or fallback meteorological environmental context."""
    ml_svc = MLService.get_instance()
    return ml_svc.get_current_weather()


@router.get("/api/storage/current")
def get_current_storage() -> Dict[str, Any]:
    """Retrieve operational storage tank level and shelf-life metrics."""
    ml_svc = MLService.get_instance()
    return ml_svc.get_current_storage()
