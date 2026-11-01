"""
Isolation Forest Anomaly Detection and Safety Screening Module
AI-Driven Intelligent Greywater Management and Smart Reuse Routing System

This module provides unsupervised statistical anomaly detection to identify unusual
or extreme water quality telemetry observations. It acts as an independent safety
screening layer operating alongside the supervised XGBoost routing classifier.

IMPORTANT ARCHITECTURAL DISTINCTION:
ANOMALY != AUTOMATIC PROOF OF HAZARD.
An anomaly indicates statistical divergence from the baseline training distribution.
Safety overrides require either statistical anomaly status paired with severe physical
water-quality threshold exceedances, or direct rule-based hazard cutoffs.
"""

import sys
import types
import numpy as np
import pandas as pd
import joblib

# Windows Application Control compatibility patch for sklearn C-extensions
if 'sklearn.metrics.cluster._expected_mutual_info_fast' not in sys.modules:
    m1 = types.ModuleType('sklearn.metrics.cluster._expected_mutual_info_fast')
    m1.expected_mutual_information = lambda *a, **kw: 0.0
    sys.modules['sklearn.metrics.cluster._expected_mutual_info_fast'] = m1

if 'sklearn.linear_model._sgd_fast' not in sys.modules:
    m2 = types.ModuleType('sklearn.linear_model._sgd_fast')
    class DummyLoss: pass
    m2.EpsilonInsensitive = DummyLoss
    m2.Hinge = DummyLoss
    m2.ModifiedHuber = DummyLoss
    m2.SquaredEpsilonInsensitive = DummyLoss
    m2.SquaredHinge = DummyLoss
    m2._plain_sgd32 = lambda *a, **kw: None
    m2._plain_sgd64 = lambda *a, **kw: None
    sys.modules['sklearn.linear_model._sgd_fast'] = m2

from sklearn.ensemble import IsolationForest

# Canonical 19 model features established in Phase 4
EXPECTED_FEATURES = [
    "Greywater_Source_Bathroom",
    "Greywater_Source_Kitchen",
    "Greywater_Source_Laundry",
    "Greywater_Source_Mixed",
    "pH",
    "TEMP_C",
    "SAL_ppt",
    "TUR_NTU",
    "DS_mg_L",
    "TDS_mg_L",
    "TSS_mg_L",
    "COND_uS_cm",
    "DO_mg_L",
    "BOD_mg_L",
    "COD_mg_L",
    "NH4F_mg_L",
    "NO3_mg_L",
    "K_mg_L",
    "E_coli_CFU_100mL"
]

# Defensible severe water quality thresholds benchmarked directly against Phase 2
# statistical outlier bounds (Q3 + 1.5*IQR) and upper distribution percentiles
SEVERE_THRESHOLDS = {
    "pH_low": 6.2,
    "pH_high": 8.2,
    "TUR_NTU": 140.0,
    "TDS_mg_L": 750.0,
    "TSS_mg_L": 300.0,
    "BOD_mg_L": 500.0,
    "COD_mg_L": 800.0,
    "E_coli_CFU_100mL": 300000.0,
    "SAL_ppt": 0.65
}


def check_severe_conditions(features_dict):
    """
    Evaluate whether a sample breaches any defensible physical/biological hazard cutoffs.
    
    Parameters
    ----------
    features_dict : dict or pd.Series
        Key-value mapping of water quality parameters.
        
    Returns
    -------
    dict
        'has_severe_condition': bool,
        'severe_violations': list of str
    """
    violations = []
    
    if "pH" in features_dict:
        val = features_dict["pH"]
        if val < SEVERE_THRESHOLDS["pH_low"]:
            violations.append(f"Extreme Acidic pH ({val:.2f} < {SEVERE_THRESHOLDS['pH_low']})")
        elif val > SEVERE_THRESHOLDS["pH_high"]:
            violations.append(f"Extreme Alkaline pH ({val:.2f} > {SEVERE_THRESHOLDS['pH_high']})")
            
    if "TUR_NTU" in features_dict and features_dict["TUR_NTU"] > SEVERE_THRESHOLDS["TUR_NTU"]:
        violations.append(f"Extreme Turbidity ({features_dict['TUR_NTU']:.1f} > {SEVERE_THRESHOLDS['TUR_NTU']} NTU)")
        
    if "TDS_mg_L" in features_dict and features_dict["TDS_mg_L"] > SEVERE_THRESHOLDS["TDS_mg_L"]:
        violations.append(f"Extreme TDS ({features_dict['TDS_mg_L']:.1f} > {SEVERE_THRESHOLDS['TDS_mg_L']} mg/L)")
        
    if "TSS_mg_L" in features_dict and features_dict["TSS_mg_L"] > SEVERE_THRESHOLDS["TSS_mg_L"]:
        violations.append(f"Extreme TSS ({features_dict['TSS_mg_L']:.1f} > {SEVERE_THRESHOLDS['TSS_mg_L']} mg/L)")
        
    if "BOD_mg_L" in features_dict and features_dict["BOD_mg_L"] > SEVERE_THRESHOLDS["BOD_mg_L"]:
        violations.append(f"Extreme BOD ({features_dict['BOD_mg_L']:.1f} > {SEVERE_THRESHOLDS['BOD_mg_L']} mg/L)")
        
    if "COD_mg_L" in features_dict and features_dict["COD_mg_L"] > SEVERE_THRESHOLDS["COD_mg_L"]:
        violations.append(f"Extreme COD ({features_dict['COD_mg_L']:.1f} > {SEVERE_THRESHOLDS['COD_mg_L']} mg/L)")
        
    if "E_coli_CFU_100mL" in features_dict and features_dict["E_coli_CFU_100mL"] > SEVERE_THRESHOLDS["E_coli_CFU_100mL"]:
        violations.append(f"Extreme Pathogens ({features_dict['E_coli_CFU_100mL']:.1f} > {SEVERE_THRESHOLDS['E_coli_CFU_100mL']} CFU/100mL)")
        
    if "SAL_ppt" in features_dict and features_dict["SAL_ppt"] > SEVERE_THRESHOLDS["SAL_ppt"]:
        violations.append(f"Extreme Salinity ({features_dict['SAL_ppt']:.2f} > {SEVERE_THRESHOLDS['SAL_ppt']} ppt)")
        
    return {
        "has_severe_condition": len(violations) > 0,
        "severe_violations": violations
    }


class GreywaterAnomalyDetector:
    """
    Unsupervised Isolation Forest anomaly detector and safety screening engine.
    """
    def __init__(self, contamination=0.02, n_estimators=200, random_state=42):
        self.contamination = contamination
        self.n_estimators = n_estimators
        self.random_state = random_state
        self.model = IsolationForest(
            contamination=self.contamination,
            n_estimators=self.n_estimators,
            random_state=self.random_state,
            n_jobs=-1
        )
        self.is_fitted = False
        self.feature_names = EXPECTED_FEATURES

    def fit(self, X):
        """Fit Isolation Forest strictly on training feature matrix."""
        if isinstance(X, pd.DataFrame):
            missing = [c for c in self.feature_names if c not in X.columns]
            if missing:
                raise ValueError(f"Input DataFrame is missing required features: {missing}")
            X_mat = X[self.feature_names].values
        else:
            X_mat = np.asarray(X)
            if X_mat.shape[1] != len(self.feature_names):
                raise ValueError(f"Expected {len(self.feature_names)} features, got {X_mat.shape[1]}")
                
        self.model.fit(X_mat)
        self.is_fitted = True
        return self

    def predict_anomaly(self, X):
        """
        Predict anomaly status.
        
        Returns
        -------
        np.ndarray of bool
            True if sample is an anomaly (-1 in sklearn), False if normal (1 in sklearn).
        """
        if not self.is_fitted:
            raise RuntimeError("Anomaly detector must be fitted before predict_anomaly().")
        if isinstance(X, pd.DataFrame):
            missing = [c for c in self.feature_names if c not in X.columns]
            if missing:
                raise ValueError(f"Input DataFrame is missing required features: {missing}")
            X_mat = X[self.feature_names].values
        else:
            X_mat = np.asarray(X)
            if X_mat.shape[1] != len(self.feature_names):
                raise ValueError(f"Expected {len(self.feature_names)} features, got {X_mat.shape[1]}")
        preds = self.model.predict(X_mat)
        return (preds == -1)

    def calculate_anomaly_score(self, X):
        """
        Calculate continuous anomaly score from decision function.
        
        Lower (more negative) values indicate greater degree of isolation/anomalousness.
        Zero is the decision boundary threshold for the specified contamination rate.
        """
        if not self.is_fitted:
            raise RuntimeError("Anomaly detector must be fitted before calculate_anomaly_score().")
        if isinstance(X, pd.DataFrame):
            missing = [c for c in self.feature_names if c not in X.columns]
            if missing:
                raise ValueError(f"Input DataFrame is missing required features: {missing}")
            X_mat = X[self.feature_names].values
        else:
            X_mat = np.asarray(X)
            if X_mat.shape[1] != len(self.feature_names):
                raise ValueError(f"Expected {len(self.feature_names)} features, got {X_mat.shape[1]}")
        return self.model.decision_function(X_mat)

    def analyze_anomaly(self, sample):
        """
        Audit an individual sample to identify triggered severe conditions.
        """
        if isinstance(sample, pd.Series):
            sample_dict = sample.to_dict()
        elif isinstance(sample, dict):
            sample_dict = sample
        elif isinstance(sample, (list, np.ndarray)):
            sample_dict = dict(zip(self.feature_names, sample))
        else:
            raise TypeError("Sample must be a dict, pd.Series, or array-like.")
            
        severe_info = check_severe_conditions(sample_dict)
        
        # Calculate single-sample score
        sample_df = pd.DataFrame([sample_dict])[self.feature_names]
        is_anom = bool(self.predict_anomaly(sample_df)[0])
        score = float(self.calculate_anomaly_score(sample_df)[0])
        
        return {
            "is_anomaly": is_anom,
            "anomaly_score": round(score, 4),
            "has_severe_condition": severe_info["has_severe_condition"],
            "severe_violations": severe_info["severe_violations"]
        }

    def evaluate_safety_override(self, ml_predicted_class, is_anomaly, anomaly_score, feature_values):
        """
        Apply the conceptual safety arbitration logic.
        """
        return apply_safety_override(
            ml_predicted_class=ml_predicted_class,
            is_anomaly=is_anomaly,
            anomaly_score=anomaly_score,
            severe_indicators=feature_values
        )


def train_isolation_forest(X_train, contamination=0.02, random_state=42):
    """Factory function to train and return an anomaly detector."""
    detector = GreywaterAnomalyDetector(contamination=contamination, random_state=random_state)
    detector.fit(X_train)
    return detector


def predict_anomaly(model, X):
    """Standalone wrapper to predict anomaly booleans (True = Anomaly)."""
    if isinstance(model, GreywaterAnomalyDetector):
        return model.predict_anomaly(X)
    elif isinstance(model, IsolationForest):
        preds = model.predict(X)
        return (preds == -1)
    else:
        raise TypeError("Unsupported model type.")


def calculate_anomaly_score(model, X):
    """Standalone wrapper to calculate anomaly decision score."""
    if isinstance(model, GreywaterAnomalyDetector):
        return model.calculate_anomaly_score(X)
    elif isinstance(model, IsolationForest):
        return model.decision_function(X)
    else:
        raise TypeError("Unsupported model type.")


def analyze_anomaly(sample, extreme_thresholds=None):
    """Inspect a sample for extreme water quality parameters."""
    if isinstance(sample, pd.Series):
        s_dict = sample.to_dict()
    elif isinstance(sample, dict):
        s_dict = sample
    else:
        s_dict = dict(zip(EXPECTED_FEATURES, sample))
    return check_severe_conditions(s_dict)


def apply_safety_override(ml_predicted_class, is_anomaly, anomaly_score, severe_indicators):
    """
    Arbitrates final routing decision between ML classification and anomaly screening.
    
    Parameters
    ----------
    ml_predicted_class : int
        The predicted class from XGBoost (0: Sewer, 1: Bio, 2: Irrig, 3: Indoor).
    is_anomaly : bool
        Whether the sample is an Isolation Forest statistical anomaly.
    anomaly_score : float
        Decision score (lower is more anomalous).
    severe_indicators : dict or pd.Series or list
        Feature values or severe condition check result.
        
    Returns
    -------
    dict
        'safety_status': str ('NORMAL', 'ANOMALY_REVIEW', 'HIGH_RISK_REVIEW', 'SEWER_BYPASS_OVERRIDE'),
        'final_routing_class': int,
        'override_applied': bool,
        'reason': str
    """
    if isinstance(severe_indicators, dict) and "has_severe_condition" in severe_indicators:
        has_severe = severe_indicators["has_severe_condition"]
        violations = severe_indicators.get("severe_violations", [])
    else:
        res = check_severe_conditions(severe_indicators if isinstance(severe_indicators, dict) else dict(zip(EXPECTED_FEATURES, severe_indicators)))
        has_severe = res["has_severe_condition"]
        violations = res["severe_violations"]
        
    # Case 1: Statistical Anomaly WITH Independent Severe Hazard Evidence
    if is_anomaly and has_severe:
        if ml_predicted_class != 0:
            return {
                "safety_status": "SEWER_BYPASS_OVERRIDE",
                "final_routing_class": 0,
                "override_applied": True,
                "reason": f"CRITICAL OVERRIDE: Statistical anomaly (score={anomaly_score:.3f}) with severe condition violations: {'; '.join(violations)}. Diverted from Class {ml_predicted_class} to Sewer Bypass."
            }
        else:
            return {
                "safety_status": "HIGH_RISK_REVIEW",
                "final_routing_class": 0,
                "override_applied": False,
                "reason": f"CONFIRMED HAZARD: Statistical anomaly (score={anomaly_score:.3f}) with severe violations: {'; '.join(violations)}. Confirmed ML Sewer Bypass."
            }
            
    # Case 2: Statistical Anomaly WITHOUT Severe Hazard Breach
    elif is_anomaly and not has_severe:
        return {
            "safety_status": "ANOMALY_REVIEW",
            "final_routing_class": ml_predicted_class,
            "override_applied": False,
            "reason": f"FLAGGED FOR REVIEW: Statistical outlier (score={anomaly_score:.3f}) without direct toxic violation. Maintained ML routing Class {ml_predicted_class} with operator audit flag."
        }
        
    # Case 3: Statistical Inlier BUT Severe Physical Hazard Breach Detected
    elif not is_anomaly and has_severe:
        return {
            "safety_status": "SEWER_BYPASS_OVERRIDE" if ml_predicted_class != 0 else "HIGH_RISK_REVIEW",
            "final_routing_class": 0,
            "override_applied": (ml_predicted_class != 0),
            "reason": f"SAFETY OVERRIDE: Statistical inlier breached physical safety cutoff: {'; '.join(violations)}. Diverted to Sewer Bypass."
        }
        
    # Case 4: Normal Inlier with No Hazard Breach
    else:
        return {
            "safety_status": "NORMAL",
            "final_routing_class": ml_predicted_class,
            "override_applied": False,
            "reason": "Nominal telemetry profile within reference envelope. ML routing cleared."
        }
