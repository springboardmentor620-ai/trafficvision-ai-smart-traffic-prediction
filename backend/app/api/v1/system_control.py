from fastapi import APIRouter
from fastapi import Depends

from sqlalchemy.orm import Session

from app.api.deps import require_admin

from app.db.database import get_db

from app.models.user import User

from app.schemas.system_control import (
    SystemControlResponse,
    SystemControlUpdate
)

from app.services.system_control_service import (
    SystemControlService
)


router = APIRouter(
    prefix="/system-controls",
    tags=["System Controls"]
)


# =========================================================
# GET SYSTEM CONTROLS
# =========================================================

@router.get(
    "",
    response_model=SystemControlResponse
)
def get_system_controls(
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):

    return (
        SystemControlService
        .get_controls(db)
    )


# =========================================================
# UPDATE SYSTEM CONTROLS
# =========================================================

@router.patch(
    "",
    response_model=SystemControlResponse
)
def update_system_controls(
    updates: SystemControlUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):

    return (
        SystemControlService
        .update_controls(
            db,
            updates.model_dump(
                exclude_unset=True
            ),
            admin
        )
    )