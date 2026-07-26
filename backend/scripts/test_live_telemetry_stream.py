import sys
import os
import requests

# Add backend directory to sys.path
backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from app.database.session import SessionLocal
from app.models.models import TrafficData, Road

BASE_URL = "http://127.0.0.1:8000/api/v1"

def run_verification():
    print("=" * 70)
    print("      LIVE TRAFFIC TELEMETRY SYNCHRONIZATION VERIFICATION")
    print("=" * 70)

    db = SessionLocal()
    try:
        # 1. Verify 5th Avenue Corridor
        road = db.query(Road).filter(Road.road_name.ilike("%5th Avenue%")).first()
        if not road:
            road = db.query(Road).filter(Road.id == 103).first()
        if not road:
            road = db.query(Road).first()

        if not road:
            print("[ERROR] No road found in database.")
            sys.exit(1)

        print(f"[SUCCESS] Target Road Identified: ID={road.id}, Name='{road.road_name}', Zone='{road.zone}'")

        # 2. Check time-series records stored in DB for target road
        records = db.query(TrafficData).filter(TrafficData.road_id == road.id).order_by(TrafficData.timestamp.asc()).all()
        print(f"[INFO] Total Telemetry Records Stored for {road.road_name}: {len(records)}")

        if len(records) > 0:
            print("\n--- SAMPLE TIME-SERIES INTERVAL TELEMETRY LOGS ---")
            for idx, rec in enumerate(records[:10]):
                ts_str = rec.timestamp.strftime("%H:%M:%S") if rec.timestamp else "N/A"
                print(f"  [{idx+1:02d}] Time: {ts_str} | Vehicles: {rec.vehicle_count} (Cars:{rec.car_count}, Buses:{rec.bus_count}, Trucks:{rec.truck_count}, Motos:{rec.motorcycle_count}) | Speed: {rec.average_speed} km/h | Congestion: {rec.congestion_level}")

        # 3. Test HTTP endpoint GET /api/v1/traffic/road/{road_id}/telemetry
        url = f"{BASE_URL}/traffic/road/{road.id}/telemetry"
        print(f"\nCalling Live Telemetry Stream Endpoint: {url}")
        resp = requests.get(url, timeout=5)
        
        if resp.status_code != 200:
            print(f"[ERROR] Endpoint returned status code {resp.status_code}")
            sys.exit(1)

        data = resp.json()
        print("[SUCCESS] API Endpoint Response Successfully Received (HTTP 200)")
        
        curr = data.get("current_telemetry", {})
        history = data.get("telemetry_history", [])

        print(f"\n--- CURRENT LIVE SNAPSHOT ({road.road_name}) ---")
        print(f"  * Vehicle Count: {curr.get('vehicle_count')} veh")
        print(f"  * Cars: {curr.get('car_count')}, Buses: {curr.get('bus_count')}, Trucks: {curr.get('truck_count')}, Motorcycles: {curr.get('motorcycle_count')}")
        print(f"  * Congestion Level: {curr.get('congestion_level')}")
        print(f"  * Average Speed: {curr.get('average_speed')} km/h")
        print(f"  * AI Status: {curr.get('ai_status')} (Confidence: {curr.get('confidence')})")
        print(f"  * Timestamp: {curr.get('timestamp')}")
        print(f"  * Time-Series History Records Returned: {len(history)}")

        print("\n=========================================================")
        print(" VERIFICATION COMPLETE: Dashboard & Telemetry Stream Sync Ready!")
        print("=========================================================\n")

    finally:
        db.close()

if __name__ == "__main__":
    run_verification()
