from sqlalchemy import Column, Integer, String, Boolean, DateTime, text
from datetime import datetime
from database import Base

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(100), nullable=False)
    description = Column(String(255), nullable=False)
    alert_type = Column(String(50), nullable=False) # congestion, accident, closure, prediction, system
    priority = Column(String(50), nullable=False) # low, medium, high, critical
    timestamp = Column(DateTime, default=datetime.utcnow, server_default=text("CURRENT_TIMESTAMP"))
    is_read = Column(Boolean, default=False, nullable=False)
