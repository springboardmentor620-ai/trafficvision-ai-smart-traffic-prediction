from sqlalchemy import Boolean
from sqlalchemy import Column
from sqlalchemy import DateTime
from sqlalchemy import Integer
from sqlalchemy.sql import func

from app.db.database import Base


class SystemControl(Base):

    __tablename__ = "system_controls"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    prediction_enabled = Column(
        Boolean,
        default=True,
        nullable=False
    )

    alerts_enabled = Column(
        Boolean,
        default=True,
        nullable=False
    )

    ai_processing_enabled = Column(
        Boolean,
        default=True,
        nullable=False
    )

    maintenance_mode = Column(
        Boolean,
        default=False,
        nullable=False
    )

    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False
    )