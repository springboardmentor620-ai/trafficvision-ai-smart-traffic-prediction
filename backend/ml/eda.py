import pandas as pd
import matplotlib.pyplot as plt
import os

# -------------------------------
# Load Dataset
# -------------------------------

current_dir = os.path.dirname(__file__)

file_path = os.path.join(
    current_dir,
    "..",
    "data",
    "Banglore_traffic_Dataset.csv"
)

df = pd.read_csv(file_path)

# -------------------------------
# Create graphs folder
# -------------------------------

graphs_folder = os.path.join(current_dir, "..", "graphs")

os.makedirs(graphs_folder, exist_ok=True)

# -------------------------------
# 1. Traffic Volume Distribution
# -------------------------------

plt.figure(figsize=(8,5))
plt.hist(df["Traffic Volume"], bins=20)
plt.title("Traffic Volume Distribution")
plt.xlabel("Traffic Volume")
plt.ylabel("Frequency")

plt.savefig(os.path.join(graphs_folder, "traffic_volume_distribution.png"))
plt.close()

# -------------------------------
# 2. Average Speed Distribution
# -------------------------------

plt.figure(figsize=(8,5))
plt.hist(df["Average Speed"], bins=20)
plt.title("Average Speed Distribution")
plt.xlabel("Average Speed")
plt.ylabel("Frequency")

plt.savefig(os.path.join(graphs_folder, "average_speed_distribution.png"))
plt.close()

# -------------------------------
# 3. Weather Conditions
# -------------------------------

plt.figure(figsize=(8,5))

df["Weather Conditions"].value_counts().plot(kind="bar")

plt.title("Weather Conditions")
plt.xlabel("Weather")
plt.ylabel("Count")

plt.savefig(os.path.join(graphs_folder, "weather_conditions.png"))
plt.close()

# -------------------------------
# 4. Average Traffic Volume by Area
# -------------------------------

plt.figure(figsize=(10,5))

df.groupby("Area Name")["Traffic Volume"] \
    .mean() \
    .sort_values(ascending=False) \
    .head(10) \
    .plot(kind="bar")

plt.title("Top 10 Areas by Average Traffic Volume")
plt.xlabel("Area")
plt.ylabel("Traffic Volume")

plt.savefig(os.path.join(graphs_folder, "traffic_volume_by_area.png"))
plt.close()

# -------------------------------
# 5. Congestion Level Distribution
# -------------------------------

plt.figure(figsize=(8,5))

plt.hist(df["Congestion Level"], bins=20)

plt.title("Congestion Level Distribution")
plt.xlabel("Congestion Level")
plt.ylabel("Frequency")

plt.savefig(os.path.join(graphs_folder, "congestion_level_distribution.png"))
plt.close()

# -------------------------------
# 6. Traffic Volume vs Average Speed
# -------------------------------

plt.figure(figsize=(8,5))

plt.scatter(
    df["Traffic Volume"],
    df["Average Speed"],
    alpha=0.5
)

plt.title("Traffic Volume vs Average Speed")
plt.xlabel("Traffic Volume")
plt.ylabel("Average Speed")

plt.savefig(os.path.join(graphs_folder, "traffic_volume_vs_average_speed.png"))
plt.close()

# -------------------------------
# Success Message
# -------------------------------

print("=" * 50)
print("EDA Completed Successfully!")
print("Graphs have been saved in the 'graphs' folder.")
print("=" * 50)