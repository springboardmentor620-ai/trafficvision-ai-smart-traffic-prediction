from sqlalchemy.orm import Session

from app.models.audit_log import AuditLog


class AuditLogRepository:

    @staticmethod
    def create(
        db: Session,
        data: dict
    ):

        log = AuditLog(**data)

        db.add(log)

        db.commit()

        db.refresh(log)

        return log


    @staticmethod
    def get_all(
        db: Session,
        limit: int = 100
    ):

        return (
            db.query(AuditLog)
            .order_by(
                AuditLog.created_at.desc()
            )
            .limit(limit)
            .all()
        )