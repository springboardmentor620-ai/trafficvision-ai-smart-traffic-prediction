from typing import Optional
from pydantic import BaseModel, EmailStr


class UserRegister(BaseModel):
    """
    Schema for the public POST /register endpoint.
    """
    name: str
    email: str
    password: str


class AdminUserCreate(BaseModel):
    name: str
    email: str
    password: str
    role: str


class AdminUserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    role: Optional[str] = None
    password: Optional[str] = None


class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    role: str

    class Config:
        from_attributes = True


class UserStatsResponse(BaseModel):
    total_users: int
    admin_count: int
    operator_count: int
    commuter_count: int


class UserLogin(BaseModel):
    email: str
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str


class GoogleAuthPayload(BaseModel):
    email: str
    name: Optional[str] = "Google User"
    google_id: Optional[str] = None
    credential: Optional[str] = None


class LoginStep1Payload(BaseModel):
    email: str
    password: str


class LoginVerifyOtpPayload(BaseModel):
    email: str
    code: str


class SendOtpPayload(BaseModel):
    email: str
    purpose: Optional[str] = "Registration"


class VerifyRegisterOtpPayload(BaseModel):
    name: str
    email: str
    password: str
    code: str


class ForgotPasswordPayload(BaseModel):
    email: str


class ResetPasswordPayload(BaseModel):
    email: str
    code: str
    new_password: str