from fastapi import APIRouter
import pandas as pd

router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"]
)

@router.get("/stats")
def dashboard_stats():

    df = pd.read_csv("dataset/traffic.csv")

    return {
        "total_records": len(df),
        "junctions": df["Junction"].nunique(),
        "average_vehicles": round(df["Vehicles"].mean(),2),
        "maximum_vehicles": int(df["Vehicles"].max())
    }