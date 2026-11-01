# Phase 2: Comprehensive Dataset Analysis and Data Quality Validation Report

**Project Title:** AI-Driven Intelligent Greywater Management and Smart Reuse Routing System  
**Dataset Analyzed:** `dataset/main.csv`  
**Execution Date:** October 2, 2026  
**Status:** Completed & Validated  

---

## 1. Dataset Overview
This report provides a formal data quality audit, descriptive statistical breakdown, and correlation analysis for the greywater telemetry dataset (`dataset/main.csv`). The dataset characterizes physicochemical and microbiological properties of untreated greywater sampled across diverse domestic effluent streams. The objective of Phase 2 is to rigorously document the existing baseline data without applying transformations, model training, or data alterations.

---

## 2. Dataset Dimensions
- **Total Observations (Rows):** 1,500
- **Total Attributes (Columns):** 18
- **Total Data Elements:** 27,000

---

## 3. Features & Data Types

The dataset comprises 1 integer identifier, 2 string/object categorical attributes, and 15 continuous or discrete numeric water quality parameters:

| Column Name | Storage Type | Domain Category | Physical / Chemical Description | Unit |
| :--- | :--- | :--- | :--- | :--- |
| `Sample_ID` | `int64` | Identifier | Unique sequential observation index ($1 \dots 1500$) | - |
| `Greywater_Source` | `str` (`object`) | Categorical Metadata | Originating stream: Laundry, Bathroom, Mixed, Kitchen | - |
| `pH` | `float64` | Numerical Predictor | Negative log of hydrogen ion activity (acidity/alkalinity) | pH scale |
| `TEMP_C` | `float64` | Numerical Predictor | Water temperature | °C |
| `SAL_ppt` | `float64` | Numerical Predictor | Salinity concentration | parts per thousand (ppt) |
| `TUR_NTU` | `float64` | Numerical Predictor | Nephelometric turbidity | NTU |
| `DS_mg_L` | `float64` | Numerical Predictor | Dissolved Solids | mg/L |
| `TDS_mg_L` | `float64` | Numerical Predictor | Total Dissolved Solids | mg/L |
| `TSS_mg_L` | `float64` | Numerical Predictor | Total Suspended Solids | mg/L |
| `COND_uS_cm` | `float64` | Numerical Predictor | Specific Electrical Conductivity | μS/cm |
| `DO_mg_L` | `float64` | Numerical Predictor | Dissolved Oxygen | mg/L |
| `BOD_mg_L` | `float64` | Numerical Predictor | Biochemical Oxygen Demand (5-day) | mg/L |
| `COD_mg_L` | `float64` | Numerical Predictor | Chemical Oxygen Demand | mg/L |
| `NH4F_mg_L` | `float64` | Numerical Predictor | Ammonium / fluoride compound indicator | mg/L |
| `NO3_mg_L` | `float64` | Numerical Predictor | Nitrate concentration | mg/L |
| `K_mg_L` | `float64` | Numerical Predictor | Potassium ion concentration | mg/L |
| `E_coli_CFU_100mL` | `int64` | Numerical Predictor | *Escherichia coli* pathogen count | CFU / 100 mL |
| `Water_Quality_Class` | `str` (`object`) | Existing Target | Legacy binary/status indicator | - |

---

## 4. Missing Value Analysis
- **Missing Value Count:** 0 across all 18 columns.
- **Percentage Missing:** 0.00% across all 1,500 rows.
- **Completeness Verdict:** The dataset is fully complete with zero null, NaN, or whitespace missing entries.

---

## 5. Duplicate Analysis
- **Identical Duplicate Rows:** 0 rows.
- **Duplicate `Sample_ID` Keys:** 0 duplicated keys (each ID from 1 to 1500 is unique).
- **Integrity Verdict:** Zero redundant rows; complete key uniqueness confirmed.

---

## 6. Greywater Source Distribution
The samples are distributed across four domestic greywater sources:

| Greywater Source | Sample Count | Percentage (%) | Relative Ratio |
| :--- | :--- | :--- | :--- |
| **Laundry** | 456 | 30.40% | ~3.0 / 10 |
| **Bathroom** | 449 | 29.93% | ~3.0 / 10 |
| **Mixed** | 388 | 25.87% | ~2.6 / 10 |
| **Kitchen** | 207 | 13.80% | ~1.4 / 10 |
| **Total** | **1,500** | **100.00%** | **10.0 / 10** |

- **Observations:** The sampling distribution shows balanced representation among Laundry (30.4%), Bathroom (29.9%), and Mixed (25.9%), with Kitchen effluent comprising a realistic minority fraction (13.8%) due to lower overall discharge volumes in typical residential plumbing layouts.

---

## 7. Numerical Feature Statistics
Summary statistics for all 15 numerical water-quality parameters calculated directly from `dataset/main.csv`:

| Parameter | Count | Mean | Std | Min | 25% (Q1) | Median | 75% (Q3) | Max |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **pH** | 1500 | 7.10 | 0.40 | 6.00 | 6.82 | 7.08 | 7.38 | 8.41 |
| **TEMP_C** | 1500 | 27.09 | 4.45 | 18.00 | 24.00 | 26.94 | 30.14 | 38.00 |
| **SAL_ppt** | 1500 | 0.35 | 0.12 | 0.05 | 0.27 | 0.35 | 0.43 | 0.72 |
| **TUR_NTU** | 1500 | 72.64 | 39.07 | 5.00 | 41.22 | 65.57 | 99.14 | 180.00 |
| **DS_mg_L** | 1500 | 370.24 | 157.88 | 91.02 | 262.08 | 343.23 | 447.21 | 980.00 |
| **TDS_mg_L** | 1500 | 385.09 | 163.55 | 100.00 | 272.11 | 357.49 | 463.96 | 1000.00 |
| **TSS_mg_L** | 1500 | 129.08 | 77.84 | 10.00 | 68.29 | 110.70 | 176.37 | 350.00 |
| **COND_uS_cm** | 1500 | 609.61 | 178.78 | 200.00 | 488.02 | 592.09 | 718.56 | 1200.00 |
| **DO_mg_L** | 1500 | 2.68 | 1.54 | 0.30 | 1.37 | 2.83 | 3.88 | 6.61 |
| **BOD_mg_L** | 1500 | 192.01 | 138.09 | 20.00 | 68.78 | 170.39 | 289.97 | 650.00 |
| **COD_mg_L** | 1500 | 404.54 | 252.60 | 50.00 | 171.09 | 364.09 | 593.08 | 1000.00 |
| **NH4F_mg_L** | 1500 | 11.11 | 4.34 | 0.10 | 8.05 | 11.11 | 14.01 | 25.05 |
| **NO3_mg_L** | 1500 | 5.84 | 2.01 | 0.10 | 4.54 | 5.79 | 7.25 | 12.94 |
| **K_mg_L** | 1500 | 18.00 | 5.68 | 0.50 | 14.00 | 17.95 | 21.98 | 36.85 |
| **E_coli_CFU_100mL** | 1500 | 119,352.42 | 176,080.00 | 1,649.00 | 26,249.50 | 60,278.50 | 135,538.75 | 2,031,686.00 |

*Archived file: `reports/dataset_statistics.csv`*

---

## 8. Outlier Analysis (IQR Method)
Using the standard Tukey boxplot convention ($[Q1 - 1.5 \times IQR, Q3 + 1.5 \times IQR]$), potential statistical outliers were identified:

| Parameter | Q1 | Q3 | IQR | Lower Bound | Upper Bound | Outliers Count | Outliers (%) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **pH** | 6.82 | 7.38 | 0.56 | 5.98 | 8.22 | 1 | 0.07% |
| **TEMP_C** | 24.00 | 30.14 | 6.14 | 14.78 | 39.35 | 0 | 0.00% |
| **SAL_ppt** | 0.27 | 0.43 | 0.16 | 0.03 | 0.67 | 12 | 0.80% |
| **TUR_NTU** | 41.22 | 99.14 | 57.92 | -45.66 | 186.03 | 0 | 0.00% |
| **DS_mg_L** | 262.08 | 447.21 | 185.13 | -15.62 | 724.91 | 62 | 4.13% |
| **TDS_mg_L** | 272.11 | 463.96 | 191.85 | -15.66 | 751.74 | 59 | 3.93% |
| **TSS_mg_L** | 68.29 | 176.37 | 108.08 | -93.83 | 338.49 | 26 | 1.73% |
| **COND_uS_cm** | 488.02 | 718.56 | 230.54 | 142.21 | 1064.36 | 25 | 1.67% |
| **DO_mg_L** | 1.37 | 3.88 | 2.51 | -2.39 | 7.64 | 0 | 0.00% |
| **BOD_mg_L** | 68.78 | 289.97 | 221.19 | -263.00 | 621.76 | 9 | 0.60% |
| **COD_mg_L** | 171.09 | 593.08 | 421.99 | -461.90 | 1226.06 | 0 | 0.00% |
| **NH4F_mg_L** | 8.05 | 14.01 | 5.96 | -0.88 | 22.95 | 4 | 0.27% |
| **NO3_mg_L** | 4.54 | 7.25 | 2.71 | 0.47 | 11.32 | 8 | 0.53% |
| **K_mg_L** | 14.00 | 21.98 | 7.98 | 2.03 | 33.96 | 6 | 0.40% |
| **E_coli_CFU_100mL** | 26,249.50 | 135,538.75 | 109,289.25 | -137,684.38 | 299,472.62 | 134 | 8.93% |

*Archived file: `reports/outlier_analysis.csv`*

### Critical Outlier Insights
1. **Biological Contamination Tail:** *E. coli* exhibits 134 high-side outliers (8.93%), reaching up to 2,031,686 CFU/100mL. In water sanitation, highly skewed bacterial distributions are typical following heavy fecal/soap contamination.
2. **Solids Spikes:** Dissolved solids (`DS_mg_L` and `TDS_mg_L`) exhibit ~4% high-end outliers corresponding to concentrated detergent and food-waste washing events.
3. **Domain Validity:** None of these observations reflect impossible data corruption (e.g., negative physical values or pH outside 0-14). They represent authentic high-contamination events essential for training anomaly detection and sewer bypass triggers. **They must NOT be removed.**

---

## 9. Correlation Observations
Pearson correlation coefficients reveal significant physical, chemical, and biological linkages:

| Feature Pair | Pearson $r$ | Underlying Environmental / Physical Mechanism |
| :--- | :--- | :--- |
| `DS_mg_L` $\leftrightarrow$ `TDS_mg_L` | **+0.994** | Near-perfect collinearity; both quantify dissolved mineral solids. |
| `TUR_NTU` $\leftrightarrow$ `TSS_mg_L` | **+0.877** | Strong physical relationship; optical turbidity is primarily scattered by suspended particulate matter. |
| `DO_mg_L` $\leftrightarrow$ `COD_mg_L` | **-0.869** | Strong inverse relationship; chemical oxidants directly consume dissolved oxygen. |
| `BOD_mg_L` $\leftrightarrow$ `COD_mg_L` | **+0.760** | Expected co-variation between biodegradable organic mass (BOD) and total oxidizable carbon (COD). |
| `DO_mg_L` $\leftrightarrow$ `BOD_mg_L` | **-0.682** | Severe biological oxygen depletion as heterotrophic microbes metabolize organic matter. |
| `SAL_ppt` $\leftrightarrow$ `COD_mg_L` | **+0.657** | Detergents, culinary seasonings, and cleaners introduce simultaneous salinity and chemical oxidants. |
| `TUR_NTU` $\leftrightarrow$ `COD_mg_L` | **+0.649** | Particulate organics contribute to both cloudiness and chemical oxygen demand. |
| `DO_mg_L` $\leftrightarrow$ `TUR_NTU` | **-0.582** | Turbid streams with high organic suspension correlate with depleted dissolved oxygen. |
| `SAL_ppt` $\leftrightarrow$ `DO_mg_L` | **-0.578** | Elevated salinity and organic surfactant loading depress oxygen solubility. |
| `TEMP_C` $\leftrightarrow$ (all parameters) | **~0.00** | Temperature variance (18–38°C) is essentially uncorrelated with chemical concentration ($|r| \le 0.045$). |

*Archived file: `reports/correlation_matrix.csv`, Figure: `reports/figures/correlation_heatmap.png`*

---

## 10. Source-Wise Water Quality Observations
Grouping parameters by `Greywater_Source` reveals stark differences across domestic origin:

| Parameter | Bathroom (Cleanest) | Kitchen (Heaviest Contamination) | Laundry (Surfactant / Turbid) | Mixed (Blended Baseline) |
| :--- | :--- | :--- | :--- | :--- |
| **pH** | 7.00 | 7.40 | 6.90 | 7.27 |
| **TUR_NTU** | 35.26 | **116.77** | 94.06 | 67.17 |
| **TDS_mg_L** | 285.66 | **607.25** | 434.19 | 323.91 |
| **TSS_mg_L** | 63.08 | **205.39** | 167.20 | 119.96 |
| **COND_uS_cm** | 513.51 | **843.34** | 656.79 | 540.67 |
| **DO_mg_L** | **4.18** | **0.88** (Near Anoxic) | 1.68 | 3.08 |
| **BOD_mg_L** | 54.56 | **349.35** | 283.35 | 159.77 |
| **COD_mg_L** | 133.36 | **755.04** | 579.12 | 326.18 |
| **E_coli_CFU_100mL** | 37,693.29 | **281,109.15** | 130,044.35 | 114,985.88 |

*Archived file: `reports/source_quality_statistics.csv`, Figure: `reports/figures/source_wise_comparison.png`*

### Source Archetypes
1. **Bathroom Effluent:** Characterized by lowest turbidity (35.26 NTU), lowest BOD (54.56 mg/L), highest DO (4.18 mg/L), and lowest pathogen counts (37,693 CFU/100mL). This represents the primary candidate for decentralized treatment into `Indoor Reuse` or `Restricted Irrigation`.
2. **Kitchen Effluent:** Represents extreme contamination with high organic solids (TSS 205.39 mg/L), massive chemical and biological oxygen demand (COD 755.04 mg/L, BOD 349.35 mg/L), near-anoxic oxygen levels (0.88 mg/L), and dense pathogen presence (281,109 CFU/100mL). Highly prone to rapid septic breakdown; primary candidate for `Sewer Bypass` or rigorous industrial bio-filtration.
3. **Laundry Effluent:** Characterized by high suspended lint/turbidity (94.06 NTU), elevated detergent salts and conductivity (656.79 μS/cm), and moderate-to-high BOD (283.35 mg/L). Requires filtration polishing prior to secondary irrigation.

---

## 11. Existing Target Analysis & Limitations

### Findings for `Water_Quality_Class`
- **Unique Classes:** Exactly 1 class (`"Needs Treatment"`)
- **Class Counts:** 1,500 samples
- **Class Percentage:** 100.00%
- **Target Distribution Figure:** `reports/figures/target_distribution.png`

### Critical Target Limitations
1. **Zero Variance Degeneracy:** In machine learning, a target vector with zero variance ($Var(Y) = 0$) provides zero information entropy. Supervised algorithms (XGBoost, Random Forest, Logistic Regression) cannot train on a single-class target.
2. **Total Absence of Routing Tiers:** The four planned operational reuse destinations:
   - `Indoor Reuse`
   - `Restricted Irrigation`
   - `Bio-filtration`
   - `Sewer Bypass`
   **do NOT exist anywhere in the raw dataset.**
3. **Conclusion:** The legacy column `Water_Quality_Class` cannot serve as the machine learning routing target. Treating it as such would result in a completely broken ML pipeline.

---

## 12. Data Leakage and Feature Role Specification

| Column | Assigned Role | Modeling Action | Justification |
| :--- | :--- | :--- | :--- |
| `Sample_ID` | Database Identifier | **Drop** | Sequential index creates artificial memorization and test leakage. |
| `Greywater_Source` | Contextual Metadata | **One-Hot / Target Encode** | Physical origin strongly governs chemical profiles. |
| `Water_Quality_Class` | Legacy Status Label | **Exclude from Features** | Label column; inclusion in feature matrix $X$ would constitute direct target leakage. |
| `15 Numerical Parameters` | Continuous Predictors | **Scale & Retain** | Physicochemical and biological sensor measurements providing valid predictive signal. |

---

## 13. Preparation Requirements for Phase 3 (Routing Label Design & Preprocessing)

To progress systematically into Phase 3, the following tasks must be prepared:
1. **Multi-Tier Routing Formulation (Domain Rules):** Formulate rule-based boundary criteria based on international water reuse standards (EPA / WHO greywater guidelines) across pH, turbidity, TDS, BOD, COD, and *E. coli* to assign every sample to one of the 4 target classes:
   - Tier 1: `Indoor Reuse`
   - Tier 2: `Restricted Irrigation`
   - Tier 3: `Bio-filtration`
   - Tier 4: `Sewer Bypass`
2. **Collinearity Handling:** `DS_mg_L` and `TDS_mg_L` share $r = 0.994$. One of these features should be dropped or combined to avoid multi-collinearity in linear estimators and feature attribution noise in tree SHAP.
3. **Pathogen & Solids Skew Transformations:** Apply log-scaling or robust scaling to `E_coli_CFU_100mL` and solids parameters before distance-based or linear anomaly detection.
4. **Data Safety Assurance:** The raw file `dataset/main.csv` will remain completely preserved in its original location, and all Phase 3 engineered datasets will be saved to `dataset/processed/`.
