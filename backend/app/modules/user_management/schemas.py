from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime


# ---------- Auth Schemas ----------

class RegisterRequest(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=6)
    role: str = Field(..., description="admin | traffic_operator | public")
    phone_number: Optional[str] = None


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


# ---------- User / Profile Schemas ----------

class UserResponse(BaseModel):
    id: int
    full_name: str
    email: EmailStr
    role: str
    phone_number: Optional[str] = None
    profile_picture: Optional[str] = None
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True  # allows conversion from SQLAlchemy model


class ProfileUpdateRequest(BaseModel):
    full_name: Optional[str] = None
    phone_number: Optional[str] = None
    profile_picture: Optional[str] = None


class PasswordChangeRequest(BaseModel):
    current_password: str
    new_password: str = Field(..., min_length=6)
    
class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str = Field(min_length=8)
