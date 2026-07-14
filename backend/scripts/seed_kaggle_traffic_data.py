"""
Seeds real Kaggle traffic data into your TrafficVision AI backend.

Dataset: "Traffic Prediction Dataset" by fedesoriano
https://www.kaggle.com/datasets/fedesoriano/traffic-prediction-dataset

Setup:
    1. Download traffic.csv from the link above
    2. Place it at: backend/data/traffic.csv
    3. Make sure your backend is running (uvicorn app.main:app --reload)
    4. Make sure you have an admin account registered already
    5. Run:  python scripts/seed_kaggle_traffic_data.py

This script does NOT touch your database directly — it calls your real
API endpoints (POST /traffic/monitoring/roads, POST /traffic/monitoring/readings),
exactly like the frontend does. That way you're testing the exact same
code path your dashboard uses.
"""

import sys
import time
import pandas as pd
import requests

# ---------------------------------------------------------------------------
# CONFIG — edit these before running
# ---------------------------------------------------------------------------
BACKEND_URL = "http://localhost:8000"
ADMIN_EMAIL = "admin123@gmail.com"       # <-- change to YOUR real admin email
ADMIN_PASSWORD = "123456"       # <-- change to YOUR real admin password
CSV_PATH = "data/traffic.csv"
READINGS_PER_JUNCTION = 30            # how many historical readings to load per road
# ---------------------------------------------------------------------------


def login(email: str, password: str) -> str:
    resp = requests.post(
        f"{BACKEND_URL}/auth/login",
        data={"username": email, "password": password},
    )
    if resp.status_code != 200:
        print(f"Login failed ({resp.status_code}): {resp.text}")
        print("Make sure ADMIN_EMAIL / ADMIN_PASSWORD match a real admin account,")
        print("and that your backend is running at", BACKEND_URL)
        sys.exit(1)
    return resp.json()["access_token"]


def load_dataset(path: str) -> pd.DataFrame:
    try:
        df = pd.read_csv(path)
    except FileNotFoundError:
        print(f"Couldn't find {path}.")
        print("Download it from https://www.kaggle.com/datasets/fedesoriano/traffic-prediction-dataset")
        print("and place it at backend/data/traffic.csv")
        sys.exit(1)

    print("Columns found in CSV:", list(df.columns))
    required = {"Junction", "Vehicles"}
    if not required.issubset(df.columns):
        print(f"Expected columns {required} not found — the dataset format may have changed.")
        print("Open the CSV and check the real column names, then adjust this script.")
        sys.exit(1)
    return df


def create_road(token: str, name: str, capacity: int) -> int:
    resp = requests.post(
        f"{BACKEND_URL}/traffic/monitoring/roads",
        headers={"Authorization": f"Bearer {token}"},
        json={"name": name, "zone": "Kaggle dataset", "capacity": capacity},
    )
    if resp.status_code != 201:
        print(f"Failed to create road '{name}': {resp.status_code} {resp.text}")
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

    junctions = sorted(df["Junction"].unique())
    print(f"Found junctions: {junctions}")

    for junction_id in junctions:
        junction_df = df[df["Junction"] == junction_id]
        max_vehicles = int(junction_df["Vehicles"].max())
        # Set capacity a bit above the observed max so we still see the
        # full range of congestion levels (low -> severe) in the data.
        capacity = int(max_vehicles * 1.15)

        road_name = f"Junction {junction_id}"
        print(f"\nCreating road '{road_name}' (capacity={capacity})...")
        road_id = create_road(token, road_name, capacity)

        # Take the most recent N readings for this junction so the dashboard
        # has a realistic recent history, not the entire multi-year dataset.
        recent = junction_df.tail(READINGS_PER_JUNCTION)
        print(f"Submitting {len(recent)} readings for {road_name}...")
        for _, row in recent.iterrows():
            submit_reading(token, road_id, row["Vehicles"])
            time.sleep(0.05)  # small delay so timestamps/order stay sane

    print("\nDone. Open your dashboard — the roads and live data should now be populated.")


if __name__ == "__main__":
    main()
