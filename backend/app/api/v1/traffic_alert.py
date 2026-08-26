from fastapi import APIRouter
from fastapi import Depends
from fastapi import HTTPException

from sqlalchemy.orm import Session

from app.api.deps import require_admin
from app.db.database import get_db
from app.models.user import User

from app.schemas.traffic_alert import (
    TrafficAlertResponse
)

from app.services.traffic_alert_service import (
    TrafficAlertService
)


router = APIRouter(
    prefix="/alerts",
    tags=["Traffic Alerts"]
)


# =========================================================
# GET ALL ALERTS
# =========================================================

@router.get(
    "",
    response_model=list[TrafficAlertResponse]
)
def get_all_alerts(
    db: Session = Depends(get_db)
):

    return TrafficAlertService.get_all(
        db
    )


# =========================================================
# GET ACTIVE ALERTS
# =========================================================

@router.get(
    "/active",
    response_model=list[TrafficAlertResponse]
)
def get_active_alerts(
    db: Session = Depends(get_db)
):

    return TrafficAlertService.get_active(
        db
    )


# =========================================================
# DEACTIVATE ALERT
# =========================================================

@router.patch(
    "/{alert_id}/deactivate",
    response_model=TrafficAlertResponse
)
def deactivate_alert(
    alert_id: int,
    db: Session = Depends(get_db)
):

    alert = TrafficAlertService.deactivate(
        db,
        alert_id
    )

    if alert is None:

        raise HTTPException(
            status_code=404,
            detail="Alert not found."
        )

    return alert


# =========================================================
# ADMIN — DELETE ALERT
# =========================================================

@router.delete(
    "/{alert_id}",
    status_code=204
)
def delete_alert(
    alert_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):

    alert = TrafficAlertService.delete(
        db,
        alert_id,
        admin
    )

    if alert is None:

        raise HTTPException(
            status_code=404,
            detail="Alert not found."
        )

    return None