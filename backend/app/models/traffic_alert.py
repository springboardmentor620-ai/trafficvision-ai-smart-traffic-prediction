from sqlalchemy import Column, Integer, String, DateTime
from datetime import datetime

from app.database import Base


class TrafficAlert(Base):

    __tablename__ = "traffic_alerts"

    id = Column(Integer, primary_key=True, index=True)

    source = Column(String)

    destination = Column(String)

    congestion = Column(String)

    delay = Column(String)

    recommended_route = Column(String)

    severity = Column(String)

    message = Column(String)

    created_at = Column(DateTime, default=datetime.utcnow)