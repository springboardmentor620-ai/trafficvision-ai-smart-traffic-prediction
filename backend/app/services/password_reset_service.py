"""Service layer for the forgot-password / reset-password flow. Kept
separate from routes/auth.py so the route stays thin - the same pattern
used elsewhere in this project (prediction_service, traffic_alert_service,
traffic_analytics_service, ai_recommendation_service, admin_invitation_service).
"""
 
from datetime import datetime, timedelta
 
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
 
from app.models.user import User
from app.security import hash_password
from app.utils.email_utils import generate_reset_token, send_reset_email
from app.utils.token_utils import hash_token
 
RESET_TOKEN_EXPIRY_MINUTES = 15
 
 
def request_password_reset(db: Session, email: str) -> None:
    """Generates and emails a reset token if the email belongs to a real
    account. Always returns None either way - the caller (route) sends
    back the same generic message regardless of the result, so this
    function never leaks whether an email is registered."""
 
    user = db.query(User).filter(User.email == email).first()
 
    if not user:
        return
 
    raw_token = generate_reset_token()
 
    # Stored as a hash, not the raw token (Step 6) - same reasoning
    # already applied to admin invitation tokens in Step 3: a leaked
    # reset_token value would otherwise let someone reset that
    # user's password directly, which is at least as sensitive as an
    # admin invitation. The column is still named reset_token to
    # keep this a minimal, non-destructive change - it now holds a
    # hash instead of the raw value. See app/utils/token_utils.py.
    user.reset_token = hash_token(raw_token)
    user.reset_token_expiry = datetime.utcnow() + timedelta(
        minutes=RESET_TOKEN_EXPIRY_MINUTES
    )
 
    try:
 
        db.commit()
 
    except SQLAlchemyError:
 
        db.rollback()
 
        raise
 
    # The raw token is only ever used here, to build the emailed
    # link - it is never stored anywhere, logged, or returned from
    # this function.
    send_reset_email(user.email, raw_token)
 
 
def reset_password(db: Session, token: str, new_password: str) -> bool:
    """Validates the token (exists + not expired), sets the new password
    using the existing bcrypt hashing, and invalidates the token so it
    can't be reused. Returns False for any invalid/expired/already-used
    token so the route can return a generic 400."""
 
    # Defensive: generate_reset_token() output never contains
    # whitespace, so stripping it here can never turn a wrong token
    # into a match - it can only prevent a false rejection caused by
    # a stray leading/trailing space or newline from copy/paste. Same
    # fix already applied to admin invitation tokens in Step 3.
    token = token.strip()
 
    user = db.query(User).filter(
        User.reset_token == hash_token(token)
    ).first()
 
    if not user or not user.reset_token_expiry:
        return False
 
    if datetime.utcnow() > user.reset_token_expiry:
 
        # Expired - clear it so it can't be retried, then reject.
        user.reset_token = None
        user.reset_token_expiry = None
 
        try:
 
            db.commit()
 
        except SQLAlchemyError:
 
            db.rollback()
 
            raise
 
        return False
 
    user.password = hash_password(new_password)
    user.reset_token = None
    user.reset_token_expiry = None
 
    try:
 
        db.commit()
 
    except SQLAlchemyError:
 
        db.rollback()
 
        raise
 
    return True
 