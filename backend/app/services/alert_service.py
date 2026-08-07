# from datetime import datetime
# from app.database import db

# alerts_collection = db["alerts"]


# async def save_alert(alert):

#     # Create a copy so MongoDB doesn't modify the original dict
#     alert_to_save = alert.copy()

#     alert_to_save["created_at"] = datetime.utcnow()

#     await alerts_collection.insert_one(alert_to_save)


# async def get_all_alerts():

#     alerts = []

#     async for alert in alerts_collection.find().sort(
#         "created_at",
#         -1
#     ):
#         alert["_id"] = str(alert["_id"])
#         alerts.append(alert)
#         alert["status"] = "Active"

#         alert["created_at"] = datetime.now()

#         alert["updated_at"] = datetime.now()
#     return alerts

from datetime import datetime
from app.database import db

alerts_collection = db["alerts"]


# -------------------------
# Save Alert
# -------------------------
async def save_alert(alert):

    alert_to_save = alert.copy()

    alert_to_save["status"] = "Active"

    alert_to_save["created_at"] = datetime.utcnow()

    alert_to_save["updated_at"] = datetime.utcnow()
    alert_to_save["resolved_at"] = None

    alert_to_save["resolved_by"] = None

    await alerts_collection.insert_one(alert_to_save)


# -------------------------
# Get All Alerts
# -------------------------
async def get_all_alerts():

    alerts = []

    cursor = alerts_collection.find().sort("_id", -1)

    async for alert in cursor:

        # Convert MongoDB ObjectId
        if "_id" in alert:
            alert["_id"] = str(alert["_id"])

        # Convert created_at safely
        if alert.get("created_at") is not None:
            alert["created_at"] = alert["created_at"].isoformat()
        else:
            alert["created_at"] = None

        # Convert resolved_at safely
        if alert.get("resolved_at") is not None:
            alert["resolved_at"] = alert["resolved_at"].isoformat()
        else:
            alert["resolved_at"] = None

        alerts.append(alert)

    return alerts
# -------------------------
# Resolve Alert
# -------------------------
async def resolve_alert(alert_id):

    from bson import ObjectId

    await alerts_collection.update_one(

        {"_id": ObjectId(alert_id)},

        {
            "$set": {
                "status": "Resolved",
                "updated_at": datetime.utcnow()
            }
        }

    )


# -------------------------
# Delete Alert
# -------------------------
async def delete_alert(alert_id):

    from bson import ObjectId

    await alerts_collection.delete_one(

        {"_id": ObjectId(alert_id)}

    )