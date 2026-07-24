from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.modules.user_management.dependencies import get_current_user
from app.modules.user_management.models import User
from app.modules.route_analysis import services
from app.modules.route_analysis.schemas import RouteRecommendationResponse

router = APIRouter()


@router.get("/routes/recommend", response_model=RouteRecommendationResponse)
def recommend_route(
    origin_road_id: int = Query(...),
    destination_road_id: int = Query(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if origin_road_id == destination_road_id:
        raise HTTPException(400, "Origin and destination must be different roads")

    result = services.get_route_recommendation(db, origin_road_id, destination_road_id)
    if result is None:
        raise HTTPException(404, "Origin or destination road not found")
    if "error" in result:
        raise HTTPException(400, result["error"])
    return result