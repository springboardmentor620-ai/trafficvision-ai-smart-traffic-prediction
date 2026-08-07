from fastapi import APIRouter
from app.database import db

router = APIRouter(
    prefix="/admin/predictions",
    tags=["Admin Predictions"]
)

prediction_collection = db["predictions"]


@router.get("/")
async def get_predictions():

    predictions = []

    async for item in prediction_collection.find().sort("created_at", -1):

        item["_id"] = str(item["_id"])

        predictions.append(item)

    return {
        "success": True,
        "count": len(predictions),
        "predictions": predictions
    }