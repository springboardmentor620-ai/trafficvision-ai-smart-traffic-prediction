import sys
import os
import time

backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from fastapi.testclient import TestClient
from app.main import app
from app.database.session import SessionLocal
from app.models.models import User
from app.utils.security import create_access_token

def run_admin_api_routing_test():
    client = TestClient(app)
    db = SessionLocal()
    try:
        print("==================================================================")
        print("=== TEST: Admin API Endpoint & Route Mismatch Audit =============")
        print("==================================================================\n")

        admin_user = db.query(User).filter(User.role.ilike("admin")).first()
        assert admin_user is not None, "Admin user must exist in database"

        token = create_access_token({"sub": str(admin_user.id), "email": admin_user.email, "role": admin_user.role, "name": admin_user.name})
        headers = {"Authorization": f"Bearer {token}"}

        endpoints_to_test = [
            ("GET", "/api/v1/admin/zones", None, [200]),
            ("GET", "/api/v1/zones", None, [200]),
            ("POST", "/api/v1/admin/zones", {"zone_name": f"Test Zone {int(time.time())}", "city": "Metro City", "description": "Routing Test Zone"}, [201, 200]),
            ("GET", "/api/v1/admin/roads", None, [200]),
            ("GET", "/api/v1/roads", None, [200]),
            ("POST", "/api/v1/admin/roads", {"road_name": f"Test Corridor {int(time.time())}", "zone": "Zone Alpha", "latitude": 12.97, "longitude": 77.59}, [201, 200]),
            ("GET", "/api/v1/admin/operators", None, [200]),
            ("GET", "/api/v1/operators", None, [200]),
            ("GET", "/api/v1/admin/assignments", None, [200]),
            ("GET", "/api/v1/assignments", None, [200]),
        ]

        print("Auditing API Endpoints across /api/v1/admin/* and /api/v1/*:")
        for method, url, json_payload, expected_statuses in endpoints_to_test:
            if method == "GET":
                res = client.get(url, headers=headers)
            elif method == "POST":
                res = client.post(url, headers=headers, json=json_payload)

            status_code = res.status_code
            print(f"  [{method}] {url:<32} -> Status: {status_code}")
            assert status_code in expected_statuses, f"Endpoint {method} {url} returned unexpected status {status_code} (Expected: {expected_statuses})"
            assert status_code != 404, f"Endpoint {method} {url} returned 404 NOT FOUND!"

        print("\n==================================================================")
        print("[SUCCESS] ALL ADMIN API ENDPOINTS RETURNED HTTP 200/201 (ZERO 404s)!")
        print("==================================================================")

    except Exception as e:
        print(f"\n[ERROR] ROUTING TEST FAILED: {e}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    run_admin_api_routing_test()
