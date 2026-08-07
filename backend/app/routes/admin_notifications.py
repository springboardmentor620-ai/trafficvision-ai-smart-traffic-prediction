# from fastapi import APIRouter
# from pydantic import BaseModel
# from datetime import datetime
# from app.database import db

# router = APIRouter(
#     prefix="/admin/notifications",
#     tags=["Admin Notifications"]
# )

# notification_collection = db["notifications"]


# class Notification(BaseModel):
#     title: str
#     message: str
#     priority: str


# @router.post("/")
# async def create_notification(notification: Notification):

#     data = notification.model_dump()

#     data["created_at"] = datetime.now()

#     data["status"] = "Sent"

#     await notification_collection.insert_one(data)

#     return {
#         "success": True,
#         "message": "Notification Sent Successfully"
#     }


# @router.get("/")
# async def get_notifications():

#     notifications = []

#     async for item in notification_collection.find().sort(
#         "created_at",
#         -1
#     ):

#         item["_id"] = str(item["_id"])

#         notifications.append(item)

#     return {

#         "success": True,

#         "notifications": notifications

#     }


# @router.delete("/{notification_id}")
# async def delete_notification(notification_id: str):

#     from bson import ObjectId

#     await notification_collection.delete_one(

#         {

#             "_id": ObjectId(notification_id)

#         }

#     )

#     return {

#         "success": True

#     }

from fastapi import APIRouter
from datetime import datetime
from app.database import db

router = APIRouter(
    prefix="/admin/notifications",
    tags=["Admin Notifications"]
)

collection = db["notifications"]


@router.get("/")
async def get_notifications():

    notifications = []

    async for item in collection.find().sort("created_at", -1):

        item["_id"] = str(item["_id"])

        notifications.append(item)

    return notifications


@router.post("/")
async def create_notification(data: dict):

    data["created_at"] = datetime.now()

    await collection.insert_one(data)

    return {
        "success": True,
        "message": "Notification sent successfully"
    }