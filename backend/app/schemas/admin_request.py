from datetime import datetime
from typing import Optional
 
from pydantic import BaseModel
 
 
class AdminRequestResponse(BaseModel):
    id: int
    requester_id: Optional[int]
    status: str
    reviewed_by_id: Optional[int]
    reviewed_at: Optional[datetime]
    created_at: datetime
 
    class Config:
        from_attributes = True
 