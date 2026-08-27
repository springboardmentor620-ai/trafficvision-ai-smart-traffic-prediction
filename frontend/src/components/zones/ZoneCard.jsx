function ZoneCard({ zone, onEdit, onDelete }) {
  // Determine risk level styling based on status
  const isHeavy = zone.status === "Heavy" || zone.status === "High" || zone.status === "Critical";
  const isModerate = zone.status === "Moderate" || zone.status === "Medium";

  const statusBg = isHeavy
    ? "rgba(239, 68, 68, 0.12)"
    : isModerate
    ? "rgba(245, 158, 11, 0.12)"
    : "rgba(16, 185, 129, 0.12)";

  const statusColor = isHeavy
    ? "var(--danger)"
    : isModerate
    ? "var(--warning)"
    : "var(--success)";

  const statusText = isHeavy
    ? "High Congestion Risk"
    : isModerate
    ? "Moderate Traffic Load"
    : "Normal Free Flow";

  // Derive zone sector type heuristic
  const sectorType =
    zone.name.toLowerCase().includes("it") || zone.name.toLowerCase().includes("tech")
      ? "Technology & IT Corridor"
      : zone.name.toLowerCase().includes("cbd") || zone.name.toLowerCase().includes("central")
      ? "Commercial Core Sector"
      : zone.name.toLowerCase().includes("airport")
      ? "Expressway Transit Sector"
      : zone.name.toLowerCase().includes("industrial")
      ? "Industrial Logistics Sector"
      : "Residential & Commercial Belt";

  // Signal Policy heuristic
  const signalPolicy = isHeavy
    ? "Adaptive AI Green Wave (Peak Phase Priority)"
    : isModerate
    ? "Dynamic Signal Coordination & Queue Metering"
    : "Standard Automated Flow Optimization";

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
          {/* Header Row: Zone Name + Sector Classification Tag */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px", flexWrap: "wrap" }}>
            <h3 style={{ color: "var(--text-primary)", margin: 0, fontSize: "17px", fontWeight: "700" }}>
              🗺️ {zone.name}
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
              {sectorType}
            </span>
          </div>

          {/* Location */}
          <p style={{ color: "var(--text-muted)", fontSize: "13px", margin: "0 0 14px 0" }}>
            📍 {zone.city}, {zone.state}
          </p>

          {/* Metric Badges Grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
              gap: "10px",
              marginBottom: "14px",
            }}
          >
            {/* Risk / Congestion Status */}
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
                Sector Load
              </span>
              <strong style={{ fontSize: "13px", color: statusColor }}>
                ● {statusText}
              </strong>
            </div>

            {/* Connected Corridors Count */}
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
                Active Arterials
              </span>
              <strong style={{ fontSize: "13px", color: "var(--text-primary)" }}>
                🛣️ {zone.roads || 8} Monitored Roads
              </strong>
            </div>

            {/* Signal Control Policy */}
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
                Peak Window
              </span>
              <strong style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                ⏰ 08:30 - 11:30 AM / 05:30 - 09:00 PM
              </strong>
            </div>
          </div>

          {/* Active Traffic Policy Box */}
          <div
            style={{
              padding: "8px 12px",
              borderRadius: "8px",
              backgroundColor: "var(--bg-surface-secondary)",
              border: "1px solid var(--border-color)",
              fontSize: "12px",
              color: "var(--text-secondary)",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <span>⚡ <strong>Signal Management:</strong></span>
            <span style={{ color: "var(--primary)", fontWeight: "600" }}>{signalPolicy}</span>
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
            onClick={() => onEdit(zone)}
            title="Edit Zone Parameters"
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
            onClick={() => onDelete(zone.id)}
            title="Delete Zone"
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

export default ZoneCard;