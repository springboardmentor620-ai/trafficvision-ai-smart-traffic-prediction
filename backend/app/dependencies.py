from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session

from app.config import SECRET_KEY, ALGORITHM
from app.database import get_db
from app.models.user import User
from app.constants import ACTIVE, OPERATOR_OR_ABOVE, ADMIN_OR_ABOVE, SUPER_ADMIN_ONLY

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or expired token",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )

        email = payload.get("sub")

        if email is None:
            raise credentials_exception

    except JWTError:
        raise credentials_exception

    user = db.query(User).filter(
        User.email == email
    ).first()

    if user is None:
        raise credentials_exception

    # -----------------------------------------------------
    # ACCOUNT LIFECYCLE ENFORCEMENT
    #
    # A suspended/deactivated user still has a real row and a
    # token that decodes fine, but must not be able to use any
    # authenticated endpoint. Checking this here means every
    # route that depends on get_current_user (directly or via
    # require_operator/require_admin/require_super_admin) gets
    # this for free - no per-route duplication needed.
    #
    # 403 (not 401) because the credential itself is valid; the
    # account it belongs to is what's blocked. This matches how
    # /auth/login and /auth/google report suspended/deactivated
    # accounts, so the frontend gets a consistent error shape
    # regardless of which endpoint caught it.
    # -----------------------------------------------------

    if user.status != ACTIVE:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=(
                "Your account has been suspended."
                if user.status == "suspended"
                else "Your account has been deactivated."
            )
        )

    return user


def require_role(*allowed_roles):
    def role_checker(current_user=Depends(get_current_user)):
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=403,
                detail="Access denied"
            )
        return current_user

    return role_checker


# -----------------------------------------------------------------
# Named role dependencies, used the same bare way as
# get_current_user (e.g. Depends(require_admin), not
# Depends(require_admin())).
#
# IMPORTANT: these are intentionally real functions that each take
# current_user via their own Depends(get_current_user), NOT
# factories that return require_role(...). A factory version
# (`def require_admin(): return require_role(*ADMIN_OR_ABOVE)`)
# would only work if called as Depends(require_admin()) - if used
# bare as Depends(require_admin), matching how get_current_user is
# used everywhere else in this codebase, FastAPI would bind
# current_user to the returned checker *function itself* and never
# call it, silently skipping the role check entirely. Since that
# failure mode is "silently allow access" rather than an error, it's
# written as a direct dependency instead, so bare usage is always
# correct.
#
# Each is additive over the one below it: super_admin passes every
# one of these checks, admin passes require_operator/require_admin,
# and operator only passes require_operator. require_role(*roles) is
# still available unchanged for routes that need a custom role list
# (e.g. app/routes/traffic.py's existing require_role("admin",
# "operator") usage).
# -----------------------------------------------------------------

def require_operator(current_user=Depends(get_current_user)):
    if current_user.role not in OPERATOR_OR_ABOVE:
        raise HTTPException(status_code=403, detail="Access denied")
    return current_user


def require_admin(current_user=Depends(get_current_user)):
    if current_user.role not in ADMIN_OR_ABOVE:
        raise HTTPException(status_code=403, detail="Access denied")
    return current_user


def require_super_admin(current_user=Depends(get_current_user)):
    if current_user.role not in SUPER_ADMIN_ONLY:
        raise HTTPException(status_code=403, detail="Access denied")
    return current_user
