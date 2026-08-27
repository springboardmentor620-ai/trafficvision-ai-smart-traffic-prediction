import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  deleteNotification,
  markNotificationRead,
} from "../../services/notifications";

function NotificationPanel({
  notifications = [],
  refresh,
  onClose,
}) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("all");

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const filteredNotifications = useMemo(() => {
    if (activeTab === "unread") {
      return notifications.filter((n) => !n.is_read);
    }
    if (activeTab === "warning") {
      return notifications.filter((n) => n.type === "warning" || n.type === "danger");
    }
    if (activeTab === "info") {
      return notifications.filter((n) => n.type === "info" || n.type === "success");
    }
    return notifications;
  }, [notifications, activeTab]);

  const handleMarkAllRead = async () => {
    const unread = notifications.filter((n) => !n.is_read);
    for (const n of unread) {
      await markNotificationRead(n.id);
    }
    refresh();
  };

  const getIcon = (type, title) => {
    const t = (title || "").toLowerCase();
    if (t.includes("incident") || t.includes("collision") || type === "danger") return "🚨";
    if (t.includes("roadwork") || t.includes("construction")) return "🚧";
    if (t.includes("cleared") || type === "success") return "🟢";
    if (t.includes("model") || t.includes("retrained") || t.includes("ai")) return "⚡";
    if (t.includes("report")) return "📊";
    return "🔔";
  };

  return (
    <div
      style={{
        position: "absolute",
        top: "65px",
        right: "10px",
        width: "420px",
        maxHeight: "560px",
        display: "flex",
        flexDirection: "column",
        background: "var(--bg-surface)",
        color: "var(--text-primary)",
        borderRadius: "16px",
        boxShadow: "0 12px 36px rgba(0, 0, 0, 0.28)",
        border: "1px solid var(--border-color)",
        zIndex: 1002,
        overflow: "hidden",
        animation: "fadeIn 0.2s ease-in-out",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "16px 20px",
          borderBottom: "1px solid var(--border-color)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          backgroundColor: "var(--bg-surface-secondary)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontSize: "18px" }}>🔔</span>
          <h3 style={{ fontSize: "16px", fontWeight: "700", margin: 0, color: "var(--text-primary)" }}>
            Notifications
          </h3>
          {unreadCount > 0 && (
            <span
              style={{
                fontSize: "11px",
                fontWeight: "700",
                padding: "2px 8px",
                borderRadius: "12px",
                backgroundColor: "var(--primary)",
                color: "#ffffff",
              }}
            >
              {unreadCount} New
            </span>
          )}
        </div>

        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            style={{
              background: "none",
              border: "none",
              color: "var(--primary)",
              fontSize: "12px",
              fontWeight: "600",
              cursor: "pointer",
              padding: "4px 8px",
              borderRadius: "4px",
            }}
          >
            Mark all as read
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div
        style={{
          display: "flex",
          borderBottom: "1px solid var(--border-color)",
          padding: "6px 14px",
          gap: "6px",
          backgroundColor: "var(--bg-surface)",
        }}
      >
        {[
          { id: "all", label: `All (${notifications.length})` },
          { id: "unread", label: `Unread (${unreadCount})` },
          { id: "warning", label: "Alerts" },
          { id: "info", label: "System" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: "6px 12px",
              fontSize: "12px",
              fontWeight: activeTab === tab.id ? "700" : "500",
              borderRadius: "6px",
              border: "none",
              backgroundColor:
                activeTab === tab.id
                  ? "var(--bg-surface-secondary)"
                  : "transparent",
              color:
                activeTab === tab.id
                  ? "var(--primary)"
                  : "var(--text-secondary)",
              cursor: "pointer",
              transition: "all 0.15s",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Notification Items List */}
      <div
        style={{
          padding: "12px 16px",
          overflowY: "auto",
          flex: 1,
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          maxHeight: "400px",
        }}
      >
        {filteredNotifications.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 10px", color: "var(--text-muted)" }}>
            <span style={{ fontSize: "32px", display: "block", marginBottom: "8px" }}>🎉</span>
            <p style={{ margin: 0, fontSize: "14px", fontWeight: "600", color: "var(--text-secondary)" }}>
              All caught up!
            </p>
            <span style={{ fontSize: "12px" }}>No notifications in this view.</span>
          </div>
        ) : (
          filteredNotifications.map((notification) => {
            const icon = getIcon(notification.type, notification.title);
            const isUnread = !notification.is_read;

            return (
              <div
                key={notification.id}
                style={{
                  padding: "12px 14px",
                  borderRadius: "10px",
                  border: isUnread
                    ? "1px solid var(--primary)"
                    : "1px solid var(--border-color)",
                  backgroundColor: isUnread
                    ? "var(--bg-surface-secondary)"
                    : "var(--bg-surface)",
                  boxShadow: isUnread ? "0 2px 8px rgba(37, 99, 235, 0.08)" : "none",
                  transition: "all 0.2s ease",
                  display: "flex",
                  gap: "12px",
                  alignItems: "flex-start",
                }}
              >
                <div
                  style={{
                    fontSize: "20px",
                    width: "32px",
                    height: "32px",
                    borderRadius: "8px",
                    backgroundColor: "var(--bg-surface)",
                    border: "1px solid var(--border-color)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  {icon}
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "8px", marginBottom: "4px" }}>
                    <strong
                      style={{
                        fontWeight: isUnread ? 700 : 600,
                        fontSize: "13px",
                        color: "var(--text-primary)",
                        lineHeight: 1.3,
                      }}
                    >
                      {notification.title}
                    </strong>

                    {isUnread && (
                      <span
                        style={{
                          width: "8px",
                          height: "8px",
                          borderRadius: "50%",
                          backgroundColor: "var(--primary)",
                          flexShrink: 0,
                          marginTop: "4px",
                        }}
                      />
                    )}
                  </div>

                  <p
                    style={{
                      margin: "0 0 8px 0",
                      fontSize: "12px",
                      lineHeight: 1.4,
                      color: "var(--text-secondary)",
                    }}
                  >
                    {notification.message}
                  </p>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span
                      style={{
                        fontSize: "11px",
                        color: "var(--text-muted)",
                        fontWeight: "500",
                        textTransform: "capitalize",
                      }}
                    >
                      ● {notification.type || "Update"}
                    </span>

                    <div style={{ display: "flex", gap: "6px" }}>
                      {isUnread && (
                        <button
                          onClick={async (e) => {
                            e.stopPropagation();
                            await markNotificationRead(notification.id);
                            refresh();
                          }}
                          style={{
                            padding: "3px 8px",
                            borderRadius: "4px",
                            border: "none",
                            background: "var(--primary)",
                            color: "#fff",
                            fontSize: "11px",
                            fontWeight: "600",
                            cursor: "pointer",
                          }}
                        >
                          Mark Read
                        </button>
                      )}

                      <button
                        onClick={async (e) => {
                          e.stopPropagation();
                          await deleteNotification(notification.id);
                          refresh();
                        }}
                        title="Delete notification"
                        style={{
                          padding: "3px 8px",
                          borderRadius: "4px",
                          border: "1px solid var(--border-color)",
                          background: "var(--bg-surface)",
                          color: "var(--danger)",
                          fontSize: "11px",
                          fontWeight: "600",
                          cursor: "pointer",
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer Navigation */}
      <div
        style={{
          padding: "12px 16px",
          borderTop: "1px solid var(--border-color)",
          backgroundColor: "var(--bg-surface-secondary)",
          textAlign: "center",
        }}
      >
        <button
          onClick={() => {
            if (onClose) onClose();
            navigate("/admin/alerts");
          }}
          style={{
            background: "none",
            border: "none",
            color: "var(--primary)",
            fontWeight: "600",
            fontSize: "13px",
            cursor: "pointer",
          }}
        >
          View Full Traffic Alerts Console →
        </button>
      </div>
    </div>
  );
}

export default NotificationPanel;