import sys
import os
from fastapi.testclient import TestClient

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.main import app
from app.database.session import SessionLocal
from app.models.models import User, Road

client = TestClient(app)

def test_user_management_e2e():
    print("=" * 60)
    print("RUNNING E2E USER MANAGEMENT & AUTHENTICATION AUDIT")
    print("=" * 60)

    # 1. Admin Login
    print("\n[STEP 1] Testing Admin Login...")
    admin_login_res = client.post("/api/v1/auth/login", json={
        "email": "admin.chief@trafficvision.ai",
        "password": "adminpass123"
    })
    assert admin_login_res.status_code == 200, f"Admin login failed: {admin_login_res.text}"
    admin_data = admin_login_res.json()
    admin_token = admin_data["access_token"]
    admin_headers = {"Authorization": f"Bearer {admin_token}"}
    print(f" -> Admin JWT token generated successfully! Role: {admin_data['user']['role']}")

    # 2. Create Operator with Auto-Generated Password
    print("\n[STEP 2] Testing Admin Create Operator (Auto-Generated Password & Supabase Persistence)...")
    test_email = "test.operator.e2e@trafficvision.ai"
    
    # Clean up if leftover from previous test
    db = SessionLocal()
    db.query(User).filter(User.email == test_email).delete()
    db.commit()
    db.close()

    create_res = client.post("/api/v1/admin/operators", headers=admin_headers, json={
        "name": "Test Operator E2E",
        "email": test_email,
        "phone": "+1 (555) 999-0000",
        "zone": "Zone Alpha - Financial District",
        "assigned_roads": [],
        "status": "ACTIVE"
    })
    assert create_res.status_code == 201, f"Create operator failed: {create_res.text}"
    created_payload = create_res.json()
    assert "temporary_password" in created_payload, "Temporary password not returned!"
    temp_password = created_payload["temporary_password"]
    created_op = created_payload["operator"]
    op_id = created_op["id"]
    print(f" -> Operator created! ID: {op_id}, Email: {test_email}")
    print(f" -> Temporary Password returned once: {temp_password}")

    # 3. Verify Password Hashed in Supabase / DB
    db = SessionLocal()
    db_user = db.query(User).filter(User.id == op_id).first()
    assert db_user is not None, "User not found in DB"
    assert db_user.password_hash != temp_password, "Password was not hashed!"
    assert db_user.password_hash.startswith("$2b$") or db_user.password_hash.startswith("$2a$"), "Password is not bcrypt hashed!"
    print(f" -> Password correctly bcrypt hashed in DB: {db_user.password_hash[:20]}...")
    db.close()

    # 4. Fetch Operator Roster & Single Operator Details
    print("\n[STEP 3] Testing List & Get Operator Endpoints...")
    list_res = client.get("/api/v1/admin/operators", headers=admin_headers, params={"search": "Test Operator"})
    assert list_res.status_code == 200
    ops_list = list_res.json()
    assert any(op["id"] == op_id for op in ops_list), "Created operator not in list"
    print(" -> Operator listed in search roster successfully!")

    get_res = client.get(f"/api/v1/admin/operators/{op_id}", headers=admin_headers)
    assert get_res.status_code == 200
    assert get_res.json()["email"] == test_email
    print(" -> Single operator profile retrieved successfully!")

    # 5. Edit Operator Profile
    print("\n[STEP 4] Testing Edit Operator Profile...")
    edit_res = client.put(f"/api/v1/admin/operators/{op_id}", headers=admin_headers, json={
        "name": "Test Operator E2E Updated",
        "phone": "+1 (555) 999-1111"
    })
    assert edit_res.status_code == 200
    assert edit_res.json()["name"] == "Test Operator E2E Updated"
    print(" -> Operator details updated successfully!")

    # 6. Toggle Status (Deactivate / Activate)
    print("\n[STEP 5] Testing Activate / Deactivate Status...")
    status_res = client.put(f"/api/v1/admin/operators/{op_id}/status", headers=admin_headers, json={"status": "INACTIVE"})
    assert status_res.status_code == 200
    assert status_res.json()["status"] == "INACTIVE"
    print(" -> Status changed to INACTIVE")

    status_res_active = client.put(f"/api/v1/admin/operators/{op_id}/status", headers=admin_headers, json={"status": "ACTIVE"})
    assert status_res_active.status_code == 200
    assert status_res_active.json()["status"] == "ACTIVE"
    print(" -> Status reactivated to ACTIVE")

    # 7. Assign Roads
    print("\n[STEP 6] Testing Road Assignments...")
    roads_res = client.get("/api/v1/admin/roads", headers=admin_headers)
    assert roads_res.status_code == 200
    all_roads_list = roads_res.json()
    test_road_ids = [r["id"] for r in all_roads_list[:2]]

    assign_res = client.put(f"/api/v1/admin/operators/{op_id}/assign-roads", headers=admin_headers, json={
        "zone": "Zone Beta - Midtown Hub",
        "road_ids": test_road_ids
    })
    assert assign_res.status_code == 200
    assert len(assign_res.json()["assigned_roads"]) == len(test_road_ids)
    print(" -> Assigned roads updated successfully!")

    # 8. Operator Login using Temporary Password
    print("\n[STEP 7] Testing Operator Login with Generated Temporary Password...")
    op_login_res = client.post("/api/v1/auth/login", json={
        "email": test_email,
        "password": temp_password
    })
    assert op_login_res.status_code == 200, f"Operator login failed: {op_login_res.text}"
    op_auth_data = op_login_res.json()
    op_token = op_auth_data["access_token"]
    op_headers = {"Authorization": f"Bearer {op_token}"}
    print(" -> Operator successfully logged in using temporary password!")
    print(f" -> Operator Role: {op_auth_data['user']['role']}")

    # 9. Verify RBAC Guard (Operator accessing Admin endpoint MUST be denied with HTTP 403)
    print("\n[STEP 8] Testing RBAC Authorization Guard (Operator accessing Admin API)...")
    forbidden_res = client.get("/api/v1/admin/operators", headers=op_headers)
    assert forbidden_res.status_code == 403, f"Expected HTTP 403 Forbidden, got {forbidden_res.status_code}"
    print(" -> RBAC Guard verified! Operator access to Admin API correctly rejected with 403 Forbidden.")

    # 10. Clean up / Delete Operator
    print("\n[STEP 9] Testing Delete Operator...")
    del_res = client.delete(f"/api/v1/admin/operators/{op_id}", headers=admin_headers)
    assert del_res.status_code == 200
    print(" -> Operator deleted successfully!")

    print("\n" + "=" * 60)
    print("ALL E2E TESTS PASSED SUCCESSFULLY! USER MANAGEMENT IS 100% OPERATIONAL.")
    print("=" * 60)

if __name__ == "__main__":
    test_user_management_e2e()
