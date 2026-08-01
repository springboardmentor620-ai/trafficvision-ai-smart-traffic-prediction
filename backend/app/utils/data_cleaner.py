import pandas as pd


def clean_dataframe(df: pd.DataFrame) -> pd.DataFrame:

    df.columns = df.columns.str.strip()

    df["date"] = pd.to_datetime(df["date"]).dt.date

    df["time"] = pd.to_datetime(
       df["time"],
       format="%H:%M"
    ).dt.time

    df["is_weekend"] = df["is_weekend"].astype(bool)

    df["is_peak_hour"] = df["is_peak_hour"].astype(bool)

    df["traffic_signal"] = df["traffic_signal"].astype(bool)

    df["festival"] = df["festival"].fillna("None")

    df = df.drop_duplicates(subset=["accident_id"])

    return df