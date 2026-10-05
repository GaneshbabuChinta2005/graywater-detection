"""
Digital Twin Simulation API Routes
AI-Driven Intelligent Greywater Management and Smart Reuse Routing System
"""

from typing import Dict, Any, Optional
from fastapi import APIRouter, HTTPException, status
from ml_service.schemas.inference_schema import SimulationStepRequest
from ml_service.services.ml_service import MLService

router = APIRouter(prefix="/api/simulation", tags=["Digital Twin Simulation"])


@router.post("/start")
def start_simulation() -> Dict[str, Any]:
    """Activate live simulation loop."""
    ml_svc = MLService.get_instance()
    return ml_svc.start_simulation()


@router.post("/stop")
def stop_simulation() -> Dict[str, Any]:
    """Pause live simulation loop."""
    ml_svc = MLService.get_instance()
    return ml_svc.stop_simulation()


@router.post("/reset")
def reset_simulation() -> Dict[str, Any]:
    """Reset Digital Twin to initial conditions (Step 0)."""
    ml_svc = MLService.get_instance()
    return ml_svc.reset_simulation()


@router.post("/step")
def step_simulation(req: Optional[SimulationStepRequest] = None) -> Dict[str, Any]:
    """Advance simulation by 1 timestep and compute real-time decision routing."""
    try:
        ml_svc = MLService.get_instance()
        source = req.source if req else None
        event_name = req.event_name if req and req.event_name else "normal"
        outflow = req.outflow_rate_L_min if req else None

        res = ml_svc.run_simulation_step(
            source=source,
            event_name=event_name,
            outflow_rate_L_min=outflow
        )
        return res
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Simulation step failed: {str(e)}"
        )


@router.get("/current")
def get_current_simulation() -> Dict[str, Any]:
    """Retrieve the latest simulation snapshot and water analysis."""
    ml_svc = MLService.get_instance()
    return ml_svc.get_current_simulation()
