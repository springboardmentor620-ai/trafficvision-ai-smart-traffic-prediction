"""Dataset-driven location lookups with Bengaluru-compatible fallbacks."""
from pathlib import Path

import pandas as pd

BASE_DIR = Path(__file__).resolve().parent.parent.parent
DATASET_PATHS = (BASE_DIR / "dataset" / "processed_traffic_data.csv", BASE_DIR / "dataset" / "traffic_dataset.csv")
COLUMN_ALIASES = {
    "country": ("country", "country name"),
    "state": ("state", "state/province", "province", "state name"),
    "city": ("city", "city/area", "area", "area name"),
    "road": ("road", "road name", "road/intersection name"),
}


def _dataset() -> pd.DataFrame:
    for path in DATASET_PATHS:
        if path.exists():
            return pd.read_csv(path)
    return pd.DataFrame()


def _column(data: pd.DataFrame, key: str) -> str | None:
    normalized = {str(column).strip().lower(): column for column in data.columns}
    return next((normalized[name] for name in COLUMN_ALIASES[key] if name in normalized), None)


def _values(data: pd.DataFrame, key: str, **filters: str) -> list[str]:
    column = _column(data, key)
    if not column:
        return []
    for filter_key, value in filters.items():
        filter_column = _column(data, filter_key)
        if filter_column and value:
            data = data[data[filter_column].astype(str).str.casefold() == value.casefold()]
    return sorted(data[column].dropna().astype(str).str.strip().loc[lambda values: values.ne("")].unique().tolist())


def countries() -> list[str]: return _values(_dataset(), "country")
def states(country: str) -> list[str]: return _values(_dataset(), "state", country=country)
def cities(state: str) -> list[str]: return _values(_dataset(), "city", state=state)
def roads(city: str) -> list[str]: return _values(_dataset(), "road", city=city)
