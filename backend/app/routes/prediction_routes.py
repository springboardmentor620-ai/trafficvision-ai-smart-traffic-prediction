from fastapi import APIRouter

from app.schemas.prediction_schema import PredictionRequest
from app.services.prediction_service import predict_congestion

router = APIRouter(
    prefix="/prediction",
    tags=["Prediction"]
)


@router.post("/")
def predict(request: PredictionRequest):

    result = predict_congestion(request)

    return {
        "predicted_congestion_level": result
    }