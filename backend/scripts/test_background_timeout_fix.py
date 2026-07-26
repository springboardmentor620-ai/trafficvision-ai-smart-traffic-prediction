import sys
import os
import time
import concurrent.futures

backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from app.database.session import SessionLocal
from app.repositories.traffic_repository import TrafficRepository
from app.routers.traffic import get_road_telemetry_detail
from app.routers.operator import get_operator_dashboard_stats
from app.models.models import User, Road

def fetch_monitoring(op_id):
    db = SessionLocal()
    try:
        t0 = time.perf_counter()
        res = TrafficRepository.get_live_monitoring(db, operator_id=op_id, page=1, page_size=20)
        ms = round((time.perf_counter() - t0) * 1000, 2)
        return ms
    finally:
        db.close()

def run_concurrent_timeout_test():
    db = SessionLocal()
    try:
        print("==================================================================")
        print("=== TEST: Rapid Concurrent Background Request Performance Audit ===")
        print("==================================================================\n")

        operator = db.query(User).filter(User.role == "Operator").first()
        op_id = operator.id if operator else None
        road = db.query(Road).first()
        road_id = road.id if road else 1

        print(f"[OK] Testing concurrent background requests for Operator ID #{op_id} and Road ID #{road_id}")

        # 1. Test 10 concurrent monitoring API calls
        t0 = time.perf_counter()
        with concurrent.futures.ThreadPoolExecutor(max_workers=10) as executor:
            futures = [executor.submit(fetch_monitoring, op_id) for _ in range(10)]
            timings = [f.result() for f in concurrent.futures.as_completed(futures)]
        
        total_batch_ms = round((time.perf_counter() - t0) * 1000, 2)
        avg_request_ms = round(sum(timings) / len(timings), 2)

        print(f"  [OK] 10 Concurrent Live Monitoring Requests completed in {total_batch_ms} ms (Avg per request: {avg_request_ms} ms)")

        # 2. Test Cached Road Detail Endpoint (/traffic/roads/{road_id})
        t0 = time.perf_counter()
        res_detail1 = get_road_telemetry_detail(road_id=road_id, db=db)
        ms_detail1 = round((time.perf_counter() - t0) * 1000, 2)

        t0 = time.perf_counter()
        res_detail2 = get_road_telemetry_detail(road_id=road_id, db=db)
        ms_detail2 = round((time.perf_counter() - t0) * 1000, 2)

        print(f"  [OK] Road Telemetry Detail initial hit: {ms_detail1} ms | 5-min TTL Cached hit: {ms_detail2} ms")
        assert ms_detail2 < 500, f"Cached detail took {ms_detail2} ms (Target < 500ms)"

        print("\n==================================================================")
        print("[SUCCESS] CONCURRENT BACKGROUND REQUEST AUDIT PASSED!")
        print("==================================================================")

    except Exception as e:
        print(f"\n[ERROR] TEST FAILED: {e}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    run_concurrent_timeout_test()
