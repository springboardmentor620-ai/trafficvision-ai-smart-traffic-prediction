import pandas as pd


class FeatureEngineering:

    def __init__(self, dataframe):
        self.df = dataframe.copy()

    def convert_date(self):

        self.df["Date"] = pd.to_datetime(self.df["Date"])

        return self.df
    
    def extract_date_features(self):

        self.df["Year"] = self.df["Date"].dt.year
        self.df["Month"] = self.df["Date"].dt.month
        self.df["Day"] = self.df["Date"].dt.day
        self.df["DayOfWeek"] = self.df["Date"].dt.dayofweek

        return self.df
    
    def encode_roadwork(self):

        self.df["Roadwork"] = self.df[
            "Roadwork and Construction Activity"
        ].map({
            "Yes": 1,
            "No": 0
        })

        return self.df
    
    def encode_weather(self):

        weather = {
            "Clear": 0,
            "Overcast": 1,
            "Fog": 2,
            "Rain": 3,
            "Windy": 4
        }

        self.df["Weather"] = self.df[
            "Weather Conditions"
        ].map(weather)

        return self.df
    
    def traffic_category(self):

        self.df["Traffic Category"] = pd.cut(

            self.df["Traffic Volume"],

            bins=[0,15000,30000,50000,100000],

            labels=[
                "Low",
                "Moderate",
                "Heavy",
                "Severe"
            ]
        )

        return self.df