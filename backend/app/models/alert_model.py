from sqlalchemy import Column, Integer, String, Float, DateTime, JSON
from datetime import datetime

from app.database import Base


class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)

    area_name = Column(String, nullable=False)

    road_name = Column(String, nullable=False)

    congestion = Column(Float, nullable=False)

    severity = Column(String, nullable=False)

    delay = Column(String, nullable=False)

    alert_time = Column(
        DateTime,
        default=datetime.utcnow
    )

    alerts = Column(JSON, nullable=False)

    recommendations = Column(JSON, nullable=False)