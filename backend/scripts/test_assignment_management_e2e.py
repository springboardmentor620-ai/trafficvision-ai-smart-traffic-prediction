import sys
import os
import time

backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from app.database.session import SessionLocal
from app.repositories.operator_repository import OperatorRepository
from app.repositories.traffic_repository import TrafficRepository
from app.routers.operator import get_operator_dashboard_stats, get_assigned_roads
from app.routers.assignments import create_assignment
from app.schemas.assignment import CreateAssignmentSchema
from app.models.models import User, Road, OperatorRoadAssignment

def run_assignment_management_e2e_test():
    db = SessionLocal()
    try:
        print("==================================================================")
        print("=== TEST: Assignment Management End-to-End Workflow Verification ===")
        print("==================================================================\n")

        # 1. Admin Creates a new Operator
        op_data = {
            "name": f"E2E Operator {int(time.time())}",
            "email": f"e2e_op_{int(time.time())}@trafficvision.ai",
            "phone": f"+1-555-{int(time.time()) % 10000:04d}",
            "zone": "Zone Alpha",
            "shift": "Morning Shift (06:00 - 14:00)"
        }
        res_create = OperatorRepository.create_operator(db, op_data)
        created_op = res_create["operator"]
        op_id = created_op["id"]
        print(f"[STAGE 1] Created New Operator: '{created_op['name']}' (ID #{op_id}) in Supabase")

        # Verify initial assigned roads is 0
        initial_roads = OperatorRepository.get_operator_roads(db, op_id)
        assert len(initial_roads) == 0, "New operator should have 0 assigned roads"

        # 2. Fetch available road corridors to assign
        available_roads = db.query(Road).limit(3).all()
        assert len(available_roads) >= 2, "Need at least 2 roads in Supabase for testing"
        target_road_ids = [r.id for r in available_roads]
        print(f"[STAGE 2] Selecting {len(target_road_ids)} Corridors to Assign: {[r.road_name for r in available_roads]}")

        # 3. Admin assigns roads to the new Operator via CreateAssignment API
        admin = db.query(User).filter(User.role == "Admin").first()
        payload = CreateAssignmentSchema(
            operator_id=op_id,
            zone="Zone Alpha",
            road_ids=target_road_ids,
            assigned_by=admin.name if admin else "Admin Chief Controller"
        )
        assign_result = create_assignment(payload=payload, db=db, current_user=admin)
        print(f"[STAGE 3] Assignment Saved in Supabase: '{assign_result['message']}'")

        # 4. Verify junction table persistence in Supabase
        junction_records = db.query(OperatorRoadAssignment).filter(OperatorRoadAssignment.operator_id == op_id).all()
        assert len(junction_records) == len(target_road_ids), f"Expected {len(target_road_ids)} junction records in Supabase"
        print(f"  [OK] Verified {len(junction_records)} junction records in OperatorRoadAssignment table")

        # 5. Operator Login Simulation - Fetch Assigned Roads
        op_user = db.query(User).filter(User.id == op_id).first()
        visible_roads = get_assigned_roads(current_user=op_user, db=db)
        print(f"[STAGE 4] Simulated Operator Login: Operator sees {len(visible_roads)} assigned corridors")
        assert len(visible_roads) == len(target_road_ids), f"Operator should see exactly {len(target_road_ids)} assigned roads"

        # 6. Verify Dashboard Statistics use assigned roads only
        dash_stats = get_operator_dashboard_stats(current_user=op_user, db=db)
        print(f"[STAGE 5] Operator Dashboard Metrics: Assigned Roads = {dash_stats['metrics']['assigned_roads']}")
        assert dash_stats['metrics']['assigned_roads'] == len(target_road_ids)

        # 7. Cleanup test operator & assignments
        OperatorRepository.delete_operator(db, op_id)
        print(f"[STAGE 6] Cleanup Complete: Deleted test operator #{op_id} and unassigned roads in Supabase")

        print("\n==================================================================")
        print("[SUCCESS] ASSIGNMENT MANAGEMENT END-TO-END WORKFLOW VERIFIED!")
        print("==================================================================")

    except Exception as e:
        db.rollback()
        print(f"\n[ERROR] ASSIGNMENT E2E TEST FAILED: {e}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    run_assignment_management_e2e_test()
