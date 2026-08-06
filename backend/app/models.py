import enum
from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, Enum, ForeignKey
from sqlalchemy.orm import relationship
from .database import Base


class RoleEnum(str, enum.Enum):
    admin = "admin"                 # Traffic Authorities
    operator = "operator"           # Traffic Operators
    viewer = "viewer"               # Public / Commuters (read-only)


class User(Base):
    """User Management Module: admin auth, operator login, RBAC, profile."""
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(100), unique=True, nullable=True)
    hashed_password = Column(String(255), nullable=False)
    role = Column(Enum(RoleEnum), default=RoleEnum.viewer, nullable=False)
    is_active = Column(Integer, default=1)
    created_at = Column(DateTime, default=datetime.utcnow)


class Road(Base):
    """A monitored road / junction segment."""
    __tablename__ = "roads"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), nullable=False)
    location = Column(String(150), nullable=True)
    lane_capacity = Column(Integer, default=100)  # vehicles the road can hold before "high" congestion
    latitude = Column(Float, nullable=True)   # needed for Route Analysis Module (real map routing)
    longitude = Column(Float, nullable=True)

    readings = relationship("TrafficReading", back_populates="road")


class TrafficReading(Base):
    """Traffic Monitoring Module: vehicle density, congestion tracking, live dashboard feed."""
    __tablename__ = "traffic_readings"

    id = Column(Integer, primary_key=True, index=True)
    road_id = Column(Integer, ForeignKey("roads.id"), nullable=False)
    vehicle_count = Column(Integer, nullable=False)
    avg_speed_kmph = Column(Float, nullable=False)
    congestion_level = Column(String(20), nullable=False)  # low / medium / high
    recorded_at = Column(DateTime, default=datetime.utcnow, index=True)

    road = relationship("Road", back_populates="readings")


class AlertTypeEnum(str, enum.Enum):
    congestion = "congestion"   # auto-generated from live congestion tracking
    accident = "accident"       # manually reported by an operator/admin
    route_delay = "route_delay"
    emergency = "emergency"


class AlertStatusEnum(str, enum.Enum):
    active = "active"
    acknowledged = "acknowledged"
    resolved = "resolved"


class Alert(Base):
    """Alert & Notification Module: congestion alerts, accident notifications,
    route delay warnings, emergency traffic alerts."""
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    road_id = Column(Integer, ForeignKey("roads.id"), nullable=True)
    alert_type = Column(Enum(AlertTypeEnum), nullable=False)
    severity = Column(String(20), nullable=False)  # low / medium / high
    message = Column(String(500), nullable=False)
    status = Column(Enum(AlertStatusEnum), default=AlertStatusEnum.active, nullable=False)
    created_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    acknowledged_at = Column(DateTime, nullable=True)
    resolved_at = Column(DateTime, nullable=True)

    road = relationship("Road")
