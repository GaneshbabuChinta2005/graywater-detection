# Machine Learning Data Dictionary

**Project Title:** AI-Driven Intelligent Greywater Management and Smart Reuse Routing System  
**Dataset Artifact:** `dataset/processed/train.csv`, `validation.csv`, `test.csv`  
**Execution Phase:** Phase 4 (Data Preprocessing & ML Dataset Preparation)  

---

## 1. Overview
This data dictionary documents the exact set of 19 model features and 1 target variable prepared for supervised machine learning (XGBoost and Random Forest). Features are derived from `dataset/processed/greywater_routing_labels.csv` through the leakage-free `GreywaterPreprocessor` pipeline.

---

## 2. Target Variable

| Attribute Name | Storage Type | Domain Values | Physical Meaning | Preprocessing Treatment |
| :--- | :--- | :--- | :--- | :--- |
| **`Routing_Class`** | `int64` | `0`: Sewer Bypass<br>`1`: Bio-filtration<br>`2`: Restricted Irrigation<br>`3`: Indoor Reuse | The ground-truth operational reuse routing destination engineered in Phase 3. | Target label ($y$). Isolated strictly from feature matrix $X$. |

---

## 3. Categorical Model Features (One-Hot Encoded)

| Feature Name | Unit | Variable Type | Originating Column | Operational Meaning & Role in Routing | Preprocessing Treatment |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **`Greywater_Source_Bathroom`** | Binary (0/1) | Categorical Indicator | `Greywater_Source` | Indicates effluent originating from bathroom showers, tubs, and hand basins. Represents cleanest domestic stream (low BOD/TSS/COD); primary candidate for Indoor Reuse and Restricted Irrigation. | One-hot encoded indicator (1 if source is Bathroom, 0 otherwise). |
| **`Greywater_Source_Kitchen`** | Binary (0/1) | Categorical Indicator | `Greywater_Source` | Indicates effluent originating from kitchen sinks and dishwashers. Represents heavily contaminated stream loaded with food particles, oils, grease, and high bacterial density; primary trigger for Sewer Bypass. | One-hot encoded indicator (1 if source is Kitchen, 0 otherwise). |
| **`Greywater_Source_Laundry`** | Binary (0/1) | Categorical Indicator | `Greywater_Source` | Indicates effluent originating from clothes washing machines. Characterized by high suspended lint/turbidity and chemical detergents/surfactants; divides between Sewer Bypass and Bio-filtration. | One-hot encoded indicator (1 if source is Laundry, 0 otherwise). |
| **`Greywater_Source_Mixed`** | Binary (0/1) | Categorical Indicator | `Greywater_Source` | Indicates blended residential drainage combining multiple fixtures. Dilutes acute kitchen spikes but maintains elevated organic load; primary candidate for Bio-filtration. | One-hot encoded indicator (1 if source is Mixed, 0 otherwise). |

---

## 4. Continuous Numerical Model Features (Physical Predictors)

| Feature Name | Unit | Variable Type | Sensor Telemetry Meaning | Role in Routing Classification | Preprocessing Treatment |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **`pH`** | pH units | Continuous | Acidity/alkalinity indicator. Scale 0–14. | Safety boundary: Values $<6.0$ or $>9.0$ trigger Sewer Bypass to protect plumbing and biological treatment beds. Optimal reuse envelope is $6.5\text{--}8.4$. | Passthrough in original physical units (no scaling required for tree models). |
| **`TEMP_C`** | °C | Continuous | Water temperature. | Influences dissolved oxygen solubility, biological decay kinetics, and pathogen persistence. | Passthrough in original physical units. |
| **`SAL_ppt`** | ppt | Continuous | Salinity concentration (parts per thousand). | High salinity ($>0.60$ ppt) triggers Sewer Bypass to prevent irreversible soil salinization and osmotic shock in plants. | Passthrough in original physical units. |
| **`TUR_NTU`** | NTU | Continuous | Nephelometric Turbidity Units (optical clarity). | High turbidity ($>140$ NTU) triggers Sewer Bypass; $>60$ NTU mandates Bio-filtration. Low turbidity ($\le 25$ NTU) required for Indoor Reuse. | Passthrough in original physical units. |
| **`DS_mg_L`** | mg/L | Continuous | Dissolved Solids concentration. | Tracks dissolved minerals. Strongly collinear with TDS ($r=0.994$). Retained for baseline tree ensembles. | Passthrough in original physical units. |
| **`TDS_mg_L`** | mg/L | Continuous | Total Dissolved Solids. | Primary dissolved mineral predictor. TDS $>800$ mg/L triggers Sewer Bypass; $\le 500$ mg/L safe for Restricted Irrigation; $\le 300$ mg/L for Indoor Reuse. | Passthrough in original physical units. |
| **`TSS_mg_L`** | mg/L | Continuous | Total Suspended Solids. | Particulate mass causing emitter clogging and sludge accumulation. $>250$ mg/L triggers Sewer Bypass; $>90$ mg/L mandates Bio-filtration. | Passthrough in original physical units. |
| **`COND_uS_cm`** | μS/cm | Continuous | Electrical Conductivity. | Measures ionic mobility; corroborates TDS and salinity concentrations. | Passthrough in original physical units. |
| **`DO_mg_L`** | mg/L | Continuous | Dissolved Oxygen. | Measures aerobic freshness. Depleted states ($<1.0$ mg/L) combined with high organics indicate anaerobic septicity and odor risk (Sewer Bypass). | Passthrough in original physical units. |
| **`BOD_mg_L`** | mg/L | Continuous | Biochemical Oxygen Demand (5-day). | Primary organic loading metric. $>400$ mg/L triggers Sewer Bypass; $>120$ mg/L mandates Bio-filtration; $\le 45$ mg/L required for Indoor Reuse. | Passthrough in original physical units. |
| **`COD_mg_L`** | mg/L | Continuous | Chemical Oxygen Demand. | Total chemically oxidizable matter. $>800$ mg/L triggers Sewer Bypass; $>300$ mg/L mandates Bio-filtration; $\le 125$ mg/L required for Indoor Reuse. | Passthrough in original physical units. |
| **`NH4F_mg_L`** | mg/L | Continuous | Ammonium / fluoride compound indicator. | Contextual nitrogen/halide indicator tracking cleaning agents and urine traces. | Passthrough in original physical units. |
| **`NO3_mg_L`** | mg/L | Continuous | Nitrate concentration. | Agronomic macro-nutrient; beneficial for Restricted Irrigation of non-food plants. | Passthrough in original physical units. |
| **`K_mg_L`** | mg/L | Continuous | Potassium ion concentration. | Essential plant nutrient; non-hazardous at observed residential levels. | Passthrough in original physical units. |
| **`E_coli_CFU_100mL`** | CFU / 100 mL | Discrete / Continuous | *Escherichia coli* pathogen count. | Critical microbiological safety indicator. $>500,000$ CFU triggers Sewer Bypass; $>75,000$ mandates Bio-filtration; $\le 20,000$ required for Indoor Reuse. | Passthrough in original count units. |

---

## 5. Excluded Attributes (Leakage Prevention)

| Column Name | Reason for Exclusion |
| :--- | :--- |
| `Sample_ID` | Database sequence key; provides zero physical predictive value and causes spurious sample memorization. |
| `Routing_Class_Name` | Human-readable string representation of the target variable (Direct target leakage). |
| `Water_Quality_Class` | Legacy single-class target column (`"Needs Treatment"`); uninformative and potentially leaky. |
| `Primary_Routing_Reason` | Post-classification explanation string generated by the rule engine (Direct decision leakage). |
| `Triggered_Parameters` | List of rule conditions triggered during decision execution (Direct decision leakage). |
| `Treatment_Required` | Action mandate generated after routing decision (Direct decision leakage). |
| `Safety_Flag` | Safety alert level generated after routing decision (Direct decision leakage). |
