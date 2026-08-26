from fastapi import APIRouter
from fastapi import Depends

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.api.deps import require_admin
from app.db.database import get_db

from app.models.user import User
from app.models.accident import Accident
from app.models.traffic_alert import TrafficAlert


router = APIRouter(
    prefix="/admin/dashboard",
    tags=["Admin Dashboard"]
)


@router.get("/summary")
def admin_dashboard_summary(
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):

    # =========================================================
    # USER STATISTICS
    # =========================================================

    total_users = (
        db.query(User)
        .count()
    )

    active_users = (
        db.query(User)
        .filter(
            User.is_active == True
        )
        .count()
    )

    total_operators = (
        db.query(User)
        .filter(
            User.role == "operator"
        )
        .count()
    )

    total_admins = (
        db.query(User)
        .filter(
            User.role == "admin"
        )
        .count()
    )


    # =========================================================
    # TRAFFIC STATISTICS
    # =========================================================

    total_accidents = (
        db.query(Accident)
        .count()
    )

    active_alerts = (
        db.query(TrafficAlert)
        .filter(
            TrafficAlert.is_active == True
        )
        .count()
    )

    average_risk = (
        db.query(
            func.avg(
                Accident.risk_score
            )
        )
        .scalar()
    )


    # =========================================================
    # RESPONSE
    # =========================================================

    return {

        "total_users":
            total_users,

        "active_users":
            active_users,

        "total_operators":
            total_operators,

        "total_admins":
            total_admins,

        "total_accidents":
            total_accidents,

        "active_alerts":
            active_alerts,

        "average_risk_score":
            round(
                average_risk,
                2
            )
            if average_risk is not None
            else 0

    }