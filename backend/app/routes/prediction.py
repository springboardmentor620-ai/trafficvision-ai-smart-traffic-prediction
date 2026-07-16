from fastapi import APIRouter, Depends

from app.schemas.prediction import (
    PredictionRequest,
    PredictionResponse
)

from app.services.prediction_service import predict_traffic

from app.dependencies import get_current_user
from app.models.user import User

router = APIRouter(
    prefix="/prediction",
    tags=["Prediction"]
)


@router.post(
    "/predict",
    response_model=PredictionResponse
)
def predict(
    request: PredictionRequest,
    current_user: User = Depends(get_current_user)
):
    return predict_traffic(request)