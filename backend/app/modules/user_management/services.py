from datetime import datetime, timedelta
from passlib.context import CryptContext
from jose import jwt
from sqlalchemy.orm import Session

from app.config import settings
from app.modules.user_management.models import User, Role

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


# ---------- Password helpers ----------

def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


# ---------- JWT helpers ----------

def create_access_token(user_id: int, role: str) -> str:
    """
    Creates a signed JWT containing the user's id and role.
    The role is embedded so we can do RBAC without a DB hit on every request.
    """
    expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    payload = {
        "sub": str(user_id),
        "role": role,
        "exp": expire,
    }
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def decode_access_token(token: str) -> dict:
    """
    Raises jose.JWTError if the token is invalid or expired.
    """
    return jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])


# ---------- DB helper functions ----------

def get_user_by_email(db: Session, email: str) -> User | None:
    return db.query(User).filter(User.email == email).first()


def get_user_by_id(db: Session, user_id: int) -> User | None:
    return db.query(User).filter(User.id == user_id).first()


def get_or_create_role(db: Session, role_name: str) -> Role:
    """
    Looks up a role by name, creating it if it doesn't exist yet.
    Keeps seed data simple during development.
    """
    role = db.query(Role).filter(Role.name == role_name).first()
    if not role:
        role = Role(name=role_name)
        db.add(role)
        db.commit()
        db.refresh(role)
    return role


def create_user(db: Session, full_name: str, email: str, password: str,
                 role_name: str, phone_number: str | None = None) -> User:
    role = get_or_create_role(db, role_name)
    user = User(
        full_name=full_name,
        email=email,
        password_hash=hash_password(password),
        role_id=role.id,
        phone_number=phone_number,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def authenticate_user(db: Session, email: str, password: str) -> User | None:
    user = get_user_by_email(db, email)
    if not user or not verify_password(password, user.password_hash):
        return None
    return user


def user_to_response_dict(user: User) -> dict:
    """
    Flattens the SQLAlchemy user + role relationship into a dict
    matching UserResponse schema (role name instead of role_id).
    """
    return {
        "id": user.id,
        "full_name": user.full_name,
        "email": user.email,
        "role": user.role.name,
        "phone_number": user.phone_number,
        "profile_picture": user.profile_picture,
        "is_active": user.is_active,
        "created_at": user.created_at,
    }
