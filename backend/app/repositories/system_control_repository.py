from sqlalchemy.orm import Session

from app.models.system_control import SystemControl


class SystemControlRepository:

    @staticmethod
    def get(db: Session):

        return (
            db.query(SystemControl)
            .first()
        )


    @staticmethod
    def create_default(db: Session):

        controls = SystemControl(

            prediction_enabled=True,

            alerts_enabled=True,

            ai_processing_enabled=True,

            maintenance_mode=False

        )

        db.add(controls)

        db.commit()

        db.refresh(controls)

        return controls


    @staticmethod
    def update(
        db: Session,
        controls: SystemControl
    ):

        db.commit()

        db.refresh(controls)

        return controls