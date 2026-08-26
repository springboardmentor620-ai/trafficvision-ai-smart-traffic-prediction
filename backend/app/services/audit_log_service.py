from sqlalchemy.orm import Session

from app.repositories.audit_log_repository import (
    AuditLogRepository
)


class AuditLogService:

    @staticmethod
    def create(
        db: Session,
        actor_id: int | None,
        actor_name: str | None,
        target_user_id: int | None,
        target_user_name: str | None,
        action: str,
        description: str
    ):

        return AuditLogRepository.create(
            db,
            {
                "actor_id": actor_id,
                "actor_name": actor_name,
                "target_user_id": target_user_id,
                "target_user_name": target_user_name,
                "action": action,
                "description": description
            }
        )


    @staticmethod
    def get_all(
        db: Session,
        limit: int = 100
    ):

        return AuditLogRepository.get_all(
            db,
            limit
        )