from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.orm import relationship

from app.database import Base
from app.constants import OPERATOR, ACTIVE


class User(Base):
    __tablename__ = "users"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    name = Column(
        String,
        nullable=False
    )

    email = Column(
        String,
        unique=True,
        index=True,
        nullable=False
    )

    password = Column(
        String,
        nullable=False
    )

    # One of app.constants.ALL_ROLES ("operator", "admin",
    # "super_admin"). Enforced at the DB level by the
    # users_role_check CHECK constraint added in migration 001.
    # Public signup (POST /auth/register, POST /auth/google) always
    # hardcodes "operator" server-side - this column is never set
    # from client-supplied input directly.
    role = Column(
        String,
        nullable=False,
        default=OPERATOR
    )

    # Account lifecycle. One of app.constants.ALL_STATUSES
    # ("active", "suspended", "deactivated"). Enforced at the DB
    # level by the users_status_check CHECK constraint added in
    # migration 001. get_current_user() rejects any non-"active"
    # user on every authenticated request, and /auth/login and
    # /auth/google both reject non-"active" users before issuing a
    # token.
    status = Column(
        String,
        nullable=False,
        default=ACTIVE
    )

    # Google account's stable unique identifier.
    # NULL for normal email/password users.
    google_sub = Column(
        String,
        unique=True,
        nullable=True,
        index=True
    )

    # -------------------------------------------------------------
    # Password-reset support.
    #
    # These were already read/written by
    # app/services/password_reset_service.py before this change, but
    # the column never existed on this model (or on the real table),
    # so POST /auth/reset-password would raise AttributeError the
    # moment it ran a query against User.reset_token. Added here,
    # matching migration 001, to make that flow actually work.
    # -------------------------------------------------------------
    reset_token = Column(
        String,
        nullable=True,
        index=True
    )

    reset_token_expiry = Column(
        DateTime,
        nullable=True
    )

    # Traffic records created by this user
    traffic_records = relationship(
        "TrafficRecord",
        back_populates="owner"
    )

    # Prediction history created by this user
    prediction_history = relationship(
        "PredictionHistory",
        back_populates="user"
    )