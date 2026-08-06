from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, text
from datetime import datetime
from database import Base


class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)

    # Alert classification
    alert_type = Column(String(50), nullable=False)
    # Congestion | Accident | RouteDelay | Emergency

    # Location info
    location = Column(String(150), nullable=False)
    latitude = Column(String(30), nullable=True)
    longitude = Column(String(30), nullable=True)

    # Severity / Priority
    severity = Column(String(20), nullable=False)
    # Critical | High | Medium | Low

    # Details
    description = Column(Text, nullable=True)
    recommendation = Column(Text, nullable=True)

    # Status lifecycle
    status = Column(String(20), default="Active", nullable=False)
    # Active | Acknowledged | Resolved

    # Link back to traffic record that triggered this
    traffic_id = Column(Integer, ForeignKey("traffic.id"), nullable=True)

    # Timestamps
    created_at = Column(
        DateTime,
        default=datetime.utcnow,
        server_default=text("CURRENT_TIMESTAMP"),
    )
    resolved_at = Column(DateTime, nullable=True)
