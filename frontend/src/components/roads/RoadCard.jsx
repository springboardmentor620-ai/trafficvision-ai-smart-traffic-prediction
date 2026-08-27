function RoadCard({ road, onEdit, onDelete }) {
  // Determine traffic utilization percentage based on status
  const utilization =
    road.status === "Heavy" ? 86 : road.status === "Moderate" ? 58 : 28;

  const statusBg =
    road.status === "Heavy"
      ? "rgba(239, 68, 68, 0.12)"
      : road.status === "Moderate"
      ? "rgba(245, 158, 11, 0.12)"
      : "rgba(16, 185, 129, 0.12)";

  const statusColor =
    road.status === "Heavy"
      ? "var(--danger)"
      : road.status === "Moderate"
      ? "var(--warning)"
      : "var(--success)";

  // Determine roadway type heuristic
  const roadType =
    road.speed_limit >= 80
      ? "Arterial Expressway"
      : road.speed_limit >= 60
      ? "Primary Arterial Corridor"
      : "Commercial Avenue";

  return (
    <div
      style={{
        background: "var(--bg-surface)",
        color: "var(--text-primary)",
        padding: "22px 26px",
        borderRadius: "14px",
        marginBottom: "16px",
        border: "1px solid var(--border-color)",
        boxShadow: "var(--shadow-sm)",
        transition: "all 0.2s ease-in-out",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: "16px",
          flexWrap: "wrap",
        }}
      >
        <div style={{ flex: 1, minWidth: "280px" }}>
          {/* Header Row: Road Name + Category Tag */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px", flexWrap: "wrap" }}>
            <h3 style={{ color: "var(--text-primary)", margin: 0, fontSize: "17px", fontWeight: "700" }}>
              🛣️ {road.name}
            </h3>
            <span
              style={{
                fontSize: "11px",
                fontWeight: "600",
                padding: "2px 8px",
                borderRadius: "6px",
                backgroundColor: "var(--bg-surface-secondary)",
                border: "1px solid var(--border-color)",
                color: "var(--primary)",
              }}
            >
              {roadType}
            </span>
          </div>

          {/* Location & GPS Coordinates */}
          <div style={{ display: "flex", alignItems: "center", gap: "14px", fontSize: "13px", color: "var(--text-muted)", marginBottom: "12px", flexWrap: "wrap" }}>
            <span>📍 {road.city}, {road.state}</span>
            <span>•</span>
            <span style={{ fontFamily: "monospace" }}>
              🌐 Lat: {Number(road.latitude || 12.9716).toFixed(4)}°, Lng: {Number(road.longitude || 77.5946).toFixed(4)}°
            </span>
          </div>

          {/* Metric Badges Grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
              gap: "10px",
              marginBottom: "14px",
            }}
          >
            {/* Status Pill */}
            <div
              style={{
                padding: "8px 12px",
                borderRadius: "8px",
                backgroundColor: statusBg,
                border: `1px solid ${statusColor}`,
                display: "flex",
                flexDirection: "column",
                gap: "2px",
              }}
            >
              <span style={{ fontSize: "10px", fontWeight: "700", color: statusColor, textTransform: "uppercase" }}>
                Traffic Status
              </span>
              <strong style={{ fontSize: "13px", color: statusColor }}>
                ● {road.status} Load
              </strong>
            </div>

            {/* Speed Limit */}
            <div
              style={{
                padding: "8px 12px",
                borderRadius: "8px",
                backgroundColor: "var(--bg-surface-secondary)",
                border: "1px solid var(--border-color)",
                display: "flex",
                flexDirection: "column",
                gap: "2px",
              }}
            >
              <span style={{ fontSize: "10px", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase" }}>
                Speed Regulation
              </span>
              <strong style={{ fontSize: "13px", color: "var(--text-primary)" }}>
                ⚡ {road.speed_limit} km/h Max
              </strong>
            </div>

            {/* Capacity Utilization */}
            <div
              style={{
                padding: "8px 12px",
                borderRadius: "8px",
                backgroundColor: "var(--bg-surface-secondary)",
                border: "1px solid var(--border-color)",
                display: "flex",
                flexDirection: "column",
                gap: "2px",
              }}
            >
              <span style={{ fontSize: "10px", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase" }}>
                Capacity Load
              </span>
              <strong style={{ fontSize: "13px", color: statusColor }}>
                📊 {utilization}% Capacity
              </strong>
            </div>
          </div>

          {/* Utilization Progress Bar */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "var(--text-muted)", marginBottom: "4px" }}>
              <span>Corridor Telemetry Load</span>
              <span>{utilization}%</span>
            </div>
            <div style={{ height: "5px", width: "100%", backgroundColor: "var(--border-color)", borderRadius: "3px", overflow: "hidden" }}>
              <div
                style={{
                  height: "100%",
                  width: `${utilization}%`,
                  backgroundColor: statusColor,
                  borderRadius: "3px",
                  transition: "width 0.4s ease",
                }}
              />
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div
          style={{
            display: "flex",
            gap: "8px",
            flexShrink: 0,
            alignItems: "center",
          }}
        >
          <button
            onClick={() => onEdit(road)}
            title="Edit Corridor Properties"
            style={{
              padding: "8px 16px",
              borderRadius: "8px",
              border: "1px solid var(--border-color)",
              backgroundColor: "var(--bg-surface-secondary)",
              color: "var(--text-primary)",
              fontWeight: "600",
              fontSize: "13px",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              transition: "all 0.2s",
            }}
          >
            ✏️ Edit
          </button>

          <button
            onClick={() => onDelete(road.id)}
            title="Delete Corridor"
            style={{
              padding: "8px 16px",
              borderRadius: "8px",
              border: "none",
              background: "var(--danger)",
              color: "#fff",
              fontWeight: "600",
              fontSize: "13px",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              transition: "all 0.2s",
            }}
          >
            🗑️ Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export default RoadCard;