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

from app.services import admin_invitation_service

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
