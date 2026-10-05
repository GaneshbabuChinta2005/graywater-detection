"""
Global SHAP Explainer and Visualizer
AI-Driven Intelligent Greywater Management and Smart Reuse Routing System

Computes global feature importance across all routing classes and generates
publication-quality global figures (stacked bars, class-specific bars, beeswarm, and dependence plots).

SCIENTIFIC DISCLAIMER:
SHAP values describe how features influence the trained model's output.
They should NOT be interpreted as causal effects, biological mechanisms, or regulatory safety criteria.
"""

import sys
import types
import os
from typing import Dict, Any, List, Optional, Tuple, Union
import numpy as np
import pandas as pd

# Windows Application Control compatibility patch
if 'sklearn.metrics.cluster._expected_mutual_info_fast' not in sys.modules:
    m1 = types.ModuleType('sklearn.metrics.cluster._expected_mutual_info_fast')
    m1.expected_mutual_information = lambda *a, **kw: 0.0
    sys.modules['sklearn.metrics.cluster._expected_mutual_info_fast'] = m1

if 'sklearn.linear_model._sgd_fast' not in sys.modules:
    m2 = types.ModuleType('sklearn.linear_model._sgd_fast')
    class DummyLoss: pass
    m2.EpsilonInsensitive = DummyLoss; m2.Hinge = DummyLoss; m2.ModifiedHuber = DummyLoss
    m2.SquaredEpsilonInsensitive = DummyLoss; m2.SquaredHinge = DummyLoss
    m2._plain_sgd32 = lambda *a, **kw: None; m2._plain_sgd64 = lambda *a, **kw: None
    sys.modules['sklearn.linear_model._sgd_fast'] = m2

import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import shap

from explainability.shap_explainer import ShapRoutingExplainer


class GlobalShapExplainer:
    """
    Manages global SHAP importance calculations, tabular exports,
    and figure generation for the 4-class routing system.
    """
    def __init__(self, explainer: Optional[ShapRoutingExplainer] = None):
        self.explainer = explainer or ShapRoutingExplainer()
        self.feature_names = self.explainer.feature_names
        self.class_map = self.explainer.class_map
        self.num_classes = self.explainer.num_classes

    def compute_global_importance(self, data: Union[pd.DataFrame, str]) -> pd.DataFrame:
        """
        Compute global mean absolute SHAP value across all samples and classes.
        GlobalImportance(feature) = mean(|SHAP(feature)|)
        Returns DataFrame with columns: [feature, mean_abs_shap, rank]
        """
        exp, _ = self.explainer.explain_batch(data)
        # exp.values shape: (N, num_features, num_classes)
        # Average across samples (axis 0) and classes (axis 2)
        mean_abs = np.mean(np.abs(exp.values), axis=(0, 2))
        df = pd.DataFrame({
            "feature": self.feature_names,
            "mean_abs_shap": mean_abs
        }).sort_values("mean_abs_shap", ascending=False).reset_index(drop=True)
        df["mean_abs_shap"] = df["mean_abs_shap"].round(4)
        df["rank"] = df.index + 1
        return df

    def compute_class_importance(self, data: Union[pd.DataFrame, str]) -> pd.DataFrame:
        """
        Compute class-specific mean absolute SHAP for each routing class.
        Returns DataFrame with columns: [class, class_name, feature, mean_abs_shap, rank]
        """
        exp, _ = self.explainer.explain_batch(data)
        records = []
        for c in range(self.num_classes):
            c_name = self.class_map[c]
            c_mean_abs = np.mean(np.abs(exp.values[:, :, c]), axis=0)
            df_c = pd.DataFrame({
                "class": c,
                "class_name": c_name,
                "feature": self.feature_names,
                "mean_abs_shap": c_mean_abs
            }).sort_values("mean_abs_shap", ascending=False).reset_index(drop=True)
            df_c["mean_abs_shap"] = df_c["mean_abs_shap"].round(4)
            df_c["rank"] = df_c.index + 1
            records.append(df_c)

        return pd.concat(records, ignore_index=True)

    def run_and_save_all(
        self,
        data: Union[pd.DataFrame, str],
        reports_dir: Optional[str] = None,
        figures_dir: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Executes full global explainability suite:
        - Saves reports/shap_global_importance.csv
        - Saves reports/shap_class_importance.csv
        - Generates all required figures in reports/figures/shap/
        """
        project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
        reports_dir = reports_dir or os.path.join(project_root, "reports")
        figures_dir = figures_dir or os.path.join(project_root, "reports", "figures", "shap")
        os.makedirs(reports_dir, exist_ok=True)
        os.makedirs(figures_dir, exist_ok=True)

        exp, formatted_df = self.explainer.explain_batch(data)

        # 1. Global Importance CSV
        global_df = self.compute_global_importance(data)
        global_csv_path = os.path.join(reports_dir, "shap_global_importance.csv")
        global_df.to_csv(global_csv_path, index=False)

        # 2. Class Importance CSV
        class_df = self.compute_class_importance(data)
        class_csv_path = os.path.join(reports_dir, "shap_class_importance.csv")
        class_df.to_csv(class_csv_path, index=False)

        generated_figs = []

        # 3. Global Bar Plot
        fig_global_bar = os.path.join(figures_dir, "global_bar.png")
        plt.figure(figsize=(10, 6), dpi=150)
        shap.summary_plot(
            exp.values,
            formatted_df,
            plot_type="bar",
            class_names=[self.class_map[i] for i in range(self.num_classes)],
            show=False
        )
        plt.title("Global Feature Importance Across Routing Classes (mean |SHAP|)", fontsize=12, pad=15)
        plt.xlabel("Mean |SHAP Value| (Impact on Model Output Space)")
        plt.tight_layout()
        plt.savefig(fig_global_bar, dpi=150)
        plt.close()
        generated_figs.append(fig_global_bar)

        # 4. Global Beeswarm Plot
        # For multiclass, plot beeswarm of the dominant class or combined magnitude
        fig_beeswarm = os.path.join(figures_dir, "global_beeswarm.png")
        plt.figure(figsize=(10, 6), dpi=150)
        # Use class 0 (Sewer Bypass) or a composite representation for beeswarm
        shap.summary_plot(exp.values[:, :, 0], formatted_df, show=False)
        plt.title("SHAP Beeswarm Summary Plot (Class 0: Sewer Bypass)", fontsize=12, pad=15)
        plt.xlabel("SHAP Value (Impact on Log-Odds of Sewer Bypass)")
        plt.tight_layout()
        plt.savefig(fig_beeswarm, dpi=150)
        plt.close()
        generated_figs.append(fig_beeswarm)

        # 5. Class-specific Bar Charts (0, 1, 2, 3)
        colors = ["#d9534f", "#f0ad4e", "#5bc0de", "#5cb85c"]
        for c in range(self.num_classes):
            c_name = self.class_map[c]
            c_sub = class_df[class_df["class"] == c].head(10).sort_values("mean_abs_shap", ascending=True)
            
            fig_path = os.path.join(figures_dir, f"class_{c}_importance.png")
            fig, ax = plt.subplots(figsize=(8, 5), dpi=150)
            ax.barh(c_sub["feature"], c_sub["mean_abs_shap"], color=colors[c % len(colors)], edgecolor="black", alpha=0.85)
            ax.set_title(f"Class {c} ({c_name}) — Top 10 Features by Mean |SHAP|", fontsize=11, pad=10)
            ax.set_xlabel("Mean |SHAP Value|")
            ax.grid(axis="x", linestyle="--", alpha=0.5)
            plt.tight_layout()
            plt.savefig(fig_path, dpi=150)
            plt.close()
            generated_figs.append(fig_path)

        # 6. Selected Dependence Plots for Top Features (e.g., TSS, COD, BOD)
        top_feats = global_df["feature"].head(3).tolist()
        for feat in top_feats:
            if not feat.startswith("Greywater_Source_"):
                dep_path = os.path.join(figures_dir, f"dependence_{feat.split('_')[0]}.png")
                plt.figure(figsize=(8, 5), dpi=150)
                shap.dependence_plot(feat, exp.values[:, :, 0], formatted_df, show=False)
                plt.title(f"SHAP Dependence Plot: {feat} (Class 0: Sewer Bypass)", fontsize=11, pad=10)
                plt.tight_layout()
                plt.savefig(dep_path, dpi=150)
                plt.close()
                generated_figs.append(dep_path)

        return {
            "global_importance_csv": global_csv_path,
            "class_importance_csv": class_csv_path,
            "global_importance": global_df,
            "class_importance": class_df,
            "generated_figures": generated_figs
        }
