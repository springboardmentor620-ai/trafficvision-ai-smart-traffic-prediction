import { useState, useEffect, useRef, useCallback } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  CircleMarker,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import AdminLayout from "../../components/dashboard/AdminLayout";
import { optimizeRoute } from "../../services/routes";

// Fix standard leaflet icon path
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const BANGALORE_JUNCTIONS = [
  "M.G. Road",
  "Indiranagar (100 Feet Road)",
  "Whitefield Main Road",
  "Marathahalli Bridge",
  "Koramangala (Sony World Junction)",
  "Electronic City Phase 1",
  "Hebbal Flyover",
  "Airport Road (KIA)",
  "Outer Ring Road (Silk Board)",
  "Sarjapur Main Road",
  "Bannerghatta Road",
  "HSR Layout (27th Main)",
  "Old Airport Road",
  "Yeshwanthpur Circle",
  "Jayanagar 4th Block",
];

// Helper to auto-fit map view bounds
function MapBoundsUpdater({ bounds }) {
  const map = useMap();
  useEffect(() => {
    if (bounds && bounds.length > 0) {
      try {
        map.fitBounds(bounds, { padding: [40, 40] });
      } catch {
        // Fallback silently if bounds are invalid
      }
    }
  }, [bounds, map]);
  return null;
}

function RouteOptimization() {
  const [source, setSource] = useState("M.G. Road");
  const [destination, setDestination] = useState("Airport Road (KIA)");
  const [selectedRouteTab, setSelectedRouteTab] = useState("primary");
  const [routeResult, setRouteResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleOptimize = useCallback(async () => {
    if (!source || !destination) return;

    try {
      setLoading(true);
      const data = await optimizeRoute(source, destination);
      setRouteResult(data);
      setSelectedRouteTab("primary");
    } catch (err) {
      console.error("Route calculation error", err);
    } finally {
      setLoading(false);
    }
  }, [source, destination]);

  // Run initial calculation on load
  useEffect(() => {
    handleOptimize();
  }, [handleOptimize]);

  const handleSwap = () => {
    const temp = source;
    setSource(destination);
    setDestination(temp);
  };

  // Prepare map coordinate bounds
  const primaryCoords = routeResult?.primary_route?.coordinates || [];
  const altCoords = routeResult?.alternate_route?.coordinates || [];
  const allCoords = [...primaryCoords, ...altCoords];
  const mapBounds = allCoords.length > 0 ? allCoords : [[12.9716, 77.5946]];

  const activeRoute =
    selectedRouteTab === "alternate"
      ? routeResult?.alternate_route
      : routeResult?.primary_route;

  return (
    <AdminLayout
      title="Route Optimization"
      subtitle="AI-assisted intelligent traffic routing, corridor bypass analysis, and GIS pathfinding"
    >
      {/* Search & Configuration Header Card */}
      <div
        style={{
          background: "var(--bg-surface)",
          color: "var(--text-primary)",
          padding: "24px 28px",
          borderRadius: "14px",
          border: "1px solid var(--border-color)",
          boxShadow: "var(--shadow-sm)",
          marginBottom: "28px",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
          <div>
            <h2 style={{ fontSize: "18px", fontWeight: "700", margin: 0, color: "var(--text-primary)" }}>
              🚗 Intelligent Corridor Pathfinding
            </h2>
            <p style={{ fontSize: "13px", color: "var(--text-muted)", margin: "4px 0 0 0" }}>
              Select origin and destination hubs to compute live AI corridor routing and congestion-avoidance detours.
            </p>
          </div>

          <span
            style={{
              fontSize: "12px",
              fontWeight: "600",
              padding: "4px 12px",
              borderRadius: "20px",
              backgroundColor: "var(--bg-surface-secondary)",
              border: "1px solid var(--border-color)",
              color: "var(--primary)",
            }}
          >
            ⚡ Live Telemetry Connected
          </span>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr auto 1fr auto",
            gap: "14px",
            alignItems: "flex-end",
          }}
        >
          {/* Source Dropdown */}
          <div>
            <label
              style={{
                display: "block",
                marginBottom: "6px",
                fontWeight: "600",
                fontSize: "13px",
                color: "var(--text-secondary)",
              }}
            >
              🟢 Origin / Starting Junction
            </label>
            <select
              value={source}
              onChange={(e) => setSource(e.target.value)}
              style={{
                width: "100%",
                height: "44px",
                padding: "0 14px",
                borderRadius: "8px",
                border: "1px solid var(--border-color)",
                backgroundColor: "var(--bg-input)",
                color: "var(--text-primary)",
                fontSize: "14px",
                cursor: "pointer",
              }}
            >
              {BANGALORE_JUNCTIONS.map((loc) => (
                <option key={loc} value={loc} disabled={loc === destination}>
                  {loc}
                </option>
              ))}
            </select>
          </div>

          {/* Swap Button */}
          <button
            type="button"
            onClick={handleSwap}
            title="Swap Origin and Destination"
            style={{
              height: "44px",
              width: "44px",
              borderRadius: "8px",
              border: "1px solid var(--border-color)",
              backgroundColor: "var(--bg-surface-secondary)",
              color: "var(--text-primary)",
              fontSize: "18px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.2s",
            }}
          >
            ⇄
          </button>

          {/* Destination Dropdown */}
          <div>
            <label
              style={{
                display: "block",
                marginBottom: "6px",
                fontWeight: "600",
                fontSize: "13px",
                color: "var(--text-secondary)",
              }}
            >
              🔴 Destination Hub
            </label>
            <select
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              style={{
                width: "100%",
                height: "44px",
                padding: "0 14px",
                borderRadius: "8px",
                border: "1px solid var(--border-color)",
                backgroundColor: "var(--bg-input)",
                color: "var(--text-primary)",
                fontSize: "14px",
                cursor: "pointer",
              }}
            >
              {BANGALORE_JUNCTIONS.map((loc) => (
                <option key={loc} value={loc} disabled={loc === source}>
                  {loc}
                </option>
              ))}
            </select>
          </div>

          {/* Submit Action Button */}
          <button
            onClick={handleOptimize}
            disabled={loading}
            style={{
              height: "44px",
              padding: "0 24px",
              background: "var(--primary)",
              color: "#ffffff",
              border: "none",
              borderRadius: "8px",
              fontWeight: "600",
              fontSize: "14px",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              transition: "all 0.2s",
              whiteSpace: "nowrap",
            }}
          >
            {loading ? "Calculating..." : "🚀 Optimize Route"}
          </button>
        </div>
      </div>

      {routeResult && (
        <>
          {/* Dual Route Recommendation Selector Cards */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
              gap: "20px",
              marginBottom: "24px",
            }}
          >
            {/* Primary Route Card */}
            {routeResult.primary_route && (
              <div
                onClick={() => setSelectedRouteTab("primary")}
                style={{
                  background: "var(--bg-surface)",
                  color: "var(--text-primary)",
                  padding: "22px",
                  borderRadius: "14px",
                  border: `2px solid ${
                    selectedRouteTab === "primary"
                      ? "var(--primary)"
                      : "var(--border-color)"
                  }`,
                  boxShadow:
                    selectedRouteTab === "primary"
                      ? "0 4px 16px rgba(37, 99, 235, 0.18)"
                      : "var(--shadow-sm)",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  position: "relative",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ fontSize: "20px" }}>⚡</span>
                    <strong style={{ fontSize: "16px", color: "var(--text-primary)" }}>
                      {routeResult.primary_route.name}
                    </strong>
                  </div>
                  <span
                    style={{
                      fontSize: "11px",
                      fontWeight: "700",
                      padding: "3px 10px",
                      borderRadius: "12px",
                      backgroundColor: "var(--primary-tint, #eff6ff)",
                      color: "var(--primary)",
                      border: "1px solid var(--primary)",
                    }}
                  >
                    ★ Recommended
                  </span>
                </div>

                <p style={{ fontSize: "13px", color: "var(--text-muted)", margin: "0 0 14px 0" }}>
                  {routeResult.primary_route.via}
                </p>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, 1fr)",
                    gap: "10px",
                    padding: "12px",
                    backgroundColor: "var(--bg-surface-secondary)",
                    borderRadius: "10px",
                    textAlign: "center",
                    marginBottom: "12px",
                  }}
                >
                  <div>
                    <span style={{ fontSize: "11px", color: "var(--text-muted)", display: "block" }}>EST. TIME</span>
                    <strong style={{ fontSize: "16px", color: "var(--primary)" }}>
                      {routeResult.primary_route.estimated_time}
                    </strong>
                  </div>
                  <div>
                    <span style={{ fontSize: "11px", color: "var(--text-muted)", display: "block" }}>DISTANCE</span>
                    <strong style={{ fontSize: "16px", color: "var(--text-primary)" }}>
                      {routeResult.primary_route.distance}
                    </strong>
                  </div>
                  <div>
                    <span style={{ fontSize: "11px", color: "var(--text-muted)", display: "block" }}>AVG SPEED</span>
                    <strong style={{ fontSize: "16px", color: "var(--success)" }}>
                      {routeResult.primary_route.average_speed}
                    </strong>
                  </div>
                </div>

                <div style={{ fontSize: "12px", color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "6px" }}>
                  <span>🎯</span>
                  <span>{routeResult.primary_route.time_saved}</span>
                </div>
              </div>
            )}

            {/* Alternate Bypass Route Card */}
            {routeResult.alternate_route && (
              <div
                onClick={() => setSelectedRouteTab("alternate")}
                style={{
                  background: "var(--bg-surface)",
                  color: "var(--text-primary)",
                  padding: "22px",
                  borderRadius: "14px",
                  border: `2px solid ${
                    selectedRouteTab === "alternate"
                      ? "var(--success)"
                      : "var(--border-color)"
                  }`,
                  boxShadow:
                    selectedRouteTab === "alternate"
                      ? "0 4px 16px rgba(16, 185, 129, 0.18)"
                      : "var(--shadow-sm)",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  position: "relative",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ fontSize: "20px" }}>🌿</span>
                    <strong style={{ fontSize: "16px", color: "var(--text-primary)" }}>
                      {routeResult.alternate_route.name}
                    </strong>
                  </div>
                  <span
                    style={{
                      fontSize: "11px",
                      fontWeight: "700",
                      padding: "3px 10px",
                      borderRadius: "12px",
                      backgroundColor: "var(--success-tint, #ecfdf5)",
                      color: "var(--success)",
                      border: "1px solid var(--success)",
                    }}
                  >
                    🌿 Alternate Bypass
                  </span>
                </div>

                <p style={{ fontSize: "13px", color: "var(--text-muted)", margin: "0 0 14px 0" }}>
                  {routeResult.alternate_route.via}
                </p>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, 1fr)",
                    gap: "10px",
                    padding: "12px",
                    backgroundColor: "var(--bg-surface-secondary)",
                    borderRadius: "10px",
                    textAlign: "center",
                    marginBottom: "12px",
                  }}
                >
                  <div>
                    <span style={{ fontSize: "11px", color: "var(--text-muted)", display: "block" }}>EST. TIME</span>
                    <strong style={{ fontSize: "16px", color: "var(--success)" }}>
                      {routeResult.alternate_route.estimated_time}
                    </strong>
                  </div>
                  <div>
                    <span style={{ fontSize: "11px", color: "var(--text-muted)", display: "block" }}>DISTANCE</span>
                    <strong style={{ fontSize: "16px", color: "var(--text-primary)" }}>
                      {routeResult.alternate_route.distance}
                    </strong>
                  </div>
                  <div>
                    <span style={{ fontSize: "11px", color: "var(--text-muted)", display: "block" }}>AVG SPEED</span>
                    <strong style={{ fontSize: "16px", color: "var(--text-primary)" }}>
                      {routeResult.alternate_route.average_speed}
                    </strong>
                  </div>
                </div>

                <div style={{ fontSize: "12px", color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "6px" }}>
                  <span>🛡️</span>
                  <span>{routeResult.alternate_route.time_saved}</span>
                </div>
              </div>
            )}
          </div>

          {/* Leaflet Map Visualizer & Segment Breakdown (2-Column Grid) */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1.2fr 1fr",
              gap: "24px",
              alignItems: "start",
            }}
          >
            {/* Interactive Leaflet Map Visualizer */}
            <div
              style={{
                background: "var(--bg-surface)",
                borderRadius: "14px",
                border: "1px solid var(--border-color)",
                boxShadow: "var(--shadow-sm)",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  padding: "16px 20px",
                  borderBottom: "1px solid var(--border-color)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontSize: "18px" }}>🗺️</span>
                  <h3 style={{ fontSize: "16px", fontWeight: "700", margin: 0, color: "var(--text-primary)" }}>
                    Interactive GIS Route Representation
                  </h3>
                </div>

                <div style={{ display: "flex", gap: "12px", fontSize: "12px" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                    <span style={{ width: "12px", height: "4px", backgroundColor: "#2563eb", borderRadius: "2px" }}></span>
                    Primary Route
                  </span>
                  <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                    <span style={{ width: "12px", height: "4px", backgroundColor: "#10b981", borderRadius: "2px", borderStyle: "dashed" }}></span>
                    Alternate Bypass
                  </span>
                </div>
              </div>

              <div style={{ height: "460px", width: "100%" }}>
                <MapContainer
                  center={[12.9716, 77.5946]}
                  zoom={12}
                  style={{ height: "100%", width: "100%" }}
                >
                  <TileLayer
                    attribution="© OpenStreetMap contributors"
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />

                  <MapBoundsUpdater bounds={mapBounds} />

                  {/* Primary Route Polyline */}
                  {primaryCoords.length > 0 && (
                    <Polyline
                      positions={primaryCoords}
                      pathOptions={{
                        color: selectedRouteTab === "primary" ? "#2563eb" : "#93c5fd",
                        weight: selectedRouteTab === "primary" ? 6 : 4,
                        opacity: selectedRouteTab === "primary" ? 0.95 : 0.6,
                      }}
                    >
                      <Popup>
                        <strong>AI Primary Express Route</strong>
                        <br />
                        Time: {routeResult.primary_route?.estimated_time} ({routeResult.primary_route?.distance})
                      </Popup>
                    </Polyline>
                  )}

                  {/* Alternate Route Polyline */}
                  {altCoords.length > 0 && (
                    <Polyline
                      positions={altCoords}
                      pathOptions={{
                        color: selectedRouteTab === "alternate" ? "#10b981" : "#86efac",
                        weight: selectedRouteTab === "alternate" ? 6 : 4,
                        dashArray: "8, 8",
                        opacity: selectedRouteTab === "alternate" ? 0.95 : 0.6,
                      }}
                    >
                      <Popup>
                        <strong>Alternate Bypass Route</strong>
                        <br />
                        Time: {routeResult.alternate_route?.estimated_time} ({routeResult.alternate_route?.distance})
                      </Popup>
                    </Polyline>
                  )}

                  {/* Origin Marker 🟢 */}
                  {routeResult.source_coordinates && (
                    <CircleMarker
                      center={routeResult.source_coordinates}
                      radius={10}
                      pathOptions={{
                        color: "#16a34a",
                        fillColor: "#22c55e",
                        fillOpacity: 1,
                        weight: 3,
                      }}
                    >
                      <Popup>
                        <strong>🟢 Origin:</strong> {source}
                      </Popup>
                    </CircleMarker>
                  )}

                  {/* Destination Marker 🔴 */}
                  {routeResult.destination_coordinates && (
                    <CircleMarker
                      center={routeResult.destination_coordinates}
                      radius={10}
                      pathOptions={{
                        color: "#dc2626",
                        fillColor: "#ef4444",
                        fillOpacity: 1,
                        weight: 3,
                      }}
                    >
                      <Popup>
                        <strong>🔴 Destination:</strong> {destination}
                      </Popup>
                    </CircleMarker>
                  )}
                </MapContainer>
              </div>
            </div>

            {/* Turn-by-Turn Detailed Corridor Navigation */}
            <div
              style={{
                background: "var(--bg-surface)",
                color: "var(--text-primary)",
                padding: "24px",
                borderRadius: "14px",
                border: "1px solid var(--border-color)",
                boxShadow: "var(--shadow-sm)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <h3 style={{ fontSize: "16px", fontWeight: "700", margin: 0, color: "var(--text-primary)" }}>
                  📍 Detailed Navigation Steps
                </h3>
                <span
                  style={{
                    fontSize: "12px",
                    fontWeight: "600",
                    padding: "2px 8px",
                    borderRadius: "6px",
                    backgroundColor:
                      selectedRouteTab === "primary"
                        ? "var(--primary-tint, #eff6ff)"
                        : "var(--success-tint, #ecfdf5)",
                    color:
                      selectedRouteTab === "primary"
                        ? "var(--primary)"
                        : "var(--success)",
                  }}
                >
                  Viewing {selectedRouteTab === "primary" ? "Primary" : "Alternate"} Path
                </span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {activeRoute?.segments?.map((seg, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: "flex",
                      gap: "14px",
                      padding: "14px",
                      borderRadius: "10px",
                      backgroundColor: "var(--bg-surface-secondary)",
                      border: "1px solid var(--border-color)",
                    }}
                  >
                    <div
                      style={{
                        width: "30px",
                        height: "30px",
                        borderRadius: "50%",
                        backgroundColor:
                          selectedRouteTab === "primary"
                            ? "var(--primary)"
                            : "var(--success)",
                        color: "#fff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "13px",
                        fontWeight: "700",
                        flexShrink: 0,
                      }}
                    >
                      {seg.step}
                    </div>

                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                        <strong style={{ fontSize: "14px", color: "var(--text-primary)" }}>
                          {seg.corridor}
                        </strong>
                        <span
                          style={{
                            fontSize: "11px",
                            fontWeight: "600",
                            padding: "2px 8px",
                            borderRadius: "4px",
                            backgroundColor: "var(--bg-surface)",
                            border: "1px solid var(--border-color)",
                            color: "var(--text-secondary)",
                          }}
                        >
                          {seg.speed}
                        </span>
                      </div>

                      <p style={{ fontSize: "13px", color: "var(--text-secondary)", margin: "0 0 8px 0", lineHeight: 1.4 }}>
                        {seg.instruction}
                      </p>

                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "var(--text-muted)" }}>
                        <span>Segment: <strong>{seg.distance}</strong></span>
                        <span style={{ color: seg.risk === "Low" ? "var(--success)" : "var(--warning)" }}>
                          ● {seg.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Corridor Sequence Badges */}
              <hr style={{ margin: "20px 0", border: "none", borderTop: "1px solid var(--border-color)" }} />

              <h4 style={{ fontSize: "13px", fontWeight: "700", color: "var(--text-secondary)", marginBottom: "10px" }}>
                Connected Corridor Sequence
              </h4>

              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {activeRoute?.corridors?.map((c, i) => (
                  <span
                    key={i}
                    style={{
                      fontSize: "12px",
                      fontWeight: "600",
                      padding: "4px 10px",
                      borderRadius: "6px",
                      backgroundColor: "var(--bg-surface-secondary)",
                      border: "1px solid var(--border-color)",
                      color: "var(--text-primary)",
                    }}
                  >
                    📍 {c}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </AdminLayout>
  );
}

export default RouteOptimization;