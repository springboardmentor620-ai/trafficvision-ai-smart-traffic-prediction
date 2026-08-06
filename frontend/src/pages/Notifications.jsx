import { useEffect, useState, useCallback } from "react";
import Layout from "../components/Layout";
import {
  Bell, CheckCircle, Trash2, Shield, RefreshCw,
  AlertTriangle, Car, Zap, CheckSquare, Clock
} from "lucide-react";

const API = "http://localhost:8000";

const PRIORITY_CFG = {
  critical: { bg: "bg-red-500/15 border-red-500/40",    text: "text-red-400",    badge: "bg-red-600"    },
  high:     { bg: "bg-orange-500/15 border-orange-500/40", text: "text-orange-400", badge: "bg-orange-600" },
  medium:   { bg: "bg-yellow-500/15 border-yellow-500/40", text: "text-yellow-400", badge: "bg-yellow-600" },
  low:      { bg: "bg-green-500/15 border-green-500/40",  text: "text-green-400",  badge: "bg-green-600"  },
};

const TYPE_ICONS = {
  congestion: Car,
  accident:   AlertTriangle,
  closure:    Shield,
  prediction: Zap,
  system:     Bell,
};

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount]     = useState(0);
  const [loading, setLoading]             = useState(true);
  const [filter, setFilter]               = useState("All");
  const [error, setError]                 = useState(null);

  const fetchNotifications = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const res = await fetch(`${API}/notifications/`);
      if (!res.ok) throw new Error("Failed to load notifications");
      const data = await res.json();
      setNotifications(data.notifications || []);
      setUnreadCount(data.unread_count || 0);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

  const handleMarkRead = async (id) => {
    try {
      await fetch(`${API}/notifications/${id}/read`, { method: "PATCH" });
      fetchNotifications();
    } catch (e) { console.error(e); }
  };

  const handleMarkAllRead = async () => {
    try {
      await fetch(`${API}/notifications/read-all`, { method: "POST" });
      fetchNotifications();
    } catch (e) { console.error(e); }
  };

  const handleDelete = async (id) => {
    try {
      await fetch(`${API}/notifications/${id}`, { method: "DELETE" });
      fetchNotifications();
    } catch (e) { console.error(e); }
  };

  const filtered = filter === "All"
    ? notifications
    : filter === "Unread"
    ? notifications.filter(n => !n.is_read)
    : notifications.filter(n => (n.priority || "").toLowerCase() === filter.toLowerCase());

  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Bell className="w-7 h-7 text-blue-400" />
              Smart Notification Center
              {unreadCount > 0 && (
                <span className="ml-2 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-600 text-white animate-pulse">
                  {unreadCount} Unread
                </span>
              )}
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Real-time automated traffic alerts &amp; system updates
            </p>
          </div>
          <div className="flex gap-3">
            <button onClick={fetchNotifications}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 transition-colors">
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} /> Refresh
            </button>
            {unreadCount > 0 && (
              <button onClick={handleMarkAllRead}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-blue-600 text-white hover:bg-blue-500 transition-colors">
                <CheckSquare className="w-4 h-4" /> Mark All Read
              </button>
            )}
          </div>
        </div>

        {error && (
          <div className="rounded-xl bg-red-500/15 border border-red-500/30 p-4 text-sm text-red-400">⚠ {error}</div>
        )}

        {/* Filters */}
        <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-4 flex flex-wrap gap-2 items-center">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mr-2">Filter:</span>
          {["All", "Unread", "Critical", "High", "Medium", "Low"].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors
                ${filter === f ? "bg-blue-600 text-white" : "bg-slate-800 text-slate-400 hover:bg-slate-700"}`}>
              {f}
            </button>
          ))}
          <span className="ml-auto text-xs text-slate-400">
            Showing {filtered.length} of {notifications.length}
          </span>
        </div>

        {/* Notification List */}
        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="rounded-2xl bg-slate-800/60 border border-slate-700/50 p-4 h-20 animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-500">
            <Bell className="w-16 h-16 mb-4 opacity-30" />
            <p className="text-lg font-semibold">No notifications</p>
            <p className="text-sm mt-1">All clear! No pending notifications in this view.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(n => {
              const prioKey = (n.priority || "low").toLowerCase();
              const cfg = PRIORITY_CFG[prioKey] || PRIORITY_CFG.low;
              const Icon = TYPE_ICONS[(n.alert_type || "system").toLowerCase()] || Bell;

              return (
                <div key={n.id}
                  className={`rounded-2xl border p-4 transition-all duration-200 flex items-start justify-between gap-4
                    ${n.is_read ? "bg-slate-900/40 border-slate-800 opacity-75" : `${cfg.bg}`}
                  `}>
                  <div className="flex items-start gap-3">
                    <div className={`p-2.5 rounded-xl bg-slate-800/80 mt-0.5`}>
                      <Icon className={`w-5 h-5 ${cfg.text}`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-sm font-bold text-white">{n.title}</h4>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full text-white uppercase ${cfg.badge}`}>
                          {n.priority}
                        </span>
                        {!n.is_read && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-600 text-white">
                            NEW
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-300 mt-1 leading-relaxed">{n.description || n.message}</p>
                      <div className="flex items-center gap-1.5 mt-2 text-[11px] text-slate-500">
                        <Clock className="w-3 h-3" />
                        <span>{n.timestamp ? new Date(n.timestamp).toLocaleString() : "Just now"}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {!n.is_read && (
                      <button onClick={() => handleMarkRead(n.id)} title="Mark as Read"
                        className="p-2 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border border-blue-500/30 transition-colors">
                        <CheckCircle className="w-4 h-4" />
                      </button>
                    )}
                    <button onClick={() => handleDelete(n.id)} title="Delete Notification"
                      className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:bg-red-500/20 hover:text-red-400 border border-slate-700 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}
