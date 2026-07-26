import sys
import os
import time

backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from app.database.session import SessionLocal
from app.repositories.traffic_repository import TrafficRepository
from app.models.models import User
from sqlalchemy import func

def run_performance_benchmarks():
    db = SessionLocal()
    try:
        print("==================================================================")
        print("=== TRAFFICVISION AI - BACKEND PERFORMANCE BENCHMARK AUDIT ===")
        print("==================================================================\n")

        admin = db.query(User).filter(func.upper(User.role) == "ADMIN").first()
        operator = db.query(User).filter(func.upper(User.role) == "OPERATOR").first()

        # Benchmark 1: Admin Live Traffic Monitoring (City-wide)
        t0 = time.perf_counter()
        admin_monitoring = TrafficRepository.get_live_monitoring(db, operator_id=None, page=1, page_size=50)
        admin_monitoring_ms = round((time.perf_counter() - t0) * 1000, 2)
        print(f"[BENCHMARK 1] Admin Traffic Monitoring (City-wide Scope): {admin_monitoring_ms} ms (Records: {admin_monitoring['total_count']})")
        assert admin_monitoring_ms < 1000, f"Admin monitoring took {admin_monitoring_ms} ms (Exceeds 1000ms SLA target)"

        # Benchmark 2: Assigned Operator Live Traffic Monitoring
        if operator:
            t0 = time.perf_counter()
            op_monitoring = TrafficRepository.get_live_monitoring(db, operator_id=operator.id, page=1, page_size=50)
            op_monitoring_ms = round((time.perf_counter() - t0) * 1000, 2)
            print(f"[BENCHMARK 2] Assigned Operator Traffic Monitoring (Operator ID {operator.id}): {op_monitoring_ms} ms (Records: {op_monitoring['total_count']})")
            assert op_monitoring_ms < 1000, f"Operator monitoring took {op_monitoring_ms} ms (Exceeds 1000ms SLA target)"

        # Benchmark 3: Unassigned Operator Fast Path (0 assigned corridors)
        t0 = time.perf_counter()
        fast_path_monitoring = TrafficRepository.get_live_monitoring(db, operator_id=999999, page=1, page_size=50)
        fast_path_ms = round((time.perf_counter() - t0) * 1000, 2)
        print(f"[BENCHMARK 3] Unassigned Operator Fast-Path (0 assigned roads): {fast_path_ms} ms (Items: {len(fast_path_monitoring['items'])})")
        assert fast_path_ms < 1000, f"Fast path took {fast_path_ms} ms (Exceeds 1000ms SLA target)"
        assert len(fast_path_monitoring['items']) == 0, "Fast path should return empty list HTTP 200"

        # Benchmark 4: Dashboard Summary Metrics Batch Aggregation
        t0 = time.perf_counter()
        summary_metrics = TrafficRepository.get_dashboard_summary_metrics(db)
        summary_ms = round((time.perf_counter() - t0) * 1000, 2)
        print(f"[BENCHMARK 4] Dashboard Summary Metrics Batch Aggregation: {summary_ms} ms (System Status: {summary_metrics['system_status']})")
        assert summary_ms < 1000, f"Dashboard summary took {summary_ms} ms (Exceeds 1000ms SLA target)"

        print("\n==================================================================")
        print("[SUCCESS] ALL BENCHMARK TESTS PASSED! EVERY API RESPONDS IN < 1 SECOND!")
        print("==================================================================")

    except Exception as e:
        print(f"\n[ERROR] BENCHMARK FAILED: {e}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    run_performance_benchmarks()
