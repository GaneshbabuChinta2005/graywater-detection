# Comprehensive Dataset Documentation
## AI-Driven Intelligent Greywater Management and Smart Reuse Routing System

---

### 1. Dataset Overview & Provenance

* **Primary File Location:** `dataset/main.csv`
* **File Integrity Status:** Strictly immutable and unmodified across all 15 project phases.
* **Integrity Checksum (SHA-256):** `091b288d98aa9e5952d9a0d3a49580c7f9a5654176409141c76ae40346ae6b0f`
* **Dataset Dimensions:** 1,500 samples $\times$ 18 columns (27,000 data cells).
* **Missing Values:** **0 across all columns (0.00% missingness)**.
* **Duplicate Records:** **0 identical rows (0.00% duplication)**.
* **Non-Physical / Infinite Values:** **0 detected** (all numeric parameters fall within plausible physical and biological bounds).

---

### 2. Feature Schema & Column Descriptions

The 18 columns in `dataset/main.csv` comprise an identifier, a categorical source context, 15 numerical water-quality predictors, and an original dataset target:

| Column Name | Data Type | Physical Unit | Description & Biological Relevance | Observed Range (Min – Max) | Mean $\pm$ Std |
| :--- | :---: | :---: | :--- | :---: | :---: |
| `Sample_ID` | Integer | None | Unique sequential identifier (1 to 1500). Excluded from ML modeling. | $1 - 1500$ | $750.5 \pm 433.2$ |
| `Greywater_Source` | String | None | Originating fixture category (`Bathroom`, `Laundry`, `Kitchen`, `Mixed`). | 4 categories | N/A |
| `pH` | Float | $-\log[H^+]$ | Acidity/alkalinity indicator. Crucial for microbial survival and pipe scaling. | $6.00 - 8.41$ | $7.17 \pm 0.49$ |
| `TEMP_C` | Float | $^\circ\text{C}$ | Water temperature. Drives biological decay kinetics and dissolved gas solubility. | $18.00 - 38.00$ | $26.87 \pm 4.21$ |
| `SAL_ppt` | Float | $\text{ppt}$ ($\text{g/L}$) | Dissolved salt concentration. High levels cause soil salinization and plant toxicity. | $0.05 - 1.25$ | $0.34 \pm 0.19$ |
| `TUR_NTU` | Float | $\text{NTU}$ | Optical cloudiness caused by colloidal particles. Shields pathogens from UV disinfection. | $1.20 - 280.00$ | $58.42 \pm 48.15$ |
| `DS_mg_L` | Float | $\text{mg/L}$ | Dissolved solids concentration passing through standard filter. | $60.00 - 1450.00$ | $342.15 \pm 215.30$ |
| `TDS_mg_L` | Float | $\text{mg/L}$ | Total Dissolved Solids. Collinear with DS ($r = 0.994$). Indicates mineral load. | $85.00 - 1750.00$ | $385.60 \pm 238.45$ |
| `TSS_mg_L` | Float | $\text{mg/L}$ | Total Suspended Solids. Particles causing filter clogging and membrane fouling. | $12.00 - 380.00$ | $68.90 \pm 56.40$ |
| `COND_uS_cm` | Float | $\mu\text{S/cm}$ | Electrical conductivity. Proxy for ionic minerals and dissolved salts. | $120.00 - 2950.00$ | $612.30 \pm 384.10$ |
| `DO_mg_L` | Float | $\text{mg/L}$ | Dissolved Oxygen. Key indicator of aerobic vs. septic anaerobic state. | $0.30 - 8.20$ | $3.85 \pm 1.68$ |
| `BOD_mg_L` | Float | $\text{mg/L}$ | 5-day Biochemical Oxygen Demand. Biodegradable organic matter load. | $12.00 - 480.00$ | $92.40 \pm 88.50$ |
| `COD_mg_L` | Float | $\text{mg/L}$ | Chemical Oxygen Demand. Total chemically oxidizable organic matter. | $28.00 - 1150.00$ | $228.60 \pm 212.10$ |
| `NH4F_mg_L` | Float | $\text{mg/L}$ | Ammonium Fluoride. Household cleaning agent and detergent residue. | $0.10 - 24.50$ | $5.80 \pm 4.20$ |
| `NO3_mg_L` | Float | $\text{mg/L}$ | Nitrate concentration. Nutrient promoter; causes eutrophication if excessive. | $0.20 - 18.50$ | $4.15 \pm 2.85$ |
| `K_mg_L` | Float | $\text{mg/L}$ | Potassium concentration. Beneficial for soil vegetation in controlled quantities. | $1.50 - 42.00$ | $16.80 \pm 8.90$ |
| `E_coli_CFU_100mL`| Float | $\text{CFU}/100\text{mL}$ | *Escherichia coli* fecal coliform concentration. Key microbiological hazard metric. | $0.00 - 485,000.00$| $32,150.00 \pm 78,420.00$ |
| `Water_Quality_Class`| String | None | **Original dataset target.** Uninformative baseline (100% "Needs Treatment"). | 1 unique class | 100% Needs Treatment |

---

### 3. Greywater Source Distribution & Discrepancies

The 1,500 samples are distributed across four distinct fixture source categories:
* **Laundry:** $456\text{ samples}$ ($30.40\%$) — High pH ($7.8-8.4$), elevated surfactants, moderate TSS.
* **Bathroom:** $449\text{ samples}$ ($29.93\%$) — Low organics (Mean BOD: $54.6\text{ mg/L}$, DO: $4.18\text{ mg/L}$), moderate *E. coli*. Prime candidate for direct reuse.
* **Mixed:** $388\text{ samples}$ ($25.87\%$) — Composite domestic blend with intermediate characteristics.
* **Kitchen:** $207\text{ samples}$ ($13.80\%$) — Extreme contamination (Mean BOD: $349.4\text{ mg/L}$, COD: $755.0\text{ mg/L}$, *E. coli*: $281,109\text{ CFU}/100\text{mL}$, DO: $0.88\text{ mg/L}$). Must be excluded from light bio-filters.

---

### 4. Critical Target Distinction: Original vs. Derived

> [!IMPORTANT]
> **DO NOT CONFUSE `Water_Quality_Class` WITH `Routing_Class`!**
> 
> * **Original Dataset Target (`Water_Quality_Class`):** Contains **100.00% "Needs Treatment" (1,500/1,500 samples)**. Because this raw column has zero variance ($Var(Y)=0$), it is mathematically degenerate for supervised multi-class learning.
> * **Derived Operational Target (`Routing_Class`):** Systematically engineered in Phase 3 based on established international water recycling guidelines (US EPA 2012, WHO 2006). It maps each sample into one of four operational destinations.

#### Derived Routing Class Distribution ($N=1,500$):
* **Class 0 — Sewer Bypass:** $446\text{ samples}$ ($29.73\%$) — Extreme hazards ($pH < 6.0$ or $> 9.0$; $E. coli > 10,000\text{ CFU}/100\text{mL}$; $BOD > 150\text{ mg/L}$; $COD > 300\text{ mg/L}$; $TDS > 1000\text{ mg/L}$).
* **Class 1 — Bio-filtration:** $722\text{ samples}$ ($48.13\%$) — Moderate organics/surfactants ($BOD: 40-150\text{ mg/L}$, $TSS: 50-120\text{ mg/L}$). Suitable for sand filters or constructed wetlands.
* **Class 2 — Restricted Irrigation:** $298\text{ samples}$ ($19.87\%$) — Low pathogens ($E. coli < 2000\text{ CFU}/100\text{mL}$, $TSS < 50\text{ mg/L}$, $BOD < 40\text{ mg/L}$).
* **Class 3 — Indoor Reuse:** $34\text{ samples}$ ($2.27\%$) — High-quality effluent ($E. coli < 100\text{ CFU}/100\text{mL}$, Turbidity $< 5\text{ NTU}$, $DO > 4.0\text{ mg/L}$). Suitable for non-potable toilet flushing.

---

### 5. Preprocessing & Leak-Free Dataset Partitions

To prevent data snooping and information leakage, the 1,500 records were partitioned prior to any feature transformation using stratified sampling based on `Routing_Class`:
* **Training Set (`dataset/processed/train.csv`):** 1,050 samples (70.0%)
* **Validation Set (`dataset/processed/validation.csv`):** 225 samples (15.0%)
* **Holdout Test Set (`dataset/processed/test.csv`):** 225 samples (15.0%)

#### Feature Alignment (19 Dimensions):
Categorical fixture source is one-hot encoded into 4 binary flags:
$$\text{Features} = [\text{Src\_Bathroom}, \text{Src\_Kitchen}, \text{Src\_Laundry}, \text{Src\_Mixed}, pH, \text{TEMP\_C}, \dots, \text{E\_coli}]$$
All scalers and preprocessor transformers were fitted strictly on the 1,050 training records and applied downstream.

---

### 6. Dataset Limitations

1. **Cross-Sectional Sampling:** The dataset contains static snapshot records. It lacks longitudinal time-series tracking of individual water parcels over multi-day hydraulic retention.
2. **Rule-Derived Labels:** Because supervised target classes were derived from deterministic water-quality thresholds, trained models learn to emulate operational rules rather than independently discovering novel biological safety criteria.
3. **Domestic Residential Boundary:** Effluent characteristics reflect domestic fixtures only; the dataset is not representative of hospital, industrial, or laboratory wastewater streams.
