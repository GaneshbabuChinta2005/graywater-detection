# Phase 3: Four-Class Greywater Reuse Routing Methodology and Validation Report

**Project Title:** AI-Driven Intelligent Greywater Management and Smart Reuse Routing System  
**Execution Date:** October 2, 2026  
**Status:** Completed & Validated  
**Derived Dataset:** `dataset/processed/greywater_routing_labels.csv`  

---

## 1. Purpose & Operational Objectives

The primary objective of Phase 3 is to establish a transparent, scientifically defensible, multi-tier decision methodology to categorize domestic greywater into four operational routing classes:
- **Class 0:** Sewer Bypass
- **Class 1:** Bio-filtration
- **Class 2:** Restricted Irrigation
- **Class 3:** Indoor Reuse

Phase 2 established that the existing dataset (`dataset/main.csv`) possessed a degenerate single-class label (`"Needs Treatment"` for 100% of samples) and completely lacked operational reuse targets. Phase 3 designs and validates the ground truth required for downstream machine learning (XGBoost, Random Forest) without training any models in this phase.

> ### Mandatory Scientific Disclaimer
> **The initial four-class routing labels are rule-derived operational labels based on documented water-quality criteria and are not equivalent to independently measured expert ground-truth labels.**  
> These designations reflect **operational routing decisions** within an engineered treatment network, NOT assertions that raw greywater is directly potable or safe for unrestricted human contact without multi-barrier processing.

---

## 2. Four Routing Class Definitions

| Class Code | Class Name | Operational Meaning | Treatment Mandate | Safety Flag |
| :---: | :--- | :--- | :--- | :--- |
| **0** | **Sewer Bypass** | Acute biological, organic, or chemical contamination exceeding package treatment limits; toxic shock or septic risk. | Direct municipal sewer diversion; no onsite treatment feasible. | Critical Hazard Failsafe |
| **1** | **Bio-filtration** | Heavy-to-moderate organic, particulate, and microbial load requiring biological oxidation, wetland filtration, or sand bed retention. | Mandatory biological oxidation & multi-media filtration. | Treatment Pathway Mandated |
| **2** | **Restricted Irrigation** | Moderate-quality effluent compliant with non-food agricultural, landscape, and green space irrigation under exposure barriers. | Coarse disc filtration, settling, and localized sub-surface/drip application. | Restricted Non-Potable Irrigation |
| **3** | **Indoor Reuse** | Lowest-risk raw influent (light bathroom greywater) suitable for compact onsite package filtration and disinfection. | Packaged microfiltration, chlorine/UV disinfection, and continuous monitoring. | Low-Risk Non-Potable Reuse |

---

## 3. Parameter Roles & Indicator Stratification

Parameters from `dataset/main.csv` are stratified based on their physical, biological, and chemical function:

### A. Primary Routing & Safety Indicators
1. **`E_coli_CFU_100mL`**: Direct biological pathogen indicator. Quantifies bacterial loading and fecal contamination risk; primary driver of public health safety bypass.
2. **`pH`**: Fundamental chemical equilibrium. Extremes ($<6.0$ or $>9.0$) damage distribution plumbing, inhibit biological treatment microbes, and induce severe phytotoxicity.
3. **`BOD_mg_L` & `COD_mg_L`**: Quantify biodegradable organic mass (BOD) and total oxidizable chemical matter (COD). Dictate biological treatment requirements and anaerobic septicity risks.
4. **`TUR_NTU` & `TSS_mg_L`**: Measure suspended particulate matter and optical scattering. High levels cause emitter clogging, filter fouling, and shield pathogens from UV disinfection.
5. **`TDS_mg_L` & `SAL_ppt`**: Dissolved solids and salinity. Governs osmotic stress in plants, soil salinization, and pipe scaling. Dissolved minerals cannot be removed by standard bio-filters.
6. **`DO_mg_L`**: Dissolved Oxygen. Distinguishes fresh aerobic greywater from depleted/anoxic states ($DO < 1.0\text{ mg/L}$) prone to foul odors ($H_2S$) and septicity.

### B. Supporting Indicators
- **`TEMP_C`**: Governs biological degradation rates, oxygen saturation solubility, and pathogen survival kinetics.
- **`DS_mg_L`**: Dissolved Solids. Excluded as an independent threshold due to near-perfect collinearity with `TDS_mg_L` ($r = 0.994$).
- **`COND_uS_cm`**: Electrical conductivity. Corroborates TDS and salinity; kept as an auxiliary consistency check.

### C. Contextual Indicators
- **`NH4F_mg_L`, `NO3_mg_L`, `K_mg_L`**: Macro-nutrients (nitrogen and potassium compounds). While critical for agronomic fertilisation in irrigation, they do not establish standalone safety cutoffs for raw greywater. Left unconstrained in threshold tables to prevent arbitrary filtering.

---

## 4. Authoritative Standards & Threshold Sources

Thresholds were synthesized from recognized international water reclamation standards:
1. **US EPA Guidelines for Water Reuse (2012 Update, EPA/600/R-12/618 & EPA 625/R-04/108)**: Established influent envelopes for non-potable indoor reuse trains and secondary wastewater irrigation thresholds.
2. **WHO Guidelines for the Safe Use of Wastewater, Excreta and Greywater (2006, Vol 4)**: Provided risk thresholds for localized/drip irrigation and delineated Light vs. Dark greywater characteristics.
3. **ISO 16075-1 / ISO 16075-2 (Treated Wastewater Use for Irrigation Projects)**: Established salinity/TDS categorization (Category A $<500$ mg/L, Category B $500\text{--}800$ mg/L, Category C $>800$ mg/L) and pH tolerance boundaries (6.5–8.4).
4. **NSF/ANSI Standard 350 (Onsite Residential and Commercial Water Reuse Treatment Systems)**: Defined maximum allowable design influent loading for package treatment units ($BOD \le 300\text{--}400$ mg/L, $TSS \le 250$ mg/L, $Turbidity \le 140\text{--}150$ NTU).
5. **FAO Irrigation and Drainage Paper 29 (Water Quality for Agriculture)**: Established salinity phytotoxicity limits ($SAL > 0.60$ ppt causes severe crop osmotic restriction).

*Archived reference: `reports/routing_threshold_reference.csv`*

---

## 5. Multi-Level Decision Hierarchy

```text
Incoming Telemetry Record
            ↓
[STEP 1 & 2: Safety Screening & Severe Contamination Detection]
   - pH < 6.0 or pH > 9.0 ?
   - BOD > 400 mg/L or COD > 800 mg/L ?
   - TSS > 250 mg/L or Turbidity > 140 NTU ?
   - E. coli > 500,000 CFU/100mL ?
   - TDS > 800 mg/L or SAL > 0.60 ppt ?
   - DO < 1.0 mg/L AND (BOD > 300 or COD > 600) ?
            ├── YES ───► CLASS 0: SEWER BYPASS
            └── NO  ───► (Proceed to Step 3)
            ↓
[STEP 3: Biological / Physical Treatment Assessment]
   - BOD > 120 mg/L or COD > 300 mg/L ?
   - TSS > 90 mg/L or Turbidity > 60 NTU ?
   - E. coli > 75,000 CFU/100mL ?
   - DO < 2.0 mg/L ?
            ├── YES ───► CLASS 1: BIO-FILTRATION
            └── NO  ───► (Proceed to Step 4)
            ↓
[STEP 4: Low-Risk Influent Screening (Indoor Reuse vs. Restricted Irrigation)]
   - BOD <= 45 mg/L AND COD <= 125 mg/L ?
   - TSS <= 45 mg/L AND Turbidity <= 25 NTU ?
   - E. coli <= 20,000 CFU/100mL ?
   - TDS <= 300 mg/L AND SAL <= 0.28 ppt ?
   - DO >= 3.5 mg/L AND pH in 6.5–8.0 ?
            ├── YES ───► CLASS 3: INDOOR REUSE
            └── NO  ───► CLASS 2: RESTRICTED IRRIGATION
```

---

## 6. Conflict Resolution & Priority Rules

Real-world water quality features frequently present conflicting signals (e.g. low mineral content but high bacterial count). The decision engine resolves conflicts through explicit priority rules:

1. **Safety Overrides Convenience (Fail-Safe Principle):** Any single severe trigger (e.g. extreme *E. coli* or out-of-bounds pH) immediately routes the stream to `Sewer Bypass`, regardless of how pristine other parameters appear.
2. **Pathogen & Organic Priority over Dissolved Solids:** Low salinity or clear water never permits direct reuse if organic carbon ($BOD > 120$) or pathogen loading ($E.\text{ coli} > 75,000$) is elevated; the stream is mandated to `Bio-filtration`.
3. **Dissolved Solids Irreversibility:** High TDS ($>800$ mg/L) or salinity ($>0.60$ ppt) cannot be remediated by standard biological wetlands or sand filters. If present, the stream bypasses treatment to avoid soil salinization.
4. **All-Criteria Compliance for Indoor Reuse:** A sample only qualifies for `Indoor Reuse` if **every single parameter** falls strictly within the low-risk influent envelope. A single marginal parameter demotes the classification to `Restricted Irrigation`.

---

## 7. Resulting Class Distribution

Application of the baseline scientific decision framework to `dataset/main.csv` yielded the following operational class breakdown:

| Routing Class Code | Operational Destination | Sample Count | Percentage (%) |
| :---: | :--- | :---: | :---: |
| **0** | **Sewer Bypass** | 446 | 29.73% |
| **1** | **Bio-filtration** | 722 | 48.13% |
| **2** | **Restricted Irrigation** | 326 | 21.73% |
| **3** | **Indoor Reuse** | 6 | 0.40% |
| **Total** | | **1,500** | **100.00%** |

*Archived file: `reports/routing_class_distribution.csv`, Figure: `reports/figures/routing_class_distribution.png`*

---

## 8. Source-Wise Distribution Breakdown

Cross-tabulating the assigned routing classes against domestic effluent origins reveals stark physical coherence:

| Greywater Source | Sewer Bypass (Class 0) | Bio-filtration (Class 1) | Restricted Irrigation (Class 2) | Indoor Reuse (Class 3) | Total Samples |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Bathroom** | 0 (0.0%) | 122 (27.2%) | 321 (71.5%) | 6 (1.3%) | 449 |
| **Kitchen** | 191 (92.3%) | 16 (7.7%) | 0 (0.0%) | 0 (0.0%) | 207 |
| **Laundry** | 231 (50.7%) | 225 (49.3%) | 0 (0.0%) | 0 (0.0%) | 456 |
| **Mixed** | 24 (6.2%) | 359 (92.5%) | 5 (1.3%) | 0 (0.0%) | 388 |
| **Total** | **446** | **722** | **326** | **6** | **1,500** |

*Archived file: `reports/routing_class_by_source.csv`, Figure: `reports/figures/routing_class_by_source.png`*

### Source Archetype Insights:
- **Bathroom Greywater:** Provides 100% of all `Indoor Reuse` candidates (6 samples) and 98.5% of all `Restricted Irrigation` volume (321 samples). It triggered zero Sewer Bypass events, proving to be the primary domestic water reclamation asset.
- **Kitchen Greywater:** Overwhelmingly routes to `Sewer Bypass` (92.3%), driven by heavy food solids, fats, oils, grease (FOG), and massive bacterial blooms (*E. coli* up to 2,031,686 CFU/100mL).
- **Laundry Greywater:** Divides evenly between `Sewer Bypass` (50.7%) and `Bio-filtration` (49.3%), driven by suspended lint/turbidity and chemical surfactant concentrations.
- **Mixed Greywater:** Overwhelmingly routes to `Bio-filtration` (92.5%), reflecting blended intermediate effluent where peak kitchen contaminants are diluted but overall organic demand remains elevated.

---

## 9. Label Validation & Integrity Audit

A comprehensive verification audit was executed against all 1,500 generated labels:

| Audit Check | Evaluated Count | Failures | Status | Finding / Integrity Verification |
| :--- | :---: | :---: | :---: | :--- |
| **Missing Routing Labels** | 1,500 | 0 | **PASS** | Every row possesses an assigned integer class $[0 \dots 3]$. |
| **Invalid Class Range** | 1,500 | 0 | **PASS** | All labels conform strictly to valid codes $\{0, 1, 2, 3\}$. |
| **Indoor Reuse Envelope Violations** | 6 | 0 | **PASS** | All 6 indoor samples comply strictly with the low-risk envelope. |
| **Unjustified Sewer Bypass Decisions** | 446 | 0 | **PASS** | 100% of bypass events have documented severe parameter causes. |
| **Priority Masking by Low TDS** | 1,500 | 0 | **PASS** | Zero samples with high organics/pathogens were improperly routed to reuse due to low salinity. |

*Archived file: `reports/routing_label_validation.csv`*

---

## 10. Sensitivity Analysis Across Threshold Envelopes

To test whether the classification structure is robust against reasonable variations in regulatory standards, three scenarios were evaluated:
1. **Stringent Scenario:** Narrower safety margins ($BOD_{bypass} = 350\text{ mg/L}$, $E.\text{ coli}_{bio} = 50,000\text{ CFU/100mL}$, $BOD_{indoor} = 35\text{ mg/L}$).
2. **Baseline Scenario:** Standard international thresholds documented in Section 4.
3. **Lenient Scenario:** Expanded reuse tolerances ($BOD_{bypass} = 450\text{ mg/L}$, $E.\text{ coli}_{bio} = 100,000\text{ CFU/100mL}$, $BOD_{indoor} = 55\text{ mg/L}$).

| Scenario | Sewer Bypass (%) | Bio-filtration (%) | Restricted Irrigation (%) | Indoor Reuse (%) |
| :--- | :---: | :---: | :---: | :---: |
| **Stringent** | 613 (40.9%) | 649 (43.3%) | 238 (15.9%) | 0 (0.0%) |
| **Baseline** | 446 (29.7%) | 722 (48.1%) | 326 (21.7%) | 6 (0.4%) |
| **Lenient** | 301 (20.1%) | 809 (53.9%) | 374 (24.9%) | 16 (1.1%) |

*Archived file: `reports/routing_sensitivity_analysis.csv`*

### Stability Findings:
- The overall tier structure is stable across scenarios: `Bio-filtration` consistently forms the largest category (~43–54%), followed by `Sewer Bypass` (~20–41%) and `Restricted Irrigation` (~16–25%).
- `Indoor Reuse` remains consistently sparse ($0.0\%\text{--}1.1\%$) across all envelopes, demonstrating that the rarity of raw indoor reuse candidates is an inherent physical property of untreated greywater, not an artifact of an overly narrow single threshold.

---

## 11. Scientific Limitations & Critical Observations

1. **Rarity of High-Quality Raw Reuse Influent:**
   - In raw untreated greywater, direct indoor reuse candidates are naturally rare ($0.4\%$).
   - In real-world sanitation systems, "Indoor Reuse" is achieved by **treating greywater through an engineered multi-barrier train**, not by discovering pristine raw water in domestic drains.
2. **Rule-Derived Labels vs. Measured Ground Truth:**
   - The labels generated in this phase are derived from rule-based thresholds representing engineering heuristics and regulatory codes.
   - When training supervised models (XGBoost / Random Forest) in Phase 4, the models are learning the multi-dimensional mapping of these regulatory boundaries, not empirical biological outcomes.
3. **Class Imbalance Implication:**
   - Class 3 contains 6 samples. In Phase 4, stratified k-fold cross-validation or resampling/weighting techniques must be evaluated defensively to avoid degenerate zero-recall predictions for the minority class.

---

## 12. Recommendations for Future Experimental Ground Truth

To advance from rule-derived operational labels to true experimental ground truth:
1. **Post-Treatment Telemetry Acquisition:** Collect paired sensor telemetry before and after physical bio-sand filtration and UV disinfection units.
2. **Expert Microbial Assay Panels:** Conduct laboratory plate counts for pathogen viability post-treatment.
3. **Plumbing and Agronomic Field Trials:** Track soil salinity buildup and toilet valve encrustation under prolonged automated reuse cycles.
