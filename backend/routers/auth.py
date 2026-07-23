from fastapi import APIRouter
from pydantic import BaseModel
from services.auth_service import authenticate

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)


class LoginRequest(BaseModel):
    email: str
    password: str

@router.post("/login")
def login(user: LoginRequest):
    return authenticate(user.email, user.password)