from sqlalchemy.orm import Session

from app.core.security import hash_password

from app.models.user import User

from app.repositories.user_repository import UserRepository

from app.schemas.user import UserCreate

from app.services.audit_log_service import AuditLogService


class AuthService:

    @staticmethod
    def register(
        db: Session,
        user_data: UserCreate
    ):

        # =====================================================
        # CHECK EXISTING USER
        # =====================================================

        existing = UserRepository.get_by_email(
            db,
            user_data.email
        )


        if existing:

            return None


        # =====================================================
        # CREATE OPERATOR ACCOUNT
        # =====================================================

        user = User(

            full_name=user_data.full_name,

            email=user_data.email,

            password=hash_password(
                user_data.password
            ),

            # Normal registration always creates
            # an Operator account.

            role="operator",

            is_active=True

        )


        # =====================================================
        # SAVE USER
        # =====================================================

        created_user = UserRepository.create(
            db,
            user
        )


        # =====================================================
        # AUDIT LOG
        # =====================================================

        AuditLogService.create(

            db=db,

            # The newly registered user performs
            # their own registration.

            actor_id=created_user.id,

            actor_name=created_user.full_name,

            target_user_id=created_user.id,

            target_user_name=created_user.full_name,

            action="USER_REGISTERED",

            description=(
                f"New operator account registered "
                f"for {created_user.full_name}."
            )
        )


        return created_user