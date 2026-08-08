from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.modules.user_management.dependencies import get_current_user
from app.modules.user_management.models import User
from app.modules.ai_recommendations import services

router = APIRouter()


@router.get("/ai/recommendations/{road_id}")
def get_single_recommendation(
    road_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    recommendations = services.generate_ai_recommendations(db)

    for road in recommendations:
        if road["road_id"] == road_id:
            return road

    raise HTTPException(status_code=404, detail="Road not found")