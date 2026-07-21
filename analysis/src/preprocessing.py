import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder
from sklearn.pipeline import Pipeline

class Preprocessing:

    def __init__(self, dataframe):
        self.df = dataframe.copy()
    
    def remove_unused_columns(self):

        columns = [
            "Date",
            "Weather Conditions",
            "Roadwork and Construction Activity"
        ]

        self.df = self.df.drop(columns=columns)

        return self.df
    
    def split_features_target(self):

        X = self.df.drop(columns=["Congestion Level"])

        y = self.df["Congestion Level"]

        return X, y
    
    def train_test(self, X, y):

        X_train, X_test, y_train, y_test = train_test_split(
            X,
            y,
            test_size=0.20,
            random_state=42
        )

        return X_train, X_test, y_train, y_test
    
    def create_preprocessor(self):

        categorical_features = [
            col for col in [
                "Area Name",
                "Road/Intersection Name",
                "Traffic Category"
            ]
            if col in self.df.columns
        ]

        numerical_features = [
            col for col in self.df.columns
            if col not in categorical_features + ["Congestion Level"]
        ]

        preprocessor = ColumnTransformer(
            transformers=[
                (
                    "cat",
                    OneHotEncoder(handle_unknown="ignore"),
                    categorical_features
                ),
                (
                    "num",
                    "passthrough",
                    numerical_features
                )
            ]
        )

        return preprocessor