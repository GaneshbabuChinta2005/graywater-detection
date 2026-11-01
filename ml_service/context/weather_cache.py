"""
Weather Data Caching Subsystem
AI-Driven Intelligent Greywater Management and Smart Reuse Routing System

Prevents redundant external API calls by caching normalized weather records
with a configurable Time-To-Live (TTL).
"""

import time
from context.config import WEATHER_CACHE_TTL_SEC


class WeatherCache:
    """
    In-memory weather cache with timestamp-based expiration.
    """
    def __init__(self, default_ttl_sec=WEATHER_CACHE_TTL_SEC):
        self.default_ttl_sec = default_ttl_sec
        self._cache = {}

    def get(self, key="weather_current"):
        """
        Retrieve cached weather object if valid and unexpired.
        
        Returns
        -------
        dict or None
        """
        if key not in self._cache:
            return None
            
        entry = self._cache[key]
        now = time.time()
        
        if now > entry["expires_at"]:
            # Expired
            del self._cache[key]
            return None
            
        return entry["data"]

    def set(self, key="weather_current", data=None, ttl_sec=None):
        """
        Store weather object with expiration timestamp.
        """
        if data is None:
            return
            
        ttl = ttl_sec if ttl_sec is not None else self.default_ttl_sec
        self._cache[key] = {
            "data": data,
            "cached_at": time.time(),
            "expires_at": time.time() + ttl
        }

    def clear(self):
        """Clear all cached entries."""
        self._cache.clear()

    def is_valid(self, key="weather_current"):
        """Check whether key exists and is unexpired."""
        return self.get(key) is not None
