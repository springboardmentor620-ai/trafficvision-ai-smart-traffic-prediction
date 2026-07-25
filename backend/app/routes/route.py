from fastapi import APIRouter
from pydantic import BaseModel
import requests
import os
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()

API_KEY = os.getenv("ORS_API_KEY")


class RouteRequest(BaseModel):
    coordinates: list


@router.post("/route")
def get_route(data: RouteRequest):

    url = "https://api.openrouteservice.org/v2/directions/driving-car/geojson"

    headers = {
        "Authorization": API_KEY,
        "Content-Type": "application/json"
    }

    body = {
        "coordinates": data.coordinates,

        "alternative_routes": {
            "target_count": 2,
            "weight_factor": 1.4,
            "share_factor": 0.6
        }
    }

    response = requests.post(
        url,
        headers=headers,
        json=body
    )

    if response.status_code != 200:
        return {
            "success": False,
            "message": "Unable to fetch route",
            "error": response.text
        }

    data = response.json()

    if "features" not in data or len(data["features"]) == 0:
        return {
            "success": False,
            "message": "No routes found"
        }

    features = data["features"]

    # -----------------------------
    # Recommended Route
    # -----------------------------
    best = features[0]

    best_summary = best["properties"]["summary"]

    recommended = {
        "distance": round(best_summary["distance"] / 1000, 2),
        "duration": round(best_summary["duration"] / 60),
        "geometry": best["geometry"]["coordinates"]
    }

    # -----------------------------
    # Alternate Route
    # -----------------------------
    alternate = None

    if len(features) > 1:

        alt = features[1]

        alt_summary = alt["properties"]["summary"]

        alternate = {
            "distance": round(alt_summary["distance"] / 1000, 2),
            "duration": round(alt_summary["duration"] / 60),
            "geometry": alt["geometry"]["coordinates"]
        }

    # -----------------------------
    # Traffic Level
    # -----------------------------
    def traffic_level(duration):

        if duration <= 25:
            return "Low"

        elif duration <= 40:
            return "Medium"

        return "Heavy"

    recommended["traffic"] = traffic_level(
        recommended["duration"]
    )

    if alternate:
        alternate["traffic"] = traffic_level(
            alternate["duration"]
        )

    # -----------------------------
    # Fuel Estimation
    # -----------------------------
    def fuel(distance):

        # Assume 12 km/l mileage
        return round(distance / 12, 2)

    recommended["fuel"] = fuel(
        recommended["distance"]
    )

    if alternate:
        alternate["fuel"] = fuel(
            alternate["distance"]
        )

    # -----------------------------
    # Savings
    # -----------------------------
    if alternate:

        time_saved = max(
            0,
            alternate["duration"] -
            recommended["duration"]
        )

        distance_saved = round(
            max(
                0,
                alternate["distance"] -
                recommended["distance"]
            ),
            2
        )

        fuel_saved = round(
            max(
                0,
                alternate["fuel"] -
                recommended["fuel"]
            ),
            2
        )

    else:

        time_saved = 0
        distance_saved = 0
        fuel_saved = 0

    return {
        "success": True,

        "recommended": recommended,

        "alternate": alternate,

        "comparison": {

            "time_saved": time_saved,

            "distance_saved": distance_saved,

            "fuel_saved": fuel_saved,

            "best_route": "Recommended Route"

        }

    }