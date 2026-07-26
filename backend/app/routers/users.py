from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import models, schemas, security
from ..database import get_db

router = APIRouter(prefix="/users", tags=["Authentication & User Management"])


@router.get("/me", response_model=schemas.UserOut)
def read_profile(current_user: models.User = Depends(security.get_current_user)):
    return current_user


@router.put("/me", response_model=schemas.UserOut)
def update_profile(
    email: str = None,
    current_user: models.User = Depends(security.get_current_user),
    db: Session = Depends(get_db),
):
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


@router.post("", response_model=schemas.UserOut)
def create_user(
    user_in: schemas.UserCreate,
    current_user: models.User = Depends(security.require_roles("admin")),
    db: Session = Depends(get_db),
):
    """Admin-only: onboard a Traffic Operator (or another Admin).

    Unlike POST /auth/register (public self-signup, viewer-only), this
    endpoint lets an admin create an account with any role — this is the
    correct way for Traffic Operator accounts to be created, per the
    architecture's User Management Module.
    """
    existing = db.query(models.User).filter(models.User.username == user_in.username).first()
    if existing:
        raise HTTPException(status_code=400, detail="Username already registered")

    user = models.User(
        username=user_in.username,
        email=user_in.email,
        hashed_password=security.hash_password(user_in.password),
        role=user_in.role,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.get("/{user_id}", response_model=schemas.UserOut)
def get_user(
    user_id: int,
    current_user: models.User = Depends(security.require_roles("admin")),
    db: Session = Depends(get_db),
):
    """Admin-only: read a single user's record (CRUD: Read)."""
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.put("/{user_id}", response_model=schemas.UserOut)
def update_user(
    user_id: int,
    user_update: schemas.UserUpdate,
    current_user: models.User = Depends(security.require_roles("admin")),
    db: Session = Depends(get_db),
):
    """Admin-only: edit a user's role, active status, or email (CRUD: Update)."""
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if user_update.email is not None:
        user.email = user_update.email
    if user_update.role is not None:
        user.role = user_update.role
    if user_update.is_active is not None:
        user.is_active = int(user_update.is_active)

    db.commit()
    db.refresh(user)
    return user


@router.delete("/{user_id}", status_code=204)
def delete_user(
    user_id: int,
    current_user: models.User = Depends(security.require_roles("admin")),
    db: Session = Depends(get_db),
):
    """Admin-only: remove a user account (CRUD: Delete)."""
    if user_id == current_user.id:
        raise HTTPException(status_code=400, detail="You cannot delete your own account")

    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Guard: don't allow deleting the last remaining admin (would lock everyone out)
    if user.role == "admin":
        admin_count = db.query(models.User).filter(models.User.role == "admin").count()
        if admin_count <= 1:
            raise HTTPException(status_code=400, detail="Cannot delete the last remaining admin")

    db.delete(user)
    db.commit()
    return None
