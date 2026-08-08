import enum
print(">>> USING UPDATED models.py <<<")
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Enum, Boolean
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base



class CongestionLevel(str, enum.Enum):
    LOW = "low"
    MODERATE = "moderate"
    HIGH = "high"
    SEVERE = "severe"


class Road(Base):
    """
    A monitored road / zone segment. Vehicle density readings are
    recorded against a road over time.
    """
    __tablename__ = "roads"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), nullable=False)
    zone = Column(String(100), nullable=True)          # e.g. "Downtown", "Ring Road"
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    capacity = Column(Integer, nullable=False, default=1000)  # max vehicles this road can hold before "severe"
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    readings = relationship("TrafficReading", back_populates="road", cascade="all, delete-orphan")


class TrafficReading(Base):
    """
    A single point-in-time traffic reading for a road, e.g. coming from
    a sensor, CCTV feed, or a simulated data generator during development.
    """
    __tablename__ = "traffic_readings"

    id = Column(Integer, primary_key=True, index=True)
    road_id = Column(Integer, ForeignKey("roads.id"), nullable=False)
    vehicle_count = Column(Integer, nullable=False)
    avg_speed_kmph = Column(Float, nullable=True)
    congestion_level = Column(Enum(CongestionLevel), nullable=False)
    recorded_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    travel_time_index = Column(Float, nullable=True)
    road_capacity_utilization = Column(Float, nullable=True)
    incident_reports = Column(Integer, nullable=True)
    environmental_impact = Column(Float, nullable=True)
    public_transport_usage = Column(Float, nullable=True)
    traffic_signal_compliance = Column(Float, nullable=True)
    parking_usage = Column(Float, nullable=True)
    pedestrian_count = Column(Integer, nullable=True)
    weather_condition = Column(String(50), nullable=True)
    roadwork = Column(Boolean, nullable=True)

    road = relationship("Road", back_populates="readings")
