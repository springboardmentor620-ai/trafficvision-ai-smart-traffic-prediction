from pydantic import BaseModel, EmailStr, Field
from typing import Literal

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str

    # Public self-registration can only ever create an "operator" account.
    # Admin accounts must be provisioned out-of-band (DB seed / an existing
    # admin promoting someone) - letting the client choose their own role
    # here would be a privilege-escalation vulnerability, which is exactly
    # what the previous unrestricted `role: str` field allowed.
    role: Literal["operator"] = "operator"


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserUpdate(BaseModel):
    name: str


class UserResponse(BaseModel):
    id: int
    name: str
    email: EmailStr
    role: str

    # Added for Step 5 (admin user management needs to display and
    # act on this), and incidentally resolves a gap flagged back in
    # Step 1 testing: GET /auth/me previously returned this schema
    # too, without status ever being visible in the response despite
    # existing on the model since migration 001.
    status: str

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str
    role: str


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str

    # Minimum length enforced here (Step 6) - previously accepted
    # even an empty string. Scoped to this schema only; UserCreate's
    # password field has the same historical gap but that's
    # registration, not password reset, so left untouched here.
    new_password: str = Field(min_length=8)