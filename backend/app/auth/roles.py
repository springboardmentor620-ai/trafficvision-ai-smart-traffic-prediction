from fastapi import Depends, HTTPException

from app.auth.dependencies import get_current_user
from app.models.user import User


def admin_required(
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(
            status_code=403,
            detail="Admin access required"
        )
    return current_user


def officer_required(
    current_user: User = Depends(get_current_user)
):
    if current_user.role not in ["admin", "traffic_officer"]:
        raise HTTPException(
            status_code=403,
            detail="Traffic Officer access required"
        )
    return current_user


def citizen_required(
    current_user: User = Depends(get_current_user)
):
    return current_user