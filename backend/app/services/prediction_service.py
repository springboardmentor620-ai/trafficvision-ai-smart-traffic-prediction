def predict_congestion(vehicle_count: int, average_speed: float):
    if vehicle_count > 150 and average_speed < 30:
        return {
            "predicted_congestion": "High",
            "confidence": 0.95
        }

    elif vehicle_count > 80:
        return {
            "predicted_congestion": "Medium",
            "confidence": 0.85
        }

    else:
        return {
            "predicted_congestion": "Low",
            "confidence": 0.90
        }