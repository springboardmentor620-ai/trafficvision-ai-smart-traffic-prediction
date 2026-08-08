from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.connection import get_db

from app.services.prediction_history_service import get_latest

router = APIRouter(
    prefix="/prediction-history",
    tags=["Prediction History"]
)


@router.get("/")
def latest_predictions(db: Session = Depends(get_db)):
    return get_latest(db)