from fastapi import APIRouter
from pydantic import BaseModel
from services.auth_service import authenticate, register

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)


class LoginRequest(BaseModel):
    email: str
    password: str

class SignupRequest(LoginRequest):
    role: str = "Public User"

@router.post("/login")
def login(user: LoginRequest):
    return authenticate(user.email, user.password)

@router.post("/signup")
def signup(user: SignupRequest):
    return register(user.email, user.password, user.role)
