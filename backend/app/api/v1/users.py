from fastapi import APIRouter
from fastapi import Depends

from app.core.oauth2 import get_current_user

router = APIRouter(
    prefix="/users",
    tags=["Users"]
)


@router.get("/me")
def get_profile(
    current_user=Depends(get_current_user)
):

    return {
        "id": current_user.id,
        "name": current_user.full_name,
        "email": current_user.email,
        "role": current_user.role
    }