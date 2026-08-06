from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models.user import User
from schemas.user import UpdateProfile, ChangePassword
from utils.auth import get_current_user
from utils.hashing import verify_password, hash_password

router = APIRouter(
    prefix="/profile",
    tags=["Profile"]
)


# ==========================
# Get Profile
# ==========================
@router.get("/")
def get_profile(
    current_user: User = Depends(get_current_user)
):

    return {
        "id": current_user.id,
        "name": current_user.name,
        "email": current_user.email,
        "role": current_user.role
    }


# ==========================
# Update Profile
# ==========================
@router.put("/update")
def update_profile(
    data: UpdateProfile,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    current_user.name = data.name
    current_user.email = data.email

    db.commit()
    db.refresh(current_user)

    return {
        "message": "Profile Updated Successfully"
    }


# ==========================
# Change Password
# ==========================
@router.put("/change-password")
def change_password(
    data: ChangePassword,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    if not verify_password(
        data.old_password,
        current_user.password
    ):
        raise HTTPException(
            status_code=400,
            detail="Old Password is Incorrect"
        )

    current_user.password = hash_password(
        data.new_password
    )

    db.commit()

    return {
        "message": "Password Changed Successfully"
    }
