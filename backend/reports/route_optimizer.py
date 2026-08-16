import pandas as pd
import numpy as np
from collections import defaultdict

class RouteOptimizer:
    def __init__(self):
        self.road_network = None
        self.traffic_data = None
        
    def load_road_network(self, filepath='backend/data/road_network.csv'):
        """Load road network data"""
        try:
            self.road_network = pd.read_csv(filepath)
            print(f"✅ Road network loaded: {len(self.road_network)} roads")
            return self.road_network
        except FileNotFoundError:
            print(f"❌ Road network file not found: {filepath}")
            return None
    
    def update_traffic_data(self, traffic_df):
        """Update current traffic conditions"""
        self.traffic_data = traffic_df
    
    def find_alternate_route(self, start_road, end_road, congestion_threshold=0.7):
        """Find alternate route avoiding congestion"""
        if self.road_network is None:
            print("❌ Road network not loaded")
            return None
        
        # Get all roads
        roads = self.road_network.copy()
        
        # Add congestion data
        if self.traffic_data is not None:
            # Merge traffic data
            latest = self.traffic_data.sort_values('timestamp').groupby('road_id').last().reset_index()
            
            # Calculate congestion level
            if 'vehicle_count' in latest.columns:
                max_vehicles = latest['vehicle_count'].max()
                latest['congestion_ratio'] = latest['vehicle_count'] / max_vehicles
            else:
                latest['congestion_ratio'] = 0.5
            
            # Merge with road network
            roads = roads.merge(latest, left_on='road_id', right_on='road_id', how='left')
            roads['congestion_ratio'] = roads['congestion_ratio'].fillna(0.3)
        else:
            roads['congestion_ratio'] = 0.3
        
        # Find routes with low congestion
        best_routes = roads[roads['congestion_ratio'] < congestion_threshold]
        
        if len(best_routes) == 0:
            best_routes = roads.nsmallest(3, 'congestion_ratio')
        
        # Return best routes
        routes = []
        for _, row in best_routes.iterrows():
            routes.append({
                'road_id': row['road_id'],
                'road_name': row.get('road_name', f"Road {row['road_id']}"),
                'congestion_level': self.get_congestion_label(row['congestion_ratio']),
                'estimated_travel_time': self.estimate_travel_time(row)
            })
        
        return routes
    
    def estimate_travel_time(self, road_data):
        """Estimate travel time based on congestion"""
        base_time = 10  # minutes base time
        congestion = road_data.get('congestion_ratio', 0.3)
        
        # Increase time based on congestion
        delay_factor = 1 + (congestion * 2)
        estimated_time = base_time * delay_factor
        
        return f"{estimated_time:.0f} min"
    
    def get_congestion_label(self, ratio):
        """Convert congestion ratio to label"""
        if ratio > 0.7:
            return "Heavy Congestion"
        elif ratio > 0.4:
            return "Moderate"
        else:
            return "Smooth"

# Test the optimizer
if __name__ == "__main__":
    optimizer = RouteOptimizer()
    optimizer.load_road_network()
    
    routes = optimizer.find_alternate_route(1, 5)
    if routes:
        print("📋 Suggested Routes:")
        for i, route in enumerate(routes[:3], 1):
            print(f"{i}. {route['road_name']} - {route['congestion_level']} ({route['estimated_travel_time']})")