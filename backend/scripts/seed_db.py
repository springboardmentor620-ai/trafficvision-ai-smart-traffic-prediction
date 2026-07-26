import os
import sys
import random
from datetime import datetime, timedelta

# Add parent directory to path so app modules can be imported
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database.session import engine, SessionLocal, Base, init_db
from app.models.models import User, Road, TrafficData, Alert, Prediction, Zone, OperatorRoadAssignment
from app.utils.security import hash_password

def seed_database():
    print("[INFO] Initializing TrafficVision AI Database Schema...")
    init_db()

    session = SessionLocal()

    try:
        print("[INFO] Cleaning existing database records...")
        session.query(OperatorRoadAssignment).delete()
        session.query(Prediction).delete()
        session.query(Alert).delete()
        session.query(TrafficData).delete()
        session.query(Road).delete()
        session.query(Zone).delete()
        session.query(User).delete()
        session.commit()

        # ----------------------------------------------------
        # 1. SEED USERS (10 Operators + 2 Admins)
        # ----------------------------------------------------
        print("[SEED] Seeding Users with bcrypt password hashes (10 Operators, 2 Admins)...")
        users = []
        
        # 2 Admins
        users.append(User(
            name="Admin Chief Controller",
            email="admin.chief@trafficvision.ai",
            password_hash=hash_password("adminpass123"),
            role="ADMIN",
            phone="+1 (555) 019-2831",
            status="ACTIVE",
            zone="All Zones"
        ))
        users.append(User(
            name="Admin System Engineer",
            email="admin.system@trafficvision.ai",
            password_hash=hash_password("adminpass123"),
            role="ADMIN",
            phone="+1 (555) 019-2832",
            status="ACTIVE",
            zone="All Zones"
        ))

        # 10 Operators with zones
        operator_data = [
            ("Operator Sarah Jenkins", "Zone Alpha - Financial District", "+1 (555) 014-9021"),
            ("Operator Marcus Vance", "Zone Beta - Midtown Hub", "+1 (555) 014-9022"),
            ("Operator Elena Rostova", "Zone Gamma - Harbor Expressway", "+1 (555) 014-9023"),
            ("Operator David Chen", "Zone Delta - Suburban Arterial", "+1 (555) 014-9024"),
            ("Operator Amara Okafor", "Zone Alpha - Financial District", "+1 (555) 014-9025"),
            ("Operator Liam O'Connor", "Zone Beta - Midtown Hub", "+1 (555) 014-9026"),
            ("Operator Priya Sharma", "Zone Gamma - Harbor Expressway", "+1 (555) 014-9027"),
            ("Operator Carlos Mendez", "Zone Delta - Suburban Arterial", "+1 (555) 014-9028"),
            ("Operator Hannah Abbott", "Zone Alpha - Financial District", "+1 (555) 014-9029"),
            ("Operator Viktor Petrov", "Zone Beta - Midtown Hub", "+1 (555) 014-9030")
        ]

        for i, (name, zone_name, phone_num) in enumerate(operator_data, start=1):
            users.append(User(
                name=name,
                email=f"operator{i}@trafficvision.ai",
                password_hash=hash_password("opPass2026!"),
                role="OPERATOR",
                phone=phone_num,
                status="ACTIVE",
                zone=zone_name
            ))

        session.add_all(users)
        session.commit()

        # Retrieve operators list (IDs assigned by DB)
        operators = session.query(User).filter(User.role == "OPERATOR").all()
        operator_ids = [op.id for op in operators]

        # ----------------------------------------------------
        # 2. SEED ZONES & ROADS (4 Zones, 20 Roads)
        # ----------------------------------------------------
        # ----------------------------------------------------
        # 2. SEED ZONES & ROADS (6 Zones, 20 Roads)
        # ----------------------------------------------------
        print("[SEED] Seeding Zones & 20 Roads...")
        zones_data = [
            ("Zone Alpha - Financial District", "High-density commercial financial district corridors"),
            ("Zone Beta - Midtown Hub", "Central arterial transit hub & commercial grid"),
            ("Zone Gamma - Harbor Expressway", "Waterfront arterial highway & tunnel approaches"),
            ("Zone Delta - Suburban Arterial", "Suburban expressways & perimeter parkways"),
            ("North Zone", "Northern metropolitan transit corridors & arterial ring roads"),
            ("South Zone", "Southern logistics corridors & express bypass routes")
        ]

        zone_objects = {}
        for z_name, z_desc in zones_data:
            z_obj = Zone(zone_name=z_name, description=z_desc)
            session.add(z_obj)
            zone_objects[z_name] = z_obj

        session.commit()

        road_names_by_zone = {
            "Zone Alpha - Financial District": [
                "5th Avenue Corridor",
                "Wall Street Junction",
                "Broadway Commercial Ave",
                "Fulton Transit Corridor",
                "Exchange Place Connector"
            ],
            "Zone Beta - Midtown Hub": [
                "42nd Street Express",
                "Madison Avenue North",
                "Park Avenue Tunnel Route",
                "Lexington Ave Arterial",
                "7th Avenue Theater Arc"
            ],
            "Zone Gamma - Harbor Expressway": [
                "West Side Highway North",
                "FDR Drive Southbound",
                "Lincoln Tunnel Approach",
                "Brooklyn Bridge Access Way",
                "Hudson Waterfront Bypass"
            ],
            "Zone Delta - Suburban Arterial": [
                "Grand Central Parkway E",
                "Queens Boulevard Central",
                "Ocean Parkway Extension",
                "Cross Bronx Expressway Node",
                "Belt Parkway Gateway"
            ]
        }

        # Base GPS coordinates for NYC region
        base_coords = [
            (40.7074, -74.0113), (40.7580, -73.9855),
            (40.7614, -73.9776), (40.7484, -73.9857),
            (40.7128, -74.0060), (40.7527, -73.9772),
            (40.7306, -73.9921), (40.7589, -74.0022),
            (40.7061, -73.9969), (40.7831, -73.9712),
            (40.7145, -73.9482), (40.7350, -73.9800),
            (40.7700, -73.9500), (40.8200, -73.9200),
            (40.6700, -73.9800), (40.7400, -73.8900),
            (40.7600, -73.8300), (40.6500, -73.9500),
            (40.8400, -73.8900), (40.6000, -74.0600)
        ]

        roads = []
        assignments = []
        coord_idx = 0
        for z_name, r_list in road_names_by_zone.items():
            z_obj = zone_objects.get(z_name)
            z_id = z_obj.id if z_obj else None
            for r_name in r_list:
                lat, lng = base_coords[coord_idx % len(base_coords)]
                assigned_op_id = operator_ids[coord_idx % len(operator_ids)]
                r_obj = Road(
                    road_name=r_name,
                    zone=z_name,
                    zone_id=z_id,
                    latitude=lat,
                    longitude=lng,
                    assigned_operator_id=assigned_op_id
                )
                roads.append(r_obj)
                coord_idx += 1

        session.add_all(roads)
        session.commit()

        # Retrieve roads with generated IDs
        db_roads = session.query(Road).all()
        road_ids = [r.id for r in db_roads]

        # Seed OperatorRoadAssignments junction records
        for r in db_roads:
            if r.assigned_operator_id:
                assignments.append(OperatorRoadAssignment(
                    operator_id=r.assigned_operator_id,
                    road_id=r.id,
                    zone_id=r.zone_id,
                    assigned_by="Admin Chief Controller",
                    status="ACTIVE"
                ))

        session.add_all(assignments)
        session.commit()

        # ----------------------------------------------------
        # 3. SEED TRAFFIC RECORDS (1,000 Records)
        # ----------------------------------------------------
        print("[SEED] Seeding 1,000 TrafficData telemetry records...")
        traffic_records = []
        now = datetime.now()
        
        congestion_levels = ["Low", "Moderate", "High", "Critical"]

        for i in range(1000):
            # Spread timestamps over past 7 days
            random_minutes = random.randint(0, 7 * 24 * 60)
            record_time = now - timedelta(minutes=random_minutes)
            
            selected_road_id = random.choice(road_ids)
            vehicle_count = random.randint(15, 380)
            
            # Speed inversely correlated with vehicle count
            if vehicle_count < 80:
                avg_speed = random.uniform(55.0, 95.0)
                level = "Low"
            elif vehicle_count < 180:
                avg_speed = random.uniform(35.0, 55.0)
                level = "Moderate"
            elif vehicle_count < 280:
                avg_speed = random.uniform(18.0, 35.0)
                level = "High"
            else:
                avg_speed = random.uniform(5.0, 18.0)
                level = "Critical"

            traffic_records.append(TrafficData(
                road_id=selected_road_id,
                vehicle_count=vehicle_count,
                average_speed=round(avg_speed, 1),
                congestion_level=level,
                timestamp=record_time
            ))

        session.add_all(traffic_records)
        session.commit()

        # ----------------------------------------------------
        # 4. SEED ALERTS (50 Records)
        # ----------------------------------------------------
        print("[SEED] Seeding 50 Alerts...")
        alert_types = [
            "Congestion Spike",
            "Accident Hazard",
            "Signal Timing Failure",
            "Emergency Corridor Priority",
            "Severe Weather Slowdown",
            "Lane Obstruction"
        ]
        severities = ["Low", "Medium", "High", "Critical"]
        statuses = ["Active", "Resolved", "Dismissed"]

        alerts = []
        for i in range(50):
            random_minutes = random.randint(5, 48 * 60) # within past 48h
            alert_time = now - timedelta(minutes=random_minutes)
            
            alerts.append(Alert(
                road_id=random.choice(road_ids),
                alert_type=random.choice(alert_types),
                severity=random.choice(severities),
                status=random.choice(statuses),
                created_at=alert_time
            ))

        session.add_all(alerts)
        session.commit()

        # ----------------------------------------------------
        # 5. SEED PREDICTIONS (50 Records)
        # ----------------------------------------------------
        print("[SEED] Seeding 50 Traffic Predictions...")
        prediction_templates = [
            "Expected 35% increase in vehicle volume during evening peak",
            "High congestion formation predicted within 20 minutes",
            "Green-wave timing optimization recommended (+15s green duration)",
            "Tailback expected to extend 250m towards express ramp",
            "Flow normalization projected within 30 minutes"
        ]

        predictions = []
        for i in range(50):
            future_minutes = random.randint(10, 120)
            pred_time = now + timedelta(minutes=future_minutes)
            
            predictions.append(Prediction(
                road_id=random.choice(road_ids),
                prediction=random.choice(prediction_templates),
                confidence=round(random.uniform(0.78, 0.98), 2),
                prediction_time=pred_time
            ))

        session.add_all(predictions)
        session.commit()

        # ----------------------------------------------------
        # VERIFICATION REPORT
        # ----------------------------------------------------
        u_count = session.query(User).count()
        r_count = session.query(Road).count()
        t_count = session.query(TrafficData).count()
        a_count = session.query(Alert).count()
        p_count = session.query(Prediction).count()

        print("\n[SUCCESS] DATABASE SEEDING COMPLETE!")
        print("---------------------------------------")
        print(f" Users Inserted:         {u_count}")
        print(f" Roads Inserted:         {r_count}")
        print(f" Traffic Records:        {t_count}")
        print(f" Alerts Inserted:        {a_count}")
        print(f" Predictions Inserted:   {p_count}")
        print("---------------------------------------")

    except Exception as e:
        session.rollback()
        print(f" ERROR DURING SEEDING: {e}")
        raise e
    finally:
        session.close()

if __name__ == "__main__":
    seed_database()
