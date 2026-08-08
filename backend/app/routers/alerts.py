from fastapi import APIRouter, Depends

from sqlalchemy.orm import Session

from app.database.connection import get_db

from app.schemas.alert import AlertResponse

from app.services.alert_service import AlertService

router = APIRouter(
    prefix="/alerts",
    tags=["Alerts"],
)


@router.get(
    "",
    response_model=list[AlertResponse],
)
def get_alerts(
    db: Session = Depends(get_db),
):

    return AlertService.get_alerts(db)


@router.put("/{alert_id}/resolve")
def resolve_alert(
    alert_id: int,
    db: Session = Depends(get_db),
):

    alert = AlertService.resolve_alert(
        db,
        alert_id,
    )

    if not alert:
        return {
            "message": "Alert not found"
        }

    return alert