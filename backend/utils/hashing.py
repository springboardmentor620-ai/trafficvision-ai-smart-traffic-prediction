import bcrypt

# bcrypt hard limit is 72 bytes — truncate before hashing/verifying
MAX_BCRYPT_BYTES = 72


def _prepare(password: str) -> bytes:
    """Encode and truncate password to bcrypt's 72-byte limit."""
    return password.encode("utf-8")[:MAX_BCRYPT_BYTES]


def hash_password(password: str) -> str:
    """Hash a password using bcrypt. Returns a utf-8 string."""
    hashed = bcrypt.hashpw(_prepare(password), bcrypt.gensalt())
    return hashed.decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plain password against a bcrypt hash."""
    return bcrypt.checkpw(
        _prepare(plain_password),
        hashed_password.encode("utf-8")
    )
