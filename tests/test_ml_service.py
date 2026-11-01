"""
Unit and Integration Tests for FastAPI ML Microservice
AI-Driven Intelligent Greywater Management and Smart Reuse Routing System
"""

import pytest
from fastapi.testclient import TestClient
from ml_service.app import app
from ml_service.services.ml_service import MLService


@pytest.fixture(scope="module")
def client():
    with TestClient(app) as test_client:
        yield test_client


def test_01_health_endpoint(client):
    """Test 1: GET /api/health returns ok status and verifies models are loaded."""
    res = client.get("/api/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "ok"
    assert data["models_loaded"] is True
    assert data["service"] == "ml-service"


def test_02_analyze_sample(client):
    """Test 2: POST /api/inference/analyze returns full ML prediction and SHAP explanation."""
    payload = {
        "Greywater_Source": "Bathroom",
        "pH": 7.4,
        "TEMP_C": 24.5,
        "SAL_ppt": 0.22,
        "TUR_NTU": 28.5,
        "DS_mg_L": 255.0,
        "TDS_mg_L": 275.0,
        "TSS_mg_L": 34.0,
        "COND_uS_cm": 515.0,
        "DO_mg_L": 4.8,
        "BOD_mg_L": 28.0,
        "COD_mg_L": 82.0,
        "NH4F_mg_L": 4.2,
        "NO3_mg_L": 4.5,
        "K_mg_L": 15.8,
        "E_coli_CFU_100mL": 1500
    }
    res = client.post("/api/inference/analyze", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert "analysis_id" in data
    assert "prediction" in data
    assert "anomaly" in data
    assert "safety" in data
    assert "weather" in data
    assert "storage" in data
    assert "routing" in data
    assert "shap" in data
    assert "explanation" in data
    assert data["routing"]["final_route"] in ["Sewer Bypass", "Bio-filtration", "Restricted Irrigation", "Indoor Reuse"]


def test_03_batch_inference(client):
    """Test 3: POST /api/inference/batch processes multiple records."""
    samples = [
        {
            "Greywater_Source": "Bathroom",
            "pH": 7.4, "TEMP_C": 24.5, "SAL_ppt": 0.22, "TUR_NTU": 28.5,
            "DS_mg_L": 255.0, "TDS_mg_L": 275.0, "TSS_mg_L": 34.0, "COND_uS_cm": 515.0,
            "DO_mg_L": 4.8, "BOD_mg_L": 28.0, "COD_mg_L": 82.0, "NH4F_mg_L": 4.2,
            "NO3_mg_L": 4.5, "K_mg_L": 15.8, "E_coli_CFU_100mL": 1500
        },
        {
            "Greywater_Source": "Kitchen",
            "pH": 6.3, "TEMP_C": 28.0, "SAL_ppt": 0.58, "TUR_NTU": 145.0,
            "DS_mg_L": 620.0, "TDS_mg_L": 680.0, "TSS_mg_L": 240.0, "COND_uS_cm": 940.0,
            "DO_mg_L": 0.5, "BOD_mg_L": 380.0, "COD_mg_L": 850.0, "NH4F_mg_L": 18.5,
            "NO3_mg_L": 3.2, "K_mg_L": 32.0, "E_coli_CFU_100mL": 180000
        }
    ]
    res = client.post("/api/inference/batch", json={"samples": samples})
    assert res.status_code == 200
    data = res.json()
    assert isinstance(data, list)
    assert len(data) == 2


def test_04_simulation_endpoints(client):
    """Test 4: Digital Twin simulation controls and step progression."""
    res_start = client.post("/api/simulation/start")
    assert res_start.status_code == 200
    assert res_start.json()["active"] is True

    res_step = client.post("/api/simulation/step", json={"source": "Laundry", "event_name": "normal"})
    assert res_step.status_code == 200
    step_data = res_step.json()
    assert "telemetry" in step_data
    assert "analysis" in step_data

    res_stop = client.post("/api/simulation/stop")
    assert res_stop.status_code == 200
    assert res_stop.json()["active"] is False


def test_05_weather_and_storage_endpoints(client):
    """Test 5: GET /api/weather/current and GET /api/storage/current."""
    w_res = client.get("/api/weather/current")
    assert w_res.status_code == 200
    assert "temperature_C" in w_res.json()
    assert "rainfall_mm" in w_res.json()

    s_res = client.get("/api/storage/current")
    assert s_res.status_code == 200
    assert "capacity_liters" in s_res.json()
    assert "current_level_liters" in s_res.json()
