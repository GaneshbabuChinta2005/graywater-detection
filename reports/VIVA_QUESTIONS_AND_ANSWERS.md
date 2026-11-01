# Comprehensive Viva Questions and Answers
## AI-Driven Intelligent Greywater Management and Smart Reuse Routing System

This compendium contains 55 rigorous technical viva questions and model answers organized across 15 technical categories (A through O), incorporating all 25 mandatory architectural questions.

---

### Category A: Basic Project Questions

#### Q1. What is the core objective of your project?
* **Short Answer:** To build an autonomous cyber-physical software platform that classifies, monitors, and routes domestic greywater into 4 reuse destinations based on water quality, anomaly detection, deterministic safety rules, weather, storage kinetics, and SHAP explainability.
* **Detailed Answer:** The project addresses the limitations of conventional static greywater systems. By coupling supervised machine learning (XGBoost) with unsupervised anomaly detection (Isolation Forest), deterministic physical safety rules, Open-Meteo weather context, hydraulic storage decay modeling, and TreeSHAP explainability, the system autonomously routes greywater into Sewer Bypass, Bio-filtration, Restricted Irrigation, or Indoor Reuse while guaranteeing fail-safe compliance.

#### Q2. Why is greywater management an urgent engineering problem?
* **Short Answer:** Domestic greywater represents 50–70% of residential wastewater; reusing it conserves freshwater, but improper reuse causes biological fouling, health risks, and storm runoff.
* **Detailed Answer:** Freshwater scarcity affects billions globally. Domestic greywater from showers, sinks, and laundry is voluminous and relatively low in pathogens compared to toilet blackwater. However, because its quality fluctuates drastically, existing static systems either underutilize clean water or discharge hazardous effluent. An intelligent routing system enables decentralized circular water economics.

#### Q3. What is the overall architecture of your system?
* **Short Answer:** Inflow telemetry $\rightarrow$ 19-D Preprocessing $\rightarrow$ XGBoost + Isolation Forest $\rightarrow$ Independent Safety Layer $\rightarrow$ Weather Context $\rightarrow$ Storage Decay $\rightarrow$ Central Smart Routing Engine $\rightarrow$ TreeSHAP $\rightarrow$ Streamlit UI.
* **Detailed Answer:** The architecture is a multi-tier cyber-physical pipeline. Incoming water is converted to a 19-dimensional vector, evaluated in parallel by an optimized XGBoost classifier and an Isolation Forest, screened by hardcoded physical safety rules, modulated by meteorological and tank decay context, arbitrated through a 6-tier hierarchical engine, explained via TreeSHAP waterfall charts, and displayed in a 10-page Streamlit dashboard.

#### Q4. What is the main contribution of your project? *(Mandatory Q25)*
* **Short Answer:** A system-level cyber-physical integration coupling predictive ML with deterministic safety precedence, environmental context, storage kinetics, and explainability.
* **Detailed Answer:** The primary contribution is architectural and system-level. Rather than treating water quality as an isolated ML classification problem, the project integrates supervised learning with an independent unsupervised anomaly guardrail, deterministic physical safety precedence that unconditionally overrides ML predictions, meteorological weather deferral, Arrhenius storage decay tracking, and TreeSHAP transparency into a unified, auditable prototype.

---

### Category B: Dataset Questions

#### Q5. What are the key characteristics of your baseline dataset?
* **Short Answer:** 1,500 samples, 18 columns, 0 missing values, 0 duplicates, spanning 4 fixture sources and 14 physicochemical/biological parameters.
* **Detailed Answer:** Located at `dataset/main.csv` (SHA-256 verified), the dataset comprises 1,500 records representing Bathroom ($29.93\%$), Laundry ($30.40\%$), Kitchen ($13.80\%$), and Mixed ($25.87\%$) streams. It tracks 14 parameters: $pH$, temperature, salinity, turbidity, DS, TDS, TSS, conductivity, DO, BOD, COD, $NH_4F$, $NO_3$, $K$, and *E. coli*.

#### Q6. What are the four operational routing classes? *(Mandatory Q5)*
* **Short Answer:** Class 0: Sewer Bypass, Class 1: Bio-filtration, Class 2: Restricted Irrigation, Class 3: Indoor Reuse.
* **Detailed Answer:** 
  * *Class 0 (Sewer Bypass, 29.73%):* Untreatable high-hazard effluent diverted to municipal sewers.
  * *Class 1 (Bio-filtration, 48.13%):* Moderate organics/surfactants routed to constructed wetlands or sand filters.
  * *Class 2 (Restricted Irrigation, 19.87%):* Low pathogen wash water approved for subsurface landscape irrigation.
  * *Class 3 (Indoor Reuse, 2.27%):* Tertiary-grade water suitable for non-potable toilet flushing.

#### Q7. How were the routing labels generated? *(Mandatory Q6)*
* **Short Answer:** Systematically engineered in Phase 3 by applying a multi-parameter scoring matrix based on US EPA (2012) and WHO (2006) water reuse guidelines.
* **Detailed Answer:** The original dataset target (`Water_Quality_Class`) had zero variance (100% "Needs Treatment"). In Phase 3, we defined deterministic threshold matrices mapping multi-parametric pollutant combinations ($E. coli$, BOD, COD, TSS, turbidity, pH) into the four operational tiers according to international reuse standards.

#### Q8. Are the routing labels real expert ground truth? *(Mandatory Q7)*
* **Short Answer:** No, they are rule-derived operational labels, not independently measured clinical or biological ground truth.
* **Detailed Answer:** The labels were mathematically derived from documented regulatory threshold rules. While based on established EPA and WHO criteria, they represent simulated operational targets rather than independently cultured laboratory bioassays.

#### Q9. How did you split the dataset to prevent data leakage?
* **Short Answer:** Stratified 70/15/15 partition (Train: 1,050; Validation: 225; Test: 225) with all scalers fitted strictly on training data.
* **Detailed Answer:** We enforced strict data hygiene. The 1,500 samples were partitioned using stratified sampling based on `Routing_Class`. Preprocessing scalers, encoders, and normalization parameters were fitted exclusively on the 1,050 training samples. The 225-sample test partition remained completely sealed until final model evaluation in Phase 6.

---

### Category C: Machine Learning Fundamentals

#### Q10. What is the difference between classification and anomaly detection? *(Mandatory Q4)*
* **Short Answer:** Classification maps inputs to predefined known classes (supervised); anomaly detection identifies whether an input deviates from the expected normal distribution (unsupervised).
* **Detailed Answer:** Classification (XGBoost) learns decision boundaries partitioning known feature space into predefined categories based on labeled training data. Anomaly detection (Isolation Forest) models the geometric density of normal data without target labels, identifying novel or out-of-distribution observations that lie outside the typical training manifold.

#### Q11. Why did you use one-hot encoding for the greywater source?
* **Short Answer:** Fixture sources (Bathroom, Laundry, Kitchen, Mixed) are nominal categories without inherent numerical ordering.
* **Detailed Answer:** Ordinal encoding (e.g., assigning 1, 2, 3, 4) would impose an artificial mathematical distance and hierarchy between fixtures. One-hot encoding creates 4 orthogonal binary features, allowing tree models to evaluate source-specific splits independently.

#### Q12. Did you use SMOTE or synthetic oversampling? Why or why not?
* **Short Answer:** No. Synthetic oversampling was avoided because interpolating between chemical features creates non-physical water samples.
* **Detailed Answer:** While Class 3 is a minority ($2.27\%$), applying SMOTE generates synthetic points via linear interpolation between neighboring samples. In aquatic chemistry, interpolating non-linear coupled parameters (such as $pH$ and dissolved oxygen or $COD$ and $DO$) frequently manufactures chemically impossible data vectors that degrade model integrity.

---

### Category D: XGBoost Classifier

#### Q13. Why did you choose XGBoost? *(Mandatory Q1)*
* **Short Answer:** Exceptional gradient-boosted decision tree performance on tabular numerical data, robust handling of non-linearities, and native TreeSHAP compatibility.
* **Detailed Answer:** Tabular environmental datasets are characterized by non-linear relationships, threshold cutoffs, and collinearities (e.g., DS and TDS). XGBoost uses second-order Taylor expansions, built-in L1/L2 regularization to prevent overfitting, handles scale variations without requiring aggressive transformations, and integrates seamlessly with polynomial-time TreeSHAP algorithms.

#### Q14. What are the key hyperparameters of your optimized XGBoost model?
* **Short Answer:** `n_estimators=120`, `max_depth=5`, `learning_rate=0.08`, `subsample=0.85`, `colsample_bytree=0.85`, `objective='multi:softprob'`.
* **Detailed Answer:** Tuned via 5-fold cross-validation on the training set using Bayesian search. Limiting tree depth to 5 and setting subsampling to 0.85 prevented memorization of high-dimensional correlations while maintaining excellent generalizability across the 4 classes.

#### Q15. What performance did the optimized XGBoost achieve?
* **Short Answer:** 97.78% test accuracy, 0.7346 Macro F1, 0.9756 Weighted F1, and 0.9701 Sewer Bypass recall.
* **Detailed Answer:** Evaluated on the 225-sample holdout test partition, the model correctly classified 220 of 225 samples. Crucially, recall on Class 0 (Sewer Bypass) reached 97.01%, ensuring that severe hazards are caught directly by the ML classifier.

---

### Category E: Random Forest Baseline

#### Q16. Why did you choose Random Forest as a comparison model? *(Mandatory Q2)*
* **Short Answer:** Robust bagging ensemble benchmark to validate whether gradient boosting provided superior boundary separation.
* **Detailed Answer:** Random Forest is the standard, battle-tested baseline for tabular environmental classification. Evaluating a 150-tree Random Forest baseline allowed us to objectively determine whether gradient boosting (XGBoost) provided statistically meaningful improvements in precision and minority class recall.

#### Q17. How did Random Forest perform compared to XGBoost?
* **Short Answer:** Random Forest achieved 96.00% accuracy and 0.7228 Macro F1, slightly lower than XGBoost's 97.78% and 0.7346.
* **Detailed Answer:** Random Forest performed respectably (96.00% accuracy, 0.9580 Weighted F1, 0.9701 Sewer Recall), but XGBoost achieved tighter decision boundaries on intermediate classes (Bio-filtration and Restricted Irrigation), demonstrating the value of sequential gradient boosting.

---

### Category F: Isolation Forest Anomaly Detection

#### Q18. Why did you choose Isolation Forest? *(Mandatory Q3)*
* **Short Answer:** Highly efficient, tree-based unsupervised outlier detection that isolates anomalies using recursive partitioning without assuming normal distributions.
* **Detailed Answer:** Parametric anomaly detectors assume multivariate Gaussian distributions, which fails on multimodal water quality data. Isolation Forest recursively partitions features; because anomalies are few and structurally different, they require noticeably fewer splits to isolate, providing an efficient $O(n \log n)$ anomaly detector.

#### Q19. What features are fed into the Isolation Forest?
* **Short Answer:** The identical canonical 19-dimensional feature vector fed into the supervised XGBoost model.
* **Detailed Answer:** Standardizing the feature representation (4 one-hot sources + 15 physical, chemical, and biological parameters) ensures that both supervised classification and unsupervised anomaly detection operate on the exact same geometric manifold.

#### Q20. What is your contamination rate, and what does it mean?
* **Short Answer:** 0.05 (5%); it represents the expected proportion of tail outliers in the baseline training data.
* **Detailed Answer:** Setting `contamination=0.05` tells the algorithm to set its anomaly score offset such that approximately $5\%$ of the training observations are designated as anomalies. During validation, nominal clean data exhibited a $4.90\%$ flag rate, perfectly aligning with the configured parameter.

#### Q21. What happens when an anomaly is detected? *(Mandatory Q19)*
* **Short Answer:** The sample is assigned `status = ANOMALY_REVIEW` and flagged in audit logs, but its candidate reuse route is preserved unless physical safety cutoffs are breached.
* **Detailed Answer:** When `is_anomaly = True` (score $< 0.0$), the system tags the parcel with reason code `ANOMALY_DETECTED`. In the Smart Routing Engine, the candidate ML route is retained under advisory status (`ALLOW_ROUTE` or `REVIEW_REQUIRED`), alerting facility engineers to inspect unusual parameters without dumping safe water.

#### Q22. Why doesn't every anomaly automatically cause Sewer Bypass? *(Mandatory Q20)*
* **Short Answer:** An anomaly indicates statistical novelty, not biological toxicity. Dumping safe water with unusual temperatures or minerals wastes resources.
* **Detailed Answer:** An anomaly simply means an observation lies in a low-density region of the training space (e.g., hot bathwater or water with harmless bath salts). If pathogen, organic, and solids levels are well within EPA safety standards, forcing Sewer Bypass would cause immense water wastage. It is instead flagged for operator review.

---

### Category G: Digital Twin & Telemetry Simulation

#### Q23. How does the Digital Twin work? *(Mandatory Q10)*
* **Short Answer:** Generates 15-minute synthetic telemetry modeling residential diurnal usage cycles, flow transitions, thermal dissipation, and sensor noise.
* **Detailed Answer:** Operating on discrete 15-minute time steps ($\Delta t = 15\text{ min}$), the Digital Twin draws parameter baselines from fixture distributions, applies physical cooling laws, simulates diurnal usage surges (morning showers, midday laundry, evening cooking), models tank level changes, and injects Gaussian measurement noise.

#### Q24. Is the Digital Twin real sensor data? *(Mandatory Q11)*
* **Short Answer:** No, it is a synthetic, physics-constrained numerical simulation.
* **Detailed Answer:** The Digital Twin is explicitly designated as **SYNTHETIC DIGITAL TWIN**. It is a software simulation developed to stress-test the downstream decision pipeline and does not originate from live physical IoT hardware.

#### Q25. What fault scenarios can the Digital Twin simulate?
* **Short Answer:** Acute chemical/bleach dumps, high-strength kitchen oil spikes, optical sensor calibration drift, and communication dropouts.
* **Detailed Answer:** The simulator can inject edge-case vectors such as sudden $pH$ drops ($pH < 5.5$), severe COD spikes ($> 1000\text{ mg/L}$), stuck turbidity sensor values, or missing packets to validate that the pipeline responds safely and gracefully.

---

### Category H: Environmental & Weather Context

#### Q26. How does weather affect routing? *(Mandatory Q12)*
* **Short Answer:** Significant precipitation or freezing weather defers active landscape irrigation to storage (`STORE_FOR_LATER`) to prevent surface runoff.
* **Detailed Answer:** When greywater is classified as suitable for *Restricted Irrigation*, the weather provider evaluates local precipitation. If rainfall $\ge 5.0\text{ mm}$ or precipitation probability $\ge 70\%$, the soil is already or will soon be saturated. The system preserves the route but changes the action to `STORE_FOR_LATER`.

#### Q27. Can rainfall override water-quality safety? *(Mandatory Q13)*
* **Short Answer:** Never. Weather affects operational timing, but physical water-quality safety holds absolute precedence.
* **Detailed Answer:** If water has a critical safety violation (e.g., $pH = 5.2$ or $E. coli > 10^5\text{ CFU}/100\text{mL}$), dry and sunny weather ($0.0\text{ mm}$ rain) will never permit reuse. The hazardous stream is diverted immediately to Sewer Bypass with action `SAFETY_OVERRIDE`.

#### Q28. What happens if the weather API fails? *(Mandatory Q21)*
* **Short Answer:** The system falls back to a 30-minute in-memory cache, then to `weather_status = UNAVAILABLE`, continuing routing using conservative safe defaults without crashing.
* **Detailed Answer:** Network calls enforce a 5-second timeout and 2 retries. If unreachable, the system queries cached data. If no cache exists, weather status is set to `UNAVAILABLE`, reason code `WEATHER_UNAVAILABLE` is logged, and indoor reuse/treatment routes operate normally while outdoor irrigation triggers an advisory review.

---

### Category I: Storage Tank & Biochemical Decay

#### Q29. How is storage age calculated? *(Mandatory Q14)*
* **Short Answer:** Monitored via a First-In, First-Out (FIFO) hydraulic queue tracking the residence time of stored water parcels in hours.
* **Detailed Answer:** The storage manager maintains parcel timestamps. Storage age ($t$) represents elapsed hours since inflow. As new water enters, the volume-weighted average retention time of the tank is dynamically updated.

#### Q30. How is biochemical deterioration modeled? *(Mandatory Q15)*
* **Short Answer:** Using temperature-dependent Arrhenius decay kinetics: $k(T) = k_{20} \cdot \theta^{(T - 20)}$ and $I(t) = 1.0 - \exp\left(-k(T) \cdot t^{1.2}\right)$.
* **Detailed Answer:** Stored greywater degrades as aerobic bacteria consume dissolved oxygen. The decay rate accelerates exponentially with temperature ($T$) using baseline rate $k_{20} = 0.045\text{ h}^{-1}$ and coefficient $\theta = 1.072$. The non-linear deterioration index $I(t) \in [0.0, 1.0]$ tracks biological quality loss.

#### Q31. Can your model predict exact shelf life? *(Mandatory Q16)*
* **Short Answer:** No. It provides a mechanistic operational approximation; exact real-world shelf-life is not experimentally validated.
* **Detailed Answer:** Real-world microbial decay depends on initial bacterial community composition, biofilm formation on tank walls, and nutrient ratios. Our Arrhenius model provides an engineering approximation for operational screening, not a certified biological assay.

#### Q32. What happens when stored water exceeds its shelf-life?
* **Short Answer:** When $I(t) \ge 0.70$ ($> 24-48\text{ h}$), the action is escalated to `REVIEW_REQUIRED` or `RECIRCULATE`; septic water ($I(t) \ge 0.90$) is dumped to Sewer Bypass.
* **Detailed Answer:** Stagnant water with depleted oxygen cannot be safely sprayed on lawns. The system alerts operators, engages recirculation/aeration pumps, or downgrades the stream to Bio-filtration or Sewer Bypass.

---

### Category J: Central Smart Routing Engine

#### Q33. What is the difference between route and action? *(Mandatory Q24)*
* **Short Answer:** Route is the physical destination (where water goes); Action is the immediate operational command issued to actuators (what valves/pumps do now).
* **Detailed Answer:** Route (`final_route`) defines the fitness-for-purpose category (e.g., `Restricted Irrigation`). Action (`final_action`) instructs physical hardware whether to dispatch immediately (`ALLOW_ROUTE`), defer to storage (`STORE_FOR_LATER`), recirculate (`RECIRCULATE`), or force bypass (`SAFETY_OVERRIDE`).

#### Q34. What is the decision hierarchy in the Smart Routing Engine?
* **Short Answer:** Tier 1: Safety Layer $\rightarrow$ Tier 2: High-Risk Anomaly $\rightarrow$ Tier 3: ML Inference $\rightarrow$ Tier 4: Storage Decay $\rightarrow$ Tier 5: Weather Context $\rightarrow$ Tier 6: Operational Approval.
* **Detailed Answer:** A strict 6-tier hierarchy where higher tiers hold absolute veto power. Critical water-quality cutoffs ($pH$, pathogens, COD) preempt all downstream layers. If safe, ML predictions are evaluated, modulated by storage deterioration and weather forecasts, before an operational action is emitted.

#### Q35. What happens if the ML model is unavailable? *(Mandatory Q23)*
* **Short Answer:** The system raises an explicit `MODEL_UNAVAILABLE` exception; it never silently trains a new model or fabricates random predictions.
* **Detailed Answer:** If model artifacts are missing or corrupted, the pipeline terminates inference with a clear error. In a cyber-physical system, guessing or silently replacing models with random heuristics is a severe safety violation.

---

### Category K: SHAP Explainability

#### Q36. What does SHAP explain? *(Mandatory Q17)*
* **Short Answer:** Quantifies the additive mathematical contribution of each input feature toward the model's output prediction log-odds.
* **Detailed Answer:** Based on cooperative game theory, TreeSHAP calculates Shapley values for each feature relative to the expected base value: $f(x) = E[f(x)] + \sum \phi_i$. It explains why the model predicted a specific class for a specific sample.

#### Q37. Does SHAP prove causality? *(Mandatory Q18)*
* **Short Answer:** No. SHAP explains the model's internal mathematical behavior, not biological or physical causality.
* **Detailed Answer:** A high SHAP value indicates that a feature strongly influenced the model's numerical output. It does not prove that modifying that feature in physical plumbing will biologically cause water to become safe or eliminate unmeasured contaminants.

#### Q38. What are the top global features identified by SHAP?
* **Short Answer:** Total Suspended Solids (`TSS_mg_L`), *E. coli* (`E_coli_CFU_100mL`), BOD, COD, and Dissolved Oxygen.
* **Detailed Answer:** Mean absolute SHAP rankings confirm that suspended solids and fecal coliforms are the primary mathematical drivers separating sewer bypass and bio-filtration from clean landscape and indoor reuse.

#### Q39. What happens if SHAP fails or is unavailable? *(Mandatory Q22)*
* **Short Answer:** The system catches the error and outputs `SHAP_UNAVAILABLE`; the central routing engine continues operating normally.
* **Detailed Answer:** Explainability is an auditing layer. We implemented resilient exception handling ensuring that SHAP memory allocation errors or missing visualization packages never interrupt real-time physical water routing.

---

### Category L: Streamlit Dashboard & UI

#### Q40. How is the Streamlit dashboard structured?
* **Short Answer:** 10 dedicated operational pages backed by a centralized singleton `DashboardService` and custom CSS styling.
* **Detailed Answer:** The multi-page architecture includes Executive Dashboard, Live Monitoring, Water Quality Radar, Smart Routing, Storage Tank, Weather Context, Anomaly Detection, AI Explainability, Reports, and System Information.

#### Q41. What evaluation modes does the dashboard support?
* **Short Answer:** Automated Digital Twin simulation streaming, manual precision slider adjustment, pre-configured scenario presets, and batch CSV file upload.
* **Detailed Answer:** Operators can advance simulation steps, select realistic presets (e.g., Bathroom Irrigation, Kitchen Sewer Bypass), manually drag sliders to test edge cases, or upload arbitrary multi-sample CSV files for bulk pipeline processing.

---

### Category M: System Limitations

#### Q42. What does your accuracy actually measure? *(Mandatory Q8)*
* **Short Answer:** Agreement with the rule-derived operational routing labels engineered in Phase 3.
* **Detailed Answer:** Because ground-truth labels were engineered using deterministic regulatory threshold scoring, the 97.78% test accuracy measures how faithfully the XGBoost model learned to replicate those operational rules.

#### Q43. Why is this limitation important? *(Mandatory Q9)*
* **Short Answer:** Describing accuracy as '97.78% safe reuse prediction' is scientifically false and legally dangerous.
* **Detailed Answer:** Real-world safety requires certified laboratory culturing and physical hardware verification. Conflating algorithmic rule agreement with empirical microbiological safety would provide a false sense of security in public health infrastructure.

#### Q44. Can this model be used for hospital or industrial wastewater?
* **Short Answer:** No. It is calibrated strictly for domestic residential greywater.
* **Detailed Answer:** Hospital and industrial effluents contain pharmaceuticals, radioisotopes, heavy metals, and toxic solvents that require specialized multi-barrier tertiary treatment far beyond residential greywater models.

---

### Category N: Future Work & Roadmap

#### Q45. What are the immediate next steps to make this physical infrastructure?
* **Short Answer:** Porting inference logic to embedded microcontrollers (ESP32) interfaced with industrial ISFET pH, optical turbidity, and conductivity sensors.
* **Detailed Answer:** Future deployment involves building a physical pilot recycling rig, testing optical lens anti-fouling transducers, acquiring longitudinal microbiological decay datasets, and implementing edge TinyML inference.

#### Q46. How would you improve decision optimization in future iterations?
* **Short Answer:** Transition from reactive rule arbitration to Model Predictive Control (MPC) and Deep Reinforcement Learning.
* **Detailed Answer:** An MPC agent could ingest 72-hour weather forecasts and tariff schedules to proactively pre-drain tanks before storm events and optimize pump energy consumption.

---

### Category O: Research & Engineering Contribution

#### Q47. What is the fundamental novelty of your project?
* **Short Answer:** A system-level cyber-physical architecture proving that machine learning can be safely deployed in public health infrastructure when coupled with deterministic overrides.
* **Detailed Answer:** The novelty is architectural. We demonstrate that AI does not need to operate as an unconstrained black box. By decoupling operational ML optimization from an uncompromisable physical safety layer, we provide a deployable blueprint for smart decentralized water recycling.

#### Q48. What international standards guided your safety thresholds?
* **Short Answer:** US EPA (2012) *Guidelines for Water Reuse* and WHO (2006) *Guidelines for Safe Use of Wastewater and Greywater*.
* **Detailed Answer:** Parameter cutoffs for $pH$ ($6.0-9.0$), *E. coli* ($< 100\text{ CFU}/100\text{mL}$ for indoor; $< 2000$ for restricted irrigation), BOD, and suspended solids directly reflect international microbiological risk assessment frameworks.

#### Q49. How do you guarantee deterministic consistency?
* **Short Answer:** Verified across automated test suites; sequential identical inputs yield mathematically identical predictions, anomaly scores, and actions.
* **Detailed Answer:** All random seeds are fixed (`random_state=42`), preprocessors are deterministic, and decision tree inference is purely deterministic. Automated test `test_routing_determinism_consistency` validates that identical payloads yield identical results.

#### Q50. How many automated tests validate your system?
* **Short Answer:** 132 automated tests across unit, integration, resilience, and determinism suites, achieving a 100% pass rate.
* **Detailed Answer:** Validated in Phase 14 via `pytest -q`, testing all 14 phases across 13 distinct test files in 130.62 seconds with zero failures and zero skipped tests.

#### Q51. What is the difference between BOD and COD, and why track both?
* **Short Answer:** BOD measures biodegradable organic matter; COD measures total chemically oxidizable matter. Tracking both reveals refractory chemical pollutants.
* **Detailed Answer:** BOD reflects organic matter that bacteria can decompose over 5 days. COD includes refractory chemicals and detergents. A high COD with low BOD indicates synthetic chemical contamination that biological sand filters cannot digest, requiring Sewer Bypass.

#### Q52. Why does dissolved oxygen drop in stored greywater?
* **Short Answer:** Aerobic heterotrophic bacteria consume dissolved oxygen to metabolize organic carbon compounds.
* **Detailed Answer:** Biochemical respiration consumes dissolved oxygen faster than atmospheric surface reaeration can replenish it in stagnant tanks. When DO drops below $1.0\text{ mg/L}$, water turns septic and anaerobic bacteria produce foul hydrogen sulfide.

#### Q53. How does the system prevent pump cavitation in the storage tank?
* **Short Answer:** A low-level suction cutoff at 10% capacity ($100\text{ L}$) disengages discharge pumps.
* **Detailed Answer:** Operating pumps below minimum submergence depth introduces air vortices and cavitation, destroying impellers. The storage monitor enforces an automatic software interlock at $100\text{ L}$.

#### Q54. Why is turbidity an important metric in water reuse?
* **Short Answer:** Suspended colloidal particles shield viruses and bacteria from ultraviolet (UV) light disinfection.
* **Detailed Answer:** Even if chemical disinfectant is added, high turbidity ($> 5\text{ NTU}$) provides micro-shadows where pathogens survive. Indoor reuse mandates low turbidity to guarantee tertiary disinfection efficacy.

#### Q55. What is the final takeaway of your project defense?
* **Short Answer:** Sustainable water recycling is achievable by combining artificial intelligence for operational efficiency with deterministic engineering rules for absolute public health safety.
* **Detailed Answer:** Our 15-phase engineering lifecycle demonstrates that decentralized greywater reclamation can be made autonomous, context-aware, transparent, and provably safe, offering a practical cyber-physical prototype for water-resilient smart cities.
