"""
TrafficVisionAI
Alert SQLAlchemy Model

Maps the existing MySQL `alerts` table.

IMPORTANT:
- This model must match the existing database schema.
- No automatic database schema changes are performed.
- Do NOT add fields unless the corresponding MySQL
  columns actually exist.
"""

from datetime import datetime

from sqlalchemy import (
    Column,
    DateTime,
    ForeignKey,
    Integer,
    String,
    Text,
    text,
)

from database import Base


class Alert(Base):
    """
    SQLAlchemy model for the existing `alerts` table.
    """

    __tablename__ = "alerts"

    # ========================================================
    # PRIMARY KEY
    # ========================================================

    id = Column(
        Integer,
        primary_key=True,
        index=True,
        autoincrement=True,
    )

    # ========================================================
    # ALERT INFORMATION
    # ========================================================

    alert_type = Column(
        String(50),
        nullable=False,
    )

    location = Column(
        String(150),
        nullable=False,
    )

    # ========================================================
    # LOCATION COORDINATES
    # ========================================================

    latitude = Column(
        String(30),
        nullable=True,
    )

    longitude = Column(
        String(30),
        nullable=True,
    )

    # ========================================================
    # SEVERITY
    # ========================================================

    severity = Column(
        String(20),
        nullable=False,
    )

    # ========================================================
    # DESCRIPTION
    # ========================================================

    description = Column(
        Text,
        nullable=True,
    )

    # ========================================================
    # RECOMMENDATION
    # ========================================================

    recommendation = Column(
        Text,
        nullable=True,
    )

    # ========================================================
    # STATUS
    # ========================================================

    status = Column(
        String(20),
        nullable=False,
        default="Active",
    )

    # ========================================================
    # TRAFFIC REFERENCE
    # ========================================================

    traffic_id = Column(
        Integer,
        ForeignKey("traffic_data.id"),
        nullable=True,
    )

    # ========================================================
    # TIMESTAMPS
    # ========================================================

    created_at = Column(
        DateTime,
        nullable=True,
        server_default=text("CURRENT_TIMESTAMP"),
    )

    resolved_at = Column(
        DateTime,
        nullable=True,
    )
