import joblib
import os
import numpy as np
from database import get_connection

# ── Load models once at import time ─────────────────────────────
# joblib.load is fast — models stay in memory for all requests.

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
ML_DIR = os.path.join(BASE_DIR, "..", "ml")

package_model = joblib.load(os.path.join(ML_DIR, "package_model.pkl"))
placement_model = joblib.load(os.path.join(ML_DIR, "placement_model.pkl"))

# ── Label encoders (saved during training) ───────────────────────
institute_encoder = joblib.load(os.path.join(ML_DIR, "institute_encoder.pkl"))
branch_encoder    = joblib.load(os.path.join(ML_DIR, "branch_encoder.pkl"))
program_encoder   = joblib.load(os.path.join(ML_DIR, "program_encoder.pkl"))


def _get_historical_range(branch: str) -> dict:
    """
    Computes a realistic package range for a branch using historical data.

    Logic:
      - For each year, find the MIN and MAX AvgPackage_LPA across all institutes
        for the given branch.
      - Take the average of those yearly minimums → floor
      - Take the average of those yearly maximums → ceiling

    This gives a range grounded in real data:
    "Historically, CSE packages across IITs have ranged from X to Y LPA."
    """
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("""
        SELECT
            ROUND(AVG(yearly_min), 2) AS range_min,
            ROUND(AVG(yearly_max), 2) AS range_max
        FROM (
            SELECT
                Year,
                MIN(AvgPackage_LPA) AS yearly_min,
                MAX(AvgPackage_LPA) AS yearly_max
            FROM placements
            WHERE Branch = %s
              AND AvgPackage_LPA IS NOT NULL
            GROUP BY Year
        ) yearly_stats
    """, (branch,))

    row = cursor.fetchone()
    conn.close()

    return {
        "min": float(row["range_min"]) if row["range_min"] else 0.0,
        "max": float(row["range_max"]) if row["range_max"] else 0.0,
    }


def _get_historical_placement_range(branch: str) -> dict:
    """Same logic for placement percentage range."""
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("""
        SELECT
            ROUND(AVG(yearly_min), 2) AS range_min,
            ROUND(AVG(yearly_max), 2) AS range_max
        FROM (
            SELECT
                Year,
                MIN(Placement_Percentage) AS yearly_min,
                MAX(Placement_Percentage) AS yearly_max
            FROM placements
            WHERE Branch = %s
              AND Placement_Percentage IS NOT NULL
            GROUP BY Year
        ) yearly_stats
    """, (branch,))

    row = cursor.fetchone()
    conn.close()

    return {
        "min": float(row["range_min"]) if row["range_min"] else 0.0,
        "max": min(100.0, float(row["range_max"])) if row["range_max"] else 100.0,
    }


def predict(institute: str, branch: str, program: str, year: int) -> dict:
    """
    Encodes inputs, runs both models, and returns predictions
    along with historical data-driven ranges and a factors_used dict.
    """
    institute_enc = institute_encoder.transform([institute])[0]
    branch_enc    = branch_encoder.transform([branch])[0]
    program_enc   = program_encoder.transform([program])[0]

    features = np.array([[institute_enc, branch_enc, program_enc, year]])

    predicted_package   = round(float(package_model.predict(features)[0]), 2)
    predicted_placement = round(float(placement_model.predict(features)[0]), 2)
    predicted_placement = max(0.0, min(100.0, predicted_placement))

    pkg_range = _get_historical_range(branch)
    plc_range = _get_historical_placement_range(branch)

    return {
        "predicted_avg_package_lpa": predicted_package,
        "package_range_lpa": pkg_range,
        "predicted_placement_pct": predicted_placement,
        "placement_range_pct": plc_range,
        "factors_used": {
            "Institute": institute,
            "Branch": branch,
            "Program": program,
            "Year": year,
        }
    }
