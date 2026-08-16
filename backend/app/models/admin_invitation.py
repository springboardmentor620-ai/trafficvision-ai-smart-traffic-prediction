from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.sql import func

from app.database import Base


class AdminInvitation(Base):
    """
    A single-use, expiring, email-locked invitation that lets a
    SUPER_ADMIN grant ADMIN access without the invited person ever
    being able to choose their own role.

    status is one of "pending", "accepted", "revoked". "expired" is
    intentionally NOT a stored status - it's derived by comparing
    expires_at to the current time wherever it matters (in
    admin_invitation_service.accept_admin_invitation), so there's no
    background job needed to sweep and relabel rows as they age out.
    """

    __tablename__ = "admin_invitations"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    # The only email this invitation can ever be accepted for. The
    # accept endpoint never takes an email from the caller - it is
    # always read from this column, which is why the invited person
    # can't redirect the invitation to a different address.
    email = Column(
        String,
        nullable=False,
        index=True
    )

    # SHA-256 hex digest of the raw token, never the raw token
    # itself. See admin_invitation_service._hash_token(). The raw
    # token is returned exactly once, at creation time, in the API
    # response and the invitation email - it is never stored,
    # logged, or included in audit metadata anywhere.
    token_hash = Column(
        String,
        nullable=False,
        unique=True,
        index=True
    )

    status = Column(
        String,
        nullable=False,
        default="pending"
    )

    # Who sent this invitation. ON DELETE SET NULL (not CASCADE) so
    # the invitation record survives if the inviting super_admin's
    # account is later deleted - matches the same reasoning already
    # used for AuditLog.actor_user_id.
    invited_by_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True
    )

    expires_at = Column(
        DateTime(timezone=True),
        nullable=False
    )

    accepted_at = Column(
        DateTime(timezone=True),
        nullable=True
    )

    # The admin account this invitation resulted in, once accepted.
    # Same ON DELETE SET NULL reasoning as invited_by_id.
    accepted_user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )
