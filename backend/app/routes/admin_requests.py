from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
 
from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
 
from app.schemas.admin_request import AdminRequestResponse
 
from app.services import admin_management_service
 
 
router = APIRouter(
    tags=["Admin Requests"]
)
 
 
# =========================================================
# SUBMIT ADMIN REQUEST
#
# Any authenticated user can call this - the "only operators may
# request admin access" rule is enforced inside
# admin_management_service.create_admin_request(), not by the
# dependency here, so the error message can be precise ("only
# operators can request this") rather than a generic 403.
# =========================================================
 
@router.post(
    "/admin-requests",
    response_model=AdminRequestResponse,
    status_code=201
)
def request_admin_access(
    db: Session = Depends(get_db),
 
    current_user: User = Depends(get_current_user)
):
 
    try:
 
        request = admin_management_service.create_admin_request(
            db,
            requester=current_user
        )
 
    except ValueError as error:
 
        raise HTTPException(
            status_code=409,
            detail=str(error)
        )
 
    except SQLAlchemyError:
 
        raise HTTPException(
            status_code=500,
            detail="Failed to submit admin request."
        )
 
    return request
 