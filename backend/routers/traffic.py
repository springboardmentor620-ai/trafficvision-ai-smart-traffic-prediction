from fastapi import APIRouter, Query

from services.traffic_service import (
    get_all_traffic,
    get_statistics,
    search_traffic,
    get_all_areas,
    get_roads_by_area,
)

router = APIRouter(
    prefix="/traffic",
    tags=["Traffic"]
)


# -----------------------------
# Get All Traffic Records
# -----------------------------
@router.get("/")
def read_all_traffic():
    return get_all_traffic()


# -----------------------------
# Dashboard Statistics
# -----------------------------
@router.get("/statistics")
def statistics():
    return get_statistics()


# -----------------------------
# Search Traffic
# -----------------------------
@router.get("/search")
def search(
    weather: str = Query(default=""),
    condition: str = Query(default="")
):
    return search_traffic(weather, condition)


# -----------------------------
# Get All Areas
# -----------------------------
@router.get("/areas")
def areas():
    return get_all_areas()


# -----------------------------
# Get Roads by Area
# Example:
# /traffic/roads?area=Koramangala
# -----------------------------
@router.get("/roads")
def roads(
    area: str = Query(...)
):
    return get_roads_by_area(area)