from fastapi import APIRouter, Depends

from app.schemas.prediction import (
    PredictionRequest,
    PredictionResponse
)

from app.services.prediction_service import predict_congestion
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
    result = predict_congestion(
        request.vehicle_count,
        request.average_speed
    )

    return result