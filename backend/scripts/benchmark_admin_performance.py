import sys
import os
import time

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database.session import SessionLocal, init_db
from app.models.models import User
from app.repositories.traffic_repository import TrafficRepository
from app.repositories.operator_repository import OperatorRepository
from app.repositories.road_repository import RoadRepository
from app.repositories.alert_repository import AlertRepository
from app.routers.zones import list_zones
from app.routers.assignments import list_assignments
from app.routers.admin import get_admin_dashboard_stats

def run_admin_performance_benchmark():
    print("=" * 75)
    print(" TRAFFICVISION AI - ADMIN CONSOLE COMPLETE PERFORMANCE AUDIT BENCHMARK")
    print("=" * 75 + "\n")
    
    init_db()
    db = SessionLocal()
    
    try:
        admin_user = db.query(User).filter(User.role == "Admin").first()
        if not admin_user:
            admin_user = User(name="Admin Audit", email="admin.audit@trafficvision.ai", role="Admin")

        benchmarks = []

        # 1. Road Management (/admin/roads)
        t0 = time.perf_counter()
        roads_data = RoadRepository.get_all_roads(db)
        ms_roads = round((time.perf_counter() - t0) * 1000, 2)
        print(f"[BENCHMARK 1] Road Management (/admin/roads): {ms_roads} ms (Corridors: {len(roads_data)})")
        benchmarks.append(("Road Management (/admin/roads)", ms_roads))

        # 2. Zone Management (/zones)
        t0 = time.perf_counter()
        zones_data = list_zones(db=db, current_user=admin_user)
        ms_zones = round((time.perf_counter() - t0) * 1000, 2)
        print(f"[BENCHMARK 2] Zone Management (/zones): {ms_zones} ms (Zones: {len(zones_data)})")
        benchmarks.append(("Zone Management (/zones)", ms_zones))

        # 3. Operator Management (/admin/operators)
        t0 = time.perf_counter()
        operators_data = OperatorRepository.get_all_operators(db)
        ms_operators = round((time.perf_counter() - t0) * 1000, 2)
        print(f"[BENCHMARK 3] Operator Management (/admin/operators): {ms_operators} ms (Operators: {len(operators_data)})")
        benchmarks.append(("Operator Management (/admin/operators)", ms_operators))

        # 4. Assignment Management (/assignments)
        t0 = time.perf_counter()
        assignments_data = list_assignments(db=db, current_user=admin_user)
        ms_assignments = round((time.perf_counter() - t0) * 1000, 2)
        print(f"[BENCHMARK 4] Assignment Management (/assignments): {ms_assignments} ms (Assignments: {len(assignments_data)})")
        benchmarks.append(("Assignment Management (/assignments)", ms_assignments))

        # 5. Traffic Monitoring (/traffic/monitoring)
        t0 = time.perf_counter()
        monitoring_data = TrafficRepository.get_live_monitoring(db, page_size=20)
        ms_monitoring = round((time.perf_counter() - t0) * 1000, 2)
        print(f"[BENCHMARK 5] Traffic Monitoring (/traffic/monitoring): {ms_monitoring} ms (Records: {len(monitoring_data['items'])})")
        benchmarks.append(("Traffic Monitoring (/traffic/monitoring)", ms_monitoring))

        # 6. Alerts Console (/alerts)
        t0 = time.perf_counter()
        alerts_data = AlertRepository.get_alerts(db)
        ms_alerts = round((time.perf_counter() - t0) * 1000, 2)
        print(f"[BENCHMARK 6] Alerts Console (/alerts): {ms_alerts} ms (Alerts: {len(alerts_data)})")
        benchmarks.append(("Alerts Console (/alerts)", ms_alerts))

        # 7. Admin Dashboard Stats (/admin/dashboard-stats)
        t0 = time.perf_counter()
        dash_data = get_admin_dashboard_stats(db=db)
        ms_dash = round((time.perf_counter() - t0) * 1000, 2)
        print(f"[BENCHMARK 7] Admin Dashboard (/admin/dashboard-stats): {ms_dash} ms")
        benchmarks.append(("Admin Dashboard (/admin/dashboard-stats)", ms_dash))

        print("\n" + "=" * 75)
        print(" BENCHMARK RESULTS SUMMARY")
        print("=" * 75)
        
        all_passed = True
        total_ms = 0
        for name, duration in benchmarks:
            status_str = "[OK] PASSED (< 1000 ms)" if duration < 1000 else "[FAIL] FAILED (> 1000 ms)"
            print(f"  * {name:<45}: {duration:>7.2f} ms | {status_str}")
            total_ms += duration
            if duration >= 1000:
                all_passed = False

        avg_ms = round(total_ms / len(benchmarks), 2)
        print("-" * 75)
        print(f"  • Overall Average Execution Time: {avg_ms} ms")
        print("=" * 75)
        
        if all_passed:
            print("\n[SUCCESS] ALL ADMIN PAGES LOAD INSTANTANEOUSLY (< 1 SEC) WITH ZERO TIMEOUTS!")

    finally:
        db.close()

if __name__ == "__main__":
    run_admin_performance_benchmark()
