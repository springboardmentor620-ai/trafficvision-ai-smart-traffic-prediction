from fastapi import APIRouter
from fastapi import Depends
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.schemas.prediction import PredictionRequest
from app.schemas.prediction import PredictionResponse
from app.services.prediction_service import PredictionService

router = APIRouter(
    prefix="/prediction",
    tags=["Prediction"]
)


@router.post(
    "",
    response_model=PredictionResponse
)
def predict_accident(
    request: PredictionRequest,
    db: Session = Depends(get_db)
):

    result = PredictionService.get_prediction(
        db,
        request
    )

    return result