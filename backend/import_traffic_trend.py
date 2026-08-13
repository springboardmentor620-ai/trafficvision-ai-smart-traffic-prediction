import pandas as pd
from sqlalchemy import create_engine

from config import DATABASE_URL

# ==========================================
# 1. CSV FILE
# ==========================================

CSV_PATH = r"C:\Users\ADMIN\OneDrive\Desktop\TrafficVisionAI\backend\dataset\traffic_hyderabad_realistic_researched_2026.csv"


# ==========================================
# 2. MYSQL DATABASE
# ==========================================


# ==========================================
# 3. MYSQL TABLE
# ==========================================

TABLE_NAME = "traffic_data"


# ==========================================
# 4. READ CSV
# ==========================================

print("Reading CSV file...")

df = pd.read_csv(CSV_PATH)

print(f"CSV loaded successfully!")
print(f"Rows found: {len(df)}")


# ==========================================
# 5. RENAME CSV COLUMNS
#    CSV → MySQL
# ==========================================

df = df.rename(columns={
    "DateTime": "datetime",
    "Latitude": "latitude",
    "Longitude": "longitude",
    "Vehicle_Count": "vehicle_count",
    "Speed": "speed",
    "Congestion_Level": "congestion_level",
    "Weather": "weather",
    "Road_Name": "road_name",
    "Traffic_Signal": "traffic_signal",
    "Accident": "accident",
    "Hour": "hour",
    "Day": "day",
    "Month": "month",
    "Year": "year",
    "DayOfWeek": "day_of_week",
    "Weekday": "weekday",
    "IsWeekend": "is_weekend",
    "PeakHour": "peak_hour",
    "Minute": "minute",
    "TimeSlot": "time_slot",
    "Alternative_Route": "alternative_route",
    "Estimated_Delay": "estimated_delay"
})


# ==========================================
# 6. CONVERT DATETIME
# ==========================================

df["datetime"] = pd.to_datetime(
    df["datetime"],
    errors="coerce"
)


# Remove invalid datetime rows

df = df.dropna(
    subset=["datetime"]
)


# ==========================================
# 7. CONVERT BOOLEAN COLUMNS
# ==========================================

def convert_boolean(value):
    if pd.isna(value):
        return 0

    if isinstance(value, bool):
        return int(value)

    value = str(value).strip().lower()

    if value in ["true", "1", "yes", "y"]:
        return 1

    return 0


df["is_weekend"] = df["is_weekend"].apply(
    convert_boolean
)

df["peak_hour"] = df["peak_hour"].apply(
    convert_boolean
)


# ==========================================
# 8. KEEP ONLY EXISTING traffic_data COLUMNS
# ==========================================

TRAFFIC_DATA_COLUMNS = [
    "datetime", "latitude", "longitude", "vehicle_count", "speed",
    "congestion_level", "weather", "road_name", "traffic_signal", "accident"
]
df = df[[column for column in TRAFFIC_DATA_COLUMNS if column in df.columns]]


# ==========================================
# 9. CREATE MYSQL CONNECTION
# ==========================================

print("\nConnecting to MySQL...")

engine = create_engine(
    DATABASE_URL
)


# ==========================================
# 10. IMPORT DATA
# ==========================================

print(
    f"\nImporting data into '{TABLE_NAME}'..."
)

df.to_sql(
    TABLE_NAME,
    con=engine,
    if_exists="append",
    index=False,
    chunksize=1000
)


# ==========================================
# 11. SUCCESS
# ==========================================

print("\n==========================================")
print("DATA IMPORT COMPLETED SUCCESSFULLY")
print("==========================================")

print(f"Table        : {TABLE_NAME}")
print(f"Rows imported: {len(df)}")
