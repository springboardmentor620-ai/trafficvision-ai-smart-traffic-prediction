"""
TrafficVisionAI
Traffic SQLAlchemy Model

Maps the existing `traffic_data` MySQL table.

Important:
- This model does NOT load traffic records.
- It only defines the database mapping.
- Analytics/recommendation queries are performed separately.
- Existing field aliases are preserved for backward compatibility.
"""

from sqlalchemy import (
    Column,
    DateTime,
    Float,
    Index,
    Integer,
    String,
    case,
    func,
)
from sqlalchemy.ext.hybrid import hybrid_property
from sqlalchemy.orm import synonym

from database import Base


class Traffic(Base):
    """
    SQLAlchemy model for the existing traffic_data table.
    """

    __tablename__ = "traffic_data"

    # ============================================================
    # PRIMARY KEY
    # ============================================================

    id = Column(
        Integer,
        primary_key=True,
    )

    # ============================================================
    # LOCATION / TIME
    # ============================================================

    datetime = Column(
        DateTime,
        nullable=True,
    )

    latitude = Column(
        Float,
        nullable=True,
    )

    longitude = Column(
        Float,
        nullable=True,
    )

    # ============================================================
    # TRAFFIC INFORMATION
    # ============================================================

    vehicle_count = Column(
        Integer,
        nullable=True,
    )

    speed = Column(
        Float,
        nullable=True,
    )

    congestion_level = Column(
        String(50),
        nullable=True,
    )

    # ============================================================
    # ROAD / ENVIRONMENT
    # ============================================================

    weather = Column(
        String(50),
        nullable=True,
    )

    road_name = Column(
        String(100),
        nullable=True,
    )

    traffic_signal = Column(
        String(20),
        nullable=True,
    )

    accident = Column(
        String(20),
        nullable=True,
    )

    # ============================================================
    # BACKWARD COMPATIBILITY
    # ============================================================
    #
    # These aliases allow older parts of the application to
    # continue using the previous property names while the
    # actual MySQL column names remain unchanged.
    #

    location = synonym(
        "road_name"
    )

    road_status = synonym(
        "congestion_level"
    )

    average_speed = synonym(
        "speed"
    )

    accident_status = synonym(
        "accident"
    )

    # ============================================================
    # DERIVED EMERGENCY STATUS
    # ============================================================

    @hybrid_property
    def emergency_status(self) -> str:
        """
        Python-side emergency status.

        Accident values treated as an active accident:
            yes
            true
            1
            y

        Otherwise:
            Normal
        """

        accident = str(
            self.accident or ""
        ).strip().lower()

        if accident in {
            "yes",
            "true",
            "1",
            "y",
        }:
            return "Accident"

        return "Normal"

    @emergency_status.expression
    def emergency_status(cls):
        """
        SQL-side emergency status.

        This allows emergency_status to be used
        inside SQLAlchemy queries.
        """

        return case(
            (
                func.lower(
                    cls.accident
                ).in_(
                    [
                        "yes",
                        "true",
                        "1",
                        "y",
                    ]
                ),
                "Accident",
            ),
            else_="Normal",
        )


# ================================================================
# DATABASE INDEX DEFINITIONS
# ================================================================
#
# These are explicit named indexes.
#
# IMPORTANT:
# Defining an Index here does not necessarily modify an already
# existing MySQL table. Existing database indexes should be
# inspected before creating additional indexes manually.
#
# We intentionally do NOT use:
#
#     index=True
#
# on the same columns, because that can create duplicate indexes
# when combined with the explicit Index definitions below.
# ================================================================

__table_args__ = (
    Index(
        "idx_traffic_data_datetime",
        "datetime",
    ),

    Index(
        "idx_traffic_data_congestion",
        "congestion_level",
    ),

    Index(
        "idx_traffic_data_weather",
        "weather",
    ),

    Index(
        "idx_traffic_data_road",
        "road_name",
    ),
)
