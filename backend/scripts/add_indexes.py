import sys
import os

backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from app.database.session import engine
from sqlalchemy import text

def create_performance_indexes():
    print("=== Creating Supabase PostgreSQL Performance Indexes ===")
    indexes = [
        ("idx_traffic_data_road_timestamp", "CREATE INDEX IF NOT EXISTS idx_traffic_data_road_timestamp ON traffic_data (road_id, timestamp DESC);"),
        ("idx_roads_assigned_operator", "CREATE INDEX IF NOT EXISTS idx_roads_assigned_operator ON roads (assigned_operator_id);"),
        ("idx_roads_zone", "CREATE INDEX IF NOT EXISTS idx_roads_zone ON roads (zone);"),
        ("idx_alerts_road_status", "CREATE INDEX IF NOT EXISTS idx_alerts_road_status ON alerts (road_id, status);"),
        ("idx_operator_road_assignments_op", "CREATE INDEX IF NOT EXISTS idx_operator_road_assignments_op ON operator_road_assignments (operator_id);"),
    ]

    with engine.connect() as conn:
        for index_name, sql in indexes:
            try:
                conn.execute(text(sql))
                conn.commit()
                print(f"  [OK] Index '{index_name}' created or verified.")
            except Exception as e:
                print(f"  [WARNING] Could not create index '{index_name}': {e}")

    print("=== Index Creation Complete ===\n")

if __name__ == "__main__":
    create_performance_indexes()
