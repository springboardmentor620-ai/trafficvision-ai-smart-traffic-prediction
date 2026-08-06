from pathlib import Path

import pandas as pd
from services.weather_service import weather_label


BASE_DIR = Path(__file__).resolve().parent.parent.parent
DATASET_PATH = BASE_DIR / "dataset" / "processed_traffic_data.csv"

REQUIRED_COLUMNS = {
    "Vehicle_Count", "Traffic_Speed_kmh", "Traffic_Condition", "Weather_Condition",
    "hour", "is_rush_hour", "is_weekend", "Accident_Report",
}


def _rounded(value: float, digits: int = 1) -> float:
    """Return JSON-friendly, consistently rounded numeric values."""
    return round(float(value), digits)


def _records_by_value(data: pd.DataFrame, column: str, label_prefix: str = "") -> list[dict]:
    """Create chart records for categorical dataset columns."""
    counts = data[column].value_counts(dropna=False).sort_index()
    return [
        {"label": f"{label_prefix}{value}", "value": int(count)}
        for value, count in counts.items()
    ]


def _hourly_metrics(data: pd.DataFrame) -> list[dict]:
    """Aggregate average speed and volume by the dataset hour field."""
    grouped = data.groupby("hour", sort=True).agg(
        average_speed=("Traffic_Speed_kmh", "mean"),
        average_vehicle_count=("Vehicle_Count", "mean"),
        rush_hour_rate=("is_rush_hour", "mean"),
    )
    return [
        {
            "hour": f"{int(hour):02d}:00",
            "average_speed": _rounded(row.average_speed),
            "average_vehicle_count": _rounded(row.average_vehicle_count),
            "rush_hour_percentage": _rounded(row.rush_hour_rate * 100),
        }
        for hour, row in grouped.iterrows()
    ]


def get_analytics() -> dict:
    """Build reusable dashboard metrics and visualisation series from processed data."""
    if not DATASET_PATH.exists():
        return {"metrics": {}, "charts": {}}

    data = pd.read_csv(DATASET_PATH)
    if data.empty or not REQUIRED_COLUMNS.issubset(data.columns):
        return {"metrics": {}, "charts": {}}

    numeric_columns = REQUIRED_COLUMNS - {"Traffic_Condition", "Weather_Condition"}
    for column in numeric_columns:
        data[column] = pd.to_numeric(data[column], errors="coerce")
    data = data.dropna(subset=numeric_columns | {"Traffic_Condition", "Weather_Condition"})
    if data.empty:
        return {"metrics": {}, "charts": {}}

    condition = data["Traffic_Condition"].astype(str).str.lower()
    high_congestion_percentage = _rounded((condition == "high").mean() * 100)
    traffic_health_score = _rounded(100 - high_congestion_percentage)
    health_status = (
        "Healthy" if traffic_health_score >= 70
        else "Moderate" if traffic_health_score >= 40
        else "Strained"
    )
    weather_counts = data["Weather_Condition"].astype(str).value_counts()
    dominant_weather_code = str(weather_counts.index[0])
    weekend_data = data.loc[data["is_weekend"] == 1]

    return {
        "metrics": {
            "total_records": int(len(data)),
            "average_speed": _rounded(data["Traffic_Speed_kmh"].mean()),
            "average_vehicle_count": _rounded(data["Vehicle_Count"].mean()),
            "traffic_health": {"score": traffic_health_score, "status": health_status},
            "congestion_percentage": high_congestion_percentage,
            "weather": {
                "label": weather_label(dominant_weather_code),
                "percentage": _rounded(weather_counts.iloc[0] / len(data) * 100),
            },
            "rush_hour_percentage": _rounded((data["is_rush_hour"] == 1).mean() * 100),
            "weekend_traffic": {
                "average_vehicle_count": _rounded(weekend_data["Vehicle_Count"].mean()) if not weekend_data.empty else 0,
                "record_count": int(len(weekend_data)),
            },
        },
        "charts": {
            "traffic_trend": _hourly_metrics(data),
            "vehicle_count": [
                {"hour": item["hour"], "average_vehicle_count": item["average_vehicle_count"]}
                for item in _hourly_metrics(data)
            ],
            "weather_distribution": [{"label": weather_label(value), "value": int(count)} for value, count in weather_counts.items()],
            "congestion_distribution": _records_by_value(data.assign(Traffic_Condition=condition), "Traffic_Condition"),
            "peak_hour_analysis": [
                {"hour": item["hour"], "rush_hour_percentage": item["rush_hour_percentage"]}
                for item in _hourly_metrics(data)
            ],
            "accident_analysis": _records_by_value(
                data.assign(Accident_Report=data["Accident_Report"].map({0: "No accident", 1: "Accident reported"})),
                "Accident_Report",
            ),
        },
    }
