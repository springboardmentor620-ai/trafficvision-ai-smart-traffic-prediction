from fastapi import APIRouter
from fastapi import Depends
from fastapi import Query

from sqlalchemy.orm import Session

from app.api.deps import require_admin
from app.core.oauth2 import get_current_user
from app.db.database import get_db
from app.models.user import User
from app.schemas.audit_log import AuditLogResponse
from app.services.audit_log_service import AuditLogService


router = APIRouter(
    prefix="/admin/activity",
    tags=["Admin Activity"]
)


@router.get(
    "",
    response_model=list[AuditLogResponse]
)
def get_system_activity(

    limit: int = Query(
        100,
        ge=1,
        le=500
    ),

    db: Session = Depends(get_db),

    admin: User = Depends(require_admin)

):

    return AuditLogService.get_all(
        db,
        limit
    )