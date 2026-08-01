import pandas as pd


DATASET_PATH = "../datasets/indian_roads_dataset.csv"


def load_dataset():

    df = pd.read_csv(DATASET_PATH)

    return df


def preprocess(df):

    df = df.copy()

    df["date"] = pd.to_datetime(df["date"])

    df["month"] = df["date"].dt.month

    df["year"] = df["date"].dt.year

    df["day"] = df["date"].dt.day

    df = df.drop(
        columns=[
            "date",
            "time",
            "accident_id"
        ]
    )

    return df