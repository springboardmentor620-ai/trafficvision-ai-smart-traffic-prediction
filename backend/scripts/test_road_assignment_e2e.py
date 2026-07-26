import sys
import os
from fastapi.testclient import TestClient

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.main import app
from app.database.session import SessionLocal
from app.models.models import User, Road

client = TestClient(app)

def test_road_assignment_e2e():
    print("=" * 60)
    print("RUNNING E2E ROAD ASSIGNMENT SYSTEM AUDIT")
    print("=" * 60)

    # 1. Admin Login
    print("\n[STEP 1] Testing Admin Login...")
    admin_res = client.post("/api/v1/auth/login", json={
        "email": "admin.chief@trafficvision.ai",
        "password": "adminpass123"
    })
    assert admin_res.status_code == 200, f"Admin login failed: {admin_res.text}"
    admin_token = admin_res.json()["access_token"]
    admin_headers = {"Authorization": f"Bearer {admin_token}"}
    print(" -> Admin authenticated successfully!")

    # 2. Test GET /api/v1/operators and GET /api/v1/roads
    print("\n[STEP 2] Testing Operators & Roads GET Endpoints...")
    ops_res = client.get("/api/v1/operators", headers=admin_headers)
    assert ops_res.status_code == 200, f"Get operators failed: {ops_res.text}"
    operators_list = ops_res.json()
    assert len(operators_list) > 0, "No operators returned"
    print(f" -> Retreived {len(operators_list)} operators via /api/v1/operators")

    roads_res = client.get("/api/v1/roads", headers=admin_headers)
    assert roads_res.status_code == 200, f"Get roads failed: {roads_res.text}"
    all_roads = roads_res.json()
    assert len(all_roads) > 0, "No roads returned"
    print(f" -> Retrieved {len(all_roads)} total city roads via /api/v1/roads")

    # 3. Test Road Assignment PUT /api/v1/operators/{id}/assign-roads
    print("\n[STEP 3] Testing PUT /api/v1/operators/{id}/assign-roads...")
    target_op = operators_list[0]
    target_op_id = target_op["id"]
    test_road_ids = [all_roads[0]["id"], all_roads[1]["id"]]

    assign_res = client.put(f"/api/v1/operators/{target_op_id}/assign-roads", headers=admin_headers, json={
        "zone": "Zone Alpha - Financial District",
        "road_ids": test_road_ids
    })
    assert assign_res.status_code == 200, f"Road assignment failed: {assign_res.text}"
    assigned_op_data = assign_res.json()
    assert len(assigned_op_data["assigned_roads"]) == len(test_road_ids), "Assigned roads count mismatch"
    print(f" -> Assigned {len(test_road_ids)} road corridors to operator '{target_op['name']}'!")

    # 4. Test GET /api/v1/operators/{id}/roads
    print("\n[STEP 4] Testing GET /api/v1/operators/{id}/roads...")
    op_roads_res = client.get(f"/api/v1/operators/{target_op_id}/roads", headers=admin_headers)
    assert op_roads_res.status_code == 200, f"Get operator roads failed: {op_roads_res.text}"
    op_roads = op_roads_res.json()
    assert len(op_roads) == len(test_road_ids)
    print(f" -> Retrieved specific assigned roads list for operator ID {target_op_id}!")

    # 5. Test Operator Login & Scoped Access (Assigned Operator)
    print("\n[STEP 5] Testing Assigned Operator Scoped Telemetry...")
    op_login_res = client.post("/api/v1/auth/login", json={
        "email": target_op["email"],
        "password": "opPass2026!"
    })
    assert op_login_res.status_code == 200, f"Operator login failed: {op_login_res.text}"
    op_token = op_login_res.json()["access_token"]
    op_headers = {"Authorization": f"Bearer {op_token}"}

    op_scoped_roads = client.get("/api/v1/operator/roads", headers=op_headers).json()
    assert len(op_scoped_roads) == len(test_road_ids), f"Operator should see ONLY assigned roads! Got {len(op_scoped_roads)}"
    print(f" -> Operator sees ONLY their {len(op_scoped_roads)} assigned roads (never all {len(all_roads)} city roads).")

    # 6. Test Unassigned Operator Empty State
    print("\n[STEP 6] Testing Unassigned Operator Empty State Handling...")
    unassigned_op = operators_list[1]
    # Unassign all roads from second operator
    client.put(f"/api/v1/operators/{unassigned_op['id']}/assign-roads", headers=admin_headers, json={
        "zone": unassigned_op["zone"],
        "road_ids": []
    })

    unassigned_login = client.post("/api/v1/auth/login", json={
        "email": unassigned_op["email"],
        "password": "opPass2026!"
    })
    unassigned_token = unassigned_login.json()["access_token"]
    unassigned_headers = {"Authorization": f"Bearer {unassigned_token}"}

    empty_roads = client.get("/api/v1/operator/roads", headers=unassigned_headers).json()
    assert len(empty_roads) == 0, "Unassigned operator should receive empty array"
    
    empty_stats = client.get("/api/v1/operator/dashboard-stats", headers=unassigned_headers).json()
    assert empty_stats["metrics"]["assigned_roads"] == 0
    assert len(empty_stats["assigned_roads_list"]) == 0
    print(" -> Unassigned operator correctly receives 0 roads, triggering 'No roads have been assigned to you yet' UI notice!")

    print("\n" + "=" * 60)
    print("ALL ROAD ASSIGNMENT E2E TESTS PASSED 100% SUCCESSFULLY!")
    print("=" * 60)

if __name__ == "__main__":
    test_road_assignment_e2e()
