from typing import List

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.models.prediction_history import PredictionHistory
from app.dependencies import get_current_user
from app.models.user import User

from app.schemas.analytics import (
    AnalyticsSummary,
    WeatherTraffic,
    HolidayTraffic,
    HourlyTraffic
)

from app.services.analytics_service import (
    get_summary,
    weather_analysis,
    holiday_analysis,
    hourly_analysis
)

router = APIRouter(
    prefix="/analytics",
    tags=["Traffic Analytics"]
)


@router.get("/summary", response_model=AnalyticsSummary)
def summary(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    return get_summary(db)


@router.get("/weather", response_model=List[WeatherTraffic])
def weather(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    return weather_analysis(db)


@router.get("/holiday", response_model=List[HolidayTraffic])
def holiday(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    return holiday_analysis(db)


@router.get("/hourly", response_model=List[HourlyTraffic])
def hourly(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    return hourly_analysis(db)

@router.get("/heatmap")
def get_heatmap(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    predictions = (
        db.query(PredictionHistory)
        .filter(PredictionHistory.user_id == current_user.id)
        .all()
    )

    points = []

    for p in predictions:

        if p.source_lat is not None and p.source_lng is not None:

            points.append({
                "lat": p.source_lat,
                "lng": p.source_lng,
                "intensity": min(
                    p.predicted_traffic / 7000,
                    1
                )
            })

    return points

@router.get("/heatmap")
def get_heatmap(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    predictions = (
        db.query(PredictionHistory)
        .filter(
            PredictionHistory.user_id == current_user.id
        )
        .all()
    )

    result = []

    for prediction in predictions:

        if (
            prediction.source_lat is not None
            and prediction.source_lng is not None
        ):

            result.append({

                "lat": prediction.source_lat,

                "lng": prediction.source_lng,

                "intensity": min(
                    prediction.predicted_traffic / 7000,
                    1
                )

            })

    return result