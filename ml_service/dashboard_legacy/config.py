"""
Dashboard Configuration and Styling Constants
AI-Driven Intelligent Greywater Management and Smart Reuse Routing System
"""

import os

# App Information
APP_TITLE = "Greywater Intelligent Management System"
APP_SUBTITLE = "AI-Driven Monitoring, Decision Support and Smart Reuse Routing"
APP_VERSION = "1.0.0 (Phase 13 Prototype)"

# Navigation Pages
PAGE_DASHBOARD = "Dashboard"
PAGE_LIVE_MONITORING = "Live Monitoring"
PAGE_WATER_QUALITY = "Water Quality"
PAGE_SMART_ROUTING = "Smart Routing"
PAGE_STORAGE_TANK = "Storage Tank"
PAGE_WEATHER_CONTEXT = "Weather Context"
PAGE_ANOMALY_DETECTION = "Anomaly Detection"
PAGE_AI_EXPLAINABILITY = "AI Explainability"
PAGE_REPORTS = "Reports"
PAGE_SYSTEM_INFO = "System Information"

PAGES = [
    PAGE_DASHBOARD,
    PAGE_LIVE_MONITORING,
    PAGE_WATER_QUALITY,
    PAGE_SMART_ROUTING,
    PAGE_STORAGE_TANK,
    PAGE_WEATHER_CONTEXT,
    PAGE_ANOMALY_DETECTION,
    PAGE_AI_EXPLAINABILITY,
    PAGE_REPORTS,
    PAGE_SYSTEM_INFO
]

# Color Palettes
COLOR_SEWER_BYPASS = "#d9534f"       # Danger Red
COLOR_BIO_FILTRATION = "#f0ad4e"     # Amber / Gold
COLOR_RESTRICTED_IRRIGATION = "#0275d8" # Sky / Navy Blue
COLOR_INDOOR_REUSE = "#5cb85c"       # Emerald Green

ROUTE_COLORS = {
    "Sewer Bypass": COLOR_SEWER_BYPASS,
    "Bio-filtration": COLOR_BIO_FILTRATION,
    "Restricted Irrigation": COLOR_RESTRICTED_IRRIGATION,
    "Indoor Reuse": COLOR_INDOOR_REUSE
}

# Semantic Status Labels & Colors
STATUS_NORMAL = "NORMAL"
STATUS_ELEVATED = "ELEVATED"
STATUS_REVIEW = "REVIEW"
STATUS_HIGH = "HIGH"
STATUS_CRITICAL = "CRITICAL"

STATUS_COLORS = {
    STATUS_NORMAL: "#28a745",
    STATUS_ELEVATED: "#17a2b8",
    STATUS_REVIEW: "#ffc107",
    STATUS_HIGH: "#fd7e14",
    STATUS_CRITICAL: "#dc3545"
}

# Water Quality Groupings
WQ_PHYSICAL_PARAMS = [
    {"name": "TEMP_C", "label": "Temperature (°C)", "min": 10.0, "max": 45.0, "normal_max": 35.0},
    {"name": "TUR_NTU", "label": "Turbidity (NTU)", "min": 0.0, "max": 200.0, "normal_max": 40.0, "review_max": 80.0},
    {"name": "TSS_mg_L", "label": "TSS (mg/L)", "min": 0.0, "max": 350.0, "normal_max": 50.0, "review_max": 120.0},
    {"name": "TDS_mg_L", "label": "TDS (mg/L)", "min": 0.0, "max": 1200.0, "normal_max": 500.0, "review_max": 800.0},
    {"name": "DS_mg_L", "label": "Dissolved Solids (mg/L)", "min": 0.0, "max": 1000.0, "normal_max": 450.0},
    {"name": "COND_uS_cm", "label": "Conductivity (µS/cm)", "min": 100.0, "max": 1500.0, "normal_max": 800.0},
    {"name": "SAL_ppt", "label": "Salinity (ppt)", "min": 0.0, "max": 1.5, "normal_max": 0.4, "review_max": 0.6}
]

WQ_CHEMICAL_PARAMS = [
    {"name": "pH", "label": "pH", "min": 4.0, "max": 11.0, "normal_min": 6.5, "normal_max": 8.5},
    {"name": "DO_mg_L", "label": "Dissolved Oxygen (mg/L)", "min": 0.0, "max": 10.0, "normal_min": 3.0, "critical_min": 1.0},
    {"name": "BOD_mg_L", "label": "BOD (mg/L)", "min": 0.0, "max": 600.0, "normal_max": 40.0, "review_max": 120.0},
    {"name": "COD_mg_L", "label": "COD (mg/L)", "min": 0.0, "max": 1200.0, "normal_max": 100.0, "review_max": 300.0},
    {"name": "NH4F_mg_L", "label": "Ammonium/Fluoride (mg/L)", "min": 0.0, "max": 30.0, "normal_max": 10.0},
    {"name": "NO3_mg_L", "label": "Nitrate (mg/L)", "min": 0.0, "max": 25.0, "normal_max": 10.0},
    {"name": "K_mg_L", "label": "Potassium (mg/L)", "min": 0.0, "max": 40.0, "normal_max": 20.0}
]

WQ_MICRO_PARAMS = [
    {"name": "E_coli_CFU_100mL", "label": "E. coli (CFU/100mL)", "min": 0.0, "max": 1000000.0, "normal_max": 2000.0, "review_max": 75000.0, "critical_max": 500000.0}
]

# Paths
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
DATA_DIR = os.path.join(PROJECT_ROOT, "dataset", "processed")
MODELS_DIR = os.path.join(PROJECT_ROOT, "models")
REPORTS_DIR = os.path.join(PROJECT_ROOT, "reports")
SIMULATION_DIR = os.path.join(PROJECT_ROOT, "simulation", "data")
STYLES_DIR = os.path.join(os.path.dirname(__file__), "styles")
