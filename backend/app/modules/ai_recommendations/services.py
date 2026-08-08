from sqlalchemy.orm import Session

from app.modules.traffic_prediction.services import generate_prediction_report


def generate_ai_recommendations(db: Session):

    report = generate_prediction_report(db)

    recommendations = []

    for road in report:

        current = road["current_congestion_level"]
        predicted = road["predicted_congestion_level"]
        trend = road["trend"]

        recommendation = "Traffic is normal."
        priority = "Low"

        if predicted == "severe":
            recommendation = (
                "Heavy congestion expected. Avoid this road and use an alternate route."
            )
            priority = "Critical"

        elif predicted == "high":
            recommendation = (
                "High congestion expected. Leave early or choose another route."
            )
            priority = "High"

        elif trend == "increasing":
            recommendation = (
                "Traffic is increasing. Plan your journey in advance."
            )
            priority = "Medium"

        elif trend == "decreasing":
            recommendation = (
                "Traffic is improving. Waiting a few minutes may reduce delays."
            )
            priority = "Low"

        recommendations.append(
            {
                "road_id": road["road_id"],
                "road_name": road["road_name"],
                "zone": road["zone"],
                "current_vehicle_count": road["current_vehicle_count"],
                "predicted_vehicle_count": road["predicted_vehicle_count"],
                "current_congestion": current,
                "predicted_congestion": predicted,
                "trend": trend,
                "recommendation": recommendation,
                "priority": priority,
            }
        )

    return recommendations