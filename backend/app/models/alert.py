from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func

from app.database.base import Base


class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)

    title = Column(String, nullable=False)

    message = Column(String, nullable=False)

    severity = Column(String, nullable=False)

    road = Column(String, nullable=False)

    alert_type = Column(String, default="Congestion")

    status = Column(String, default="Active")

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
    )

    def __str__(self):
        return f"{self.title} ({self.road})"

    def __repr__(self):
        return f"{self.title} ({self.road})"