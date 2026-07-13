from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User

from app.schemas.route import (
    TravelTimeResponse,
    AlternateRoute,
    RoadCondition
)

from app.services.route_service import (
    get_travel_time,
    get_alternate_routes,
    get_road_conditions
)

router = APIRouter(
    prefix="/route-analysis",
    tags=["Route Analysis"]
)


@router.get(
    "/travel-time/{traffic_id}",
    response_model=TravelTimeResponse
)
def travel_time(
    traffic_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return get_travel_time(
        db,
        traffic_id,
        current_user.id
    )


@router.get(
    "/alternate-routes",
    response_model=List[AlternateRoute]
)
def alternate_routes(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return get_alternate_routes(
        db,
        current_user.id
    )

@router.get(
    "/road-conditions",
    response_model=List[RoadCondition]
)
def road_conditions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return get_road_conditions(
        db,
        current_user.id
    )