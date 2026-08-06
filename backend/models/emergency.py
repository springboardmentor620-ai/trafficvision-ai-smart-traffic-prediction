from sqlalchemy import Column, Integer, String, Boolean, Text, DateTime, text
from datetime import datetime
from database import Base


class EmergencyAlert(Base):
    __tablename__ = "emergency_alerts"

    id = Column(Integer, primary_key=True, index=True)

    # Type of emergency
    emergency_type = Column(String(50), nullable=False)
    # Ambulance | FireVehicle | PoliceVehicle | RoadBlock | VIPMovement

    # Location
    location = Column(String(150), nullable=False)
    latitude = Column(String(30), nullable=True)
    longitude = Column(String(30), nullable=True)

    # Always Critical
    priority = Column(String(20), default="Critical", nullable=False)

    # Route management
    route_cleared = Column(Boolean, default=False, nullable=False)
    affected_junctions = Column(Text, nullable=True)
    # Comma-separated list of junction names

    # Contact info
    contact_unit = Column(String(100), nullable=True)
    # e.g. "Ambulance Unit 7 | Control Room 101"

    # Lifecycle
    status = Column(String(20), default="Active", nullable=False)
    # Active | En Route | Resolved

    # Timestamps
    created_at = Column(
        DateTime,
        default=datetime.utcnow,
        server_default=text("CURRENT_TIMESTAMP"),
    )
    resolved_at = Column(DateTime, nullable=True)

    # Additional notes
    notes = Column(Text, nullable=True)
