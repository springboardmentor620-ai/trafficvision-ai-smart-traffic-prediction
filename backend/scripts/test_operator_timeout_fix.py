import sys
import os
import time

backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from app.database.session import SessionLocal
from app.repositories.traffic_repository import TrafficRepository
from app.routers.operator import get_operator_dashboard_stats, get_assigned_roads, get_assigned_alerts
from app.models.models import User

def run_operator_timeout_fix_test():
    db = SessionLocal()
    try:
        print("==================================================================")
        print("=== TEST: Operator Monitoring Timeout Fix & Fast-Path SLA Verification ===")
        print("==================================================================\n")

        # 1. Create a dummy test operator with 0 assigned roads
        unassigned_op = User(
            name="Unassigned Test Operator",
            email=f"unassigned_op_{int(time.time())}@trafficvision.ai",
            password_hash="fakehash",
            role="Operator"
        )
        db.add(unassigned_op)
        db.commit()
        db.refresh(unassigned_op)

        print(f"[OK] Created unassigned test operator #{unassigned_op.id} ({unassigned_op.email})")

        # 2. Test TrafficRepository.get_live_monitoring fast path
        t0 = time.perf_counter()
        res_monitoring = TrafficRepository.get_live_monitoring(db, operator_id=unassigned_op.id)
        ms_monitoring = round((time.perf_counter() - t0) * 1000, 2)

        print(f"  [OK] get_live_monitoring response time: {ms_monitoring} ms (Target < 200ms)")
        assert ms_monitoring < 200, f"Monitoring API took {ms_monitoring} ms (Target < 200ms)"
        assert res_monitoring["assigned_roads"] == []
        assert res_monitoring["items"] == []
        assert res_monitoring["message"] == "No roads assigned."
        assert res_monitoring["summary"]["vehicle_count"] == 0
        assert res_monitoring["summary"]["average_speed"] == 0
        assert res_monitoring["summary"]["congestion"] == "Low"

        # 3. Test get_operator_dashboard_stats fast path
        t0 = time.perf_counter()
        res_stats = get_operator_dashboard_stats(current_user=unassigned_op, db=db)
        ms_stats = round((time.perf_counter() - t0) * 1000, 2)

        print(f"  [OK] get_operator_dashboard_stats response time: {ms_stats} ms (Target < 200ms)")
        assert ms_stats < 200, f"Dashboard stats API took {ms_stats} ms (Target < 200ms)"
        assert res_stats["assigned_roads"] == []
        assert res_stats["message"] == "No roads assigned."
        assert res_stats["summary"]["vehicle_count"] == 0

        # 4. Test get_assigned_roads fast path
        t0 = time.perf_counter()
        res_roads = get_assigned_roads(current_user=unassigned_op, db=db)
        ms_roads = round((time.perf_counter() - t0) * 1000, 2)

        print(f"  [OK] get_assigned_roads response time: {ms_roads} ms (Target < 200ms)")
        assert ms_roads < 200, f"Assigned roads API took {ms_roads} ms (Target < 200ms)"
        assert res_roads == []

        # 5. Test get_assigned_alerts fast path
        t0 = time.perf_counter()
        res_alerts = get_assigned_alerts(current_user=unassigned_op, db=db)
        ms_alerts = round((time.perf_counter() - t0) * 1000, 2)

        print(f"  [OK] get_assigned_alerts response time: {ms_alerts} ms (Target < 200ms)")
        assert ms_alerts < 200, f"Assigned alerts API took {ms_alerts} ms (Target < 200ms)"
        assert res_alerts == []

        # Clean up test user
        db.delete(unassigned_op)
        db.commit()

        print("\n==================================================================")
        print("[SUCCESS] ALL UNASSIGNED OPERATOR FAST-PATH TESTS PASSED IN < 200 MS!")
        print("==================================================================")

    except Exception as e:
        db.rollback()
        print(f"\n[ERROR] TEST FAILED: {e}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    run_operator_timeout_fix_test()
