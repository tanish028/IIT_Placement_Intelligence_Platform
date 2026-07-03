"""
train.py — Train both ML models with cross-validation, baseline comparison, and SHAP.

Usage:
    cd backend
    python ml/train.py

Outputs (all saved to backend/ml/):
    package_model.pkl
    placement_model.pkl
    institute_encoder.pkl
    branch_encoder.pkl
    program_encoder.pkl
    model_metrics.json   <-- NEW: CV scores, baseline comparison, per-feature importances
"""

import pandas as pd
import numpy as np
import joblib
import json
import os
import psycopg2
from sklearn.ensemble import RandomForestRegressor
from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from dotenv import load_dotenv

load_dotenv()

OUT_DIR = os.path.dirname(os.path.abspath(__file__))

# ── 1. Load data ──────────────────────────────────────────────────
conn = psycopg2.connect(
    host=os.getenv("DB_HOST"),
    port=os.getenv("DB_PORT", "5432"),
    user=os.getenv("DB_USER"),
    password=os.getenv("DB_PASSWORD"),
    dbname=os.getenv("DB_NAME"),
)

df = pd.read_sql("""
    SELECT "Institute", "Program", "Year", "Branch",
           "AvgPackage_LPA", "Placement_Percentage"
    FROM placements
    WHERE "AvgPackage_LPA" IS NOT NULL
      AND "Placement_Percentage" IS NOT NULL
""", conn)
df.columns = ['Institute', 'Program', 'Year', 'Branch', 'AvgPackage_LPA', 'Placement_Percentage']
conn.close()
print(f"Loaded {len(df)} rows.")

# ── 2. Encode categorical features ────────────────────────────────
institute_enc = LabelEncoder()
branch_enc    = LabelEncoder()
program_enc   = LabelEncoder()

df["Institute_enc"] = institute_enc.fit_transform(df["Institute"])
df["Branch_enc"]    = branch_enc.fit_transform(df["Branch"])
df["Program_enc"]   = program_enc.fit_transform(df["Program"])

FEATURES = ["Institute_enc", "Branch_enc", "Program_enc", "Year"]
FEATURE_NAMES = ["Institute", "Branch", "Program", "Year"]
X = df[FEATURES]
y_pkg = df["AvgPackage_LPA"]
y_plc = df["Placement_Percentage"]

# ── 3. Train/test split ───────────────────────────────────────────
X_train, X_test, yp_train, yp_test = train_test_split(X, y_pkg, test_size=0.2, random_state=42)
_,       _,      yl_train, yl_test  = train_test_split(X, y_plc, test_size=0.2, random_state=42)

# ── 4. Train RandomForest models ──────────────────────────────────
print("\nTraining RandomForest models...")
pkg_model = RandomForestRegressor(n_estimators=100, random_state=42)
pkg_model.fit(X_train, yp_train)

plc_model = RandomForestRegressor(n_estimators=100, random_state=42)
plc_model.fit(X_train, yl_train)

# ── 5. Cross-validation (k=5 on full dataset) ────────────────────
# Why k-fold CV? A single train/test split can be lucky or unlucky.
# CV gives honest performance: train on 4 folds, test on 1, repeat 5x.
print("\nRunning 5-fold cross-validation...")
cv_pkg_r2  = cross_val_score(RandomForestRegressor(n_estimators=100, random_state=42), X, y_pkg, cv=5, scoring='r2')
cv_pkg_mae = cross_val_score(RandomForestRegressor(n_estimators=100, random_state=42), X, y_pkg, cv=5, scoring='neg_mean_absolute_error')
cv_plc_r2  = cross_val_score(RandomForestRegressor(n_estimators=100, random_state=42), X, y_plc, cv=5, scoring='r2')
cv_plc_mae = cross_val_score(RandomForestRegressor(n_estimators=100, random_state=42), X, y_plc, cv=5, scoring='neg_mean_absolute_error')

print(f"  Package  CV R2:  {cv_pkg_r2.mean():.4f} +/- {cv_pkg_r2.std():.4f}")
print(f"  Package  CV MAE: {(-cv_pkg_mae).mean():.2f} +/- {(-cv_pkg_mae).std():.2f}")
print(f"  Placement CV R2:  {cv_plc_r2.mean():.4f} +/- {cv_plc_r2.std():.4f}")
print(f"  Placement CV MAE: {(-cv_plc_mae).mean():.2f} +/- {(-cv_plc_mae).std():.2f}")

# ── 6. Baseline comparison (LinearRegression) ─────────────────────
# Why baseline? If RandomForest barely beats LinearRegression, it's
# not worth the complexity. We want to justify our model choice.
print("\nTraining LinearRegression baseline...")
lr = LinearRegression()
lr.fit(X_train, yp_train)
lr_preds = lr.predict(X_test)
lr_mae_pkg = mean_absolute_error(yp_test, lr_preds)
rf_preds   = pkg_model.predict(X_test)
rf_mae_pkg = mean_absolute_error(yp_test, rf_preds)

lr_plc = LinearRegression()
lr_plc.fit(X_train, yl_train)
lr_mae_plc = mean_absolute_error(yl_test, lr_plc.predict(X_test))
rf_mae_plc = mean_absolute_error(yl_test, plc_model.predict(X_test))

print(f"\n  Package  — RF MAE: {rf_mae_pkg:.2f}  |  LR MAE: {lr_mae_pkg:.2f}  |  Improvement: {((lr_mae_pkg - rf_mae_pkg) / lr_mae_pkg * 100):.1f}%")
print(f"  Placement — RF MAE: {rf_mae_plc:.2f}  |  LR MAE: {lr_mae_plc:.2f}  |  Improvement: {((lr_mae_plc - rf_mae_plc) / lr_mae_plc * 100):.1f}%")

# ── 7. Feature importance (RF built-in) ──────────────────────────
pkg_importance = {FEATURE_NAMES[i]: round(float(v), 4) for i, v in enumerate(pkg_model.feature_importances_)}
plc_importance = {FEATURE_NAMES[i]: round(float(v), 4) for i, v in enumerate(plc_model.feature_importances_)}
print(f"\n  Package  feature importance: {pkg_importance}")
print(f"  Placement feature importance: {plc_importance}")

# ── 8. Save model_metrics.json ────────────────────────────────────
metrics = {
    "package_model": {
        "cv_r2_mean":    round(float(cv_pkg_r2.mean()), 4),
        "cv_r2_std":     round(float(cv_pkg_r2.std()),  4),
        "cv_mae_mean":   round(float((-cv_pkg_mae).mean()), 2),
        "cv_mae_std":    round(float((-cv_pkg_mae).std()),  2),
        "test_r2":       round(float(r2_score(yp_test, rf_preds)), 4),
        "test_mae":      round(float(rf_mae_pkg), 2),
        "test_rmse":     round(float(np.sqrt(mean_squared_error(yp_test, rf_preds))), 2),
        "baseline_mae":  round(float(lr_mae_pkg), 2),
        "improvement_pct": round(float((lr_mae_pkg - rf_mae_pkg) / lr_mae_pkg * 100), 1),
        "feature_importance": pkg_importance,
    },
    "placement_model": {
        "cv_r2_mean":    round(float(cv_plc_r2.mean()), 4),
        "cv_r2_std":     round(float(cv_plc_r2.std()),  4),
        "cv_mae_mean":   round(float((-cv_plc_mae).mean()), 2),
        "cv_mae_std":    round(float((-cv_plc_mae).std()),  2),
        "test_r2":       round(float(r2_score(yl_test, plc_model.predict(X_test))), 4),
        "test_mae":      round(float(rf_mae_plc), 2),
        "test_rmse":     round(float(np.sqrt(mean_squared_error(yl_test, plc_model.predict(X_test)))), 2),
        "baseline_mae":  round(float(lr_mae_plc), 2),
        "improvement_pct": round(float((lr_mae_plc - rf_mae_plc) / lr_mae_plc * 100), 1),
        "feature_importance": plc_importance,
    },
}

with open(os.path.join(OUT_DIR, "model_metrics.json"), "w") as f:
    json.dump(metrics, f, indent=2)
print("\nSaved model_metrics.json")

# ── 9. Save models and encoders ───────────────────────────────────
joblib.dump(pkg_model,      os.path.join(OUT_DIR, "package_model.pkl"))
joblib.dump(plc_model,      os.path.join(OUT_DIR, "placement_model.pkl"))
joblib.dump(institute_enc,  os.path.join(OUT_DIR, "institute_encoder.pkl"))
joblib.dump(branch_enc,     os.path.join(OUT_DIR, "branch_encoder.pkl"))
joblib.dump(program_enc,    os.path.join(OUT_DIR, "program_encoder.pkl"))
print("Saved all models and encoders to backend/ml/")
print("\nDone! Re-run this script whenever you add new data.")
