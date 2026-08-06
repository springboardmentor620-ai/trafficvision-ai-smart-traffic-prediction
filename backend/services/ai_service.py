from pathlib import Path

import pandas as pd
from services.weather_service import weather_label


BASE_DIR = Path(__file__).resolve().parent.parent.parent
DATASET_PATH = BASE_DIR / "dataset" / "processed_traffic_data.csv"
REQUIRED_COLUMNS = {
    "Vehicle_Count", "Traffic_Speed_kmh", "Road_Occupancy_%", "Weather_Condition",
    "Accident_Report", "Traffic_Condition", "hour", "is_rush_hour",
}


def _round(value: float) -> float:
    """Return a JSON-safe metric rounded consistently for the client."""
    return round(float(value), 1)


def _risk_level(score: float) -> str:
    """Convert the combined rule-based risk score into a readable status."""
    if score >= 70:
        return "High"
    if score >= 40:
        return "Moderate"
    return "Low"


def _best_departure_hour(data: pd.DataFrame) -> tuple[int, float]:
    """Choose the hour with the lowest combined volume and rush-hour pressure."""
    hourly = data.groupby("hour").agg(
        average_volume=("Vehicle_Count", "mean"),
        rush_hour_rate=("is_rush_hour", "mean"),
    )
    volume_range = hourly["average_volume"].max() - hourly["average_volume"].min()
    volume_component = (
        (hourly["average_volume"] - hourly["average_volume"].min()) / volume_range
        if volume_range else 0
    )
    hourly["departure_score"] = volume_component * 0.7 + hourly["rush_hour_rate"] * 0.3
    best_hour = int(hourly["departure_score"].idxmin())
    return best_hour, _round(hourly.loc[best_hour, "departure_score"] * 100)


def get_recommendations() -> dict:
    """Create explainable recommendations using deterministic dataset rules only."""
    if not DATASET_PATH.exists():
        return {"engine": "rule-based", "recommendations": []}

    data = pd.read_csv(DATASET_PATH)
    if data.empty or not REQUIRED_COLUMNS.issubset(data.columns):
        return {"engine": "rule-based", "recommendations": []}

    numeric_columns = REQUIRED_COLUMNS - {"Traffic_Condition", "Weather_Condition"}
    for column in numeric_columns:
        data[column] = pd.to_numeric(data[column], errors="coerce")
    data = data.dropna(subset=numeric_columns | {"Traffic_Condition", "Weather_Condition"})
    if data.empty:
        return {"engine": "rule-based", "recommendations": []}

    conditions = data["Traffic_Condition"].astype(str).str.lower()
    high_congestion = _round((conditions == "high").mean() * 100)
    average_speed = _round(data["Traffic_Speed_kmh"].mean())
    reference_speed = data["Traffic_Speed_kmh"].quantile(0.75)
    delay_percentage = _round(max(0, (1 - average_speed / reference_speed) * 100)) if reference_speed else 0
    accident_rate = _round((data["Accident_Report"] == 1).mean() * 100)
    weather_codes = pd.to_numeric(data["Weather_Condition"], errors="coerce")
    non_default_weather_rate = _round((weather_codes != 0).mean() * 100)
    high_occupancy_rate = _round((data["Road_Occupancy_%"] >= data["Road_Occupancy_%"].quantile(0.75)).mean() * 100)
    risk_score = _round((high_congestion + accident_rate + non_default_weather_rate + high_occupancy_rate) / 4)
    best_hour, departure_score = _best_departure_hour(data)
    dominant_weather_code = str(data["Weather_Condition"].astype(str).mode().iloc[0])
    congestion_label = "High" if high_congestion >= 50 else "Moderate" if high_congestion >= 25 else "Low"

    return {
        "engine": "rule-based",
        "methodology": "Deterministic recommendations based on current dataset averages, rates, quartiles, and hourly patterns. No machine-learning model is used.",
        "recommendations": [
            {
                "id": "traffic-prediction",
                "title": "Traffic Prediction",
                "value": f"{congestion_label} congestion likely",
                "metric": f"{high_congestion}% high-traffic records",
                "recommendation": "Allow extra time when high-congestion conditions are prevalent.",
                "priority": congestion_label,
            },
            {
                "id": "delay-prediction",
                "title": "Delay Prediction",
                "value": f"{delay_percentage}% potential delay",
                "metric": f"Average speed: {average_speed} km/h",
                "recommendation": "Plan for a delay relative to the dataset's upper-quartile traffic speed.",
                "priority": _risk_level(delay_percentage),
            },
            {
                "id": "best-departure-time",
                "title": "Best Departure Time",
                "value": f"{best_hour:02d}:00",
                "metric": f"Lowest combined travel-pressure score: {departure_score}%",
                "recommendation": "Depart during this lower-volume, lower-rush-hour period when possible.",
                "priority": "Low",
            },
            {
                "id": "suggested-route",
                "title": "Suggested Route",
                "value": "Prefer a lower-density alternative",
                "metric": "Route-specific data is not available in the processed dataset",
                "recommendation": "Provide origin, destination, and road geometry to generate a route-specific recommendation.",
                "priority": "Moderate",
            },
            {
                "id": "risk-score",
                "title": "Risk Score",
                "value": f"{risk_score}/100 · {_risk_level(risk_score)}",
                "metric": f"Congestion {high_congestion}% · accidents {accident_rate}% · high occupancy {high_occupancy_rate}%",
                "recommendation": "Use additional caution when the combined traffic risk score is elevated.",
                "priority": _risk_level(risk_score),
            },
            {
                "id": "weather-recommendation",
                "title": "Weather Recommendation",
                "value": weather_label(dominant_weather_code),
                "metric": f"{non_default_weather_rate}% of records include adverse weather",
                "recommendation": "Check local conditions before departure and adjust speed for reduced visibility or traction.",
                "priority": "Moderate" if non_default_weather_rate >= 50 else "Low",
            },
            {
                "id": "travel-advice",
                "title": "Travel Advice",
                "value": "Travel with a time buffer",
                "metric": f"Rush hour appears in {_round((data['is_rush_hour'] == 1).mean() * 100)}% of records",
                "recommendation": "Avoid rush-hour windows when flexible, monitor alerts, and select lower-density alternatives.",
                "priority": "Moderate",
            },
        ],
    }
