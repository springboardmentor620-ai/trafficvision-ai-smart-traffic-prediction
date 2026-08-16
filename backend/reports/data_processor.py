import pandas as pd
import numpy as np
from datetime import datetime
import os

class TrafficDataProcessor:
    def __init__(self):
        self.data = None
        self.processed_data = None
    
    def load_data(self, filepath='backend/data/traffic_sensor_data.csv'):
        """Load traffic sensor data"""
        try:
            self.data = pd.read_csv(filepath)
            print(f"✅ Data loaded: {len(self.data)} rows")
            return self.data
        except FileNotFoundError:
            print(f"❌ File not found: {filepath}")
            return None
    
    def explore_data(self):
        """Explore dataset structure"""
        if self.data is None:
            print("❌ No data loaded")
            return
        
        print("\n📊 Data Info:")
        print("-" * 50)
        print(f"Rows: {len(self.data)}")
        print(f"Columns: {len(self.data.columns)}")
        print(f"Column names: {list(self.data.columns)}")
        print("\n🔍 First 5 rows:")
        print(self.data.head())
        print("\n📊 Data types:")
        print(self.data.dtypes)
        print("\n📊 Missing values:")
        print(self.data.isnull().sum())
    
    def preprocess_data(self):
        """Clean and preprocess data"""
        if self.data is None:
            print("❌ No data loaded")
            return None
        
        df = self.data.copy()
        
        # Convert timestamp to datetime
        if 'timestamp' in df.columns:
            df['timestamp'] = pd.to_datetime(df['timestamp'])
            df['hour'] = df['timestamp'].dt.hour
            df['day_of_week'] = df['timestamp'].dt.dayofweek
            df['month'] = df['timestamp'].dt.month
            df['is_weekend'] = df['day_of_week'].isin([5, 6]).astype(int)
        
        # Handle missing values
        numeric_cols = df.select_dtypes(include=[np.number]).columns
        for col in numeric_cols:
            df[col] = df[col].fillna(df[col].median())
        
        # Encode categorical variables
        categorical_cols = df.select_dtypes(include=['object']).columns
        for col in categorical_cols:
            if col != 'timestamp':
                df[col] = df[col].astype('category')
                df[f'{col}_code'] = df[col].cat.codes
        
        self.processed_data = df
        print(f"✅ Data preprocessed: {len(df)} rows, {len(df.columns)} columns")
        return df
    
    def create_time_features(self, df):
        """Create additional time-based features"""
        if 'timestamp' not in df.columns:
            return df
        
        df['hour_sin'] = np.sin(2 * np.pi * df['hour'] / 24)
        df['hour_cos'] = np.cos(2 * np.pi * df['hour'] / 24)
        df['day_sin'] = np.sin(2 * np.pi * df['day_of_week'] / 7)
        df['day_cos'] = np.cos(2 * np.pi * df['day_of_week'] / 7)
        
        return df

# Test the processor
if __name__ == "__main__":
    processor = TrafficDataProcessor()
    data = processor.load_data()
    
    if data is not None:
        processor.explore_data()
        processed = processor.preprocess_data()