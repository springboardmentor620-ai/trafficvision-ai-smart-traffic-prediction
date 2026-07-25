from fastapi import APIRouter
import pandas as pd
import os

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
csv_path = os.path.join(BASE_DIR, "data", "Banglore_traffic_Dataset.csv")

df = pd.read_csv(csv_path)

@router.get("/")
def dashboard():

    # Traffic Volume by Area
    volume = (
        df.groupby("Area Name")["Traffic Volume"]
        .mean()
        .round(2)
        .to_dict()
    )

    # Average Speed by Area
    speed = (
        df.groupby("Area Name")["Average Speed"]
        .mean()
        .round(2)
        .to_dict()
    )

    # Weekly Congestion Trend
    weekly = (
        df.groupby("Day of the Week")["Congestion Level"]
        .mean()
        .round(2)
        .to_dict()
    )

    # Traffic Distribution
    distribution = (
        df["Congestion Level"]
        .value_counts()
        .to_dict()
    )

    return {
        "traffic_volume": volume,
        "average_speed": speed,
        "weekly_trend": weekly,
        "traffic_distribution": distribution,
    }