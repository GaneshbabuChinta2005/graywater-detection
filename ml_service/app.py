"""
FastAPI ML Service Application Entry Point
AI-Driven Intelligent Greywater Management and Smart Reuse Routing System

Exposes REST APIs for XGBoost classification, Isolation Forest anomaly screening,
EPA/WHO deterministic safety cutoffs, environmental weather context, biochemical
storage kinetics, SHAP explainability, and Digital Twin telemetry simulation.
"""

import os
import sys
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Ensure ml_service and project root are in sys.path
ML_SERVICE_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.abspath(os.path.join(ML_SERVICE_DIR, ".."))
for p in [ML_SERVICE_DIR, PROJECT_ROOT]:
    if p not in sys.path:
        sys.path.insert(0, p)

try:
    from ml_service.services.ml_service import MLService
    from ml_service.routes import health, inference, simulation, explanation, weather
except ImportError:
    from services.ml_service import MLService
    from routes import health, inference, simulation, explanation, weather



@asynccontextmanager
async def lifespan(app: FastAPI):
    """Load models once on startup, maintain singleton state during lifecycle."""
    print("=" * 65)
    print("Initializing Greywater AI Machine Learning Service (FastAPI)...")
    ml_svc = MLService.get_instance()
    status = ml_svc.load_models()
    print(f"Models and Pipeline Loaded Status: {status}")
    print("Ready to serve inference, simulation, and SHAP requests on port 8000.")
    print("=" * 65)
    yield
    print("Shutting down ML Service.")


app = FastAPI(
    title="Greywater AI Machine Learning Service",
    description="High-performance REST API serving XGBoost, Isolation Forest, Smart Routing, and SHAP Explainers.",
    version="1.0.0",
    lifespan=lifespan
)

# CORS Middleware allowing Node.js backend and React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Routers
app.include_router(health.router)
app.include_router(inference.router)
app.include_router(simulation.router)
app.include_router(explanation.router)
app.include_router(weather.router)


@app.get("/")
def root():
    return {
        "message": "AI-Driven Intelligent Greywater Management and Smart Reuse Routing System - ML Service",
        "docs_url": "/docs",
        "health_url": "/api/health"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("ml_service.app:app", host="0.0.0.0", port=8000, reload=True)
