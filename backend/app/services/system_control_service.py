from sqlalchemy.orm import Session

from app.models.user import User

from app.repositories.system_control_repository import (
    SystemControlRepository
)

from app.services.audit_log_service import (
    AuditLogService
)


class SystemControlService:

    @staticmethod
    def get_controls(
        db: Session
    ):

        controls = (
            SystemControlRepository.get(db)
        )

        if controls is None:

            controls = (
                SystemControlRepository
                .create_default(db)
            )

        return controls


    @staticmethod
    def update_controls(
        db: Session,
        updates: dict,
        admin: User
    ):

        controls = (
            SystemControlService
            .get_controls(db)
        )


        # =====================================================
        # ALLOWED SYSTEM CONTROLS
        # =====================================================

        allowed_fields = {

            "prediction_enabled",

            "alerts_enabled",

            "ai_processing_enabled",

            "maintenance_mode"

        }


        # =====================================================
        # STORE OLD VALUES
        # =====================================================

        changes = []


        for field, value in updates.items():

            if (
                field not in allowed_fields
                or value is None
            ):
                continue


            old_value = getattr(
                controls,
                field
            )


            # Only record an actual change
            if old_value != value:

                changes.append(
                    (
                        field,
                        old_value,
                        value
                    )
                )


                setattr(
                    controls,
                    field,
                    value
                )


        # =====================================================
        # SAVE
        # =====================================================

        controls = (
            SystemControlRepository
            .update(
                db,
                controls
            )
        )


        # =====================================================
        # AUDIT LOG
        # =====================================================

        for (
            field,
            old_value,
            new_value
        ) in changes:

            AuditLogService.create(

                db=db,

                actor_id=admin.id,

                actor_name=admin.full_name,

                target_user_id=None,

                target_user_name=None,

                action="SYSTEM_CONTROL_CHANGED",

                description=(
                    f"Changed system control "
                    f"'{field}' from "
                    f"{old_value} to "
                    f"{new_value}."
                )

            )


        return controls