from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.connection import get_db

from app.models.traffic import Traffic
from app.models.road import Road

from app.schemas.traffic import TrafficResponse

from app.services.traffic_service import TrafficService

router = APIRouter()


@router.get(
    "/traffic",
    response_model=list[TrafficResponse],
)
def get_traffic(
    db: Session = Depends(get_db),
):

    return TrafficService.get_all(db)
