# Environmental & Weather Context Integration Documentation
## AI-Driven Intelligent Greywater Management and Smart Reuse Routing System

---

### 1. Architectural Purpose & Contextual Need

Greywater reuse decisions cannot be made solely based on in-pipe water quality. While an effluent sample may meet the microbiological and chemical criteria for *Restricted Irrigation*, applying water to soil immediately before or during heavy precipitation events presents severe ecological hazards:
1. **Saturated Soil Runoff:** When soil moisture capacity is exceeded, applied greywater runs off impermeable surfaces into municipal stormwater gutters, carrying residual surfactants, nitrogen, and bacteria directly into open urban waterways.
2. **Groundwater Contamination:** Heavy rains accelerate macropore leaching, bypassing natural topsoil filtration and carrying pathogens into shallow water tables.
3. **Frost / Freezing Hazards:** Spraying greywater in freezing ambient conditions ($< 3.0^\circ\text{C}$) damages landscape vegetation, cracks distribution piping, and creates surface icing hazards.

To prevent these hazards, the system integrates a real-time environmental weather context provider.

---

### 2. Meteorological API Integration & Environmental Variables

* **Module Location:** `context/` (`weather_provider.py`, `weather_cache.py`, `config.py`)
* **API Provider:** Open-Meteo REST API (`https://api.open-meteo.com/v1/forecast`)
  * Open-access meteorological service; requires zero proprietary API keys.
* **Environmental Parameters Ingested:**
  * **Rainfall Rate (`rainfall_mm`):** Measured hourly precipitation depth.
  * **Precipitation Probability (`precipitation_probability`):** Forecasted likelihood of rain over the next 12–24 hours ($0\% - 100\%$).
  * **Ambient Air Temperature (`temperature_C`):** Ambient temperature ($^\circ\text{C}$) used for freezing and evapotranspiration calculations.
  * **Relative Humidity (`humidity_percent`):** Atmospheric moisture saturation.
  * **Wind Speed (`wind_speed_kmh`):** Surface wind speed (drift risk for spray irrigation).

---

### 3. Operational Irrigation Rules & Thresholds

Meteorological variables are evaluated through deterministic environmental arbitration rules:

| Condition / Variable | Operational Threshold | Environmental Impact | System Routing Action |
| :--- | :---: | :--- | :--- |
| **High Rainfall Rate** | $\ge 5.0\text{ mm}$ | Immediate surface ponding and runoff risk. | Suppress irrigation $\rightarrow$ `STORE_FOR_LATER` |
| **High Rain Probability** | $\ge 70.0\%$ ($\ge 50\%$ advisory) | Impending storm will saturate soil within hours. | Defer irrigation $\rightarrow$ `STORE_FOR_LATER` |
| **Ground Freezing Risk** | $< 3.0^\circ\text{C}$ | Soil frost prevents infiltration; pipe freezing. | Suppress irrigation $\rightarrow$ `STORE_FOR_LATER` |
| **High Heat Evaporation** | $\ge 35.0^\circ\text{C}$ | Extreme evaporation loss; subsurface drip favored. | Advisory note: Subsurface irrigation only |
| **Torrential Washout** | $\ge 25.0\text{ mm}$ | Risk of hydraulic washout of outdoor gravel bio-filters. | Divert outdoor bio-filters $\rightarrow$ Storage / Sewer |

---

### 4. Cache Behavior & Graceful Failure Handling

To guarantee reliability in real-world decentralized systems with intermittent internet connectivity, the weather module incorporates multi-layered fault tolerance:

#### 1. In-Memory TTL Cache (`weather_cache.py`)
* REST API responses are cached in memory with a Time-To-Live (TTL) of **1,800 seconds (30 minutes)**.
* Prevents unnecessary network polling, enforces rate-limiting compliance, and reduces pipeline evaluation latency from ~350ms to <1ms.

#### 2. Network Timeout & Retry
* HTTP calls enforce a strict **5-second timeout** and a maximum of 2 retries.

#### 3. Graceful Failure Fallback
* If the remote API times out, DNS fails, or network connectivity is severed:
  1. The system checks the last cached entry (even if stale up to 6 hours).
  2. If no cache exists, the system transitions to `weather_status = UNAVAILABLE`.
  3. **The system does NOT crash, nor does it invent fake weather data.**
  4. The routing engine logs reason code `WEATHER_UNAVAILABLE` and continues normal evaluation using conservative safe defaults (e.g., indoor reuse and treatment routes operate normally; outdoor irrigation is flagged for operator confirmation).

---

### 5. Absolute Safety Precedence Rule

> [!IMPORTANT]
> **WEATHER CANNOT OVERRIDE WATER QUALITY SAFETY:**
> **Environmental weather conditions affect operational timing, but they CANNOT override critical water-quality safety.**
> 
> * **Example:** If water exhibits an extreme acidic pH violation ($pH = 5.2$) or massive pathogen contamination ($E. coli > 10^5\text{ CFU}/100\text{mL}$), sunny, clear, and dry weather ($0.0\text{ mm}$ rain, $24^\circ\text{C}$) will **NEVER** permit the water to be routed to irrigation or indoor reuse.
> * The deterministic safety layer holds absolute priority. The hazardous stream is diverted immediately to **Sewer Bypass** with action **`SAFETY_OVERRIDE`**.
> * Weather arbitration is strictly an operational deferral mechanism applied *after* water is confirmed physically safe.
