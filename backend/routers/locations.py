from fastapi import APIRouter

from services.dataset_location_service import cities, countries, roads, states

router = APIRouter(prefix="/locations", tags=["Dataset Locations"])

@router.get("/countries")
def get_countries(): return countries()

@router.get("/states/{country}")
def get_states(country: str): return states(country)

@router.get("/cities/{state}")
def get_cities(state: str): return cities(state)

@router.get("/roads/{city}")
def get_roads(city: str): return roads(city)
