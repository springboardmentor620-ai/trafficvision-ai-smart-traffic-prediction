from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from .. import models, schemas, security
from ..database import get_db

router = APIRouter(prefix="/users", tags=["Authentication & User Management"])


@router.get("/me", response_model=schemas.UserOut)
def read_profile(current_user: models.User = Depends(security.get_current_user)):
    return current_user


@router.put("/me", response_model=schemas.UserOut)
def update_profile(
    full_name: str = None,
    email: str = None,
    current_user: models.User = Depends(security.get_current_user),
    db: Session = Depends(get_db),
):
    if full_name is not None:
        current_user.full_name = full_name
    if email is not None:
        current_user.email = email
    db.commit()
    db.refresh(current_user)
    return current_user


@router.get("", response_model=list[schemas.UserOut])
def list_users(
    current_user: models.User = Depends(security.require_roles("admin")),
    db: Session = Depends(get_db),
):
    """Admin-only: view all users (role-based access control)."""
    return db.query(models.User).all()
