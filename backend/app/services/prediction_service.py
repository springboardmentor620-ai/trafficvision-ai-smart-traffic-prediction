from sqlalchemy.orm import Session

from app.ml.predict import predict

from app.services.prediction_history_service import (
    PredictionHistoryService,
)

from app.services.traffic_alert_service import (
    TrafficAlertService,
)


class PredictionService:

    @staticmethod
    def get_prediction(
        db: Session,
        request
    ):

        # =========================================================
        # RUN ML PREDICTION
        # =========================================================

        severity, risk = predict(request)

        risk = float(risk)


        # =========================================================
        # DETERMINE TRAFFIC CONDITION
        # =========================================================

        if risk >= 0.80:

            alert = "Heavy Congestion"

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

            alert = "Moderate Congestion"

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

            alert = "Normal"

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


        # =========================================================
        # SAVE PREDICTION HISTORY
        # =========================================================

        PredictionHistoryService.create(

            db,

            {

                "city": request.city,

                "state": request.state,

                "predicted_severity": severity,

                "predicted_risk_score": round(
                    risk,
                    2
                ),

                "traffic_alert": alert,

                "emergency_level": emergency,

                "recommendation": recommendation

            }

        )


        # =========================================================
        # CREATE TRAFFIC ALERTS
        #
        # IMPORTANT:
        # We use the existing TrafficAlert model.
        # No database column changes are required.
        # =========================================================


        # ---------------------------------------------------------
        # HIGH RISK
        #
        # Create:
        # 1. Accident notification
        # 2. Emergency traffic alert
        # 3. Route delay warning
        # ---------------------------------------------------------

        if risk >= 0.80:

            # ACCIDENT ALERT

            TrafficAlertService.create(

                db,

                {

                    "city":
                        request.city,

                    "state":
                        request.state,

                    "predicted_severity":
                        severity,

                    "predicted_risk_score":
                        round(
                            risk,
                            2
                        ),

                    "traffic_alert":
                        "Accident detected",

                    "emergency_level":
                        "CRITICAL",

                    "recommendation":
                        (
                            "High accident risk detected. "
                            "Avoid this route immediately."
                        ),

                    "is_active":
                        True

                }

            )


            # EMERGENCY ALERT

            TrafficAlertService.create(

                db,

                {

                    "city":
                        request.city,

                    "state":
                        request.state,

                    "predicted_severity":
                        severity,

                    "predicted_risk_score":
                        round(
                            risk,
                            2
                        ),

                    "traffic_alert":
                        "Emergency traffic alert",

                    "emergency_level":
                        "CRITICAL",

                    "recommendation":
                        (
                            "Emergency traffic response "
                            "may be required. Avoid the "
                            "affected route."
                        ),

                    "is_active":
                        True

                }

            )


            # ROUTE DELAY ALERT

            TrafficAlertService.create(

                db,

                {

                    "city":
                        request.city,

                    "state":
                        request.state,

                    "predicted_severity":
                        severity,

                    "predicted_risk_score":
                        round(
                            risk,
                            2
                        ),

                    "traffic_alert":
                        "Route delay",

                    "emergency_level":
                        "CRITICAL",

                    "recommendation":
                        (
                            f"Approximately {delay} "
                            "minutes of additional "
                            "travel time is expected."
                        ),

                    "is_active":
                        True

                }

            )


        # ---------------------------------------------------------
        # MEDIUM RISK
        #
        # Create:
        # 1. Congestion alert
        # 2. Route delay warning
        # ---------------------------------------------------------

        elif risk >= 0.50:

            # CONGESTION ALERT

            TrafficAlertService.create(

                db,

                {

                    "city":
                        request.city,

                    "state":
                        request.state,

                    "predicted_severity":
                        severity,

                    "predicted_risk_score":
                        round(
                            risk,
                            2
                        ),

                    "traffic_alert":
                        "Heavy congestion",

                    "emergency_level":
                        "MEDIUM",

                    "recommendation":
                        (
                            "Moderate to heavy traffic "
                            "congestion expected. "
                            "Consider an alternative route."
                        ),

                    "is_active":
                        True

                }

            )


            # ROUTE DELAY ALERT

            TrafficAlertService.create(

                db,

                {

                    "city":
                        request.city,

                    "state":
                        request.state,

                    "predicted_severity":
                        severity,

                    "predicted_risk_score":
                        round(
                            risk,
                            2
                        ),

                    "traffic_alert":
                        "Route delay",

                    "emergency_level":
                        "MEDIUM",

                    "recommendation":
                        (
                            f"Approximately {delay} "
                            "minutes of additional "
                            "travel time is expected."
                        ),

                    "is_active":
                        True

                }

            )


        # =========================================================
        # LOW RISK
        #
        # No alert is generated.
        # Normal traffic should not pollute Alert Center.
        # =========================================================


        # =========================================================
        # RETURN PREDICTION RESPONSE
        # =========================================================

        return {

            "predicted_severity":
                severity,

            "predicted_risk_score":
                round(
                    risk,
                    2
                ),

            "traffic_alert":
                alert,

            "emergency_level":
                emergency,

            "traffic_status":
                traffic,

            "estimated_delay_minutes":
                delay,

            "police_required":
                police,

            "ambulance_required":
                ambulance,

            "fire_brigade_required":
                fire,

            "road_closure":
                road,

            "alternative_route":
                route,

            "confidence":
                confidence,

            "recommendation":
                recommendation

        }