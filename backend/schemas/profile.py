from pydantic import BaseModel, EmailStr


class ProfileUpdate(BaseModel):
    name: str
    email: EmailStr


class ChangePassword(BaseModel):
    old_password: str
    new_password: str
