import pandas as pd

from database import SessionLocal
from models.traffic import Traffic


df = pd.read_csv("traffic.csv")


db = SessionLocal()


for index, row in df.iterrows():

    traffic = Traffic(

        location=str(row["Junction"]),

        vehicle_count=int(row["Vehicles"]),

        congestion_level="Medium",

        road_status="Normal"

    )

    db.add(traffic)


db.commit()

db.close()


print("Traffic data inserted successfully")
