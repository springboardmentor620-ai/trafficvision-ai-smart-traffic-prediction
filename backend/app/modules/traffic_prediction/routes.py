from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.modules.user_management.dependencies import get_current_user
from app.modules.user_management.models import User
from app.modules.traffic_prediction import services
from app.modules.traffic_prediction.schemas import PredictionReportItem

router = APIRouter()


@router.post("/prediction/forecast/{road_id}")
def forecast_single_road(
    road_id: int,
    hours_ahead: float = Query(1.0, gt=0, le=48),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = services.train_and_forecast(
        db=db,
        road_id=road_id,
        hours_ahead=hours_ahead,
    )

    if result is None:
        raise HTTPException(status_code=404, detail="Road not found")

    return result

@router.get("/prediction/report", response_model=list[PredictionReportItem])
def get_prediction_report(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return services.generate_prediction_report(db)


@router.get("/prediction/history/{road_id}")
def get_prediction_history(
    road_id: int,
    limit: int = 20,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    history = services.get_prediction_history(db, road_id, limit)
    return [
        {
            "id": h.id,
            "road_id": h.road_id,
            "predicted_for": h.predicted_for,
            "predicted_vehicle_count": h.predicted_vehicle_count,
            "predicted_congestion_level": h.predicted_congestion_level,
            "model_r2_score": h.model_r2_score,
            "generated_at": h.created_at,
        }
        for h in history
    ]