from typing import List
 
from pydantic import BaseModel
 
from app.schemas.user import UserResponse
 
 
class AdminUserListResponse(BaseModel):
    items: List[UserResponse]
    total: int
    page: int
    page_size: int
 