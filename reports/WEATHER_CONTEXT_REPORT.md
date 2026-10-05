# Weather Telemetry and Environmental Context Integration Report
## AI-Driven Intelligent Greywater Management and Smart Reuse Routing System

**Project Phase:** Phase 9 — Weather API and Environmental Context Integration  
**Date:** October 2026  
**Status:** Completed & Verified  

---

### Core Safety Axiom
> **"Weather information provides operational context and does not independently establish water safety."**  
> Under no circumstances can favorable meteorological conditions override an initial Sewer Bypass classification or an active anomaly safety cutoff.

---

## 1. Purpose & System Context

The objective of Phase 9 is to introduce an **environmental-context layer** that evaluates meteorological conditions (surface precipitation, forecast precipitation probability, ambient dry-bulb temperature, relative humidity) to arbitrate and refine the initial routing recommendations produced by the supervised machine learning pipeline (XGBoost) and anomaly detector (Isolation Forest).

### Routing Pipeline Integration
```
                     +---------------------------------------+
                     | Digital Twin / Telemetry Simulation  |
                     +---------------------------------------+
                                         |
                                         v
                     +---------------------------------------+
                     |   Water Quality Parameter Screening   |
                     +---------------------------------------+
                                         |
                                         v
                     +---------------------------------------+
                     | Isolation Forest Anomaly Detection    |
                     +---------------------------------------+
                                         |
                                         v
                     +---------------------------------------+
                     | XGBoost 4-Class Initial Routing Model |
                     +---------------------------------------+
                                         |
                                         v
                                  [INITIAL ROUTE]
                                         |
                                         v
========================> [WEATHER CONTEXT LAYER] <========================
                     +---------------------------------------+
                     |  Arbitration Engine (Priority Matrix) |
                     +---------------------------------------+
                                         |
                                         v
                     +---------------------------------------+
                     | Storage Tank & Decay (Phase 10)       |
                     +---------------------------------------+
                                         |
                                         v
                     +---------------------------------------+
                     |        FINAL SMART ROUTING            |
                     +---------------------------------------+
```

---

## 2. Weather Variables Collected

To maintain operational relevance, prevent network overhead, and avoid superfluous telemetry, only variables with direct hydraulic, agronomic, or thermal consequences are collected:

| Variable Name | Unit | Type | Agronomic / Hydraulic Purpose |
|:---|:---:|:---:|:---|
| `timestamp` | UTC | ISO-8601 String | Observation synchronization and cache management |
| `location` | - | String | Municipal treatment facility geographic identifier |
| `temperature_C` | °C | Float | Pipe freeze risk ($< 3.0^\circ\text{C}$) and evaporation modeling |
| `humidity_percent` | % | Float | Evaporative demand and ambient atmospheric moisture [0, 100] |
| `rainfall_mm` | mm | Float | Current surface precipitation depth ($\ge 0.0\text{ mm}$) |
| `precipitation_probability`| % | Float | 12-to-24 hour forward forecast precipitation probability [0, 100] |
| `weather_condition` | - | String | WMO meteorological category classification |
| `wind_speed_kmh` | km/h | Float | Surface spray drift indicator for restricted spray irrigation |
| `forecast_horizon_hours` | hours | Integer | Forward lookahead window (default 24 hours) |
| `weather_status` | - | Enum/String | `LIVE`, `OFFLINE_FALLBACK`, `UNAVAILABLE` |

---

## 3. Modular Weather Provider Architecture

The weather subsystem adheres to a strict Dependency Inversion Principle, isolating external HTTP protocols and provider implementations behind a clean, uniform interface:

1. **`BaseWeatherProvider` (Abstract Base Class)**:
   - `get_current_weather()`: Fetches current observation.
   - `get_forecast(hours=24)`: Obtains forward-looking forecast data.
   - `normalize_weather_data(raw)`: Standardizes arbitrary third-party payloads into the internal schema.

2. **`OpenMeteoWeatherProvider` (Live REST Provider)**:
   - Integrates with the open-access, public Open-Meteo REST API (`https://api.open-meteo.com/v1/forecast`).
   - Requires **no private API keys**, completely eliminating the vulnerability of credential leaks.
   - Extracts WMO weather codes, surface precipitation, relative humidity, and forward precipitation probability.

3. **`OfflineWeatherProvider` (Deterministic Air-Gapped Engine)**:
   - Implements zero-dependency deterministic simulation profiles:
     - `dry_clear`: $24.5^\circ\text{C}$, 0.0 mm rain, 5% precip prob.
     - `heavy_rain`: $18.0^\circ\text{C}$, 14.5 mm rain, 85% precip prob.
     - `light_shower`: $20.0^\circ\text{C}$, 2.5 mm rain, 40% precip prob.
     - `freezing_cold`: $-1.5^\circ\text{C}$, 0.0 mm rain, 10% precip prob.

4. **`ModularWeatherProvider` (Unified Facade)**:
   - Intercepts requests, consults in-memory caching, queries live APIs if online mode is enabled, catches network exceptions, and falls back to structured offline records on any failure.

---

## 4. Weather Data Normalization & Validation

Incoming raw API data is converted to canonical SI units and passed through the rigorous `validate_normalized_weather()` engine.

### Strict Validation Bounds
- **Precipitation Probability**: Must satisfy $0.0 \le P \le 100.0\%$. Values outside this range immediately raise `ValueError`.
- **Precipitation Depth**: Must satisfy $\text{rainfall\_mm} \ge 0.0$. Negative values raise `ValueError`.
- **Relative Humidity**: Must satisfy $0.0 \le H \le 100.0\%$. Values outside this range raise `ValueError`.
- **Temperature**: Must be float/int. Non-numeric types raise `TypeError`.

---

## 5. Weather Context Decision Rules & Thresholds

Operational decision thresholds are established using hydraulic engineering and agronomic principles:

```
                            [INITIAL ROUTE]
                                   |
        +--------------------------+--------------------------+
        |                          |                          |
        v                          v                          v
  SEWER BYPASS             INDOOR REUSE (Class 3)     RESTRICTED IRRIGATION (Class 2)
        |                          |                          |
 [HEALTH CUTOFF]            [HYDRAULIC DECOUPLING]             v
 Weather CANNOT             Rain has NO adverse        +-------------------------------+
 override.                  impact on toilet flushing. | Rain >= 5mm OR Prob >= 50% ?  |
 Final: SAFETY_OVERRIDE     Final: ALLOW_ROUTE         +-------------------------------+
                                                                 |           |
                                                            YES  |           | NO
                                                                 v           v
                                                       STORE_FOR_LATER   Temp < 3°C ?
                                                       (SUPPRESS)        |        |
                                                                     YES |        | NO
                                                                         v        v
                                                                    DEFER_ROUTE  ALLOW_ROUTE
                                                                    (Freeze)     (Approved)
```

### Documented Operational Thresholds
- **`HIGH_RAINFALL_THRESHOLD_MM = 5.0 mm`**: Active rain creates surface saturation. Applying greywater causes hydraulic ponding, pathogen accumulation, and surface runoff into stormwater drains.
- **`HIGH_PRECIP_PROBABILITY_THRESHOLD = 50.0%`**: Anticipated rainfall within the forecast horizon renders irrigation redundant, pre-emptively saving pumping energy and preserving soil aeration.
- **`FREEZING_TEMP_THRESHOLD_C = 3.0°C`**: Sub-surface soil frost makes ground impermeable to water and risks pipe freeze/burst in distribution manifolds.
- **`TORRENTIAL_WASHOUT_RAIN_MM = 25.0 mm`**: Extreme precipitation risks gravel media blowout in open bio-filtration reed beds.

---

## 6. Irrigation Decision Behavior

When the initial ML classification is **Restricted Irrigation (Class 2)**:
1. **Low Rain / Favorable Conditions**:
   - `rainfall_mm < 5.0` AND `precipitation_probability < 50.0` AND `temperature_C >= 3.0`.
   - **Recommendation**: `ALLOW_ROUTE` (`weather_status="FAVORABLE"`, `weather_adjustment="NONE"`).
2. **Rainfall Exceedance / High Rain Probability**:
   - `rainfall_mm >= 5.0` OR `precipitation_probability >= 50.0`.
   - **Recommendation**: `STORE_FOR_LATER` (`weather_status="UNFAVORABLE"`, `weather_adjustment="SUPPRESS_IRRIGATION"`).
   - *Greywater is diverted to raw storage tanks rather than discharged onto saturated soil.*
3. **Freezing Temperatures**:
   - `temperature_C < 3.0`.
   - **Recommendation**: `DEFER_ROUTE` (`weather_status="UNFAVORABLE"`, `weather_adjustment="DEFER_IRRIGATION"`).

---

## 7. Strict Safety Priority Hierarchy

The core system architecture enforces strict safety precedence:

1. **Tier 1: Severe Water-Quality Safety**
   - High $E. coli$, extreme COD/BOD, toxic pH or turbidity mandating sewer bypass.
2. **Tier 2: Isolation Forest High-Risk Anomaly**
   - Observations tagged as `SEWER_BYPASS_OVERRIDE` or `HIGH_RISK_REVIEW`.
3. **Tier 3: Supervised Machine Learning Initial Route**
   - XGBoost multiclass model prediction (Classes 0, 1, 2, 3).
4. **Tier 4: Environmental & Weather Context Layer (Phase 9)**
   - Meteorological suppression, storage diversion, or scheduling.
5. **Tier 5: Storage Capacity & Biochemical Decay (Phase 10)**
   - Retention time kinetics and tank level limits.

### Safety Guarantee
If an influent stream is tagged as `Sewer Bypass` or triggers an anomaly safety cutoff, favorable weather (e.g. warm, dry, clear sunshine) **CANNOT** convert the routing to irrigation or indoor reuse. The engine outputs `final_context_recommendation="SAFETY_OVERRIDE"` and maintains diversion to the sewer.

---

## 8. Offline Mode & Air-Gapped Operation

To support military bases, remote off-grid developments, and air-gapped municipal facilities:
- System provides native **Offline Mode** (`WEATHER_OFFLINE_MODE=true`).
- Supports instant switching across deterministic profiles (`dry_clear`, `heavy_rain`, `light_shower`, `freezing_cold`).
- Offline operation guarantees deterministic behavior for end-to-end unit and integration testing without network flakiness.

---

## 9. API Failure Handling & Resilience

If live API connectivity is lost (HTTP 500, DNS timeout, connection dropped, socket reset):
- Exceptions are caught cleanly within `ModularWeatherProvider`.
- Telemetry output sets `weather_status = "UNAVAILABLE"` and records `error_reason`.
- The evaluation engine handles missing/unavailable weather by setting `final_context_recommendation = "REVIEW_REQUIRED"` while allowing the baseline safe ML route under operator advisory.
- **Zero system crashes or process terminations.**

---

## 10. Cache Strategy & Telemetry Optimization

To prevent denial-of-service, API rate limits, and excessive network polling across multi-sensor streams:
- `WeatherCache` implements an in-memory dictionary cache with Unix timestamp expiration.
- Default Time-to-Live: `WEATHER_CACHE_TTL_SEC = 900` (15 minutes).
- Dynamic cache bypass supported via `force_refresh=True`.
- On API failure, a short retry TTL (60 seconds) is applied to prevent hammering failing remote gateways while allowing rapid recovery once back online.

---

## 11. Systematic Verification Scenarios

| Scenario | Initial Route | Meteorological Profile | Anomaly Status | Recommendation | Operational Adjustment |
|:---|:---:|:---:|:---:|:---:|:---:|
| **1. Nominal Irrigation** | Restricted Irrigation | Clear, 0mm rain, 5% prob | NORMAL | `ALLOW_ROUTE` | `NONE` |
| **2. Heavy Rainstorm** | Restricted Irrigation | 14.5mm rain, 85% prob | NORMAL | `STORE_FOR_LATER` | `SUPPRESS_IRRIGATION` |
| **3. High Precip Prob** | Restricted Irrigation | 0.5mm rain, 75% prob | NORMAL | `STORE_FOR_LATER` | `SUPPRESS_IRRIGATION` |
| **4. Freezing Weather** | Restricted Irrigation | -1.5°C, 0mm rain, 10% prob| NORMAL | `DEFER_ROUTE` | `DEFER_IRRIGATION` |
| **5. Severe Contamination** | Sewer Bypass | Clear, 0mm rain, 5% prob | OVERRIDE | `SAFETY_OVERRIDE` | `NONE` |
| **6. Indoor Flushing** | Indoor Reuse | Heavy Rain (20mm, 95% prob) | NORMAL | `ALLOW_ROUTE` | `NONE` |
| **7. API Unavailable** | Restricted Irrigation | Network Down / Timeout | NORMAL | `REVIEW_REQUIRED` | `NONE` |

---

## 12. Operational Limitations and Safety Disclaimer

> ### Mandatory System Disclaimer
> **"Weather information provides operational context and does not independently establish water safety."**

1. **No Disinfection Capability**: Atmospheric sunshine or dry ambient air does not reduce microbiological pathogen load in the storage tank. Water safety is exclusively governed by biochemical and sensor parameters.
2. **Forecast Inexactness**: Forecast precipitation probabilities are probabilistic regional estimates. Micro-climatic variation across urban landscape zones must be monitored.
3. **Decay Sensitivity**: Diverting greywater to `STORE_FOR_LATER` due to rainfall induces storage retention time. Greywater stored for extended periods experiences anaerobic bacterial growth, acidification, and odor generation (which will be modeled in Phase 10).
