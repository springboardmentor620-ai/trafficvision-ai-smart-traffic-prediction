import sys
import os
import jwt

backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from app.database.session import SessionLocal
from app.models.models import User
from app.utils.security import create_access_token, decode_access_token
from app.middleware.dependencies import require_roles
from fastapi import HTTPException

def run_role_routing_test():
    db = SessionLocal()
    try:
        print("==================================================================")
        print("=== TEST: Role-Based Authentication & JWT Payload Audit ===========")
        print("==================================================================\n")

        # 1. Fetch Admin User from Supabase
        admin_user = db.query(User).filter(User.role.ilike("admin")).first()
        assert admin_user is not None, "Admin user must exist in database"

        print(f"[STAGE 1] Admin Account Found: ID #{admin_user.id} | Email: '{admin_user.email}' | DB Role: '{admin_user.role}'")

        # 2. Generate JWT Access Token for Admin
        token_data = {
            "sub": str(admin_user.id),
            "email": admin_user.email,
            "role": admin_user.role,
            "name": admin_user.name
        }
        token = create_access_token(data=token_data)
        decoded_payload = decode_access_token(token)

        print(f"[STAGE 2] Decoded JWT Payload: {decoded_payload}")
        assert decoded_payload.get("sub") == str(admin_user.id)
        assert decoded_payload.get("email") == admin_user.email
        assert decoded_payload.get("role").upper() == "ADMIN"
        print("  [OK] JWT payload contains required fields: user_id, email, role")

        # 3. Test Role Guard Dependency: require_roles(["Admin"])
        admin_guard = require_roles(["Admin"])
        evaluated_admin = admin_guard(current_user=admin_user)
        assert evaluated_admin.id == admin_user.id
        print("  [OK] require_roles(['Admin']) successfully authorized Admin account")

        # 4. Fetch Operator User & Test Guard Enforcement
        op_user = db.query(User).filter(User.role.ilike("operator")).first()
        if op_user:
            try:
                admin_guard(current_user=op_user)
                assert False, "Operator should not pass Admin role guard"
            except HTTPException as e:
                assert e.status_code == 403
                print(f"  [OK] Operator account correctly BLOCKED from Admin route with HTTP {e.status_code}: {e.detail}")

        print("\n==================================================================")
        print("[SUCCESS] ROLE-BASED AUTHENTICATION & JWT AUDIT PASSED!")
        print("==================================================================")

    except Exception as e:
        print(f"\n[ERROR] TEST FAILED: {e}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    run_role_routing_test()
