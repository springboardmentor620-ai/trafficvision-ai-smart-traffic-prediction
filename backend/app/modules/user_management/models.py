from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database import Base


class Role(Base):
    """
    Roles table: admin, traffic_operator, public
    """
    __tablename__ = "roles"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), unique=True, nullable=False)

    users = relationship("User", back_populates="role")


class User(Base):
    """
    Users table: stores admins, traffic operators, and public/commuter accounts.
    """
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(100), nullable=False)
    email = Column(String(150), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role_id = Column(Integer, ForeignKey("roles.id"), nullable=False)
    profile_picture = Column(String(255), nullable=True)
    phone_number = Column(String(20), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    role = relationship("Role", back_populates="users")
