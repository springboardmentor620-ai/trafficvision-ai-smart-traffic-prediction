from fastapi import APIRouter, HTTPException

from models.prediction import TrafficPredictionRequest
from services.prediction_service import get_prediction

router = APIRouter(tags=["Machine Learning"])


@router.post("/predict")
def predict_traffic(request: TrafficPredictionRequest) -> dict:
    """Predict traffic condition with the trained Random Forest model."""
    try:
        return get_prediction(request.to_dataset_record())
    except (FileNotFoundError, ValueError) as error:
        raise HTTPException(status_code=503, detail=str(error)) from error

