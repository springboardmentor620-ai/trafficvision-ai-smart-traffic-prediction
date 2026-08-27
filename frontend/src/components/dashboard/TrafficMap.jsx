import { useEffect, useState, useMemo, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Popup,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useNavigate } from "react-router-dom";

import { getTrafficData } from "../../services/traffic";
import { getRoads } from "../../services/roads";
import { getStatusColor } from "../../constants/traffic";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Comprehensive Bengaluru Master Corridors (Fallback & Baseline Metadata)
const BENGALURU_MASTER_ROADS = [
  {
    id: 1,
    name: "100 Feet Road (Indiranagar)",
    road: "100 Feet Road (Indiranagar)",
    city: "Bengaluru",
    state: "Karnataka",
    zone: "East Tech Sector",
    latitude: 12.9716,
    longitude: 77.6412,
    speed_limit: 60,
    status: "Heavy",
    vehicles: 780,
    average_speed: 18.5,
    category: "Primary Urban Arterial",
  },
  {
    id: 2,
    name: "Marathahalli Bridge (ORR)",
    road: "Marathahalli Bridge (ORR)",
    city: "Bengaluru",
    state: "Karnataka",
    zone: "East Tech Sector",
    latitude: 12.9591,
    longitude: 77.6974,
    speed_limit: 50,
    status: "Moderate",
    vehicles: 620,
    average_speed: 32.0,
    category: "Grade Separated Flyover",
  },
  {
    id: 3,
    name: "Hosur Road Express (Silk Board)",
    road: "Hosur Road Express (Silk Board)",
    city: "Bengaluru",
    state: "Karnataka",
    zone: "South Sector",
    latitude: 12.9177,
    longitude: 77.6238,
    speed_limit: 80,
    status: "Heavy",
    vehicles: 940,
    average_speed: 14.0,
    category: "Interstate Highway Corridor",
  },
  {
    id: 4,
    name: "Outer Ring Road (ORR Bellandur)",
    road: "Outer Ring Road (ORR Bellandur)",
    city: "Bengaluru",
    state: "Karnataka",
    zone: "East Tech Sector",
    latitude: 12.9352,
    longitude: 77.6956,
    speed_limit: 80,
    status: "Heavy",
    vehicles: 910,
    average_speed: 16.5,
    category: "Primary Expressway Ring",
  },
  {
    id: 5,
    name: "M.G. Road Central",
    road: "M.G. Road Central",
    city: "Bengaluru",
    state: "Karnataka",
    zone: "Central Business District",
    latitude: 12.9756,
    longitude: 77.6066,
    speed_limit: 50,
    status: "Heavy",
    vehicles: 720,
    average_speed: 19.0,
    category: "Central Commercial Spine",
  },
  {
    id: 6,
    name: "Old Airport Road",
    road: "Old Airport Road",
    city: "Bengaluru",
    state: "Karnataka",
    zone: "East Tech Sector",
    latitude: 12.9597,
    longitude: 77.6580,
    speed_limit: 60,
    status: "Moderate",
    vehicles: 540,
    average_speed: 36.5,
    category: "Urban Primary Transit",
  },
  {
    id: 7,
    name: "Bellary Road (Hebbal / Airport Link)",
    road: "Bellary Road (Hebbal / Airport Link)",
    city: "Bengaluru",
    state: "Karnataka",
    zone: "North Sector",
    latitude: 13.0358,
    longitude: 77.5970,
    speed_limit: 80,
    status: "Normal",
    vehicles: 380,
    average_speed: 68.0,
    category: "Airport Access Expressway",
  },
  {
    id: 8,
    name: "Sarjapur Main Road",
    road: "Sarjapur Main Road",
    city: "Bengaluru",
    state: "Karnataka",
    zone: "South-East Sector",
    latitude: 12.9105,
    longitude: 77.6850,
    speed_limit: 50,
    status: "Heavy",
    vehicles: 820,
    average_speed: 17.0,
    category: "High-Density Suburban Link",
  },
  {
    id: 9,
    name: "Bannerghatta Road",
    road: "Bannerghatta Road",
    city: "Bengaluru",
    state: "Karnataka",
    zone: "South Sector",
    latitude: 12.8950,
    longitude: 77.5980,
    speed_limit: 50,
    status: "Moderate",
    vehicles: 490,
    average_speed: 34.0,
    category: "South Arterial Corridor",
  },
  {
    id: 10,
    name: "Tumkur Road (Yeshwanthpur)",
    road: "Tumkur Road (Yeshwanthpur)",
    city: "Bengaluru",
    state: "Karnataka",
    zone: "North-West Sector",
    latitude: 13.0238,
    longitude: 77.5529,
    speed_limit: 70,
    status: "Normal",
    vehicles: 350,
    average_speed: 58.0,
    category: "Industrial Transit Arterial",
  },
  {
    id: 11,
    name: "Kanakapura Metro Road",
    road: "Kanakapura Metro Road",
    city: "Bengaluru",
    state: "Karnataka",
    zone: "South-West Sector",
    latitude: 12.8870,
    longitude: 77.5550,
    speed_limit: 60,
    status: "Normal",
    vehicles: 290,
    average_speed: 52.0,
    category: "Metro Transit Corridor",
  },
  {
    id: 12,
    name: "Whitefield Main Road (ITPL)",
    road: "Whitefield Main Road (ITPL)",
    city: "Bengaluru",
    state: "Karnataka",
    zone: "East Tech Sector",
    latitude: 12.9698,
    longitude: 77.7499,
    speed_limit: 50,
    status: "Moderate",
    vehicles: 590,
    average_speed: 31.0,
    category: "Technology Park Spine",
  },
  {
    id: 13,
    name: "Koramangala 80 Feet Road",
    road: "Koramangala 80 Feet Road",
    city: "Bengaluru",
    state: "Karnataka",
    zone: "South Sector",
    latitude: 12.9352,
    longitude: 77.6245,
    speed_limit: 50,
    status: "Moderate",
    vehicles: 510,
    average_speed: 35.5,
    category: "Commercial Mixed Arterial",
  },
  {
    id: 14,
    name: "Electronic City Phase 1 Toll",
    road: "Electronic City Phase 1 Toll",
    city: "Bengaluru",
    state: "Karnataka",
    zone: "South-East Sector",
    latitude: 12.8458,
    longitude: 77.6602,
    speed_limit: 80,
    status: "Normal",
    vehicles: 320,
    average_speed: 72.0,
    category: "Elevated Expressway",
  },
  {
    id: 15,
    name: "Majestic Central Station Interchange",
    road: "Majestic Central Station Interchange",
    city: "Bengaluru",
    state: "Karnataka",
    zone: "Central Business District",
    latitude: 12.9767,
    longitude: 77.5713,
    speed_limit: 40,
    status: "Heavy",
    vehicles: 860,
    average_speed: 15.0,
    category: "Multimodal Transit Hub",
  },
  {
    id: 16,
    name: "Jayanagar 4th Block Complex",
    road: "Jayanagar 4th Block Complex",
    city: "Bengaluru",
    state: "Karnataka",
    zone: "South Sector",
    latitude: 12.9250,
    longitude: 77.5938,
    speed_limit: 50,
    status: "Normal",
    vehicles: 260,
    average_speed: 48.0,
    category: "Planned Commercial Sector",
  },
  {
    id: 17,
    name: "HSR Layout 27th Main",
    road: "HSR Layout 27th Main",
    city: "Bengaluru",
    state: "Karnataka",
    zone: "South-East Sector",
    latitude: 12.9121,
    longitude: 77.6446,
    speed_limit: 50,
    status: "Moderate",
    vehicles: 480,
    average_speed: 33.0,
    category: "Suburban Commercial Arterial",
  },
  {
    id: 18,
    name: "CMH Road (Indiranagar Metro)",
    road: "CMH Road (Indiranagar Metro)",
    city: "Bengaluru",
    state: "Karnataka",
    zone: "East Tech Sector",
    latitude: 12.9785,
    longitude: 77.6380,
    speed_limit: 50,
    status: "Normal",
    vehicles: 280,
    average_speed: 46.0,
    category: "Metro Transit Arterial",
  },
];

// Map View Controller Helper
function MapFlyTo({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, zoom || 13, { duration: 1.2 });
    }
  }, [center, zoom, map]);
  return null;
}

function TrafficMap() {
  const navigate = useNavigate();
  const [allCorridors, setAllCorridors] = useState(BENGALURU_MASTER_ROADS);
  const [selectedRoad, setSelectedRoad] = useState(BENGALURU_MASTER_ROADS[0]);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [mapCenter, setMapCenter] = useState([12.9716, 77.5946]);
  const [mapZoom, setMapZoom] = useState(12);

  // Fetch from backend API
  useEffect(() => {
    let mounted = true;

    const loadData = async () => {
      try {
        const [traffic, dbRoads] = await Promise.all([
          getTrafficData(),
          getRoads(),
        ]);

        if (!mounted) return;

        // Build lookup map by road name
        const trafficMap = new Map();
        (traffic || []).forEach((t) => {
          const tName = (typeof t.road === "object" ? t.road?.name : t.road || t.name || "").toLowerCase();
          if (tName) trafficMap.set(tName, t);
        });

        const dbRoadMap = new Map();
        (dbRoads || []).forEach((r) => {
          if (r.name) dbRoadMap.set(r.name.toLowerCase(), r);
        });

        // Merge baseline with live backend DB & telemetry
        const merged = BENGALURU_MASTER_ROADS.map((base) => {
          const baseKey = base.name.toLowerCase();
          const liveTraffic = trafficMap.get(baseKey);
          const dbRoad = dbRoadMap.get(baseKey);

          return {
            ...base,
            id: dbRoad?.id || liveTraffic?.id || base.id,
            name: dbRoad?.name || base.name,
            road: dbRoad?.name || base.name,
            status: liveTraffic?.status || dbRoad?.status || base.status,
            vehicles: liveTraffic?.vehicles !== undefined ? liveTraffic.vehicles : base.vehicles,
            average_speed: liveTraffic?.average_speed !== undefined ? liveTraffic.average_speed : base.average_speed,
            speed_limit: dbRoad?.speed_limit || liveTraffic?.speed_limit || base.speed_limit,
            latitude: dbRoad?.latitude || base.latitude,
            longitude: dbRoad?.longitude || base.longitude,
            city: dbRoad?.city || base.city,
            state: dbRoad?.state || base.state,
          };
        });

        // Also append any extra user-created roads from Road Management
        (dbRoads || []).forEach((r) => {
          const exists = merged.some((m) => m.name.toLowerCase() === r.name.toLowerCase());
          if (!exists) {
            const liveTraffic = trafficMap.get(r.name.toLowerCase());
            merged.push({
              id: r.id,
              name: r.name,
              road: r.name,
              city: r.city || "Bengaluru",
              state: r.state || "Karnataka",
              zone: "Urban Arterial",
              latitude: r.latitude || 12.9716,
              longitude: r.longitude || 77.5946,
              speed_limit: r.speed_limit || 60,
              status: liveTraffic?.status || r.status || "Normal",
              vehicles: liveTraffic?.vehicles || 350,
              average_speed: liveTraffic?.average_speed || 45,
              category: "Configured Infrastructure Asset",
            });
          }
        });

        setAllCorridors(merged);
      } catch (err) {
        console.error("TrafficMap data load error:", err);
      }
    };

    loadData();
    const timer = setInterval(loadData, 5000);
    return () => {
      mounted = false;
      clearInterval(timer);
    };
  }, []);

  // Filtered corridors
  const filteredCorridors = useMemo(() => {
    if (statusFilter === "ALL") return allCorridors;
    return allCorridors.filter((c) => c.status.toUpperCase() === statusFilter);
  }, [allCorridors, statusFilter]);

  const heavyCount = allCorridors.filter((c) => c.status === "Heavy").length;
  const modCount = allCorridors.filter((c) => c.status === "Moderate").length;
  const normCount = allCorridors.filter((c) => c.status === "Normal").length;

  const handleSelectCorridor = (corridor) => {
    setSelectedRoad(corridor);
    setMapCenter([corridor.latitude, corridor.longitude]);
    setMapZoom(14);
  };

  const handleQuickJump = (lat, lng, zoom = 13) => {
    setMapCenter([lat, lng]);
    setMapZoom(zoom);
  };

  return (
    <div
      style={{
        background: "var(--bg-surface)",
        color: "var(--text-primary)",
        borderRadius: "14px",
        overflow: "hidden",
        border: "1px solid var(--border-color)",
        boxShadow: "var(--shadow-sm)",
        marginBottom: "28px",
      }}
    >
      {/* Top Header Bar with Filters */}
      <div
        style={{
          padding: "18px 24px",
          borderBottom: "1px solid var(--border-color)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "16px",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <h2 style={{ color: "var(--text-primary)", fontSize: "18px", margin: 0 }}>
              Live Telemetry & Road Infrastructure Map
            </h2>
            <span
              style={{
                fontSize: "11px",
                fontWeight: "700",
                padding: "3px 8px",
                borderRadius: "12px",
                backgroundColor: "rgba(59, 130, 246, 0.12)",
                color: "var(--primary)",
              }}
            >
              {allCorridors.length} Monitored Corridors
            </span>
          </div>
          <p style={{ color: "var(--text-muted)", fontSize: "13px", margin: "4px 0 0 0" }}>
            Click any corridor marker to inspect real-time velocity, speed limit compliance, and road management metadata.
          </p>
        </div>

        {/* Status Filter Chips */}
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          <button
            onClick={() => setStatusFilter("ALL")}
            style={{
              padding: "5px 12px",
              borderRadius: "8px",
              fontSize: "12px",
              fontWeight: "600",
              border: "1px solid",
              borderColor: statusFilter === "ALL" ? "var(--primary)" : "var(--border-color)",
              backgroundColor: statusFilter === "ALL" ? "rgba(59, 130, 246, 0.12)" : "transparent",
              color: statusFilter === "ALL" ? "var(--primary)" : "var(--text-secondary)",
              cursor: "pointer",
            }}
          >
            All Corridors ({allCorridors.length})
          </button>
          <button
            onClick={() => setStatusFilter("HEAVY")}
            style={{
              padding: "5px 12px",
              borderRadius: "8px",
              fontSize: "12px",
              fontWeight: "600",
              border: "1px solid",
              borderColor: statusFilter === "HEAVY" ? "var(--danger)" : "var(--border-color)",
              backgroundColor: statusFilter === "HEAVY" ? "rgba(239, 68, 68, 0.12)" : "transparent",
              color: statusFilter === "HEAVY" ? "var(--danger)" : "var(--text-secondary)",
              cursor: "pointer",
            }}
          >
            🔴 Heavy Congestion ({heavyCount})
          </button>
          <button
            onClick={() => setStatusFilter("MODERATE")}
            style={{
              padding: "5px 12px",
              borderRadius: "8px",
              fontSize: "12px",
              fontWeight: "600",
              border: "1px solid",
              borderColor: statusFilter === "MODERATE" ? "var(--warning)" : "var(--border-color)",
              backgroundColor: statusFilter === "MODERATE" ? "rgba(245, 158, 11, 0.12)" : "transparent",
              color: statusFilter === "MODERATE" ? "var(--warning)" : "var(--text-secondary)",
              cursor: "pointer",
            }}
          >
            🟡 Moderate ({modCount})
          </button>
          <button
            onClick={() => setStatusFilter("NORMAL")}
            style={{
              padding: "5px 12px",
              borderRadius: "8px",
              fontSize: "12px",
              fontWeight: "600",
              border: "1px solid",
              borderColor: statusFilter === "NORMAL" ? "var(--success)" : "var(--border-color)",
              backgroundColor: statusFilter === "NORMAL" ? "rgba(16, 185, 129, 0.12)" : "transparent",
              color: statusFilter === "NORMAL" ? "var(--success)" : "var(--text-secondary)",
              cursor: "pointer",
            }}
          >
            🟢 Normal ({normCount})
          </button>
        </div>
      </div>

      {/* Quick Jump Sector Pills */}
      <div
        style={{
          padding: "10px 24px",
          background: "var(--bg-surface-secondary)",
          borderBottom: "1px solid var(--border-color)",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          overflowX: "auto",
          fontSize: "12px",
        }}
      >
        <span style={{ fontWeight: "600", color: "var(--text-muted)", whiteSpace: "nowrap" }}>QUICK JUMP:</span>
        <button
          onClick={() => handleQuickJump(12.9756, 77.6066, 14)}
          style={{ padding: "3px 10px", borderRadius: "6px", border: "1px solid var(--border-color)", background: "var(--bg-surface)", color: "var(--text-primary)", cursor: "pointer", whiteSpace: "nowrap" }}
        >
          📍 Central (M.G. Road)
        </button>
        <button
          onClick={() => handleQuickJump(12.9352, 77.6956, 13)}
          style={{ padding: "3px 10px", borderRadius: "6px", border: "1px solid var(--border-color)", background: "var(--bg-surface)", color: "var(--text-primary)", cursor: "pointer", whiteSpace: "nowrap" }}
        >
          📍 East (ORR & Bellandur Tech Hub)
        </button>
        <button
          onClick={() => handleQuickJump(12.9177, 77.6238, 14)}
          style={{ padding: "3px 10px", borderRadius: "6px", border: "1px solid var(--border-color)", background: "var(--bg-surface)", color: "var(--text-primary)", cursor: "pointer", whiteSpace: "nowrap" }}
        >
          📍 South (Silk Board & Hosur Rd)
        </button>
        <button
          onClick={() => handleQuickJump(13.0358, 77.5970, 13)}
          style={{ padding: "3px 10px", borderRadius: "6px", border: "1px solid var(--border-color)", background: "var(--bg-surface)", color: "var(--text-primary)", cursor: "pointer", whiteSpace: "nowrap" }}
        >
          📍 North (Hebbal & Airport Link)
        </button>
        <button
          onClick={() => handleQuickJump(12.9716, 77.6412, 14)}
          style={{ padding: "3px 10px", borderRadius: "6px", border: "1px solid var(--border-color)", background: "var(--bg-surface)", color: "var(--text-primary)", cursor: "pointer", whiteSpace: "nowrap" }}
        >
          📍 Indiranagar (100 Ft Rd)
        </button>
      </div>

      {/* Main Map Body: Interactive Map + Selected Road Management Details Sidebar */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: selectedRoad ? "1fr 360px" : "1fr",
          minHeight: "540px",
        }}
      >
        {/* Leaflet Map Canvas */}
        <div style={{ height: "540px", position: "relative" }}>
          <MapContainer
            center={mapCenter}
            zoom={mapZoom}
            style={{
              height: "100%",
              width: "100%",
            }}
          >
            <MapFlyTo center={mapCenter} zoom={mapZoom} />

            <TileLayer
              attribution="&copy; OpenStreetMap contributors"
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {filteredCorridors.map((road) => {
              const isSelected = selectedRoad?.name === road.name;
              const color = getStatusColor(road.status);

              return (
                <CircleMarker
                  key={road.id || road.name}
                  center={[road.latitude, road.longitude]}
                  radius={isSelected ? 14 : 10}
                  eventHandlers={{
                    click: () => handleSelectCorridor(road),
                  }}
                  pathOptions={{
                    color: isSelected ? "#ffffff" : color,
                    weight: isSelected ? 3 : 1.5,
                    fillColor: color,
                    fillOpacity: 0.92,
                  }}
                >
                  <Popup>
                    <div style={{ minWidth: "200px", fontFamily: "sans-serif" }}>
                      <div style={{ fontSize: "14px", fontWeight: "700", color: "#0f172a", marginBottom: "4px" }}>
                        📍 {road.name}
                      </div>
                      <div style={{ fontSize: "11px", color: "#64748b", marginBottom: "8px" }}>
                        {road.city}, {road.state} • {road.zone || "Bengaluru Corridor"}
                      </div>

                      <div
                        style={{
                          display: "inline-block",
                          fontSize: "11px",
                          fontWeight: "700",
                          padding: "2px 8px",
                          borderRadius: "6px",
                          marginBottom: "10px",
                          backgroundColor:
                            road.status === "Heavy"
                              ? "rgba(239, 68, 68, 0.15)"
                              : road.status === "Moderate"
                              ? "rgba(245, 158, 11, 0.15)"
                              : "rgba(16, 185, 129, 0.15)",
                          color:
                            road.status === "Heavy"
                              ? "#dc2626"
                              : road.status === "Moderate"
                              ? "#d97706"
                              : "#16a34a",
                        }}
                      >
                        ● {road.status} Congestion
                      </div>

                      <div style={{ fontSize: "12px", color: "#1e293b", lineHeight: "1.6" }}>
                        <div><b>Vehicles:</b> {road.vehicles} veh/hr</div>
                        <div><b>Average Speed:</b> {road.average_speed} km/h</div>
                        <div><b>Speed Limit:</b> {road.speed_limit} km/h</div>
                      </div>

                      <button
                        onClick={() => handleSelectCorridor(road)}
                        style={{
                          marginTop: "10px",
                          width: "100%",
                          padding: "6px 10px",
                          background: "#2563eb",
                          color: "#fff",
                          border: "none",
                          borderRadius: "6px",
                          fontSize: "12px",
                          fontWeight: "600",
                          cursor: "pointer",
                        }}
                      >
                        Inspect Road Profile →
                      </button>
                    </div>
                  </Popup>
                </CircleMarker>
              );
            })}
          </MapContainer>
        </div>

        {/* Road Management Profile Drawer */}
        {selectedRoad && (
          <div
            style={{
              padding: "22px",
              backgroundColor: "var(--bg-surface)",
              borderLeft: "1px solid var(--border-color)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                <div>
                  <span style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: "600", textTransform: "uppercase" }}>
                    ROAD MANAGEMENT PROFILE
                  </span>
                  <h3 style={{ fontSize: "17px", margin: "2px 0 0 0", color: "var(--text-primary)" }}>
                    {selectedRoad.name}
                  </h3>
                </div>

                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: "700",
                    padding: "3px 8px",
                    borderRadius: "6px",
                    backgroundColor:
                      selectedRoad.status === "Heavy"
                        ? "rgba(239, 68, 68, 0.12)"
                        : selectedRoad.status === "Moderate"
                        ? "rgba(245, 158, 11, 0.12)"
                        : "rgba(16, 185, 129, 0.12)",
                    color:
                      selectedRoad.status === "Heavy"
                        ? "var(--danger)"
                        : selectedRoad.status === "Moderate"
                        ? "var(--warning)"
                        : "var(--success)",
                  }}
                >
                  ● {selectedRoad.status}
                </span>
              </div>

              <div style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "16px" }}>
                {selectedRoad.city}, {selectedRoad.state} • {selectedRoad.zone || "Bengaluru Arterial Grid"}
              </div>

              {/* Capacity Load Ratio Progress Bar */}
              <div
                style={{
                  background: "var(--bg-surface-secondary)",
                  padding: "14px",
                  borderRadius: "10px",
                  marginBottom: "16px",
                  border: "1px solid var(--border-color)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: "6px" }}>
                  <span style={{ color: "var(--text-muted)" }}>Corridor Capacity Load</span>
                  <strong
                    style={{
                      color:
                        selectedRoad.status === "Heavy"
                          ? "var(--danger)"
                          : selectedRoad.status === "Moderate"
                          ? "var(--warning)"
                          : "var(--success)",
                    }}
                  >
                    {selectedRoad.status === "Heavy" ? "88% (Congested)" : selectedRoad.status === "Moderate" ? "58% (Moderate)" : "28% (Free Flow)"}
                  </strong>
                </div>
                <div style={{ height: "6px", width: "100%", backgroundColor: "var(--border-color)", borderRadius: "3px", overflow: "hidden" }}>
                  <div
                    style={{
                      height: "100%",
                      width: selectedRoad.status === "Heavy" ? "88%" : selectedRoad.status === "Moderate" ? "58%" : "28%",
                      backgroundColor:
                        selectedRoad.status === "Heavy"
                          ? "var(--danger)"
                          : selectedRoad.status === "Moderate"
                          ? "var(--warning)"
                          : "var(--success)",
                      borderRadius: "3px",
                      transition: "width 0.3s ease",
                    }}
                  />
                </div>
              </div>

              {/* Key Telemetry Grid */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "16px" }}>
                <div style={{ padding: "10px 12px", background: "var(--bg-surface-secondary)", borderRadius: "8px", border: "1px solid var(--border-color)" }}>
                  <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>Current Velocity</div>
                  <div style={{ fontSize: "16px", fontWeight: "700", color: "var(--text-primary)", marginTop: "2px" }}>
                    {selectedRoad.average_speed} km/h
                  </div>
                </div>

                <div style={{ padding: "10px 12px", background: "var(--bg-surface-secondary)", borderRadius: "8px", border: "1px solid var(--border-color)" }}>
                  <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>Speed Limit</div>
                  <div style={{ fontSize: "16px", fontWeight: "700", color: "var(--text-primary)", marginTop: "2px" }}>
                    {selectedRoad.speed_limit} km/h
                  </div>
                </div>

                <div style={{ padding: "10px 12px", background: "var(--bg-surface-secondary)", borderRadius: "8px", border: "1px solid var(--border-color)" }}>
                  <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>Hourly Volume</div>
                  <div style={{ fontSize: "16px", fontWeight: "700", color: "var(--text-primary)", marginTop: "2px" }}>
                    {selectedRoad.vehicles} veh/hr
                  </div>
                </div>

                <div style={{ padding: "10px 12px", background: "var(--bg-surface-secondary)", borderRadius: "8px", border: "1px solid var(--border-color)" }}>
                  <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>Infrastructure Class</div>
                  <div style={{ fontSize: "12px", fontWeight: "600", color: "var(--text-primary)", marginTop: "2px" }}>
                    {selectedRoad.category || "Urban Arterial"}
                  </div>
                </div>
              </div>

              {/* Coordinates */}
              <div style={{ fontSize: "12px", color: "var(--text-muted)", padding: "8px 12px", background: "var(--bg-input)", borderRadius: "8px", marginBottom: "16px" }}>
                🌐 <b>GPS Coordinates:</b> {selectedRoad.latitude.toFixed(4)}° N, {selectedRoad.longitude.toFixed(4)}° E
              </div>
            </div>

            {/* Quick Action Navigation Links */}
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "12px" }}>
              <button
                onClick={() => navigate("/admin/roads")}
                style={{
                  padding: "8px 12px",
                  background: "var(--primary)",
                  color: "#fff",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "12px",
                  fontWeight: "600",
                  cursor: "pointer",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                🛣️ Manage in Road Management
              </button>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                <button
                  onClick={() => navigate(`/admin/routes?corridor=${encodeURIComponent(selectedRoad.name)}`)}
                  style={{
                    padding: "7px 10px",
                    background: "var(--bg-surface-secondary)",
                    color: "var(--text-primary)",
                    border: "1px solid var(--border-color)",
                    borderRadius: "8px",
                    fontSize: "11px",
                    fontWeight: "600",
                    cursor: "pointer",
                  }}
                >
                  🚗 Optimize Route
                </button>
                <button
                  onClick={() => navigate("/admin/traffic")}
                  style={{
                    padding: "7px 10px",
                    background: "var(--bg-surface-secondary)",
                    color: "var(--text-primary)",
                    border: "1px solid var(--border-color)",
                    borderRadius: "8px",
                    fontSize: "11px",
                    fontWeight: "600",
                    cursor: "pointer",
                  }}
                >
                  📹 Live CCTV Feed
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default TrafficMap;