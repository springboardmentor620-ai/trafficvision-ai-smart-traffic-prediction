import pandas as pd
import os

# Get the dataset path
current_dir = os.path.dirname(__file__)
file_path = os.path.join(current_dir, "..", "data", "Banglore_traffic_Dataset.csv")

# Load dataset
df = pd.read_csv(file_path)

# Display first 5 rows
print("========== FIRST 5 ROWS ==========")
print(df.head())

# Dataset shape
print("\n========== DATASET SHAPE ==========")
print(df.shape)

# Column names
print("\n========== COLUMN NAMES ==========")
print(df.columns)

# Dataset information
print("\n========== DATASET INFO ==========")
print(df.info())

# Missing values
print("\n========== MISSING VALUES ==========")
print(df.isnull().sum())

# Duplicate rows
print("\n========== DUPLICATE ROWS ==========")
print(df.duplicated().sum())

# Summary statistics
print("\n========== SUMMARY STATISTICS ==========")
print(df.describe())