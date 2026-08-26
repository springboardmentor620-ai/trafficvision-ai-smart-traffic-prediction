from fastapi import APIRouter
from fastapi import Depends
from fastapi import HTTPException

from sqlalchemy.orm import Session

from app.core.oauth2 import get_current_user
from app.api.deps import require_admin
from app.db.database import get_db
from app.models.user import User
from app.services.audit_log_service import AuditLogService


router = APIRouter(
    prefix="/users",
    tags=["Users"]
)


# =========================================================
# CURRENT USER PROFILE
# =========================================================

@router.get("/me")
def get_profile(
    current_user: User = Depends(get_current_user)
):

    return {
        "id": current_user.id,
        "name": current_user.full_name,
        "email": current_user.email,
        "role": current_user.role,
        "is_active": current_user.is_active
    }


# =========================================================
# ADMIN — GET ALL USERS
# =========================================================

@router.get("")
def get_all_users(
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):

    users = (
        db.query(User)
        .order_by(User.created_at.desc())
        .all()
    )

    return [

        {
            "id": user.id,
            "name": user.full_name,
            "email": user.email,
            "role": user.role,
            "is_active": user.is_active,
            "created_at": user.created_at
        }

        for user in users

    ]


# =========================================================
# ADMIN — CHANGE USER ROLE
# =========================================================

@router.patch("/{user_id}/role")
def change_user_role(
    user_id: int,
    role: str,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):

    # -----------------------------------------------------
    # VALID ROLE
    # -----------------------------------------------------

    if role not in ["admin", "operator"]:

        raise HTTPException(
            status_code=400,
            detail="Role must be either admin or operator."
        )


    # -----------------------------------------------------
    # FIND USER
    # -----------------------------------------------------

    user = (
        db.query(User)
        .filter(User.id == user_id)
        .first()
    )


    if user is None:

        raise HTTPException(
            status_code=404,
            detail="User not found."
        )


    # -----------------------------------------------------
    # PREVENT SELF ROLE CHANGE
    # -----------------------------------------------------

    if user.id == admin.id:

        raise HTTPException(
            status_code=400,
            detail="You cannot change your own role."
        )


    # -----------------------------------------------------
    # SAVE OLD ROLE
    # -----------------------------------------------------

    old_role = user.role


    # -----------------------------------------------------
    # UPDATE ROLE
    # -----------------------------------------------------

    user.role = role

    db.commit()

    db.refresh(user)


    # -----------------------------------------------------
    # AUDIT LOG
    # -----------------------------------------------------

    AuditLogService.create(

        db=db,

        actor_id=admin.id,

        actor_name=admin.full_name,

        target_user_id=user.id,

        target_user_name=user.full_name,

        action="ROLE_CHANGED",

        description=(
            f"Changed {user.full_name}'s role "
            f"from {old_role} to {user.role}."
        )
    )


    return {

        "message": "User role updated successfully.",

        "user": {

            "id": user.id,

            "name": user.full_name,

            "email": user.email,

            "role": user.role,

            "is_active": user.is_active

        }

    }


# =========================================================
# ADMIN — ACTIVATE USER
# =========================================================

@router.patch("/{user_id}/activate")
def activate_user(
    user_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):

    # -----------------------------------------------------
    # FIND USER
    # -----------------------------------------------------

    user = (
        db.query(User)
        .filter(User.id == user_id)
        .first()
    )


    if user is None:

        raise HTTPException(
            status_code=404,
            detail="User not found."
        )


    # -----------------------------------------------------
    # ACTIVATE
    # -----------------------------------------------------

    user.is_active = True

    db.commit()

    db.refresh(user)


    # -----------------------------------------------------
    # AUDIT LOG
    # -----------------------------------------------------

    AuditLogService.create(

        db=db,

        actor_id=admin.id,

        actor_name=admin.full_name,

        target_user_id=user.id,

        target_user_name=user.full_name,

        action="USER_ACTIVATED",

        description=(
            f"Activated user account for "
            f"{user.full_name}."
        )
    )


    return {

        "message": "User activated successfully.",

        "user": {

            "id": user.id,

            "name": user.full_name,

            "email": user.email,

            "role": user.role,

            "is_active": user.is_active

        }

    }


# =========================================================
# ADMIN — DEACTIVATE USER
# =========================================================

@router.patch("/{user_id}/deactivate")
def deactivate_user(
    user_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):

    # -----------------------------------------------------
    # FIND USER
    # -----------------------------------------------------

    user = (
        db.query(User)
        .filter(User.id == user_id)
        .first()
    )


    if user is None:

        raise HTTPException(
            status_code=404,
            detail="User not found."
        )


    # -----------------------------------------------------
    # PREVENT SELF DEACTIVATION
    # -----------------------------------------------------

    if user.id == admin.id:

        raise HTTPException(
            status_code=400,
            detail="You cannot deactivate your own account."
        )


    # -----------------------------------------------------
    # DEACTIVATE
    # -----------------------------------------------------

    user.is_active = False

    db.commit()

    db.refresh(user)


    # -----------------------------------------------------
    # AUDIT LOG
    # -----------------------------------------------------

    AuditLogService.create(

        db=db,

        actor_id=admin.id,

        actor_name=admin.full_name,

        target_user_id=user.id,

        target_user_name=user.full_name,

        action="USER_DEACTIVATED",

        description=(
            f"Deactivated user account for "
            f"{user.full_name}."
        )
    )


    return {

        "message": "User deactivated successfully.",

        "user": {

            "id": user.id,

            "name": user.full_name,

            "email": user.email,

            "role": user.role,

            "is_active": user.is_active

        }

    }