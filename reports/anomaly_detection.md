# Isolation Forest Anomaly Detection Documentation
## AI-Driven Intelligent Greywater Management and Smart Reuse Routing System

---

### 1. Architectural Purpose & Motivation

In decentralized wastewater recycling, systems regularly encounter unforeseen multivariate variations:
* Accidental chemical disposal (e.g., household bleach, solvents, automotive fluid residues).
* Telemetry sensor drift or calibration degradation.
* Extreme thermal spikes (e.g., boiling water discharge).

Supervised classification models (such as XGBoost) are trained to map known inputs to predefined classes, but they can produce dangerously overconfident predictions when evaluated on out-of-distribution (OOD) data. The unsupervised **Isolation Forest** serves as an independent safety guardrail, inspecting whether incoming water quality conforms to the typical geometric manifold of normal domestic effluent.

---

### 2. Algorithm Overview & Input Features

The Isolation Forest algorithm isolates observations by randomly selecting a feature and randomly selecting a split value between the maximum and minimum values of that feature. Because anomalies typically lie in low-density regions, they require noticeably fewer recursive splits to isolate than normal nominal points.

* **Input Features:** Standardized 19-dimensional feature vector matching the supervised classifier:
  * 4 One-Hot Fixture Source Indicators (`Bathroom`, `Kitchen`, `Laundry`, `Mixed`)
  * 15 Physicochemical and Biological Parameters ($pH$, $TEMP\_C$, $SAL\_ppt$, $TUR\_NTU$, $DS\_mg\_L$, $TDS\_mg\_L$, $TSS\_mg\_L$, $COND\_uS\_cm$, $DO\_mg\_L$, $BOD\_mg\_L$, $COD\_mg\_L$, $NH4F\_mg\_L$, $NO3\_mg\_L$, $K\_mg\_L$, $E\_coli\_CFU\_100mL$)
* **Model Serialization Artifact:** `models/isolation_forest.pkl`
* **Source Implementation:** `anomaly/anomaly_detector.py`

---

### 3. Training Procedure & Contamination Configuration

* **Reference Dataset:** Trained on clean baseline training samples ($n=1,050$) from `dataset/processed/train.csv`.
* **Hyperparameters:**
  * `n_estimators`: $100$ isolation trees.
  * `contamination`: $0.05$ ($5\%$). Assumes approximately $5\%$ of the reference dataset represents naturally occurring tail extremities.
  * `max_samples`: `'auto'` ($\min(256, n)$).
  * `random_state`: $42$ (guarantees deterministic evaluation).
* **Observed Baseline Characteristics:**
  * Baseline False Alarm Rate on Nominal Training Data: **4.90%** (closely matching the configured 5% parameter).
  * Detection Sensitivity on Acute Synthetic Chemical Spikes: **100.0%**.

---

### 4. Anomaly Score Formulation & Mathematical Thresholds

The anomaly score $s(x, n)$ for an input vector $x$ across an ensemble of $n$ instances is formulated as:
$$s(x, n) = 2^{-\frac{E(h(x))}{c(n)}}$$
where $h(x)$ is the path length to isolate sample $x$, $E(h(x))$ is the expected path length across all isolation trees, and $c(n)$ is the average path length of an unsuccessful search in a Binary Search Tree (BST).

* In scikit-learn's implementation, the decision function returns a shifted offset score:
  * **Score $< 0.0$:** Classified as an **Anomaly** (`is_anomaly = True`, status: `ANOMALY_REVIEW`).
  * **Score $\ge 0.0$:** Classified as **Normal** (`is_anomaly = False`, status: `NORMAL`).
  * A larger positive score indicates that the sample is deeply embedded within the dense, normal region of the training distribution.

---

### 5. Anomaly Interpretation & Non-Forcing Safety Interaction

> [!IMPORTANT]
> **Mandatory Core Principle:**
> **"An anomaly indicates statistical unusualness relative to the detector's reference distribution and is not by itself proof of unsafe water."**

#### The Risk of Automatic Sewer Diversion
If every detected anomaly automatically forced water into the sewer, the system would suffer from severe operational inefficiency. For example, warm bathwater with elevated mineral conductivity (e.g., Epsom salts) may lie in a low-density region of the training manifold, triggering an anomaly score $< 0.0$. However, its pathogen and organic levels may be well within safe limits for landscape irrigation. Dumping this clean water wastes precious municipal resources.

#### Hierarchical Safety Interaction
The Smart Routing Engine decouples statistical anomaly detection from deterministic physical safety screening:
1. **Anomaly Alone:** If a sample triggers an anomaly flag but violates *zero* physical safety cutoffs ($pH \in [6.0, 9.0]$, $E. coli \le 2000$, $BOD \le 150$), the candidate ML route is **retained**. The system attaches an operational advisory tag (`ANOMALY_REVIEW`, action `ALLOW_ROUTE` or `REVIEW_REQUIRED`) to alert operators without dumping safe water.
2. **Anomaly + Acute Physical Hazard:** If an anomaly is accompanied by an acute physical violation (e.g., $COD > 800\text{ mg/L}$ or $pH < 6.0$), the independent safety layer triggers an immediate **`SAFETY_OVERRIDE`** to **`Sewer Bypass`**.
