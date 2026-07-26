from sqlalchemy.orm import Session
from sqlalchemy import or_, func
from app.models.models import User, Road, Alert
from app.utils.security import hash_password, generate_temporary_password
from app.utils.cache import ttl_cache
from fastapi import HTTPException, status
from typing import Optional, List, Dict, Any

class OperatorRepository:

    @staticmethod
    def _format_operator(op: User, db: Session) -> Dict[str, Any]:
        assigned_roads = db.query(Road).filter(Road.assigned_operator_id == op.id).all()
        derived_zone = op.zone or (assigned_roads[0].zone if assigned_roads else "Unassigned")
        
        # Calculate recent performance metrics & alerts for operator profile
        alerts_resolved = db.query(Alert).filter(Alert.assigned_operator_id == op.id, func.lower(Alert.status) == "resolved").count()
        alerts_active = db.query(Alert).filter(Alert.assigned_operator_id == op.id, func.lower(Alert.status) == "active").count()

        # Query recent alerts for assigned corridors or assigned operator
        road_ids = [r.id for r in assigned_roads]
        recent_alerts = []
        if road_ids or op.id:
            alerts_query = db.query(Alert).filter(
                or_(
                    Alert.assigned_operator_id == op.id,
                    Alert.road_id.in_(road_ids) if road_ids else False
                )
            ).order_by(Alert.created_at.desc()).limit(10).all()

            for a in alerts_query:
                road_obj = next((r for r in assigned_roads if r.id == a.road_id), None)
                r_name = road_obj.road_name if road_obj else f"Corridor #{a.road_id}"
                recent_alerts.append({
                    "id": a.id,
                    "road_id": a.road_id,
                    "road_name": r_name,
                    "alert_type": a.alert_type,
                    "severity": a.severity,
                    "status": a.status,
                    "notes": a.notes,
                    "created_at": a.created_at.isoformat() if a.created_at else None
                })

        shift_val = getattr(op, "shift", "Day Shift (08:00 - 16:00)") or "Day Shift (08:00 - 16:00)"
        designation_val = getattr(op, "designation", "Senior Traffic Controller") or "Senior Traffic Controller"
        avatar_val = getattr(op, "avatar_url", None) or f"https://api.dicebear.com/7.x/avataaars/svg?seed={op.name.replace(' ', '')}"
        last_login_val = op.last_login.isoformat() if getattr(op, "last_login", None) else None

        activity_history = [
            {"id": 1, "text": f"Operator '{op.name}' logged into Control Console", "timestamp": last_login_val or "Recent", "type": "auth"},
            {"id": 2, "text": f"Scoped monitoring to {len(assigned_roads)} assigned corridors in {derived_zone}", "timestamp": "Active", "type": "monitoring"},
            {"id": 3, "text": f"Processed and updated {alerts_resolved} corridor alerts during duty shift", "timestamp": "Today", "type": "alert"}
        ]

        return {
            "id": op.id,
            "name": op.name,
            "email": op.email,
            "phone": op.phone or "N/A",
            "role": op.role,
            "status": getattr(op, "status", "ACTIVE") or "ACTIVE",
            "zone": derived_zone,
            "shift": shift_val,
            "designation": designation_val,
            "avatar_url": avatar_val,
            "last_login": last_login_val,
            "assigned_road_count": len(assigned_roads),
            "assigned_roads": [{"id": r.id, "road_name": r.road_name, "road_code": r.road_code or f"RD-{r.id:03d}", "zone": r.zone} for r in assigned_roads],
            "performance": {
                "alerts_resolved": alerts_resolved,
                "alerts_active": alerts_active,
                "uptime_percentage": "99.8%",
                "shift_compliance": "Optimal"
            },
            "recent_alerts": recent_alerts,
            "recent_activity": activity_history,
            "activity_history": activity_history,
            "created_at": op.created_at.isoformat() if op.created_at else None,
            "updated_at": op.updated_at.isoformat() if getattr(op, "updated_at", None) else (op.created_at.isoformat() if op.created_at else None)
        }

    @staticmethod
    def get_all_operators(
        db: Session,
        search: Optional[str] = None,
        zone: Optional[str] = None,
        status_filter: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        query = db.query(User).filter(func.lower(User.role) == "operator")

        if search:
            search_pattern = f"%{search.strip()}%"
            query = query.filter(
                or_(
                    User.name.ilike(search_pattern),
                    User.email.ilike(search_pattern),
                    User.phone.ilike(search_pattern),
                    User.zone.ilike(search_pattern)
                )
            )

        if zone and zone.upper() != "ALL":
            query = query.filter(User.zone.ilike(f"%{zone.strip()}%"))

        if status_filter and status_filter.upper() != "ALL":
            query = query.filter(func.lower(User.status) == status_filter.lower())

        operators = query.order_by(User.id.asc()).all()
        if not operators:
            return []

        # Bulk load assigned roads for all fetched operators
        op_ids = [op.id for op in operators]
        all_assigned_roads = db.query(Road).filter(Road.assigned_operator_id.in_(op_ids)).all()
        roads_by_op = {}
        for r in all_assigned_roads:
            roads_by_op.setdefault(r.assigned_operator_id, []).append(r)

        # Bulk load alert counts (resolved and active)
        alert_counts_raw = db.query(
            Alert.assigned_operator_id,
            func.lower(Alert.status),
            func.count(Alert.id)
        ).filter(Alert.assigned_operator_id.in_(op_ids)).group_by(
            Alert.assigned_operator_id,
            func.lower(Alert.status)
        ).all()

        alert_counts_map = {}
        for op_id_val, st_val, cnt in alert_counts_raw:
            alert_counts_map[(op_id_val, st_val)] = cnt

        # Bulk load recent alerts
        all_recent_alerts = db.query(Alert).filter(
            or_(
                Alert.assigned_operator_id.in_(op_ids),
                Alert.road_id.in_([r.id for r in all_assigned_roads]) if all_assigned_roads else False
            )
        ).order_by(Alert.created_at.desc()).limit(200).all()

        alerts_by_op = {}
        alerts_by_road = {}
        for a in all_recent_alerts:
            if a.assigned_operator_id:
                alerts_by_op.setdefault(a.assigned_operator_id, []).append(a)
            if a.road_id:
                alerts_by_road.setdefault(a.road_id, []).append(a)

        from datetime import datetime
        result = []
        for op in operators:
            assigned_roads = roads_by_op.get(op.id, [])
            derived_zone = op.zone or (assigned_roads[0].zone if assigned_roads else "Unassigned")
            alerts_resolved = alert_counts_map.get((op.id, "resolved"), 0)
            alerts_active = alert_counts_map.get((op.id, "active"), 0)

            op_alerts = list(alerts_by_op.get(op.id, []))
            for r in assigned_roads:
                for a in alerts_by_road.get(r.id, []):
                    if a not in op_alerts:
                        op_alerts.append(a)
            op_alerts.sort(key=lambda x: x.created_at or datetime.min, reverse=True)
            recent_alerts_slice = op_alerts[:10]

            recent_alerts = []
            for a in recent_alerts_slice:
                road_obj = next((r for r in assigned_roads if r.id == a.road_id), None)
                r_name = road_obj.road_name if road_obj else f"Corridor #{a.road_id}"
                recent_alerts.append({
                    "id": a.id,
                    "road_id": a.road_id,
                    "road_name": r_name,
                    "alert_type": a.alert_type,
                    "severity": a.severity,
                    "status": a.status,
                    "notes": a.notes,
                    "created_at": a.created_at.isoformat() if a.created_at else None
                })

            shift_val = getattr(op, "shift", "Day Shift (08:00 - 16:00)") or "Day Shift (08:00 - 16:00)"
            designation_val = getattr(op, "designation", "Senior Traffic Controller") or "Senior Traffic Controller"
            avatar_val = getattr(op, "avatar_url", None) or f"https://api.dicebear.com/7.x/avataaars/svg?seed={op.name.replace(' ', '')}"
            last_login_val = op.last_login.isoformat() if getattr(op, "last_login", None) else None

            activity_history = [
                {"id": 1, "text": f"Operator '{op.name}' logged into Control Console", "timestamp": last_login_val or "Recent", "type": "auth"},
                {"id": 2, "text": f"Scoped monitoring to {len(assigned_roads)} assigned corridors in {derived_zone}", "timestamp": "Active", "type": "monitoring"},
                {"id": 3, "text": f"Processed and updated {alerts_resolved} corridor alerts during duty shift", "timestamp": "Today", "type": "alert"}
            ]

            result.append({
                "id": op.id,
                "name": op.name,
                "email": op.email,
                "phone": op.phone or "N/A",
                "role": op.role,
                "status": getattr(op, "status", "ACTIVE") or "ACTIVE",
                "zone": derived_zone,
                "shift": shift_val,
                "designation": designation_val,
                "avatar_url": avatar_val,
                "last_login": last_login_val,
                "assigned_road_count": len(assigned_roads),
                "assigned_roads": [{"id": r.id, "road_name": r.road_name, "road_code": r.road_code or f"RD-{r.id:03d}", "zone": r.zone} for r in assigned_roads],
                "performance": {
                    "alerts_resolved": alerts_resolved,
                    "alerts_active": alerts_active,
                    "uptime_percentage": "99.8%",
                    "shift_compliance": "Optimal"
                },
                "recent_alerts": recent_alerts,
                "recent_activity": activity_history,
                "activity_history": activity_history,
                "created_at": op.created_at.isoformat() if op.created_at else None,
                "updated_at": op.updated_at.isoformat() if getattr(op, "updated_at", None) else (op.created_at.isoformat() if op.created_at else None)
            })

        return result

    @staticmethod
    def get_operator_by_id(db: Session, operator_id: int) -> Optional[Dict[str, Any]]:
        op = db.query(User).filter(
            User.id == operator_id,
            func.lower(User.role) == "operator"
        ).first()
        if not op:
            return None
        return OperatorRepository._format_operator(op, db)

    @staticmethod
    def create_operator(db: Session, data: dict) -> Dict[str, Any]:
        email = data["email"].strip().lower()
        phone = data.get("phone", "").strip() or None
        
        # Check duplicate email
        existing_email = db.query(User).filter(func.lower(User.email) == email).first()
        if existing_email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Email '{email}' already exists. Emails must be unique."
            )

        # Check duplicate phone
        if phone:
            existing_phone = db.query(User).filter(User.phone == phone).first()
            if existing_phone:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Phone number '{phone}' already exists. Phone numbers must be unique."
                )

        # Generate temporary password automatically
        temp_password = generate_temporary_password()
        hashed_pwd = hash_password(temp_password)

        zone_val = data.get("zone")
        shift_val = data.get("shift")
        desig_val = data.get("designation")
        avatar_val = data.get("avatar_url")

        new_op = User(
            name=data["name"].strip(),
            email=email,
            password_hash=hashed_pwd,
            role="OPERATOR",
            phone=phone,
            status=(data.get("status") or "ACTIVE").upper(),
            zone=zone_val.strip() if zone_val else "Zone Alpha",
            shift=shift_val.strip() if shift_val else "Day Shift (08:00 - 16:00)",
            designation=desig_val.strip() if desig_val else "Senior Traffic Controller",
            avatar_url=avatar_val.strip() if avatar_val else None
        )
        db.add(new_op)
        db.commit()
        db.refresh(new_op)

        # Assign roads if specified
        assigned_road_ids = data.get("assigned_roads") or data.get("road_ids") or []
        if assigned_road_ids:
            db.query(Road).filter(Road.id.in_(assigned_road_ids)).update(
                {"assigned_operator_id": new_op.id},
                synchronize_session=False
            )
            db.commit()
            db.expire_all()

        ttl_cache.invalidate()
        formatted_op = OperatorRepository._format_operator(new_op, db)

        return {
            "message": "Operator created successfully.",
            "operator": formatted_op,
            "temporary_password": temp_password
        }

    @staticmethod
    def update_operator(db: Session, operator_id: int, update_data: dict) -> Optional[Dict[str, Any]]:
        op = db.query(User).filter(
            User.id == operator_id,
            func.lower(User.role) == "operator"
        ).first()
        if not op:
            raise HTTPException(status_code=404, detail="Operator not found.")

        if "email" in update_data and update_data["email"]:
            new_email = update_data["email"].strip().lower()
            if new_email != op.email.lower():
                existing = db.query(User).filter(func.lower(User.email) == new_email).first()
                if existing:
                    raise HTTPException(status_code=400, detail=f"Email '{new_email}' already exists.")
                op.email = new_email

        if "phone" in update_data and update_data["phone"]:
            new_phone = update_data["phone"].strip()
            if new_phone != (op.phone or ''):
                existing_p = db.query(User).filter(User.phone == new_phone).first()
                if existing_p and existing_p.id != operator_id:
                    raise HTTPException(status_code=400, detail=f"Phone '{new_phone}' already exists.")
                op.phone = new_phone

        if "name" in update_data and update_data["name"]:
            op.name = update_data["name"].strip()
        if "zone" in update_data and update_data["zone"]:
            op.zone = update_data["zone"].strip()
        if "shift" in update_data and update_data["shift"]:
            op.shift = update_data["shift"].strip()
        if "designation" in update_data and update_data["designation"]:
            op.designation = update_data["designation"].strip()
        if "status" in update_data and update_data["status"]:
            op.status = update_data["status"].upper()

        if "assigned_roads" in update_data or "road_ids" in update_data:
            assigned_road_ids = update_data.get("assigned_roads") or update_data.get("road_ids") or []
            db.query(Road).filter(Road.assigned_operator_id == operator_id).update(
                {"assigned_operator_id": None}, synchronize_session=False
            )
            if assigned_road_ids:
                db.query(Road).filter(Road.id.in_(assigned_road_ids)).update(
                    {"assigned_operator_id": operator_id}, synchronize_session=False
                )

        db.commit()
        db.refresh(op)
        ttl_cache.invalidate()
        return OperatorRepository._format_operator(op, db)

    @staticmethod
    def update_operator_status(db: Session, operator_id: int, new_status: str) -> Dict[str, Any]:
        op = db.query(User).filter(
            User.id == operator_id,
            func.lower(User.role) == "operator"
        ).first()
        if not op:
            raise HTTPException(status_code=404, detail="Operator not found.")

        op.status = new_status.upper()
        db.commit()
        db.refresh(op)
        ttl_cache.invalidate()
        return OperatorRepository._format_operator(op, db)

    @staticmethod
    def assign_operator_roads(db: Session, operator_id: int, zone: Optional[str], road_ids: List[int]) -> Dict[str, Any]:
        op = db.query(User).filter(
            User.id == operator_id,
            func.lower(User.role) == "operator"
        ).first()
        if not op:
            raise HTTPException(status_code=404, detail="Operator not found.")

        if zone:
            op.zone = zone.strip()

        # Unassign previous roads for this operator
        db.query(Road).filter(Road.assigned_operator_id == operator_id).update(
            {"assigned_operator_id": None},
            synchronize_session=False
        )

        # Assign new roads
        if road_ids:
            db.query(Road).filter(Road.id.in_(road_ids)).update(
                {"assigned_operator_id": operator_id},
                synchronize_session=False
            )

        db.commit()
        db.expire_all()
        db.refresh(op)
        ttl_cache.invalidate()
        return OperatorRepository._format_operator(op, db)

    @staticmethod
    def get_operator_roads(db: Session, operator_id: int) -> List[Dict[str, Any]]:
        op = db.query(User).filter(
            User.id == operator_id,
            func.lower(User.role) == "operator"
        ).first()
        if not op:
            raise HTTPException(status_code=404, detail="Operator not found.")
        
        assigned_roads = db.query(Road).filter(Road.assigned_operator_id == operator_id).all()
        return [{"id": r.id, "road_name": r.road_name, "road_code": r.road_code or f"RD-{r.id:03d}", "zone": r.zone, "latitude": r.latitude, "longitude": r.longitude} for r in assigned_roads]

    @staticmethod
    def delete_operator(db: Session, operator_id: int) -> bool:
        op = db.query(User).filter(
            User.id == operator_id,
            func.lower(User.role) == "operator"
        ).first()
        if not op:
            raise HTTPException(status_code=404, detail="Operator not found.")

        from app.models.models import OperatorRoadAssignment
        db.query(OperatorRoadAssignment).filter(OperatorRoadAssignment.operator_id == operator_id).delete(synchronize_session=False)

        # Unassign roads first
        db.query(Road).filter(Road.assigned_operator_id == operator_id).update(
            {"assigned_operator_id": None},
            synchronize_session=False
        )
        db.delete(op)
        db.commit()
        ttl_cache.invalidate()
        return True

    @staticmethod
    def reset_operator_password(db: Session, operator_id: int) -> Dict[str, Any]:
        op = db.query(User).filter(
            User.id == operator_id,
            func.lower(User.role) == "operator"
        ).first()
        if not op:
            raise HTTPException(status_code=404, detail="Operator not found.")

        temp_password = generate_temporary_password()
        op.password_hash = hash_password(temp_password)
        db.commit()
        db.refresh(op)
        ttl_cache.invalidate()

        return {
            "message": f"Password reset successfully for operator '{op.name}'.",
            "temporary_password": temp_password,
            "operator": OperatorRepository._format_operator(op, db)
        }
