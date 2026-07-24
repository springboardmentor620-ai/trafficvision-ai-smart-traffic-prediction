from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from .. import models, schemas, security
from ..database import get_db

router = APIRouter(prefix="/auth", tags=["Authentication & User Management"])


@router.post("/register", response_model=schemas.UserOut)
def register(
    user_in: schemas.UserCreate,
    db: Session = Depends(get_db),
):
    """Public self-signup — for the 'Public / Commuters' user type only.

    This endpoint always creates a 'viewer' account, regardless of what role
    is sent in the request. Traffic Authorities (admin) and Traffic Operators
    are NOT allowed to self-register here — per the architecture, only an
    admin can create those (see POST /users, admin-only). The one exception
    is bootstrap: if the database is completely empty, the very first account
    created becomes admin automatically, so there's always an initial admin
    to log in with.
    """
    existing = db.query(models.User).filter(models.User.username == user_in.username).first()
    if existing:
        raise HTTPException(status_code=400, detail="Username already registered")

    any_user_exists = db.query(models.User).first() is not None
    role = "admin" if not any_user_exists else "viewer"

    user = models.User(
        username=user_in.username,
        full_name=user_in.full_name,
        email=user_in.email,
        hashed_password=security.hash_password(user_in.password),
        role=role,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.post("/login", response_model=schemas.Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.username == form_data.username).first()
    if not user or not security.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    token = security.create_access_token(data={"sub": user.username, "role": user.role})
    return schemas.Token(access_token=token, role=user.role, username=user.username)
