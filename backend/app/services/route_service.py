import math
from sqlalchemy.orm import Session
from app.models.traffic import Traffic
from app.models.road import Road

# Known Bengaluru Landmark & Junction Coordinates
LOCATION_COORDINATES = {
    "mg road": [12.9756, 77.6066],
    "m.g. road": [12.9756, 77.6066],
    "indiranagar": [12.9716, 77.6412],
    "100 feet road": [12.9716, 77.6412],
    "whitefield": [12.9698, 77.7499],
    "marathahalli": [12.9591, 77.6974],
    "marathahalli bridge": [12.9591, 77.6974],
    "koramangala": [12.9352, 77.6245],
    "sony world junction": [12.9352, 77.6245],
    "electronic city": [12.8458, 77.6602],
    "hebbal": [13.0358, 77.5970],
    "hebbal flyover": [13.0358, 77.5970],
    "airport road": [13.1986, 77.7066],
    "kempegowda airport": [13.1986, 77.7066],
    "kia airport": [13.1986, 77.7066],
    "yeshwanthpur": [13.0238, 77.5529],
    "yeshwanthpur circle": [13.0238, 77.5529],
    "jayanagar": [12.9250, 77.5938],
    "outer ring road": [12.9260, 77.6762],
    "hosur road": [12.9177, 77.6238],
    "silk board": [12.9177, 77.6238],
    "hsr layout": [12.9121, 77.6446],
    "old airport road": [12.9597, 77.6580],
    "sarjapur road": [12.9105, 77.6850],
    "majestic": [12.9767, 77.5713],
    "banashankari": [12.9255, 77.5468],
    "bellandur": [12.9304, 77.6784],
    "cmh road": [12.9785, 77.6380],
    "trinity circle": [12.9729, 77.6174],
}

def get_coord(name: str, fallback_lat=12.9716, fallback_lng=77.5946):
    key = (name or "").strip().lower()
    for loc, coord in LOCATION_COORDINATES.items():
        if loc in key or key in loc:
            return coord
    return [fallback_lat, fallback_lng]

def compute_dist(p1, p2):
    # Haversine approximation in km
    lat1, lon1 = p1
    lat2, lon2 = p2
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat / 2) ** 2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2) ** 2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return round(6371 * c, 1)


class RouteService:

    @staticmethod
    def optimize_route(
        db: Session,
        source: str,
        destination: str,
    ):
        src_name = (source or "M.G. Road").strip()
        dst_name = (destination or "Whitefield").strip()

        src_coord = get_coord(src_name, 12.9756, 77.6066)
        dst_coord = get_coord(dst_name, 12.9698, 77.7499)

        # Query live traffic roads for real-time telemetry
        live_traffic = (
            db.query(Traffic)
            .join(Road)
            .order_by(Traffic.average_speed.desc(), Traffic.vehicles.asc())
            .limit(6)
            .all()
        )

        def clean_road(r):
            if isinstance(r, str):
                return r
            if isinstance(r, dict):
                return r.get("name") or r.get("road") or r.get("road_name") or "Corridor"
            if hasattr(r, "road") and r.road:
                if hasattr(r.road, "name"):
                    return r.road.name
                return str(r.road)
            if hasattr(r, "name"):
                return r.name
            return str(r)

        corridor_names = [clean_road(r) for r in live_traffic] if live_traffic else [
            "100 Feet Road", "Outer Ring Road", "Hosur Road", "Marathahalli Bridge"
        ]


        # Calculate straight-line base distance
        direct_dist = compute_dist(src_coord, dst_coord)
        route_dist_primary = max(round(direct_dist * 1.25, 1), 5.4)
        route_dist_alt = max(round(direct_dist * 1.45, 1), 6.8)

        # Average network velocity
        avg_speed_primary = (
            round(sum([r.average_speed for r in live_traffic[:3]]) / max(len(live_traffic[:3]), 1), 1)
            if live_traffic else 52.0
        )
        avg_speed_alt = max(round(avg_speed_primary * 0.88, 1), 35.0)

        time_primary_mins = max(int((route_dist_primary / max(avg_speed_primary, 15.0)) * 60), 6)
        time_alt_mins = max(int((route_dist_alt / max(avg_speed_alt, 15.0)) * 60), 9)

        # Generate Intermediate Waypoints for Leaflet Polyline
        mid_lat = (src_coord[0] + dst_coord[0]) / 2
        mid_lng = (src_coord[1] + dst_coord[1]) / 2

        # Primary Waypoints (Slight deviation along arterial highways)
        primary_coords = [
            src_coord,
            [src_coord[0] * 0.7 + mid_lat * 0.3 + 0.003, src_coord[1] * 0.7 + mid_lng * 0.3 - 0.002],
            [mid_lat + 0.005, mid_lng + 0.008],
            [dst_coord[0] * 0.4 + mid_lat * 0.6 - 0.002, dst_coord[1] * 0.4 + mid_lng * 0.6 + 0.004],
            dst_coord,
        ]

        # Alternate Waypoints (Wider bypass route)
        alt_coords = [
            src_coord,
            [src_coord[0] * 0.8 + mid_lat * 0.2 - 0.008, src_coord[1] * 0.8 + mid_lng * 0.2 - 0.006],
            [mid_lat - 0.012, mid_lng + 0.015],
            [dst_coord[0] * 0.5 + mid_lat * 0.5 + 0.009, dst_coord[1] * 0.5 + mid_lng * 0.5 - 0.004],
            dst_coord,
        ]

        # Detailed Turn-by-Turn Corridor Segments for Primary Route
        primary_segments = [
            {
                "step": 1,
                "corridor": src_name,
                "instruction": f"Depart from {src_name} and merge onto main arterial corridor",
                "distance": f"{round(route_dist_primary * 0.25, 1)} km",
                "speed": f"{avg_speed_primary} km/h",
                "status": "Normal Flow",
                "risk": "Low",
            },
            {
                "step": 2,
                "corridor": corridor_names[0] if len(corridor_names) > 0 else "Outer Ring Road",
                "instruction": f"Continue along {corridor_names[0] if len(corridor_names) > 0 else 'Outer Ring Road'} express flyover",
                "distance": f"{round(route_dist_primary * 0.45, 1)} km",
                "speed": f"{round(avg_speed_primary * 1.1, 1)} km/h",
                "status": "Free Flow",
                "risk": "Low",
            },
            {
                "step": 3,
                "corridor": corridor_names[1] if len(corridor_names) > 1 else "Intermediate Bypass",
                "instruction": f"Take the underpass exit towards {dst_name} destination corridor",
                "distance": f"{round(route_dist_primary * 0.3, 1)} km",
                "speed": f"{round(avg_speed_primary * 0.9, 1)} km/h",
                "status": "Moderate Flow",
                "risk": "Moderate",
            },
        ]

        # Detailed Turn-by-Turn Corridor Segments for Alternate Route
        alt_segments = [
            {
                "step": 1,
                "corridor": src_name,
                "instruction": f"Start from {src_name} taking secondary service road to avoid main bottleneck",
                "distance": f"{round(route_dist_alt * 0.3, 1)} km",
                "speed": f"{avg_speed_alt} km/h",
                "status": "Normal Flow",
                "risk": "Low",
            },
            {
                "step": 2,
                "corridor": corridor_names[2] if len(corridor_names) > 2 else "Old Airport Arterial Bypass",
                "instruction": f"Follow bypass corridor along {corridor_names[2] if len(corridor_names) > 2 else 'Old Airport Arterial Bypass'}",
                "distance": f"{round(route_dist_alt * 0.4, 1)} km",
                "speed": f"{round(avg_speed_alt * 1.05, 1)} km/h",
                "status": "Light Traffic",
                "risk": "Low",
            },
            {
                "step": 3,
                "corridor": corridor_names[3] if len(corridor_names) > 3 else "Destination Access Link",
                "instruction": f"Arrive at destination area {dst_name} via local connecting avenue",
                "distance": f"{round(route_dist_alt * 0.3, 1)} km",
                "speed": f"{round(avg_speed_alt * 0.85, 1)} km/h",
                "status": "Normal Flow",
                "risk": "Low",
            },
        ]

        primary_route_obj = {
            "id": "primary",
            "name": "AI Optimal Express Route (Fastest)",
            "badge": "Recommended",
            "badge_color": "var(--primary)",
            "via": f"Via {corridor_names[0] if corridor_names else 'Expressway'}",
            "estimated_time": f"{time_primary_mins} mins",
            "distance": f"{route_dist_primary} km",
            "average_speed": f"{avg_speed_primary} km/h",
            "congestion_score": "34%",
            "congestion_level": "Low / Moderate",
            "time_saved": "Saves ~8-12 mins vs congested gridlock",
            "segments": primary_segments,
            "coordinates": primary_coords,
            "corridors": [src_name] + corridor_names[:3] + [dst_name],
        }

        alternate_route_obj = {
            "id": "alternate",
            "name": "Scenic Congestion Bypass Route",
            "badge": "Alternate",
            "badge_color": "var(--success)",
            "via": f"Via {corridor_names[2] if len(corridor_names) > 2 else 'Old Airport Road'} & Bypass",
            "estimated_time": f"{time_alt_mins} mins",
            "distance": f"{route_dist_alt} km",
            "average_speed": f"{avg_speed_alt} km/h",
            "congestion_score": "22%",
            "congestion_level": "Free Flow",
            "time_saved": "Avoids major signal junctions & roadworks",
            "segments": alt_segments,
            "coordinates": alt_coords,
            "corridors": [src_name] + (corridor_names[2:5] if len(corridor_names) > 4 else ["Old Airport Road", "Suranjan Das Road"]) + [dst_name],
        }

        return {
            "source": src_name,
            "destination": dst_name,
            "source_coordinates": src_coord,
            "destination_coordinates": dst_coord,
            "primary_route": primary_route_obj,
            "alternate_route": alternate_route_obj,
            # Backwards-compatible fields:
            "recommended_route": primary_route_obj["corridors"],
            "estimated_time": f"{time_primary_mins} mins",
            "distance": f"{route_dist_primary} km",
            "average_corridor_speed": f"{avg_speed_primary} km/h",
        }