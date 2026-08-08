from sqlalchemy import Column, Integer, String, Boolean

from app.database.base import Base


class Notification(Base):

    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)

    title = Column(String, nullable=False)

    message = Column(String, nullable=False)

    type = Column(String, default="info")

    is_read = Column(Boolean, default=False)