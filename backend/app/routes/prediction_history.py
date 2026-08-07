from fastapi import APIRouter
from app.database import db

router = APIRouter(
    prefix="/prediction-history",
    tags=["Prediction History"]
)

prediction_collection = db["predictions"]


@router.get("/")
async def get_prediction_history():

    history = []

    async for item in prediction_collection.find().sort(
        "created_at",
        -1
    ):

        item["_id"] = str(item["_id"])

        history.append(item)

    return {
        "success": True,
        "count": len(history),
        "history": history
    }