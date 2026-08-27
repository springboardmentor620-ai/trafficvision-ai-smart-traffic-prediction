import random
import time
import uuid
from typing import Optional
from app.services.email_service import EmailService

# Thread-safe in-memory store for 2-step verification codes
# Key: email (lowercased) -> Dict: { code, purpose, timestamp, session_id, payload }
_OTP_STORE: dict[str, dict] = {}
OTP_EXPIRY_SECONDS = 300  # 5 minutes


class OTPService:
    @staticmethod
    def generate_code() -> str:
        """Generates a secure 6-digit numeric OTP code."""
        return f"{random.randint(100000, 999999)}"

    @classmethod
    def create_and_send_otp(
        cls,
        email: str,
        purpose: str = "Login Verification",
        payload: Optional[dict] = None,
    ) -> dict:
        """
        Generates and stores an OTP, then emails it via EmailService.
        """
        cleaned_email = email.strip().lower()
        code = cls.generate_code()
        session_id = str(uuid.uuid4())

        _OTP_STORE[cleaned_email] = {
            "code": code,
            "purpose": purpose,
            "timestamp": time.time(),
            "session_id": session_id,
            "payload": payload or {},
        }

        # Dispatch OTP email asynchronously
        EmailService.send_otp_email_async(
            recipient=cleaned_email,
            otp_code=code,
            purpose=purpose,
        )

        return {
            "session_id": session_id,
            "email": cleaned_email,
            "expires_in": OTP_EXPIRY_SECONDS,
            # In development/demo, expose the generated code for test convenience
            "demo_code": code,
        }

    @classmethod
    def verify_otp(cls, email: str, code: str) -> tuple[bool, str, Optional[dict]]:
        """
        Validates the supplied 6-digit OTP code against the store.
        Returns: (is_valid, message, payload)
        """
        cleaned_email = email.strip().lower()
        record = _OTP_STORE.get(cleaned_email)

        if not record:
            return False, "No active OTP request found for this email. Please request a new code.", None

        # Check expiry
        if time.time() - record["timestamp"] > OTP_EXPIRY_SECONDS:
            _OTP_STORE.pop(cleaned_email, None)
            return False, "Verification code has expired. Please request a new code.", None

        # Check code match
        if record["code"] != code.strip():
            return False, "Invalid verification code. Please check and try again.", None

        # Consume OTP upon successful verification
        payload = record.get("payload", {})
        _OTP_STORE.pop(cleaned_email, None)
        return True, "Verification successful.", payload
