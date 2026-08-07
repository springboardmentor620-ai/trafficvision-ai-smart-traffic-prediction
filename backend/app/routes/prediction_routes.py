from fastapi import APIRouter

from app.schemas.prediction_schema import PredictionRequest
from app.services.prediction_service import predict_congestion

router = APIRouter(
    prefix="/prediction",
    tags=["Prediction"]
)


@router.post("/")
async def predict(request: PredictionRequest):

    return await predict_congestion(request)