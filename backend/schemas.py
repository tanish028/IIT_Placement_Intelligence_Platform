from pydantic import BaseModel
from typing import Optional

class PredictRequest(BaseModel):
    institute: str
    branch: str
    program: str
    year: int

class SummaryResponse(BaseModel):
    total_institutes: int
    years_covered: str
    avg_package_lpa: float
    avg_placement_pct: float

class PlacementRow(BaseModel):
    institute: str
    program: str
    year: int
    branch: str
    avg_package_lpa: Optional[float]
    median_package_lpa: Optional[float]
    highest_domestic_lpa: Optional[float]
    highest_international_lpa: Optional[float]
    placement_percentage: Optional[float]

class SectorRow(BaseModel):
    institute: str
    program: str
    year: int
    branch: str
    sector: str
    students_placed: int
    placement_percentage: Optional[float]

class PredictResponse(BaseModel):
    predicted_avg_package_lpa: float
    package_range_lpa: dict         # {"min", "max", "std"} — tree-based 95% CI
    predicted_placement_pct: float
    placement_range_pct: dict       # {"min", "max", "std"} — tree-based 95% CI
    factors_used: dict              # echoes input for UI checklist
    shap_package: dict              # SHAP contributions per feature for package model
    shap_placement: dict            # SHAP contributions per feature for placement model
    model_info: dict                # CV scores, baseline MAE, improvement %
