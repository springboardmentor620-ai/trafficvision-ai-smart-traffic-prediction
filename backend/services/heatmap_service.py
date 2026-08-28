from pathlib import Path

import pandas as pd
from services.location_service import locations as area_centres


BASE_DIR = Path(__file__).resolve().parent.parent.parent
DATASET_PATH = BASE_DIR / "dataset" / "traffic_Dataset.csv"
REQUIRED_COLUMNS = {"Area Name", "Road/Intersection Name", "Traffic Volume", "Average Speed"}
DENSITY_LEVELS = ("Low", "Medium", "High", "Critical")


def _density_from_volume(volume: float, thresholds: list[float]) -> str:
    """Classify traffic volume using data-derived quartile thresholds."""
    if volume <= thresholds[0]:
        return DENSITY_LEVELS[0]
    if volume <= thresholds[1]:
        return DENSITY_LEVELS[1]
    if volume <= thresholds[2]:
        return DENSITY_LEVELS[2]
    return DENSITY_LEVELS[3]


def _coordinate_columns(data: pd.DataFrame) -> tuple[str | None, str | None]:
    """Find coordinate columns without assuming a particular letter casing."""
    normalized = {column.lower().strip(): column for column in data.columns}
    return normalized.get("latitude"), normalized.get("longitude")


def get_heatmap_data() -> dict:
    """Aggregate the traffic dataset into density locations for the HeatMap page."""
    if not DATASET_PATH.exists():
        return {"has_geospatial_data": False, "locations": [], "density_summary": {}}

    data = pd.read_csv(DATASET_PATH)
    if data.empty or not REQUIRED_COLUMNS.issubset(data.columns):
        return {"has_geospatial_data": False, "locations": [], "density_summary": {}}

    data["Traffic Volume"] = pd.to_numeric(data["Traffic Volume"], errors="coerce")
    data["Average Speed"] = pd.to_numeric(data["Average Speed"], errors="coerce")
    data = data.dropna(subset=["Area Name", "Road/Intersection Name", "Traffic Volume", "Average Speed"])

    latitude_column, longitude_column = _coordinate_columns(data)
    has_geospatial_data = latitude_column is not None and longitude_column is not None
    aggregations = {
        "average_traffic_volume": ("Traffic Volume", "mean"),
        "average_speed": ("Average Speed", "mean"),
        "records": ("Traffic Volume", "size"),
    }
    if has_geospatial_data:
        data[latitude_column] = pd.to_numeric(data[latitude_column], errors="coerce")
        data[longitude_column] = pd.to_numeric(data[longitude_column], errors="coerce")
        data = data.dropna(subset=[latitude_column, longitude_column])
        aggregations["latitude"] = (latitude_column, "mean")
        aggregations["longitude"] = (longitude_column, "mean")

    grouped = data.groupby(["Area Name", "Road/Intersection Name"], as_index=False).agg(**aggregations)
    thresholds = grouped["average_traffic_volume"].quantile([0.25, 0.50, 0.75]).tolist()
    grouped["density"] = grouped["average_traffic_volume"].map(
        lambda volume: _density_from_volume(float(volume), thresholds)
    )
    grouped["density_rank"] = grouped["density"].map(
        {level: index for index, level in enumerate(DENSITY_LEVELS)}
    )
    grouped = grouped.sort_values(["density_rank", "average_traffic_volume"], ascending=[False, False])

    heatmap_locations = []
    for _, row in grouped.iterrows():
        location = {
            "area": str(row["Area Name"]),
            "road": str(row["Road/Intersection Name"]),
            "traffic_volume": round(float(row["average_traffic_volume"]), 1),
            "average_speed": round(float(row["average_speed"]), 1),
            "records": int(row["records"]),
            "density": str(row["density"]),
        }
        if has_geospatial_data:
            location["latitude"] = round(float(row["latitude"]), 6)
            location["longitude"] = round(float(row["longitude"]), 6)
        elif str(row["Area Name"]) in area_centres:
            centre = area_centres[str(row["Area Name"])]
            location["latitude"] = centre["lat"]
            location["longitude"] = centre["lng"]
        heatmap_locations.append(location)

    counts = grouped["density"].value_counts()
    return {
        "has_geospatial_data": has_geospatial_data or any("latitude" in item for item in heatmap_locations),
        "message": (
            "Marker coordinates are available from the dataset."
            if has_geospatial_data else "Markers use known area-centre coordinates because the supplied dataset has no latitude/longitude columns."
        ),
        "required_geospatial_fields": [] if has_geospatial_data else ["Latitude", "Longitude"],
        "density_summary": {level: int(counts.get(level, 0)) for level in DENSITY_LEVELS},
        "locations": heatmap_locations,
    }
