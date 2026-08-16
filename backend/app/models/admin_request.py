from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.sql import func
 
from app.database import Base
 
 
class AdminRequest(Base):
    """
    A self-service request from an OPERATOR asking to become an
    ADMIN, which only a SUPER_ADMIN can approve or reject - never the
    requester themselves, even if they later become a super_admin
    (see admin_management_service's explicit requester_id ==
    reviewed_by.id guard in both approve and reject).
 
    status is one of "pending", "approved", "rejected". Unlike
    AdminInvitation, there is no "expired" concept here - a request
    doesn't carry an expiry, it just waits for a super_admin to act
    on it.
    """
 
    __tablename__ = "admin_requests"
 
    id = Column(
        Integer,
        primary_key=True,
        index=True
    )
 
    # Nullable + ON DELETE SET NULL (not CASCADE), same reasoning as
    # every other actor/target reference in this project (AuditLog,
    # AdminInvitation): the request's history should survive the
    # requester's account being deleted later.
    requester_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True
    )
 
    status = Column(
        String,
        nullable=False,
        default="pending"
    )
 
    reviewed_by_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True
    )
 
    reviewed_at = Column(
        DateTime(timezone=True),
        nullable=True
    )
 
    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )
 