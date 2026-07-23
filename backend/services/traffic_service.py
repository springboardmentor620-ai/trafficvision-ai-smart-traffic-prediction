import pandas as pd
from pathlib import Path

# Dataset Path
BASE_DIR = Path(__file__).resolve().parent.parent.parent
DATASET_PATH = BASE_DIR / "dataset" / "traffic_dataset.csv"

# Load Dataset
try:
    traffic_data = pd.read_csv(DATASET_PATH)
    print(" Dataset Loaded Successfully")
except Exception as e:
    print(" Error loading dataset:", e)
    traffic_data = pd.DataFrame()


def get_all_traffic():
    """
    Return all traffic records
    """
    if traffic_data.empty:
        return []

    return traffic_data.to_dict(orient="records")


def get_statistics():
    """
    Return dashboard statistics
    """

    if traffic_data.empty:
        return {
            "total_records": 0,
            "average_vehicle_count": 0,
            "average_speed": 0,
            "traffic_condition": "No Data",
            "weather": "No Data"
        }

    return {
        "total_records": int(len(traffic_data)),
        "average_vehicle_count": round(
            float(traffic_data["Vehicle_Count"].mean()), 2
        ),
        "average_speed": round(
            float(traffic_data["Traffic_Speed_kmh"].mean()), 2
        ),
        "traffic_condition": str(
            traffic_data["Traffic_Condition"].mode()[0]
        ),
        "weather": str(
            traffic_data["Weather_Condition"].mode()[0]
        )
    }


def search_traffic(weather="", condition=""):
    """
    Search traffic records by weather and traffic condition
    """

    if traffic_data.empty:
        return []

    filtered = traffic_data.copy()

    # Filter by Weather
    if weather:
        filtered = filtered[
            filtered["Weather_Condition"].astype(str).str.contains(
                weather,
                case=False,
                na=False
            )
        ]

    # Filter by Traffic Condition
    if condition:
        filtered = filtered[
            filtered["Traffic_Condition"].astype(str).str.contains(
                condition,
                case=False,
                na=False
            )
        ]

    return filtered.to_dict(orient="records")