from fastapi import APIRouter, HTTPException
from bson import ObjectId

from app.database import db


router = APIRouter(
    prefix="/admin/alerts",
    tags=["Admin Alerts"]
)


alerts_collection = db["alerts"]


# ---------------------------------------------------------
# GET ALL ALERTS
# ---------------------------------------------------------

@router.get("/")
async def get_admin_alerts():

    alerts = []

    cursor = alerts_collection.find().sort("_id", -1)

    async for alert in cursor:

        alert["_id"] = str(alert["_id"])

        alerts.append(alert)

    return alerts


# ---------------------------------------------------------
# UPDATE ALERT STATUS
# ---------------------------------------------------------

@router.put("/{alert_id}/status")
async def update_alert_status(
    alert_id: str,
    status: str
):

    if status not in ["Active", "Resolved"]:
        raise HTTPException(
            status_code=400,
            detail="Status must be Active or Resolved"
        )

    try:

        object_id = ObjectId(alert_id)

    except Exception:

        raise HTTPException(
            status_code=400,
            detail="Invalid alert ID"
        )

    result = await alerts_collection.update_one(
        {"_id": object_id},
        {
            "$set": {
                "status": status
            }
        }
    )

    if result.matched_count == 0:

        raise HTTPException(
            status_code=404,
            detail="Alert not found"
        )

    return {
        "success": True,
        "message": "Alert status updated successfully",
        "status": status
    }


# ---------------------------------------------------------
# DELETE ALERT
# ---------------------------------------------------------

@router.delete("/{alert_id}")
async def delete_alert(alert_id: str):

    try:

        object_id = ObjectId(alert_id)

    except Exception:

        raise HTTPException(
            status_code=400,
            detail="Invalid alert ID"
        )

    result = await alerts_collection.delete_one(
        {"_id": object_id}
    )

    if result.deleted_count == 0:

        raise HTTPException(
            status_code=404,
            detail="Alert not found"
        )

    return {
        "success": True,
        "message": "Alert deleted successfully"
    }