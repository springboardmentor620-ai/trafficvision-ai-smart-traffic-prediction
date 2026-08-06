from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models.user import User
from passlib.context import CryptContext

router = APIRouter(
    prefix="/users",
    tags=["Users"]
)

pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto"
)
# Get all users


@router.get("/")
def get_users(db: Session = Depends(get_db)):

    users = db.query(User).all()

    return users


@router.post("/")
def create_user(
    name: str,
    email: str,
    password: str,
    role: str,
    db: Session = Depends(get_db)
):

    existing_user = db.query(User).filter(
        User.email == email
    ).first()

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email already exists"
        )

    hashed_password = pwd_context.hash(password)

    new_user = User(
        name=name,
        email=email,
        password=hashed_password,
        role=role
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {
        "message": "User created successfully"
    }

# Delete user


@router.delete("/{user_id}")
def delete_user(
    user_id: int,
    db: Session = Depends(get_db)
):

    user = db.query(User).filter(
        User.id == user_id
    ).first()

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    db.delete(user)
    db.commit()

    return {
        "message": "User deleted successfully"
    }
