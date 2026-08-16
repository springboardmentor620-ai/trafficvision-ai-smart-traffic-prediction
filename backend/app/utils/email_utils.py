"""Reusable helpers for the forgot-password flow: generating a secure
random token and sending the reset email over Gmail SMTP.

Uses only the Python standard library (secrets, smtplib, email) - no new
third-party dependency is needed for this.
"""

import secrets
import smtplib
from email.mime.text import MIMEText

from app.config import (
    MAIL_USERNAME,
    MAIL_PASSWORD,
    MAIL_FROM,
    MAIL_SERVER,
    MAIL_PORT,
    MAIL_STARTTLS,
    MAIL_SSL_TLS,
    FRONTEND_URL,
    ADMIN_INVITATION_EXPIRE_HOURS,
)


def generate_reset_token() -> str:
    """Cryptographically secure, URL-safe token (not a JWT) - storing it
    directly in the DB lets it be single-use and invalidated just by
    clearing the column, independent of the login access-token's own
    expiry policy in app.security."""

    return secrets.token_urlsafe(32)


def send_reset_email(to_email: str, token: str) -> None:
    """Sends the password-reset email over Gmail SMTP using the
    MAIL_* settings from app.config (sourced from .env - never
    hardcoded)."""

    reset_link = f"{FRONTEND_URL}/reset-password?token={token}"

    body = (
        "Hello,\n\n"
        "We received a request to reset your password.\n\n"
        "Click the link below:\n\n"
        f"{reset_link}\n\n"
        "This link expires in 15 minutes.\n\n"
        "If you did not request this, ignore this email.\n\n"
        "Regards,\n"
        "TrafficVision Team"
    )

    message = MIMEText(body, "plain")
    message["Subject"] = "TrafficVision Password Reset"
    message["From"] = MAIL_FROM
    message["To"] = to_email

    if MAIL_SSL_TLS:
        with smtplib.SMTP_SSL(MAIL_SERVER, MAIL_PORT) as server:
            server.login(MAIL_USERNAME, MAIL_PASSWORD)
            server.sendmail(MAIL_FROM, [to_email], message.as_string())
    else:
        with smtplib.SMTP(MAIL_SERVER, MAIL_PORT) as server:
            if MAIL_STARTTLS:
                server.starttls()
            server.login(MAIL_USERNAME, MAIL_PASSWORD)
            server.sendmail(MAIL_FROM, [to_email], message.as_string())


def generate_invitation_token() -> str:
    """Same generation approach as generate_reset_token() - a fresh
    cryptographically secure, URL-safe token. Kept as a separate
    function (rather than reusing generate_reset_token() directly)
    so the two token families can evolve independently - e.g. if
    admin-invitation tokens ever need a different length or format,
    that change won't silently affect password resets too."""

    return secrets.token_urlsafe(32)


def send_admin_invitation_email(to_email: str, token: str) -> None:
    """Sends the admin-invitation email over the same Gmail SMTP
    configuration as send_reset_email(). The link points at a
    frontend accept-invitation page (not yet built - that's Step 5)
    which will collect a name/password and POST them along with this
    token to POST /auth/accept-invitation."""

    invitation_link = f"{FRONTEND_URL}/accept-invitation?token={token}"

    body = (
        "Hello,\n\n"
        "You have been invited to become an administrator on "
        "TrafficVision AI.\n\n"
        "Click the link below to accept this invitation and set up "
        "your admin account:\n\n"
        f"{invitation_link}\n\n"
        f"This link expires in {ADMIN_INVITATION_EXPIRE_HOURS} hours "
        "and can only be used once.\n\n"
        "If you were not expecting this invitation, you can safely "
        "ignore this email.\n\n"
        "Regards,\n"
        "TrafficVision Team"
    )

    message = MIMEText(body, "plain")
    message["Subject"] = "TrafficVision Admin Invitation"
    message["From"] = MAIL_FROM
    message["To"] = to_email

    if MAIL_SSL_TLS:
        with smtplib.SMTP_SSL(MAIL_SERVER, MAIL_PORT) as server:
            server.login(MAIL_USERNAME, MAIL_PASSWORD)
            server.sendmail(MAIL_FROM, [to_email], message.as_string())
    else:
        with smtplib.SMTP(MAIL_SERVER, MAIL_PORT) as server:
            if MAIL_STARTTLS:
                server.starttls()
            server.login(MAIL_USERNAME, MAIL_PASSWORD)
            server.sendmail(MAIL_FROM, [to_email], message.as_string())
