import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Loader from "../components/Loader";
import SummaryCard from "../components/SummaryCard";
import { getNotificationVisual } from "../components/NotificationCard";
import { getAlerts, deleteAlert, markAlertRead } from "../services/alertService";
import { toast } from "react-toastify";

const SEVERITY_OPTIONS = ["Critical", "High", "Medium", "Low"];
const CATEGORY_OPTIONS = ["Congestion", "Accident", "Weather", "Road Work", "Event"];

function formatAlertTime(timestamp) {

    if (!timestamp) {
        return "Time unavailable";
    }

    const date = new Date(timestamp);

    if (Number.isNaN(date.getTime())) {
        return "Time unavailable";
    }

    return date.toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short"
    });
}

function Alerts() {
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [deletingId, setDeletingId] = useState(null);

    const [severity, setSeverity] = useState("");
    const [category, setCategory] = useState("");
    const [search, setSearch] = useState("");
    const [searchInput, setSearchInput] = useState("");
    const [readBusyId, setReadBusyId] = useState(null);

    const criticalAlerts = alerts.filter((a) => a.severity === "Critical").length;
    const highAlerts = alerts.filter((a) => a.severity === "High").length;
    const mediumAlerts = alerts.filter((a) => a.severity === "Medium").length;
    const lowAlerts = alerts.filter((a) => a.severity === "Low").length;

    // Debounce the free-text search so we don't fire a request on every keystroke.
    useEffect(() => {
        const timer = setTimeout(() => setSearch(searchInput.trim()), 400);
        return () => clearTimeout(timer);
    }, [searchInput]);

    useEffect(() => {
        loadAlerts();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [severity, category, search]);

    async function loadAlerts() {
        try {
            setLoading(true);
            setError(null);

            const data = await getAlerts({ severity, category, search });
            setAlerts(data);
        } catch (err) {
            console.log(err);
            setError("We couldn't load your alerts. Please try again.");
            toast.error("Failed to load alerts.");
        } finally {
            setLoading(false);
        }
    }

    async function removeAlert(id) {
        try {
            setDeletingId(id);
            await deleteAlert(id);
            setAlerts((prev) => prev.filter((alert) => alert.id !== id));
            toast.success("Alert deleted.");
        } catch (err) {
            console.log(err);
            toast.error("Delete failed.");
        } finally {
            setDeletingId(null);
        }
    }

    async function markRead(id) {
        try {
            setReadBusyId(id);
            const updated = await markAlertRead(id);
            setAlerts((prev) => prev.map((a) => (a.id === id ? updated : a)));
        } catch (err) {
            console.log(err);
            toast.error("Couldn't mark as read.");
        } finally {
            setReadBusyId(null);
        }
    }

    const hasActiveFilters = Boolean(severity || category || search);

    function clearFilters() {
        setSeverity("");
        setCategory("");
        setSearch("");
        setSearchInput("");
    }

    if (loading && alerts.length === 0) {
        return <Loader />;
    }

    return (
        <>
            <Navbar />

            <div
                style={{
                    padding: "30px",
                    background: "#f5f7fb",
                    minHeight: "100vh",
                }}
            >
                <div style={{ marginBottom: "8px" }}>
                    <h1 style={{ color: "#1e3a8a", margin: 0 }}>🚨 Traffic Alerts</h1>
                    <p style={{ color: "#64748b", marginTop: "6px" }}>
                        Alerts are generated automatically from live predictions —
                        filter by severity, category, or search a route below.
                    </p>
                </div>

                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                        gap: "20px",
                        marginTop: "25px",
                        marginBottom: "25px",
                    }}
                >
                    <SummaryCard title="Total Alerts" value={alerts.length} color="#2563eb" />
                    <SummaryCard title="Critical" value={criticalAlerts} color="#991b1b" />
                    <SummaryCard title="High" value={highAlerts} color="#ef4444" />
                    <SummaryCard title="Medium" value={mediumAlerts} color="#f59e0b" />
                    <SummaryCard title="Low" value={lowAlerts} color="#22c55e" />
                </div>

                <div
                    style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: "12px",
                        alignItems: "center",
                        background: "white",
                        padding: "16px 20px",
                        borderRadius: "14px",
                        boxShadow: "0 6px 18px rgba(0,0,0,.06)",
                        marginBottom: "25px",
                    }}
                >
                    <input
                        type="text"
                        placeholder="Search source, destination, or message..."
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        style={{
                            flex: "1 1 240px",
                            padding: "10px 14px",
                            borderRadius: "8px",
                            border: "1px solid #e2e8f0",
                            outline: "none",
                            fontSize: "14px",
                        }}
                    />

                    <select
                        value={severity}
                        onChange={(e) => setSeverity(e.target.value)}
                        style={selectStyle}
                    >
                        <option value="">All severities</option>
                        {SEVERITY_OPTIONS.map((s) => (
                            <option key={s} value={s}>{s}</option>
                        ))}
                    </select>

                    <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        style={selectStyle}
                    >
                        <option value="">All categories</option>
                        {CATEGORY_OPTIONS.map((c) => (
                            <option key={c} value={c}>{c}</option>
                        ))}
                    </select>

                    {hasActiveFilters && (
                        <button onClick={clearFilters} style={clearButtonStyle}>
                            Clear filters
                        </button>
                    )}
                </div>

                {error && (
                    <div style={emptyStateStyle}>
                        <p style={{ color: "#dc2626", fontWeight: 600 }}>{error}</p>
                        <button onClick={loadAlerts} style={clearButtonStyle}>
                            Retry
                        </button>
                    </div>
                )}

                {!error && !loading && alerts.length === 0 && (
                    <div style={emptyStateStyle}>
                        <div style={{ fontSize: "40px" }}>✅</div>
                        <h3 style={{ color: "#1e3a8a", margin: "10px 0 4px" }}>
                            {hasActiveFilters ? "No alerts match your filters" : "No alerts right now"}
                        </h3>
                        <p style={{ color: "#64748b", margin: 0 }}>
                            {hasActiveFilters
                                ? "Try clearing a filter or searching a different route."
                                : "New alerts appear here automatically whenever a prediction detects a risk."}
                        </p>
                        {hasActiveFilters && (
                            <button onClick={clearFilters} style={{ ...clearButtonStyle, marginTop: "14px" }}>
                                Clear filters
                            </button>
                        )}
                    </div>
                )}

                {!error && alerts.length > 0 && (
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
                            gap: "20px",
                            opacity: loading ? 0.6 : 1,
                            transition: "opacity .2s ease",
                        }}
                    >
                        {alerts.map((alert) => {
                            const visual = getNotificationVisual(alert, alert.recommended_route);

                            return (
                                <div
                                    key={alert.id}
                                    style={{
                                        background: "white",
                                        borderLeft: `8px solid ${visual.color}`,
                                        borderRadius: "15px",
                                        padding: "20px",
                                        boxShadow: alert.is_read
                                            ? "0 10px 25px rgba(0,0,0,.08)"
                                            : "0 10px 25px rgba(37,99,235,.18)",
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: "10px",
                                        position: "relative",
                                    }}
                                >
                                    {!alert.is_read && (
                                        <span
                                            title="Unread"
                                            style={{
                                                position: "absolute",
                                                top: "16px",
                                                right: "16px",
                                                width: "10px",
                                                height: "10px",
                                                borderRadius: "50%",
                                                background: "#2563eb",
                                            }}
                                        />
                                    )}

                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                            <span style={{ fontSize: "26px" }}>{visual.icon}</span>
                                            <div>
                                                <h3 style={{ margin: 0, color: visual.color, fontSize: "17px" }}>
                                                    {visual.title}
                                                </h3>
                                                <span
                                                    style={{
                                                        display: "inline-block",
                                                        marginTop: "4px",
                                                        fontSize: "11px",
                                                        fontWeight: 600,
                                                        color: visual.color,
                                                        background: visual.bg,
                                                        borderRadius: "999px",
                                                        padding: "2px 10px",
                                                    }}
                                                >
                                                    {alert.category} · {alert.severity}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <p style={{ margin: 0, color: "#334155", fontSize: "14px" }}>
                                        {visual.subtitle}
                                    </p>

                                    <div style={{ fontSize: "13px", color: "#475569", lineHeight: 1.7 }}>
                                        <div>📍 <b>{alert.source}</b> → 🏁 <b>{alert.destination}</b></div>
                                        <div>🚗 Congestion: <b>{alert.congestion}</b> ({alert.congestion_percentage}%)</div>
                                        <div>⏱️ Expected delay: <b>{alert.expected_delay} min</b></div>
                                        {alert.recommended_route && (
                                            <div>🛣️ Suggested route: <b>{alert.recommended_route}</b></div>
                                        )}
                                        <div>
                                            🕒 {formatAlertTime(alert.created_at)}
                                        </div>
                                    </div>

                                    <div style={{ display: "flex", gap: "10px", marginTop: "6px" }}>
                                        {!alert.is_read && (
                                            <button
                                                onClick={() => markRead(alert.id)}
                                                disabled={readBusyId === alert.id}
                                                style={{
                                                    background: readBusyId === alert.id ? "#93c5fd" : "#2563eb",
                                                    color: "white",
                                                    border: "none",
                                                    padding: "8px 18px",
                                                    borderRadius: "8px",
                                                    cursor: readBusyId === alert.id ? "default" : "pointer",
                                                    fontSize: "13px",
                                                }}
                                            >
                                                {readBusyId === alert.id ? "Marking..." : "Mark as read"}
                                            </button>
                                        )}

                                        <button
                                            onClick={() => {
                                                if (window.confirm("Delete this alert?")) {
                                                    removeAlert(alert.id);
                                                }
                                            }}
                                            disabled={deletingId === alert.id}
                                            style={{
                                                background: deletingId === alert.id ? "#fca5a5" : "#ef4444",
                                                color: "white",
                                                border: "none",
                                                padding: "8px 18px",
                                                borderRadius: "8px",
                                                cursor: deletingId === alert.id ? "default" : "pointer",
                                                fontSize: "13px",
                                            }}
                                        >
                                            {deletingId === alert.id ? "Deleting..." : "Delete"}
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </>
    );
}

const selectStyle = {
    padding: "10px 14px",
    borderRadius: "8px",
    border: "1px solid #e2e8f0",
    outline: "none",
    fontSize: "14px",
    background: "white",
    color: "#334155",
};

const clearButtonStyle = {
    background: "#f1f5f9",
    color: "#334155",
    border: "1px solid #e2e8f0",
    padding: "10px 16px",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: 600,
};

const emptyStateStyle = {
    background: "white",
    borderRadius: "15px",
    padding: "50px 20px",
    textAlign: "center",
    boxShadow: "0 10px 25px rgba(0,0,0,.06)",
};

export default Alerts;
