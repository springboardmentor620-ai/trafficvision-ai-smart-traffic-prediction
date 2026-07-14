print("AUTH FILE LOADED")
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas import UserCreate, UserLogin
from app.crud import create_user, get_user_by_email
from app.auth import verify_password, create_access_token

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register")
def register(user: UserCreate, db: Session = Depends(get_db)):
    try:
        print("Register API called")

        existing = get_user_by_email(db, user.email)
        print("Checked existing user")

        if existing:
            raise HTTPException(status_code=400, detail="Email already exists")

        print("Creating user...")
        create_user(db, user.full_name, user.email, user.password)

        print("User created successfully")

        return {"message": "User Registered Successfully"}

    except Exception as e:
        print("ERROR:", repr(e))
        raise e
    
    
@router.post("/login")
def login(user: UserLogin, db: Session = Depends(get_db)):

    db_user = get_user_by_email(db, user.email)

    if not db_user:
        raise HTTPException(status_code=401, detail="Invalid Email")

    if not verify_password(user.password, db_user.password):
        raise HTTPException(status_code=401, detail="Invalid Password")

    token = create_access_token(
        {
            "sub": db_user.email,
            "role": db_user.role
        }
    )

    return {
        "access_token": token,
        "token_type": "bearer"
    }