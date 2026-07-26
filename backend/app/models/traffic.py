from sqlalchemy import Column, Integer, String, Float, DateTime, Enum, ForeignKey
from sqlalchemy.sql import func
from app.database.session import Base
import enum

class CongestionLevelEnum(str, enum.Enum):
    LOW = "LOW"
    MODERATE = "MODERATE"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"

class JunctionNode(Base):
    __tablename__ = "junction_nodes"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(50), unique=True, index=True, nullable=False)
    name = Column(String(100), nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    status = Column(String(20), default="OPERATIONAL")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class TrafficTelemetry(Base):
    __tablename__ = "traffic_telemetry"

    id = Column(Integer, primary_key=True, index=True)
    junction_id = Column(Integer, ForeignKey("junction_nodes.id"), nullable=False)
    vehicle_count = Column(Integer, default=0)
    average_speed = Column(Float, default=0.0)
    congestion_score = Column(Float, default=0.0)
    congestion_level = Column(Enum(CongestionLevelEnum), default=CongestionLevelEnum.LOW)
    timestamp = Column(DateTime(timezone=True), server_default=func.now(), index=True)
