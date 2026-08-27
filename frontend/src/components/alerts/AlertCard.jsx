function AlertCard({ alert, onResolve }) {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const isCommuter = user?.role === "commuter";

  const isCritical = alert.severity === "Critical";
  const isHigh = alert.severity === "High";
  const isMedium = alert.severity === "Medium";

  const severityColor = isCritical
    ? "var(--danger)"
    : isHigh
    ? "var(--warning)"
    : isMedium
    ? "#f59e0b"
    : "var(--success)";

  const severityBg = isCritical
    ? "rgba(239, 68, 68, 0.12)"
    : isHigh
    ? "rgba(245, 158, 11, 0.12)"
    : isMedium
    ? "rgba(245, 158, 11, 0.1)"
    : "rgba(16, 185, 129, 0.12)";

  const alertTypeIcon =
    alert.alert_type === "Incident"
      ? "🚨 Incident"
      : alert.alert_type === "Roadwork"
      ? "🚧 Roadwork"
      : alert.alert_type === "Emergency"
      ? "🚑 Emergency"
      : "⚠️ Congestion Surge";

  return (
    <div
      style={{
        background: "var(--bg-surface)",
        color: "var(--text-primary)",
        borderRadius: "14px",
        padding: "22px 26px",
        marginBottom: "16px",
        border: alert.status === "Active" ? `1px solid ${severityColor}` : "1px solid var(--border-color)",
        boxShadow: alert.status === "Active" ? `0 4px 16px ${severityBg}` : "var(--shadow-sm)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        gap: "18px",
        flexWrap: "wrap",
        transition: "all 0.2s ease-in-out",
      }}
    >
      <div style={{ flex: 1, minWidth: "280px" }}>
        {/* Header Badges */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px", flexWrap: "wrap" }}>
          <span
            style={{
              fontSize: "11px",
              fontWeight: "700",
              padding: "3px 10px",
              borderRadius: "6px",
              backgroundColor: "var(--bg-surface-secondary)",
              border: "1px solid var(--border-color)",
              color: "var(--text-primary)",
            }}
          >
            {alertTypeIcon}
          </span>

          <span
            style={{
              fontSize: "11px",
              fontWeight: "700",
              padding: "3px 10px",
              borderRadius: "6px",
              backgroundColor: severityBg,
              border: `1px solid ${severityColor}`,
              color: severityColor,
              textTransform: "uppercase",
            }}
          >
            ● {alert.severity} Priority
          </span>

          <span
            style={{
              fontSize: "11px",
              fontWeight: "600",
              color: "var(--text-muted)",
            }}
          >
            📍 {alert.road}
          </span>
        </div>

        {/* Title */}
        <h3 style={{ color: "var(--text-primary)", margin: "0 0 6px 0", fontSize: "16px", fontWeight: "700" }}>
          {alert.title}
        </h3>

        {/* Description / Recommended Action */}
        <p style={{ color: "var(--text-secondary)", margin: "0 0 10px 0", fontSize: "13px", lineHeight: 1.5 }}>
          {alert.message}
        </p>

        {/* Status indicator */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "12px" }}>
          <span
            style={{
              color: alert.status === "Active" ? "var(--danger)" : "var(--success)",
              fontWeight: "600",
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
            }}
          >
            {alert.status === "Active" ? "⚡ Live Dispatch Active" : "✔ Cleared & Normal Flow Restored"}
          </span>
        </div>
      </div>

      {/* Action Section */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "8px", flexShrink: 0 }}>
        {alert.status === "Active" ? (
          onResolve && !isCommuter ? (
            <button
              onClick={() => onResolve(alert.id)}
              style={{
                padding: "8px 18px",
                borderRadius: "8px",
                border: "none",
                background: "var(--primary)",
                color: "#ffffff",
                fontWeight: "600",
                fontSize: "13px",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                transition: "all 0.2s",
              }}
            >
              ✔ Resolve Alert
            </button>
          ) : (
            <span
              style={{
                padding: "6px 14px",
                borderRadius: "8px",
                backgroundColor: severityBg,
                border: `1px solid ${severityColor}`,
                color: severityColor,
                fontWeight: "700",
                fontSize: "12px",
              }}
            >
              ⚡ Active Advisory
            </span>
          )
        ) : (
          <span
            style={{
              padding: "6px 14px",
              borderRadius: "8px",
              backgroundColor: "var(--bg-surface-secondary)",
              border: "1px solid var(--border-color)",
              color: "var(--success)",
              fontWeight: "700",
              fontSize: "12px",
            }}
          >
            ✔ Resolved
          </span>
        )}
      </div>
    </div>
  );
}

export default AlertCard;