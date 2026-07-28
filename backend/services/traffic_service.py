import pandas as pd
from pathlib import Path

# Dataset Path
BASE_DIR = Path(__file__).resolve().parent.parent.parent
DATASET_PATH = BASE_DIR / "dataset" / "traffic_dataset.csv"

DATASET_COLUMN_MAP = {
    "Date": "Timestamp",
    "Traffic Volume": "Vehicle_Count",
    "Average Speed": "Traffic_Speed_kmh",
    "Congestion Level": "Traffic_Condition",
    "Weather Conditions": "Weather_Condition",
}


def normalize_traffic_condition(value):
    """Map the dataset's numeric congestion level to the existing UI labels."""
    try:
        congestion = float(value)
    except (TypeError, ValueError):
        return str(value)

    if congestion < 35:
        return "Low"
    if congestion < 70:
        return "Medium"
    return "High"

# Load Dataset
try:
    traffic_data = pd.read_csv(DATASET_PATH).rename(columns=DATASET_COLUMN_MAP)
    if "Traffic_Condition" in traffic_data.columns:
        traffic_data["Traffic_Condition"] = traffic_data["Traffic_Condition"].map(normalize_traffic_condition)
    print("Dataset Loaded Successfully")
except Exception as e:
    print("Error loading dataset:", e)
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

    if weather:
        filtered = filtered[
            filtered["Weather_Condition"].astype(str).str.contains(
                weather,
                case=False,
                na=False
            )
        ]

    if condition:
        filtered = filtered[
            filtered["Traffic_Condition"].astype(str).str.contains(
                condition,
                case=False,
                na=False
            )
        ]

    return filtered.to_dict(orient="records")


# ----------------------------------------
# NEW API
# Get All Areas
# ----------------------------------------

def get_all_areas():
    """
    Return all unique Area Names
    """

    if traffic_data.empty:
        return []

    if "Area Name" not in traffic_data.columns:
        return []

    areas = sorted(
        traffic_data["Area Name"]
        .dropna()
        .unique()
        .tolist()
    )

    return areas


# ----------------------------------------
# NEW API
# Get Roads by Area
# ----------------------------------------

def get_roads_by_area(area):
    """
    Return all roads available for the selected area
    """

    if traffic_data.empty:
        return []

    if (
        "Area Name" not in traffic_data.columns or
        "Road/Intersection Name" not in traffic_data.columns
    ):
        return []

    roads = (
        traffic_data[
            traffic_data["Area Name"] == area
        ]["Road/Intersection Name"]
        .dropna()
        .unique()
        .tolist()
    )

    roads.sort()

    return roads
