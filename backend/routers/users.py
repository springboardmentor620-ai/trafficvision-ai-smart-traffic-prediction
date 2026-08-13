from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session

from database import get_db
from models.user import User
from schemas.user import UserResponse
from utils.auth import get_current_admin
from utils.hashing import hash_password

router = APIRouter(prefix="/users", tags=["Users"])


class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: str


def _validate_role(role: str) -> str:
    normalized = role.strip().lower().replace(" ", "_")
    if normalized not in {"admin", "traffic_operator"}:
        raise HTTPException(
            status_code=400,
            detail="Invalid role. Allowed roles: admin, traffic_operator",
        )
    return normalized


@router.get("/", response_model=list[UserResponse])
def get_users(
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin),
):
    return db.query(User).all()


@router.post("/", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def create_user(
    payload: UserCreate,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin),
):
    existing_user = db.query(User).filter(User.email == payload.email).first()
    if existing_user:
        raise HTTPException(status_code=409, detail="Email already exists")

    new_user = User(
        name=payload.name.strip(),
        email=str(payload.email),
        password=hash_password(payload.password),
        role=_validate_role(payload.role),
    )

    try:
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
    except Exception:
        db.rollback()
        raise

    return new_user


@router.delete("/{user_id}")
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    try:
        db.delete(user)
        db.commit()
    except Exception:
        db.rollback()
        raise

    return {"message": "User deleted successfully", "id": user_id}
