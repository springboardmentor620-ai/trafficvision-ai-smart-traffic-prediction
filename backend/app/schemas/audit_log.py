from datetime import datetime

from pydantic import BaseModel


class AuditLogResponse(BaseModel):

    id: int

    actor_id: int | None = None

    actor_name: str | None = None

    target_user_id: int | None = None

    target_user_name: str | None = None

    action: str

    description: str

    created_at: datetime

    class Config:

        from_attributes = True