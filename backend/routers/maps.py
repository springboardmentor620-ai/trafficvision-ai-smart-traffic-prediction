from fastapi import APIRouter
import requests

router = APIRouter()


@router.get("/route")
def get_route(source_lat: float,
              source_lon: float,
              dest_lat: float,
              dest_lon: float):

    url = (
        f"https://router.project-osrm.org/route/v1/driving/"
        f"{source_lon},{source_lat};{dest_lon},{dest_lat}"
        f"?overview=false"
    )

    response = requests.get(url)

    if response.status_code != 200:
        return {"error": "Unable to fetch route"}

    data = response.json()

    if data["code"] != "Ok":
        return {"error": "No route found"}

    route = data["routes"][0]

    distance = round(route["distance"] / 1000, 2)
    duration = round(route["duration"] / 60, 2)

    return {
        "Distance (km)": distance,
        "Estimated Time (minutes)": duration,
        "Status": "Route Found"
    }
