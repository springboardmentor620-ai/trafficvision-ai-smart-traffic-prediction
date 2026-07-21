import matplotlib.pyplot as plt
import seaborn as sns

class EDA:

    def __init__(self, dataframe):
        self.df = dataframe

    def traffic_volume_distribution(self):

        plt.figure(figsize=(10,5))

        plt.hist(
            self.df["Traffic Volume"],
            bins=30,
            edgecolor="black"
        )

        plt.title("Traffic Volume Distribution", fontsize=14)
        plt.xlabel("Traffic Volume")
        plt.ylabel("Frequency")

        plt.tight_layout()

        plt.grid(alpha=0.3)

        plt.show()
    
    def traffic_by_area(self):

        area_traffic = (
            self.df
            .groupby("Area Name")["Traffic Volume"]
            .mean()
            .sort_values(ascending=False)
        )

        plt.figure(figsize=(12,6))

        bars = plt.bar(
            area_traffic.index,
            area_traffic.values
        )

        for bar in bars:
            height = bar.get_height()
            plt.text(
                bar.get_x() + bar.get_width()/2,
                height,
                f"{height:.0f}",
                ha="center",
                va="bottom",
                fontsize=9
            )

        plt.title("Average Traffic Volume by Area")
        plt.xlabel("Area")
        plt.ylabel("Average Traffic Volume")

        plt.xticks(rotation=45)

        plt.grid(axis="y", alpha=0.3)

        plt.tight_layout()

        plt.show()
    
    def average_speed_by_area(self):

        speed = (
            self.df
            .groupby("Area Name")["Average Speed"]
            .mean()
            .sort_values(ascending=False)
        )

        plt.figure(figsize=(12,6))

        plt.bar(speed.index, speed.values)

        plt.title("Average Speed by Area")
        plt.xlabel("Area")
        plt.ylabel("Average Speed (km/h)")

        plt.xticks(rotation=45)

        plt.grid(axis="y", alpha=0.3)

        plt.tight_layout()

        plt.show()
    
    def congestion_by_area(self):

        congestion = (
            self.df
            .groupby("Area Name")["Congestion Level"]
            .mean()
            .sort_values(ascending=False)
        )

        plt.figure(figsize=(12,6))

        plt.bar(congestion.index, congestion.values)

        plt.title("Average Congestion Level by Area")

        plt.xlabel("Area")

        plt.ylabel("Congestion Level")

        plt.xticks(rotation=45)

        plt.grid(axis="y", alpha=0.3)

        plt.tight_layout()

        plt.show()

    def weather_distribution(self):

        weather = self.df["Weather Conditions"].value_counts()

        plt.figure(figsize=(8,5))

        plt.bar(weather.index, weather.values)

        plt.title("Weather Condition Distribution")

        plt.xlabel("Weather")

        plt.ylabel("Count")

        plt.grid(axis="y", alpha=0.3)

        plt.tight_layout()

        plt.show()
    
    def correlation_matrix(self):

        numeric = self.df.select_dtypes(include=["number"])

        plt.figure(figsize=(12,10))

        sns.heatmap(
            numeric.corr(),
            annot=True,
            cmap="coolwarm",
            fmt=".2f"
        )

        plt.title("Correlation Matrix")

        plt.tight_layout()

        plt.show()