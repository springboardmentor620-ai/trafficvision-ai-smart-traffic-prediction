import pandas as pd


class DataQuality:

    def __init__(self, dataframe):
        self.df = dataframe

    def missing_values(self):

        missing = self.df.isnull().sum()

        missing_percent = (
            self.df.isnull().sum()
            / len(self.df)
            * 100
        )

        report = pd.DataFrame({

            "Missing Values": missing,
            "Percentage": missing_percent.round(2)

        })

        return report
    
    def duplicate_rows(self):

        duplicates = self.df.duplicated().sum()

        print("=" * 50)
        print("Duplicate Row Report")
        print("=" * 50)

        print(f"Duplicate Rows : {duplicates}")

        return duplicates
    
    def unique_values(self):

        report = self.df.nunique().to_frame(name="Unique Values")

        return report