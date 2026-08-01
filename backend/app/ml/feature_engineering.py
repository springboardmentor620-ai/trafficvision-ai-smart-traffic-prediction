from sklearn.preprocessing import LabelEncoder


def encode_dataframe(df):

    df = df.copy()

    encoders = {}

    categorical_columns = [
        "city",
        "state",
        "day_of_week",
        "road_type",
        "weather",
        "visibility",
        "traffic_density",
        "cause",
        "festival",
        "accident_severity"
    ]

    for column in categorical_columns:

        encoder = LabelEncoder()

        df[column] = encoder.fit_transform(df[column].astype(str))

        encoders[column] = encoder

    return df, encoders