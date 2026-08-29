from typing import Optional
from pydantic import BaseModel, EmailStr


class UserRegister(BaseModel):
    """
    Schema for the public POST /register endpoint.

    The `role` field has been intentionally removed.
    Public registration always creates a 'commuter' account — the server
    assigns this role unconditionally regardless of any client-submitted value.
    Privileged accounts (admin, traffic_operator) must be created by an
    administrator via POST /admin/users.
    """
    name: str
    email: EmailStr
    password: str


class AdminUserCreate(BaseModel):
    """
    Schema for the admin-only POST /admin/users endpoint.
    Requires a valid admin JWT token.
    Allows creating accounts with any role: admin, traffic_operator, commuter.
    """
    name: str
    email: EmailStr
    password: str
    role: str


class AdminUserUpdate(BaseModel):
    """
    Schema for the admin-only PUT /admin/users/{user_id} endpoint.
    Allows updating name, email, role, and optionally resetting password.
    """
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    role: Optional[str] = None
    password: Optional[str] = None


class UserResponse(BaseModel):
    id: int
    name: str
    email: EmailStr
    role: str

    class Config:
        from_attributes = True


class UserStatsResponse(BaseModel):
    total_users: int
    admin_count: int
    operator_count: int
    commuter_count: int


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str