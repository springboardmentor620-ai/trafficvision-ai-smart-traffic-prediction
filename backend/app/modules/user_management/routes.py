from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.database import get_db
from app.modules.user_management import services
from app.modules.user_management.dependencies import get_current_user, require_role
from app.modules.user_management.models import User
from app.modules.user_management.schemas import (
    RegisterRequest,
    LoginRequest,
    TokenResponse,
    UserResponse,
    ProfileUpdateRequest,
    PasswordChangeRequest,
)

router = APIRouter()

VALID_ROLES = {"admin", "traffic_operator", "public"}


# ---------------------------------------------------------------------------
# AUTHENTICATION
# ---------------------------------------------------------------------------

@router.post("/auth/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(payload: RegisterRequest, db: Session = Depends(get_db)):
    """
    Creates a new user account (admin, traffic_operator, or public/commuter).
    In production you'd likely restrict who can create 'admin' accounts.
    """
    if payload.role not in VALID_ROLES:
        raise HTTPException(400, f"role must be one of {VALID_ROLES}")

    if services.get_user_by_email(db, payload.email):
        raise HTTPException(400, "Email already registered")

    user = services.create_user(
        db,
        full_name=payload.full_name,
        email=payload.email,
        password=payload.password,
        role_name=payload.role,
        phone_number=payload.phone_number,
    )
    return services.user_to_response_dict(user)


@router.post("/auth/login", response_model=TokenResponse)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """
    Standard OAuth2 password-flow login (works directly with Swagger's
    'Authorize' button, and with a plain email/password form on the frontend).
    form_data.username is used as the email field.
    """
    user = services.authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )
    if not user.is_active:
        raise HTTPException(status_code=403, detail="Account is disabled")

    token = services.create_access_token(user_id=user.id, role=user.role.name)
    return {"access_token": token, "token_type": "bearer"}


# ---------------------------------------------------------------------------
# PROFILE MANAGEMENT (self-service)
# ---------------------------------------------------------------------------

@router.get("/users/me", response_model=UserResponse)
def get_my_profile(current_user: User = Depends(get_current_user)):
    return services.user_to_response_dict(current_user)


@router.put("/users/me", response_model=UserResponse)
def update_my_profile(
    payload: ProfileUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if payload.full_name is not None:
        current_user.full_name = payload.full_name
    if payload.phone_number is not None:
        current_user.phone_number = payload.phone_number
    if payload.profile_picture is not None:
        current_user.profile_picture = payload.profile_picture

    db.commit()
    db.refresh(current_user)
    return services.user_to_response_dict(current_user)


@router.put("/users/me/password", status_code=status.HTTP_204_NO_CONTENT)
def change_password(
    payload: PasswordChangeRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not services.verify_password(payload.current_password, current_user.password_hash):
        raise HTTPException(400, "Current password is incorrect")

    current_user.password_hash = services.hash_password(payload.new_password)
    db.commit()
    return None


# ---------------------------------------------------------------------------
# ADMIN-ONLY: manage other users (example of role-based access control)
# ---------------------------------------------------------------------------

@router.get("/users", response_model=list[UserResponse])
def list_all_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin"])),
):
    """
    Only admins can list all users. Traffic operators / public will get a 403.
    """
    users = db.query(User).all()
    return [services.user_to_response_dict(u) for u in users]


@router.put("/users/{user_id}/deactivate", status_code=status.HTTP_204_NO_CONTENT)
def deactivate_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin"])),
):
    user = services.get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(404, "User not found")
    user.is_active = False
    db.commit()
    return None
