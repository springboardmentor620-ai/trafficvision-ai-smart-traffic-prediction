"""
TrafficVisionAI
Notifications Router

Features:

- Get notifications
- Create notifications
- Mark notification as read
- Mark all notifications as read
- Delete notification
- Automatically generate notifications from traffic_data
- Store exact latitude/longitude for traffic incidents
- Maintain traffic_data -> notifications relationship using traffic_id
- Prevent duplicate notifications for the same traffic record
- Preserve existing frontend API compatibility
- Return complete incident/location information for Map Monitoring

Email notifications are intentionally NOT included.
"""

from typing import Optional

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    Query,
)

from pydantic import BaseModel, Field

from sqlalchemy.orm import Session

from database import get_db

from models.notification import Notification
from models.traffic import Traffic
from models.user import User

from utils.auth import get_current_user


# ============================================================
# ROUTER
# ============================================================

router = APIRouter(
    prefix="/notifications",
    tags=["Notifications"],
)


# ============================================================
# HELPER
# ============================================================

def _notification_to_dict(
    notification: Notification,
) -> dict:
    """
    Convert SQLAlchemy Notification object
    into frontend-friendly JSON.

    The response contains all information required
    by the Notifications page and Map Monitoring page.
    """

    # --------------------------------------------------------
    # Latitude
    # --------------------------------------------------------

    latitude = (
        float(notification.latitude)
        if notification.latitude is not None
        else None
    )

    # --------------------------------------------------------
    # Longitude
    # --------------------------------------------------------

    longitude = (
        float(notification.longitude)
        if notification.longitude is not None
        else None
    )

    # --------------------------------------------------------
    # Timestamp
    # --------------------------------------------------------

    timestamp = (
        notification.timestamp.isoformat()
        if notification.timestamp
        else None
    )

    # --------------------------------------------------------
    # Response
    # --------------------------------------------------------

    return {
        # ====================================================
        # BASIC INFORMATION
        # ====================================================

        "id": notification.id,

        "traffic_id": notification.traffic_id,

        "title": notification.title,

        "description": notification.description,

        # Existing frontend compatibility
        "message": notification.description,

        # ====================================================
        # LOCATION
        # ====================================================

        "latitude": latitude,

        "longitude": longitude,

        # Existing frontend aliases
        "lat": latitude,

        "lon": longitude,

        # ====================================================
        # MAP INCIDENT INFORMATION
        # ====================================================

        "location": {
            "latitude": latitude,
            "longitude": longitude,
        },

        # ====================================================
        # ALERT TYPE
        # ====================================================

        "alert_type": notification.alert_type,

        # Existing frontend compatibility
        "type": notification.alert_type,

        # ====================================================
        # PRIORITY
        # ====================================================

        "priority": notification.priority,

        # ====================================================
        # STATUS
        # ====================================================

        "is_read": notification.is_read,

        # ====================================================
        # DATE / TIME
        # ====================================================

        "timestamp": timestamp,

        "created_at": timestamp,

        # ====================================================
        # MAP NAVIGATION DATA
        # ====================================================

        # Frontend can directly use these values when
        # navigating to Map Monitoring.
        "map_data": {
            "traffic_id": notification.traffic_id,
            "latitude": latitude,
            "longitude": longitude,
            "alert_type": notification.alert_type,
            "priority": notification.priority,
            "title": notification.title,
            "description": notification.description,
        },
    }


# ============================================================
# PYDANTIC SCHEMA
# ============================================================

class NotificationCreate(BaseModel):
    """
    Request body for creating a notification.
    """

    title: str = Field(
        ...,
        min_length=1,
        max_length=100,
    )

    description: str = Field(
        ...,
        min_length=1,
        max_length=255,
    )

    alert_type: str = Field(
        default="system",
        max_length=50,
    )

    priority: str = Field(
        default="medium",
        max_length=50,
    )

    # Optional traffic record
    traffic_id: Optional[int] = None

    # Optional geographic coordinates
    latitude: Optional[float] = None

    longitude: Optional[float] = None


# ============================================================
# VALIDATE COORDINATES
# ============================================================

def _validate_coordinates(
    latitude: Optional[float],
    longitude: Optional[float],
):
    """
    Validate geographic coordinates.

    Both coordinates must either be present together
    or both be absent.
    """

    # --------------------------------------------------------
    # Both absent is allowed
    # --------------------------------------------------------

    if latitude is None and longitude is None:
        return

    # --------------------------------------------------------
    # Only one supplied
    # --------------------------------------------------------

    if latitude is None or longitude is None:
        raise HTTPException(
            status_code=400,
            detail=(
                "Latitude and longitude must be "
                "provided together."
            ),
        )

    # --------------------------------------------------------
    # Latitude validation
    # --------------------------------------------------------

    if not -90 <= latitude <= 90:
        raise HTTPException(
            status_code=400,
            detail="Invalid latitude.",
        )

    # --------------------------------------------------------
    # Longitude validation
    # --------------------------------------------------------

    if not -180 <= longitude <= 180:
        raise HTTPException(
            status_code=400,
            detail="Invalid longitude.",
        )


# ============================================================
# NORMALIZE PRIORITY
# ============================================================

def _normalize_priority(
    value: Optional[str],
) -> str:
    """
    Normalize notification priority.
    """

    normalized = str(
        value or "medium"
    ).strip().lower()

    allowed = {
        "critical",
        "high",
        "medium",
        "low",
    }

    if normalized not in allowed:
        return "medium"

    return normalized


# ============================================================
# NORMALIZE ALERT TYPE
# ============================================================

def _normalize_alert_type(
    value: Optional[str],
) -> str:
    """
    Normalize notification alert type.
    """

    normalized = str(
        value or "system"
    ).strip().lower()

    allowed = {
        "congestion",
        "accident",
        "closure",
        "prediction",
        "system",
        "emergency",
        "route",
    }

    if normalized not in allowed:
        return "system"

    return normalized


# ============================================================
# GENERATE NOTIFICATIONS FROM TRAFFIC DATA
# ============================================================

def _generate_traffic_notifications(
    db: Session,
):
    """
    Generate notifications from traffic_data.

    Duplicate prevention is based on traffic_id.

    Accident has higher priority than congestion.

    Therefore if a traffic record contains:

        Accident = Yes
        Congestion = High

    the system creates an Accident notification
    with Critical priority instead of creating only
    a High Congestion notification.
    """

    # ========================================================
    # GET EXISTING TRAFFIC IDS
    # ========================================================

    existing_traffic_ids = {
        row[0]
        for row in (
            db.query(
                Notification.traffic_id
            )
            .filter(
                Notification.traffic_id.isnot(None)
            )
            .all()
        )
    }

    # ========================================================
    # GET RECENT TRAFFIC RECORDS
    # ========================================================

    traffic_records = (
        db.query(Traffic)
        .filter(
            Traffic.latitude.isnot(None),
            Traffic.longitude.isnot(None),
        )
        .order_by(
            Traffic.datetime.desc()
        )
        .limit(500)
        .all()
    )

    generated = []

    # ========================================================
    # PROCESS TRAFFIC RECORDS
    # ========================================================

    for record in traffic_records:

        # ----------------------------------------------------
        # Skip records already processed
        # ----------------------------------------------------

        if record.id in existing_traffic_ids:
            continue

        # ----------------------------------------------------
        # Location name
        # ----------------------------------------------------

        location_name = (
            record.road_name
            or "Unknown location"
        )

        # ----------------------------------------------------
        # Vehicle count
        # ----------------------------------------------------

        vehicle_count = (
            record.vehicle_count
            if record.vehicle_count is not None
            else 0
        )

        # ----------------------------------------------------
        # Normalize traffic values
        # ----------------------------------------------------

        congestion = str(
            record.congestion_level or ""
        ).strip().lower()

        accident = str(
            record.accident or ""
        ).strip().lower()

        # ====================================================
        # ACCIDENT
        # ====================================================

        if accident in {
            "yes",
            "true",
            "1",
            "y",
        }:

            road_status = (
                record.congestion_level
                or "Unknown"
            )

            notification = Notification(
                traffic_id=record.id,

                title="Accident Reported",

                description=(
                    f"Traffic accident reported "
                    f"at {location_name}. "
                    f"Congestion level: "
                    f"{road_status}."
                ),

                latitude=float(
                    record.latitude
                ),

                longitude=float(
                    record.longitude
                ),

                alert_type="accident",

                priority="critical",

                is_read=False,
            )

            db.add(notification)

            generated.append(notification)

            existing_traffic_ids.add(
                record.id
            )

            continue

        # ====================================================
        # HIGH CONGESTION
        # ====================================================

        if congestion == "high":

            notification = Notification(
                traffic_id=record.id,

                title="High Congestion Alert",

                description=(
                    f"Heavy traffic detected at "
                    f"{location_name} "
                    f"({vehicle_count} vehicles)."
                ),

                latitude=float(
                    record.latitude
                ),

                longitude=float(
                    record.longitude
                ),

                alert_type="congestion",

                priority="high",

                is_read=False,
            )

            db.add(notification)

            generated.append(notification)

            existing_traffic_ids.add(
                record.id
            )

            continue

    # ========================================================
    # SAVE GENERATED NOTIFICATIONS
    # ========================================================

    if generated:

        try:

            db.commit()

            # ------------------------------------------------
            # Refresh generated objects
            # ------------------------------------------------

            for notification in generated:
                db.refresh(notification)

        except Exception:

            db.rollback()

            raise

    return generated


# ============================================================
# GET /notifications/
# ============================================================

@router.get("/")
def get_notifications(
    skip: int = Query(
        default=0,
        ge=0,
    ),

    limit: int = Query(
        default=100,
        ge=1,
        le=500,
    ),

    unread_only: bool = False,

    db: Session = Depends(get_db),

    current_user: User = Depends(
        get_current_user
    ),
):
    """
    Return notifications.

    New traffic notifications are generated when
    required.

    The response includes latitude and longitude
    so the frontend can open the exact incident
    location in Map Monitoring.
    """

    # ========================================================
    # STEP 1
    # Generate notifications
    # ========================================================

    if not unread_only:

        _generate_traffic_notifications(
            db
        )

    # ========================================================
    # STEP 2
    # BUILD QUERY
    # ========================================================

    query = db.query(Notification)

    # --------------------------------------------------------
    # Unread filter
    # --------------------------------------------------------

    if unread_only:

        query = query.filter(
            Notification.is_read.is_(False)
        )

    # ========================================================
    # STEP 3
    # ORDER + PAGINATION
    # ========================================================

    notifications = (
        query
        .order_by(
            Notification.timestamp.desc()
        )
        .offset(skip)
        .limit(limit)
        .all()
    )

    # ========================================================
    # STEP 4
    # UNREAD COUNT
    # ========================================================

    unread_count = (
        db.query(Notification)
        .filter(
            Notification.is_read.is_(False)
        )
        .count()
    )

    # ========================================================
    # RESPONSE
    # ========================================================

    return {
        "status": "success",

        "unread_count": unread_count,

        "total_count": len(
            notifications
        ),

        "notifications": [
            _notification_to_dict(
                notification
            )
            for notification in notifications
        ],
    }


# ============================================================
# POST /notifications/
# ============================================================

@router.post("/")
def create_notification(
    data: NotificationCreate,

    db: Session = Depends(get_db),

    current_user: User = Depends(
        get_current_user
    ),
):
    """
    Create a notification manually.

    If traffic_id is supplied:

        1. Verify traffic record exists.
        2. Get coordinates from traffic_data.
        3. Store traffic_id.
        4. Ignore manually supplied coordinates.

    This guarantees that the notification points
    to the exact traffic record location.
    """

    # ========================================================
    # NORMALIZE VALUES
    # ========================================================

    alert_type = _normalize_alert_type(
        data.alert_type
    )

    priority = _normalize_priority(
        data.priority
    )

    # ========================================================
    # INITIAL COORDINATES
    # ========================================================

    latitude = data.latitude

    longitude = data.longitude

    # ========================================================
    # TRAFFIC ID PROVIDED
    # ========================================================

    if data.traffic_id is not None:

        traffic = (
            db.query(Traffic)
            .filter(
                Traffic.id == data.traffic_id
            )
            .first()
        )

        # ----------------------------------------------------
        # Traffic record not found
        # ----------------------------------------------------

        if not traffic:

            raise HTTPException(
                status_code=404,
                detail="Traffic record not found.",
            )

        # ----------------------------------------------------
        # Traffic record must contain coordinates
        # ----------------------------------------------------

        if (
            traffic.latitude is None
            or traffic.longitude is None
        ):

            raise HTTPException(
                status_code=400,
                detail=(
                    "The selected traffic record "
                    "does not contain latitude/longitude."
                ),
            )

        # ----------------------------------------------------
        # Always use exact traffic coordinates
        # ----------------------------------------------------

        latitude = float(
            traffic.latitude
        )

        longitude = float(
            traffic.longitude
        )

    # ========================================================
    # VALIDATE COORDINATES
    # ========================================================

    _validate_coordinates(
        latitude,
        longitude,
    )

    # ========================================================
    # CREATE NOTIFICATION
    # ========================================================

    notification = Notification(
        traffic_id=data.traffic_id,

        title=data.title.strip(),

        description=data.description.strip(),

        latitude=latitude,

        longitude=longitude,

        alert_type=alert_type,

        priority=priority,

        is_read=False,
    )

    # ========================================================
    # SAVE
    # ========================================================

    try:

        db.add(notification)

        db.commit()

        db.refresh(notification)

    except Exception:

        db.rollback()

        raise

    # ========================================================
    # RESPONSE
    # ========================================================

    return _notification_to_dict(
        notification
    )


# ============================================================
# PATCH /notifications/{notification_id}/read
# ============================================================

@router.patch(
    "/{notification_id}/read"
)
def mark_as_read(
    notification_id: int,

    db: Session = Depends(get_db),

    current_user: User = Depends(
        get_current_user
    ),
):
    """
    Mark one notification as read.
    """

    # ========================================================
    # FIND NOTIFICATION
    # ========================================================

    notification = (
        db.query(Notification)
        .filter(
            Notification.id == notification_id
        )
        .first()
    )

    # ========================================================
    # NOT FOUND
    # ========================================================

    if not notification:

        raise HTTPException(
            status_code=404,
            detail="Notification not found",
        )

    # ========================================================
    # MARK READ
    # ========================================================

    notification.is_read = True

    # ========================================================
    # SAVE
    # ========================================================

    try:

        db.commit()

        db.refresh(notification)

    except Exception:

        db.rollback()

        raise

    # ========================================================
    # RESPONSE
    # ========================================================

    return _notification_to_dict(
        notification
    )


# ============================================================
# POST /notifications/read-all
# ============================================================

@router.post(
    "/read-all"
)
def mark_all_as_read(
    db: Session = Depends(get_db),

    current_user: User = Depends(
        get_current_user
    ),
):
    """
    Mark all notifications as read.
    """

    # ========================================================
    # UPDATE
    # ========================================================

    try:

        updated_count = (
            db.query(Notification)
            .filter(
                Notification.is_read.is_(False)
            )
            .update(
                {
                    Notification.is_read: True
                },
                synchronize_session=False,
            )
        )

        db.commit()

    except Exception:

        db.rollback()

        raise

    # ========================================================
    # RESPONSE
    # ========================================================

    return {
        "status": "success",

        "message": (
            "All notifications marked as read"
        ),

        "updated_count": updated_count,
    }


# ============================================================
# DELETE /notifications/{notification_id}
# ============================================================

@router.delete(
    "/{notification_id}"
)
def delete_notification(
    notification_id: int,

    db: Session = Depends(get_db),

    current_user: User = Depends(
        get_current_user
    ),
):
    """
    Delete one notification.
    """

    # ========================================================
    # FIND NOTIFICATION
    # ========================================================

    notification = (
        db.query(Notification)
        .filter(
            Notification.id == notification_id
        )
        .first()
    )

    # ========================================================
    # NOT FOUND
    # ========================================================

    if not notification:

        raise HTTPException(
            status_code=404,
            detail="Notification not found",
        )

    # ========================================================
    # DELETE
    # ========================================================

    try:

        db.delete(notification)

        db.commit()

    except Exception:

        db.rollback()

        raise

    # ========================================================
    # RESPONSE
    # ========================================================

    return {
        "status": "success",

        "message": (
            "Notification deleted successfully"
        ),

        "id": notification_id,
    }
