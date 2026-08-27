import { useEffect, useState, useRef, useMemo } from "react";
import AdminLayout from "../../components/dashboard/AdminLayout";
import { getTrafficData } from "../../services/traffic";
import { getRoads } from "../../services/roads";

// 6 Dedicated Bengaluru Camera Feeds
const CAMERAS = [
  {
    id: "CAM-01",
    name: "Silk Board Junction Flyover",
    location: "Hosur Road - Outer Ring Road Interchange",
    zone: "South Sector",
    coordinates: "12.9177° N, 77.6238° E",
    fps: 30,
    bitrate: "4.8 Mbps",
    status: "Heavy",
    lanes: 4,
    baseVehicles: 48,
    speedLimit: 80,
  },
  {
    id: "CAM-02",
    name: "M.G. Road & Brigade Interchange",
    location: "Central Business District",
    zone: "Central Sector",
    coordinates: "12.9756° N, 77.6066° E",
    fps: 30,
    bitrate: "5.1 Mbps",
    status: "Heavy",
    lanes: 3,
    baseVehicles: 38,
    speedLimit: 50,
  },
  {
    id: "CAM-03",
    name: "Marathahalli Bridge & ORR",
    location: "East Tech Corridor (Bellandur Link)",
    zone: "East Sector",
    coordinates: "12.9591° N, 77.6974° E",
    fps: 30,
    bitrate: "4.5 Mbps",
    status: "Moderate",
    lanes: 4,
    baseVehicles: 34,
    speedLimit: 50,
  },
  {
    id: "CAM-04",
    name: "Hebbal Flyover Expressway",
    location: "Bellary Road - Airport Link",
    zone: "North Sector",
    coordinates: "13.0358° N, 77.5970° E",
    fps: 30,
    bitrate: "5.2 Mbps",
    status: "Normal",
    lanes: 4,
    baseVehicles: 24,
    speedLimit: 80,
  },
  {
    id: "CAM-05",
    name: "100 Feet Road Indiranagar",
    location: "Indiranagar 12th Main Crossing",
    zone: "East Sector",
    coordinates: "12.9716° N, 77.6412° E",
    fps: 30,
    bitrate: "4.2 Mbps",
    status: "Heavy",
    lanes: 2,
    baseVehicles: 32,
    speedLimit: 60,
  },
  {
    id: "CAM-06",
    name: "Electronic City Phase 1 Elevated Toll",
    location: "Hosur Expressway Entrance",
    zone: "South Sector",
    coordinates: "12.8458° N, 77.6602° E",
    fps: 30,
    bitrate: "4.9 Mbps",
    status: "Normal",
    lanes: 4,
    baseVehicles: 22,
    speedLimit: 80,
  },
];

// Simulated Anomaly Events
const INITIAL_EVENTS = [
  {
    id: 1,
    time: "Just now",
    camera: "CAM-01 (Silk Board)",
    type: "Critical",
    text: "Heavy queue building up on Northbound ramp. Optical density 86%.",
  },
  {
    id: 2,
    time: "2 mins ago",
    camera: "CAM-02 (M.G. Road)",
    type: "Warning",
    text: "Pedestrian spillover detected near Metro Pillar 140. Signal phase adjusted.",
  },
  {
    id: 3,
    time: "4 mins ago",
    camera: "CAM-03 (Marathahalli)",
    type: "Info",
    text: "Green corridor cleared for emergency ambulance transit.",
  },
  {
    id: 4,
    time: "6 mins ago",
    camera: "CAM-04 (Hebbal)",
    type: "Info",
    text: "Normal free flow telemetry maintained. Network velocity: 68 km/h.",
  },
];

function CameraCanvas({ camera, isSelected, showBoundingBoxes }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animId;
    let frame = 0;

    // Simulated Vehicle stream objects
    const vehicleTypes = [
      { type: "Car", color: "#3b82f6", width: 34, height: 18, speed: 1.8 },
      { type: "Bus", color: "#ef4444", width: 55, height: 22, speed: 1.2 },
      { type: "Auto", color: "#eab308", width: 22, height: 16, speed: 1.5 },
      { type: "2-Wheeler", color: "#10b981", width: 16, height: 10, speed: 2.2 },
      { type: "Truck", color: "#8b5cf6", width: 50, height: 24, speed: 1.1 },
    ];

    const count = camera.status === "Heavy" ? 14 : camera.status === "Moderate" ? 9 : 6;
    const vehicles = Array.from({ length: count }, (_, i) => {
      const vType = vehicleTypes[i % vehicleTypes.length];
      const lane = i % camera.lanes;
      const laneY = 40 + lane * 34;
      return {
        ...vType,
        x: (i * 70 + Math.random() * 40) % 400,
        y: laneY,
        lane,
        conf: Math.floor(91 + Math.random() * 8),
        vehSpeed: Math.floor(
          camera.status === "Heavy" ? 12 + Math.random() * 14 : camera.status === "Moderate" ? 28 + Math.random() * 18 : 55 + Math.random() * 20
        ),
      };
    });

    const render = () => {
      frame++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 1. Draw Road Surface
      ctx.fillStyle = "#1e293b";
      ctx.fillRect(0, 20, canvas.width, canvas.height - 40);

      // 2. Draw Lane Dividers
      ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
      ctx.setLineDash([12, 10]);
      ctx.lineWidth = 1.5;

      for (let l = 1; l < camera.lanes; l++) {
        const lineY = 20 + l * 34;
        ctx.beginPath();
        ctx.moveTo(0, lineY);
        ctx.lineTo(canvas.width, lineY);
        ctx.stroke();
      }
      ctx.setLineDash([]);

      // 3. Draw Road Boundaries
      ctx.strokeStyle = "#e2e8f0";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, 20);
      ctx.lineTo(canvas.width, 20);
      ctx.moveTo(0, 20 + camera.lanes * 34);
      ctx.lineTo(canvas.width, 20 + camera.lanes * 34);
      ctx.stroke();

      // 4. Draw Vehicles & AI Detection Bounding Boxes
      vehicles.forEach((v) => {
        const currentSpeed = camera.status === "Heavy" ? v.speed * 0.4 : camera.status === "Moderate" ? v.speed * 0.8 : v.speed * 1.4;
        v.x += currentSpeed;
        if (v.x > canvas.width + 40) {
          v.x = -60;
        }

        // Vehicle Body
        ctx.fillStyle = v.color;
        ctx.beginPath();
        ctx.roundRect(v.x, v.y, v.width, v.height, 4);
        ctx.fill();

        // Windshield
        ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
        ctx.fillRect(v.x + v.width * 0.65, v.y + 2, v.width * 0.2, v.height - 4);

        // Headlights
        ctx.fillStyle = "#fef08a";
        ctx.fillRect(v.x + v.width - 2, v.y + 2, 2, 3);
        ctx.fillRect(v.x + v.width - 2, v.y + v.height - 5, 2, 3);

        // AI Bounding Box & Class Label
        if (showBoundingBoxes) {
          ctx.strokeStyle = v.color;
          ctx.lineWidth = 1.5;
          ctx.strokeRect(v.x - 3, v.y - 3, v.width + 6, v.height + 6);

          ctx.fillStyle = "rgba(15, 23, 42, 0.85)";
          ctx.fillRect(v.x - 3, v.y - 15, 60, 11);

          ctx.fillStyle = "#fff";
          ctx.font = "8px 'Inter', sans-serif";
          ctx.fillText(`${v.type} ${v.conf}%`, v.x, v.y - 6);
        }
      });

      // 5. Draw Live Telemetry HUD Watermark
      ctx.fillStyle = "rgba(15, 23, 42, 0.75)";
      ctx.fillRect(8, 6, 210, 14);
      ctx.fillStyle = "#10b981";
      ctx.font = "bold 9px monospace";
      ctx.fillText(`● REC [${camera.id}] ${camera.fps} FPS | BITRATE: ${camera.bitrate}`, 12, 16);

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [camera, showBoundingBoxes]);

  return (
    <canvas
      ref={canvasRef}
      width={440}
      height={180}
      style={{
        width: "100%",
        height: "180px",
        borderRadius: "8px",
        backgroundColor: "#090d16",
        display: "block",
      }}
    />
  );
}

function TrafficMonitoring() {
  const [selectedCameraId, setSelectedCameraId] = useState("CAM-01");
  const [viewMode, setViewMode] = useState("grid"); // 'grid' | 'focus'
  const [zoneFilter, setZoneFilter] = useState("All");
  const [showBoundingBoxes, setShowBoundingBoxes] = useState(true);
  const [events, setEvents] = useState(INITIAL_EVENTS);
  const [signalSeconds, setSignalSeconds] = useState(38);
  const [trafficTelemetry, setTrafficTelemetry] = useState([]);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);

  useEffect(() => {
    const loadTraffic = async () => {
      try {
        const data = await getTrafficData();
        setTrafficTelemetry(data || []);
      } catch (err) {
        console.error(err);
      }
    };
    loadTraffic();
    const timer = setInterval(loadTraffic, 5000);
    return () => clearInterval(timer);
  }, []);

  // Signal Phase countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setSignalSeconds((prev) => (prev > 1 ? prev - 1 : 45));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Filter cameras
  const filteredCameras = useMemo(() => {
    if (zoneFilter === "All") return CAMERAS;
    return CAMERAS.filter((c) => c.zone.includes(zoneFilter));
  }, [zoneFilter]);

  const activeCamera = useMemo(() => {
    return CAMERAS.find((c) => c.id === selectedCameraId) || CAMERAS[0];
  }, [selectedCameraId]);

  const handleTriggerAlert = () => {
    const newEvent = {
      id: Date.now(),
      time: "Just now",
      camera: `${activeCamera.id} (${activeCamera.name})`,
      type: "Critical",
      text: `Manual operator emergency dispatch triggered for ${activeCamera.name}. Signal hold requested.`,
    };
    setEvents([newEvent, ...events]);
  };

  const handleCaptureSnapshot = () => {
    alert(`📸 Camera snapshot captured from ${activeCamera.name} (${activeCamera.id}) and saved to telemetry archive.`);
  };

  return (
    <AdminLayout
      title="Traffic Monitoring Center"
      subtitle="Real-time CCTV stream analysis, optical flow density, AI object detection, and anomaly surveillance"
    >
      {/* Top Telemetry Metric Strip */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "16px",
          marginBottom: "24px",
        }}
      >
        <div
          style={{
            background: "var(--bg-surface)",
            padding: "18px 20px",
            borderRadius: "14px",
            border: "1px solid var(--border-color)",
            boxShadow: "var(--shadow-sm)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-muted)", fontSize: "12px", fontWeight: "600", marginBottom: "6px" }}>
            <span>ACTIVE CCTV CAMERAS</span>
            <span>📹</span>
          </div>
          <strong style={{ fontSize: "24px", color: "var(--text-primary)" }}>{CAMERAS.length} Feeds</strong>
          <div style={{ fontSize: "12px", color: "var(--success)", marginTop: "4px" }}>● 100% Online & Streaming</div>
        </div>

        <div
          style={{
            background: "var(--bg-surface)",
            padding: "18px 20px",
            borderRadius: "14px",
            border: "1px solid var(--border-color)",
            boxShadow: "var(--shadow-sm)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-muted)", fontSize: "12px", fontWeight: "600", marginBottom: "6px" }}>
            <span>AI OBJECT DETECTIONS</span>
            <span>🎯</span>
          </div>
          <strong style={{ fontSize: "24px", color: "var(--primary)" }}>198 veh / frame</strong>
          <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "4px" }}>Avg Model Confidence: 95.8%</div>
        </div>

        <div
          style={{
            background: "var(--bg-surface)",
            padding: "18px 20px",
            borderRadius: "14px",
            border: "1px solid var(--border-color)",
            boxShadow: "var(--shadow-sm)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-muted)", fontSize: "12px", fontWeight: "600", marginBottom: "6px" }}>
            <span>SIGNAL PHASE STATUS</span>
            <span>🚦</span>
          </div>
          <strong style={{ fontSize: "24px", color: "var(--success)" }}>🟢 Green Wave</strong>
          <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "4px" }}>{signalSeconds}s cycle remaining</div>
        </div>

        <div
          style={{
            background: "var(--bg-surface)",
            padding: "18px 20px",
            borderRadius: "14px",
            border: "1px solid var(--border-color)",
            boxShadow: "var(--shadow-sm)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-muted)", fontSize: "12px", fontWeight: "600", marginBottom: "6px" }}>
            <span>STREAM ANOMALIES</span>
            <span>🚨</span>
          </div>
          <strong style={{ fontSize: "24px", color: "var(--warning)" }}>{events.length} Events</strong>
          <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "4px" }}>Last event 1 min ago</div>
        </div>
      </div>

      {/* Control Bar & Zone Switcher */}
      <div
        style={{
          background: "var(--bg-surface)",
          padding: "16px 20px",
          borderRadius: "14px",
          border: "1px solid var(--border-color)",
          boxShadow: "var(--shadow-sm)",
          marginBottom: "24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "16px",
          flexWrap: "wrap",
        }}
      >
        {/* Zone Selector Chips */}
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          {["All", "Central", "East", "South", "North"].map((zone) => (
            <button
              key={zone}
              onClick={() => setZoneFilter(zone)}
              style={{
                padding: "6px 14px",
                borderRadius: "8px",
                fontSize: "13px",
                fontWeight: "600",
                border: "1px solid",
                borderColor: zoneFilter === zone ? "var(--primary)" : "var(--border-color)",
                backgroundColor: zoneFilter === zone ? "rgba(59, 130, 246, 0.12)" : "transparent",
                color: zoneFilter === zone ? "var(--primary)" : "var(--text-secondary)",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              📍 {zone === "All" ? "All Bengaluru Zones" : `${zone} Sector`}
            </button>
          ))}
        </div>

        {/* View Mode & Overlay Toggles */}
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <button
            onClick={() => setShowBoundingBoxes(!showBoundingBoxes)}
            style={{
              padding: "6px 12px",
              borderRadius: "8px",
              fontSize: "12px",
              fontWeight: "600",
              border: "1px solid var(--border-color)",
              backgroundColor: showBoundingBoxes ? "rgba(16, 185, 129, 0.12)" : "var(--bg-input)",
              color: showBoundingBoxes ? "var(--success)" : "var(--text-muted)",
              cursor: "pointer",
            }}
          >
            {showBoundingBoxes ? "🎯 AI Overlays: ON" : "🎯 AI Overlays: OFF"}
          </button>

          <div style={{ display: "flex", border: "1px solid var(--border-color)", borderRadius: "8px", overflow: "hidden" }}>
            <button
              onClick={() => setViewMode("grid")}
              style={{
                padding: "6px 14px",
                border: "none",
                fontSize: "13px",
                fontWeight: "600",
                backgroundColor: viewMode === "grid" ? "var(--primary)" : "transparent",
                color: viewMode === "grid" ? "#fff" : "var(--text-secondary)",
                cursor: "pointer",
              }}
            >
              ⊞ Grid View
            </button>
            <button
              onClick={() => setViewMode("focus")}
              style={{
                padding: "6px 14px",
                border: "none",
                fontSize: "13px",
                fontWeight: "600",
                backgroundColor: viewMode === "focus" ? "var(--primary)" : "transparent",
                color: viewMode === "focus" ? "#fff" : "var(--text-secondary)",
                cursor: "pointer",
              }}
            >
              🔍 Single Focus
            </button>
          </div>
        </div>
      </div>

      {/* Main Monitoring Section: Feeds + Stream Telemetry & Event Feed */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: viewMode === "focus" ? "1fr 360px" : "1fr 340px",
          gap: "24px",
          alignItems: "start",
        }}
      >
        {/* Left Column: Camera Feeds */}
        <div>
          {viewMode === "grid" ? (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
                gap: "18px",
              }}
            >
              {filteredCameras.map((cam) => {
                const isSelected = cam.id === selectedCameraId;
                const isHeavy = cam.status === "Heavy";
                const isMod = cam.status === "Moderate";

                return (
                  <div
                    key={cam.id}
                    onClick={() => setSelectedCameraId(cam.id)}
                    style={{
                      background: "var(--bg-surface)",
                      borderRadius: "12px",
                      overflow: "hidden",
                      border: isSelected ? "2px solid var(--primary)" : "1px solid var(--border-color)",
                      boxShadow: isSelected ? "0 0 12px rgba(59, 130, 246, 0.25)" : "var(--shadow-sm)",
                      cursor: "pointer",
                      transition: "transform 0.15s ease",
                    }}
                  >
                    {/* Camera Header */}
                    <div
                      style={{
                        padding: "10px 14px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        backgroundColor: "var(--bg-surface-secondary)",
                        borderBottom: "1px solid var(--border-color)",
                      }}
                    >
                      <div>
                        <strong style={{ fontSize: "13px", color: "var(--text-primary)" }}>{cam.name}</strong>
                        <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{cam.id} • {cam.zone}</div>
                      </div>

                      <span
                        style={{
                          fontSize: "11px",
                          fontWeight: "700",
                          padding: "2px 8px",
                          borderRadius: "6px",
                          backgroundColor: isHeavy
                            ? "rgba(239, 68, 68, 0.12)"
                            : isMod
                            ? "rgba(245, 158, 11, 0.12)"
                            : "rgba(16, 185, 129, 0.12)",
                          color: isHeavy ? "var(--danger)" : isMod ? "var(--warning)" : "var(--success)",
                        }}
                      >
                        ● {cam.status}
                      </span>
                    </div>

                    {/* Stream Canvas */}
                    <div style={{ padding: "8px" }}>
                      <CameraCanvas camera={cam} isSelected={isSelected} showBoundingBoxes={showBoundingBoxes} />
                    </div>

                    {/* Quick Telemetry Footnote */}
                    <div
                      style={{
                        padding: "8px 14px",
                        display: "flex",
                        justifyContent: "space-between",
                        fontSize: "11px",
                        color: "var(--text-muted)",
                        borderTop: "1px solid var(--border-color)",
                      }}
                    >
                      <span>Speed Limit: {cam.speedLimit} km/h</span>
                      <span>Density: {cam.baseVehicles} veh/view</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Focus View */
            <div
              style={{
                background: "var(--bg-surface)",
                borderRadius: "14px",
                padding: "20px",
                border: "1px solid var(--border-color)",
                boxShadow: "var(--shadow-sm)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <div>
                  <h2 style={{ fontSize: "18px", margin: 0, color: "var(--text-primary)" }}>{activeCamera.name}</h2>
                  <p style={{ margin: "4px 0 0 0", fontSize: "13px", color: "var(--text-muted)" }}>
                    {activeCamera.id} • {activeCamera.location} • Coordinates: {activeCamera.coordinates}
                  </p>
                </div>

                <div style={{ display: "flex", gap: "10px" }}>
                  <button
                    onClick={handleCaptureSnapshot}
                    style={{
                      padding: "8px 14px",
                      background: "var(--bg-input)",
                      color: "var(--text-primary)",
                      border: "1px solid var(--border-color)",
                      borderRadius: "8px",
                      fontSize: "13px",
                      fontWeight: "600",
                      cursor: "pointer",
                    }}
                  >
                    📸 Snapshot
                  </button>
                  <button
                    onClick={handleTriggerAlert}
                    style={{
                      padding: "8px 14px",
                      background: "var(--danger)",
                      color: "#fff",
                      border: "none",
                      borderRadius: "8px",
                      fontSize: "13px",
                      fontWeight: "600",
                      cursor: "pointer",
                    }}
                  >
                    🚨 Alert Dispatch
                  </button>
                </div>
              </div>

              {/* Large Camera Canvas */}
              <div
                style={{
                  transform: `scale(${zoomLevel}) translate(${panX}px, ${panY}px)`,
                  transition: "transform 0.2s ease",
                  overflow: "hidden",
                  borderRadius: "10px",
                }}
              >
                <CameraCanvas camera={activeCamera} isSelected={true} showBoundingBoxes={showBoundingBoxes} />
              </div>

              {/* PTZ Camera Controls */}
              <div
                style={{
                  marginTop: "16px",
                  padding: "14px 18px",
                  background: "var(--bg-surface-secondary)",
                  borderRadius: "10px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "12px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontSize: "12px", fontWeight: "600", color: "var(--text-muted)" }}>PTZ CONTROLS:</span>
                  <button
                    onClick={() => setPanX((p) => p - 20)}
                    style={{ padding: "4px 10px", borderRadius: "6px", border: "1px solid var(--border-color)", background: "var(--bg-surface)", color: "var(--text-primary)", cursor: "pointer" }}
                  >
                    ◀ Pan L
                  </button>
                  <button
                    onClick={() => setPanX((p) => p + 20)}
                    style={{ padding: "4px 10px", borderRadius: "6px", border: "1px solid var(--border-color)", background: "var(--bg-surface)", color: "var(--text-primary)", cursor: "pointer" }}
                  >
                    Pan R ▶
                  </button>
                  <button
                    onClick={() => setPanY((p) => p - 15)}
                    style={{ padding: "4px 10px", borderRadius: "6px", border: "1px solid var(--border-color)", background: "var(--bg-surface)", color: "var(--text-primary)", cursor: "pointer" }}
                  >
                    ▲ Tilt Up
                  </button>
                  <button
                    onClick={() => setPanY((p) => p + 15)}
                    style={{ padding: "4px 10px", borderRadius: "6px", border: "1px solid var(--border-color)", background: "var(--bg-surface)", color: "var(--text-primary)", cursor: "pointer" }}
                  >
                    ▼ Tilt Down
                  </button>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <button
                    onClick={() => setZoomLevel((z) => Math.min(z + 0.2, 1.8))}
                    style={{ padding: "4px 10px", borderRadius: "6px", border: "1px solid var(--border-color)", background: "var(--bg-surface)", color: "var(--text-primary)", cursor: "pointer" }}
                  >
                    🔍 Zoom In
                  </button>
                  <button
                    onClick={() => setZoomLevel((z) => Math.max(z - 0.2, 1))}
                    style={{ padding: "4px 10px", borderRadius: "6px", border: "1px solid var(--border-color)", background: "var(--bg-surface)", color: "var(--text-primary)", cursor: "pointer" }}
                  >
                    🔍 Zoom Out
                  </button>
                  <button
                    onClick={() => {
                      setZoomLevel(1);
                      setPanX(0);
                      setPanY(0);
                    }}
                    style={{ padding: "4px 10px", borderRadius: "6px", border: "1px solid var(--border-color)", background: "var(--bg-surface)", color: "var(--text-muted)", cursor: "pointer" }}
                  >
                    ↺ Reset
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Live Stream Telemetry & Anomaly Log */}
        <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          {/* Active Camera Telemetry Card */}
          <div
            style={{
              background: "var(--bg-surface)",
              borderRadius: "14px",
              padding: "20px",
              border: "1px solid var(--border-color)",
              boxShadow: "var(--shadow-sm)",
            }}
          >
            <h3 style={{ fontSize: "15px", margin: "0 0 14px 0", color: "var(--text-primary)" }}>
              Stream Telemetry: {activeCamera.id}
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "13px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--border-color)", paddingBottom: "6px" }}>
                <span style={{ color: "var(--text-muted)" }}>Target Corridor</span>
                <strong style={{ color: "var(--text-primary)" }}>{activeCamera.name}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--border-color)", paddingBottom: "6px" }}>
                <span style={{ color: "var(--text-muted)" }}>Regional Sector</span>
                <span style={{ color: "var(--text-primary)" }}>{activeCamera.zone}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--border-color)", paddingBottom: "6px" }}>
                <span style={{ color: "var(--text-muted)" }}>Speed Limit</span>
                <span style={{ color: "var(--text-primary)" }}>{activeCamera.speedLimit} km/h</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--border-color)", paddingBottom: "6px" }}>
                <span style={{ color: "var(--text-muted)" }}>Active Signal Timing</span>
                <strong style={{ color: "var(--success)" }}>🟢 {signalSeconds}s Green</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--text-muted)" }}>Optical Flow Quality</span>
                <span style={{ color: "var(--primary)" }}>98.4% (Ultra Clear)</span>
              </div>
            </div>
          </div>

          {/* AI Stream Anomaly & Incident Log */}
          <div
            style={{
              background: "var(--bg-surface)",
              borderRadius: "14px",
              padding: "20px",
              border: "1px solid var(--border-color)",
              boxShadow: "var(--shadow-sm)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
              <h3 style={{ fontSize: "15px", margin: 0, color: "var(--text-primary)" }}>
                Live Stream Anomaly Feed
              </h3>
              <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Auto-refreshing</span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {events.map((ev) => {
                const isCrit = ev.type === "Critical";
                const isWarn = ev.type === "Warning";

                return (
                  <div
                    key={ev.id}
                    style={{
                      padding: "10px 12px",
                      borderRadius: "8px",
                      backgroundColor: "var(--bg-surface-secondary)",
                      borderLeft: `4px solid ${
                        isCrit ? "var(--danger)" : isWarn ? "var(--warning)" : "var(--primary)"
                      }`,
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "var(--text-muted)", marginBottom: "4px" }}>
                      <span style={{ fontWeight: "700", color: isCrit ? "var(--danger)" : isWarn ? "var(--warning)" : "var(--text-primary)" }}>
                        {ev.camera}
                      </span>
                      <span>{ev.time}</span>
                    </div>
                    <p style={{ margin: 0, fontSize: "12px", color: "var(--text-secondary)", lineHeight: "1.4" }}>
                      {ev.text}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

export default TrafficMonitoring;