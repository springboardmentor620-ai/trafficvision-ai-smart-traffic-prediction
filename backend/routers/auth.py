from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models.user import User
from schemas.user import UserRegister, UserLogin
from utils.hashing import hash_password, verify_password
from utils.jwt_handler import create_access_token
from utils.auth import get_current_admin

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)


# ==========================================
# Register
# ==========================================
@router.post("/register")
def register(
    user: UserRegister,
    db: Session = Depends(get_db)
):

    existing_user = db.query(User).filter(
        User.email == user.email
    ).first()

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email already exists"
        )

    # Convert role to lowercase
    role = user.role.lower()

    # Allow only Admin and Traffic Operator
    if role not in ["admin", "traffic_operator"]:
        raise HTTPException(
            status_code=400,
            detail="Invalid role selected."
        )

    new_user = User(
        name=user.name,
        email=user.email,
        password=hash_password(user.password),
        role=role
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {
        "message": "User Registered Successfully",
        "id": new_user.id,
        "name": new_user.name,
        "email": new_user.email,
        "role": new_user.role
    }


# ==========================================
# Login
# ==========================================
@router.post("/login")
def login(
    user: UserLogin,
    db: Session = Depends(get_db)
):

    db_user = db.query(User).filter(
        User.email == user.email
    ).first()

    if db_user is None:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    if not verify_password(user.password, db_user.password):
        raise HTTPException(
            status_code=401,
            detail="Invalid Password"
        )

    access_token = create_access_token(
        {
            "sub": db_user.email,
            "role": db_user.role
        }
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "message": "Login Successful",
        "role": db_user.role,
        "name": db_user.name,
        "email": db_user.email
    }


# ==========================================
# Admin Dashboard
# ==========================================
@router.get("/admin/dashboard")
def admin_dashboard(
    current_user: User = Depends(get_current_admin)
):

    return {
        "message": "Welcome Admin",
        "user": {
            "id": current_user.id,
            "name": current_user.name,
            "email": current_user.email,
            "role": current_user.role
        }
    }
