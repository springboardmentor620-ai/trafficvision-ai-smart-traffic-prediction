from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User

from app.schemas.alert import AlertResponse
from app.services.alert_service import get_alerts

router = APIRouter(
    prefix="/alerts",
    tags=["Alerts"]
)


@router.get(
    "/",
    response_model=List[AlertResponse]
)
def alerts(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return get_alerts(
        db,
        current_user.id
    )