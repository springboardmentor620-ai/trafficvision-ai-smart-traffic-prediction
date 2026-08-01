import os
import sys

import pandas as pd
from sqlalchemy import text

sys.path.append(
    os.path.abspath(
        os.path.join(
            os.path.dirname(__file__),
            ".."
        )
    )
)

from app.db.database import SessionLocal
from app.models.accident import Accident
from app.utils.data_cleaner import clean_dataframe

DATASET_PATH = os.path.abspath(
    os.path.join(
        os.path.dirname(__file__),
        "..",
        "..",
        "datasets",
        "indian_roads_dataset.csv"
    )
)


BATCH_SIZE = 1000


def main():

    print("=" * 60)
    print("TrafficVision AI Dataset Import")
    print("=" * 60)

    df = pd.read_csv(DATASET_PATH)

    print(f"Rows Found : {len(df)}")

    df = clean_dataframe(df)

    db = SessionLocal()

    try:

        db.execute(text("TRUNCATE TABLE accidents RESTART IDENTITY CASCADE;"))
        db.commit()

        inserted = 0

        for start in range(0, len(df), BATCH_SIZE):

            batch = df.iloc[start:start + BATCH_SIZE]

            records = []

            for row in batch.to_dict(orient="records"):

                records.append(
                    {
                        "accident_id": int(row["accident_id"]),
                        "city": row["city"],
                        "state": row["state"],
                        "latitude": float(row["latitude"]),
                        "longitude": float(row["longitude"]),
                        "date": row["date"],
                        "time": row["time"],
                        "hour": int(row["hour"]),
                        "day_of_week": row["day_of_week"],
                        "is_weekend": bool(row["is_weekend"]),
                        "road_type": row["road_type"],
                        "lanes": int(row["lanes"]),
                        "traffic_signal": bool(row["traffic_signal"]),
                        "weather": row["weather"],
                        "visibility": row["visibility"],
                        "temperature": float(row["temperature"]),
                        "traffic_density": row["traffic_density"],
                        "cause": row["cause"],
                        "accident_severity": row["accident_severity"],
                        "vehicles_involved": int(row["vehicles_involved"]),
                        "casualties": int(row["casualties"]),
                        "is_peak_hour": bool(row["is_peak_hour"]),
                        "festival": row["festival"],
                        "risk_score": float(row["risk_score"]),
                    }
                )

            db.bulk_insert_mappings(
                Accident,
                records
            )

            db.commit()

            inserted += len(records)

            print(f"Imported {inserted}/{len(df)}")

        print()
        print("=" * 60)
        print("Import Completed Successfully")
        print(f"Total Imported : {inserted}")
        print("=" * 60)

    except Exception as e:

        db.rollback()

        print(e)

    finally:

        db.close()


if __name__ == "__main__":
    main()