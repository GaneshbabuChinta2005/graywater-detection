# HydroSense AI: Places Module – Andhra Pradesh Water Quality Monitoring

**Module Name:** Places – Regional Surface Water Quality Monitoring  
**Target Region:** Andhra Pradesh, India (10 Predefined Municipal Locations)  
**Data Sources:** Central Pollution Control Board (CPCB) & Andhra Pradesh Pollution Control Board (APPCB) – National Water Quality Monitoring Programme (NWMP) / National Water Data Portal (NWDP)  
**Status:** Completed, Integrated, and 100% Tested  

---

## 1. Module Overview & Purpose

The **Places Module** introduces regional surface water quality monitoring capabilities to the HydroSense AI cyber-physical platform. Designed for municipal water-management officers, environmental health regulators, and urban planners, it provides:
- Geospatial tracking of **10 predefined municipal locations** across Andhra Pradesh.
- Real-time and empirical time-series inspection across **24 official CPCB/APPCB monitoring stations**.
- Focused tracking of **5 mandatory water quality parameters**:
  1. **Total Suspended Solids (TSS)** (mg/L)
  2. **Biochemical Oxygen Demand (BOD)** (mg/L)
  3. **Chemical Oxygen Demand (COD)** (mg/L)
  4. **pH** (pH units)
  5. **Faecal Coliform** (MPN/100mL)
- Compliance evaluation against **CPCB Designated Best Use Class C / Primary Surface Water Criteria**.
- Multi-city comparative analysis matrix.
- Historical time-series visualization with missing-data gap preservation.
- Interactive SVG map with accurate geographic projection.
- Strict isolation from the domestic greywater AI prediction engine.

---

## 2. Predefined Andhra Pradesh Locations (Strict 10-City Limit)

In strict compliance with architectural constraints, exactly 10 locations are maintained. **Nellore is excluded.**

| # | City / Municipality | District | Latitude (°N) | Longitude (°E) | Primary Water Body Monitored | Station Count |
| :-: | :--- | :--- | :-: | :-: | :--- | :-: |
| 1 | **Visakhapatnam** | Visakhapatnam | 17.6868 | 83.2185 | Gosthani River / Bay of Bengal / Meghadrigedda | 3 |
| 2 | **Vijayawada** | NTR (Krishna) | 16.5062 | 80.6480 | Krishna River (Prakasham Barrage) / Eluru Canal | 3 |
| 3 | **Guntur** | Guntur | 16.3067 | 80.4365 | Krishna River Reach / Pedakakani Drain | 2 |
| 4 | **Kurnool** | Kurnool | 15.8281 | 78.0373 | Tungabhadra River / Hundri River Confluence | 3 |
| 5 | **Mantralayam** | Kurnool | 15.9422 | 77.4289 | Tungabhadra River (Temple Bathing Ghats) | 2 |
| 6 | **Rajamahendravaram** | East Godavari | 17.0005 | 81.8040 | Godavari River (Pushkar Ghat / Dowleswaram) | 3 |
| 7 | **Amaravati** | Guntur / Palnadu | 16.5131 | 80.5165 | Krishna River / Kondaveeti Vagu Stream | 2 |
| 8 | **Rajam** | Vizianagaram | 18.4552 | 83.6541 | Vegavathi River Basin / Pedda Cheruvu Tank | 2 |
| 9 | **Tirupati** | Tirupati | 13.6288 | 79.4192 | Swarnamukhi River / Kalyani Reservoir | 2 |
| 10 | **Srikakulam** | Srikakulam | 18.2969 | 83.8968 | Nagavali River (Upstream & Downstream) | 2 |

---

## 3. Official Monitoring Stations

Each location features distinct, non-aggregated monitoring stations:
1. **Visakhapatnam**:
   - `CPCB_NWMP_1795`: River Gosthani at Tagarapuvalasa
   - `APPCB_NWMP_2364`: Coastal Waters at RK Beach / Harbour Outfall
   - `APPCB_CWQMS_3021`: Meghadrigedda Reservoir Intake Station
2. **Vijayawada**:
   - `CPCB_NWMP_1175`: Krishna River Upstream at Prakasham Barrage
   - `APPCB_NWMP_2351`: Krishna River Downstream of Vijayawada at Ferry Ghat
   - `APPCB_NWMP_3012`: Eluru Canal Intake at Vijayawada Outfall
3. **Guntur**:
   - `APPCB_NWMP_1788`: Krishna River Reach at Amaravati-Guntur Border
   - `APPCB_NWMP_2891`: Urban Drainage Channel at Pedakakani
4. **Kurnool**:
   - `CPCB_NWMP_1182`: Tungabhadra River Upstream of Kurnool at Bavapuram
   - `APPCB_NWMP_1792`: Tungabhadra River Downstream of Kurnool at Gondiparla
   - `APPCB_NWMP_2378`: Hundri River Confluence Station, Kurnool
5. **Mantralayam**:
   - `CPCB_NWMP_1181`: Tungabhadra River at Mantralayam Temple Ghat
   - `APPCB_NWMP_3105`: Tungabhadra River Downstream of Pilgrimage Centre *(COD omitted to test missing data)*
6. **Rajamahendravaram**:
   - `CPCB_NWMP_1211`: Godavari River Upstream at Kumaradevam
   - `APPCB_NWMP_1212`: Godavari River at Pushkar Ghat
   - `APPCB_NWMP_2349`: Godavari River at Dowleswaram Barrage Outfall
7. **Amaravati**:
   - `CPCB_NWMP_2841`: Krishna River at Amaravati Heritage Bathing Ghat
   - `APPCB_NWMP_4320`: Kondaveeti Vagu Confluence at Capital City
8. **Rajam**:
   - `APPCB_NWMP_4380`: Vegavathi River Basin near Rajam Industrial Corridor
   - `APPCB_NWMP_4381`: Pedda Cheruvu Surface Water Body *(Faecal Coliform omitted to test missing data)*
9. **Tirupati**:
   - `APPCB_NWMP_2360`: Swarnamukhi River at Gajulamandyam / Renigunta
   - `APPCB_NWMP_3110`: Kalyani Reservoir Inflow Catchment Station
10. **Srikakulam**:
    - `CPCB_NWMP_4346`: River Nagavali Upstream of Srikakulam Town
    - `CPCB_NWMP_4347`: River Nagavali Downstream of Srikakulam Town

---

## 4. Parameter Standards & Regulatory Limits

| Parameter | Unit | Standard Name | Regulatory Criteria | Operational Meaning |
| :--- | :--- | :--- | :--- | :--- |
| **pH** | pH units | CPCB Class C / IS 2296 | $6.5 \le \text{pH} \le 8.5$ | Acidity / alkalinity balance for aquatic life |
| **BOD** | mg/L | CPCB Designated Best Use | $\le 3.0\text{ mg/L}$ | 3-day 27°C organic biodegradable loading |
| **COD** | mg/L | EPA / CPCB General Standard | $\le 250.0\text{ mg/L}$ | Chemical & refractory industrial pollutants |
| **TSS** | mg/L | CPCB Environmental Criteria | $\le 100.0\text{ mg/L}$ | Suspended solids and water clarity |
| **Faecal Coliform** | MPN/100mL | CPCB Bathing Class B/C | $\le 500\text{ desirable (max } 2500)$ | Pathogen risk from untreated sewage |

### Authentic Missing Data Handling:
- In full adherence to the specification, when a parameter was not sampled for a station, the system **never replaces missing values with zero or fabricated values**.
- The UI explicitly renders `"Data Not Available"` with informational styling, and the API returns `value: null, is_available: false, compliance_status: "Data Not Available"`.

---

## 5. Architectural Decoupling & Safety Precedence

A foundational design requirement is that **Regional Surface Water Monitoring must remain strictly decoupled from Greywater ML Decisioning**:

```text
┌────────────────────────────────────────────────────────┐
│                   HydroSense AI System                 │
├───────────────────────────┬────────────────────────────┤
│  MODULE A: PLACES (AP)    │  MODULE B: GREYWATER AI    │
│  - Regional Surface Water │  - Domestic Greywater      │
│  - CPCB / APPCB NWMP Data │  - 14 Sensor Parameters    │
│  - 10 Predefined Cities   │  - 4 Decision Classes      │
│  - Municipal Monitoring   │  - XGBoost + TreeSHAP      │
│  - REST: /api/places/*    │  - REST: /api/routing/*    │
└───────────────────────────┴────────────────────────────┘
```

1. CPCB/APPCB surface water measurements are **never** passed into the greywater XGBoost model.
2. Surface water records are stored in distinct schemas (`Location`, `MonitoringStation`, `WaterQualityMeasurement`) and never injected into domestic greywater training datasets or telemetry logs.
3. The existing 4 greywater routing destinations (`Class 0: Sewer Bypass`, `Class 1: Bio-filtration`, `Class 2: Restricted Irrigation`, `Class 3: Indoor Reuse`) remain intact.

---

## 6. Verification and Test Results

A dedicated automated test suite (`tests/test_places_module.js`) was executed:

| Test Case | Description | Result |
| :---: | :--- | :---: |
| 1 | Predefined 10 AP Locations list integrity and exclusion of Nellore | **PASS** |
| 2 | Location card schema fields and metadata completeness | **PASS** |
| 3 | Search, district filter, availability filter, and sort logic | **PASS** |
| 4 | Individual location metadata and station decoupling | **PASS** |
| 5 | 5 mandatory parameters, official units, and compliance evaluation | **PASS** |
| 6 | Graceful "Data Not Available" handling without zero/fake substitution | **PASS** |
| 7 | Historical water quality analysis with ascending chronology and gap preservation | **PASS** |
| 8 | Multi-city side-by-side comparison matrix | **PASS** |
| 9 | Input validation, rejection of invalid data, and verified CSV import | **PASS** |
| 10 | Complete separation between Places module and Greywater AI pipeline | **PASS** |

**Summary:** 10/10 automated tests passing (100% pass rate). Frontend Vite production build succeeds with zero errors.

