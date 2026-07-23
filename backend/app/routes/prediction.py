from fastapi import APIRouter, Depends

from app.schemas.prediction import (
    PredictionRequest,
    PredictionResponse
)

from app.services.prediction_service import predict_traffic

from app.dependencies import get_current_user
from app.models.user import User

from sqlalchemy.orm import Session
from app.database import get_db

from sqlalchemy.orm import Session

from app.database import get_db

from app.models.prediction_history import PredictionHistory

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
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return predict_traffic(
        request,
        db,
        current_user
    )

@router.get("/history")
def get_prediction_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    history = (
        db.query(PredictionHistory)
        .filter(
            PredictionHistory.user_id == current_user.id
        )
        .order_by(
            PredictionHistory.created_at.desc()
        )
        .all()
    )

    return history