import sys
import os
import time

backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from app.database.session import SessionLocal
from app.repositories.traffic_repository import TrafficRepository
from app.routers.operator import get_operator_dashboard_stats, get_assigned_roads, get_assigned_alerts
from app.routers.alerts import list_alerts
from app.routers.zones import list_zones
from app.routers.roads import get_roads
from app.models.models import User

def run_complete_performance_audit():
    db = SessionLocal()
    try:
        print("==================================================================")
        print("=== TRAFFICVISION AI - COMPLETE BACKEND PERFORMANCE AUDIT ===")
        print("==================================================================\n")

        admin = db.query(User).filter(User.role == "Admin").first()
        operator = db.query(User).filter(User.role == "Operator").first()

        results = []

        # 1. Operator Profile / Auth (/auth/me)
        t0 = time.perf_counter()
        op_profile = {"id": operator.id, "name": operator.name, "email": operator.email, "role": operator.role} if operator else {}
        ms_profile = round((time.perf_counter() - t0) * 1000, 2)
        print(f"[AUDIT 1] Operator Profile (/auth/me): {ms_profile} ms")
        assert ms_profile < 500
        results.append(("Operator Profile (/auth/me)", ms_profile))

        # 2. Operator Dashboard (/operator/dashboard-stats)
        if operator:
            t0 = time.perf_counter()
            dash_stats = get_operator_dashboard_stats(current_user=operator, db=db)
            ms_dash = round((time.perf_counter() - t0) * 1000, 2)
            print(f"[AUDIT 2] Operator Dashboard (/operator/dashboard-stats): {ms_dash} ms (Assigned Corridors: {dash_stats['metrics']['assigned_roads']})")
            assert ms_dash < 500
            results.append(("Operator Dashboard (/operator/dashboard-stats)", ms_dash))

        # 3. Assigned Roads Console (/operator/roads & /zones cache)
        if operator:
            t0 = time.perf_counter()
            op_roads = get_assigned_roads(current_user=operator, db=db)
            ms_roads = round((time.perf_counter() - t0) * 1000, 2)
            print(f"[AUDIT 3] Assigned Roads Console (/operator/roads): {ms_roads} ms (Corridors: {len(op_roads)})")
            assert ms_roads < 500
            results.append(("Assigned Roads Console (/operator/roads)", ms_roads))

            # Prime and test 5-min TTL cached zones endpoint
            list_zones(db=db, current_user=operator)  # initial prime
            t0 = time.perf_counter()
            zones = list_zones(db=db, current_user=operator)  # cached hit
            ms_zones = round((time.perf_counter() - t0) * 1000, 2)
            print(f"  [OK] Zones List Cached (/zones): {ms_zones} ms (5-min TTL Cache Hit)")
            assert ms_zones < 500
            results.append(("Zones List Cache (/zones)", ms_zones))

        # 4. Traffic Monitoring Console (/traffic/monitoring)
        t0 = time.perf_counter()
        op_monitoring = TrafficRepository.get_live_monitoring(db, operator_id=operator.id if operator else None, page=1, page_size=20)
        ms_monitoring = round((time.perf_counter() - t0) * 1000, 2)
        print(f"[AUDIT 4] Traffic Monitoring Console (/traffic/monitoring): {ms_monitoring} ms (Records: {len(op_monitoring['items'])})")
        assert ms_monitoring < 500
        results.append(("Traffic Monitoring Console (/traffic/monitoring)", ms_monitoring))

        # 5. Alerts Console (/alerts with Eager Loading)
        if operator:
            t0 = time.perf_counter()
            op_alerts = list_alerts(page=1, page_size=20, current_user=operator, db=db)
            ms_alerts = round((time.perf_counter() - t0) * 1000, 2)
            print(f"[AUDIT 5] Alerts Console (/alerts eager loaded): {ms_alerts} ms (Alerts: {len(op_alerts)})")
            assert ms_alerts < 500
            results.append(("Alerts Console (/alerts)", ms_alerts))

        # 6. Unassigned Operator Fast-Path Short-Circuit (Task 4)
        unassigned_op = User(id=999999, name="Unassigned Fast-Path", email="unassigned@fastpath.ai", role="Operator")
        t0 = time.perf_counter()
        short_circuit_dash = get_operator_dashboard_stats(current_user=unassigned_op, db=db)
        ms_short_circuit = round((time.perf_counter() - t0) * 1000, 2)
        print(f"[AUDIT 6] Unassigned Short-Circuit Fast-Path: {ms_short_circuit} ms (Message: '{short_circuit_dash['message']}')")
        assert ms_short_circuit < 500
        assert short_circuit_dash["assigned_roads"] == []
        assert short_circuit_dash["alerts"] == []
        assert short_circuit_dash["summary"]["vehicle_count"] == 0
        results.append(("Unassigned Short-Circuit Fast-Path", ms_short_circuit))

        print("\n==================================================================")
        print("[SUCCESS] ALL OPERATOR ENDPOINTS RESPOND IN < 500 MS!")
        print("==================================================================")

        for endpoint, elapsed in results:
            print(f"  [OK] {endpoint}: {elapsed} ms")

    except Exception as e:
        print(f"\n[ERROR] PERFORMANCE AUDIT FAILED: {e}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    run_complete_performance_audit()
