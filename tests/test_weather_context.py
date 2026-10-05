"""
Unit Tests for Weather Telemetry, Environmental Context, and Routing Arbitration
AI-Driven Intelligent Greywater Management and Smart Reuse Routing System

Test Suite covers:
1. Valid weather response
2. Invalid API response
3. API timeout
4. API unavailable
5. High rainfall
6. Low rainfall
7. High precipitation probability
8. Indoor reuse with rain
9. Irrigation with rain
10. Sewer bypass with favorable weather
11. Missing weather field
12. Invalid probability
13. Cache behavior
"""

import time
import pytest
from unittest.mock import patch, MagicMock
import requests

from context.config import (
    HIGH_RAINFALL_THRESHOLD_MM,
    HIGH_PRECIP_PROBABILITY_THRESHOLD,
    FREEZING_TEMP_THRESHOLD_C,
    OFFLINE_DEMO_PROFILES
)
from context.weather_cache import WeatherCache
from context.weather_provider import (
    BaseWeatherProvider,
    OfflineWeatherProvider,
    OpenMeteoWeatherProvider,
    ModularWeatherProvider,
    validate_normalized_weather
)
from context.weather_context import (
    evaluate_weather_context,
    WeatherStatus,
    WeatherAdjustment,
    FinalContextRecommendation
)


# =============================================================================
# 1. Valid Weather Response
# =============================================================================
def test_valid_weather_response():
    """Verify that a valid normalized weather record complies with all schema rules."""
    provider = OfflineWeatherProvider(profile_name="dry_clear")
    data = provider.get_current_weather()
    
    assert validate_normalized_weather(data) is True
    assert "timestamp" in data
    assert "location" in data
    assert isinstance(data["temperature_C"], (int, float))
    assert isinstance(data["humidity_percent"], (int, float))
    assert isinstance(data["rainfall_mm"], (int, float))
    assert isinstance(data["precipitation_probability"], (int, float))
    assert isinstance(data["weather_condition"], str)
    assert data["rainfall_mm"] >= 0.0
    assert 0.0 <= data["humidity_percent"] <= 100.0
    assert 0.0 <= data["precipitation_probability"] <= 100.0


# =============================================================================
# 2. Invalid API Response
# =============================================================================
def test_invalid_api_response():
    """Verify that malformed or non-dictionary API data raises appropriate validation errors."""
    with pytest.raises(TypeError, match="must be a dictionary"):
        validate_normalized_weather("not a dictionary")

    # Non-numeric temperature
    invalid_data = {
        "timestamp": "2026-10-02 12:00:00 UTC",
        "location": "TestCity",
        "temperature_C": "hot",
        "humidity_percent": 50.0,
        "rainfall_mm": 0.0,
        "precipitation_probability": 10.0,
        "weather_condition": "Clear"
    }
    with pytest.raises(TypeError, match="must be numeric"):
        validate_normalized_weather(invalid_data)


# =============================================================================
# 3. API Timeout
# =============================================================================
def test_api_timeout():
    """Verify that network timeout falls back gracefully without raising an exception."""
    with patch("requests.get", side_effect=requests.exceptions.Timeout("Connection timed out")):
        provider = ModularWeatherProvider(offline_mode=False)
        data = provider.get_weather(force_refresh=True)
        
        assert data is not None
        assert data["weather_status"] == WeatherStatus.UNAVAILABLE
        assert "failure" in data["error_reason"].lower() or "timeout" in data["error_reason"].lower()


# =============================================================================
# 4. API Unavailable
# =============================================================================
def test_api_unavailable():
    """Verify system safety behavior when the weather API is completely unavailable."""
    with patch("requests.get", side_effect=requests.exceptions.ConnectionError("DNS failure")):
        provider = ModularWeatherProvider(offline_mode=False)
        data = provider.get_weather(force_refresh=True)
        
        assert data["weather_status"] == WeatherStatus.UNAVAILABLE
        
        # When evaluating against unavailable weather, pipeline should flag advisory review but not crash
        res = evaluate_weather_context(initial_route="Restricted Irrigation", weather_data=data)
        assert res["weather_status"] == WeatherStatus.UNAVAILABLE
        assert res["final_context_recommendation"] == FinalContextRecommendation.REVIEW_REQUIRED
        assert "UNAVAILABLE" in res["reason"]


# =============================================================================
# 5. High Rainfall
# =============================================================================
def test_high_rainfall():
    """Verify that rainfall above threshold suppresses irrigation to prevent runoff ponding."""
    weather = {
        "timestamp": "2026-10-02 12:00:00 UTC",
        "location": "Metropolitan District",
        "temperature_C": 20.0,
        "humidity_percent": 90.0,
        "rainfall_mm": 12.0,  # Well above 5.0 mm threshold
        "precipitation_probability": 80.0,
        "weather_condition": "Heavy Rain",
        "weather_status": WeatherStatus.FAVORABLE
    }
    res = evaluate_weather_context(initial_route="Restricted Irrigation", weather_data=weather)
    assert res["weather_status"] == WeatherStatus.UNFAVORABLE
    assert res["final_context_recommendation"] == FinalContextRecommendation.STORE_FOR_LATER
    assert res["weather_adjustment"] == WeatherAdjustment.SUPPRESS_IRRIGATION


# =============================================================================
# 6. Low Rainfall
# =============================================================================
def test_low_rainfall():
    """Verify that dry, favorable weather permits restricted irrigation without suppression."""
    weather = {
        "timestamp": "2026-10-02 12:00:00 UTC",
        "location": "Metropolitan District",
        "temperature_C": 24.0,
        "humidity_percent": 40.0,
        "rainfall_mm": 0.0,
        "precipitation_probability": 10.0,
        "weather_condition": "Clear / Sunny",
        "weather_status": WeatherStatus.FAVORABLE
    }
    res = evaluate_weather_context(initial_route="Restricted Irrigation", weather_data=weather)
    assert res["weather_status"] == WeatherStatus.FAVORABLE
    assert res["final_context_recommendation"] == FinalContextRecommendation.ALLOW_ROUTE
    assert res["weather_adjustment"] == WeatherAdjustment.NONE


# =============================================================================
# 7. High Precipitation Probability
# =============================================================================
def test_high_precipitation_probability():
    """Verify that even with 0mm current rain, high precipitation probability defers irrigation."""
    weather = {
        "timestamp": "2026-10-02 12:00:00 UTC",
        "location": "Metropolitan District",
        "temperature_C": 21.0,
        "humidity_percent": 80.0,
        "rainfall_mm": 0.5,  # Low current rain
        "precipitation_probability": 75.0,  # High forecast probability >= 50%
        "weather_condition": "Approaching Storm",
        "weather_status": WeatherStatus.FAVORABLE
    }
    res = evaluate_weather_context(initial_route="Restricted Irrigation", weather_data=weather)
    assert res["weather_status"] == WeatherStatus.UNFAVORABLE
    assert res["final_context_recommendation"] == FinalContextRecommendation.STORE_FOR_LATER
    assert res["weather_adjustment"] == WeatherAdjustment.SUPPRESS_IRRIGATION


# =============================================================================
# 8. Indoor Reuse with Rain
# =============================================================================
def test_indoor_reuse_with_rain():
    """Verify that indoor reuse (toilet flushing) remains unaffected by heavy rain."""
    weather = {
        "timestamp": "2026-10-02 12:00:00 UTC",
        "location": "Metropolitan District",
        "temperature_C": 18.0,
        "humidity_percent": 95.0,
        "rainfall_mm": 20.0,
        "precipitation_probability": 95.0,
        "weather_condition": "Heavy Rain",
        "weather_status": WeatherStatus.FAVORABLE
    }
    res = evaluate_weather_context(initial_route="Indoor Reuse", weather_data=weather)
    assert res["weather_status"] == WeatherStatus.NEUTRAL
    assert res["final_context_recommendation"] == FinalContextRecommendation.ALLOW_ROUTE
    assert "DECOUPLING" in res["reason"]


# =============================================================================
# 9. Irrigation with Rain
# =============================================================================
def test_irrigation_with_rain():
    """Verify that irrigation in rain triggers store/defer recommendation."""
    weather = {
        "timestamp": "2026-10-02 12:00:00 UTC",
        "location": "Metropolitan District",
        "temperature_C": 19.0,
        "humidity_percent": 92.0,
        "rainfall_mm": 8.5,
        "precipitation_probability": 85.0,
        "weather_condition": "Continuous Rain",
        "weather_status": WeatherStatus.FAVORABLE
    }
    res = evaluate_weather_context(initial_route=2, weather_data=weather)  # Class 2: Restricted Irrigation
    assert res["final_context_recommendation"] == FinalContextRecommendation.STORE_FOR_LATER
    assert res["weather_adjustment"] == WeatherAdjustment.SUPPRESS_IRRIGATION


# =============================================================================
# 10. Sewer Bypass with Favorable Weather
# =============================================================================
def test_sewer_bypass_with_favorable_weather():
    """Verify that favorable weather NEVER overrides a Sewer Bypass safety requirement."""
    sunny_weather = {
        "timestamp": "2026-10-02 12:00:00 UTC",
        "location": "Metropolitan District",
        "temperature_C": 26.0,
        "humidity_percent": 35.0,
        "rainfall_mm": 0.0,
        "precipitation_probability": 0.0,
        "weather_condition": "Sunny and Warm",
        "weather_status": WeatherStatus.FAVORABLE
    }
    # Initial route = Sewer Bypass (Class 0)
    res = evaluate_weather_context(initial_route="Sewer Bypass", weather_data=sunny_weather)
    assert res["final_context_recommendation"] == FinalContextRecommendation.SAFETY_OVERRIDE
    assert "CANNOT be overridden" in res["reason"]
    
    # Anomaly safety override flag
    res_override = evaluate_weather_context(
        initial_route="Restricted Irrigation",
        weather_data=sunny_weather,
        water_quality_status="SEWER_BYPASS_OVERRIDE"
    )
    assert res_override["final_context_recommendation"] == FinalContextRecommendation.SAFETY_OVERRIDE
    assert "SAFETY PRIORITY PRECEDENCE" in res_override["reason"]


# =============================================================================
# 11. Missing Weather Field
# =============================================================================
def test_missing_weather_field():
    """Verify that missing required keys in weather record raises ValueError."""
    incomplete_data = {
        "timestamp": "2026-10-02 12:00:00 UTC",
        "location": "Metropolitan District",
        "temperature_C": 22.0
        # Missing humidity, rainfall, precipitation_probability, weather_condition
    }
    with pytest.raises(ValueError, match="missing required keys"):
        validate_normalized_weather(incomplete_data)


# =============================================================================
# 12. Invalid Probability
# =============================================================================
def test_invalid_probability():
    """Verify that precipitation probability outside [0, 100] raises ValueError."""
    data_high = {
        "timestamp": "2026-10-02 12:00:00 UTC",
        "location": "Metropolitan District",
        "temperature_C": 22.0,
        "humidity_percent": 50.0,
        "rainfall_mm": 0.0,
        "precipitation_probability": 125.0,  # Invalid > 100
        "weather_condition": "Clear"
    }
    with pytest.raises(ValueError, match=r"\[0, 100\]"):
        validate_normalized_weather(data_high)

    data_negative = dict(data_high)
    data_negative["precipitation_probability"] = -10.0  # Invalid < 0
    with pytest.raises(ValueError, match=r"\[0, 100\]"):
        validate_normalized_weather(data_negative)


# =============================================================================
# 13. Cache Behavior
# =============================================================================
def test_cache_behavior():
    """Verify cache storage, retrieval, TTL expiry, and force refresh."""
    cache = WeatherCache(default_ttl_sec=1)  # 1 second TTL for test
    test_record = {"location": "TestCity", "temp": 25.0}
    
    # Store
    cache.set("weather", test_record)
    assert cache.get("weather") == test_record
    
    # Provider caching
    provider = ModularWeatherProvider(offline_mode=True, offline_profile="dry_clear", cache=cache)
    data1 = provider.get_weather()
    assert data1 is not None
    
    # Check cache hit
    cached_data = cache.get("current_weather")
    assert cached_data is not None
    assert cached_data["location"] == data1["location"]
    
    # Wait for TTL expiry
    time.sleep(1.1)
    assert cache.get("weather") is None  # Should have expired
