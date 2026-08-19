"""
Ingests the Bangalore City Traffic dataset (Kaggle) into TrafficVision AI's
PostgreSQL database, replacing synthetic/random traffic data with real
historical readings.

Dataset: https://www.kaggle.com/datasets/preethamgouda/banglore-city-traffic-dataset

Pipeline:
    CSV -> validate -> clean/normalize -> derive road capacity ->
    normalize congestion -> upsert roads -> batch-insert readings -> log summary

Usage (from the backend/ folder, with your venv active):
    python scripts/seed_bangalore_data.py --csv data/bangalore_traffic.csv

Safe to re-run: roads are matched by (name, zone) and never duplicated or
have their capacity overwritten after first creation. Readings are matched
by (road_id, recorded_at) and skipped if already present.
"""

import argparse
import sys
from datetime import time
from pathlib import Path

import pandas as pd

# Allows running this script directly (python scripts/seed_bangalore_data.py)
# from the backend/ folder while still importing the `app` package.
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.database import SessionLocal, Base, engine  # noqa: E402
from app.modules.traffic_monitoring.models import Road, TrafficReading, CongestionLevel  # noqa: E402
from app.modules.traffic_monitoring.services import (  # noqa: E402
    calculate_congestion_level,
    normalize_congestion_percentage,
)

# ---------------------------------------------------------------------------
# Column mapping — explicit, per the migration plan. Keys are normalized
# (lowercased, stripped) so minor header variations in the real CSV still
# match; if a REQUIRED column truly can't be found, the script stops with a
# clear error rather than silently proceeding with missing data.
# ---------------------------------------------------------------------------
COLUMN_MAP = {
    "date": "date",
    "area name": "zone",
    "road/intersection name": "road_name",
    "traffic volume": "vehicle_count",
    "average speed": "avg_speed_kmph",
    "travel time index": "travel_time_index",
    "congestion level": "congestion_percentage",
    "road capacity utilization": "road_capacity_utilization",
    "incident reports": "incident_reports",
    "environmental impact": "environmental_impact",
    "public transport usage": "public_transport_usage",
    "traffic signal compliance": "traffic_signal_compliance",
    "parking usage": "parking_usage",
    "pedestrian/cyclist count": "pedestrian_count",
    "weather conditions": "weather_condition",
    "roadwork and construction activity": "roadwork",
}

REQUIRED_COLUMNS = {"date", "road_name", "zone", "vehicle_count"}
DEFAULT_CAPACITY_FALLBACK = 1000  # used only if a road has no rows with valid utilization data


def load_and_map_columns(csv_path: str) -> pd.DataFrame:
    df = pd.read_csv(csv_path)
    normalized_headers = {col: col.strip().lower() for col in df.columns}
    df = df.rename(columns=normalized_headers)

    rename_map = {}
    found_internal_keys = set()
    for raw_key, internal_key in COLUMN_MAP.items():
        if raw_key in df.columns:
            rename_map[raw_key] = internal_key
            found_internal_keys.add(internal_key)
    df = df.rename(columns=rename_map)

    missing_required = REQUIRED_COLUMNS - found_internal_keys
    if missing_required:
        print(f"ERROR: Required columns not found in CSV: {missing_required}")
        print(f"Columns found in CSV: {list(df.columns)}")
        print("Check the actual CSV headers and update COLUMN_MAP in this script if they differ.")
        sys.exit(1)

    return df


def clean_and_validate(df: pd.DataFrame) -> tuple[pd.DataFrame, dict]:
    """
    Validates and cleans the raw dataframe. Returns the cleaned dataframe
    (only rows that pass required-field validation) plus a stats dict for
    the ingestion summary log. Does not silently drop bad rows without
    counting them.
    """
    stats = {
        "rows_read": len(df),
        "missing_road_name": 0,
        "missing_zone": 0,
        "invalid_date": 0,
        "invalid_or_negative_volume": 0,
        "out_of_range_congestion_clipped": 0,
        "out_of_range_utilization_clipped": 0,
    }

    df = df.copy()

    # Required string fields — check isna() BEFORE string conversion, since
    # .astype(str) doesn't reliably turn actual NaN into the string "nan"
    # across pandas versions/dtypes; checking isna() first is the robust way.
    missing_name_mask = df["road_name"].isna() | (df["road_name"].astype(str).str.strip() == "")
    missing_zone_mask = df["zone"].isna() | (df["zone"].astype(str).str.strip() == "")
    stats["missing_road_name"] = int(missing_name_mask.sum())
    stats["missing_zone"] = int(missing_zone_mask.sum())
    df = df[~missing_name_mask & ~missing_zone_mask].copy()
    df["road_name"] = df["road_name"].astype(str).str.strip()
    df["zone"] = df["zone"].astype(str).str.strip()

    # Date
    df["date"] = pd.to_datetime(df["date"], errors="coerce")
    invalid_date_mask = df["date"].isna()
    stats["invalid_date"] = int(invalid_date_mask.sum())
    df = df[~invalid_date_mask]

    # Traffic volume: required, must be a positive number
    df["vehicle_count"] = pd.to_numeric(df["vehicle_count"], errors="coerce")
    invalid_volume_mask = df["vehicle_count"].isna() | (df["vehicle_count"] < 0)
    stats["invalid_or_negative_volume"] = int(invalid_volume_mask.sum())
    df = df[~invalid_volume_mask]
    df["vehicle_count"] = df["vehicle_count"].round().astype(int)

    # Optional numeric fields: coerce to numeric, leave NaN (-> null) where invalid
    for col in [
        "avg_speed_kmph", "travel_time_index", "congestion_percentage",
        "road_capacity_utilization", "incident_reports", "environmental_impact",
        "public_transport_usage", "traffic_signal_compliance", "parking_usage",
        "pedestrian_count",
    ]:
        if col in df.columns:
            df[col] = pd.to_numeric(df[col], errors="coerce")

    # Congestion percentage and utilization are conceptually 0-100 — clip
    # rather than drop, since an out-of-range value on one field shouldn't
    # discard an otherwise valid row.
    if "congestion_percentage" in df.columns:
        out_of_range = ((df["congestion_percentage"] < 0) | (df["congestion_percentage"] > 100)) & df["congestion_percentage"].notna()
        stats["out_of_range_congestion_clipped"] = int(out_of_range.sum())
        df["congestion_percentage"] = df["congestion_percentage"].clip(0, 100)

    if "road_capacity_utilization" in df.columns:
        out_of_range_u = ((df["road_capacity_utilization"] < 0) | (df["road_capacity_utilization"] > 100)) & df["road_capacity_utilization"].notna()
        stats["out_of_range_utilization_clipped"] = int(out_of_range_u.sum())
        df["road_capacity_utilization"] = df["road_capacity_utilization"].clip(0, 100)

    # Roadwork: "Yes"/"No" -> bool, anything else -> null (not fatal)
    if "roadwork" in df.columns:
        df["roadwork"] = df["roadwork"].astype(str).str.strip().str.lower().map({"yes": True, "no": False})

    stats["rows_after_cleaning"] = len(df)
    return df, stats


def apply_synthetic_time_if_needed(df: pd.DataFrame) -> pd.DataFrame:
    """
    If the dataset only provides dates (no time component — every parsed
    timestamp lands exactly on midnight), we document and apply a synthetic
    time so multiple readings per road per day remain distinguishable and
    chronologically ordered, which matters for the prediction model's
    time-based features. If the dataset DOES include real times, they are
    left untouched.
    """
    all_midnight = (df["date"].dt.time == time(0, 0)).all()
    if not all_midnight:
        return df  # real times present — trust them as-is

    print("NOTE: Dataset appears to be date-only (no time component).")
    print("Assigning synthetic hourly time-of-day per road/day, spaced by row order,")
    print("so multiple same-day readings for a road remain distinguishable. This is")
    print("a documented assumption, not real data.")

    df = df.sort_values(["road_name", "zone", "date"]).copy()
    df["_row_order"] = df.groupby(["road_name", "zone", df["date"].dt.date]).cumcount()
    df["date"] = df["date"] + pd.to_timedelta((df["_row_order"] % 24), unit="h")
    df = df.drop(columns=["_row_order"])
    return df


def derive_road_capacities(df: pd.DataFrame) -> dict:
    """
    For each (road_name, zone) group, computes:
        estimated_capacity = traffic_volume / (utilization / 100)
    for every row with valid (>0) utilization and volume, then takes the
    MEDIAN across the group for robustness against outlier rows. Falls back
    to DEFAULT_CAPACITY_FALLBACK if a road has no rows with usable
    utilization data.
    """
    capacities = {}
    has_utilization = "road_capacity_utilization" in df.columns

    for (road_name, zone), group in df.groupby(["road_name", "zone"]):
        if has_utilization:
            valid = group[(group["road_capacity_utilization"] > 0) & (group["vehicle_count"] > 0)]
        else:
            valid = group.iloc[0:0]

        if valid.empty:
            capacities[(road_name, zone)] = DEFAULT_CAPACITY_FALLBACK
        else:
            estimates = valid["vehicle_count"] / (valid["road_capacity_utilization"] / 100)
            capacities[(road_name, zone)] = int(round(estimates.median()))

    return capacities


def upsert_roads(db, df: pd.DataFrame, capacities: dict) -> dict:
    """
    Creates any roads that don't already exist (matched by name+zone),
    using the derived capacity computed once here. Existing roads are
    reused as-is — their capacity is never overwritten by this script,
    per the requirement that capacity stays stable after first creation.
    Returns a dict mapping (road_name, zone) -> road_id.
    """
    road_id_by_key = {}
    roads_created = 0

    existing_roads = {(r.name, r.zone): r for r in db.query(Road).all()}

    for (road_name, zone), _ in df.groupby(["road_name", "zone"]):
        key = (road_name, zone)
        if key in existing_roads:
            road_id_by_key[key] = existing_roads[key].id
            continue

        capacity = capacities.get(key, DEFAULT_CAPACITY_FALLBACK)
        # Coordinates are intentionally left null — this dataset doesn't
        # include lat/lng, and fabricating fake coordinates would be
        # misleading on the Live Map. These roads simply won't appear on
        # the map until real coordinates are added separately.
        road = Road(name=road_name, zone=zone, capacity=capacity, latitude=None, longitude=None)
        db.add(road)
        db.flush()  # assigns road.id without a full commit
        road_id_by_key[key] = road.id
        existing_roads[key] = road
        roads_created += 1

    db.commit()
    return road_id_by_key, roads_created


def insert_readings(db, df: pd.DataFrame, road_id_by_key: dict) -> dict:
    """
    Batch-inserts TrafficReading rows, skipping any (road_id, recorded_at)
    pair that already exists so re-running this script is safe.
    """
    existing_keys = {(r.road_id, r.recorded_at) for r in db.query(TrafficReading.road_id, TrafficReading.recorded_at).all()}
    roads_by_id = {r.id: r for r in db.query(Road).all()}

    new_readings = []
    duplicates_skipped = 0
    fallback_congestion_count = 0
    seen_this_run = set()

    for _, row in df.iterrows():
        road_id = road_id_by_key[(row["road_name"], row["zone"])]
        recorded_at = row["date"].to_pydatetime()
        dedup_key = (road_id, recorded_at)

        if dedup_key in existing_keys or dedup_key in seen_this_run:
            duplicates_skipped += 1
            continue
        seen_this_run.add(dedup_key)

        congestion_pct = row.get("congestion_percentage")
        if pd.notna(congestion_pct):
            level = normalize_congestion_percentage(float(congestion_pct))
        else:
            # Fallback: dataset's own congestion value missing for this row —
            # derive it the same way live readings do, using the road's
            # now-established capacity, rather than dropping the row.
            road = roads_by_id[road_id]
            level = calculate_congestion_level(int(row["vehicle_count"]), road.capacity)
            fallback_congestion_count += 1

        def _clean(val):
            return None if pd.isna(val) else val

        reading = TrafficReading(
            road_id=road_id,
            vehicle_count=int(row["vehicle_count"]),
            avg_speed_kmph=_clean(row.get("avg_speed_kmph")),
            congestion_level=level,
            recorded_at=recorded_at,
            source_congestion_percentage=_clean(congestion_pct),
            travel_time_index=_clean(row.get("travel_time_index")),
            road_capacity_utilization=_clean(row.get("road_capacity_utilization")),
            incident_reports=_clean(row.get("incident_reports")),
            environmental_impact=_clean(row.get("environmental_impact")),
            public_transport_usage=_clean(row.get("public_transport_usage")),
            traffic_signal_compliance=_clean(row.get("traffic_signal_compliance")),
            parking_usage=_clean(row.get("parking_usage")),
            pedestrian_count=_clean(row.get("pedestrian_count")),
            weather_condition=_clean(row.get("weather_condition")),
            roadwork=_clean(row.get("roadwork")),
        )
        new_readings.append(reading)

    # Batch insert in chunks rather than one commit per row.
    CHUNK_SIZE = 500
    for i in range(0, len(new_readings), CHUNK_SIZE):
        db.add_all(new_readings[i:i + CHUNK_SIZE])
        db.commit()

    return {
        "readings_created": len(new_readings),
        "duplicate_readings_skipped": duplicates_skipped,
        "fallback_congestion_used": fallback_congestion_count,
    }


def main():
    parser = argparse.ArgumentParser(description="Ingest the Bangalore traffic dataset into TrafficVision AI")
    parser.add_argument("--csv", default="data/bangalore_traffic.csv", help="Path to the dataset CSV")
    args = parser.parse_args()

    Base.metadata.create_all(bind=engine)

    print(f"Loading dataset from {args.csv}...")
    df = load_and_map_columns(args.csv)

    print("Validating and cleaning...")
    df, clean_stats = clean_and_validate(df)

    print("Checking time granularity...")
    df = apply_synthetic_time_if_needed(df)

    print("Deriving road capacities from traffic volume + utilization...")
    capacities = derive_road_capacities(df)

    db = SessionLocal()
    try:
        print("Upserting roads (no duplicates, capacity set once)...")
        road_id_by_key, roads_created = upsert_roads(db, df, capacities)

        print("Inserting traffic readings (batched, deduplicated)...")
        insert_stats = insert_readings(db, df, road_id_by_key)
    except Exception as e:
        db.rollback()
        print(f"ERROR during ingestion, rolled back: {e}")
        sys.exit(1)
    finally:
        db.close()

    print("\n" + "=" * 50)
    print("INGESTION SUMMARY")
    print("=" * 50)
    print(f"Rows read:                        {clean_stats['rows_read']}")
    print(f"  Missing road name:               {clean_stats['missing_road_name']}")
    print(f"  Missing zone:                    {clean_stats['missing_zone']}")
    print(f"  Invalid date:                    {clean_stats['invalid_date']}")
    print(f"  Invalid/negative volume:         {clean_stats['invalid_or_negative_volume']}")
    print(f"  Congestion values clipped:       {clean_stats['out_of_range_congestion_clipped']}")
    print(f"  Utilization values clipped:      {clean_stats['out_of_range_utilization_clipped']}")
    print(f"Rows after cleaning:               {clean_stats['rows_after_cleaning']}")
    print(f"Roads discovered/created:          {roads_created}")
    print(f"Traffic readings created:          {insert_stats['readings_created']}")
    print(f"Duplicate readings skipped:        {insert_stats['duplicate_readings_skipped']}")
    print(f"Rows using fallback congestion:    {insert_stats['fallback_congestion_used']}")
    print("=" * 50)
    print("Done.")


if __name__ == "__main__":
    main()