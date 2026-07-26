import sys
import os

# Add backend directory to sys.path
backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from app.database.session import SessionLocal
from app.models.models import User, Road, Alert
from app.routers.alerts import format_alert_dict
from datetime import datetime
from sqlalchemy import func

def run_e2e_alerts_test():
    db = SessionLocal()
    try:
        print("=== E2E TEST: Phase 10 - Alerts Management Workflow ===")
        
        # 1. Fetch admin user & operator user (case-insensitive role check)
        admin = db.query(User).filter(func.upper(User.role) == "ADMIN").first()
        operator = db.query(User).filter(func.upper(User.role) == "OPERATOR").first()
        road = db.query(Road).first()

        if not admin or not operator or not road:
            print("[ERROR] Required admin, operator, or road record missing in DB.")
            return

        print(f"[OK] Found Admin: {admin.email} (ID: {admin.id})")
        print(f"[OK] Found Operator: {operator.email} (ID: {operator.id})")
        print(f"[OK] Found Target Road: {road.road_name} (ID: {road.id})")

        # 2. Create Incident Alert in Supabase
        test_alert_type = "Emergency"
        new_alert = Alert(
            road_id=road.id,
            alert_type=test_alert_type,
            severity="Critical",
            status="Active",
            notes="Emergency blockage reported near bridge sector 4",
            attachment_url="https://images.unsplash.com/photo-1544620347-c4fd4a3d5957",
            assigned_operator_id=operator.id
        )
        db.add(new_alert)
        db.commit()
        db.refresh(new_alert)
        alert_id = new_alert.id
        print(f"[OK] Created test alert #{alert_id} ({test_alert_type}) in Supabase")

        # 3. Test format_alert_dict
        formatted = format_alert_dict(new_alert, db)
        assert formatted["id"] == alert_id
        assert formatted["alert_type"] == test_alert_type
        assert "timeline" in formatted
        assert "resolution_history" in formatted
        print("[OK] Verified format_alert_dict includes timeline & resolution_history")

        # 4. Update Status to IN_PROGRESS
        new_alert.status = "In Progress"
        new_alert.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(new_alert)
        print(f"[OK] Updated alert #{alert_id} status to 'In Progress'")

        # 5. Add Operational Resolution Notes
        new_alert.notes = "Emergency response unit dispatched. Clear lane established."
        new_alert.status = "Resolved"
        new_alert.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(new_alert)
        print(f"[OK] Updated alert #{alert_id} notes and status to 'Resolved'")

        # 6. Verify formatted output after resolution
        formatted_res = format_alert_dict(new_alert, db)
        assert formatted_res["status"] == "Resolved"
        assert len(formatted_res["resolution_history"]) > 0
        print("[OK] Verified resolution history log updated in Supabase")

        # 7. Clean up test alert
        db.delete(new_alert)
        db.commit()
        print(f"[OK] Successfully deleted test alert #{alert_id} from Supabase")

        print("\nALL PHASE 10 ALERTS MANAGEMENT BACKEND TESTS PASSED!")

    except Exception as e:
        db.rollback()
        print(f"[ERROR] TEST FAILED: {e}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    run_e2e_alerts_test()
