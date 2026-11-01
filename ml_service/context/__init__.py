"""
Environmental Context and Weather Module for Greywater Routing.
"""

from context.config import WeatherConfig
from context.weather_cache import WeatherCache
from context.weather_provider import (
    BaseWeatherProvider,
    OfflineWeatherProvider,
    OpenMeteoWeatherProvider,
    ModularWeatherProvider,
    NormalizedWeatherData,
    validate_normalized_weather,
)
from context.weather_context import (
    evaluate_weather_context,
    WeatherEvaluationResult,
    WeatherStatus,
    WeatherAdjustment,
    FinalContextRecommendation,
)

__all__ = [
    "WeatherConfig",
    "WeatherCache",
    "BaseWeatherProvider",
    "OfflineWeatherProvider",
    "OpenMeteoWeatherProvider",
    "ModularWeatherProvider",
    "NormalizedWeatherData",
    "validate_normalized_weather",
    "evaluate_weather_context",
    "WeatherEvaluationResult",
    "WeatherStatus",
    "WeatherAdjustment",
    "FinalContextRecommendation",
]
