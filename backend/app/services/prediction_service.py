from sqlalchemy.orm import Session

from app.ml.predict import predict
from app.services.prediction_history_service import (
    PredictionHistoryService,
)


class PredictionService:

    @staticmethod
    def get_prediction(
        db: Session,
        request
    ):

        severity, risk = predict(request)

        if risk >= 0.80:

            alert = "HIGH"

            emergency = "CRITICAL"

            traffic = "Heavy Congestion"

            delay = 30

            police = True

            ambulance = True

            fire = False

            road = True

            route = "Strongly Recommended"

            confidence = 96.4

            recommendation = (
                "High accident probability detected. "
                "Avoid this route immediately."
            )

        elif risk >= 0.50:

            alert = "MEDIUM"

            emergency = "MEDIUM"

            traffic = "Moderate Congestion"

            delay = 15

            police = False

            ambulance = False

            fire = False

            road = False

            route = "Recommended"

            confidence = 88.2

            recommendation = (
                "Drive carefully. Moderate congestion expected."
            )

        else:

            alert = "LOW"

            emergency = "LOW"

            traffic = "Normal"

            delay = 3

            police = False

            ambulance = False

            fire = False

            road = False

            route = "Not Required"

            confidence = 81.5

            recommendation = (
                "Traffic conditions appear normal."
            )

        # Save prediction history
        PredictionHistoryService.create(

            db,

            {

                "city": request.city,

                "state": request.state,

                "predicted_severity": severity,

                "predicted_risk_score": round(risk, 2),

                "traffic_alert": alert,

                "emergency_level": emergency,

                "recommendation": recommendation

            }

        )

        return {

            "predicted_severity": severity,

            "predicted_risk_score": round(risk, 2),

            "traffic_alert": alert,

            "emergency_level": emergency,

            "traffic_status": traffic,

            "estimated_delay_minutes": delay,

            "police_required": police,

            "ambulance_required": ambulance,

            "fire_brigade_required": fire,

            "road_closure": road,

            "alternative_route": route,

            "confidence": confidence,

            "recommendation": recommendation

        }