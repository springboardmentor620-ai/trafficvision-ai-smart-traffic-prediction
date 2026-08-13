import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Layout from "../components/Layout";
import authFetch from "../api/http";

import {
  Bell,
  CheckCircle,
  Trash2,
  Shield,
  RefreshCw,
  AlertTriangle,
  Car,
  Zap,
  CheckSquare,
  Clock,
  MapPin,
  Navigation,
} from "lucide-react";

// ============================================================
// PRIORITY CONFIG
// ============================================================

const PRIORITY_CFG = {
  critical: {
    bg: "bg-red-500/15 border-red-500/40",
    text: "text-red-400",
    badge: "bg-red-600",
  },

  high: {
    bg: "bg-orange-500/15 border-orange-500/40",
    text: "text-orange-400",
    badge: "bg-orange-600",
  },

  medium: {
    bg: "bg-yellow-500/15 border-yellow-500/40",
    text: "text-yellow-400",
    badge: "bg-yellow-600",
  },

  low: {
    bg: "bg-green-500/15 border-green-500/40",
    text: "text-green-400",
    badge: "bg-green-600",
  },
};

// ============================================================
// NOTIFICATION TYPE ICONS
// ============================================================

const TYPE_ICONS = {
  congestion: Car,
  accident: AlertTriangle,
  closure: Shield,
  prediction: Zap,
  emergency: AlertTriangle,
  route: Navigation,
  system: Bell,
};

// ============================================================
// GET NOTIFICATION COORDINATES
// ============================================================

function getNotificationCoordinates(notification) {
  const latitude = Number(
    notification?.latitude ??
    notification?.lat ??
    notification?.location?.latitude ??
    notification?.location_lat
  );

  const longitude = Number(
    notification?.longitude ??
    notification?.lon ??
    notification?.location?.longitude ??
    notification?.location_lon
  );

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return null;
  }

  if (
    latitude < -90 ||
    latitude > 90 ||
    longitude < -180 ||
    longitude > 180
  ) {
    return null;
  }

  return {
    latitude,
    longitude,
  };
}

// ============================================================
// MAIN COMPONENT
// ============================================================

export default function Notifications() {
  const navigate = useNavigate();

  // ==========================================================
  // STATE
  // ==========================================================

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const [loading, setLoading] = useState(true);

  const [filter, setFilter] = useState("All");

  const [error, setError] = useState(null);

  // ==========================================================
  // FETCH NOTIFICATIONS
  // ==========================================================

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await authFetch(
        "/notifications/?skip=0&limit=100&unread_only=false"
      );

      if (!response.ok) {
        throw new Error("Failed to load notifications");
      }

      const data = await response.json();

      setNotifications(
        Array.isArray(data.notifications)
          ? data.notifications
          : []
      );

      setUnreadCount(Number(data.unread_count) || 0);
    } catch (e) {
      console.error("Failed to load notifications:", e);

      setError(
        e.message || "Unable to load notifications."
      );

      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  }, []);

  // ==========================================================
  // INITIAL LOAD
  // ==========================================================

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // ==========================================================
  // MARK ONE AS READ
  // ==========================================================

  const handleMarkRead = async (id) => {
    try {
      const response = await authFetch(
        `/notifications/${id}/read`,
        {
          method: "PATCH",
        }
      );

      if (!response.ok) {
        throw new Error(
          "Unable to mark notification as read"
        );
      }

      await fetchNotifications();
    } catch (e) {
      console.error("Mark read failed:", e);

      setError(
        e.message ||
        "Unable to mark notification as read."
      );
    }
  };

  // ==========================================================
  // MARK ALL AS READ
  // ==========================================================

  const handleMarkAllRead = async () => {
    try {
      const response = await authFetch(
        "/notifications/read-all",
        {
          method: "POST",
        }
      );

      if (!response.ok) {
        throw new Error(
          "Unable to mark notifications as read"
        );
      }

      await fetchNotifications();
    } catch (e) {
      console.error("Mark all read failed:", e);

      setError(
        e.message ||
        "Unable to mark notifications as read."
      );
    }
  };

  // ==========================================================
  // DELETE NOTIFICATION
  // ==========================================================

  const handleDelete = async (id) => {
    try {
      const response = await authFetch(
        `/notifications/${id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error(
          "Unable to delete notification"
        );
      }

      await fetchNotifications();
    } catch (e) {
      console.error(
        "Delete notification failed:",
        e
      );

      setError(
        e.message ||
        "Unable to delete notification."
      );
    }
  };

  // ==========================================================
  // VIEW INCIDENT ON MAP
  // ==========================================================

  const handleViewIncident = (notification) => {
    const coordinates =
      getNotificationCoordinates(notification);

    const trafficId =
      notification?.traffic_id ??
      notification?.map_data?.traffic_id;

    // --------------------------------------------------------
    // No usable incident information
    // --------------------------------------------------------

    if (!coordinates && trafficId == null) {
      setError(
        "This notification does not contain a valid incident location."
      );

      return;
    }

    const params = new URLSearchParams();

    // --------------------------------------------------------
    // Traffic ID
    // --------------------------------------------------------

    if (
      trafficId !== null &&
      trafficId !== undefined
    ) {
      params.set(
        "trafficId",
        String(trafficId)
      );
    }

    // --------------------------------------------------------
    // Exact latitude / longitude
    // --------------------------------------------------------

    if (coordinates) {
      params.set(
        "lat",
        String(coordinates.latitude)
      );

      params.set(
        "lon",
        String(coordinates.longitude)
      );
    }

    // --------------------------------------------------------
    // Navigate to Map Monitoring
    // --------------------------------------------------------

    navigate(`/map?${params.toString()}`);
  };

  // ==========================================================
  // FILTER NOTIFICATIONS
  // ==========================================================

  const filtered =
    filter === "All"
      ? notifications
      : filter === "Unread"
        ? notifications.filter(
          (notification) =>
            !notification.is_read
        )
        : notifications.filter(
          (notification) =>
            (
              notification.priority || ""
            ).toLowerCase() ===
            filter.toLowerCase()
        );

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <Layout>
      <main className="space-y-6">

        {/* ==================================================
            HEADER
        ================================================== */}

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
              Real-time automated traffic alerts &
              system updates
            </p>
          </div>

          <div className="flex gap-3">

            {/* REFRESH */}

            <button
              type="button"
              onClick={fetchNotifications}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 transition-colors disabled:opacity-50"
            >
              <RefreshCw
                className={`w-4 h-4 ${loading ? "animate-spin" : ""
                  }`}
              />

              Refresh
            </button>

            {/* MARK ALL READ */}

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-blue-600 text-white hover:bg-blue-500 transition-colors"
              >
                <CheckSquare className="w-4 h-4" />

                Mark All Read
              </button>
            )}

          </div>
        </div>

        {/* ==================================================
            ERROR
        ================================================== */}

        {error && (
          <div className="rounded-xl bg-red-500/15 border border-red-500/30 p-4 text-sm text-red-400 flex items-center justify-between gap-4">

            <span>
              ⚠ {error}
            </span>

            <button
              type="button"
              onClick={() => setError(null)}
              className="text-red-300 hover:text-white"
            >
              ✕
            </button>

          </div>
        )}

        {/* ==================================================
            FILTERS
        ================================================== */}

        <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-4 flex flex-wrap gap-2 items-center">

          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mr-2">
            Filter:
          </span>

          {[
            "All",
            "Unread",
            "Critical",
            "High",
            "Medium",
            "Low",
          ].map((filterOption) => (
            <button
              type="button"
              key={filterOption}
              onClick={() =>
                setFilter(filterOption)
              }
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${filter === filterOption
                ? "bg-blue-600 text-white"
                : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                }`}
            >
              {filterOption}
            </button>
          ))}

          <span className="ml-auto text-xs text-slate-400">
            Showing {filtered.length} of{" "}
            {notifications.length}
          </span>

        </div>

        {/* ==================================================
            NOTIFICATION LIST
        ================================================== */}

        {loading ? (

          <div className="space-y-3">

            {[...Array(5)].map(
              (_, index) => (
                <div
                  key={index}
                  className="rounded-2xl bg-slate-800/60 border border-slate-700/50 p-4 h-20 animate-pulse"
                />
              )
            )}

          </div>

        ) : filtered.length === 0 ? (

          <div className="flex flex-col items-center justify-center py-20 text-slate-500">

            <Bell className="w-16 h-16 mb-4 opacity-30" />

            <p className="text-lg font-semibold">
              No notifications
            </p>

            <p className="text-sm mt-1">
              All clear! No pending
              notifications in this view.
            </p>

          </div>

        ) : (

          <div className="space-y-3">

            {filtered.map((notification) => {

              // ------------------------------------------------
              // PRIORITY
              // ------------------------------------------------

              const priorityKey = (
                notification.priority ||
                "low"
              ).toLowerCase();

              const config =
                PRIORITY_CFG[priorityKey] ||
                PRIORITY_CFG.low;

              // ------------------------------------------------
              // ICON
              // ------------------------------------------------

              const notificationType = (
                notification.alert_type ||
                notification.type ||
                "system"
              ).toLowerCase();

              const Icon =
                TYPE_ICONS[
                notificationType
                ] || Bell;

              // ------------------------------------------------
              // COORDINATES
              // ------------------------------------------------

              const coordinates =
                getNotificationCoordinates(
                  notification
                );

              // ------------------------------------------------
              // HAS TRAFFIC RECORD
              // ------------------------------------------------

              const hasTrafficId =
                notification?.traffic_id !==
                null &&
                notification?.traffic_id !==
                undefined;

              return (
                <div
                  key={notification.id}
                  className={`rounded-2xl border p-4 transition-all duration-200 flex items-start justify-between gap-4 ${notification.is_read
                    ? "bg-slate-900/40 border-slate-800 opacity-75"
                    : config.bg
                    }`}
                >

                  {/* ==================================================
                      CONTENT
                  ================================================== */}

                  <div className="flex items-start gap-3 min-w-0">

                    {/* ICON */}

                    <div className="p-2.5 rounded-xl bg-slate-800/80 mt-0.5 shrink-0">

                      <Icon
                        className={`w-5 h-5 ${config.text}`}
                      />

                    </div>

                    <div className="min-w-0">

                      {/* TITLE */}

                      <div className="flex items-center gap-2 flex-wrap">

                        <h4 className="text-sm font-bold text-white">
                          {notification.title}
                        </h4>

                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full text-white uppercase ${config.badge}`}
                        >
                          {notification.priority ||
                            "low"}
                        </span>

                        {!notification.is_read && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-600 text-white">
                            NEW
                          </span>
                        )}

                      </div>

                      {/* DESCRIPTION */}

                      <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                        {notification.description ||
                          notification.message ||
                          "No description available."}
                      </p>

                      {/* TRAFFIC ID */}

                      {hasTrafficId && (
                        <div className="flex items-center gap-1.5 mt-2 text-[11px] text-slate-500">

                          <span className="font-medium">
                            Traffic ID:
                          </span>

                          <span className="text-slate-400">
                            {notification.traffic_id}
                          </span>

                        </div>
                      )}

                      {/* TIMESTAMP */}

                      <div className="flex items-center gap-1.5 mt-2 text-[11px] text-slate-500">

                        <Clock className="w-3 h-3" />

                        <span>
                          {notification.timestamp
                            ? new Date(
                              notification.timestamp
                            ).toLocaleString()
                            : "Just now"}
                        </span>

                      </div>

                      {/* LOCATION */}

                      {coordinates && (
                        <div className="flex items-center gap-1.5 mt-2 text-[11px] text-blue-400">

                          <MapPin className="w-3 h-3" />

                          <span>
                            Incident location available
                          </span>

                        </div>
                      )}

                    </div>
                  </div>

                  {/* ==================================================
                      ACTIONS
                  ================================================== */}

                  <div className="flex items-center gap-2 shrink-0">

                    {/* VIEW INCIDENT */}

                    <button
                      type="button"
                      onClick={() =>
                        handleViewIncident(
                          notification
                        )
                      }
                      disabled={
                        !coordinates &&
                        !hasTrafficId
                      }
                      title={
                        coordinates ||
                          hasTrafficId
                          ? "View Incident on Map"
                          : "Location unavailable"
                      }
                      className="p-2 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border border-blue-500/30 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <Navigation className="w-4 h-4" />
                    </button>

                    {/* MARK READ */}

                    {!notification.is_read && (
                      <button
                        type="button"
                        onClick={() =>
                          handleMarkRead(
                            notification.id
                          )
                        }
                        title="Mark as Read"
                        className="p-2 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border border-blue-500/30 transition-colors"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </button>
                    )}

                    {/* DELETE */}

                    <button
                      type="button"
                      onClick={() =>
                        handleDelete(
                          notification.id
                        )
                      }
                      title="Delete Notification"
                      className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:bg-red-500/20 hover:text-red-400 border border-slate-700 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                  </div>

                </div>
              );
            })}

          </div>
        )}

      </main>
    </Layout>
  );
}
