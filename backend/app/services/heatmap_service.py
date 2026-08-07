import os
import pandas as pd
import random

current_dir = os.path.dirname(__file__)

dataset_path = os.path.join(
    current_dir,
    "..",
    "..",
    "data",
    "Banglore_traffic_Dataset.csv"
)

traffic_df = pd.read_csv(dataset_path)

AREA_COORDINATES = {
    "Electronic City": (12.8399, 77.6770),
    "Hebbal": (13.0358, 77.5970),
    "Whitefield": (12.9698, 77.7500),
    "Koramangala": (12.9352, 77.6245),
    "Jayanagar": (12.9293, 77.5828),
    "Indiranagar": (12.9784, 77.6408),
    "M.G. Road": (12.9756, 77.6066),
    "Yeshwanthpur": (13.0285, 77.5400)
}


def get_heatmap_data():

    locations = []

    for area in AREA_COORDINATES.keys():

        area_rows = traffic_df[
            traffic_df["Area Name"] == area
        ]

        if area_rows.empty:
            continue

        row = area_rows.sample(1).iloc[0]

        congestion = float(row["Congestion Level"])

        lat, lng = AREA_COORDINATES[area]

        locations.append({

            "area": area,

            "lat": lat,

            "lng": lng,

            "congestion": round(congestion, 2),

            "traffic_volume": int(row["Traffic Volume"]),

            "average_speed": round(
                float(row["Average Speed"]), 2
            ),

            "weather": row["Weather Conditions"]

        })

    return locations