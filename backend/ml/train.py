"""
train.py — Run this ONCE to train and save both ML models.

Usage:
    cd backend
    python ml/train.py

Output files (saved in backend/ml/):
    package_model.pkl
    placement_model.pkl
    institute_encoder.pkl
    branch_encoder.pkl
    program_encoder.pkl
"""

import pandas as pd
import numpy as np
import joblib
import os
import psycopg2
import psycopg2.extras
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from dotenv import load_dotenv

load_dotenv()

# ── 1. Load data from MySQL ───────────────────────────────────────

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

# Rename to simple column names for easier handling
df.columns = ['Institute', 'Program', 'Year', 'Branch', 'AvgPackage_LPA', 'Placement_Percentage']
conn.close()

print(f"Loaded {len(df)} rows from placements table.")

# ── 2. Encode categorical features ───────────────────────────────
# LabelEncoder converts strings to integers.
# We save the encoder so predict_service.py uses the SAME mapping.

institute_enc = LabelEncoder()
branch_enc    = LabelEncoder()
program_enc   = LabelEncoder()

df["Institute_enc"] = institute_enc.fit_transform(df["Institute"])
df["Branch_enc"]    = branch_enc.fit_transform(df["Branch"])
df["Program_enc"]   = program_enc.fit_transform(df["Program"])

# ── 3. Define features and targets ───────────────────────────────

FEATURES = ["Institute_enc", "Branch_enc", "Program_enc", "Year"]
X = df[FEATURES]

y_package   = df["AvgPackage_LPA"]
y_placement = df["Placement_Percentage"]

# ── 4. Train-test split ───────────────────────────────────────────

X_train, X_test, yp_train, yp_test = train_test_split(X, y_package,   test_size=0.2, random_state=42)
_,       _,      yl_train, yl_test  = train_test_split(X, y_placement, test_size=0.2, random_state=42)

# ── 5. Train models ───────────────────────────────────────────────

print("\nTraining package model...")
package_model = RandomForestRegressor(n_estimators=100, random_state=42)
package_model.fit(X_train, yp_train)

print("Training placement model...")
placement_model = RandomForestRegressor(n_estimators=100, random_state=42)
placement_model.fit(X_train, yl_train)

# ── 6. Evaluate ───────────────────────────────────────────────────

def evaluate(name, model, X_test, y_test):
    preds = model.predict(X_test)
    mae  = mean_absolute_error(y_test, preds)
    rmse = np.sqrt(mean_squared_error(y_test, preds))
    r2   = r2_score(y_test, preds)
    print(f"\n{name}")
    print(f"  MAE  : {mae:.2f}")
    print(f"  RMSE : {rmse:.2f}")
    print(f"  R²   : {r2:.4f}")

evaluate("Package Model",   package_model,   X_test, yp_test)
evaluate("Placement Model", placement_model, X_test, yl_test)

# ── 7. Save models and encoders ───────────────────────────────────

OUT_DIR = os.path.dirname(os.path.abspath(__file__))

joblib.dump(package_model,   os.path.join(OUT_DIR, "package_model.pkl"))
joblib.dump(placement_model, os.path.join(OUT_DIR, "placement_model.pkl"))
joblib.dump(institute_enc,   os.path.join(OUT_DIR, "institute_encoder.pkl"))
joblib.dump(branch_enc,      os.path.join(OUT_DIR, "branch_encoder.pkl"))
joblib.dump(program_enc,     os.path.join(OUT_DIR, "program_encoder.pkl"))

print("\nAll models and encoders saved to backend/ml/")
