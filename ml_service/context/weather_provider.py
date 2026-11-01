"""
Modular Weather Provider Interface and Normalization
AI-Driven Intelligent Greywater Management and Smart Reuse Routing System

Fetches and normalizes live public weather observations or serves robust offline
fallback profiles when network connectivity or API services are unavailable.
"""

from abc import ABC, abstractmethod
from datetime import datetime, timezone
import requests
import json
import numpy as np

from context.config import (
    WEATHER_LATITUDE,
    WEATHER_LONGITUDE,
    WEATHER_CITY,
    WEATHER_API_KEY,
    WEATHER_PROVIDER,
    WEATHER_OFFLINE_MODE,
    WEATHER_API_TIMEOUT_SEC,
    WEATHER_MAX_RETRIES,
    OFFLINE_DEMO_PROFILES
)
from context.weather_cache import WeatherCache
from typing import TypedDict, Optional


class NormalizedWeatherData(TypedDict, total=False):
    timestamp: str
    location: str
    temperature_C: float
    humidity_percent: float
    rainfall_mm: float
    precipitation_probability: float
    weather_condition: str
    wind_speed_kmh: float
    forecast_horizon_hours: int
    weather_status: str
    provider: str
    error_reason: Optional[str]


class BaseWeatherProvider(ABC):
    """Abstract base class for all weather telemetry providers."""
    
    @abstractmethod
    def get_current_weather(self):
        """Fetch current normalized weather telemetry."""
        pass
        
    @abstractmethod
    def get_forecast(self, hours=24):
        """Fetch forward-looking forecast data."""
        pass
        
    @abstractmethod
    def normalize_weather_data(self, raw_data):
        """Convert provider-specific payload into canonical schema."""
        pass


def validate_normalized_weather(data):
    """
    Validate that normalized weather data complies with physical bounds and schema.
    
    Raises
    ------
    ValueError if any variable is out of range or malformed.
    """
    if not isinstance(data, dict):
        raise TypeError("Normalized weather data must be a dictionary.")
        
    required_keys = [
        "timestamp", "location", "temperature_C", "humidity_percent",
        "rainfall_mm", "precipitation_probability", "weather_condition"
    ]
    missing = [k for k in required_keys if k not in data]
    if missing:
        raise ValueError(f"Weather record missing required keys: {missing}")
        
    # Check numeric types
    for num_key in ["temperature_C", "humidity_percent", "rainfall_mm", "precipitation_probability"]:
        if not isinstance(data[num_key], (int, float)):
            raise TypeError(f"Field '{num_key}' must be numeric, got {type(data[num_key])}")
            
    # Range validations
    if not (0.0 <= data["precipitation_probability"] <= 100.0):
        raise ValueError(f"Precipitation probability must be in [0, 100], got {data['precipitation_probability']}")
        
    if data["rainfall_mm"] < 0.0:
        raise ValueError(f"Rainfall cannot be negative, got {data['rainfall_mm']}")
        
    if not (0.0 <= data["humidity_percent"] <= 100.0):
        raise ValueError(f"Humidity must be in [0, 100], got {data['humidity_percent']}")
        
    return True


class OfflineWeatherProvider(BaseWeatherProvider):
    """
    Deterministic offline provider supplying pre-configured meteorological scenarios
    for air-gapped environments, testing, and offline demos.
    """
    def __init__(self, profile_name="dry_clear", city=WEATHER_CITY):
        self.profile_name = profile_name
        self.city = city

    def set_profile(self, profile_name):
        if profile_name not in OFFLINE_DEMO_PROFILES:
            raise ValueError(f"Unknown offline profile: {profile_name}. Available: {list(OFFLINE_DEMO_PROFILES.keys())}")
        self.profile_name = profile_name

    def get_current_weather(self):
        raw = OFFLINE_DEMO_PROFILES[self.profile_name]
        return self.normalize_weather_data(raw)

    def get_forecast(self, hours=24):
        return self.get_current_weather()

    def normalize_weather_data(self, raw_data):
        now_str = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC")
        norm = {
            "timestamp": now_str,
            "location": self.city,
            "temperature_C": float(raw_data["temperature_C"]),
            "humidity_percent": float(raw_data["humidity_percent"]),
            "rainfall_mm": float(raw_data["rainfall_mm"]),
            "precipitation_probability": float(raw_data["precipitation_probability"]),
            "weather_condition": str(raw_data["weather_condition"]),
            "wind_speed_kmh": float(raw_data.get("wind_speed_kmh", 10.0)),
            "forecast_horizon_hours": int(raw_data.get("forecast_horizon_hours", 24)),
            "weather_status": "OFFLINE_FALLBACK",
            "provider": "offline_simulator"
        }
        validate_normalized_weather(norm)
        return norm


class OpenMeteoWeatherProvider(BaseWeatherProvider):
    """
    Live public weather provider utilizing the free Open-Meteo REST API.
    Does not require private API keys, eliminating key leakage risks.
    """
    def __init__(
        self,
        latitude=WEATHER_LATITUDE,
        longitude=WEATHER_LONGITUDE,
        city=WEATHER_CITY,
        timeout_sec=WEATHER_API_TIMEOUT_SEC
    ):
        self.latitude = latitude
        self.longitude = longitude
        self.city = city
        self.timeout_sec = timeout_sec
        self.base_url = "https://api.open-meteo.com/v1/forecast"

    def get_current_weather(self):
        params = {
            "latitude": self.latitude,
            "longitude": self.longitude,
            "current": "temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m",
            "hourly": "precipitation_probability",
            "forecast_days": 1,
            "timezone": "auto"
        }
        resp = requests.get(self.base_url, params=params, timeout=self.timeout_sec)
        resp.raise_for_status()
        raw = resp.json()
        return self.normalize_weather_data(raw)

    def get_forecast(self, hours=24):
        return self.get_current_weather()

    def normalize_weather_data(self, raw_data):
        current = raw_data.get("current", {})
        hourly = raw_data.get("hourly", {})
        
        # Determine precipitation probability from forward hours
        hourly_probs = hourly.get("precipitation_probability", [0.0])
        max_prob = float(np.max(hourly_probs[:12])) if len(hourly_probs) > 0 else 0.0
        
        temp_c = float(current.get("temperature_2m", 22.0))
        hum = float(current.get("relative_humidity_2m", 50.0))
        rain_mm = float(current.get("precipitation", 0.0))
        wind_kmh = float(current.get("wind_speed_10m", 5.0))
        wmo_code = int(current.get("weather_code", 0))
        
        # WMO Weather interpretation code
        condition = "Clear / Sunny"
        if wmo_code in [1, 2, 3]:
            condition = "Partly Cloudy / Overcast"
        elif wmo_code in [51, 53, 55, 61, 63, 65]:
            condition = "Rain Showers"
        elif wmo_code in [71, 73, 75]:
            condition = "Snow / Sleet"
        elif wmo_code >= 80:
            condition = "Heavy Rain / Thunderstorm"
            
        norm = {
            "timestamp": datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC"),
            "location": self.city,
            "temperature_C": round(temp_c, 1),
            "humidity_percent": round(hum, 1),
            "rainfall_mm": round(max(0.0, rain_mm), 2),
            "precipitation_probability": round(float(np.clip(max_prob, 0.0, 100.0)), 1),
            "weather_condition": condition,
            "wind_speed_kmh": round(wind_kmh, 1),
            "forecast_horizon_hours": 24,
            "weather_status": "LIVE",
            "provider": "open_meteo_live"
        }
        validate_normalized_weather(norm)
        return norm


class ModularWeatherProvider:
    """
    High-level weather provider integrating live queries, caching, error resilience,
    and automatic offline fallback.
    """
    def __init__(
        self,
        offline_mode=WEATHER_OFFLINE_MODE,
        offline_profile="dry_clear",
        cache=None
    ):
        self.offline_mode = offline_mode
        self.offline_provider = OfflineWeatherProvider(profile_name=offline_profile)
        self.live_provider = OpenMeteoWeatherProvider()
        self.cache = cache if cache is not None else WeatherCache()

    def get_weather(self, force_refresh=False):
        """
        Retrieve normalized weather.
        Checks cache -> attempts live API if not in offline mode -> falls back cleanly on error.
        
        Returns
        -------
        dict
            Normalized weather record guaranteed to have valid schema and 'weather_status'.
        """
        # Check cache
        if not force_refresh:
            cached = self.cache.get("current_weather")
            if cached is not None:
                return cached
                
        # If explicitly offline mode
        if self.offline_mode:
            data = self.offline_provider.get_current_weather()
            self.cache.set("current_weather", data)
            return data
            
        # Attempt live API
        try:
            data = self.live_provider.get_current_weather()
            self.cache.set("current_weather", data)
            return data
        except Exception as e:
            # On failure: do not crash. Return structured fallback with status
            fallback = self.offline_provider.get_current_weather()
            fallback["weather_status"] = "UNAVAILABLE"
            fallback["error_reason"] = f"Live weather API failure: {str(e)[:80]}. Defaulting to safe offline fallback."
            self.cache.set("current_weather", fallback, ttl_sec=60) # Short retry TTL on error
            return fallback


def get_current_weather(offline_profile="dry_clear"):
    """Functional wrapper for easy system access."""
    provider = ModularWeatherProvider(offline_profile=offline_profile)
    return provider.get_weather()
