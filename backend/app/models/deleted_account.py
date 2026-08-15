from datetime import datetime

from sqlalchemy import Column, Integer, String, DateTime

from app.database import Base


class DeletedAccount(Base):
    __tablename__ = "deleted_accounts"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    email = Column(
        String,
        nullable=False,
        index=True
    )

    google_sub = Column(
        String,
        nullable=True,
        index=True
    )

    deleted_at = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False
    )