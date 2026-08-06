from fastapi import APIRouter

from services.heatmap_service import get_heatmap_data

router = APIRouter(prefix="/heatmap", tags=["Traffic Heatmap"])


@router.get("")
def read_heatmap() -> dict:
    """Return traffic-density locations and geographic-data availability."""
    return get_heatmap_data()

