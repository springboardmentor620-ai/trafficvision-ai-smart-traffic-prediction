from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey
from datetime import datetime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database import Base


class TrafficAlert(Base):

    __tablename__ = "traffic_alerts"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=True,
        index=True
    )

    prediction_id = Column(
        Integer,
        ForeignKey("prediction_history.id"),
        nullable=True,
        index=True
    )

    source = Column(
        String,
        nullable=False
    )

    destination = Column(
        String,
        nullable=False
    )

    category = Column(
        String,
        nullable=False,
        default="Congestion",
        index=True
    )

    severity = Column(
        String,
        nullable=False,
        default="Low",
        index=True
    )

    title = Column(
        String,
        nullable=False
    )

    message = Column(
        String,
        nullable=False
    )

    congestion = Column(
        String,
        nullable=False
    )

    congestion_percentage = Column(
        Float,
        nullable=False,
        default=0.0
    )

    accident_risk_score = Column(
        Float,
        nullable=False,
        default=0.0,
        index=True
    )

    recommended_route = Column(
        String,
        nullable=True
    )

    expected_delay = Column(
        Float,
        nullable=False,
        default=0.0
    )

    is_read = Column(
        Boolean,
        nullable=False,
        default=False,
        index=True
    )

    read_at = Column(DateTime(timezone=True), nullable=True)

    # Always store alert creation time as timezone-aware UTC.
    created_at = Column(
        DateTime(timezone=True),
        nullable=False,
        default=datetime.utcnow,
        index=True
    )

    user = relationship(
        "User",
        backref="traffic_alerts"
    )