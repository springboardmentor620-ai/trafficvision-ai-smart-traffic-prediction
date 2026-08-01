from fastapi import APIRouter
from fastapi import Depends
from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.schemas.accident import AccidentListResponse
from app.schemas.accident import AccidentResponse
from app.services.accident_service import AccidentService

router = APIRouter(
    prefix="/accidents",
    tags=["Accidents"]
)


@router.get(
    "",
    response_model=AccidentListResponse
)
def get_accidents(
    page: int = 1,
    limit: int = 20,
    search: str | None = None,
    weather: str | None = None,
    severity: str | None = None,
    traffic_density: str | None = None,
    road_type: str | None = None,
    sort_by: str = "accident_id",
    order: str = "asc",
    db: Session = Depends(get_db)
):

    return AccidentService.get_all(
        db=db,
        page=page,
        limit=limit,
        search=search,
        weather=weather,
        severity=severity,
        traffic_density=traffic_density,
        road_type=road_type,
        sort_by=sort_by,
        order=order,
    )


@router.get(
    "/{accident_id}",
    response_model=AccidentResponse
)
def get_accident(
    accident_id: int,
    db: Session = Depends(get_db)
):

    accident = AccidentService.get_by_id(
        db,
        accident_id
    )

    if accident is None:

        raise HTTPException(
            status_code=404,
            detail="Accident not found."
        )

    return accident