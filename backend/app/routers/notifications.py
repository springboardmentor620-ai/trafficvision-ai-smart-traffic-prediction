from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.connection import get_db

from app.schemas.notification import (
    NotificationCreate,
    NotificationResponse,
)

from app.services.notification_service import NotificationService

router = APIRouter(
    prefix="/notifications",
    tags=["Notifications"],
)


@router.get("/", response_model=list[NotificationResponse])
def get_notifications(
    db: Session = Depends(get_db),
):
    return NotificationService.get_all(db)


@router.post("/", response_model=NotificationResponse)
def create_notification(
    notification: NotificationCreate,
    db: Session = Depends(get_db),
):
    return NotificationService.create(db, notification)


@router.put("/{notification_id}/read")
def mark_read(
    notification_id: int,
    db: Session = Depends(get_db),
):

    notification = NotificationService.mark_read(
        db,
        notification_id,
    )

    if not notification:

        raise HTTPException(
            status_code=404,
            detail="Notification not found",
        )

    return notification


@router.delete("/{notification_id}")
def delete_notification(
    notification_id: int,
    db: Session = Depends(get_db),
):

    deleted = NotificationService.delete(
        db,
        notification_id,
    )

    if not deleted:

        raise HTTPException(
            status_code=404,
            detail="Notification not found",
        )

    return {

        "message": "Notification deleted"

    }