import os
import joblib
import pandas as pd

current_dir = os.path.dirname(__file__)

# Load ML Model
model_path = os.path.join(
    current_dir,
    "..",
    "..",
    "ml",
    "traffic_model.pkl"
)

model = joblib.load(model_path)

# Load Label Encoders
encoder_path = os.path.join(
    current_dir,
    "..",
    "..",
    "ml",
    "label_encoders.pkl"
)

encoders = joblib.load(encoder_path)


def predict_congestion(data):

    area = encoders["Area Name"].transform(
        [data.area_name]
    )[0]

    road = encoders["Road/Intersection Name"].transform(
        [data.road_name]
    )[0]

    weather = encoders["Weather Conditions"].transform(
        [data.weather_conditions]
    )[0]

    roadwork = encoders["Roadwork and Construction Activity"].transform(
        [data.roadwork_activity]
    )[0]

    input_df = pd.DataFrame([{

        "Area Name": area,

        "Road/Intersection Name": road,

        "Traffic Volume": data.traffic_volume,

        "Average Speed": data.average_speed,

        "Travel Time Index": data.travel_time_index,

        "Road Capacity Utilization": data.road_capacity_utilization,

        "Incident Reports": data.incident_reports,

        "Environmental Impact": data.environmental_impact,

        "Public Transport Usage": data.public_transport_usage,

        "Traffic Signal Compliance": data.traffic_signal_compliance,

        "Parking Usage": data.parking_usage,

        "Pedestrian and Cyclist Count": data.pedestrian_count,

        "Weather Conditions": weather,

        "Roadwork and Construction Activity": roadwork,

        "Year": data.year,

        "Month": data.month,

        "Day": data.day

    }])

    prediction = model.predict(input_df)

    return round(float(prediction[0]), 2)