"""
Biochemical Decay and Mechanistic Deterioration Model
AI-Driven Intelligent Greywater Management and Smart Reuse Routing System

Implements first-order kinetic decay equations and temperature dependence for storage
deterioration estimation.

SCIENTIFIC AND OPERATIONAL DISCLAIMER:
The project dataset is cross-sectional and does NOT contain longitudinal storage experiments.
All kinetic rate constants, activation energies, and temperature coefficients are
UNVALIDATED configuration parameters for simulation and operational monitoring.
They do NOT represent experimentally verified real-world shelf lives.
"""

import math
from typing import Dict, Any, Optional
import warnings

from storage.config import (
    DECAY_PARAMETERS,
    DEFAULT_REFERENCE_TEMP_C,
    GAS_CONSTANT_R,
    PARAMETER_STATUS_UNVALIDATED,
    MODEL_CATEGORY_KINETIC,
    MODEL_CATEGORY_PROXY,
    MODEL_CATEGORY_NOT_MODELED,
    MICROBIAL_RISK_STATUS_DEFAULT
)


class BiochemicalDecayModel:
    """
    Mechanistic, configurable first-order decay model estimating parameter shifts
    and deterioration kinetics over storage time.
    """
    def __init__(
        self,
        parameters_config: Optional[Dict[str, Dict[str, Any]]] = None,
        reference_temperature_C: float = DEFAULT_REFERENCE_TEMP_C,
        use_arrhenius: bool = True
    ):
        self.parameters_config = dict(parameters_config) if parameters_config else dict(DECAY_PARAMETERS)
        self.reference_temperature_C = float(reference_temperature_C)
        self.reference_temperature_K = self.reference_temperature_C + 273.15
        self.use_arrhenius = use_arrhenius

    def calculate_adjusted_rate(self, param_name: str, temperature_C: float) -> float:
        """
        Calculate temperature-adjusted decay rate k(T) using Arrhenius kinetics or theta factor.
        
        Equation (Arrhenius):
            k(T) = k_ref * exp[-Ea/R * (1/T - 1/T_ref)]
            
        Equation (Modified Streeter-Phelps Theta):
            k(T) = k_ref * theta^(T - T_ref)
        """
        if not isinstance(temperature_C, (int, float)):
            raise TypeError(f"Temperature must be numeric, got {type(temperature_C)}")
            
        if temperature_C < -273.15:
            raise ValueError(f"Non-physical temperature below absolute zero: {temperature_C} °C")

        cfg = self.parameters_config.get(param_name, {})
        category = cfg.get("model_category", MODEL_CATEGORY_NOT_MODELED)

        if category != MODEL_CATEGORY_KINETIC:
            return 0.0

        k_ref = float(cfg.get("k_ref_per_hour", 0.02))
        
        # Freezing check: fluid frozen solid stops liquid phase kinetics
        if temperature_C <= 0.0:
            return 0.0

        if self.use_arrhenius and "activation_energy_J_mol" in cfg:
            Ea = float(cfg["activation_energy_J_mol"])
            temp_K = temperature_C + 273.15
            # Arrhenius equation with temperature in Kelvin
            inv_t_diff = (1.0 / temp_K) - (1.0 / self.reference_temperature_K)
            rate = k_ref * math.exp(-(Ea / GAS_CONSTANT_R) * inv_t_diff)
        elif "theta_temp_coeff" in cfg:
            theta = float(cfg["theta_temp_coeff"])
            rate = k_ref * (theta ** (temperature_C - self.reference_temperature_C))
        else:
            rate = k_ref

        return max(0.0, rate)

    def estimate_parameter_decay(
        self,
        param_name: str,
        initial_value: float,
        elapsed_hours: float,
        temperature_C: float = DEFAULT_REFERENCE_TEMP_C
    ) -> Dict[str, Any]:
        """
        Estimate parameter value after elapsed storage time t.
        
        Parameters
        ----------
        param_name : str
            Name of water-quality parameter (e.g. 'BOD_mg_L', 'COD_mg_L', 'DO_mg_L').
        initial_value : float
            Concentration or value at start of storage.
        elapsed_hours : float
            Duration of storage in decimal hours (t >= 0).
        temperature_C : float
            Ambient or measured fluid temperature (°C).
            
        Returns
        -------
        dict
            Contains estimated value, kinetic rate, parameter category, and unvalidated status flag.
        """
        if initial_value < 0:
            raise ValueError(f"Initial value cannot be negative: {initial_value}")
        if elapsed_hours < 0:
            raise ValueError(f"Elapsed storage hours cannot be negative: {elapsed_hours}")

        cfg = self.parameters_config.get(param_name, {})
        category = cfg.get("model_category", MODEL_CATEGORY_NOT_MODELED)
        status = cfg.get("parameter_status", PARAMETER_STATUS_UNVALIDATED)

        # Baseline: at t = 0, no alteration has occurred
        if elapsed_hours == 0.0:
            return {
                "parameter": param_name,
                "initial_value": initial_value,
                "estimated_value": initial_value,
                "elapsed_hours": 0.0,
                "rate_k_per_hour": 0.0,
                "model_category": category,
                "parameter_status": status,
                "microbial_risk_status": cfg.get("microbial_risk_status", "N/A"),
                "relative_change_pct": 0.0
            }

        # 1. Supported First-Order Kinetic Decay: C(t) = C0 * exp(-k*t)
        if category == MODEL_CATEGORY_KINETIC:
            k = self.calculate_adjusted_rate(param_name, temperature_C)
            estimated = initial_value * math.exp(-k * elapsed_hours)
            rel_change = ((estimated - initial_value) / initial_value * 100.0) if initial_value > 0 else 0.0

            return {
                "parameter": param_name,
                "initial_value": initial_value,
                "estimated_value": round(estimated, 3),
                "elapsed_hours": elapsed_hours,
                "rate_k_per_hour": round(k, 5),
                "model_category": category,
                "parameter_status": status,
                "microbial_risk_status": "N/A",
                "relative_change_pct": round(rel_change, 2)
            }

        # 2. Relative Risk Proxy (Dissolved Oxygen Depletion / Sedimentation)
        elif category == MODEL_CATEGORY_PROXY:
            if param_name == "DO_mg_L":
                # DO decreases towards zero anoxic threshold due to microbial respiration
                depletion_rate = float(cfg.get("depletion_rate_per_hour", 0.08))
                # Accelerated oxygen consumption at higher temperatures
                temp_factor = max(0.5, min(2.5, 1.0 + 0.04 * (temperature_C - self.reference_temperature_C)))
                k_do = depletion_rate * temp_factor
                estimated = initial_value * math.exp(-k_do * elapsed_hours)
                rel_change = ((estimated - initial_value) / initial_value * 100.0) if initial_value > 0 else 0.0
            elif param_name == "TUR_NTU":
                # Particulate sedimentation reduces turbidity gradually
                settling_rate = float(cfg.get("settling_rate_per_hour", 0.015))
                estimated = initial_value * math.exp(-settling_rate * elapsed_hours)
                rel_change = ((estimated - initial_value) / initial_value * 100.0) if initial_value > 0 else 0.0
            else:
                estimated = initial_value
                rel_change = 0.0

            return {
                "parameter": param_name,
                "initial_value": initial_value,
                "estimated_value": round(estimated, 3),
                "elapsed_hours": elapsed_hours,
                "rate_k_per_hour": None,
                "model_category": category,
                "parameter_status": status,
                "microbial_risk_status": "N/A",
                "relative_change_pct": round(rel_change, 2)
            }

        # 3. Not Empirically Modeled (e.g. E_coli, Salts, Heavy Inorganics)
        else:
            return {
                "parameter": param_name,
                "initial_value": initial_value,
                "estimated_value": initial_value,  # Preserved without unverified kinetic assertion
                "elapsed_hours": elapsed_hours,
                "rate_k_per_hour": None,
                "model_category": MODEL_CATEGORY_NOT_MODELED,
                "parameter_status": PARAMETER_STATUS_UNVALIDATED,
                "microbial_risk_status": MICROBIAL_RISK_STATUS_DEFAULT,
                "relative_change_pct": 0.0
            }

    def estimate_all_parameters(
        self,
        quality_features: Dict[str, float],
        elapsed_hours: float,
        temperature_C: float = DEFAULT_REFERENCE_TEMP_C
    ) -> Dict[str, Any]:
        """
        Estimate changes across all water quality parameters for a given storage duration.
        """
        updated_features = {}
        parameter_reports = {}

        for k, val in quality_features.items():
            if isinstance(val, (int, float)):
                res = self.estimate_parameter_decay(k, float(val), elapsed_hours, temperature_C)
                updated_features[k] = res["estimated_value"]
                parameter_reports[k] = res
            else:
                updated_features[k] = val

        return {
            "elapsed_hours": elapsed_hours,
            "temperature_C": temperature_C,
            "updated_features": updated_features,
            "parameter_reports": parameter_reports,
            "microbial_risk_status": MICROBIAL_RISK_STATUS_DEFAULT,
            "validation_note": "Kinetic values are unvalidated simulation estimates."
        }
