from fastapi import Request, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.utils.security import decode_access_token
from app.models.models import User
from app.utils.logger import logger
from typing import List, Optional

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login", auto_error=False)

def get_current_user(
    request: Request,
    token: Optional[str] = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> User:
    """Dependency to extract and validate current authenticated user from JWT bearer token."""
    unauthorized_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Session expired. Please log in again.",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    if not token:
        auth_header = request.headers.get("Authorization") or request.headers.get("authorization")
        if auth_header and auth_header.lower().startswith("bearer "):
            token = auth_header.split(" ", 1)[1].strip()

    if not token:
        logger.warning("Authentication failed: No token provided in request header")
        raise unauthorized_exception

    payload = decode_access_token(token)
    if payload is None:
        logger.warning("Authentication failed: Invalid or expired JWT token")
        raise unauthorized_exception

    sub_claim = payload.get("sub")
    if sub_claim is None:
        logger.warning("Authentication failed: 'sub' claim missing from JWT payload")
        raise unauthorized_exception

    user = None
    # Try integer lookup first
    try:
        user_id = int(sub_claim)
        user = db.query(User).filter(User.id == user_id).first()
    except (ValueError, TypeError):
        pass

    # Fallback to email lookup if integer lookup yielded no user
    if user is None:
        user = db.query(User).filter(User.email == str(sub_claim)).first()

    if user is None:
        logger.warning("Authentication failed: User '%s' not found in database", sub_claim)
        raise unauthorized_exception

    if getattr(user, "status", "ACTIVE").upper() == "INACTIVE":
        logger.warning("Authentication failed: User '%s' account is INACTIVE", user.email)
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is deactivated. Please contact an Administrator."
        )

    return user

def require_roles(allowed_roles: List[str]):
    """Role-based authorization dependency guard with case-insensitive checking."""
    normalized_allowed = [r.upper() for r in allowed_roles]

    def role_checker(current_user: User = Depends(get_current_user)) -> User:
        user_role = (current_user.role or "").upper()
        if user_role not in normalized_allowed:
            logger.warning("Authorization failed: User role '%s' not in allowed roles %s", current_user.role, allowed_roles)
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions."
            )
        return current_user
    return role_checker
