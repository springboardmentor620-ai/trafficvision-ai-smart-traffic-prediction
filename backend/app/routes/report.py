from fastapi import APIRouter
import pandas as pd
import os

router = APIRouter()

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))

csv_path = os.path.join(
    BASE_DIR,
    "data",
    "Banglore_traffic_Dataset.csv"
)

df = pd.read_csv(csv_path)


@router.get("/reports/{area}")
def area_report(area: str):

    area_df = df[df["Area Name"] == area]

    if area_df.empty:
        return {
            "message": "Area not found"
        }

    avg_speed = round(area_df["Average Speed"].mean(), 2)

    traffic_volume = round(area_df["Traffic Volume"].mean(), 2)

    travel_time = round(area_df["Travel Time Index"].mean(), 2)

    road_capacity = round(
        area_df["Road Capacity Utilization"].mean(),
        2
    )

    incidents = int(
        area_df["Incident Reports"].sum()
    )

    environment = round(
        area_df["Environmental Impact"].mean(),
        2
    )

    signal = round(
        area_df["Traffic Signal Compliance"].mean(),
        2
    )

    pedestrian = round(
        area_df["Pedestrian and Cyclist Count"].mean(),
        2
    )

    weather = area_df["Weather Conditions"].mode()[0]

    roadwork = area_df[
        "Roadwork and Construction Activity"
    ].mode()[0]

    roads = sorted(
        area_df["Road/Intersection Name"]
        .unique()
        .tolist()
    )

    peak_road = area_df[
        "Road/Intersection Name"
    ].mode()[0]

    # -----------------------
    # AI Summary
    # -----------------------

    if avg_speed >= 45:
        traffic_msg = "Traffic conditions are smooth."

    elif avg_speed >= 30:
        traffic_msg = "Traffic conditions are moderate."

    else:
        traffic_msg = "Heavy traffic congestion is observed."

    if travel_time <= 1.3:
        travel_msg = "Average travel time is low."

    elif travel_time <= 1.8:
        travel_msg = "Average travel time is moderate."

    else:
        travel_msg = "Travel time is significantly high."

    if roadwork.lower() == "no":
        roadwork_msg = "No roadwork is currently observed."

    else:
        roadwork_msg = "Roadwork may affect traffic movement."

    peak_msg = f"Peak traffic occurs on {peak_road}."

    return {

        "area": area,

        "average_speed": avg_speed,

        "traffic_volume": traffic_volume,

        "travel_time_index": travel_time,

        "road_capacity": road_capacity,

        "incident_reports": incidents,

        "environmental_impact": environment,

        "signal_compliance": signal,

        "pedestrian_count": pedestrian,

        "weather": weather,

        "roadwork": roadwork,

        "roads": roads,

        "summary": {

            "traffic": traffic_msg,

            "travel": travel_msg,

            "roadwork": roadwork_msg,

            "peak": peak_msg

        }

    }