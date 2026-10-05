"""
Greywater Preprocessing Pipeline Module.
Implements reproducible, leakage-free categorical encoding and feature preparation.
Preserves original physical units for tree-based supervised machine learning (XGBoost / Random Forest).
"""

import os
import json
import pickle
from typing import List, Dict, Any, Optional
import pandas as pd
import numpy as np


class GreywaterPreprocessor:
    """
    Modular, reproducible preprocessor for greywater routing classification.
    
    Transforms:
      - One-Hot Encodes categorical 'Greywater_Source' into binary dummy features.
      - Preserves 15 numerical water-quality parameters in original physical units (no unnecessary scaling).
      - Enforces strict feature alignment between train, validation, and test splits.
    """
    
    def __init__(self, cat_cols: Optional[List[str]] = None, num_cols: Optional[List[str]] = None):
        self.cat_cols = cat_cols or ['Greywater_Source']
        self.num_cols = num_cols or [
            'pH', 'TEMP_C', 'SAL_ppt', 'TUR_NTU', 'DS_mg_L', 'TDS_mg_L',
            'TSS_mg_L', 'COND_uS_cm', 'DO_mg_L', 'BOD_mg_L', 'COD_mg_L',
            'NH4F_mg_L', 'NO3_mg_L', 'K_mg_L', 'E_coli_CFU_100mL'
        ]
        self.categories_: Dict[str, List[str]] = {}
        self.cat_feature_names_: List[str] = []
        self.feature_names_out_: List[str] = []
        self.is_fitted: bool = False

    def fit(self, X: pd.DataFrame, y: Optional[Any] = None) -> 'GreywaterPreprocessor':
        """Fits the preprocessor strictly on training data."""
        self.categories_ = {}
        self.cat_feature_names_ = []
        
        for col in self.cat_cols:
            cats = sorted(X[col].dropna().unique().tolist())
            self.categories_[col] = cats
            for cat in cats:
                self.cat_feature_names_.append(f"{col}_{cat}")
                
        self.feature_names_out_ = self.cat_feature_names_ + self.num_cols
        self.is_fitted = True
        return self

    def transform(self, X: pd.DataFrame) -> pd.DataFrame:
        """Transforms input DataFrame into model-ready features."""
        if not self.is_fitted:
            raise RuntimeError("GreywaterPreprocessor must be fitted before transforming data.")
            
        transformed_dfs = []
        
        # 1. One-Hot Encode Categorical Columns
        for col in self.cat_cols:
            cats = self.categories_[col]
            for cat in cats:
                col_name = f"{col}_{cat}"
                transformed_dfs.append(pd.Series((X[col] == cat).astype(float), name=col_name, index=X.index))
                
        # 2. Extract Numerical Predictors (Passthrough in original physical units)
        for num_col in self.num_cols:
            transformed_dfs.append(pd.Series(X[num_col].astype(float), name=num_col, index=X.index))
            
        out_df = pd.concat(transformed_dfs, axis=1)
        return out_df[self.feature_names_out_]

    def fit_transform(self, X: pd.DataFrame, y: Optional[Any] = None) -> pd.DataFrame:
        """Fits to data, then transforms it."""
        return self.fit(X, y).transform(X)

    def get_feature_names_out(self) -> List[str]:
        """Returns the list of transformed feature names."""
        if not self.is_fitted:
            raise RuntimeError("Preprocessor is not fitted.")
        return self.feature_names_out_.copy()

    def save(self, file_path: str) -> None:
        """Serializes the preprocessor to disk."""
        os.makedirs(os.path.dirname(file_path), exist_ok=True)
        with open(file_path, 'wb') as f:
            pickle.dump(self, f)

    @classmethod
    def load(cls, file_path: str) -> 'GreywaterPreprocessor':
        """Loads a serialized preprocessor from disk."""
        with open(file_path, 'rb') as f:
            return pickle.load(f)
