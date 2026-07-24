from sqlalchemy import Column, Integer, Float, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database import Base
from app.modules.traffic_monitoring.models import CongestionLevel


class PredictionLog(Base):
    """
    Records every forecast the system generates, so we can build a
    "traffic prediction report" (what was predicted, for which road,
    and when) rather than only ever showing the latest one.
    """
    __tablename__ = "prediction_logs"

    id = Column(Integer, primary_key=True, index=True)
    road_id = Column(Integer, ForeignKey("roads.id"), nullable=False)

    predicted_for = Column(DateTime(timezone=True), nullable=False)
    predicted_vehicle_count = Column(Integer, nullable=False)
    predicted_congestion_level = Column(Enum(CongestionLevel), nullable=False)
    model_r2_score = Column(Float, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    road = relationship("Road")