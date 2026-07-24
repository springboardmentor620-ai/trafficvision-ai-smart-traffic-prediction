"""
Seeds the Metro Interstate Traffic Volume dataset into your backend.
https://www.kaggle.com/datasets/pooriamst/metro-interstate-traffic-volume

This dataset is different from the earlier "Traffic Prediction Dataset":
it's ONE location (I-94 near Minneapolis/St Paul) with years of hourly
data plus weather features (temp, rain, snow, clouds, holiday). It adds
ONE new road to your dashboard — it doesn't replace your existing roads.

Setup:
    1. Download the CSV from the link above
    2. Save it as: backend/data/metro_traffic.csv
    3. Make sure your backend is running
    4. Run:  python scripts/seed_metro_interstate_data.py
"""

import sys
import time
import pandas as pd
import requests

# ---------------------------------------------------------------------------
# CONFIG — edit these before running
# ---------------------------------------------------------------------------
BACKEND_URL = "http://localhost:8000"
ADMIN_EMAIL = "admin123@gmail.com"        # <-- change to YOUR real admin email
ADMIN_PASSWORD = "123456"        # <-- change to YOUR real admin password
CSV_PATH = "data/metro_traffic.csv"
ROAD_NAME = "I-94 Interstate"
ROAD_ZONE = "Minneapolis-St Paul, MN"
READINGS_TO_LOAD = 50                  # most recent N hourly readings to import
# ---------------------------------------------------------------------------


def login(email: str, password: str) -> str:
    resp = requests.post(
        f"{BACKEND_URL}/auth/login",
        data={"username": email, "password": password},
    )
    if resp.status_code != 200:
        print(f"Login failed ({resp.status_code}): {resp.text}")
        sys.exit(1)
    return resp.json()["access_token"]


def load_dataset(path: str) -> pd.DataFrame:
    try:
        df = pd.read_csv(path)
    except FileNotFoundError:
        print(f"Couldn't find {path}.")
        print("Download it from https://www.kaggle.com/datasets/pooriamst/metro-interstate-traffic-volume")
        print("and save it at backend/data/metro_traffic.csv")
        sys.exit(1)

    print("Columns found in CSV:", list(df.columns))
    required = {"date_time", "traffic_volume"}
    if not required.issubset(df.columns):
        print(f"Expected columns {required} not found — check the actual column names in your CSV")
        print("and adjust CSV_PATH / column names in this script if they differ.")
        sys.exit(1)
    return df


def create_road(token: str, name: str, zone: str, capacity: int) -> int:
    resp = requests.post(
        f"{BACKEND_URL}/traffic/monitoring/roads",
        headers={"Authorization": f"Bearer {token}"},
        json={"name": name, "zone": zone, "capacity": capacity},
    )
    if resp.status_code != 201:
        print(f"Failed to create road: {resp.status_code} {resp.text}")
        sys.exit(1)
    return resp.json()["id"]


def submit_reading(token: str, road_id: int, vehicle_count: int):
    resp = requests.post(
        f"{BACKEND_URL}/traffic/monitoring/readings",
        headers={"Authorization": f"Bearer {token}"},
        json={"road_id": road_id, "vehicle_count": int(vehicle_count)},
    )
    if resp.status_code != 201:
        print(f"Failed to submit reading: {resp.status_code} {resp.text}")


def main():
    print("Logging in as admin...")
    token = login(ADMIN_EMAIL, ADMIN_PASSWORD)

    print(f"Loading dataset from {CSV_PATH}...")
    df = load_dataset(CSV_PATH)

    max_volume = int(df["traffic_volume"].max())
    capacity = int(max_volume * 1.15)
    print(f"Dataset max traffic_volume: {max_volume} -> setting road capacity to {capacity}")

    print(f"\nCreating road '{ROAD_NAME}'...")
    road_id = create_road(token, ROAD_NAME, ROAD_ZONE, capacity)

    # Most recent N hourly readings, so the dashboard shows a realistic
    # recent window instead of the entire multi-year dataset.
    recent = df.tail(READINGS_TO_LOAD)
    print(f"Submitting {len(recent)} readings for {ROAD_NAME}...")
    for _, row in recent.iterrows():
        submit_reading(token, road_id, row["traffic_volume"])
        time.sleep(0.05)

    print(f"\nDone. '{ROAD_NAME}' should now appear on your dashboard with real hourly traffic data.")
    print("Note: this dataset also has weather columns (temp, rain_1h, snow_1h, clouds_all, holiday)")
    print("which aren't loaded yet — those will be used when we build the prediction model next.")


if __name__ == "__main__":
    main()
