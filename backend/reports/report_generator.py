import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
from datetime import datetime
import os

class ReportGenerator:
    def __init__(self):
        self.reports_dir = 'backend/reports'
        os.makedirs(self.reports_dir, exist_ok=True)
    
    def generate_daily_report(self, df, date=None):
        """Generate daily traffic report"""
        if date is None:
            date = datetime.now().strftime('%Y-%m-%d')
        
        # Filter data for the day
        df['date'] = pd.to_datetime(df['timestamp']).dt.date
        daily_data = df[df['date'] == pd.to_datetime(date).date()]
        
        if daily_data.empty:
            return {"error": f"No data for {date}"}
        
        # Calculate statistics
        stats = {
            'date': date,
            'total_vehicles': int(daily_data['vehicle_count'].sum()),
            'avg_vehicle_count': round(daily_data['vehicle_count'].mean(), 1),
            'peak_hour': int(daily_data.groupby('hour')['vehicle_count'].mean().idxmax()),
            'peak_volume': int(daily_data.groupby('hour')['vehicle_count'].mean().max()),
            'avg_speed': round(daily_data['average_speed'].mean(), 1),
            'congestion_hours': len(daily_data[daily_data['vehicle_count'] > 300])
        }
        
        return stats
    
    def generate_weekly_report(self, df):
        """Generate weekly traffic report"""
        df['week'] = pd.to_datetime(df['timestamp']).dt.isocalendar().week
        current_week = df['week'].max()
        weekly_data = df[df['week'] == current_week]
        
        if weekly_data.empty:
            return {"error": "No data for current week"}
        
        stats = {
            'week': current_week,
            'total_vehicles': int(weekly_data['vehicle_count'].sum()),
            'avg_daily_vehicles': round(weekly_data.groupby(pd.to_datetime(weekly_data['timestamp']).dt.date)['vehicle_count'].sum().mean(), 1),
            'peak_day': weekly_data.groupby(pd.to_datetime(weekly_data['timestamp']).dt.day_name())['vehicle_count'].sum().idxmax(),
            'avg_congestion': round(weekly_data[weekly_data['vehicle_count'] > 300].shape[0] / weekly_data.shape[0] * 100, 1)
        }
        
        return stats
    
    def generate_heatmap_data(self, df):
        """Generate data for congestion heatmap"""
        # Create hour-day matrix for congestion
        df['hour'] = pd.to_datetime(df['timestamp']).dt.hour
        df['day'] = pd.to_datetime(df['timestamp']).dt.day_name()
        
        heatmap_data = df.groupby(['day', 'hour'])['vehicle_count'].mean().unstack()
        
        return heatmap_data.to_dict()

# Test the report generator
if __name__ == "__main__":
    generator = ReportGenerator()
    # Use with your data