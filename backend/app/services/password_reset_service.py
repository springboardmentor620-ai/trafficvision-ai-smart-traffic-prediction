"""Service layer for the forgot-password / reset-password flow. Kept
separate from routes/auth.py so the route stays thin - the same pattern
used elsewhere in this project (prediction_service, traffic_alert_service,
traffic_analytics_service, ai_recommendation_service)."""

from datetime import datetime, timedelta

from sqlalchemy.orm import Session

from app.models.user import User
from app.security import hash_password
from app.utils.email_utils import generate_reset_token, send_reset_email

RESET_TOKEN_EXPIRY_MINUTES = 15


def request_password_reset(db: Session, email: str) -> None:
    """Generates and emails a reset token if the email belongs to a real
    account. Always returns None either way - the caller (route) sends
    back the same generic message regardless of the result, so this
    function never leaks whether an email is registered."""

    user = db.query(User).filter(User.email == email).first()

    if not user:
        return

    token = generate_reset_token()

    user.reset_token = token
    user.reset_token_expiry = datetime.utcnow() + timedelta(
        minutes=RESET_TOKEN_EXPIRY_MINUTES
    )

    db.commit()

    send_reset_email(user.email, token)


def reset_password(db: Session, token: str, new_password: str) -> bool:
    """Validates the token (exists + not expired), sets the new password
    using the existing bcrypt hashing, and invalidates the token so it
    can't be reused. Returns False for any invalid/expired/already-used
    token so the route can return a generic 400."""

    user = db.query(User).filter(User.reset_token == token).first()

    if not user or not user.reset_token_expiry:
        return False

    if datetime.utcnow() > user.reset_token_expiry:
        # Expired - clear it so it can't be retried, then reject.
        user.reset_token = None
        user.reset_token_expiry = None
        db.commit()
        return False

    user.password = hash_password(new_password)
    user.reset_token = None
    user.reset_token_expiry = None

    db.commit()

    return True
