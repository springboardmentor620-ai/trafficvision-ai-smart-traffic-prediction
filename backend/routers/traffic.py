from fastapi import APIRouter, Query
from services.traffic_service import (
    get_all_traffic,
    get_statistics,
    search_traffic,
)

router = APIRouter(
    prefix="/traffic",
    tags=["Traffic"]
)

@router.get("/")
def read_all_traffic():
    return get_all_traffic()


@router.get("/statistics")
def statistics():
    return get_statistics()


@router.get("/search")
def search(
    weather: str = Query(default=""),
    condition: str = Query(default="")
):
    return search_traffic(weather, condition)