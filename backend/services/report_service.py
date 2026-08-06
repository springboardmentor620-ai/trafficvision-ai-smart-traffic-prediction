"""
Report Service — generates the AI Traffic Report from MySQL data + RF model.
"""
from collections import defaultdict
from datetime import datetime

from sqlalchemy.orm import Session

from models.traffic import Traffic
from services import ml_service


def generate_ai_report(db: Session) -> dict:
    records = db.query(Traffic).all()
    now = datetime.now()

    if not records:
        return {"error": "No traffic data available"}

    total = len(records)
    total_vehicles = sum(r.vehicle_count for r in records)
    avg_vehicles = round(total_vehicles / total, 1)

    high = [r for r in records if r.congestion_level == "High"]
    medium = [r for r in records if r.congestion_level == "Medium"]
    low = [r for r in records if r.congestion_level == "Low"]

    most_congested = max(records, key=lambda r: r.vehicle_count)
    least_congested = min(records, key=lambda r: r.vehicle_count)

    # Peak hour based on ID binning
    hour_buckets = defaultdict(list)
    for r in records:
        hour_buckets[r.id % 24].append(r.vehicle_count)
    peak_hour = max(hour_buckets, key=lambda h: sum(hour_buckets[h]) / len(hour_buckets[h]))
    peak_hour_avg = round(sum(hour_buckets[peak_hour]) / len(hour_buckets[peak_hour]), 1)

    # RF-based predictions for next hour for all junctions 1–4
    next_hour = (now.hour + 1) % 24
    junction_predictions = []
    for j in range(1, 5):
        pred = ml_service.predict_volume(
            junction=j,
            hour=next_hour,
            year=now.year,
            month=now.month,
            day=now.day,
            day_of_week=now.weekday(),
        )
        cong = ml_service.classify_congestion(pred)
        junction_predictions.append({
            "junction": j,
            "predicted_vehicles": pred,
            "congestion_level": cong["level"],
            "urgency": cong["urgency"],
        })

    predicted_peak = max(junction_predictions, key=lambda x: x["predicted_vehicles"])

    # Accident data
    accident_locations = [r.location for r in records if r.accident_status and r.accident_status.lower() in ("yes", "1")]
    emergency_locations = [r.location for r in records if r.emergency_status and r.emergency_status.lower() not in ("normal", "none", "")]

    # Average speed
    speed_records = [r for r in records if r.average_speed is not None]
    avg_speed = round(sum(r.average_speed for r in speed_records) / len(speed_records), 1) if speed_records else 0

    # Build overall summary text
    if len(high) > total * 0.5:
        overall_status = "CRITICAL — Majority of city junctions are heavily congested."
        overall_action = "Immediate deployment of emergency traffic management required."
    elif len(high) > total * 0.25:
        overall_status = "HIGH ALERT — Significant congestion across multiple junctions."
        overall_action = "Deploy traffic officers to critical junctions. Activate alternate routes."
    elif len(medium) > total * 0.4:
        overall_status = "MODERATE — Traffic is building in several zones."
        overall_action = "Monitor peak hours. Optimize signal timing proactively."
    else:
        overall_status = "NORMAL — Traffic is flowing smoothly across most junctions."
        overall_action = "Maintain standard monitoring. No immediate action required."

    # AI recommendations (top 3 worst)
    worst = sorted(records, key=lambda r: r.vehicle_count, reverse=True)[:3]
    ai_recommendations = []
    for r in worst:
        pred = ml_service.predict_volume(
            junction=r.id % 4 + 1,
            hour=next_hour,
            year=now.year, month=now.month, day=now.day,
            day_of_week=now.weekday(),
        )
        ai_recommendations.append(ml_service.get_recommendation(pred, r.id % 4 + 1, next_hour))

    return {
        "generated_at": now.isoformat(),
        "report_date": now.strftime("%d %B %Y"),
        "report_time": now.strftime("%H:%M:%S"),

        # Summary KPIs
        "total_locations_monitored": total,
        "total_vehicles_recorded": total_vehicles,
        "average_vehicle_count": avg_vehicles,
        "average_speed_kmh": avg_speed,

        # Congestion breakdown
        "high_congestion_count": len(high),
        "medium_congestion_count": len(medium),
        "low_congestion_count": len(low),
        "high_congestion_percentage": round(len(high) / total * 100, 1),

        # Key locations
        "most_congested_junction": {
            "location": most_congested.location,
            "vehicle_count": most_congested.vehicle_count,
            "congestion_level": most_congested.congestion_level,
            "road_status": most_congested.road_status,
        },
        "least_congested_junction": {
            "location": least_congested.location,
            "vehicle_count": least_congested.vehicle_count,
            "congestion_level": least_congested.congestion_level,
        },

        # Peak hour
        "peak_traffic_hour": f"{peak_hour:02d}:00",
        "peak_hour_avg_vehicles": peak_hour_avg,

        # Incident data
        "accident_locations": accident_locations,
        "accident_count": len(accident_locations),
        "emergency_locations": emergency_locations,
        "emergency_count": len(emergency_locations),

        # RF Predictions
        "rf_predictions_next_hour": junction_predictions,
        "rf_predicted_peak_junction": predicted_peak,

        # Overall assessment
        "overall_status": overall_status,
        "overall_action_required": overall_action,

        # AI recommendations
        "ai_recommendations": ai_recommendations,
    }
