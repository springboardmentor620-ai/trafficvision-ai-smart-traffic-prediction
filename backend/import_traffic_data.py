"""
One-time import of the TrafficVisionAI traffic dataset into traffic_data.

Safety:
- Does NOT create or modify the database schema.
- Does NOT modify or retrain the ML model.
- Refuses to import if traffic_data already contains records.
"""

from pathlib import Path

import pandas as pd
from sqlalchemy import func
from sqlalchemy.orm import Session

from database import SessionLocal
from models.traffic import Traffic


BASE_DIR = Path(__file__).resolve().parent
DATA_FILE = BASE_DIR / "data" / "traffic_data.csv"

REQUIRED_COLUMNS = [
    "DateTime",
    "Latitude",
    "Longitude",
    "Vehicle_Count",
    "Speed",
    "Congestion_Level",
    "Weather",
    "Road_Name",
    "Traffic_Signal",
    "Accident",
]


def clean_dataset(df: pd.DataFrame) -> pd.DataFrame:
    missing = [column for column in REQUIRED_COLUMNS if column not in df.columns]

    if missing:
        raise ValueError(
            f"Dataset is missing required columns: {', '.join(missing)}"
        )

    df = df[REQUIRED_COLUMNS].copy()

    # Convert datetime
    df["DateTime"] = pd.to_datetime(
        df["DateTime"],
        errors="coerce"
    )

    # Convert numeric columns
    numeric_columns = [
        "Latitude",
        "Longitude",
        "Vehicle_Count",
        "Speed",
    ]

    for column in numeric_columns:
        df[column] = pd.to_numeric(
            df[column],
            errors="coerce"
        )

    # Convert text columns
    text_columns = [
        "Congestion_Level",
        "Weather",
        "Road_Name",
        "Traffic_Signal",
        "Accident",
    ]

    for column in text_columns:
        df[column] = (
            df[column]
            .fillna("")
            .astype(str)
            .str.strip()
        )

    # Remove rows that cannot be inserted safely
    df = df.dropna(
        subset=[
            "DateTime",
            "Latitude",
            "Longitude",
            "Vehicle_Count",
            "Speed",
        ]
    )

    # Remove impossible coordinates
    df = df[
        df["Latitude"].between(-90, 90)
        & df["Longitude"].between(-180, 180)
    ]

    return df


def main():
    print("=" * 70)
    print("TrafficVisionAI - Traffic Data Import")
    print("=" * 70)

    if not DATA_FILE.exists():
        raise FileNotFoundError(
            f"Dataset not found:\n{DATA_FILE}\n\n"
            "Place traffic_data.csv inside backend/data/"
        )

    print(f"Dataset: {DATA_FILE}")

    df = pd.read_csv(DATA_FILE)

    print(f"Rows read from CSV: {len(df):,}")

    df = clean_dataset(df)

    print(f"Valid rows after cleaning: {len(df):,}")

    db: Session = SessionLocal()

    try:
        existing_count = db.query(func.count(Traffic.id)).scalar() or 0

        print(f"Existing traffic_data records: {existing_count:,}")

        if existing_count > 0:
            raise RuntimeError(
                "traffic_data already contains records. "
                "Import stopped to prevent duplicate data."
            )

        records = []

        for row in df.itertuples(index=False):
            records.append(
                Traffic(
                    datetime=row.DateTime.to_pydatetime(),
                    latitude=float(row.Latitude),
                    longitude=float(row.Longitude),
                    vehicle_count=int(row.Vehicle_Count),
                    speed=float(row.Speed),
                    congestion_level=row.Congestion_Level,
                    weather=row.Weather,
                    road_name=row.Road_Name,
                    traffic_signal=row.Traffic_Signal,
                    accident=row.Accident,
                )
            )

        print("Preparing database insert...")

        batch_size = 1000

        for start in range(0, len(records), batch_size):
            batch = records[start:start + batch_size]

            db.bulk_save_objects(batch)
            db.commit()

            completed = min(
                start + batch_size,
                len(records)
            )

            print(
                f"Inserted {completed:,} / {len(records):,}"
            )

        final_count = db.query(func.count(Traffic.id)).scalar() or 0

        print()
        print("=" * 70)
        print("IMPORT COMPLETED SUCCESSFULLY")
        print("=" * 70)
        print(f"Records now in traffic_data: {final_count:,}")

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()


if __name__ == "__main__":
    main()
