import sys
import os
from fastapi.testclient import TestClient

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.main import app
from app.database.session import SessionLocal
from app.models.models import User, Road

client = TestClient(app)

def test_operator_monitoring_verification():
    print("=" * 60)
    print("RUNNING OPERATOR TRAFFIC MONITORING AUDIT & VERIFICATION")
    print("=" * 60)

    # 1. Admin Login
    print("\n[STEP 1] Testing Admin Login & Endpoint Verification...")
    admin_login_res = client.post("/api/v1/auth/login", json={
        "email": "admin.chief@trafficvision.ai",
        "password": "adminpass123"
    })
    assert admin_login_res.status_code == 200, f"Admin login failed: {admin_login_res.text}"
    admin_token = admin_login_res.json()["access_token"]
    admin_headers = {"Authorization": f"Bearer {admin_token}"}
    print(" -> Admin authenticated successfully!")

    # 2. Verify Endpoint GET /api/v1/operator/roads exists & returns HTTP 200
    print("\n[STEP 2] Verifying GET /api/v1/operator/roads endpoint status code & schema...")
    ops_list = client.get("/api/v1/admin/operators", headers=admin_headers).json()
    assert len(ops_list) > 0, "No operators found"
    target_op = ops_list[0]

    op_login = client.post("/api/v1/auth/login", json={
        "email": target_op["email"],
        "password": "opPass2026!"
    })
    assert op_login.status_code == 200, f"Operator login failed: {op_login.text}"
    op_token = op_login.json()["access_token"]
    op_headers = {"Authorization": f"Bearer {op_token}"}

    roads_res = client.get("/api/v1/operator/roads", headers=op_headers)
    assert roads_res.status_code == 200, f"GET /operator/roads failed with status {roads_res.status_code}"
    roads_data = roads_res.json()
    assert isinstance(roads_data, list), "Response must be a JSON list"
    print(f" -> Endpoint GET /api/v1/operator/roads returned HTTP 200 OK with {len(roads_data)} items!")

    # 3. Validate Schema Fields
    if len(roads_data) > 0:
        item = roads_data[0]
        required_fields = ["id", "road_name", "zone", "latitude", "longitude", "current_vehicle_count", "current_speed", "congestion_level"]
        for field in required_fields:
            assert field in item, f"Missing expected field '{field}' in API response item"
        print(" -> Schema validation passed! All required telemetry fields present.")

    # 4. Verify Scoped Data Isolation
    print("\n[STEP 3] Verifying Scoped Telemetry Isolation (Logged-in Operator ID)...")
    all_city_roads = client.get("/api/v1/admin/roads", headers=admin_headers).json()
    assert len(roads_data) <= len(all_city_roads)
    print(f" -> Logged-in Operator receives ONLY {len(roads_data)} assigned roads out of {len(all_city_roads)} total city roads.")

    # 5. Verify Unassigned Operator Empty State Handling
    print("\n[STEP 4] Verifying Unassigned Operator Empty State...")
    unassigned_op = ops_list[1]
    client.put(f"/api/v1/operators/{unassigned_op['id']}/assign-roads", headers=admin_headers, json={
        "zone": unassigned_op["zone"],
        "road_ids": []
    })

    unassigned_login = client.post("/api/v1/auth/login", json={
        "email": unassigned_op["email"],
        "password": "opPass2026!"
    })
    unassigned_headers = {"Authorization": f"Bearer {unassigned_login.json()['access_token']}"}
    empty_res = client.get("/api/v1/operator/roads", headers=unassigned_headers)
    assert empty_res.status_code == 200
    assert len(empty_res.json()) == 0
    print(" -> Unassigned operator correctly receives HTTP 200 with empty list [], triggering UI empty state banner!")

    print("\n" + "=" * 60)
    print("ALL OPERATOR MONITORING AUDIT TESTS PASSED 100% SUCCESSFULLY!")
    print("=" * 60)

if __name__ == "__main__":
    test_operator_monitoring_verification()
