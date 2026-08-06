"""
Notifications Router — Full CRUD + dynamic generation from traffic data.
Stores notifications in the notifications MySQL table.
"""
from datetime import datetime
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session

from database import get_db
from models.notification import Notification
from models.traffic import Traffic

router = APIRouter(
    prefix="/notifications",
    tags=["Notifications"]
)


def _notification_to_dict(n: Notification) -> dict:
    return {
        "id": n.id,
        "title": n.title,
        "description": n.description,
        "message": n.description,
        "alert_type": n.alert_type,
        "type": n.alert_type,
        "priority": n.priority,
        "is_read": n.is_read,
        "timestamp": n.timestamp.isoformat() if n.timestamp else None,
        "created_at": n.timestamp.isoformat() if n.timestamp else None,
    }


class NotificationCreate(BaseModel):
    title: str
    description: str
    alert_type: str = "system"  # congestion, accident, closure, prediction, system
    priority: str = "medium"    # low, medium, high, critical


# ─────────────────────────────────────────────────────────────────────────────
# GET /notifications/
# ─────────────────────────────────────────────────────────────────────────────
@router.get("/")
def get_notifications(
    skip: int = 0,
    limit: int = 100,
    unread_only: bool = False,
    db: Session = Depends(get_db)
):
    query = db.query(Notification)
    if unread_only:
        query = query.filter(Notification.is_read == False)
    
    notifications = query.order_by(Notification.timestamp.desc()).offset(skip).limit(limit).all()

    # Auto-seed from live Traffic records if DB table is empty
    if not notifications and not unread_only:
        records = db.query(Traffic).all()
        seeded = []
        for r in records:
            if r.congestion_level and r.congestion_level.lower() == "high":
                n = Notification(
                    title="High Congestion Alert",
                    description=f"Heavy traffic detected at {r.location} ({r.vehicle_count} vehicles).",
                    alert_type="congestion",
                    priority="high",
                    is_read=False,
                )
                db.add(n)
                seeded.append(n)
            if r.accident_status and r.accident_status.lower() in ("yes", "1", "true"):
                n = Notification(
                    title="Accident Reported",
                    description=f"Traffic accident reported at {r.location}. Road: {r.road_status}.",
                    alert_type="accident",
                    priority="critical",
                    is_read=False,
                )
                db.add(n)
                seeded.append(n)
        if seeded:
            db.commit()
            notifications = db.query(Notification).order_by(Notification.timestamp.desc()).limit(limit).all()

    unread_count = db.query(Notification).filter(Notification.is_read == False).count()

    return {
        "unread_count": unread_count,
        "total_count": len(notifications),
        "notifications": [_notification_to_dict(n) for n in notifications]
    }


# ─────────────────────────────────────────────────────────────────────────────
# POST /notifications/
# ─────────────────────────────────────────────────────────────────────────────
@router.post("/")
def create_notification(data: NotificationCreate, db: Session = Depends(get_db)):
    n = Notification(
        title=data.title,
        description=data.description,
        alert_type=data.alert_type,
        priority=data.priority,
        is_read=False,
    )
    db.add(n)
    db.commit()
    db.refresh(n)
    return _notification_to_dict(n)


# ─────────────────────────────────────────────────────────────────────────────
# PATCH /notifications/{id}/read
# ─────────────────────────────────────────────────────────────────────────────
@router.patch("/{notification_id}/read")
def mark_as_read(notification_id: int, db: Session = Depends(get_db)):
    n = db.query(Notification).filter(Notification.id == notification_id).first()
    if not n:
        raise HTTPException(status_code=404, detail="Notification not found")
    n.is_read = True
    db.commit()
    db.refresh(n)
    return _notification_to_dict(n)


# ─────────────────────────────────────────────────────────────────────────────
# POST /notifications/read-all
# ─────────────────────────────────────────────────────────────────────────────
@router.post("/read-all")
def mark_all_as_read(db: Session = Depends(get_db)):
    db.query(Notification).filter(Notification.is_read == False).update({"is_read": True})
    db.commit()
    return {"message": "All notifications marked as read"}


# ─────────────────────────────────────────────────────────────────────────────
# DELETE /notifications/{id}
# ─────────────────────────────────────────────────────────────────────────────
@router.delete("/{notification_id}")
def delete_notification(notification_id: int, db: Session = Depends(get_db)):
    n = db.query(Notification).filter(Notification.id == notification_id).first()
    if not n:
        raise HTTPException(status_code=404, detail="Notification not found")
    db.delete(n)
    db.commit()
    return {"message": "Notification deleted successfully"}