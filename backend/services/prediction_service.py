import sys
from pathlib import Path


PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from ml_model.predict import predict_traffic_condition


def get_prediction(payload: dict) -> dict:
    """Delegate prediction to the persisted Scikit-Learn pipeline."""
    result = predict_traffic_condition(payload)
    condition = result["predicted_traffic_condition"].title()
    speed = float(payload.get("Traffic_Speed_kmh", 0))
    vehicle_count = float(payload.get("Vehicle_Count", 0))
    risk = "High" if condition == "High" or payload.get("Accident_Report") else "Medium" if condition == "Medium" else "Low"
    delay = max(0, round((55 - speed) / 55 * 100))
    recommendation = "Use an alternative route and allow extra time." if risk == "High" else "Monitor conditions and avoid peak periods where possible." if risk == "Medium" else "Conditions are suitable for normal travel."
    travel_time = round(15 + delay * 0.45, 0)
    congestion = min(100, round(float(payload.get("Road_Occupancy_%", 0)), 1))
    return {**result, "traffic": condition, "congestion_percentage": congestion, "estimated_delay_percentage": delay, "risk": risk, "average_speed": round(speed, 1), "travel_time_minutes": travel_time, "recommendation": recommendation, "vehicle_count": vehicle_count}
