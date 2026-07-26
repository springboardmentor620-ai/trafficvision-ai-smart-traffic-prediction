from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_, desc, asc, func
from fastapi import HTTPException, status
from app.models.models import Road, User, OperatorRoadAssignment
import math

class RoadRepository:
    @staticmethod
    def format_road_dict(r: Road) -> dict:
        if not r:
            return None
        op_name = r.assigned_operator.name if r.assigned_operator else "Unassigned"
        op_data = None
        if r.assigned_operator:
            op_data = {
                "id": r.assigned_operator.id,
                "name": r.assigned_operator.name,
                "email": r.assigned_operator.email,
                "phone": r.assigned_operator.phone,
                "status": r.assigned_operator.status
            }
        
        # Fallback for road_code if None in existing rows
        code = r.road_code if r.road_code else f"RD-{r.id:03d}"

        return {
            "id": r.id,
            "road_code": code,
            "road_name": r.road_name,
            "zone": r.zone,
            "latitude": r.latitude,
            "longitude": r.longitude,
            "length_km": getattr(r, "length_km", 2.5) or 2.5,
            "lanes": getattr(r, "lanes", 4) or 4,
            "speed_limit": getattr(r, "speed_limit", 60) or 60,
            "status": r.status or "Active",
            "assigned_operator_id": r.assigned_operator_id,
            "assigned_operator_name": op_name,
            "assigned_operator": op_data,
            "created_at": r.created_at.isoformat() if r.created_at else None,
            "updated_at": r.updated_at.isoformat() if getattr(r, "updated_at", None) else (r.created_at.isoformat() if r.created_at else None)
        }

    @staticmethod
    def check_duplicate_name(db: Session, road_name: str, exclude_id: int = None) -> bool:
        """Check if road_name already exists (case-insensitive)."""
        query = db.query(Road).filter(func.lower(Road.road_name) == road_name.lower().strip())
        if exclude_id:
            query = query.filter(Road.id != exclude_id)
        return query.first() is not None

    @staticmethod
    def check_duplicate_code(db: Session, road_code: str, exclude_id: int = None) -> bool:
        """Check if road_code already exists (case-insensitive)."""
        if not road_code:
            return False
        query = db.query(Road).filter(func.lower(Road.road_code) == road_code.lower().strip())
        if exclude_id:
            query = query.filter(Road.id != exclude_id)
        return query.first() is not None

    @staticmethod
    def get_all_roads(
        db: Session,
        search: str = None,
        zone: str = None,
        status_filter: str = None,
        sort_by: str = "id",
        sort_order: str = "asc",
        page: int = None,
        limit: int = None
    ):
        query = db.query(Road).options(joinedload(Road.assigned_operator))

        # Filtering
        if search:
            search_pattern = f"%{search}%"
            query = query.filter(
                or_(
                    Road.road_name.ilike(search_pattern),
                    Road.road_code.ilike(search_pattern),
                    Road.zone.ilike(search_pattern)
                )
            )
        
        if zone and zone.upper() != "ALL":
            query = query.filter(Road.zone.ilike(zone))

        if status_filter and status_filter.upper() != "ALL":
            query = query.filter(Road.status.ilike(status_filter))

        # Sorting
        sort_col = getattr(Road, sort_by, Road.id)
        if sort_order.lower() == "desc":
            query = query.order_by(desc(sort_col))
        else:
            query = query.order_by(asc(sort_col))

        total = query.count()

        # Pagination if specified
        if page and limit and page > 0 and limit > 0:
            offset = (page - 1) * limit
            roads = query.offset(offset).limit(limit).all()
            total_pages = math.ceil(total / limit) if limit else 1
            return {
                "items": [RoadRepository.format_road_dict(r) for r in roads],
                "total": total,
                "page": page,
                "limit": limit,
                "total_pages": total_pages
            }

        roads = query.all()
        return [RoadRepository.format_road_dict(r) for r in roads]

    @staticmethod
    def get_road_by_id(db: Session, road_id: int):
        road = db.query(Road).options(joinedload(Road.assigned_operator)).filter(Road.id == road_id).first()
        if not road:
            return None
        return RoadRepository.format_road_dict(road)

    @staticmethod
    def create_road(db: Session, road_data: dict):
        # Determine status (default 'Active')
        status_val = road_data.get("status") or "Active"
        code_val = road_data.get("road_code")

        new_road = Road(
            road_name=road_data["road_name"].strip(),
            road_code=code_val.strip() if code_val else None,
            zone=road_data["zone"].strip(),
            latitude=float(road_data.get("latitude", 0.0)),
            longitude=float(road_data.get("longitude", 0.0)),
            length_km=float(road_data.get("length_km", 2.5)),
            lanes=int(road_data.get("lanes", 4)),
            speed_limit=int(road_data.get("speed_limit", 60)),
            status=status_val,
            assigned_operator_id=road_data.get("assigned_operator_id")
        )
        db.add(new_road)
        db.commit()
        db.refresh(new_road)

        # Auto-set road_code if not supplied
        if not new_road.road_code:
            new_road.road_code = f"RD-{new_road.id:03d}"
            db.commit()
            db.refresh(new_road)

        return RoadRepository.get_road_by_id(db, new_road.id)

    @staticmethod
    def update_road(db: Session, road_id: int, update_data: dict):
        road = db.query(Road).filter(Road.id == road_id).first()
        if not road:
            return None

        if "road_name" in update_data and update_data["road_name"] is not None:
            road.road_name = update_data["road_name"].strip()
        if "road_code" in update_data and update_data["road_code"] is not None:
            road.road_code = update_data["road_code"].strip()
        if "zone" in update_data and update_data["zone"] is not None:
            road.zone = update_data["zone"].strip()
        if "latitude" in update_data and update_data["latitude"] is not None:
            road.latitude = float(update_data["latitude"])
        if "longitude" in update_data and update_data["longitude"] is not None:
            road.longitude = float(update_data["longitude"])
        if "length_km" in update_data and update_data["length_km"] is not None:
            road.length_km = float(update_data["length_km"])
        if "lanes" in update_data and update_data["lanes"] is not None:
            road.lanes = int(update_data["lanes"])
        if "speed_limit" in update_data and update_data["speed_limit"] is not None:
            road.speed_limit = int(update_data["speed_limit"])
        if "status" in update_data and update_data["status"] is not None:
            road.status = update_data["status"]
        if "assigned_operator_id" in update_data:
            road.assigned_operator_id = update_data["assigned_operator_id"]

        db.commit()
        db.refresh(road)
        return RoadRepository.get_road_by_id(db, road.id)

    @staticmethod
    def archive_road(db: Session, road_id: int):
        road = db.query(Road).filter(Road.id == road_id).first()
        if not road:
            return None
        road.status = "Archived"
        db.commit()
        db.refresh(road)
        return RoadRepository.get_road_by_id(db, road.id)

    @staticmethod
    def restore_road(db: Session, road_id: int):
        road = db.query(Road).filter(Road.id == road_id).first()
        if not road:
            return None
        road.status = "Active"
        db.commit()
        db.refresh(road)
        return RoadRepository.get_road_by_id(db, road.id)

    @staticmethod
    def delete_road(db: Session, road_id: int):
        road = db.query(Road).filter(Road.id == road_id).first()
        if not road:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Road corridor with ID {road_id} not found.")

        # Check if road has an assigned operator or active assignment record
        has_operator = road.assigned_operator_id is not None
        active_assignment = db.query(OperatorRoadAssignment).filter(
            OperatorRoadAssignment.road_id == road_id,
            func.upper(OperatorRoadAssignment.status) == "ACTIVE"
        ).first()

        if has_operator or active_assignment:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot delete road corridor '{road.road_name}' because it has an active operator assigned. Please unassign the operator first."
            )

        db.delete(road)
        db.commit()
        return True

    @staticmethod
    def assign_operator(db: Session, road_id: int, operator_id: int):
        road = db.query(Road).filter(Road.id == road_id).first()
        if not road:
            return None
        road.assigned_operator_id = operator_id
        db.commit()
        db.refresh(road)
        return RoadRepository.get_road_by_id(db, road.id)
