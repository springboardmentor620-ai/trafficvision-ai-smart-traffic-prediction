from pathlib import Path

import pandas as pd

from services.alert_service import get_alerts

BASE_DIR = Path(__file__).resolve().parent.parent.parent
DATASET_PATH = BASE_DIR / "dataset" / "processed_traffic_data.csv"


def get_report(period: str = "daily") -> dict:
    """Return a report snapshot; period is retained as report metadata."""
    data = pd.read_csv(DATASET_PATH) if DATASET_PATH.exists() else pd.DataFrame()
    if data.empty:
        return {"period": period, "summary": {}, "ai_summary": "No traffic data is available.", "alerts": []}
    condition = data["Traffic_Condition"].astype(str).str.lower()
    high_rate = float((condition == "high").mean() * 100)
    return {
        "period": period,
        "summary": {
            "traffic_records": int(len(data)),
            "average_speed": round(float(data["Traffic_Speed_kmh"].mean()), 1),
            "average_vehicle_count": round(float(data["Vehicle_Count"].mean()), 1),
            "congestion_percentage": round(high_rate, 1),
            "rush_hour_percentage": round(float((data["is_rush_hour"] == 1).mean() * 100), 1),
        },
        "ai_summary": "Traffic conditions require monitoring." if high_rate >= 50 else "Traffic conditions are broadly manageable.",
        "alerts": [alert.model_dump(mode="json") for alert in get_alerts()],
    }

