from fastapi import APIRouter
from schemas import PredictRequest, PredictResponse
import services.predict_service as svc

router = APIRouter(prefix="/predict", tags=["Predict"])


@router.post("/", response_model=PredictResponse)
def predict(req: PredictRequest):
    """
    Predict avg package (LPA) and placement % for a given
    institute / branch / program / year combination.

    Response includes:
    - predicted_avg_package_lpa
    - predicted_placement_pct
    - factors_used  →  echoed back so the UI can render the checklist
    """
    return svc.predict(
        institute=req.institute,
        branch=req.branch,
        program=req.program,
        year=req.year,
    )
