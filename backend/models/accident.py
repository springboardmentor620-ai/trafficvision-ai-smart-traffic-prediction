from sqlalchemy import Column, Integer, String, Float, Text, DateTime, text
from datetime import datetime
from database import Base


class Accident(Base):
    __tablename__ = "accidents"

    id = Column(Integer, primary_key=True, index=True)

    # Location
    location = Column(String(150), nullable=False)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)

    # Severity classification
    severity = Column(String(20), nullable=False, default="Minor")
    # Minor | Major | Fatal

    # Road condition
    road_status = Column(String(50), nullable=False,
                         default="Partially Blocked")
    # Open | Partially Blocked | Fully Blocked

    # Diversion recommendation
    diversion_route = Column(Text, nullable=True)

    # Data source — future: CCTV, GPS, Government API
    source = Column(String(30), default="Simulated", nullable=False)
    # Simulated | CCTV | GPS | GovernmentAPI | Manual

    # Lifecycle
    status = Column(String(20), default="Active", nullable=False)
    # Active | Under Control | Cleared

    # Timestamps
    reported_at = Column(
        DateTime,
        default=datetime.utcnow,
        server_default=text("CURRENT_TIMESTAMP"),
    )
    cleared_at = Column(DateTime, nullable=True)

    # Notes
    notes = Column(Text, nullable=True)
