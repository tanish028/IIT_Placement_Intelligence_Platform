from fastapi import APIRouter, Query
from typing import List
import services.stats_service as svc

router = APIRouter(prefix="/stats", tags=["Stats"])


@router.get("/summary")
def summary():
    """Home dashboard totals — institutes, years, avg package, avg placement %."""
    return svc.get_summary()


@router.get("/compare")
def compare(
    institutes: List[str] = Query(..., description="Institute names to compare"),
    year: int = Query(..., description="Placement year")
):
    """
    Compare multiple IITs side-by-side for a given year.
    Example: /stats/compare?institutes=IIT Bombay&institutes=IIT Delhi&year=2024
    """
    return svc.get_comparison(institutes, year)


@router.get("/branches")
def branches(
    institute: str = Query(...),
    year: int = Query(...)
):
    """Per-branch breakdown for a given institute and year."""
    return svc.get_branch_stats(institute, year)


@router.get("/sectors")
def sectors(
    institute: str = Query(...),
    year: int = Query(...)
):
    """Sector-wise hiring distribution from branch_sector table."""
    return svc.get_sector_stats(institute, year)


@router.get("/trends")
def trends(
    institute: str = Query(...),
    branch: str = Query(default="Overall")
):
    """Year-over-year trend for avg package and placement %."""
    return svc.get_trends(institute, branch)


@router.get("/best-iits")
def best_iits_for_branch(
    branch: str = Query(...),
    year: int = Query(...)
):
    """
    Ranks all IITs by avg package for a given branch and year.
    Example: /stats/best-iits?branch=CSE&year=2024
    """
    return svc.get_best_iits_for_branch(branch, year)


@router.get("/growth")
def growth_rates(
    year_from: int = Query(...),
    year_to: int = Query(...)
):
    """
    Returns package growth rate (%) per IIT between two years.
    Example: /stats/growth?year_from=2021&year_to=2024
    """
    return svc.get_growth_rates(year_from, year_to)


@router.get("/filters")
def filters():
    """All unique institutes, branches, programs, years — for frontend dropdowns."""
    return svc.get_filter_options()
