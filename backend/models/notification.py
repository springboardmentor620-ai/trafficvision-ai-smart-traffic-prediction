"""
TrafficVisionAI
Notification Model
"""

from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    Boolean,
    Float,
    ForeignKey,
    DateTime,
)
from sqlalchemy.sql import func

from database import Base


class Notification(Base):
    __tablename__ = "notifications"

    # ========================================================
    # PRIMARY KEY
    # ========================================================

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    # ========================================================
    # TRAFFIC RELATIONSHIP
    # ========================================================
    #
    # Links this notification to the exact traffic_data record
    # that generated it.
    #
    # Example:
    #
    # traffic_data.id = 10
    # notifications.traffic_id = 10
    #
    # This allows us to trace the notification back to the
    # original traffic record and its exact coordinates.
    #

    traffic_id = Column(
        Integer,
        ForeignKey("traffic_data.id"),
        nullable=True,
        index=True,
    )

    # ========================================================
    # NOTIFICATION INFORMATION
    # ========================================================

    title = Column(
        String(100),
        nullable=False,
    )

    description = Column(
        Text,
        nullable=False,
    )

    alert_type = Column(
        String(50),
        nullable=False,
        default="system",
    )

    priority = Column(
        String(50),
        nullable=False,
        default="medium",
    )

    # ========================================================
    # LOCATION
    # ========================================================

    latitude = Column(
        Float,
        nullable=True,
    )

    longitude = Column(
        Float,
        nullable=True,
    )

    # ========================================================
    # STATUS
    # ========================================================

    is_read = Column(
        Boolean,
        nullable=False,
        default=False,
    )

    # ========================================================
    # TIMESTAMP
    # ========================================================

    timestamp = Column(
        DateTime,
        nullable=False,
        server_default=func.now(),
        index=True,
    )
