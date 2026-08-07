# import os
# import joblib
# import requests
# import pandas as pd
# from datetime import datetime

# from app.services.alert_service import save_alert
# from app.data.area_coordinates import AREA_COORDINATES

# current_dir = os.path.dirname(__file__)

# # -----------------------------
# # Load ML Model
# # -----------------------------

# model = joblib.load(
#     os.path.join(
#         current_dir,
#         "..",
#         "..",
#         "ml",
#         "traffic_model.pkl"
#     )
# )

# encoders = joblib.load(
#     os.path.join(
#         current_dir,
#         "..",
#         "..",
#         "ml",
#         "label_encoders.pkl"
#     )
# )

# traffic_df = pd.read_csv(
#     os.path.join(
#         current_dir,
#         "..",
#         "..",
#         "data",
#         "Banglore_traffic_Dataset.csv"
#     )
# )

# ORS_API_KEY = os.getenv("ORS_API_KEY")


# # ------------------------------------------------
# # Route Information
# # ------------------------------------------------

# def get_route(source, destination):

#     source_coord = AREA_COORDINATES[source]
#     destination_coord = AREA_COORDINATES[destination]

#     url = "https://api.openrouteservice.org/v2/directions/driving-car"

#     headers = {
#         "Authorization": ORS_API_KEY,
#         "Content-Type": "application/json"
#     }

#     body = {

#         "coordinates": [

#             [source_coord[1], source_coord[0]],

#             [destination_coord[1], destination_coord[0]]

#         ]

#     }

#     response = requests.post(
#         url,
#         headers=headers,
#         json=body
#     )

#     if response.status_code != 200:
#         return None

#     data = response.json()

#     summary = data["routes"][0]["summary"]

#     distance = round(summary["distance"] / 1000, 2)

#     duration = round(summary["duration"] / 60)

#     return {
#         "distance": distance,
#         "duration": duration
#     }


# # ------------------------------------------------
# # Prediction
# # ------------------------------------------------

# async def predict_congestion(data):

#     route = get_route(
#         data.source,
#         data.destination
#     )

#     if route is None:

#         return {
#             "error": "Unable to fetch route."
#         }

#     # choose a random traffic record
#     row = traffic_df.sample(1).iloc[0]

#     date = pd.to_datetime(row["Date"])

#     area = encoders["Area Name"].transform(
#         [row["Area Name"]]
#     )[0]

#     road = encoders["Road/Intersection Name"].transform(
#         [row["Road/Intersection Name"]]
#     )[0]

#     weather = encoders["Weather Conditions"].transform(
#         [row["Weather Conditions"]]
#     )[0]

#     roadwork = encoders[
#         "Roadwork and Construction Activity"
#     ].transform(
#         [row["Roadwork and Construction Activity"]]
#     )[0]

#     input_df = pd.DataFrame([{

#         "Area Name": area,

#         "Road/Intersection Name": road,

#         "Traffic Volume": row["Traffic Volume"],

#         "Average Speed": row["Average Speed"],

#         "Travel Time Index": row["Travel Time Index"],

#         "Road Capacity Utilization":
#         row["Road Capacity Utilization"],

#         "Incident Reports":
#         row["Incident Reports"],

#         "Environmental Impact":
#         row["Environmental Impact"],

#         "Public Transport Usage":
#         row["Public Transport Usage"],

#         "Traffic Signal Compliance":
#         row["Traffic Signal Compliance"],

#         "Parking Usage":
#         row["Parking Usage"],

#         "Pedestrian and Cyclist Count":
#         row["Pedestrian and Cyclist Count"],

#         "Weather Conditions":
#         weather,

#         "Roadwork and Construction Activity":
#         roadwork,

#         "Year":
#         date.year,

#         "Month":
#         date.month,

#         "Day":
#         date.day

#     }])

#     prediction = float(
#         model.predict(input_df)[0]
#     )

#     prediction = max(
#         0,
#         min(
#             100,
#             round(prediction, 2)
#         )
#     )

#     # Route based adjustment

#     if route["duration"] > 50:
#         prediction += 12

#     elif route["duration"] > 35:
#         prediction += 7

#     elif route["duration"] > 20:
#         prediction += 3

#     prediction = min(
#         prediction,
#         100
#     )
#         # ----------------------------------------
#     # Severity
#     # ----------------------------------------

#     if prediction >= 90:
#         severity = "Severe"

#     elif prediction >= 75:
#         severity = "High"

#     elif prediction >= 60:
#         severity = "Medium"

#     elif prediction >= 40:
#         severity = "Low"

#     else:
#         severity = "Normal"

#     # ----------------------------------------
#     # Delay
#     # ----------------------------------------

#     if prediction >= 90:
#         delay = "30-45 mins"

#     elif prediction >= 75:
#         delay = "20-30 mins"

#     elif prediction >= 60:
#         delay = "10-20 mins"

#     elif prediction >= 40:
#         delay = "5-10 mins"

#     else:
#         delay = "0-5 mins"

#     # ----------------------------------------
#     # Traffic Level
#     # ----------------------------------------

#     if prediction >= 80:
#         traffic_level = "Heavy"

#     elif prediction >= 50:
#         traffic_level = "Moderate"

#     else:
#         traffic_level = "Low"

#     # ----------------------------------------
#     # Fuel Estimation
#     # ----------------------------------------

#     fuel = round(route["distance"] / 12, 2)

#     # ----------------------------------------
#     # Alerts
#     # ----------------------------------------

#     alerts = []

#     recommendations = []

#     if severity == "Severe":

#         alerts.append(
#             "🚨 Severe congestion expected on this route."
#         )

#         recommendations.append(
#             "Avoid this route immediately."
#         )

#     elif severity == "High":

#         alerts.append(
#             "🚗 Heavy traffic expected."
#         )

#         recommendations.append(
#             "Use the alternate route."
#         )

#     elif severity == "Medium":

#         alerts.append(
#             "⚠ Moderate congestion expected."
#         )

#         recommendations.append(
#             "Leave 10-15 minutes earlier."
#         )

#     else:

#         alerts.append(
#             "✅ Traffic conditions are normal."
#         )

#         recommendations.append(
#             "You can continue on this route."
#         )

#     if row["Traffic Volume"] > 40000:

#         alerts.append(
#             "🚙 High vehicle density."
#         )

#         recommendations.append(
#             "Travel during off-peak hours."
#         )

#     if row["Average Speed"] < 20:

#         alerts.append(
#             "🐢 Slow moving traffic."
#         )

#     if row["Incident Reports"] > 2:

#         alerts.append(
#             "🚑 Incidents reported on nearby roads."
#         )

#     if str(row["Weather Conditions"]).lower() != "clear":

#         alerts.append(
#             f"🌧 Weather : {row['Weather Conditions']}"
#         )

#         recommendations.append(
#             "Drive carefully."
#         )

#     if str(
#         row["Roadwork and Construction Activity"]
#     ).lower() in [
#         "yes",
#         "ongoing",
#         "under construction"
#     ]:

#         alerts.append(
#             "🚧 Roadwork in progress."
#         )

#         recommendations.append(
#             "Expect lane closures."
#         )

#     alerts = list(dict.fromkeys(alerts))

#     recommendations = list(
#         dict.fromkeys(recommendations)
#     )

#     result = {

#         "source": data.source,

#         "destination": data.destination,

#         "distance": route["distance"],

#         "duration": route["duration"],

#         "predicted_congestion": prediction,

#         "severity": severity,

#         "delay": delay,

#         "traffic_level": traffic_level,

#         "fuel": fuel,

#         "alert_priority": severity,

#         "alert_time":
#         datetime.now().strftime("%I:%M %p"),

#         "alerts": alerts,

#         "recommendations": recommendations,

#         "route": {

#             "distance": route["distance"],

#             "duration": route["duration"],

#             "traffic": traffic_level

#         },

#         "alternate_route": None

#     }

#     await save_alert(result)

#     return result

import os
import joblib
import pandas as pd
import requests
from app.database import db

from datetime import datetime
from dotenv import load_dotenv

from app.services.alert_service import save_alert
from app.data.area_coordinates import AREA_COORDINATES
from app.data.route_generator import generate_timelines
prediction_collection = db["predictions"]
load_dotenv()

# -----------------------------------------
# OpenRouteService API Key
# -----------------------------------------

ORS_API_KEY = os.getenv("ORS_API_KEY")

# -----------------------------------------
# Load ML Model
# -----------------------------------------

current_dir = os.path.dirname(__file__)

model_path = os.path.join(
    current_dir,
    "..",
    "..",
    "ml",
    "traffic_model.pkl"
)

model = joblib.load(model_path)

# -----------------------------------------
# Load Label Encoders
# -----------------------------------------

encoder_path = os.path.join(
    current_dir,
    "..",
    "..",
    "ml",
    "label_encoders.pkl"
)

encoders = joblib.load(encoder_path)

# -----------------------------------------
# Load Dataset
# -----------------------------------------

dataset_path = os.path.join(
    current_dir,
    "..",
    "..",
    "data",
    "Banglore_traffic_Dataset.csv"
)

traffic_df = pd.read_csv(dataset_path)

# -----------------------------------------
# ORS Route Function
# -----------------------------------------

def get_routes(source, destination):

    source_lat, source_lon = AREA_COORDINATES[source]
    dest_lat, dest_lon = AREA_COORDINATES[destination]

    url = "https://api.openrouteservice.org/v2/directions/driving-car/geojson"

    headers = {
        "Authorization": ORS_API_KEY,
        "Content-Type": "application/json"
    }

    body = {

        "coordinates": [

            [source_lon, source_lat],

            [dest_lon, dest_lat]

        ],

        "alternative_routes": {

            "target_count": 2,

            "weight_factor": 1.4,

            "share_factor": 0.6

        }

    }

    response = requests.post(
        url,
        headers=headers,
        json=body
    )

    if response.status_code != 200:

        return []

    data = response.json()

    features = data.get("features", [])

    for feature in features:

        steps = []

        try:

            segments = feature["properties"]["segments"]

            for segment in segments:

                for step in segment["steps"]:

                    road = step.get("name", "").strip()

                    instruction = step.get("instruction", "").strip()

                    if road != "":
                        steps.append(road)

                    elif instruction != "":
                        steps.append(instruction)

        except:
            pass

        cleaned_steps = []

        for road in steps:

            if road not in cleaned_steps:
                cleaned_steps.append(road)

        feature["timeline"] = cleaned_steps

    return features

async def predict_congestion(data):

    # -----------------------------------------
    # Get Routes from OpenRouteService
    # -----------------------------------------

    routes = get_routes(
        data.source,
        data.destination
    )

    recommended_timeline, alternate_timeline = generate_timelines(
        data.source,
        data.destination
    )
    if len(routes) == 0:

        return {
            "success": False,
            "message": "No route found."
        }

    predicted_routes = []

    # -----------------------------------------
    # Predict congestion for every route
    # -----------------------------------------

    for feature in routes:

        summary = feature["properties"]["summary"]

        distance = round(
            summary["distance"] / 1000,
            2
        )

        duration = round(
            summary["duration"] / 60,
            2
        )

        geometry = feature["geometry"]["coordinates"]
        timeline = feature.get("timeline", [])
        average_speed = round(
            distance / (duration / 60),
            2
        )

        # -----------------------------------------
        # Choose a similar record from dataset
        # -----------------------------------------

        row = traffic_df.sample(1).iloc[0]

        date = pd.to_datetime(
            row["Date"]
        )

        year = date.year
        month = date.month
        day = date.day

        area = encoders["Area Name"].transform(
            [row["Area Name"]]
        )[0]

        road = encoders["Road/Intersection Name"].transform(
            [row["Road/Intersection Name"]]
        )[0]

        weather = encoders[
            "Weather Conditions"
        ].transform(
            [row["Weather Conditions"]]
        )[0]

        roadwork = encoders[
            "Roadwork and Construction Activity"
        ].transform(
            [row["Roadwork and Construction Activity"]]
        )[0]

        input_df = pd.DataFrame([{

            "Area Name": area,

            "Road/Intersection Name": road,

            "Traffic Volume":
                row["Traffic Volume"],

            "Average Speed":
                average_speed,

            "Travel Time Index":
                row["Travel Time Index"],

            "Road Capacity Utilization":
                row["Road Capacity Utilization"],

            "Incident Reports":
                row["Incident Reports"],

            "Environmental Impact":
                row["Environmental Impact"],

            "Public Transport Usage":
                row["Public Transport Usage"],

            "Traffic Signal Compliance":
                row["Traffic Signal Compliance"],

            "Parking Usage":
                row["Parking Usage"],

            "Pedestrian and Cyclist Count":
                row["Pedestrian and Cyclist Count"],

            "Weather Conditions":
                weather,

            "Roadwork and Construction Activity":
                roadwork,

            "Year":
                year,

            "Month":
                month,

            "Day":
                day

        }])

        prediction = round(
            float(model.predict(input_df)[0]),
            2
        )

# Add route influence

        prediction += distance * 0.6

        prediction += duration * 0.4

        prediction = max(0, min(100, prediction))

        prediction = max(
            0,
            min(100, prediction)
        )
                # -----------------------------------------
        # Severity
        # -----------------------------------------

        if prediction >= 90:
            severity = "Severe"

        elif prediction >= 75:
            severity = "High"

        elif prediction >= 60:
            severity = "Medium"

        elif prediction >= 40:
            severity = "Low"

        else:
            severity = "Normal"

        # -----------------------------------------
        # Traffic Level
        # -----------------------------------------

        if duration > 40:

            traffic = "Heavy"

        elif duration > 25:

            traffic = "Medium"

        else:

            traffic = "Low"

        # -----------------------------------------
        # Fuel Estimation
        # -----------------------------------------

        fuel = round(distance / 12, 2)

        # -----------------------------------------
        # Delay
        # -----------------------------------------

        if prediction >= 90:
            delay = "30-45 mins"

        elif prediction >= 75:
            delay = "20-30 mins"

        elif prediction >= 60:
            delay = "10-20 mins"

        elif prediction >= 40:
            delay = "5-10 mins"

        else:
            delay = "0-5 mins"

        # -----------------------------------------
        # Store Route
        # -----------------------------------------

        predicted_routes.append({

            "distance": distance,

            "duration": duration,

            "geometry": geometry,

            "average_speed": average_speed,
            "timeline": timeline,
            "traffic_volume": int(
                row["Traffic Volume"]
            ),

            "road_capacity": round(
                float(
                    row["Road Capacity Utilization"]
                ),
                2
            ),

            "incident_reports": int(
                row["Incident Reports"]
            ),

            "weather": row[
                "Weather Conditions"
            ],

            "predicted_congestion": prediction,

            "severity": severity,

            "traffic": traffic,

            "fuel": fuel,

            "delay": delay

        })

    # -----------------------------------------
    # Sort Routes
    # -----------------------------------------

    predicted_routes = sorted(
    predicted_routes,
    key=lambda x: (
        x["predicted_congestion"],
        x["duration"],
        x["distance"]
    )
)

    best_route = predicted_routes[0]

    alternate_route = (
        predicted_routes[1]
        if len(predicted_routes) > 1
        else None
    )
    # ----------------------------------------
    # Assign Correct Timelines
    # ----------------------------------------

    recommended_route = {
        **best_route,
        "timeline": [
            data.source,
            *recommended_timeline,
            data.destination
        ]
    }

    alternate_route_data = None

    if alternate_route:

        alternate_route_data = {
            **alternate_route,
            "timeline": [
                data.source,
                *alternate_timeline,
                data.destination
            ]
        }

    if len(predicted_routes) > 1:

        alternate_route = predicted_routes[1]
            # -----------------------------------------
    # AI Alerts
    # -----------------------------------------

    alerts = []

    recommendations = []

    if best_route["predicted_congestion"] >= 90:

        alerts.append(
            "🚨 Severe traffic congestion detected."
        )

        recommendations.append(
            "Avoid this route immediately."
        )

    elif best_route["predicted_congestion"] >= 75:

        alerts.append(
            "🚗 Heavy traffic detected."
        )

        recommendations.append(
            "Choose the alternate route."
        )

    elif best_route["predicted_congestion"] >= 60:

        alerts.append(
            "⚠ Moderate congestion expected."
        )

        recommendations.append(
            "Expect moderate delays."
        )

    else:

        alerts.append(
            "✅ Traffic is flowing normally."
        )

        recommendations.append(
            "Recommended route is safe to travel."
        )

    # -----------------------------------------
    # Additional Alerts
    # -----------------------------------------

    if best_route["traffic_volume"] > 40000:

        alerts.append(
            "🚙 High vehicle density detected."
        )

        recommendations.append(
            "Travel during off-peak hours."
        )

    if best_route["average_speed"] < 20:

        alerts.append(
            "🐢 Vehicles are moving slowly."
        )

        recommendations.append(
            "Keep extra travel time."
        )

    if best_route["road_capacity"] > 90:

        alerts.append(
            "⚠ Road capacity almost full."
        )

        recommendations.append(
            "Avoid this road if possible."
        )

    if best_route["incident_reports"] >= 3:

        alerts.append(
            f"🚑 {best_route['incident_reports']} incident(s) reported."
        )

        recommendations.append(
            "Drive carefully near the affected area."
        )

    weather = str(
        best_route["weather"]
    ).lower()

    if weather != "clear":

        alerts.append(
            f"🌧 Weather : {best_route['weather']}"
        )

        recommendations.append(
            "Drive carefully due to weather."
        )

    # -----------------------------------------
    # Remove Duplicate Messages
    # -----------------------------------------

    alerts = list(
        dict.fromkeys(alerts)
    )

    recommendations = list(
        dict.fromkeys(recommendations)
    )

    # -----------------------------------------
    # Alert Information
    # -----------------------------------------

    alert_priority = best_route["severity"]

    alert_time = datetime.now().strftime(
        "%I:%M %p"
    )
        # -----------------------------------------
    # Final Result
    # -----------------------------------------

    result = {

        "success": True,

        "source": data.source,

        "destination": data.destination,

        "distance": best_route["distance"],

        "duration": best_route["duration"],

        "fuel": best_route["fuel"],

        "traffic_level": best_route["traffic"],

        "predicted_congestion":
            best_route["predicted_congestion"],

        "severity":
            best_route["severity"],

        "delay":
            best_route["delay"],

        "traffic_volume":
            best_route["traffic_volume"],

        "average_speed":
            best_route["average_speed"],

        "road_capacity":
            best_route["road_capacity"],

        "incident_reports":
            best_route["incident_reports"],

        "weather":
            best_route["weather"],

        "alert_priority":
            alert_priority,

        "alert_time":
            alert_time,

        "alerts":
            alerts,

        "recommendations":
            recommendations,

        "route": {

            "distance":
                recommended_route["distance"],

            "duration":
                recommended_route["duration"],

            "traffic":
                recommended_route["traffic"],

            "fuel":
                recommended_route["fuel"],

            "geometry":
                recommended_route["geometry"],
            "timeline":
                recommended_route["timeline"]


        },

        "alternate_route":
            None if alternate_route_data is None else {

                "distance":
                    alternate_route_data["distance"],

                "duration":
                    alternate_route_data["duration"],

                "traffic":
                    alternate_route_data["traffic"],

                "fuel":
                    alternate_route_data["fuel"],

                "predicted_congestion":
                    alternate_route_data["predicted_congestion"],

                "severity":
                    alternate_route_data["severity"],

                "geometry":
                    alternate_route_data["geometry"],
                "timeline":
                    alternate_route_data["timeline"]

            }

    }

    await save_alert(result)
    prediction_to_save = result.copy()

    prediction_to_save["created_at"] = datetime.now()

    await prediction_collection.insert_one(prediction_to_save)
    return result