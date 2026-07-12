from pydantic import BaseModel, EmailStr
from typing import Optional

class UserRegister(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: Optional[str] = "traffic_operator"


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    name: str
    email: EmailStr
    role: str