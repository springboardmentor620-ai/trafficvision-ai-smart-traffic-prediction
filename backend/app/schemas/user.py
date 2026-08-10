from pydantic import BaseModel, EmailStr
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
    new_password: str