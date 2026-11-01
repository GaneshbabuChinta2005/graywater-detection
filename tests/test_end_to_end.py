"""
End-to-End Integration Verification Script
Tests:
React/Client -> Node Express (5000) -> Python FastAPI (8000) -> XGBoost/IsolationForest/SHAP
"""
import requests
import json
import sys

BASE_URL = "http://127.0.0.1:5000/api"

def run_tests():
    print("==================================================")
    print("RUNNING END-TO-END MERN + FASTAPI INTEGRATION TEST")
    print("==================================================")

    # 1. Health
    print("\n1. Testing GET /api/health...")
    r = requests.get(f"{BASE_URL}/health", timeout=5)
    assert r.status_code == 200, f"Health check failed: {r.status_code} {r.text}"
    health_data = r.json()
    print("   Health Response:", json.dumps(health_data, indent=2))
    assert health_data["mlService"]["status"] == "CONNECTED"
    assert health_data["mlService"]["modelsLoaded"] is True
    print("   ✓ Health check passed!")

    # 2. Dashboard summary
    print("\n2. Testing GET /api/dashboard/summary...")
    r = requests.get(f"{BASE_URL}/dashboard/summary", timeout=5)
    assert r.status_code == 200, f"Dashboard summary failed: {r.status_code} {r.text}"
    summary = r.json().get("data", r.json())
    print(f"   Summary retrieved: status={summary.get('systemStatus')}, activeRoutes={summary.get('activeRoutes')}")
    print("   ✓ Dashboard summary passed!")

    # 3. Water Quality / Telemetry latest
    print("\n3. Testing GET /api/telemetry/latest...")
    r = requests.get(f"{BASE_URL}/telemetry/latest", timeout=5)
    assert r.status_code == 200, f"Telemetry latest failed: {r.status_code} {r.text}"
    telem = r.json().get("data", r.json())
    print(f"   Latest telemetry: pH={telem.get('pH')}, TUR_NTU={telem.get('TUR_NTU')}")
    print("   ✓ Telemetry latest passed!")

    # 4. Storage and Weather
    print("\n4. Testing GET /api/storage/latest and /api/weather/latest...")
    r_stor = requests.get(f"{BASE_URL}/storage/latest", timeout=5)
    r_weat = requests.get(f"{BASE_URL}/weather/latest", timeout=5)
    assert r_stor.status_code == 200
    assert r_weat.status_code == 200
    s_data = r_stor.json().get("data", r_stor.json())
    w_data = r_weat.json().get("data", r_weat.json())
    print(f"   Storage Level: {s_data.get('current_level_liters')} L, Weather Condition: {w_data.get('weather_condition')}")
    print("   ✓ Storage & Weather endpoints passed!")

    # 5. POST Analysis (Complete End-to-End Inference with XGBoost, Safety, Weather, Storage, SHAP)
    print("\n5. Testing POST /api/analysis (Manual Analysis Flow)...")
    payload = {
        "Greywater_Source": "Kitchen",
        "pH": 7.2,
        "TEMP_C": 27.5,
        "SAL_ppt": 0.5,
        "TUR_NTU": 80.0,
        "DS_mg_L": 400.0,
        "TDS_mg_L": 450.0,
        "TSS_mg_L": 120.0,
        "COND_uS_cm": 650.0,
        "DO_mg_L": 2.5,
        "BOD_mg_L": 180.0,
        "COD_mg_L": 400.0,
        "NH4F_mg_L": 10.0,
        "NO3_mg_L": 5.0,
        "K_mg_L": 18.0,
        "E_coli_CFU_100mL": 100000.0
    }
    r = requests.post(f"{BASE_URL}/analysis", json=payload, timeout=15)
    assert r.status_code in [200, 201], f"Analysis failed: {r.status_code} {r.text}"
    body = r.json()
    analysis = body.get("analysis", body)
    pred = analysis.get("prediction", {})
    routing = analysis.get("routing", {})
    shap = analysis.get("shap", {})
    
    print(f"   Analysis Output:")
    print(f"     - Predicted Route: {pred.get('class_name')}")
    print(f"     - Confidence: {pred.get('confidence')}")
    print(f"     - Final Route: {routing.get('final_route')}")
    print(f"     - Final Action: {routing.get('final_action')}")
    print(f"     - Anomaly Status: {analysis.get('anomaly', {}).get('status')}")
    print(f"     - Safety Status: {analysis.get('safety', {}).get('status')}")
    top_shap = shap.get('predicted_class_contributions', [{}])[0]
    print(f"     - Top SHAP Feature: {top_shap.get('feature')} (Value: {top_shap.get('value')}, SHAP: {top_shap.get('shap_value')})")
    print("   ✓ End-to-end inference & routing passed!")

    # 6. Analysis History
    print("\n6. Testing GET /api/analysis/history...")
    r = requests.get(f"{BASE_URL}/analysis/history", timeout=5)
    assert r.status_code == 200
    history = r.json().get("data", r.json())
    print(f"   History count: {len(history)}")
    assert len(history) >= 1
    print("   ✓ Analysis history passed!")

    # 7. Simulation Step
    print("\n7. Testing POST /api/simulation/step...")
    r = requests.post(f"{BASE_URL}/simulation/step", timeout=10)
    assert r.status_code == 200
    sim_res = r.json().get("data", r.json())
    telem = sim_res.get('telemetry', {})
    print(f"   Simulated Telemetry Step: source={telem.get('greywater_source')}, flow={telem.get('flow_rate_L_min')} L/min")
    print("   ✓ Simulation step passed!")

    print("\n==================================================")
    print("ALL INTEGRATION TESTS PASSED SUCCESSFULLY! (7/7)")
    print("==================================================")

if __name__ == "__main__":
    run_tests()
