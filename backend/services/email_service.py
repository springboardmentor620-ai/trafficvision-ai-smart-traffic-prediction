"""Best-effort, login-triggered traffic alert email delivery."""
import asyncio
import logging
import os

try:
    from fastapi_mail import ConnectionConfig, FastMail, MessageSchema
    _MAIL_IMPORT_ERROR: Exception | None = None
except ImportError as error:
    # Email delivery must never stop authentication if an environment is missing
    # the optional mail dependency.
    ConnectionConfig = FastMail = MessageSchema = None
    _MAIL_IMPORT_ERROR = error

logger = logging.getLogger(__name__)


def _mask_email(email: str) -> str:
    local, separator, domain = email.partition("@")
    if not separator:
        return "[invalid recipient]"
    return f"{local[:1]}***@{domain}"


def _safe_error_message(error: Exception) -> str:
    message = str(error) or error.__class__.__name__
    for value in (os.getenv("MAIL_PASSWORD"), os.getenv("SMTP_PASSWORD")):
        if value:
            message = message.replace(value, "[redacted]")
    return message


def _email_is_configured() -> bool:
    required = ("MAIL_SERVER", "MAIL_USERNAME", "MAIL_PASSWORD", "MAIL_FROM")
    missing = [key for key in required if not os.getenv(key)]
    if missing:
        logger.error("Alert email failed: missing SMTP configuration: %s", ", ".join(missing))
        return False
    return True


def send_login_alert_email(recipient: str, alerts: list) -> bool:
    """Email the authenticated user once per alert snapshot and cooldown period.

    SMTP setup is optional: a missing or failed configuration deliberately leaves
    login and in-app alerts unaffected.
    """
    if _MAIL_IMPORT_ERROR is not None:
        logger.error("Alert email failed: %s", _safe_error_message(_MAIL_IMPORT_ERROR))
        return False
    if not recipient or not alerts or not _email_is_configured():
        return False
    try:
        config = ConnectionConfig(
            MAIL_USERNAME=os.getenv("MAIL_USERNAME", ""),
            MAIL_PASSWORD=os.getenv("MAIL_PASSWORD", ""),
            MAIL_FROM=os.getenv("MAIL_FROM", ""),
            MAIL_PORT=int(os.getenv("MAIL_PORT", "587")),
            MAIL_SERVER=os.getenv("MAIL_SERVER", ""),
            MAIL_STARTTLS=os.getenv("MAIL_STARTTLS", "true").lower() == "true",
            MAIL_SSL_TLS=os.getenv("MAIL_SSL_TLS", "false").lower() == "true",
            USE_CREDENTIALS=True,
        )
        message = MessageSchema(
            subject="TrafficVision AI - Traffic Alert Notification",
            recipients=[recipient],
            body=("Hello,\n\n"
                  "You have active traffic alerts in the TrafficVision AI system.\n\n"
                  "Please log in to the TrafficVision AI dashboard to view the current traffic alerts, "
                  "congestion information and recommended actions.\n\n"
                  "Regards,\n"
                  "TrafficVision AI"),
            subtype="plain",
        )
        asyncio.run(FastMail(config).send_message(message))
        logger.info("Traffic alert email sent successfully to %s", _mask_email(recipient))
        return True
    except Exception as error:
        logger.error("Alert email failed: %s", _safe_error_message(error))
        return False
