"""
Smart Routing Simulation and Batch Evaluation Runner
AI-Driven Intelligent Greywater Management and Smart Reuse Routing System

Executes:
1. 10 controlled synthetic scenarios demonstrating all arbitration cases.
2. Batch evaluation across test dataset generating dataset/processed/routing_decisions.csv.
3. Serialization of simulation decisions to simulation/data/routing_decision_simulation.csv.
"""

import os
import json
import pandas as pd
import numpy as np

from routing.decision_schema import (
    RoutingInput,
    ROUTE_SEWER_BYPASS,
    ROUTE_BIO_FILTRATION,
    ROUTE_RESTRICTED_IRRIGATION,
    ROUTE_INDOOR_REUSE,
    ACTION_ALLOW_ROUTE,
    ACTION_DEFER_ROUTE,
    ACTION_STORE_FOR_LATER,
    ACTION_SAFETY_OVERRIDE,
    ACTION_REVIEW_REQUIRED
)
from routing.routing_engine import SmartRoutingEngine
from routing.inference_pipeline import ContextAwareRoutingPipeline


def run_synthetic_routing_scenarios(
    output_path: str = "simulation/data/routing_decision_simulation.csv"
) -> pd.DataFrame:
    """
    Execute 10 comprehensive multi-variable synthetic scenarios verifying the full decision hierarchy.
    """
    engine = SmartRoutingEngine()

    # Base clean bathroom template
    clean_bathroom = {
        "greywater_source": "Bathroom",
        "pH": 7.2, "TEMP_C": 24.0, "SAL_ppt": 0.15, "TUR_NTU": 12.0, "DS_mg_L": 140.0,
        "TDS_mg_L": 150.0, "TSS_mg_L": 18.0, "COND_uS_cm": 220.0, "DO_mg_L": 5.5,
        "BOD_mg_L": 25.0, "COD_mg_L": 55.0, "NH4F_mg_L": 2.5, "NO3_mg_L": 4.0,
        "K_mg_L": 6.5, "E_coli_CFU_100mL": 1200.0
    }

    # Base moderate laundry template
    mod_laundry = {
        "greywater_source": "Laundry",
        "pH": 7.8, "TEMP_C": 26.0, "SAL_ppt": 0.32, "TUR_NTU": 45.0, "DS_mg_L": 380.0,
        "TDS_mg_L": 410.0, "TSS_mg_L": 60.0, "COND_uS_cm": 520.0, "DO_mg_L": 3.2,
        "BOD_mg_L": 85.0, "COD_mg_L": 210.0, "NH4F_mg_L": 6.5, "NO3_mg_L": 7.0,
        "K_mg_L": 14.0, "E_coli_CFU_100mL": 8500.0
    }

    # Base high-load kitchen template
    high_kitchen = {
        "greywater_source": "Kitchen",
        "pH": 6.5, "TEMP_C": 28.0, "SAL_ppt": 0.45, "TUR_NTU": 95.0, "DS_mg_L": 580.0,
        "TDS_mg_L": 620.0, "TSS_mg_L": 180.0, "COND_uS_cm": 780.0, "DO_mg_L": 1.5,
        "BOD_mg_L": 280.0, "COD_mg_L": 560.0, "NH4F_mg_L": 12.0, "NO3_mg_L": 10.0,
        "K_mg_L": 22.0, "E_coli_CFU_100mL": 180000.0
    }

    scenarios = [
        # Scenario 1: Nominal Bathroom -> Indoor Reuse
        {
            "id": "SCENARIO_01_NOMINAL_INDOOR",
            "desc": "Clean bathroom greywater in sunny weather",
            "data": clean_bathroom,
            "pred_class": 3, "confidence": 0.94, "is_anom": False, "anom_score": -0.15,
            "weather": {"rainfall_mm": 0.0, "precipitation_probability": 5.0, "weather_status": "LIVE"},
            "storage": {"deterioration_index": 0.05, "stagnation_status": "NORMAL", "storage_age_hours": 1.0}
        },
        # Scenario 2: Nominal Irrigation in Dry Weather
        {
            "id": "SCENARIO_02_NOMINAL_IRRIGATION",
            "desc": "Laundry greywater suitable for irrigation during clear sunny day",
            "data": mod_laundry,
            "pred_class": 2, "confidence": 0.88, "is_anom": False, "anom_score": -0.10,
            "weather": {"rainfall_mm": 0.0, "precipitation_probability": 10.0, "weather_status": "LIVE"},
            "storage": {"deterioration_index": 0.10, "stagnation_status": "NORMAL", "storage_age_hours": 3.0}
        },
        # Scenario 3: Irrigation Deferred by High Rainfall (Weather Context)
        {
            "id": "SCENARIO_03_IRRIGATION_RAIN_DEFERRED",
            "desc": "Irrigation route suppressed due to ambient heavy rainstorm (15mm)",
            "data": mod_laundry,
            "pred_class": 2, "confidence": 0.89, "is_anom": False, "anom_score": -0.08,
            "weather": {"rainfall_mm": 15.0, "precipitation_probability": 90.0, "weather_status": "LIVE"},
            "storage": {"deterioration_index": 0.12, "stagnation_status": "NORMAL", "storage_age_hours": 3.0}
        },
        # Scenario 4: Indoor Reuse with Heavy Rain (Hydraulic Decoupling)
        {
            "id": "SCENARIO_04_INDOOR_RAIN_UNAFFECTED",
            "desc": "Indoor toilet flushing reuse during heavy downpour (decoupled)",
            "data": clean_bathroom,
            "pred_class": 3, "confidence": 0.92, "is_anom": False, "anom_score": -0.14,
            "weather": {"rainfall_mm": 22.0, "precipitation_probability": 95.0, "weather_status": "LIVE"},
            "storage": {"deterioration_index": 0.08, "stagnation_status": "NORMAL", "storage_age_hours": 2.0}
        },
        # Scenario 5: Critical Pathogen Contamination -> Safety Override
        {
            "id": "SCENARIO_05_CRITICAL_PATHOGEN_SEWER",
            "desc": "Catastrophic cross-contamination (E. coli = 850,000 CFU) forcing Sewer Bypass",
            "data": {**clean_bathroom, "E_coli_CFU_100mL": 850000.0, "TUR_NTU": 110.0},
            "pred_class": 2, "confidence": 0.72, "is_anom": False, "anom_score": 0.02,
            "weather": {"rainfall_mm": 0.0, "precipitation_probability": 0.0, "weather_status": "LIVE"},
            "storage": {"deterioration_index": 0.05, "stagnation_status": "NORMAL", "storage_age_hours": 0.5}
        },
        # Scenario 6: Extreme Acidic pH Chemical Dump -> Safety Override
        {
            "id": "SCENARIO_06_EXTREME_PH_CHEMICAL",
            "desc": "Acidic cleaner discharge (pH = 4.8) forcing Sewer Bypass",
            "data": {**mod_laundry, "pH": 4.8, "COND_uS_cm": 1400.0},
            "pred_class": 1, "confidence": 0.65, "is_anom": False, "anom_score": 0.05,
            "weather": {"rainfall_mm": 0.0, "precipitation_probability": 5.0, "weather_status": "LIVE"},
            "storage": {"deterioration_index": 0.15, "stagnation_status": "NORMAL", "storage_age_hours": 2.0}
        },
        # Scenario 7: Statistical Anomaly Only (No Acute Violations -> Anomaly Review)
        {
            "id": "SCENARIO_07_ANOMALY_ONLY_REVIEW",
            "desc": "Statistical outlier in mixed source without acute toxic breach -> Anomaly Review",
            "data": {**mod_laundry, "greywater_source": "Mixed", "NH4F_mg_L": 18.0, "K_mg_L": 38.0},
            "pred_class": 1, "confidence": 0.81, "is_anom": True, "anom_score": 0.12,
            "weather": {"rainfall_mm": 0.0, "precipitation_probability": 10.0, "weather_status": "LIVE"},
            "storage": {"deterioration_index": 0.18, "stagnation_status": "NORMAL", "storage_age_hours": 4.0}
        },
        # Scenario 8: High-Risk Anomaly + Severe Contamination -> Sewer Bypass Override
        {
            "id": "SCENARIO_08_ANOMALY_PLUS_HAZARD_SEWER",
            "desc": "Combined statistical outlier and extreme kitchen loading (COD 890, BOD 520)",
            "data": {**high_kitchen, "COD_mg_L": 890.0, "BOD_mg_L": 520.0, "DO_mg_L": 0.4},
            "pred_class": 1, "confidence": 0.58, "is_anom": True, "anom_score": 0.22,
            "weather": {"rainfall_mm": 0.0, "precipitation_probability": 5.0, "weather_status": "LIVE"},
            "storage": {"deterioration_index": 0.20, "stagnation_status": "NORMAL", "storage_age_hours": 2.0}
        },
        # Scenario 9: High Storage Deterioration & Stagnation -> Storage Review
        {
            "id": "SCENARIO_09_STORAGE_DETERIORATION_STAGNANT",
            "desc": "Greywater retained in tank for 40 hours with deterioration index 0.68",
            "data": mod_laundry,
            "pred_class": 2, "confidence": 0.85, "is_anom": False, "anom_score": -0.05,
            "weather": {"rainfall_mm": 0.0, "precipitation_probability": 10.0, "weather_status": "LIVE"},
            "storage": {"deterioration_index": 0.68, "stagnation_status": "HIGH_STAGNATION_RISK", "storage_age_hours": 40.0}
        },
        # Scenario 10: Low Model Confidence -> Review Required
        {
            "id": "SCENARIO_10_LOW_CONFIDENCE_REVIEW",
            "desc": "Ambiguous border sample yielding low prediction confidence (48%)",
            "data": {**mod_laundry, "BOD_mg_L": 118.0, "TUR_NTU": 58.0},
            "pred_class": 1, "confidence": 0.48, "is_anom": False, "anom_score": -0.02,
            "weather": {"rainfall_mm": 0.0, "precipitation_probability": 15.0, "weather_status": "LIVE"},
            "storage": {"deterioration_index": 0.15, "stagnation_status": "NORMAL", "storage_age_hours": 2.0}
        }
    ]

    records = []
    for sc in scenarios:
        rin = RoutingInput(
            greywater_source=sc["data"]["greywater_source"],
            pH=sc["data"]["pH"],
            TEMP_C=sc["data"]["TEMP_C"],
            SAL_ppt=sc["data"]["SAL_ppt"],
            TUR_NTU=sc["data"]["TUR_NTU"],
            DS_mg_L=sc["data"]["DS_mg_L"],
            TDS_mg_L=sc["data"]["TDS_mg_L"],
            TSS_mg_L=sc["data"]["TSS_mg_L"],
            COND_uS_cm=sc["data"]["COND_uS_cm"],
            DO_mg_L=sc["data"]["DO_mg_L"],
            BOD_mg_L=sc["data"]["BOD_mg_L"],
            COD_mg_L=sc["data"]["COD_mg_L"],
            NH4F_mg_L=sc["data"]["NH4F_mg_L"],
            NO3_mg_L=sc["data"]["NO3_mg_L"],
            K_mg_L=sc["data"]["K_mg_L"],
            E_coli_CFU_100mL=sc["data"]["E_coli_CFU_100mL"],
            predicted_class=sc["pred_class"],
            prediction_confidence=sc["confidence"],
            anomaly_prediction=sc["is_anom"],
            anomaly_score=sc["anom_score"]
        )
        dec = engine.evaluate(
            routing_input=rin,
            predicted_class=sc["pred_class"],
            prediction_confidence=sc["confidence"],
            is_anomaly=sc["is_anom"],
            anomaly_score=sc["anom_score"],
            weather_data=sc["weather"],
            storage_data=sc["storage"]
        )
        records.append({
            "scenario_id": sc["id"],
            "description": sc["desc"],
            "source": dec.source,
            "predicted_route": dec.predicted_route,
            "prediction_confidence": dec.prediction_confidence,
            "safety_status": dec.safety_status,
            "anomaly_status": dec.anomaly_status,
            "weather_status": dec.weather_status,
            "weather_action": dec.weather_action,
            "storage_status": dec.storage_status,
            "final_route": dec.final_route,
            "final_action": dec.final_action,
            "decision_status": dec.decision_status,
            "override_applied": dec.override_applied,
            "reason_codes": "|".join(dec.reason_codes),
            "human_readable_reason": dec.human_readable_reason
        })

    df_scenarios = pd.DataFrame(records)
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    df_scenarios.to_csv(output_path, index=False)
    print(f"Synthetic routing scenarios saved to: {output_path} ({len(df_scenarios)} scenarios)")
    return df_scenarios


def run_batch_test_evaluation(
    test_csv_path: str = "dataset/processed/test.csv",
    output_path: str = "dataset/processed/routing_decisions.csv"
) -> pd.DataFrame:
    """
    Run pipeline batch evaluation across the entire holdout test dataset.
    """
    if not os.path.exists(test_csv_path):
        raise FileNotFoundError(f"Test dataset not found at {test_csv_path}")

    pipeline = ContextAwareRoutingPipeline()
    df_res = pipeline.evaluate_batch(test_csv_path, output_csv_path=output_path)
    return df_res


if __name__ == "__main__":
    print("Running Smart Routing Simulation and Batch Processing...")
    df_sc = run_synthetic_routing_scenarios()
    df_batch = run_batch_test_evaluation()
    print("Execution complete.")
