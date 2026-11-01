"""
Unit tests for Greywater Preprocessing and Dataset Preparation.
Verifies dataset existence, leakage exclusion, split integrity, contamination absence, and feature alignment.
"""

import sys
import os
import pandas as pd
import numpy as np

# Add project root to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))


def test_raw_dataset_exists():
    """Case 1: Raw dataset exists and is untouched."""
    raw_path = os.path.join("dataset", "main.csv")
    assert os.path.exists(raw_path), f"Raw dataset not found at {raw_path}"
    raw_df = pd.read_csv(raw_path)
    assert len(raw_df) == 1500
    assert len(raw_df.columns) == 18


def test_routing_dataset_exists():
    """Case 2: Derived routing dataset exists with 1500 rows."""
    routing_path = os.path.join("dataset", "processed", "greywater_routing_labels.csv")
    assert os.path.exists(routing_path), f"Routing dataset not found at {routing_path}"
    df = pd.read_csv(routing_path)
    assert len(df) == 1500
    assert len(df.columns) == 23


def test_target_exists():
    """Case 3: Routing_Class target column exists."""
    routing_path = os.path.join("dataset", "processed", "greywater_routing_labels.csv")
    df = pd.read_csv(routing_path)
    assert "Routing_Class" in df.columns


def test_target_has_valid_classes():
    """Case 4: Target contains strictly classes {0, 1, 2, 3}."""
    routing_path = os.path.join("dataset", "processed", "greywater_routing_labels.csv")
    df = pd.read_csv(routing_path)
    unique_classes = set(df["Routing_Class"].unique())
    assert unique_classes == {0, 1, 2, 3}


def test_sample_id_excluded_from_features():
    """Case 5: Sample_ID is excluded from train, validation, and test features."""
    for split in ["train.csv", "validation.csv", "test.csv"]:
        split_path = os.path.join("dataset", "processed", split)
        df = pd.read_csv(split_path)
        assert "Sample_ID" not in df.columns, f"Sample_ID found in {split}!"


def test_routing_class_excluded_from_x():
    """Case 6: Model predictor columns do NOT contain Routing_Class."""
    train_path = os.path.join("dataset", "processed", "train.csv")
    df = pd.read_csv(train_path)
    feature_cols = [c for c in df.columns if c != "Routing_Class"]
    assert "Routing_Class" not in feature_cols
    assert len(feature_cols) == 19


def test_no_leakage_columns_in_x():
    """Case 7: No post-decision metadata or target text exists in model features."""
    forbidden = [
        "Routing_Class_Name",
        "Water_Quality_Class",
        "Primary_Routing_Reason",
        "Triggered_Parameters",
        "Treatment_Required",
        "Safety_Flag"
    ]
    for split in ["train.csv", "validation.csv", "test.csv"]:
        split_path = os.path.join("dataset", "processed", split)
        df = pd.read_csv(split_path)
        for col in forbidden:
            assert col not in df.columns, f"Leakage column {col} found in {split}!"


def test_train_val_test_files_exist():
    """Case 8: Train, validation, and test files exist on disk."""
    for split in ["train.csv", "validation.csv", "test.csv"]:
        path = os.path.join("dataset", "processed", split)
        assert os.path.exists(path), f"Split file missing: {path}"


def test_no_sample_id_overlap():
    """Case 9: Zero Sample_ID overlap across train, validation, and test sets."""
    train_meta = pd.read_csv(os.path.join("dataset", "processed", "metadata_train.csv"))
    val_meta = pd.read_csv(os.path.join("dataset", "processed", "metadata_val.csv"))
    test_meta = pd.read_csv(os.path.join("dataset", "processed", "metadata_test.csv"))
    
    train_ids = set(train_meta["Sample_ID"])
    val_ids = set(val_meta["Sample_ID"])
    test_ids = set(test_meta["Sample_ID"])
    
    assert len(train_ids.intersection(val_ids)) == 0, "Train-Val Sample_ID overlap!"
    assert len(train_ids.intersection(test_ids)) == 0, "Train-Test Sample_ID overlap!"
    assert len(val_ids.intersection(test_ids)) == 0, "Val-Test Sample_ID overlap!"


def test_split_sizes_are_70_15_15():
    """Case 10: Split sizes strictly match 70% / 15% / 15% (1050 / 225 / 225)."""
    train_df = pd.read_csv(os.path.join("dataset", "processed", "train.csv"))
    val_df = pd.read_csv(os.path.join("dataset", "processed", "validation.csv"))
    test_df = pd.read_csv(os.path.join("dataset", "processed", "test.csv"))
    
    assert len(train_df) == 1050, f"Expected 1050 train rows, got {len(train_df)}"
    assert len(val_df) == 225, f"Expected 225 val rows, got {len(val_df)}"
    assert len(test_df) == 225, f"Expected 225 test rows, got {len(test_df)}"
    assert len(train_df) + len(val_df) + len(test_df) == 1500


def test_no_missing_values_in_splits():
    """Case 11: Zero missing values across all split datasets."""
    for split in ["train.csv", "validation.csv", "test.csv"]:
        df = pd.read_csv(os.path.join("dataset", "processed", split))
        assert df.isnull().sum().sum() == 0, f"Missing values found in {split}!"


def test_feature_columns_consistent_across_splits():
    """Case 12: Column names and order are identical across train, val, and test."""
    train_df = pd.read_csv(os.path.join("dataset", "processed", "train.csv"))
    val_df = pd.read_csv(os.path.join("dataset", "processed", "validation.csv"))
    test_df = pd.read_csv(os.path.join("dataset", "processed", "test.csv"))
    
    assert list(train_df.columns) == list(val_df.columns)
    assert list(train_df.columns) == list(test_df.columns)
    assert len(train_df.columns) == 20  # 19 features + 1 target


if __name__ == "__main__":
    tests = [
        test_raw_dataset_exists,
        test_routing_dataset_exists,
        test_target_exists,
        test_target_has_valid_classes,
        test_sample_id_excluded_from_features,
        test_routing_class_excluded_from_x,
        test_no_leakage_columns_in_x,
        test_train_val_test_files_exist,
        test_no_sample_id_overlap,
        test_split_sizes_are_70_15_15,
        test_no_missing_values_in_splits,
        test_feature_columns_consistent_across_splits
    ]
    print(f"Running {len(tests)} preprocessing data validation tests...")
    for t in tests:
        t()
        print(f"  [PASS] {t.__name__}")
    print(f"ALL {len(tests)} PREPROCESSING VALIDATION TESTS COMPLETED SUCCESSFULLY!")
