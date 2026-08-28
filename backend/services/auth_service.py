"""PostgreSQL authentication with a local development fallback.

It preserves the existing API contract and lets the application run locally; replace
with hashed database credentials before production deployment.
"""
import logging

from database.database import get_connection
from services.alert_service import get_alerts
from services.email_service import send_login_alert_email


_users = {
    "admin@trafficvision.com": {"password": "admin123", "role": "Admin"},
    "user@trafficvision.com": {"password": "user123", "role": "Public User"},
    "operator@trafficvision.com": {"password": "operator123", "role": "Traffic Operator"},
}
logger = logging.getLogger(__name__)


def _database_user(email: str, password: str):
    """Use the existing PostgreSQL users table when it is available."""
    try:
        with get_connection() as connection, connection.cursor() as cursor:
            cursor.execute(
                "SELECT id, email, role FROM users WHERE email = %s AND password = %s",
                (email, password),
            )
            return cursor.fetchone()
    except Exception:
        # Local demo installations may not have PostgreSQL configured yet.
        return None


def _send_login_notification(user_id: int | None, email: str) -> tuple[int, bool]:
    try:
        logger.info("Login successful for user ID: %s", user_id if user_id is not None else "local-demo")
        logger.info("Preparing traffic alert email for logged-in user")
        alerts = get_alerts()
        logger.info("Active alerts found: %s", len(alerts))
        if not alerts:
            return 0, False
        logger.info("Sending alert email...")
        email_sent = send_login_alert_email(email, alerts)
        if email_sent:
            logger.info("Alert email sent successfully")
        return len(alerts), email_sent
    except Exception as error:
        logger.error("Alert email failed: %s", error.__class__.__name__)
        return 0, False


def authenticate(email, password):
    normalized_email = email.lower()
    database_user = _database_user(normalized_email, password)
    user = _users.get(normalized_email)
    role = database_user[2] if database_user else user["role"] if user and user["password"] == password else None
    if role:
        user_id = database_user[0] if database_user else None
        recipient = database_user[1] if database_user else normalized_email
        alert_count, email_sent = _send_login_notification(user_id, recipient)
        return {"status": "success", "message": "Login successful", "email": recipient, "role": role, "active_alert_count": alert_count, "email_notification_sent": email_sent}
    return {"status": "failed", "message": "Invalid email or password"}


def register(email, password, role):
    email = email.lower()
    try:
        with get_connection() as connection, connection.cursor() as cursor:
            cursor.execute("SELECT 1 FROM users WHERE email = %s", (email,))
            if cursor.fetchone():
                return {"status": "failed", "message": "An account with this email already exists."}
            cursor.execute(
                "INSERT INTO users (email, password, role) VALUES (%s, %s, %s)",
                (email, password, role),
            )
        return {"status": "success", "message": "Account created", "email": email, "role": role}
    except Exception:
        # Keep the existing local development flow available without PostgreSQL.
        pass
    if email in _users:
        return {"status": "failed", "message": "An account with this email already exists."}
    _users[email] = {"password": password, "role": role}
    return {"status": "success", "message": "Account created", "email": email, "role": role}
