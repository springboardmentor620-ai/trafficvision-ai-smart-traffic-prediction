from fastapi import APIRouter
from fastapi import Depends
from fastapi import HTTPException

from sqlalchemy.orm import Session

from app.core.security import create_access_token
from app.core.security import verify_password

from app.db.database import get_db

from app.repositories.user_repository import UserRepository

from app.schemas.token import Token

from app.schemas.user import UserCreate
from app.schemas.user import UserLogin
from app.schemas.user import UserResponse

from app.services.auth_service import AuthService


router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)


# =========================================================
# REGISTER
# =========================================================

@router.post(
    "/register",
    response_model=UserResponse,
    status_code=201
)
def register(
    user: UserCreate,
    db: Session = Depends(get_db)
):

    created_user = AuthService.register(
        db,
        user
    )

    if created_user is None:

        raise HTTPException(
            status_code=400,
            detail="Email already exists."
        )

    return created_user


# =========================================================
# LOGIN
# =========================================================

@router.post(
    "/login",
    response_model=Token
)
def login(
    credentials: UserLogin,
    db: Session = Depends(get_db)
):

    user = UserRepository.get_by_email(
        db,
        credentials.email
    )


    # -----------------------------------------------------
    # USER NOT FOUND
    # -----------------------------------------------------

    if user is None:

        raise HTTPException(
            status_code=401,
            detail="Invalid email or password."
        )


    # -----------------------------------------------------
    # PASSWORD
    # -----------------------------------------------------

    if not verify_password(
        credentials.password,
        user.password
    ):

        raise HTTPException(
            status_code=401,
            detail="Invalid email or password."
        )


    # -----------------------------------------------------
    # ACTIVE CHECK
    # -----------------------------------------------------

    if not user.is_active:

        raise HTTPException(
            status_code=403,
            detail="Your account has been deactivated."
        )


    # -----------------------------------------------------
    # JWT
    # -----------------------------------------------------

    token = create_access_token(
        {
            "sub": user.email,
            "role": user.role
        }
    )


    # -----------------------------------------------------
    # RESPONSE
    # -----------------------------------------------------

    return {

        "access_token": token,

        "token_type": "bearer",

        "role": user.role

    }