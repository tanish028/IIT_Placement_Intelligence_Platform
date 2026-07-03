"""
predict_service.py

Handles ML predictions with:
  1. SHAP explanations  — why did the model predict this value?
  2. Tree-based CI      — 95% confidence interval from individual tree predictions
  3. Model metrics      — CV scores and baseline comparison (loaded from model_metrics.json)
"""

import joblib
import json
import os
import numpy as np

# ── Load models once at startup ───────────────────────────────────
BASE = os.path.dirname(os.path.abspath(__file__))
ML   = os.path.join(BASE, "..", "ml")

package_model   = joblib.load(os.path.join(ML, "package_model.pkl"))
placement_model = joblib.load(os.path.join(ML, "placement_model.pkl"))

institute_encoder = joblib.load(os.path.join(ML, "institute_encoder.pkl"))
branch_encoder    = joblib.load(os.path.join(ML, "branch_encoder.pkl"))
program_encoder   = joblib.load(os.path.join(ML, "program_encoder.pkl"))

# ── Load SHAP explainers once at startup ─────────────────────────
# TreeExplainer is fast for RandomForest: it uses the tree structure
# directly instead of sampling, so per-prediction cost is tiny.
try:
    import shap
    pkg_explainer = shap.TreeExplainer(package_model)
    plc_explainer = shap.TreeExplainer(placement_model)
    SHAP_AVAILABLE = True
except Exception:
    SHAP_AVAILABLE = False

# ── Load model metrics (produced by train.py) ────────────────────
# Gracefully handle the case where train.py hasn't been re-run yet.
_metrics_path = os.path.join(ML, "model_metrics.json")
try:
    with open(_metrics_path) as f:
        MODEL_METRICS = json.load(f)
except FileNotFoundError:
    MODEL_METRICS = None

FEATURE_NAMES = ["Institute", "Branch", "Program", "Year"]


def _tree_confidence_interval(model, features, multiplier=1.96):
    """
    Computes a 95% confidence interval using the spread of individual
    tree predictions within the RandomForest.

    Why this is better than historical min/max:
      - Reflects the model's own uncertainty, not just data spread
      - Narrows when trees agree, widens when they disagree
      - This is called 'epistemic uncertainty' in ML literature
    """
    tree_preds = np.array([tree.predict(features)[0] for tree in model.estimators_])
    mean  = tree_preds.mean()
    std   = tree_preds.std()
    low   = round(max(0.0, mean - multiplier * std), 2)
    high  = round(mean + multiplier * std, 2)
    return {"min": low, "max": high, "std": round(float(std), 2)}


def _shap_contributions(explainer, features):
    """
    Returns per-feature SHAP values for a single prediction.

    SHAP (SHapley Additive exPlanations) answers: 'How much did each
    feature push the prediction up or down from the average?'

    base_value + sum(shap_values) = predicted_value
    """
    shap_vals = explainer.shap_values(features)
    return {
        FEATURE_NAMES[i]: round(float(shap_vals[0][i]), 3)
        for i in range(len(FEATURE_NAMES))
    }


def predict(institute: str, branch: str, program: str, year: int) -> dict:
    inst_enc = institute_encoder.transform([institute])[0]
    br_enc   = branch_encoder.transform([branch])[0]
    pr_enc   = program_encoder.transform([program])[0]

    features = np.array([[inst_enc, br_enc, pr_enc, year]])

    # ── Core predictions ──────────────────────────────────────────
    pred_pkg = round(float(package_model.predict(features)[0]),   2)
    pred_plc = round(float(placement_model.predict(features)[0]), 2)
    pred_plc = max(0.0, min(100.0, pred_plc))

    # ── Tree-based confidence intervals ───────────────────────────
    pkg_ci = _tree_confidence_interval(package_model,   features)
    plc_ci = _tree_confidence_interval(placement_model, features)
    plc_ci["min"] = max(0.0,   plc_ci["min"])
    plc_ci["max"] = min(100.0, plc_ci["max"])

    # ── SHAP explanations ─────────────────────────────────────────
    if SHAP_AVAILABLE:
        shap_pkg = _shap_contributions(pkg_explainer, features)
        shap_plc = _shap_contributions(plc_explainer, features)
    else:
        # Fallback: use RF feature importances as proxy
        shap_pkg = {FEATURE_NAMES[i]: round(float(v) * pred_pkg, 2)
                    for i, v in enumerate(package_model.feature_importances_)}
        shap_plc = {FEATURE_NAMES[i]: round(float(v) * pred_plc, 2)
                    for i, v in enumerate(placement_model.feature_importances_)}

    # ── Model info (from metrics.json or minimal fallback) ────────
    if MODEL_METRICS:
        model_info = {
            "pkg_cv_r2":     MODEL_METRICS["package_model"]["cv_r2_mean"],
            "pkg_cv_r2_std": MODEL_METRICS["package_model"]["cv_r2_std"],
            "pkg_cv_mae":    MODEL_METRICS["package_model"]["cv_mae_mean"],
            "pkg_test_mae":  MODEL_METRICS["package_model"]["test_mae"],
            "pkg_baseline_mae":    MODEL_METRICS["package_model"]["baseline_mae"],
            "pkg_improvement_pct": MODEL_METRICS["package_model"]["improvement_pct"],
            "plc_cv_r2":     MODEL_METRICS["placement_model"]["cv_r2_mean"],
            "plc_cv_r2_std": MODEL_METRICS["placement_model"]["cv_r2_std"],
            "plc_cv_mae":    MODEL_METRICS["placement_model"]["cv_mae_mean"],
            "plc_test_mae":  MODEL_METRICS["placement_model"]["test_mae"],
            "plc_baseline_mae":    MODEL_METRICS["placement_model"]["baseline_mae"],
            "plc_improvement_pct": MODEL_METRICS["placement_model"]["improvement_pct"],
        }
    else:
        model_info = {}

    return {
        "predicted_avg_package_lpa": pred_pkg,
        "package_range_lpa":         pkg_ci,
        "predicted_placement_pct":   pred_plc,
        "placement_range_pct":       plc_ci,
        "factors_used": {
            "Institute": institute,
            "Branch":    branch,
            "Program":   program,
            "Year":      year,
        },
        "shap_package":   shap_pkg,
        "shap_placement": shap_plc,
        "model_info":     model_info,
    }
