import { useEffect, useMemo, useState } from "react";
import AdminLayout from "../../components/dashboard/AdminLayout";
import AlertCard from "../../components/alerts/AlertCard";

import {
  getAlerts,
  resolveAlert,
  testSmtpDispatch,
} from "../../services/alerts";

function Alerts() {
  const [alerts, setAlerts] = useState([]);
  const [search, setSearch] = useState("");
  const [severityFilter, setSeverityFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [loading, setLoading] = useState(false);
  const [smtpStatus, setSmtpStatus] = useState(null);
  const [isSendingSmtp, setIsSendingSmtp] = useState(false);

  const handleTestSmtp = async () => {
    try {
      setIsSendingSmtp(true);
      await testSmtpDispatch({
        recipient: "admin@trafficvision.ai",
        road: "Outer Ring Road (Silk Board Junction)",
        severity: "Critical",
        message: "Test Emergency Incident Dispatch triggered from Municipal Admin Console."
      });
      setSmtpStatus({
        success: true,
        message: "✓ SMTP Alert Dispatch triggered successfully!",
      });
      setTimeout(() => setSmtpStatus(null), 4000);
    } catch (err) {
      setSmtpStatus({
        success: false,
        message: "✕ Failed to dispatch SMTP alert.",
      });
      setTimeout(() => setSmtpStatus(null), 4000);
    } finally {
      setIsSendingSmtp(false);
    }
  };

  const loadAlerts = async () => {
    try {
      setLoading(true);
      const data = await getAlerts();
      setAlerts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load alerts", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAlerts();
    const timer = setInterval(loadAlerts, 6000);
    return () => clearInterval(timer);
  }, []);

  const handleResolve = async (id) => {
    try {
      await resolveAlert(id);
      await loadAlerts();
    } catch (err) {
      console.error("Failed to resolve alert", err);
    }
  };

  const filteredAlerts = useMemo(() => {
    return alerts.filter((alert) => {
      const q = search.toLowerCase();
      const matchesSearch =
        (alert.title || "").toLowerCase().includes(q) ||
        (alert.message || "").toLowerCase().includes(q) ||
        (alert.road || "").toLowerCase().includes(q);

      const matchesSeverity =
        severityFilter === "All" || alert.severity === severityFilter;

      const matchesType =
        typeFilter === "All" ||
        (alert.alert_type || "Congestion").toLowerCase() === typeFilter.toLowerCase();

      const matchesStatus =
        statusFilter === "All" ||
        (statusFilter === "Active" && alert.status === "Active") ||
        (statusFilter === "Resolved" && alert.status !== "Active");

      return matchesSearch && matchesSeverity && matchesType && matchesStatus;
    });
  }, [alerts, search, severityFilter, typeFilter, statusFilter]);

  // Derived statistics
  const totalAlerts = alerts.length;
  const criticalCount = alerts.filter((a) => a.severity === "Critical" && a.status === "Active").length;
  const highCount = alerts.filter((a) => a.severity === "High" && a.status === "Active").length;
  const resolvedCount = alerts.filter((a) => a.status !== "Active").length;

  return (
    <AdminLayout
      title="Traffic Alerts"
      subtitle="Real-time emergency incident dispatch, AI congestion surge detection, and roadwork alerts"
    >
      {/* Top Metric Summary Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "16px",
          marginBottom: "24px",
        }}
      >
        <div
          style={{
            background: "var(--bg-surface)",
            padding: "18px 22px",
            borderRadius: "14px",
            border: "1px solid var(--border-color)",
            boxShadow: "var(--shadow-sm)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
            <span style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: "600" }}>
              TOTAL TELEMETRY ALERTS
            </span>
            <span style={{ fontSize: "18px" }}>🔔</span>
          </div>
          <strong style={{ fontSize: "22px", color: "var(--text-primary)" }}>
            {totalAlerts} Monitored
          </strong>
        </div>

        <div
          style={{
            background: "var(--bg-surface)",
            padding: "18px 22px",
            borderRadius: "14px",
            border: "1px solid var(--border-color)",
            boxShadow: "var(--shadow-sm)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
            <span style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: "600" }}>
              CRITICAL INCIDENTS
            </span>
            <span style={{ fontSize: "18px" }}>🚨</span>
          </div>
          <strong style={{ fontSize: "22px", color: "var(--danger)" }}>
            {criticalCount} Active
          </strong>
        </div>

        <div
          style={{
            background: "var(--bg-surface)",
            padding: "18px 22px",
            borderRadius: "14px",
            border: "1px solid var(--border-color)",
            boxShadow: "var(--shadow-sm)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
            <span style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: "600" }}>
              HIGH SURGE CORRIDORS
            </span>
            <span style={{ fontSize: "18px" }}>⚠️</span>
          </div>
          <strong style={{ fontSize: "22px", color: "var(--warning)" }}>
            {highCount} Active
          </strong>
        </div>

        <div
          style={{
            background: "var(--bg-surface)",
            padding: "18px 22px",
            borderRadius: "14px",
            border: "1px solid var(--border-color)",
            boxShadow: "var(--shadow-sm)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
            <span style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: "600" }}>
              RESOLVED / CLEARED
            </span>
            <span style={{ fontSize: "18px" }}>🟢</span>
          </div>
          <strong style={{ fontSize: "22px", color: "var(--success)" }}>
            {resolvedCount} Cleared
          </strong>
        </div>
      </div>

      {/* Action & Filter Toolbar */}
      <div
        style={{
          background: "var(--bg-surface)",
          padding: "18px 24px",
          borderRadius: "14px",
          border: "1px solid var(--border-color)",
          boxShadow: "var(--shadow-sm)",
          marginBottom: "24px",
          display: "flex",
          gap: "12px",
          flexWrap: "wrap",
        }}
      >
        <input
          type="text"
          placeholder="🔍 Search alerts by title, corridor, or message..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            flex: 1,
            minWidth: "220px",
            height: "40px",
            padding: "0 14px",
            borderRadius: "8px",
            border: "1px solid var(--border-color)",
            backgroundColor: "var(--bg-input)",
            color: "var(--text-primary)",
            fontSize: "14px",
          }}
        />

        {/* Severity Filter */}
        <select
          value={severityFilter}
          onChange={(e) => setSeverityFilter(e.target.value)}
          style={{
            height: "40px",
            padding: "0 14px",
            borderRadius: "8px",
            border: "1px solid var(--border-color)",
            backgroundColor: "var(--bg-surface)",
            color: "var(--text-primary)",
            fontSize: "14px",
            cursor: "pointer",
          }}
        >
          <option value="All">All Severities</option>
          <option value="Critical">🔴 Critical Priority</option>
          <option value="High">🟠 High Priority</option>
          <option value="Medium">🟡 Medium Priority</option>
          <option value="Low">🟢 Low Priority</option>
        </select>

        {/* Type Filter */}
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          style={{
            height: "40px",
            padding: "0 14px",
            borderRadius: "8px",
            border: "1px solid var(--border-color)",
            backgroundColor: "var(--bg-surface)",
            color: "var(--text-primary)",
            fontSize: "14px",
            cursor: "pointer",
          }}
        >
          <option value="All">All Alert Types</option>
          <option value="Incident">🚨 Incident / Collision</option>
          <option value="Congestion">⚠️ Congestion Surge</option>
          <option value="Roadwork">🚧 Roadwork / Construction</option>
          <option value="Emergency">🚑 Emergency / VIP</option>
        </select>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{
            height: "40px",
            padding: "0 14px",
            borderRadius: "8px",
            border: "1px solid var(--border-color)",
            backgroundColor: "var(--bg-surface)",
            color: "var(--text-primary)",
            fontSize: "14px",
            cursor: "pointer",
          }}
        >
          <option value="All">All Statuses</option>
          <option value="Active">⚡ Live Active Only</option>
          <option value="Resolved">✔ Resolved Only</option>
        </select>

        {/* Test SMTP Dispatch Action Button */}
        <button
          onClick={handleTestSmtp}
          disabled={isSendingSmtp}
          style={{
            height: "40px",
            padding: "0 16px",
            borderRadius: "8px",
            border: "1px solid var(--primary)",
            backgroundColor: "rgba(56, 189, 248, 0.1)",
            color: "var(--primary)",
            fontWeight: "600",
            fontSize: "13px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            whiteSpace: "nowrap",
            transition: "all 0.15s ease",
          }}
          title="Send a sample email alert via SMTP dispatcher"
        >
          <span>{isSendingSmtp ? "⏳" : "✉️"}</span>
          <span>{isSendingSmtp ? "Dispatching..." : "Test SMTP Alert Dispatch"}</span>
        </button>
      </div>

      {/* SMTP Status Toast */}
      {smtpStatus && (
        <div
          style={{
            position: "fixed",
            bottom: "30px",
            right: "30px",
            backgroundColor: smtpStatus.success ? "var(--success)" : "var(--danger)",
            color: "#ffffff",
            padding: "12px 20px",
            borderRadius: "8px",
            boxShadow: "var(--shadow-lg)",
            fontWeight: "600",
            fontSize: "13px",
            zIndex: 9999,
          }}
        >
          {smtpStatus.message}
        </div>
      )}

      {/* Alerts List */}
      {loading && alerts.length === 0 ? (
        <div style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>
          Loading active telemetry alerts...
        </div>
      ) : filteredAlerts.length === 0 ? (
        <div
          style={{
            background: "var(--bg-surface)",
            padding: "40px",
            textAlign: "center",
            borderRadius: "14px",
            border: "1px solid var(--border-color)",
            color: "var(--text-muted)",
          }}
        >
          <span style={{ fontSize: "32px", display: "block", marginBottom: "8px" }}>🟢</span>
          <h3 style={{ margin: "0 0 4px 0", color: "var(--text-primary)", fontSize: "16px" }}>
            No Active Alerts Found
          </h3>
          <p style={{ margin: 0, fontSize: "13px" }}>
            All corridor telemetry parameters are operating within safe baseline thresholds.
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {filteredAlerts.map((alert) => (
            <AlertCard
              key={alert.id}
              alert={alert}
              onResolve={handleResolve}
            />
          ))}
        </div>
      )}
    </AdminLayout>
  );
}

export default Alerts;