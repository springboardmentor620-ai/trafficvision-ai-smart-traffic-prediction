from fastapi import Depends
from fastapi import HTTPException

from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.user import User

from app.core.oauth2 import get_current_user


def get_database() -> Session:

    return Depends(get_db)


def get_current_active_user(
    current_user: User = Depends(get_current_user)
) -> User:

    if not current_user.is_active:

        raise HTTPException(
            status_code=403,
            detail="User account is inactive."
        )

    return current_user


def require_admin(
    current_user: User = Depends(get_current_active_user)
) -> User:

    if current_user.role != "admin":

        raise HTTPException(
            status_code=403,
            detail="Administrator access required."
        )

    return current_user