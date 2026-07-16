import pandas as pd
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.models.traffic_dataset import TrafficDataset


CSV_FILE = "imports/Metro_Interstate_Traffic_Volume.csv"


def import_data():
    db: Session = SessionLocal()

    # Remove old data (optional)
    db.query(TrafficDataset).delete()
    db.commit()

    df = pd.read_csv(CSV_FILE)

    # Convert date column
    df["date_time"] = pd.to_datetime(df["date_time"])

    records = []

    for _, row in df.iterrows():
        records.append(
            TrafficDataset(
                holiday=row["holiday"],
                temp=float(row["temp"]),
                rain_1h=float(row["rain_1h"]),
                snow_1h=float(row["snow_1h"]),
                clouds_all=int(row["clouds_all"]),
                weather_main=row["weather_main"],
                weather_description=row["weather_description"],
                date_time=row["date_time"],
                traffic_volume=int(row["traffic_volume"])
            )
        )

    db.bulk_save_objects(records)
    db.commit()
    db.close()

    print(f"Imported {len(records)} records successfully!")


if __name__ == "__main__":
    import_data()