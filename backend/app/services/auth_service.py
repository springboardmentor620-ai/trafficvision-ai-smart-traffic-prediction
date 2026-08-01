from sqlalchemy.orm import Session

from app.core.security import hash_password
from app.models.user import User
from app.repositories.user_repository import UserRepository
from app.schemas.user import UserCreate


class AuthService:

    @staticmethod
    def register(
        db: Session,
        user_data: UserCreate
    ):

        existing = UserRepository.get_by_email(
            db,
            user_data.email
        )

        if existing:

            return None

        user = User(

            full_name=user_data.full_name,

            email=user_data.email,

            password=hash_password(
                user_data.password
            ),

            role="admin"
        )

        return UserRepository.create(
            db,
            user
        )