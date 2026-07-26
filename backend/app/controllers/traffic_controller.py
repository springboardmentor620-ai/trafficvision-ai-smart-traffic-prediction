"""
TrafficVision AI - Traffic Controller Layer Placeholder
Handles request coordination between Routers and Services/Data models.
"""
from typing import List, Dict, Any
from app.services.prediction_service import prediction_service

class TrafficController:
    @staticmethod
    def get_live_junctions() -> List[Dict[str, Any]]:
        return [
          {
            "id": 1,
            "code": "NODE-NE-01",
            "name": "5th Ave & 42nd St",
            "latitude": 40.7527,
            "longitude": -73.9772,
            "status": "OPERATIONAL",
            "congestion_score": 28.5,
            "congestion_level": "LOW",
          },
          {
            "id": 2,
            "code": "NODE-NE-02",
            "name": "Broadway & 34th St",
            "latitude": 40.7484,
            "longitude": -73.9857,
            "status": "WARNING",
            "congestion_score": 68.0,
            "congestion_level": "MODERATE",
          },
          {
            "id": 3,
            "code": "NODE-SW-08",
            "name": "Lincoln Tunnel Entrance",
            "latitude": 40.7589,
            "longitude": -74.0022,
            "status": "OPERATIONAL",
            "congestion_score": 82.4,
            "congestion_level": "HIGH",
          }
        ]

    @staticmethod
    def get_junction_prediction(junction_code: str) -> Dict[str, Any]:
        return prediction_service.forecast_congestion(junction_code)

traffic_controller = TrafficController()
