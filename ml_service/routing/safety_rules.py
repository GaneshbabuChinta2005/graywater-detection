"""
Safety Rules and Critical Water-Quality Inspection Layer
AI-Driven Intelligent Greywater Management and Smart Reuse Routing System

Implements independent physical/biological hazard screening using scientifically
grounded thresholds established in Phase 3.

PRIORITY 1 MANDATE:
Critical water-quality safety conditions strictly supersede all machine learning
predictions, weather context, and operational storage preferences.
"""

from typing import Dict, Any, List, Tuple
from routing.routing_rules import DEFAULT_THRESHOLDS
from routing.decision_schema import (
    SafetyFlag,
    SAFETY_SAFE_FOR_MODEL_REVIEW,
    SAFETY_REVIEW_REQUIRED,
    SAFETY_HIGH_RISK,
    SAFETY_CRITICAL
)
import routing.reason_codes as rc


class WaterQualitySafetyEngine:
    """
    Independent deterministic safety screening layer evaluating raw greywater against
    acute toxic, biological pathogen, chemical, and septic risk thresholds.
    """
    def __init__(self, thresholds: Dict[str, Any] = None):
        self.thresholds = thresholds if thresholds is not None else DEFAULT_THRESHOLDS
        self.sewer_cfg = self.thresholds.get("sewer_bypass", {})
        self.bio_cfg = self.thresholds.get("bio_filtration", {})

    def evaluate_safety(self, features: Dict[str, Any]) -> Tuple[str, List[SafetyFlag], List[str]]:
        """
        Evaluate sample against critical safety boundaries.
        
        Parameters
        ----------
        features : dict
            Dictionary of water quality parameter readings.
            
        Returns
        -------
        tuple:
            - safety_status (str): 'SAFE_FOR_MODEL_REVIEW' | 'REVIEW_REQUIRED' | 'HIGH_RISK' | 'CRITICAL'
            - safety_flags (list of SafetyFlag)
            - triggered_reason_codes (list of str)
        """
        flags: List[SafetyFlag] = []
        reason_codes: List[str] = []

        cfg = self.sewer_cfg

        # 1. Acute Biological Pathogen Hazard (E. coli)
        if "E_coli_CFU_100mL" in features:
            ecoli = float(features["E_coli_CFU_100mL"])
            if ecoli >= cfg.get("ecoli_max", 500000.0):
                flags.append(SafetyFlag(
                    parameter="E_coli_CFU_100mL",
                    observed_value=ecoli,
                    threshold=f">= {cfg.get('ecoli_max', 500000.0)} CFU/100mL",
                    reason="Extreme pathogen loading exceeding acute disinfection and exposure limits",
                    severity="CRITICAL"
                ))
                reason_codes.append(rc.WQ_HIGH_ECOLI)
            elif ecoli >= 100000.0:
                flags.append(SafetyFlag(
                    parameter="E_coli_CFU_100mL",
                    observed_value=ecoli,
                    threshold=">= 100000.0 CFU/100mL",
                    reason="Elevated pathogen loading requiring multi-stage disinfection verification",
                    severity="HIGH"
                ))
                reason_codes.append(rc.WQ_HIGH_ECOLI)

        # 2. Acute pH Extreme (Chemical Detergent / Acid Dump)
        if "pH" in features:
            ph = float(features["pH"])
            ph_min = cfg.get("ph_min", 6.0)
            ph_max = cfg.get("ph_max", 9.0)
            if ph < ph_min or ph > ph_max:
                flags.append(SafetyFlag(
                    parameter="pH",
                    observed_value=ph,
                    threshold=f"[{ph_min}, {ph_max}]",
                    reason="Extreme corrosive or caustic chemical violation threatening plumbing and biology",
                    severity="CRITICAL"
                ))
                reason_codes.append(rc.WQ_EXTREME_PH)
            elif ph < 6.3 or ph > 8.5:
                flags.append(SafetyFlag(
                    parameter="pH",
                    observed_value=ph,
                    threshold="[6.3, 8.5]",
                    reason="Sub-optimal pH range indicating chemical instability",
                    severity="MEDIUM"
                ))
                reason_codes.append(rc.WQ_EXTREME_PH)

        # 3. Chemical Oxygen Demand (COD) Shock
        if "COD_mg_L" in features:
            cod = float(features["COD_mg_L"])
            if cod >= cfg.get("cod_max", 800.0):
                flags.append(SafetyFlag(
                    parameter="COD_mg_L",
                    observed_value=cod,
                    threshold=f">= {cfg.get('cod_max', 800.0)} mg/L",
                    reason="Severe chemical oxygen demand indicating concentrated chemical or industrial discharge",
                    severity="CRITICAL"
                ))
                reason_codes.append(rc.WQ_HIGH_COD)
            elif cod >= 500.0:
                flags.append(SafetyFlag(
                    parameter="COD_mg_L",
                    observed_value=cod,
                    threshold=">= 500.0 mg/L",
                    reason="Elevated chemical oxygen demand exceeding direct reuse safety margin",
                    severity="HIGH"
                ))
                reason_codes.append(rc.WQ_HIGH_COD)

        # 4. Biochemical Oxygen Demand (BOD) Shock
        if "BOD_mg_L" in features:
            bod = float(features["BOD_mg_L"])
            if bod >= cfg.get("bod_max", 400.0):
                flags.append(SafetyFlag(
                    parameter="BOD_mg_L",
                    observed_value=bod,
                    threshold=f">= {cfg.get('bod_max', 400.0)} mg/L",
                    reason="Severe organic substrate loading causing rapid putrefaction and septicity",
                    severity="CRITICAL"
                ))
                reason_codes.append(rc.WQ_HIGH_BOD)
            elif bod >= 250.0:
                flags.append(SafetyFlag(
                    parameter="BOD_mg_L",
                    observed_value=bod,
                    threshold=">= 250.0 mg/L",
                    reason="Elevated organic loading requiring biological reduction",
                    severity="HIGH"
                ))
                reason_codes.append(rc.WQ_HIGH_BOD)

        # 5. Severe Optical Scattering & Turbidity (TUR_NTU)
        if "TUR_NTU" in features:
            tur = float(features["TUR_NTU"])
            if tur >= cfg.get("tur_max", 140.0):
                flags.append(SafetyFlag(
                    parameter="TUR_NTU",
                    observed_value=tur,
                    threshold=f">= {cfg.get('tur_max', 140.0)} NTU",
                    reason="Severe optical scattering blinding UV disinfection lamps and shielding microbes",
                    severity="CRITICAL"
                ))
                reason_codes.append(rc.WQ_HIGH_TURBIDITY)
            elif tur >= 80.0:
                flags.append(SafetyFlag(
                    parameter="TUR_NTU",
                    observed_value=tur,
                    threshold=">= 80.0 NTU",
                    reason="High turbidity impairing filtration performance",
                    severity="MEDIUM"
                ))
                reason_codes.append(rc.WQ_HIGH_TURBIDITY)

        # 6. Total Suspended Solids (TSS)
        if "TSS_mg_L" in features:
            tss = float(features["TSS_mg_L"])
            if tss >= cfg.get("tss_max", 250.0):
                flags.append(SafetyFlag(
                    parameter="TSS_mg_L",
                    observed_value=tss,
                    threshold=f">= {cfg.get('tss_max', 250.0)} mg/L",
                    reason="Severe particulate burden causing immediate emitter clogging and valve fouling",
                    severity="CRITICAL"
                ))
                reason_codes.append(rc.WQ_HIGH_TSS)

        # 7. Salinity and Total Dissolved Solids
        if "TDS_mg_L" in features:
            tds = float(features["TDS_mg_L"])
            if tds >= cfg.get("tds_max", 800.0):
                flags.append(SafetyFlag(
                    parameter="TDS_mg_L",
                    observed_value=tds,
                    threshold=f">= {cfg.get('tds_max', 800.0)} mg/L",
                    reason="Excessive mineral salinization causing severe osmotic phytotoxicity",
                    severity="HIGH"
                ))
                reason_codes.append(rc.WQ_HIGH_TDS)

        if "SAL_ppt" in features:
            sal = float(features["SAL_ppt"])
            if sal >= cfg.get("sal_max", 0.60):
                flags.append(SafetyFlag(
                    parameter="SAL_ppt",
                    observed_value=sal,
                    threshold=f">= {cfg.get('sal_max', 0.60)} ppt",
                    reason="Severe salinity threshold exceeded",
                    severity="HIGH"
                ))
                reason_codes.append(rc.WQ_HIGH_SALINITY)

        # 8. Anaerobic Septicity Compound Condition (DO < 1.0 mg/L with elevated organics)
        if "DO_mg_L" in features and "BOD_mg_L" in features:
            do = float(features["DO_mg_L"])
            bod = float(features["BOD_mg_L"])
            cod = float(features.get("COD_mg_L", 0.0))
            if do < cfg.get("septic_do_min", 1.0) and (bod >= cfg.get("septic_bod_min", 300.0) or cod >= cfg.get("septic_cod_min", 600.0)):
                flags.append(SafetyFlag(
                    parameter="DO_mg_L + Organics",
                    observed_value=do,
                    threshold="DO < 1.0 mg/L with BOD >= 300 or COD >= 600",
                    reason="Anaerobic septic condition active: severe microbial anoxia and sulfide hazard",
                    severity="CRITICAL"
                ))
                reason_codes.append(rc.WQ_SEPTIC_RISK)

        # Determine aggregate safety status
        severities = [f.severity for f in flags]
        if "CRITICAL" in severities:
            safety_status = SAFETY_CRITICAL
            reason_codes.append(rc.WQ_CRITICAL)
        elif "HIGH" in severities:
            safety_status = SAFETY_HIGH_RISK
        elif "MEDIUM" in severities:
            safety_status = SAFETY_REVIEW_REQUIRED
        else:
            safety_status = SAFETY_SAFE_FOR_MODEL_REVIEW
            reason_codes.append(rc.WQ_ACCEPTABLE)

        # Deduplicate reason codes preserving order
        unique_codes = list(dict.fromkeys(reason_codes))
        return safety_status, flags, unique_codes


def evaluate_safety_conditions(features: Dict[str, Any]) -> Tuple[str, List[Dict[str, Any]], List[str]]:
    """Convenience helper returning serialized flag dictionaries."""
    engine = WaterQualitySafetyEngine()
    status, flags, codes = engine.evaluate_safety(features)
    return status, [f.to_dict() for f in flags], codes
