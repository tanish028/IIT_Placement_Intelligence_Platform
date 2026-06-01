from pydantic import BaseModel
from typing import Optional

# ── Request Models ──────────────────────────────────────────────

class PredictRequest(BaseModel):
    institute: str
    branch: str
    program: str
    year: int

# ── Response Models ─────────────────────────────────────────────

class SummaryResponse(BaseModel):
    total_institutes: int
    years_covered: str          # e.g. "2021 – 2025"
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
    package_range_lpa: dict      # {"min": float, "max": float} from individual trees
    predicted_placement_pct: float
    placement_range_pct: dict    # {"min": float, "max": float} from individual trees
    factors_used: dict           # echoes the input back to the UI
