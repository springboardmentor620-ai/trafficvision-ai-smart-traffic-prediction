from fastapi import APIRouter
from app.database import db
import pandas as pd
import os

router = APIRouter(
    prefix="/admin",
    tags=["Admin"]
)

# -----------------------------
# Load Dataset
# -----------------------------

BASE_DIR = os.path.dirname(
    os.path.dirname(
        os.path.dirname(__file__)
    )
)

csv_path = os.path.join(
    BASE_DIR,
    "data",
    "Banglore_traffic_Dataset.csv"
)

df = pd.read_csv(csv_path)


# -----------------------------
# Dashboard API
# -----------------------------
@router.get("/dashboard")
async def admin_dashboard():

    alerts = db["alerts"]

    # Dashboard Cards
    total_predictions = await alerts.count_documents({})

    active_alerts = await alerts.count_documents({
        "status": "Active"
    })

    resolved_alerts = await alerts.count_documents({
        "status": "Resolved"
    })

    routes_generated = total_predictions

    # Recent Alerts
    latest_alerts = (
        await alerts.find()
        .sort("created_at", -1)
        .limit(5)
        .to_list(length=5)
    )

    recent = []

    for item in latest_alerts:

        recent.append({

            "source": item.get("source", "-"),

            "destination": item.get("destination", "-"),

            "severity": item.get("severity", "-"),

            "predicted_congestion":
                item.get("predicted_congestion", 0),

            "status":
                item.get("status", "Active"),

            "alert_time":
                item.get("alert_time", "")

        })

    # Traffic Summary
    average_congestion = round(
        df["Congestion Level"].mean(),
        2
    )

    average_speed = round(
        df["Average Speed"].mean(),
        2
    )

    traffic_volume = int(
        df["Traffic Volume"].mean()
    )

    weather = (
        df["Weather Conditions"]
        .mode()[0]
    )

    # Peak Hour (change column name if needed)
    if "Time" in df.columns:
        peak_hour = df["Time"].mode()[0]
    else:
        peak_hour = "N/A"

    return {

        "cards": {

            "total_predictions":
                total_predictions,

            "active_alerts":
                active_alerts,

            "resolved_alerts":
                resolved_alerts,

            "routes_generated":
                routes_generated

        },

        "traffic_summary": {

            "average_congestion":
                average_congestion,

            "average_speed":
                average_speed,

            "traffic_volume":
                traffic_volume,

            "weather":
                weather,

            "peak_hour":
                peak_hour

        },

        "volume_by_area": (

            df.groupby("Area Name")["Traffic Volume"]

            .mean()

            .round(2)

            .to_dict()

        ),

        "speed_by_area": (

            df.groupby("Area Name")["Average Speed"]

            .mean()

            .round(2)

            .to_dict()

        ),

        "weekly_trend": (

            print(df.columns.tolist())

        ),

        "distribution": (

            df["Congestion Level"]

            .value_counts()

            .to_dict()

        ),

        "recent_alerts": recent

    }