"""Shared helper for hashing single-use lookup tokens (password
reset, admin invitations) before they're stored in the database.
 
Centralized here so both features use the identical, correct
approach instead of each maintaining their own copy - originally
duplicated only in admin_invitation_service.py (Step 3), consolidated
here when password_reset_service.py needed the same treatment
(Step 6).
"""
 
import hashlib
 
 
def hash_token(raw_token: str) -> str:
    """
    SHA-256 hex digest of a raw token.
 
    Deliberately not passlib's hash_password() (bcrypt) - that's
    designed for slow-hashing low-entropy human passwords, which is
    unnecessary and slower than needed for an already-high-entropy
    secrets.token_urlsafe() value. A plain fast hash is standard
    practice for this kind of lookup token, and is what the database
    is queried against directly.
    """
 
    return hashlib.sha256(raw_token.encode()).hexdigest()
 