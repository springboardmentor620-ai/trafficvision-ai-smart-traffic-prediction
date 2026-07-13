from sqlalchemy import Column, Integer, String, Float, DateTime
from sqlalchemy.sql import func

from app.database import Base
from sqlalchemy import ForeignKey
from sqlalchemy.orm import relationship


class TrafficRecord(Base):
    __tablename__ = "traffic_records"

    id = Column(Integer, primary_key=True, index=True)

    location = Column(String, nullable=False)

    road_name = Column(String, nullable=False)

    vehicle_count = Column(Integer, nullable=False)

    average_speed = Column(Float, nullable=False)

    congestion_level = Column(String, nullable=False)

    user_id = Column(
    Integer,
    ForeignKey("users.id"),
    nullable=False
    )

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    owner = relationship(
    "User",
    back_populates="traffic_records"
    )