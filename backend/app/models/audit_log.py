from sqlalchemy import Column
from sqlalchemy import DateTime
from sqlalchemy import Integer
from sqlalchemy import String
from sqlalchemy.sql import func

from app.db.database import Base


class AuditLog(Base):

    __tablename__ = "audit_logs"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    # Person who performed the action
    actor_id = Column(
        Integer,
        nullable=True,
        index=True
    )

    actor_name = Column(
        String(150),
        nullable=True
    )

    # Person affected by the action
    target_user_id = Column(
        Integer,
        nullable=True,
        index=True
    )

    target_user_name = Column(
        String(150),
        nullable=True
    )

    action = Column(
        String(100),
        nullable=False
    )

    description = Column(
        String(500),
        nullable=False
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )