from pydantic import BaseModel, EmailStr


# ==========================
# Register Schema
# ==========================
class UserRegister(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: str


# ==========================
# Login Schema
# ==========================
class UserLogin(BaseModel):
    email: EmailStr
    password: str


# ==========================
# Update Profile Schema
# ==========================
class UpdateProfile(BaseModel):
    name: str
    email: EmailStr


# ==========================
# Change Password Schema
# ==========================
class ChangePassword(BaseModel):
    old_password: str
    new_password: str


# ==========================
# Response Schema
# ==========================
class UserResponse(BaseModel):
    id: int
    name: str
    email: EmailStr
    role: str

    class Config:
        from_attributes = True
