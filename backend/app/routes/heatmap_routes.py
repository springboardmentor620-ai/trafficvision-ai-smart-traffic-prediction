from fastapi import APIRouter
from app.services.heatmap_service import get_heatmap_data

router = APIRouter(
    prefix="/heatmap",
    tags=["Heatmap"]
)

@router.get("/")
def heatmap():

    return {
        "success": True,
        "locations": get_heatmap_data()
    }