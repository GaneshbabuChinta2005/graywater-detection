"""
Inference Data Schemas and Validation Models
AI-Driven Intelligent Greywater Management and Smart Reuse Routing System
"""

from typing import Dict, Any, List, Optional, Union
from pydantic import BaseModel, Field, field_validator


class WaterSampleInput(BaseModel):
    Greywater_Source: str = Field(..., description="Source origin: Bathroom, Kitchen, Laundry, or Mixed")
    pH: float = Field(..., ge=0.0, le=14.0, description="Potential of Hydrogen [0 - 14]")
    TEMP_C: float = Field(..., ge=0.0, le=100.0, description="Water Temperature in Celsius")
    SAL_ppt: float = Field(..., ge=0.0, description="Salinity in parts per thousand")
    TUR_NTU: float = Field(..., ge=0.0, description="Turbidity in Nephelometric Turbidity Units")
    DS_mg_L: float = Field(..., ge=0.0, description="Dissolved Solids in mg/L")
    TDS_mg_L: float = Field(..., ge=0.0, description="Total Dissolved Solids in mg/L")
    TSS_mg_L: float = Field(..., ge=0.0, description="Total Suspended Solids in mg/L")
    COND_uS_cm: float = Field(..., ge=0.0, description="Electrical Conductivity in uS/cm")
    DO_mg_L: float = Field(..., ge=0.0, description="Dissolved Oxygen in mg/L")
    BOD_mg_L: float = Field(..., ge=0.0, description="Biochemical Oxygen Demand in mg/L")
    COD_mg_L: float = Field(..., ge=0.0, description="Chemical Oxygen Demand in mg/L")
    NH4F_mg_L: float = Field(..., ge=0.0, description="Ammonium Fluoride in mg/L")
    NO3_mg_L: float = Field(..., ge=0.0, description="Nitrate in mg/L")
    K_mg_L: float = Field(..., ge=0.0, description="Potassium in mg/L")
    E_coli_CFU_100mL: float = Field(..., ge=0.0, description="E. coli pathogen count in CFU/100mL")

    @field_validator("Greywater_Source")
    @classmethod
    def validate_source(cls, v: str) -> str:
        valid = ["Bathroom", "Kitchen", "Laundry", "Mixed"]
        for opt in valid:
            if v.strip().lower() == opt.lower():
                return opt
        raise ValueError(f"Invalid Greywater_Source: '{v}'. Must be one of: {', '.join(valid)}")


class WeatherOverride(BaseModel):
    rainfall_mm: Optional[float] = None
    precipitation_probability: Optional[float] = None
    temperature_C: Optional[float] = None
    weather_status: Optional[str] = None


class StorageOverride(BaseModel):
    deterioration_index: Optional[float] = None
    stagnation_status: Optional[str] = None
    storage_age_hours: Optional[float] = None


class AnalyzeRequest(WaterSampleInput):
    override_weather: Optional[WeatherOverride] = None
    override_storage: Optional[StorageOverride] = None


class BatchAnalyzeRequest(BaseModel):
    samples: List[WaterSampleInput]


class SimulationStepRequest(BaseModel):
    source: Optional[str] = None
    event_name: Optional[str] = "normal"
    outflow_rate_L_min: Optional[float] = None
