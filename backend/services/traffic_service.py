from pathlib import Path

import pandas as pd

from services.location_service import locations

BASE_DIR = Path(__file__).resolve().parent.parent.parent
# Keep the supplied dataset name exactly as it appears on disk (Windows is not
# always the deployment filesystem).
DATASET_PATH = BASE_DIR / "dataset" / "traffic_Dataset.csv"
DATASET_COLUMN_MAP = {
    "Date": "Timestamp", "Traffic Volume": "Vehicle_Count",
    "Average Speed": "Traffic_Speed_kmh", "Congestion Level": "Traffic_Condition",
    "Weather Conditions": "Weather_Condition",
}


def normalize_traffic_condition(value):
    try:
        value = float(value)
    except (TypeError, ValueError):
        return str(value)
    return "Low" if value < 35 else "Medium" if value < 70 else "High"


def _load_data():
    if not DATASET_PATH.exists():
        return pd.DataFrame()
    data = pd.read_csv(DATASET_PATH).rename(columns=DATASET_COLUMN_MAP)
    if "Traffic_Condition" in data:
        data["Traffic_Condition"] = data["Traffic_Condition"].map(normalize_traffic_condition)
    return data


traffic_data = _load_data()


def _json_records(data):
    return data.where(pd.notna(data), None).to_dict(orient="records")


def get_all_traffic():
    return _json_records(traffic_data) if not traffic_data.empty else []


def get_statistics():
    if traffic_data.empty:
        return {"total_records": 0, "average_vehicle_count": 0, "average_speed": 0, "traffic_condition": "No Data", "weather": "No Data", "areas": 0}
    return {
        "total_records": int(len(traffic_data)),
        "average_vehicle_count": round(float(traffic_data["Vehicle_Count"].mean()), 1),
        "average_speed": round(float(traffic_data["Traffic_Speed_kmh"].mean()), 1),
        "traffic_condition": str(traffic_data["Traffic_Condition"].mode().iat[0]),
        "weather": str(traffic_data["Weather_Condition"].mode().iat[0]),
        "areas": int(traffic_data["Area Name"].nunique()),
    }


def search_traffic(weather="", condition=""):
    data = traffic_data.copy()
    if weather:
        data = data[data["Weather_Condition"].astype(str).str.contains(weather, case=False, na=False)]
    if condition:
        data = data[data["Traffic_Condition"].astype(str).str.contains(condition, case=False, na=False)]
    return _json_records(data)


def get_all_areas():
    return sorted(traffic_data["Area Name"].dropna().unique().tolist()) if "Area Name" in traffic_data else []


def get_roads_by_area(area):
    if traffic_data.empty:
        return []
    return sorted(traffic_data.loc[traffic_data["Area Name"] == area, "Road/Intersection Name"].dropna().unique().tolist())


def get_map_data():
    """Dataset-derived traffic markers. Area coordinates are a documented map fallback."""
    if traffic_data.empty:
        return {"markers": [], "message": "No traffic dataset is available."}
    grouped = traffic_data.groupby("Area Name", as_index=False).agg(
        vehicle_count=("Vehicle_Count", "mean"), average_speed=("Traffic_Speed_kmh", "mean"),
        traffic_condition=("Traffic_Condition", lambda values: values.mode().iat[0]),
        weather=("Weather_Condition", lambda values: values.mode().iat[0]),
    )
    markers = []
    for _, row in grouped.iterrows():
        point = locations.get(str(row["Area Name"]))
        if point:
            markers.append({"area": str(row["Area Name"]), "latitude": point["lat"], "longitude": point["lng"], "vehicle_count": round(float(row.vehicle_count), 1), "average_speed": round(float(row.average_speed), 1), "traffic_condition": str(row.traffic_condition), "weather": str(row.weather)})
    return {"markers": markers, "message": "Markers use area-centre coordinates; traffic values are aggregated from the supplied dataset."}


def get_prediction_options():
    return {
        "areas": get_all_areas(),
        "weather": sorted(traffic_data["Weather_Condition"].dropna().astype(str).unique().tolist()) if "Weather_Condition" in traffic_data else [],
        "default_vehicle_count": round(float(traffic_data["Vehicle_Count"].median()), 0) if "Vehicle_Count" in traffic_data else 0,
    }
