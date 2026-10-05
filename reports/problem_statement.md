# Final Problem Statement Specification
## AI-Driven Intelligent Greywater Management and Smart Reuse Routing System

---

### 1. Context & Background

Water stress affects more than two billion people globally, exacerbated by accelerating urbanization, industrial demand, and climate volatility. Residential water consumption represents a major fraction of municipal demand, with domestic greywater—effluent from bathroom showers, wash basins, laundry washing machines, and kitchen sinks—accounting for 50% to 70% of total household wastewater volume. Because greywater excludes high-load toilet waste (blackwater), it offers immense circular reuse potential for non-potable domestic tasks such as landscape irrigation, toilet flushing, and constructed wetland bio-filtration. 

However, greywater reclamation is severely hindered by the fundamental physical, chemical, and biological heterogeneity of residential discharge streams.

---

### 2. Limitations of Existing Greywater Management Systems

Conventional decentralized greywater reclamation approaches suffer from eight critical technical and operational limitations:

#### 1. Static and Monolithic Decision Approaches
Most installed decentralized greywater systems rely on rigid, fixed-pipe plumbing configurations or hardwired float switches. Effluent is either routed en masse into a single physical filter (e.g., a sand gravel bed) or discharged directly into municipal sewers. These static approaches cannot adapt dynamically to variations in influent quality, resulting in rapid filter clogging when high-load streams enter, or severe underutilization when pristine wash water is generated.

#### 2. Acute Fixture Source Variability
Different domestic fixtures exhibit vastly distinct contaminant profiles:
* *Bathroom effluent* is typically voluminous, low in organic content, but carries surfactants and moderate pathogens.
* *Laundry effluent* contains high concentrations of alkaline detergents, optical brighteners, phosphates, and suspended microfibers.
* *Kitchen sink effluent* carries extreme biochemical oxygen demand (BOD), chemical oxygen demand (COD), cooking oils, and heavy bacterial loads from food preparation.
Existing systems commingle these streams without segregating clean streams from heavily contaminated flows.

#### 3. Lack of Continuous, Integrated Monitoring
Current domestic installations lack multi-parametric telemetry. Traditional manual grab-sampling and laboratory titration methods cannot provide real-time feedback. By the time water contamination is detected, contaminated water has often already been distributed into gardens or plumbing networks.

#### 4. Vulnerability to Multivariate Statistical Anomalies
Decentralized treatment systems frequently encounter unexpected chemical shocks (e.g., accidental disposal of bleach, chemical drain cleaners, paint residues, or medication wash-down). Traditional threshold-based sensors fail to identify subtle multivariate deviations where individual parameters remain marginally within limits but their joint distribution is highly anomalous and hazardous to bio-filters.

#### 5. Absence of Environmental and Meteorological Context
Conventional reuse controllers operate in environmental isolation. For example, timer-based or soil-independent irrigation systems dispatch stored greywater onto lawns regardless of current or impending heavy rainfall. This results in saturated soil conditions, direct surface runoff, and the contamination of local stormwater drains with pathogens and surfactant residues.

#### 6. Neglect of Hydraulic Residence Time and Biochemical Stagnation
Unlike clean potable water, stored greywater is biologically active. When retained in storage tanks, rapid microbial proliferation consumes dissolved oxygen (DO). Within 24 to 48 hours, aerobic conditions collapse into anaerobic stagnation, generating hydrogen sulfide ($H_2S$), volatile fatty acids, offensive odors, and dangerous pathogens. Current systems lack biochemical kinetic models to monitor shelf-life or trigger recirculation and aeration before water turns septic.

#### 7. The "Black-Box" AI Dilemma
Where modern machine-learning models have been proposed in academic literature, they are frequently implemented as unexplainable black-box classifiers. Water reuse is tightly regulated under public health frameworks (e.g., US EPA, WHO). Public health authorities, building engineers, and facility operators cannot audit why an AI model classified an effluent stream as safe, creating regulatory distrust and adoption resistance.

#### 8. Lack of an Integrated, Fail-Safe Decision Engine
Standalone components (ML classifiers, sensors, weather APIs, storage monitors) are rarely integrated into a coherent, hierarchical control architecture. Crucially, pure ML models can exhibit probabilistic edge-case failures. Without a deterministic engineering layer that guarantees absolute safety precedence, ML-guided routing risks exposing humans and ecosystems to biological hazards.

---

### 3. Formal Definition of the Proposed Problem

> **How can a decentralized greywater reclamation system autonomously, safely, and transparently classify heterogeneous, time-varying domestic influent streams into four standardized reuse tiers, while continuously detecting multivariate anomalies, arbitrating meteorological weather constraints, monitoring hydraulic storage decay kinetics, providing mathematical explainability, and enforcing absolute deterministic physical safety precedence?**

---

### 4. Proposed Solution Scope

To resolve this multi-faceted challenge, this project develops a prototype cyber-physical decision support architecture:
1. **Multi-Class Predictive Routing:** An optimized gradient-boosted decision tree (XGBoost) predicts operational reuse fitness across 4 classes (*Sewer Bypass*, *Bio-filtration*, *Restricted Irrigation*, *Indoor Reuse*) using 14 physicochemical and microbiological parameters.
2. **Unsupervised Anomaly Screening:** An independent Isolation Forest identifies out-of-distribution observations for operational review without needlessly forcing clean water into the sewer.
3. **Deterministic Safety Precedence:** An uncompromisable safety layer enforces hardcoded water-quality cutoffs ($pH$, pathogens, COD) that supersede all ML predictions.
4. **Context-Aware Arbitration:** An environmental provider ingests weather forecasts to defer outdoor irrigation during storm events, while an Arrhenius-based storage monitor tracks tank stagnation and biochemical shelf-life.
5. **Explainability & Transparency:** TreeSHAP computes local Shapley feature attributions to provide interpretable, auditable reasoning for every routing recommendation.
6. **Unified Operator Dashboard:** A 10-page interactive Streamlit user interface visualizes streaming telemetry from a physics-constrained Digital Twin simulator, executes single-sample and batch evaluations, and manages operational control.
