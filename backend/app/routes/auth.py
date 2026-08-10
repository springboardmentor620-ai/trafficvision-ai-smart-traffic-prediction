from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

import secrets
from google.oauth2 import id_token
from google.auth.transport import requests

from app.database import get_db
from app.models.user import User
from app.schemas.user import (
    UserResponse,
    UserUpdate,
    Token,
    ForgotPasswordRequest,
    ResetPasswordRequest,
)
from app.dependencies import get_current_user
from app.security import (
    hash_password,
    verify_password,
    create_access_token
)
from app.services import password_reset_service

from google.oauth2 import id_token
from google.auth.transport import requests
from app.config import GOOGLE_CLIENT_ID

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)


@router.post("/login", response_model=Token)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    db_user = db.query(User).filter(
        User.email == form_data.username
    ).first()

    if not db_user:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    if not verify_password(
        form_data.password,
        db_user.password
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    token = create_access_token(
        {
            "sub": db_user.email,
            "role": db_user.role
        }
    )

    return {
        "access_token": token,
        "token_type": "bearer",
        "role": db_user.role
    }

@router.post("/google", response_model=Token)
def google_login(
    payload: dict,
    db: Session = Depends(get_db)
):
    credential = payload.get("credential")

    if not credential:
        raise HTTPException(
            status_code=400,
            detail="Google credential is required"
        )

    try:
        # Verify the Google ID token
        google_user = id_token.verify_oauth2_token(
            credential,
            requests.Request(),
            GOOGLE_CLIENT_ID
        )

    except ValueError:
        raise HTTPException(
            status_code=401,
            detail="Invalid Google credential"
        )

    # Get verified information from Google
    google_email = google_user.get("email")
    google_name = google_user.get("name")

    if not google_email:
        raise HTTPException(
            status_code=400,
            detail="Google account email not available"
        )

    # Check whether user already exists
    db_user = db.query(User).filter(
        User.email == google_email
    ).first()

    # Create account if it doesn't exist
    if not db_user:

        random_password = secrets.token_urlsafe(32)

        db_user = User(
            name=google_name or google_email.split("@")[0],
            email=google_email,
            password=hash_password(random_password),
            role="operator"
        )

        db.add(db_user)
        db.commit()
        db.refresh(db_user)

    # Create your normal TrafficVision JWT
    token = create_access_token(
        {
            "sub": db_user.email,
            "role": db_user.role
        }
    )

    return {
        "access_token": token,
        "token_type": "bearer",
        "role": db_user.role
    }
@router.get("/me", response_model=UserResponse)
def get_me(
    current_user: User = Depends(get_current_user)
):
    return current_user


@router.put("/me", response_model=UserResponse)
def update_me(
    payload: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Only name is editable here by design. Email is the login identifier
    # (changing it safely needs re-verification, out of scope for this
    # pass) and role is intentionally never client-editable - see the
    # privilege-escalation note on UserCreate.role.
    current_user.name = payload.name

    db.commit()
    db.refresh(current_user)

    return current_user


@router.post("/forgot-password")
def forgot_password(
    payload: ForgotPasswordRequest,
    db: Session = Depends(get_db)
):
    # Always the same response whether or not the email exists - the
    # service function itself is a no-op for unknown emails, so there is
    # nothing here that could leak account existence via timing or
    # response shape differences.
    password_reset_service.request_password_reset(db, payload.email)

    return {
        "message": "If the email exists, a password reset link has been sent."
    }


@router.post("/reset-password")
def reset_password(
    payload: ResetPasswordRequest,
    db: Session = Depends(get_db)
):
    success = password_reset_service.reset_password(
        db, payload.token, payload.new_password
    )

    if not success:
        raise HTTPException(
            status_code=400,
            detail="Invalid or expired reset token"
        )

    return {
        "message": "Password reset successful."
    }