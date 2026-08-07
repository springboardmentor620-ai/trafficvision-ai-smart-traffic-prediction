# from fastapi import APIRouter, HTTPException
# from bson import ObjectId
# from datetime import datetime
# from app.database import db
# from app.services.alert_service import get_all_alerts

# router = APIRouter(
#     prefix="/alerts",
#     tags=["Traffic Alerts"]
# )

# alerts_collection = db["alerts"]


# @router.get("/")
# async def fetch_alerts():

#     alerts = await get_all_alerts()

#     return {
#         "success": True,
#         "count": len(alerts),
#         "alerts": alerts
#     }


# @router.delete("/{alert_id}")
# async def delete_alert(alert_id: str):

#     result = await alerts_collection.delete_one(
#         {"_id": ObjectId(alert_id)}
#     )

#     if result.deleted_count == 0:
#         raise HTTPException(
#             status_code=404,
#             detail="Alert not found."
#         )

#     return {
#         "success": True,
#         "message": "Alert deleted successfully."
#     }


# @router.delete("/")
# async def clear_all_alerts():

#     result = await alerts_collection.delete_many({})

#     return {
#         "success": True,
#         "message": f"{result.deleted_count} alerts deleted."
#     }

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from bson import ObjectId
from datetime import datetime

from app.database import db
from app.services.alert_service import get_all_alerts

router = APIRouter(
    prefix="/alerts",
    tags=["Traffic Alerts"]
)

alerts_collection = db["alerts"]


# -----------------------------
# Request Model for Edit Alert
# -----------------------------

from typing import Optional

class AlertUpdate(BaseModel):
    severity: Optional[str] = None
    delay: Optional[str] = None
    weather: Optional[str] = None
    recommendations: Optional[list[str]] = None


# -----------------------------
# Get All Alerts
# -----------------------------

@router.get("/")
async def fetch_alerts():

    alerts = await get_all_alerts()

    return {
        "success": True,
        "count": len(alerts),
        "alerts": alerts
    }


# -----------------------------
# Resolve Alert
# -----------------------------

@router.put("/{alert_id}/resolve")
async def resolve_alert(alert_id: str):

    result = await alerts_collection.update_one(

        {
            "_id": ObjectId(alert_id)
        },

        {
            "$set": {
                "status": "Resolved",
                "resolved_by":"Admin",
                "resolved_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            }
        }

    )

    if result.matched_count == 0:

        raise HTTPException(
            status_code=404,
            detail="Alert not found."
        )

    return {
        "success": True,
        "message": "Alert resolved successfully."
    }


# -----------------------------
# Edit Alert
# -----------------------------

from typing import Optional

# -----------------------------
# Request Model for Edit Alert
# -----------------------------

class AlertUpdate(BaseModel):
    severity: Optional[str] = None
    delay: Optional[str] = None
    weather: Optional[str] = None
    recommendations: Optional[list[str]] = None


# -----------------------------
# Edit Alert
# -----------------------------

@router.put("/{alert_id}")
async def update_alert(
    alert_id: str,
    alert: AlertUpdate
):

    update_data = {
        key: value
        for key, value in alert.model_dump().items()
        if value is not None
    }

    update_data["updated_at"] = datetime.now()

    result = await alerts_collection.update_one(

        {
            "_id": ObjectId(alert_id)
        },

        {
            "$set": update_data
        }

    )

    if result.matched_count == 0:

        raise HTTPException(
            status_code=404,
            detail="Alert not found."
        )

    return {

        "success": True,

        "message": "Alert updated successfully."

    }


# -----------------------------
# Delete Single Alert
# -----------------------------

@router.delete("/{alert_id}")
async def delete_alert(alert_id: str):

    result = await alerts_collection.delete_one(

        {
            "_id": ObjectId(alert_id)
        }

    )

    if result.deleted_count == 0:

        raise HTTPException(
            status_code=404,
            detail="Alert not found."
        )

    return {

        "success": True,

        "message": "Alert deleted successfully."

    }


# -----------------------------
# Delete All Alerts
# -----------------------------

@router.delete("/")
async def clear_all_alerts():

    result = await alerts_collection.delete_many({})

    return {

        "success": True,

        "message": f"{result.deleted_count} alerts deleted."

    }