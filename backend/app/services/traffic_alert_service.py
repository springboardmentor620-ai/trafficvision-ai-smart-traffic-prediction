from sqlalchemy.orm import Session

from app.models.user import User

from app.repositories.traffic_alert_repository import (
    TrafficAlertRepository
)

from app.services.audit_log_service import (
    AuditLogService
)


class TrafficAlertService:

    @staticmethod
    def create(
        db: Session,
        data: dict
    ):

        alert = TrafficAlertRepository.create(
            db,
            data
        )

        # =====================================================
        # AUDIT LOG
        # =====================================================

        AuditLogService.create(

            db=db,

            actor_id=None,

            actor_name="TrafficVisionAI",

            target_user_id=None,

            target_user_name=None,

            action="ALERT_CREATED",

            description=(
                f"Traffic alert created for "
                f"{alert.city}, {alert.state}. "
                f"Severity: {alert.predicted_severity}, "
                f"Risk Score: {alert.predicted_risk_score}."
            )
        )

        return alert


    @staticmethod
    def get_all(
        db: Session
    ):

        return TrafficAlertRepository.get_all(
            db
        )


    @staticmethod
    def get_active(
        db: Session
    ):

        return TrafficAlertRepository.get_active(
            db
        )


    @staticmethod
    def deactivate(
        db: Session,
        alert_id: int
    ):

        return TrafficAlertRepository.deactivate(
            db,
            alert_id
        )


    @staticmethod
    def delete(
        db: Session,
        alert_id: int,
        admin: User
    ):

        alert = TrafficAlertRepository.get_by_id(
            db,
            alert_id
        )

        if alert is None:
            return None


        # Save information before deleting
        city = alert.city
        state = alert.state
        severity = alert.predicted_severity


        deleted = TrafficAlertRepository.delete(
            db,
            alert_id
        )


        if deleted:

            AuditLogService.create(

                db=db,

                actor_id=admin.id,

                actor_name=admin.full_name,

                target_user_id=None,

                target_user_name=None,

                action="ALERT_DELETED",

                description=(
                    f"Deleted traffic alert for "
                    f"{city}, {state}. "
                    f"Severity: {severity}."
                )
            )


        return deleted