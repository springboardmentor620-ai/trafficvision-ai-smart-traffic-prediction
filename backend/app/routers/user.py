import uuid
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.dependencies.auth import get_current_user, require_admin
from app.models.user import User
from app.constants.roles import ADMIN, TRAFFIC_OPERATOR, COMMUTER
from app.schemas.user import (
    UserRegister,
    UserResponse,
    UserLogin,
    Token,
    AdminUserCreate,
    AdminUserUpdate,
    UserStatsResponse,
    GoogleAuthPayload,
    LoginStep1Payload,
    LoginVerifyOtpPayload,
    SendOtpPayload,
    VerifyRegisterOtpPayload,
    ForgotPasswordPayload,
    ResetPasswordPayload,
)
from app.services.otp_service import OTPService
from app.utils.security import (
    hash_password,
    verify_password,
    create_access_token,
)
from app.utils.email_validator import validate_email_authenticity

router = APIRouter()


@router.post("/register")
@router.post("/auth/register")
def register(user: UserRegister, db: Session = Depends(get_db)):
    """
    Public registration endpoint.
    Creates a 'commuter' account and returns JWT token + user profile.
    """
    cleaned_email = str(user.email).strip().lower()
    if not cleaned_email or "@" not in cleaned_email:
        raise HTTPException(
            status_code=400,
            detail="Please provide a valid email address.",
        )

    existing_user = db.query(User).filter(User.email == cleaned_email).first()

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="An account with this email address already exists. Please sign in.",
        )

    new_user = User(
        name=user.name.strip(),
        email=cleaned_email,
        password=hash_password(user.password),
        role=COMMUTER,  # Always commuter
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    access_token = create_access_token(
        {
            "sub": new_user.email,
            "role": new_user.role,
        }
    )

    return {
        "id": new_user.id,
        "name": new_user.name,
        "email": new_user.email,
        "role": new_user.role,
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": new_user.id,
            "name": new_user.name,
            "email": new_user.email,
            "role": new_user.role,
        },
    }


@router.post("/auth/forgot-password")
def forgot_password(payload: ForgotPasswordPayload, db: Session = Depends(get_db)):
    """
    Sends a 6-digit OTP to the registered user's email address for password reset.
    """
    cleaned_email = payload.email.strip().lower()
    is_valid, error_msg = validate_email_authenticity(cleaned_email)
    if not is_valid:
        raise HTTPException(status_code=400, detail=error_msg)

    db_user = db.query(User).filter(User.email == cleaned_email).first()
    if not db_user:
        # Prevent email enumeration while letting user know if request was handled
        return {
            "status": "otp_sent",
            "message": f"If an account exists for {cleaned_email}, a password reset code has been sent.",
        }

    otp_info = OTPService.create_and_send_otp(
        email=cleaned_email,
        purpose="Password Reset",
        payload={"user_id": db_user.id},
    )

    return {
        "status": "otp_sent",
        "message": f"Password reset verification code dispatched to {cleaned_email}",
        "session_id": otp_info["session_id"],
        "expires_in": otp_info["expires_in"],
    }


@router.post("/auth/reset-password")
def reset_password(payload: ResetPasswordPayload, db: Session = Depends(get_db)):
    """
    Validates 6-digit OTP and sets the new hashed password.
    """
    cleaned_email = payload.email.strip().lower()
    if len(payload.new_password) < 6:
        raise HTTPException(status_code=400, detail="New password must be at least 6 characters long.")

    is_valid, msg, _ = OTPService.verify_otp(cleaned_email, payload.code)
    if not is_valid:
        raise HTTPException(status_code=400, detail=msg)

    db_user = db.query(User).filter(User.email == cleaned_email).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User account not found.")

    db_user.password = hash_password(payload.new_password)
    db.commit()
    db.refresh(db_user)

    return {
        "status": "success",
        "message": "Password updated successfully! You can now sign in with your new password.",
    }


@router.post("/auth/send-register-otp")
def send_register_otp(payload: SendOtpPayload, db: Session = Depends(get_db)):
    """
    Step 1 of 2-Step Registration:
    Validates email format & domain authenticity, checks existing accounts,
    generates a 6-digit OTP and dispatches it via email.
    """
    is_valid, error_msg = validate_email_authenticity(payload.email)
    if not is_valid:
        raise HTTPException(status_code=400, detail=error_msg)

    existing = db.query(User).filter(User.email == payload.email.strip().lower()).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email is already registered. Please sign in.")

    otp_info = OTPService.create_and_send_otp(
        email=payload.email,
        purpose="Registration Verification",
    )
    return {
        "status": "otp_sent",
        "message": f"Verification code dispatched to {payload.email}",
        "session_id": otp_info["session_id"],
        "expires_in": otp_info["expires_in"],
        "demo_code": otp_info.get("demo_code"),
    }


@router.post("/auth/verify-register-otp", response_model=UserResponse)
def verify_register_otp(payload: VerifyRegisterOtpPayload, db: Session = Depends(get_db)):
    """
    Step 2 of 2-Step Registration:
    Verifies 6-digit OTP and creates commuter account.
    """
    is_valid, msg, _ = OTPService.verify_otp(payload.email, payload.code)
    if not is_valid:
        raise HTTPException(status_code=400, detail=msg)

    existing = db.query(User).filter(User.email == payload.email.strip().lower()).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email is already registered.")

    new_user = User(
        name=payload.name.strip(),
        email=payload.email.strip().lower(),
        password=hash_password(payload.password),
        role=COMMUTER,
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user


@router.post("/auth/login-step1")
def login_step1(payload: LoginStep1Payload, db: Session = Depends(get_db)):
    """
    Step 1 of 2-Step Login:
    Validates credentials, generates 6-digit OTP and sends it to user's email.
    """
    cleaned_email = payload.email.strip().lower()
    is_valid, error_msg = validate_email_authenticity(cleaned_email)
    if not is_valid:
        raise HTTPException(status_code=400, detail=error_msg)

    db_user = db.query(User).filter(User.email == cleaned_email).first()
    if not db_user or not verify_password(payload.password, db_user.password):
        raise HTTPException(status_code=401, detail="Invalid email or password.")

    otp_info = OTPService.create_and_send_otp(
        email=db_user.email,
        purpose="Login 2-Step Verification",
        payload={"user_id": db_user.id, "role": db_user.role},
    )
    return {
        "status": "otp_sent",
        "message": f"Security verification code sent to {db_user.email}",
        "email": db_user.email,
        "name": db_user.name,
        "role": db_user.role,
        "session_id": otp_info["session_id"],
        "expires_in": otp_info["expires_in"],
        "demo_code": otp_info.get("demo_code"),
    }


@router.post("/auth/login-verify-otp")
def login_verify_otp(payload: LoginVerifyOtpPayload, db: Session = Depends(get_db)):
    """
    Step 2 of 2-Step Login:
    Verifies 6-digit OTP and returns JWT token and user info.
    """
    is_valid, msg, _ = OTPService.verify_otp(payload.email, payload.code)
    if not is_valid:
        raise HTTPException(status_code=400, detail=msg)

    db_user = db.query(User).filter(User.email == payload.email.strip().lower()).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User account not found.")

    access_token = create_access_token(
        {
            "sub": db_user.email,
            "role": db_user.role,
        }
    )
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": db_user.id,
            "name": db_user.name,
            "email": db_user.email,
            "role": db_user.role,
        },
    }


@router.post("/auth/google-auth")
def google_auth(payload: GoogleAuthPayload, db: Session = Depends(get_db)):
    """
    Google OAuth Authentication:
    Logs in existing user or automatically registers a new user via Google Identity.
    """
    cleaned_email = (payload.email or "").strip().lower()
    if not cleaned_email or "@" not in cleaned_email:
        raise HTTPException(status_code=400, detail="Valid Google email address is required.")

    db_user = db.query(User).filter(User.email == cleaned_email).first()

    if not db_user:
        # Auto-create user from Google OAuth
        name = (payload.name or cleaned_email.split("@")[0].replace(".", " ").title()).strip()
        db_user = User(
            name=name,
            email=cleaned_email,
            password=hash_password(str(uuid.uuid4())),
            role=COMMUTER,
        )
        db.add(db_user)
        db.commit()
        db.refresh(db_user)

    access_token = create_access_token(
        {
            "sub": db_user.email,
            "role": db_user.role,
        }
    )
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": db_user.id,
            "name": db_user.name,
            "email": db_user.email,
            "role": db_user.role,
        },
    }


@router.post("/auth/login")
def auth_login(payload: UserLogin, db: Session = Depends(get_db)):
    """
    Standard Direct JSON Login:
    Authenticates email and password, returning JWT access token and user profile.
    """
    cleaned_email = payload.email.strip().lower()
    db_user = db.query(User).filter(User.email == cleaned_email).first()

    if not db_user or not verify_password(payload.password, db_user.password):
        raise HTTPException(
            status_code=401,
            detail="Invalid email address or password. Please try again.",
        )

    access_token = create_access_token(
        {
            "sub": db_user.email,
            "role": db_user.role,
        }
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": db_user.id,
            "name": db_user.name,
            "email": db_user.email,
            "role": db_user.role,
        },
    }


@router.post("/login", response_model=Token)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    cleaned_username = form_data.username.strip().lower()
    db_user = db.query(User).filter(
        User.email == cleaned_username
    ).first()

    if not db_user:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    if not verify_password(form_data.password, db_user.password):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    access_token = create_access_token(
        {
            "sub": db_user.email,
            "role": db_user.role,
        }
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
    }


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user


@router.get("/admin/users/stats", response_model=UserStatsResponse)
def get_user_stats(
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """
    Get summary statistics of registered users broken down by role.
    Admin access required.
    """
    total = db.query(User).count()
    admins = db.query(User).filter(User.role == ADMIN).count()
    operators = db.query(User).filter(User.role == TRAFFIC_OPERATOR).count()
    commuters = db.query(User).filter(User.role == COMMUTER).count()

    return UserStatsResponse(
        total_users=total,
        admin_count=admins,
        operator_count=operators,
        commuter_count=commuters,
    )


@router.get("/users", response_model=list[UserResponse])
@router.get("/admin/users", response_model=list[UserResponse])
def get_users(
    search: Optional[str] = Query(None, description="Search by user name or email"),
    role: Optional[str] = Query(None, description="Filter by role"),
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """
    Get all users with optional filtering by search string and role.
    Admin access required.
    """
    query = db.query(User)

    if search:
        search_pattern = f"%{search}%"
        query = query.filter(
            or_(
                User.name.ilike(search_pattern),
                User.email.ilike(search_pattern),
            )
        )

    if role and role.lower() != "all":
        query = query.filter(User.role == role)

    return query.order_by(User.id.asc()).all()


@router.post("/admin/users", response_model=UserResponse)
def admin_create_user(
    user: AdminUserCreate,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """
    Admin-only endpoint for creating accounts with any role.

    Requires: valid admin JWT token (Authorization: Bearer <token>).
    Accepted roles: admin, traffic_operator, commuter.
    Returns HTTP 403 if the calling user is not an admin.
    Returns HTTP 400 if the email is already registered or the role is invalid.
    """
    allowed_roles = [ADMIN, TRAFFIC_OPERATOR, COMMUTER]

    if user.role not in allowed_roles:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid role '{user.role}'. Must be one of: {allowed_roles}"
        )

    is_valid, error_msg = validate_email_authenticity(user.email)
    if not is_valid:
        raise HTTPException(
            status_code=400,
            detail=error_msg,
        )

    existing_user = db.query(User).filter(User.email == user.email).first()

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )

    new_user = User(
        name=user.name,
        email=user.email,
        password=hash_password(user.password),
        role=user.role,
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user


@router.put("/admin/users/{user_id}", response_model=UserResponse)
def admin_update_user(
    user_id: int,
    user_data: AdminUserUpdate,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """
    Admin-only endpoint for modifying user credentials, profile name, or assigned role.
    """
    target_user = db.query(User).filter(User.id == user_id).first()

    if not target_user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    allowed_roles = [ADMIN, TRAFFIC_OPERATOR, COMMUTER]

    if user_data.role is not None:
        if user_data.role not in allowed_roles:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid role '{user_data.role}'. Must be one of: {allowed_roles}"
            )
        target_user.role = user_data.role

    if user_data.name is not None and user_data.name.strip():
        target_user.name = user_data.name.strip()

    if user_data.email is not None and user_data.email.strip():
        new_email = user_data.email.strip().lower()
        if new_email != target_user.email.lower():
            email_exists = db.query(User).filter(User.email == new_email).first()
            if email_exists:
                raise HTTPException(
                    status_code=400,
                    detail="Email address already registered to another user"
                )
            target_user.email = new_email

    if user_data.password is not None and user_data.password.strip():
        target_user.password = hash_password(user_data.password.strip())

    db.commit()
    db.refresh(target_user)

    return target_user


@router.delete("/admin/users/{user_id}")
def admin_delete_user(
    user_id: int,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """
    Admin-only endpoint for deleting user accounts.
    Protected against self-deletion to prevent accidental administrative lockout.
    """
    if current_user.id == user_id:
        raise HTTPException(
            status_code=400,
            detail="You cannot delete your own active administrator account."
        )

    target_user = db.query(User).filter(User.id == user_id).first()

    if not target_user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    db.delete(target_user)
    db.commit()

    return {
        "message": f"User '{target_user.name}' ({target_user.email}) deleted successfully."
    }


@router.post("/admin/users/cleanup-fake-emails")
def cleanup_fake_emails(
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """
    Deletes all existing registered user accounts that have disposable or fake email addresses.
    """
    all_users = db.query(User).all()
    deleted_count = 0
    deleted_emails = []

    for user in all_users:
        if user.role == ADMIN:
            continue
        is_valid, _ = validate_email_authenticity(user.email)
        if not is_valid:
            deleted_emails.append(user.email)
            db.delete(user)
            deleted_count += 1

    db.commit()
    return {
        "status": "success",
        "deleted_count": deleted_count,
        "deleted_emails": deleted_emails,
        "message": f"Purged {deleted_count} fake/disposable user accounts successfully.",
    }