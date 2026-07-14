from fastapi import APIRouter, Depends

from app.auth.roles import admin_required
from app.models.user import User

router = APIRouter(
    prefix="/admin",
    tags=["Admin"]
)

@router.get("/dashboard")
def admin_dashboard(
    current_user: User = Depends(admin_required)
):
    return {
        "message": "Welcome Admin!",
        "user": current_user.full_name,
        "role": current_user.role
    }