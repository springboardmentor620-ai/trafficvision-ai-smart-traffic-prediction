from pymongo import MongoClient
import pandas as pd

# Connect to MongoDB
client = MongoClient("mongodb://localhost:27017/")

db = client["trafficvision"]

collection = db["traffic_data"]

# Read CSV dataset
df = pd.read_csv("data/Banglore_traffic_Dataset.csv")

# Remove existing records
collection.delete_many({})

# Insert new records
collection.insert_many(df.to_dict("records"))

print("Dataset imported successfully!")
print("Total Records:", collection.count_documents({}))