"""
Weather and Environmental Context Configuration
AI-Driven Intelligent Greywater Management and Smart Reuse Routing System

Manages environment variable acquisition, geographic coordinates, weather thresholds,
API timeouts, cache settings, and default offline fallback profiles.
"""

import os

# Geographic Location Configuration (Defaults to neutral urban municipal coordinates)
WEATHER_LATITUDE = float(os.getenv("WEATHER_LATITUDE", "34.0522"))
WEATHER_LONGITUDE = float(os.getenv("WEATHER_LONGITUDE", "-118.2437"))
WEATHER_CITY = os.getenv("WEATHER_CITY", "Metropolitan District")

# API Configuration (API key is strictly acquired via environment variable, never hardcoded)
WEATHER_API_KEY = os.getenv("WEATHER_API_KEY", "")
WEATHER_PROVIDER = os.getenv("WEATHER_PROVIDER", "open-meteo")  # "open-meteo", "openweathermap", "offline"
WEATHER_OFFLINE_MODE = os.getenv("WEATHER_OFFLINE_MODE", "false").lower() in ("true", "1", "yes")

# Networking and Cache Performance
WEATHER_API_TIMEOUT_SEC = int(os.getenv("WEATHER_API_TIMEOUT_SEC", "5"))
WEATHER_CACHE_TTL_SEC = int(os.getenv("WEATHER_CACHE_TTL_SEC", "900"))  # 15 minutes default cache
WEATHER_MAX_RETRIES = int(os.getenv("WEATHER_MAX_RETRIES", "2"))


class WeatherConfig:
    """Convenience encapsulation for weather subsystem configuration."""
    LATITUDE = WEATHER_LATITUDE
    LONGITUDE = WEATHER_LONGITUDE
    CITY = WEATHER_CITY
    API_KEY = WEATHER_API_KEY
    PROVIDER = WEATHER_PROVIDER
    OFFLINE_MODE = WEATHER_OFFLINE_MODE
    API_TIMEOUT_SEC = WEATHER_API_TIMEOUT_SEC
    CACHE_TTL_SEC = WEATHER_CACHE_TTL_SEC
    MAX_RETRIES = WEATHER_MAX_RETRIES

# Operational Irrigation & Environmental Thresholds
HIGH_RAINFALL_THRESHOLD_MM = 5.0          # Inflow precipitation >= 5mm suppresses irrigation
HIGH_PRECIP_PROBABILITY_THRESHOLD = 50.0  # Forecast precip probability >= 50% defers irrigation
FREEZING_TEMP_THRESHOLD_C = 3.0           # Ground freeze risk below 3 deg C
HIGH_HEAT_EVAPORATION_THRESHOLD_C = 35.0  # Elevated evaporative demand above 35 deg C
TORRENTIAL_WASHOUT_RAIN_MM = 25.0         # Risk of outdoor bio-filter gravel bed hydraulic washout

# Predefined Offline Demo Weather Profiles
OFFLINE_DEMO_PROFILES = {
    "dry_clear": {
        "temperature_C": 24.5,
        "humidity_percent": 42.0,
        "rainfall_mm": 0.0,
        "precipitation_probability": 5.0,
        "weather_condition": "Clear / Sunny",
        "wind_speed_kmh": 8.5,
        "forecast_horizon_hours": 24
    },
    "heavy_rain": {
        "temperature_C": 18.0,
        "humidity_percent": 92.0,
        "rainfall_mm": 14.5,
        "precipitation_probability": 85.0,
        "weather_condition": "Heavy Rain / Thunderstorm",
        "wind_speed_kmh": 24.0,
        "forecast_horizon_hours": 24
    },
    "light_shower": {
        "temperature_C": 20.0,
        "humidity_percent": 75.0,
        "rainfall_mm": 2.5,
        "precipitation_probability": 40.0,
        "weather_condition": "Passing Light Showers",
        "wind_speed_kmh": 12.0,
        "forecast_horizon_hours": 24
    },
    "freezing_cold": {
        "temperature_C": -1.5,
        "humidity_percent": 65.0,
        "rainfall_mm": 0.0,
        "precipitation_probability": 10.0,
        "weather_condition": "Freezing Overcast",
        "wind_speed_kmh": 15.0,
        "forecast_horizon_hours": 24
    }
}
