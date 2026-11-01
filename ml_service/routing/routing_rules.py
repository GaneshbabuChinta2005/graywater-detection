"""
Routing Rules Configuration and Multi-Tier Decision Engine.
Implements scientifically grounded hierarchical classification for greywater reuse routing:
  - Class 0: Sewer Bypass (Emergency / High-Risk / Severe Contamination)
  - Class 1: Bio-filtration (Treatment Pathway Required)
  - Class 2: Restricted Irrigation (Moderate Quality Initial Routing)
  - Class 3: Indoor Reuse (Low-Risk Influent Suitable for Package Treatment Train)

Threshold sources:
  - US EPA Guidelines for Water Reuse (EPA 625/R-04/108 & EPA/600/R-12/618)
  - WHO Guidelines for Safe Use of Wastewater, Excreta and Greywater (2006, Vol 4)
  - ISO 16075-1 / ISO 16075-2 (Treated Wastewater Use for Irrigation Projects)
  - NSF/ANSI Standard 350 (Onsite Residential & Commercial Water Reuse Treatment Systems)
  - FAO Irrigation and Drainage Paper 29
"""

from typing import Dict, Any, Tuple, List, Optional
import pandas as pd
import numpy as np


# Routing Class Constants
CLASS_SEWER_BYPASS = 0
CLASS_BIO_FILTRATION = 1
CLASS_RESTRICTED_IRRIGATION = 2
CLASS_INDOOR_REUSE = 3

CLASS_NAMES = {
    CLASS_SEWER_BYPASS: "Sewer Bypass",
    CLASS_BIO_FILTRATION: "Bio-filtration",
    CLASS_RESTRICTED_IRRIGATION: "Restricted Irrigation",
    CLASS_INDOOR_REUSE: "Indoor Reuse"
}


# Default Baseline Scientific Thresholds
DEFAULT_THRESHOLDS = {
    # Step 1 & 2: Safety Screening & Severe Contamination (Class 0: Sewer Bypass)
    "sewer_bypass": {
        "ph_min": 6.0,
        "ph_max": 9.0,
        "bod_max": 400.0,       # mg/L - NSF 350 / Wastewater Eng
        "cod_max": 800.0,       # mg/L - Severe chemical oxygen demand
        "tss_max": 250.0,       # mg/L - Severe particulate clogging
        "tur_max": 140.0,       # NTU  - Severe optical scattering
        "ecoli_max": 500000.0,  # CFU/100mL - Extreme pathogen hazard (WHO 2006)
        "tds_max": 800.0,       # mg/L - Severe salinization risk (ISO 16075)
        "sal_max": 0.60,        # ppt  - Severe phytotoxicity threshold (FAO 29)
        "septic_do_min": 1.0,   # mg/L - Anaerobic boundary condition
        "septic_bod_min": 300.0,# mg/L - Organics causing septicity when DO < 1.0
        "septic_cod_min": 600.0 # mg/L - COD causing septicity when DO < 1.0
    },
    # Step 3: High Load / Bio-filtration Requirement (Class 1: Bio-filtration)
    "bio_filtration": {
        "bod_max": 120.0,       # mg/L - Requires biological oxidation (WHO / EPA)
        "cod_max": 300.0,       # mg/L - Elevated surfactants / chemicals
        "tss_max": 90.0,        # mg/L - Requires physical sand / wetland bed
        "tur_max": 60.0,        # NTU  - Exceeds direct irrigation clarity
        "ecoli_max": 75000.0,   # CFU/100mL - Requires constructed wetland attenuation
        "do_min": 2.0           # mg/L - Depleted oxygen requiring aeration
    },
    # Step 4: Strict Low-Risk Criteria (Class 3: Indoor Reuse)
    "indoor_reuse": {
        "bod_max": 45.0,        # mg/L - NSF 350 Class R Influent Criteria
        "cod_max": 125.0,       # mg/L - Low chemical demand for indoor package
        "tss_max": 45.0,        # mg/L - Low solids for microfiltration
        "tur_max": 25.0,        # NTU  - Allows reliable disinfection (EPA 2012)
        "ecoli_max": 20000.0,   # CFU/100mL - Manageable for multi-barrier disinfection
        "tds_max": 300.0,       # mg/L - Low mineral scale for plumbing
        "sal_max": 0.28,        # ppt  - Low salinity
        "do_min": 3.5,          # mg/L - Fresh aerobic status
        "ph_min": 6.5,
        "ph_max": 8.0
    }
}


def evaluate_routing(
    data: Dict[str, Any],
    thresholds: Optional[Dict[str, Any]] = None
) -> Tuple[int, str, str, str, str, str]:
    """
    Evaluates a single greywater sample against hierarchical multi-tier routing rules.

    Parameters:
        data: Dictionary or pandas Series containing water quality measurements.
        thresholds: Optional custom threshold dictionary. Defaults to DEFAULT_THRESHOLDS.

    Returns:
        tuple containing:
          - routing_class (int): 0, 1, 2, or 3
          - routing_class_name (str): 'Sewer Bypass', 'Bio-filtration', 'Restricted Irrigation', 'Indoor Reuse'
          - primary_reason (str): High-level operational explanation
          - triggered_parameters (str): Comma-separated list of triggered parameter conditions
          - treatment_required (str): Treatment mandate
          - safety_flag (str): Safety status flag
    """
    cfg = thresholds if thresholds is not None else DEFAULT_THRESHOLDS
    sewer_cfg = cfg["sewer_bypass"]
    bio_cfg = cfg["bio_filtration"]
    indoor_cfg = cfg["indoor_reuse"]

    # Extract required parameters with defensive validation
    try:
        ph = float(data["pH"])
        temp = float(data.get("TEMP_C", 25.0))
        sal = float(data["SAL_ppt"])
        tur = float(data["TUR_NTU"])
        tds = float(data["TDS_mg_L"])
        tss = float(data["TSS_mg_L"])
        do = float(data["DO_mg_L"])
        bod = float(data["BOD_mg_L"])
        cod = float(data["COD_mg_L"])
        ecoli = float(data["E_coli_CFU_100mL"])
    except (KeyError, TypeError, ValueError) as err:
        return (
            CLASS_SEWER_BYPASS,
            CLASS_NAMES[CLASS_SEWER_BYPASS],
            f"Input Validation Failure: {str(err)}",
            "Missing_or_Invalid_Parameters",
            "Bypass Sewer Immediately",
            "Safety Failsafe: Corrupt Data"
        )

    # ---------------------------------------------------------
    # STEP 1 & 2: Safety Screening & Severe Contamination Detection
    # Priority: Highest (Fail-Safe to Sewer Bypass)
    # ---------------------------------------------------------
    severe_triggers: List[str] = []

    if ph < sewer_cfg["ph_min"] or ph > sewer_cfg["ph_max"]:
        severe_triggers.append(f"pH_extreme({ph:.2f})")
    if bod > sewer_cfg["bod_max"]:
        severe_triggers.append(f"BOD_severe({bod:.1f}mg/L)")
    if cod > sewer_cfg["cod_max"]:
        severe_triggers.append(f"COD_severe({cod:.1f}mg/L)")
    if tss > sewer_cfg["tss_max"]:
        severe_triggers.append(f"TSS_severe({tss:.1f}mg/L)")
    if tur > sewer_cfg["tur_max"]:
        severe_triggers.append(f"TUR_severe({tur:.1f}NTU)")
    if ecoli > sewer_cfg["ecoli_max"]:
        severe_triggers.append(f"E_coli_severe({int(ecoli)}CFU)")
    if tds > sewer_cfg["tds_max"]:
        severe_triggers.append(f"TDS_severe({tds:.1f}mg/L)")
    if sal > sewer_cfg["sal_max"]:
        severe_triggers.append(f"SAL_severe({sal:.2f}ppt)")
    if do < sewer_cfg["septic_do_min"] and (bod > sewer_cfg["septic_bod_min"] or cod > sewer_cfg["septic_cod_min"]):
        severe_triggers.append(f"Septic_Anoxic(DO={do:.2f},BOD={bod:.1f},COD={cod:.1f})")

    if severe_triggers:
        return (
            CLASS_SEWER_BYPASS,
            CLASS_NAMES[CLASS_SEWER_BYPASS],
            "Severe Contamination / Environmental Hazard",
            ", ".join(severe_triggers),
            "No Treatment Viable - Direct Sewer Bypass",
            "Critical Hazard Failsafe"
        )

    # ---------------------------------------------------------
    # STEP 3: Treatment Requirement Assessment (Bio-filtration)
    # Priority: High (Requires dedicated biological/physical processing)
    # ---------------------------------------------------------
    bio_triggers: List[str] = []

    if bod > bio_cfg["bod_max"]:
        bio_triggers.append(f"BOD_elevated({bod:.1f}mg/L)")
    if cod > bio_cfg["cod_max"]:
        bio_triggers.append(f"COD_elevated({cod:.1f}mg/L)")
    if tss > bio_cfg["tss_max"]:
        bio_triggers.append(f"TSS_elevated({tss:.1f}mg/L)")
    if tur > bio_cfg["tur_max"]:
        bio_triggers.append(f"TUR_elevated({tur:.1f}NTU)")
    if ecoli > bio_cfg["ecoli_max"]:
        bio_triggers.append(f"E_coli_elevated({int(ecoli)}CFU)")
    if do < bio_cfg["do_min"]:
        bio_triggers.append(f"DO_depleted({do:.2f}mg/L)")

    if bio_triggers:
        return (
            CLASS_BIO_FILTRATION,
            CLASS_NAMES[CLASS_BIO_FILTRATION],
            "Elevated Organic / Particulate / Biological Load",
            ", ".join(bio_triggers),
            "Biological Oxidation & Sand Bio-filtration Required",
            "Treatment Pathway Mandated"
        )

    # ---------------------------------------------------------
    # STEP 4: Potential Reuse Destination Assessment
    # Branch A: Evaluate eligibility for Indoor Reuse (Lowest Risk Influent)
    # ---------------------------------------------------------
    indoor_disqualifiers: List[str] = []

    if bod > indoor_cfg["bod_max"]:
        indoor_disqualifiers.append(f"BOD_exceeds_indoor({bod:.1f}mg/L)")
    if cod > indoor_cfg["cod_max"]:
        indoor_disqualifiers.append(f"COD_exceeds_indoor({cod:.1f}mg/L)")
    if tss > indoor_cfg["tss_max"]:
        indoor_disqualifiers.append(f"TSS_exceeds_indoor({tss:.1f}mg/L)")
    if tur > indoor_cfg["tur_max"]:
        indoor_disqualifiers.append(f"TUR_exceeds_indoor({tur:.1f}NTU)")
    if ecoli > indoor_cfg["ecoli_max"]:
        indoor_disqualifiers.append(f"E_coli_exceeds_indoor({int(ecoli)}CFU)")
    if tds > indoor_cfg["tds_max"]:
        indoor_disqualifiers.append(f"TDS_exceeds_indoor({tds:.1f}mg/L)")
    if sal > indoor_cfg["sal_max"]:
        indoor_disqualifiers.append(f"SAL_exceeds_indoor({sal:.2f}ppt)")
    if do < indoor_cfg["do_min"]:
        indoor_disqualifiers.append(f"DO_low_for_indoor({do:.2f}mg/L)")
    if ph < indoor_cfg["ph_min"] or ph > indoor_cfg["ph_max"]:
        indoor_disqualifiers.append(f"pH_outside_indoor({ph:.2f})")

    if not indoor_disqualifiers:
        return (
            CLASS_INDOOR_REUSE,
            CLASS_NAMES[CLASS_INDOOR_REUSE],
            "Low-Risk Domestic Influent Suitable for Indoor Non-Potable Package Train",
            "All parameters compliant with Indoor Reuse Influent Envelope",
            "Onsite Package Microfiltration & Chlorination/UV Disinfection Required",
            "Low-Risk Non-Potable Reuse"
        )

    # ---------------------------------------------------------
    # Branch B: Default to Restricted Irrigation
    # ---------------------------------------------------------
    return (
        CLASS_RESTRICTED_IRRIGATION,
        CLASS_NAMES[CLASS_RESTRICTED_IRRIGATION],
        "Moderate Water Quality Profile Suitable for Restricted Irrigation",
        ", ".join(indoor_disqualifiers),
        "Secondary Settling / Disc Filtration & Drip Irrigation Barrier Required",
        "Restricted Non-Potable Landscape Irrigation"
    )


def apply_routing_to_dataframe(
    df: pd.DataFrame,
    thresholds: Optional[Dict[str, Any]] = None
) -> pd.DataFrame:
    """
    Applies the routing decision framework across an entire pandas DataFrame.
    Returns a copy of the dataframe with added decision columns:
      - Routing_Class
      - Routing_Class_Name
      - Primary_Routing_Reason
      - Triggered_Parameters
      - Treatment_Required
      - Safety_Flag
    """
    out_df = df.copy()
    results = [evaluate_routing(row, thresholds=thresholds) for _, row in out_df.iterrows()]
    
    out_df["Routing_Class"] = [r[0] for r in results]
    out_df["Routing_Class_Name"] = [r[1] for r in results]
    out_df["Primary_Routing_Reason"] = [r[2] for r in results]
    out_df["Triggered_Parameters"] = [r[3] for r in results]
    out_df["Treatment_Required"] = [r[4] for r in results]
    out_df["Safety_Flag"] = [r[5] for r in results]
    
    return out_df
