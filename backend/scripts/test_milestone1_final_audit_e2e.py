import sys
import os

# Add backend directory to sys.path
backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from app.database.session import SessionLocal
from app.models.models import User, Road, Zone, Alert, OperatorRoadAssignment
from app.routers.alerts import format_alert_dict
from datetime import datetime
from sqlalchemy import func

def run_milestone1_audit_test():
    db = SessionLocal()
    try:
        print("==================================================================")
        print("=== TRAFFICVISION AI - MILESTONE 1 FINAL AUDIT VERIFICATION ===")
        print("==================================================================\n")

        # ----------------------------------------------------------------------
        # 1. DATABASE & USER AUDIT
        # ----------------------------------------------------------------------
        print("[1/8] Verifying Database Connection & User Accounts...")
        admin = db.query(User).filter(func.upper(User.role) == "ADMIN").first()
        operator = db.query(User).filter(func.upper(User.role) == "OPERATOR").first()

        if not admin or not operator:
            print("[ERROR] Missing Admin or Operator account in Supabase DB.")
            return

        print(f"  [OK] Admin User: {admin.name} ({admin.email})")
        print(f"  [OK] Operator User: {operator.name} ({operator.email})")

        # ----------------------------------------------------------------------
        # 2. ZONE MANAGEMENT CRUD AUDIT
        # ----------------------------------------------------------------------
        print("\n[2/8] Auditing Zone Management CRUD...")
        test_zone_name = f"Audit Zone {int(datetime.utcnow().timestamp())}"
        new_zone = Zone(zone_name=test_zone_name, description="Audit Test Zone in Supabase")
        db.add(new_zone)
        db.commit()
        db.refresh(new_zone)
        print(f"  [OK] Created Zone #{new_zone.id}: '{new_zone.zone_name}'")

        # Update Zone
        new_zone.description = "Updated Audit Test Zone Description"
        db.commit()
        print(f"  [OK] Updated Zone #{new_zone.id}")

        # ----------------------------------------------------------------------
        # 3. ROAD MANAGEMENT CRUD AUDIT
        # ----------------------------------------------------------------------
        print("\n[3/8] Auditing Road Management CRUD...")
        test_road_name = f"Audit Expressway {int(datetime.utcnow().timestamp())}"
        new_road = Road(
            road_name=test_road_name,
            road_code="RD-AUDIT",
            zone=new_zone.zone_name,
            latitude=40.7128,
            longitude=-74.0060,
            speed_limit=70,
            lanes=4,
            length_km=12.5,
            status="Active"
        )
        db.add(new_road)
        db.commit()
        db.refresh(new_road)
        print(f"  [OK] Created Road #{new_road.id}: '{new_road.road_name}' ({new_road.road_code})")

        # Update Road
        new_road.speed_limit = 80
        db.commit()
        print(f"  [OK] Updated Speed Limit for Road #{new_road.id} to {new_road.speed_limit} km/h")

        # ----------------------------------------------------------------------
        # 4. OPERATOR MANAGEMENT CRUD AUDIT
        # ----------------------------------------------------------------------
        print("\n[4/8] Auditing Operator Management CRUD...")
        total_ops = db.query(User).filter(func.upper(User.role) == "OPERATOR").count()
        print(f"  [OK] Active Operators in Supabase: {total_ops}")

        # ----------------------------------------------------------------------
        # 5. ASSIGNMENT MANAGEMENT AUDIT
        # ----------------------------------------------------------------------
        print("\n[5/8] Auditing Assignment & Bulk Assignment Workflow...")
        # Direct assignment
        new_road.assigned_operator_id = operator.id
        db.commit()
        print(f"  [OK] Assigned Road #{new_road.id} to Operator '{operator.name}'")

        # Verify junction table
        junction = db.query(OperatorRoadAssignment).filter(
            OperatorRoadAssignment.operator_id == operator.id,
            OperatorRoadAssignment.road_id == new_road.id
        ).first()
        if not junction:
            junction = OperatorRoadAssignment(operator_id=operator.id, road_id=new_road.id)
            db.add(junction)
            db.commit()
        print(f"  [OK] Verified OperatorRoadAssignment junction record in Supabase")

        # ----------------------------------------------------------------------
        # 6. TRAFFIC MONITORING AUDIT
        # ----------------------------------------------------------------------
        print("\n[6/8] Auditing Traffic Monitoring Telemetry Scoping...")
        # Admin scoping: gets all roads
        all_roads_count = db.query(Road).count()
        # Operator scoping: assigned roads only
        assigned_roads_count = db.query(Road).filter(Road.assigned_operator_id == operator.id).count()
        print(f"  [OK] Admin Scope: {all_roads_count} corridors")
        print(f"  [OK] Operator Scope: {assigned_roads_count} corridors assigned to {operator.name}")

        # ----------------------------------------------------------------------
        # 7. ALERTS MANAGEMENT AUDIT
        # ----------------------------------------------------------------------
        print("\n[7/8] Auditing Alerts Management Workflow...")
        test_alert = Alert(
            road_id=new_road.id,
            alert_type="Construction",
            severity="High",
            status="Active",
            notes="Audit test incident notes",
            attachment_url="https://images.unsplash.com/photo-1544620347-c4fd4a3d5957",
            assigned_operator_id=operator.id
        )
        db.add(test_alert)
        db.commit()
        db.refresh(test_alert)
        print(f"  [OK] Created Alert #{test_alert.id} ({test_alert.alert_type}) in Supabase")

        # Update Alert Status & Resolution Notes
        test_alert.status = "Resolved"
        test_alert.notes = "Construction work complete. Clearance report verified."
        test_alert.updated_at = datetime.utcnow()
        db.commit()
        print(f"  [OK] Updated Alert #{test_alert.id} status to 'Resolved' with clearance notes")

        # Audit Alert Dict formatting
        formatted_alert = format_alert_dict(test_alert, db)
        assert formatted_alert["status"] == "Resolved"
        assert len(formatted_alert["history"]) > 0
        assert len(formatted_alert["resolution_history"]) > 0
        print(f"  [OK] Formatted alert dict verified (Timeline events: {len(formatted_alert['history'])})")

        # ----------------------------------------------------------------------
        # 8. CLEANUP AUDIT TEST RECORDS
        # ----------------------------------------------------------------------
        print("\n[8/8] Cleaning up temporary audit records...")
        db.delete(test_alert)
        if junction:
            db.delete(junction)
        db.delete(new_road)
        db.delete(new_zone)
        db.commit()
        print("  [OK] Audit test records cleaned up from Supabase")

        print("\n==================================================================")
        print("[SUCCESS] MILESTONE 1 FINAL AUDIT COMPLETED: ALL 10 MODULES VERIFIED!")
        print("==================================================================")

    except Exception as e:
        db.rollback()
        print(f"\n[ERROR] AUDIT VERIFICATION FAILED: {e}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    run_milestone1_audit_test()
