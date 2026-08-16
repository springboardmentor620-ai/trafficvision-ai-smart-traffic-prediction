from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
 
from app.database import get_db
from app.dependencies import require_super_admin
from app.models.user import User
 
from app.schemas.admin_invitation import (
    AdminInvitationCreate,
    AdminInvitationCreateResponse,
)
 
from app.schemas.user import UserResponse
from app.schemas.admin_request import AdminRequestResponse
 
from app.services import admin_invitation_service
from app.services import admin_management_service
 
from app.config import FRONTEND_URL
 
 
router = APIRouter(
    prefix="/super-admin",
    tags=["Super Admin"]
)
 
 
# =========================================================
# CREATE ADMIN INVITATION
# =========================================================
 
@router.post(
    "/invitations",
    response_model=AdminInvitationCreateResponse,
    status_code=201
)
def invite_admin(
    payload: AdminInvitationCreate,
 
    db: Session = Depends(get_db),
 
    # This is the actual security boundary for "only SUPER_ADMIN can
    # create/send admin invitations" - not any frontend check.
    current_user: User = Depends(require_super_admin)
):
 
    try:
 
        invitation, raw_token = admin_invitation_service.create_admin_invitation(
            db,
            email=payload.email,
            invited_by=current_user
        )
 
    except ValueError as error:
 
        raise HTTPException(
            status_code=409,
            detail=str(error)
        )
 
    except SQLAlchemyError:
 
        raise HTTPException(
            status_code=500,
            detail="Failed to create invitation."
        )
 
    return AdminInvitationCreateResponse(
        id=invitation.id,
        email=invitation.email,
        status=invitation.status,
        expires_at=invitation.expires_at,
        created_at=invitation.created_at,
        invitation_link=f"{FRONTEND_URL}/accept-invitation?token={raw_token}"
    )
 
 
# =========================================================
# PROMOTE OPERATOR -> ADMIN
# =========================================================
 
@router.post(
    "/promote/{user_id}",
    response_model=UserResponse
)
def promote_user(
    user_id: int,
 
    db: Session = Depends(get_db),
 
    current_user: User = Depends(require_super_admin)
):
 
    try:
 
        promoted_user = admin_management_service.promote_to_admin(
            db,
            target_user_id=user_id,
            acted_by=current_user
        )
 
    except ValueError as error:
 
        raise HTTPException(
            status_code=409,
            detail=str(error)
        )
 
    except SQLAlchemyError:
 
        raise HTTPException(
            status_code=500,
            detail="Failed to promote user."
        )
 
    return promoted_user
 
 
# =========================================================
# DEMOTE ADMIN -> OPERATOR
# =========================================================
 
@router.post(
    "/demote/{user_id}",
    response_model=UserResponse
)
def demote_user(
    user_id: int,
 
    db: Session = Depends(get_db),
 
    current_user: User = Depends(require_super_admin)
):
 
    try:
 
        demoted_user = admin_management_service.demote_to_operator(
            db,
            target_user_id=user_id,
            acted_by=current_user
        )
 
    except ValueError as error:
 
        raise HTTPException(
            status_code=409,
            detail=str(error)
        )
 
    except SQLAlchemyError:
 
        raise HTTPException(
            status_code=500,
            detail="Failed to demote user."
        )
 
    return demoted_user
 
 
# =========================================================
# APPROVE ADMIN REQUEST
# =========================================================
 
@router.post(
    "/admin-requests/{request_id}/approve",
    response_model=UserResponse
)
def approve_admin_request(
    request_id: int,
 
    db: Session = Depends(get_db),
 
    current_user: User = Depends(require_super_admin)
):
 
    try:
 
        promoted_user = admin_management_service.approve_admin_request(
            db,
            request_id=request_id,
            reviewed_by=current_user
        )
 
    except ValueError as error:
 
        raise HTTPException(
            status_code=409,
            detail=str(error)
        )
 
    except SQLAlchemyError:
 
        raise HTTPException(
            status_code=500,
            detail="Failed to approve admin request."
        )
 
    return promoted_user
 
 
# =========================================================
# REJECT ADMIN REQUEST
# =========================================================
 
@router.post(
    "/admin-requests/{request_id}/reject",
    response_model=AdminRequestResponse
)
def reject_admin_request(
    request_id: int,
 
    db: Session = Depends(get_db),
 
    current_user: User = Depends(require_super_admin)
):
 
    try:
 
        request = admin_management_service.reject_admin_request(
            db,
            request_id=request_id,
            reviewed_by=current_user
        )
 
    except ValueError as error:
 
        raise HTTPException(
            status_code=409,
            detail=str(error)
        )
 
    except SQLAlchemyError:
 
        raise HTTPException(
            status_code=500,
            detail="Failed to reject admin request."
        )
 
    return request
 