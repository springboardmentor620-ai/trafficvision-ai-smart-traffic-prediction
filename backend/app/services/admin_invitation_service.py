"""Service layer for the admin invitation / acceptance flow. Kept
separate from routes so the route stays thin - the same pattern used
elsewhere in this project (password_reset_service, prediction_service,
traffic_alert_service, traffic_analytics_service, ai_recommendation_service).
 
Both functions raise ValueError with a user-facing message for any
rejected case (invalid token, expired, already used, existing account,
etc.) - the calling route turns that into the appropriate HTTPException,
the same convention password_reset_service's callers already use.
"""
 
import hashlib
from datetime import datetime, timedelta, timezone
 
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
 
from app.models.user import User
from app.models.admin_invitation import AdminInvitation
from app.security import hash_password
from app.utils.email_utils import (
    generate_invitation_token,
    send_admin_invitation_email,
)
from app.constants import (
    ADMIN,
    ACTIVE,
    AUDIT_ADMIN_INVITED,
    AUDIT_ADMIN_INVITATION_ACCEPTED,
)
from app.services.audit_service import build_audit_log_entry
from app.config import ADMIN_INVITATION_EXPIRE_HOURS
 
 
def _hash_token(raw_token: str) -> str:
    """SHA-256 of the raw token. Deliberately not passlib's
    hash_password() (bcrypt) - that's designed for slow-hashing
    low-entropy human passwords, which is unnecessary and slower
    than needed for an already-high-entropy 32-byte secrets.token_urlsafe
    value. A plain fast hash is standard practice for this kind of
    lookup token and is what the DB queries against directly."""
 
    return hashlib.sha256(raw_token.encode()).hexdigest()
 
 
def create_admin_invitation(
    db: Session,
    email: str,
    invited_by: User
):
    """
    Creates a new pending invitation for `email`, sent by `invited_by`
    (the route enforces invited_by is a super_admin via
    require_super_admin before ever calling this). Returns
    (invitation, raw_token) - raw_token is returned exactly once here
    and is never stored (only its hash is).
    """
 
    existing_user = db.query(User).filter(
        User.email == email
    ).first()
 
    if existing_user:
        raise ValueError(
            "An account with this email already exists."
        )
 
    existing_invitation = db.query(AdminInvitation).filter(
        AdminInvitation.email == email,
        AdminInvitation.status == "pending"
    ).first()
 
    if existing_invitation and existing_invitation.expires_at > datetime.now(timezone.utc):
        raise ValueError(
            "An active invitation already exists for this email."
        )
 
    raw_token = generate_invitation_token()
 
    invitation = AdminInvitation(
        email=email,
        token_hash=_hash_token(raw_token),
        status="pending",
        invited_by_id=invited_by.id,
        expires_at=datetime.now(timezone.utc) + timedelta(
            hours=ADMIN_INVITATION_EXPIRE_HOURS
        )
    )
 
    db.add(invitation)
 
    try:
 
        # Flush (not commit) assigns invitation.id without ending
        # the transaction, so the ADMIN_INVITED audit entry below
        # can reference it and roll back together with the
        # invitation if anything fails before the real commit.
        db.flush()
 
        # The raw token is deliberately NEVER included here - only
        # the fact that an invitation was created, for whom, and by
        # whom.
        db.add(
            build_audit_log_entry(
                action=AUDIT_ADMIN_INVITED,
                actor_user=invited_by,
                metadata={
                    "invited_email": email,
                    "invitation_id": invitation.id
                }
            )
        )
 
        db.commit()
 
        db.refresh(invitation)
 
    except IntegrityError:
 
        db.rollback()
 
        raise ValueError(
            "An active invitation already exists for this email."
        )
 
    except SQLAlchemyError:
 
        db.rollback()
 
        raise
 
    # Best-effort: if SMTP isn't configured or fails, the invitation
    # still exists and invitation_link is still returned in the API
    # response to the super_admin who created it - the route can
    # hand that link over directly (or the caller can query the DB /
    # resend later), so a broken mail server never blocks the whole
    # feature the way it might if this raised.
    try:
 
        send_admin_invitation_email(email, raw_token)
 
    except Exception as error:
 
        print(
            f"[admin_invitation] failed to send invitation email: {error}"
        )
 
    return invitation, raw_token
 
 
def accept_admin_invitation(
    db: Session,
    raw_token: str,
    name: str,
    password: str
):
    """
    Validates the token (exists, still pending, not expired), creates
    the new admin account, marks the invitation accepted, and logs
    ADMIN_INVITATION_ACCEPTED - all in one transaction, so a failure
    partway through never leaves a ghost admin account or an
    invitation stuck in an inconsistent state. Returns the new User.
    """
 
    # Defensive: secrets.token_urlsafe() never produces whitespace, so
    # stripping it here can never turn a wrong token into a match - it
    # can only prevent a false rejection caused by a stray leading/
    # trailing space or newline picked up during copy/paste (a common
    # real-world artifact when a token is copied out of a terminal,
    # email client, or JSON response by hand). This is not a fallback
    # for a genuinely wrong or truncated token - those are still
    # correctly rejected below.
    raw_token = raw_token.strip()
 
    invitation = db.query(AdminInvitation).filter(
        AdminInvitation.token_hash == _hash_token(raw_token)
    ).first()
 
    if not invitation:
 
        raise ValueError(
            "This invitation link is invalid."
        )
 
    if invitation.status != "pending":
 
        raise ValueError(
            "This invitation has already been used or is no longer valid."
        )
 
    if invitation.expires_at < datetime.now(timezone.utc):
 
        raise ValueError(
            "This invitation has expired. Please request a new one."
        )
 
    existing_user = db.query(User).filter(
        User.email == invitation.email
    ).first()
 
    if existing_user:
 
        raise ValueError(
            "An account with this email already exists."
        )
 
    # Role is hardcoded to ADMIN here - never taken from the
    # request, never SUPER_ADMIN. This is the only way an admin
    # account can be created through self-service in this app.
    new_admin = User(
        name=name,
        email=invitation.email,
        password=hash_password(password),
        role=ADMIN,
        status=ACTIVE,
        google_sub=None
    )
 
    db.add(new_admin)
 
    try:
 
        db.flush()
 
        invitation.status = "accepted"
        invitation.accepted_at = datetime.now(timezone.utc)
        invitation.accepted_user_id = new_admin.id
 
        db.add(
            build_audit_log_entry(
                action=AUDIT_ADMIN_INVITATION_ACCEPTED,
                actor_user=new_admin,
                target_user_id=invitation.invited_by_id,
                metadata={"invitation_id": invitation.id}
            )
        )
 
        db.commit()
 
        db.refresh(new_admin)
 
    except IntegrityError:
 
        db.rollback()
 
        raise ValueError(
            "An account with this email already exists."
        )
 
    except SQLAlchemyError:
 
        db.rollback()
 
        raise
 
    return new_admin
 