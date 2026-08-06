import pandas as pd


NUMERIC_FEATURES = [
    "Vehicle_Count", "Traffic_Speed_kmh", "Road_Occupancy_%", "Accident_Report",
    "Sentiment_Score", "Ride_Sharing_Demand", "Parking_Availability",
    "Emission_Levels_g_km", "Energy_Consumption_L_h", "hour", "day_of_week",
    "is_weekend", "is_rush_hour", "volume_speed_pressure",
    "occupancy_speed_pressure", "rush_hour_volume",
]
CATEGORICAL_FEATURES = ["Traffic_Light_State", "Weather_Condition"]
RAW_FEATURES = [
    "Vehicle_Count", "Traffic_Speed_kmh", "Road_Occupancy_%", "Traffic_Light_State",
    "Weather_Condition", "Accident_Report", "Sentiment_Score", "Ride_Sharing_Demand",
    "Parking_Availability", "Emission_Levels_g_km", "Energy_Consumption_L_h", "hour",
    "day_of_week", "is_weekend", "is_rush_hour",
]
TARGET_COLUMN = "Traffic_Condition"


def build_feature_frame(data: pd.DataFrame) -> pd.DataFrame:
    """Clean source fields and add repeatable traffic-pressure features."""
    features = data.loc[:, RAW_FEATURES].copy()
    numeric_raw = [column for column in RAW_FEATURES if column not in CATEGORICAL_FEATURES]
    for column in numeric_raw:
        features[column] = pd.to_numeric(features[column], errors="coerce")
    for column in CATEGORICAL_FEATURES:
        features[column] = features[column].astype("string").fillna("Unknown")

    safe_speed = features["Traffic_Speed_kmh"].clip(lower=1)
    features["volume_speed_pressure"] = features["Vehicle_Count"] / safe_speed
    features["occupancy_speed_pressure"] = features["Road_Occupancy_%"] / safe_speed
    features["rush_hour_volume"] = features["Vehicle_Count"] * features["is_rush_hour"]
    return features

