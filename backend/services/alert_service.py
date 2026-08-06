from datetime import datetime, timezone
from pathlib import Path

import pandas as pd

from models.alert import Alert
from services.weather_service import weather_label


BASE_DIR = Path(__file__).resolve().parent.parent.parent
DATASET_PATH = BASE_DIR / "dataset" / "processed_traffic_data.csv"


def _as_number(row: pd.Series, column: str) -> float:
    """Safely read a numeric dataset value used in an alert condition."""
    return float(pd.to_numeric(row[column], errors="coerce"))


def _find_highest_risk_row(
    data: pd.DataFrame, condition: pd.Series, score_column: str
) -> pd.Series | None:
    """Return the strongest matching record, keeping the response concise."""
    matches = data.loc[condition].copy()
    if matches.empty:
        return None

    return matches.sort_values(score_column, ascending=False).iloc[0]


def _build_alert(
    alert_type: str,
    severity: str,
    reason: str,
    recommendation: str,
    timestamp: datetime,
) -> Alert:
    return Alert(
        id=alert_type.lower().replace(" ", "-"),
        alert_type=alert_type,
        severity=severity,
        reason=reason,
        recommendation=recommendation,
        status="Active",
        timestamp=timestamp,
    )


def get_alerts() -> list[Alert]:
    """Generate one actionable alert per supported condition from processed data.

    The processed dataset contains encoded weather values and no location or event
    timestamp. Alerts therefore preserve numeric weather codes and use the API
    generation time as their timestamp instead of fabricating unavailable details.
    """
    if not DATASET_PATH.exists():
        return []

    data = pd.read_csv(DATASET_PATH)
    if data.empty:
        return []

    required_columns = {
        "Vehicle_Count", "Traffic_Speed_kmh", "Road_Occupancy_%",
        "Weather_Condition", "Accident_Report", "Emission_Levels_g_km",
        "is_rush_hour",
    }
    if not required_columns.issubset(data.columns):
        return []

    numeric_columns = required_columns - {"Weather_Condition"}
    for column in numeric_columns:
        data[column] = pd.to_numeric(data[column], errors="coerce")

    generated_at = datetime.now(timezone.utc)
    alerts: list[Alert] = []

    # Dataset-relative thresholds keep alert sensitivity appropriate to new data.
    vehicle_threshold = data["Vehicle_Count"].quantile(0.90)
    speed_threshold = data["Traffic_Speed_kmh"].quantile(0.10)
    emission_threshold = data["Emission_Levels_g_km"].quantile(0.90)
    occupancy_threshold = data["Road_Occupancy_%"].quantile(0.95)

    row = _find_highest_risk_row(
        data, data["Vehicle_Count"] >= vehicle_threshold, "Vehicle_Count"
    )
    if row is not None:
        alerts.append(_build_alert(
            "Heavy Traffic", "High",
            f"Vehicle count is {int(_as_number(row, 'Vehicle_Count'))}, within the highest 10% of the dataset.",
            "Use an alternate route or allow additional travel time.", generated_at,
        ))

    row = _find_highest_risk_row(
        data, data["Traffic_Speed_kmh"] <= speed_threshold, "Road_Occupancy_%"
    )
    if row is not None:
        alerts.append(_build_alert(
            "Congestion", "High",
            f"Traffic speed is {_as_number(row, 'Traffic_Speed_kmh'):.1f} km/h, within the slowest 10% of the dataset.",
            "Avoid this corridor until traffic speed improves.", generated_at,
        ))

    row = _find_highest_risk_row(
        data, data["Accident_Report"] == 1, "Vehicle_Count"
    )
    if row is not None:
        alerts.append(_build_alert(
            "Accident", "Critical",
            "The dataset record has an accident report flag of 1.",
            "Choose another route and follow directions from traffic authorities.", generated_at,
        ))

    weather_codes = pd.to_numeric(data["Weather_Condition"], errors="coerce")
    row = _find_highest_risk_row(data, weather_codes != 0, "Road_Occupancy_%")
    if row is not None:
        alerts.append(_build_alert(
            "Weather Alert", "Medium",
            f"{weather_label(_as_number(row, 'Weather_Condition'))} weather conditions are recorded in the processed dataset.",
            "Reduce speed and maintain a safe following distance.", generated_at,
        ))

    row = _find_highest_risk_row(data, data["is_rush_hour"] == 1, "Vehicle_Count")
    if row is not None:
        alerts.append(_build_alert(
            "Rush Hour", "Medium",
            f"Rush-hour flag is 1 at dataset hour {int(_as_number(row, 'hour')):02d}:00.",
            "Plan for extra travel time or travel outside the peak period.", generated_at,
        ))

    row = _find_highest_risk_row(
        data, data["Emission_Levels_g_km"] >= emission_threshold, "Emission_Levels_g_km"
    )
    if row is not None:
        alerts.append(_build_alert(
            "High Emission", "Medium",
            f"Emission level is {_as_number(row, 'Emission_Levels_g_km'):.1f} g/km, within the highest 10% of the dataset.",
            "Avoid idling and consider a lower-emission travel option.", generated_at,
        ))

    blockage_condition = (
        (data["Road_Occupancy_%"] >= occupancy_threshold)
        & (data["Traffic_Speed_kmh"] <= speed_threshold)
    )
    row = _find_highest_risk_row(data, blockage_condition, "Road_Occupancy_%")
    if row is not None:
        alerts.append(_build_alert(
            "Road Block", "High",
            f"{_as_number(row, 'Road_Occupancy_%'):.1f}% road occupancy coincides with {_as_number(row, 'Traffic_Speed_kmh'):.1f} km/h speed, indicating a blockage risk.",
            "Avoid the affected corridor and select an alternate route.", generated_at,
        ))

    emergency_condition = (
        (data["Accident_Report"] == 1)
        & (data["Vehicle_Count"] >= vehicle_threshold)
    )
    row = _find_highest_risk_row(data, emergency_condition, "Vehicle_Count")
    if row is not None:
        alerts.append(_build_alert(
            "Emergency Vehicle", "Critical",
            f"An accident report flag of 1 coincides with {int(_as_number(row, 'Vehicle_Count'))} vehicles; emergency access should be prioritized.",
            "Give way to emergency vehicles and avoid entering the affected area.", generated_at,
        ))

    return alerts
