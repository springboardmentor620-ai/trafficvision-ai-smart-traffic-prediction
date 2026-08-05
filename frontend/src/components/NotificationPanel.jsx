import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getUnreadAlerts, markAlertRead, deleteAlert } from "../services/alertService";
import { getNotificationVisual } from "./NotificationCard";

const REFRESH_INTERVAL_MS = 30000;

function timeAgo(dateString) {
    const seconds = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000);

    if (seconds < 60) return "just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
}

/**
 * Bell-icon notification panel shown in the Navbar on every page.
 *
 * Real-time behavior is deliberately polling, not WebSockets: the panel
 * re-fetches GET /alerts/unread every 30 seconds while mounted, which
 * satisfies "auto-refresh" without adding a persistent connection.
 */
function NotificationPanel() {
    const navigate = useNavigate();
    const containerRef = useRef(null);

    const [alerts, setAlerts] = useState([]);
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [busyId, setBusyId] = useState(null);

    useEffect(() => {
        loadUnread();

        const interval = setInterval(loadUnread, REFRESH_INTERVAL_MS);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        function handleClickOutside(event) {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setOpen(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    async function loadUnread() {
        try {
            const data = await getUnreadAlerts();
            setAlerts(data);
            setError(null);
        } catch (err) {
            console.log(err);
            setError("Couldn't refresh notifications.");
        } finally {
            setLoading(false);
        }
    }

    async function handleMarkRead(id) {
        try {
            setBusyId(id);
            await markAlertRead(id);
            setAlerts((prev) => prev.filter((alert) => alert.id !== id));
        } catch (err) {
            console.log(err);
        } finally {
            setBusyId(null);
        }
    }

    async function handleDismiss(id) {
        try {
            setBusyId(id);
            await deleteAlert(id);
            setAlerts((prev) => prev.filter((alert) => alert.id !== id));
        } catch (err) {
            console.log(err);
        } finally {
            setBusyId(null);
        }
    }

    const unreadCount = alerts.length;

    return (
        <div ref={containerRef} style={{ position: "relative" }}>
            <button
                onClick={() => setOpen((prev) => !prev)}
                aria-label="Notifications"
                style={{
                    position: "relative",
                    background: "rgba(255,255,255,.18)",
                    border: "none",
                    borderRadius: "12px",
                    width: "44px",
                    height: "44px",
                    fontSize: "20px",
                    cursor: "pointer",
                    color: "white",
                }}
            >
                🔔
                {unreadCount > 0 && (
                    <span
                        style={{
                            position: "absolute",
                            top: "-4px",
                            right: "-4px",
                            background: "#dc2626",
                            color: "white",
                            borderRadius: "999px",
                            minWidth: "20px",
                            height: "20px",
                            padding: "0 4px",
                            fontSize: "11px",
                            fontWeight: 700,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            border: "2px solid #1e3a8a",
                        }}
                    >
                        {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                )}
            </button>

            {open && (
                <div
                    style={{
                        position: "absolute",
                        right: 0,
                        top: "54px",
                        width: "380px",
                        maxWidth: "90vw",
                        maxHeight: "480px",
                        overflowY: "auto",
                        background: "white",
                        borderRadius: "16px",
                        boxShadow: "0 20px 45px rgba(0,0,0,.25)",
                        zIndex: 1000,
                    }}
                >
                    <div
                        style={{
                            padding: "16px 20px",
                            borderBottom: "1px solid #eee",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            position: "sticky",
                            top: 0,
                            background: "white",
                            borderRadius: "16px 16px 0 0",
                        }}
                    >
                        <h3 style={{ margin: 0, color: "#1e3a8a", fontSize: "16px" }}>
                            Notifications {unreadCount > 0 && `(${unreadCount} unread)`}
                        </h3>

                        <button
                            onClick={() => {
                                setOpen(false);
                                navigate("/alerts");
                            }}
                            style={{
                                background: "none",
                                border: "none",
                                color: "#2563eb",
                                fontWeight: 600,
                                fontSize: "13px",
                                cursor: "pointer",
                            }}
                        >
                            View all
                        </button>
                    </div>

                    {loading && (
                        <p style={{ padding: "20px", textAlign: "center", color: "#94a3b8" }}>
                            Loading...
                        </p>
                    )}

                    {!loading && error && (
                        <p style={{ padding: "20px", textAlign: "center", color: "#dc2626" }}>
                            {error}
                        </p>
                    )}

                    {!loading && !error && alerts.length === 0 && (
                        <div style={{ padding: "30px 20px", textAlign: "center" }}>
                            <div style={{ fontSize: "28px" }}>✅</div>
                            <p style={{ color: "#64748b", margin: "8px 0 0" }}>You're all caught up.</p>
                        </div>
                    )}

                    {!loading &&
                        alerts.map((alert) => {
                            const visual = getNotificationVisual(alert, alert.recommended_route);
                            const isBusy = busyId === alert.id;

                            return (
                                <div
                                    key={alert.id}
                                    style={{
                                        display: "flex",
                                        gap: "12px",
                                        padding: "14px 20px",
                                        borderBottom: "1px solid #f1f5f9",
                                        background: "#fafbff",
                                        opacity: isBusy ? 0.5 : 1,
                                    }}
                                >
                                    <div style={{ fontSize: "22px", lineHeight: 1 }}>{visual.icon}</div>

                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ display: "flex", justifyContent: "space-between", gap: "8px" }}>
                                            <span style={{ fontWeight: 700, color: visual.color, fontSize: "13px" }}>
                                                {alert.severity}
                                            </span>
                                            <span style={{ fontSize: "11px", color: "#94a3b8", whiteSpace: "nowrap" }}>
                                                {timeAgo(alert.created_at)}
                                            </span>
                                        </div>

                                        <p style={{ margin: "2px 0 0", fontSize: "13px", color: "#334155" }}>
                                            {alert.title}
                                        </p>

                                        <p style={{ margin: "2px 0 0", fontSize: "12px", color: "#64748b" }}>
                                            {alert.source} → {alert.destination}
                                        </p>

                                        <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
                                            <button
                                                disabled={isBusy}
                                                onClick={() => handleMarkRead(alert.id)}
                                                style={smallButtonStyle("#2563eb")}
                                            >
                                                Mark as read
                                            </button>
                                            <button
                                                disabled={isBusy}
                                                onClick={() => handleDismiss(alert.id)}
                                                style={smallButtonStyle("#ef4444")}
                                            >
                                                Dismiss
                                            </button>
                                        </div>
                                    </div>

                                    <span
                                        title="Unread"
                                        style={{
                                            width: "8px",
                                            height: "8px",
                                            borderRadius: "50%",
                                            background: "#2563eb",
                                            marginTop: "4px",
                                            flexShrink: 0,
                                        }}
                                    />
                                </div>
                            );
                        })}
                </div>
            )}
        </div>
    );
}

function smallButtonStyle(color) {
    return {
        background: "none",
        border: `1px solid ${color}`,
        color,
        borderRadius: "8px",
        padding: "4px 10px",
        fontSize: "11px",
        fontWeight: 600,
        cursor: "pointer",
    };
}

export default NotificationPanel;
