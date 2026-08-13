import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import Layout from "../components/Layout";
import api from "../api/axios";

import {
  AlertTriangle,
  Bell,
  CheckCircle2,
  Clock,
  RefreshCw,
  ShieldAlert,
  Siren,
  Activity,
  MapPin,
  ChevronDown,
  X,
  Zap,
  Car,
  Route,
} from "lucide-react";


// ============================================================
// CONSTANTS
// ============================================================

const SEVERITIES = [
  "All",
  "Critical",
  "High",
  "Medium",
  "Low",
];

const STATUSES = [
  "All",
  "Active",
  "Assigned",
  "Acknowledged",
  "In Progress",
  "Resolved",
];

const ALERT_TYPES = [
  "All",
  "Congestion",
  "Accident",
  "Emergency",
  "Road Blockage",
  "Speed Anomaly",
  "Traffic Spike",
  "Predicted Congestion",
  "Signal Failure",
];


// ============================================================
// HELPERS
// ============================================================

function normalizeArray(value) {
  return Array.isArray(value) ? value : [];
}


function formatDate(value) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleString();
}


function getSeverityClass(severity) {
  switch (severity) {
    case "Critical":
      return "alert-severity critical";

    case "High":
      return "alert-severity high";

    case "Medium":
      return "alert-severity medium";

    case "Low":
      return "alert-severity low";

    default:
      return "alert-severity";
  }
}


function getStatusClass(status) {
  switch (status) {
    case "Active":
      return "alert-status active";

    case "Assigned":
      return "alert-status assigned";

    case "Acknowledged":
      return "alert-status acknowledged";

    case "In Progress":
      return "alert-status progress";

    case "Resolved":
      return "alert-status resolved";

    default:
      return "alert-status";
  }
}


function getAlertIcon(type) {
  switch (type) {
    case "Accident":
      return <Siren size={18} />;

    case "Emergency":
      return <ShieldAlert size={18} />;

    case "Congestion":
      return <Car size={18} />;

    case "Traffic Spike":
      return <Activity size={18} />;

    case "Speed Anomaly":
      return <Zap size={18} />;

    case "Road Blockage":
      return <Route size={18} />;

    default:
      return <Bell size={18} />;
  }
}


// ============================================================
// COMPONENT
// ============================================================

export default function Alerts() {

  // ==========================================================
  // STATE
  // ==========================================================

  const [alerts, setAlerts] = useState([]);

  const [summary, setSummary] = useState({
    total: 0,

    by_severity: {
      Critical: 0,
      High: 0,
      Medium: 0,
      Low: 0,
    },

    by_type: {},

    by_status: {
      Active: 0,
      Assigned: 0,
      Acknowledged: 0,
      "In Progress": 0,
      Resolved: 0,
    },
  });

  const [severityFilter, setSeverityFilter] =
    useState("All");

  const [statusFilter, setStatusFilter] =
    useState("All");

  const [typeFilter, setTypeFilter] =
    useState("All");

  const [loading, setLoading] =
    useState(true);

  const [generating, setGenerating] =
    useState(false);

  const [error, setError] =
    useState("");

  const [selectedAlert, setSelectedAlert] =
    useState(null);

  const [actionLoading, setActionLoading] =
    useState(null);


  // ==========================================================
  // FETCH ALERTS
  // ==========================================================

  const fetchAlerts = useCallback(
    async () => {

      try {

        setLoading(true);
        setError("");

        const response = await api.get(
          "/alerts",
          {
            params: {
              limit: 500,
            },
          }
        );

        const data = response?.data;

        const alertList =
          normalizeArray(data?.alerts);

        setAlerts(alertList);

      } catch (err) {

        console.error(
          "Failed to fetch alerts:",
          err
        );

        setError(
          err?.response?.data?.detail ||
          "Unable to load alerts."
        );

      } finally {

        setLoading(false);
      }
    },
    []
  );


  // ==========================================================
  // FETCH SUMMARY
  // ==========================================================

  const fetchSummary = useCallback(
    async () => {

      try {

        const response = await api.get(
          "/alerts/summary"
        );

        const data = response?.data;

        if (data) {
          setSummary({
            total: data.total || 0,

            by_severity:
              data.by_severity || {
                Critical: 0,
                High: 0,
                Medium: 0,
                Low: 0,
              },

            by_type:
              data.by_type || {},

            by_status:
              data.by_status || {
                Active: 0,
                Assigned: 0,
                Acknowledged: 0,
                "In Progress": 0,
                Resolved: 0,
              },
          });
        }

      } catch (err) {

        console.error(
          "Failed to fetch alert summary:",
          err
        );
      }
    },
    []
  );


  // ==========================================================
  // INITIAL LOAD
  // ==========================================================

  useEffect(() => {

    fetchAlerts();
    fetchSummary();

  }, [
    fetchAlerts,
    fetchSummary,
  ]);


  // ==========================================================
  // GENERATE ALERTS
  // ==========================================================

  const handleGenerateAlerts =
    useCallback(async () => {

      try {

        setGenerating(true);
        setError("");

        await api.post(
          "/alerts/generate"
        );

        await Promise.all([
          fetchAlerts(),
          fetchSummary(),
        ]);

      } catch (err) {

        console.error(
          "Failed to generate alerts:",
          err
        );

        setError(
          err?.response?.data?.detail ||
          "Failed to generate alerts."
        );

      } finally {

        setGenerating(false);
      }

    }, [
      fetchAlerts,
      fetchSummary,
    ]);


  // ==========================================================
  // REFRESH
  // ==========================================================

  const handleRefresh =
    useCallback(async () => {

      await Promise.all([
        fetchAlerts(),
        fetchSummary(),
      ]);

    }, [
      fetchAlerts,
      fetchSummary,
    ]);


  // ==========================================================
  // ALERT ACTION
  // ==========================================================

  const handleAction =
    useCallback(
      async (
        alertId,
        action
      ) => {

        try {

          setActionLoading(
            `${alertId}-${action}`
          );

          let endpoint = "";

          switch (action) {

            case "assign":
              endpoint =
                `/alerts/${alertId}/assign`;
              break;

            case "acknowledge":
              endpoint =
                `/alerts/${alertId}/acknowledge`;
              break;

            case "start":
              endpoint =
                `/alerts/${alertId}/start`;
              break;

            case "resolve":
              endpoint =
                `/alerts/${alertId}/resolve`;
              break;

            default:
              return;
          }

          await api.patch(endpoint);

          await Promise.all([
            fetchAlerts(),
            fetchSummary(),
          ]);

          if (
            selectedAlert &&
            selectedAlert.id === alertId
          ) {
            const updated =
              await api.get(
                `/alerts/${alertId}`
              );

            setSelectedAlert(
              updated?.data?.alert || null
            );
          }

        } catch (err) {

          console.error(
            `Failed to ${action} alert:`,
            err
          );

          setError(
            err?.response?.data?.detail ||
            `Failed to ${action} alert.`
          );

        } finally {

          setActionLoading(null);
        }

      },
      [
        fetchAlerts,
        fetchSummary,
        selectedAlert,
      ]
    );


  // ==========================================================
  // FILTERED ALERTS
  // ==========================================================

  const filteredAlerts = useMemo(() => {

    return alerts.filter(
      (alert) => {

        const severityMatch =
          severityFilter === "All" ||
          alert.severity === severityFilter;

        const statusMatch =
          statusFilter === "All" ||
          alert.status === statusFilter;

        const typeMatch =
          typeFilter === "All" ||
          alert.alert_type === typeFilter;

        return (
          severityMatch &&
          statusMatch &&
          typeMatch
        );
      }
    );

  }, [
    alerts,
    severityFilter,
    statusFilter,
    typeFilter,
  ]);


  // ==========================================================
  // STATS
  // ==========================================================

  const criticalCount =
    summary.by_severity?.Critical || 0;

  const highCount =
    summary.by_severity?.High || 0;

  const activeCount =
    summary.by_status?.Active || 0;

  const resolvedCount =
    summary.by_status?.Resolved || 0;


  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <Layout>

      <div className="alerts-page">

        {/* ==================================================
            HEADER
        ================================================== */}

        <div className="alerts-header">

          <div>

            <div className="alerts-title-row">

              <div className="alerts-title-icon">
                <Bell size={24} />
              </div>

              <div>

                <h1>
                  Traffic Alerts
                </h1>

                <p>
                  Monitor, manage and resolve
                  real-time traffic incidents.
                </p>

              </div>

            </div>

          </div>


          <div className="alerts-header-actions">

            <button
              type="button"
              className="alerts-btn secondary"
              onClick={handleRefresh}
              disabled={loading}
            >
              <RefreshCw
                size={17}
                className={
                  loading
                    ? "spin"
                    : ""
                }
              />

              Refresh
            </button>


            <button
              type="button"
              className="alerts-btn primary"
              onClick={handleGenerateAlerts}
              disabled={generating}
            >
              <Zap
                size={17}
              />

              {generating
                ? "Generating..."
                : "Generate Alerts"}
            </button>

          </div>

        </div>


        {/* ==================================================
            ERROR
        ================================================== */}

        {error && (
          <div className="alerts-error">

            <AlertTriangle size={18} />

            <span>
              {error}
            </span>

            <button
              type="button"
              onClick={() => setError("")}
            >
              <X size={16} />
            </button>

          </div>
        )}


        {/* ==================================================
            SUMMARY CARDS
        ================================================== */}

        <div className="alerts-summary-grid">

          <div className="alert-summary-card">

            <div className="summary-icon total">
              <Bell size={20} />
            </div>

            <div>

              <span>
                Total Alerts
              </span>

              <strong>
                {summary.total}
              </strong>

            </div>

          </div>


          <div className="alert-summary-card">

            <div className="summary-icon critical">
              <ShieldAlert size={20} />
            </div>

            <div>

              <span>
                Critical
              </span>

              <strong>
                {criticalCount}
              </strong>

            </div>

          </div>


          <div className="alert-summary-card">

            <div className="summary-icon high">
              <AlertTriangle size={20} />
            </div>

            <div>

              <span>
                High Priority
              </span>

              <strong>
                {highCount}
              </strong>

            </div>

          </div>


          <div className="alert-summary-card">

            <div className="summary-icon active">
              <Activity size={20} />
            </div>

            <div>

              <span>
                Active
              </span>

              <strong>
                {activeCount}
              </strong>

            </div>

          </div>


          <div className="alert-summary-card">

            <div className="summary-icon resolved">
              <CheckCircle2 size={20} />
            </div>

            <div>

              <span>
                Resolved
              </span>

              <strong>
                {resolvedCount}
              </strong>

            </div>

          </div>

        </div>


        {/* ==================================================
            FILTER BAR
        ================================================== */}

        <div className="alerts-filter-card">

          <div className="filter-heading">

            <Activity size={18} />

            <span>
              Alert Filters
            </span>

          </div>


          <div className="filter-controls">

            {/* Severity */}

            <div className="filter-select">

              <label>
                Severity
              </label>

              <div className="select-wrapper">

                <select
                  value={severityFilter}
                  onChange={(e) =>
                    setSeverityFilter(
                      e.target.value
                    )
                  }
                >
                  {SEVERITIES.map(
                    (item) => (
                      <option
                        key={item}
                        value={item}
                      >
                        {item}
                      </option>
                    )
                  )}
                </select>

                <ChevronDown
                  size={16}
                />

              </div>

            </div>


            {/* Status */}

            <div className="filter-select">

              <label>
                Status
              </label>

              <div className="select-wrapper">

                <select
                  value={statusFilter}
                  onChange={(e) =>
                    setStatusFilter(
                      e.target.value
                    )
                  }
                >
                  {STATUSES.map(
                    (item) => (
                      <option
                        key={item}
                        value={item}
                      >
                        {item}
                      </option>
                    )
                  )}
                </select>

                <ChevronDown
                  size={16}
                />

              </div>

            </div>


            {/* Type */}

            <div className="filter-select">

              <label>
                Alert Type
              </label>

              <div className="select-wrapper">

                <select
                  value={typeFilter}
                  onChange={(e) =>
                    setTypeFilter(
                      e.target.value
                    )
                  }
                >
                  {ALERT_TYPES.map(
                    (item) => (
                      <option
                        key={item}
                        value={item}
                      >
                        {item}
                      </option>
                    )
                  )}
                </select>

                <ChevronDown
                  size={16}
                />

              </div>

            </div>


            <div className="filter-result">

              <span>
                Showing
              </span>

              <strong>
                {filteredAlerts.length}
              </strong>

              <span>
                alerts
              </span>

            </div>

          </div>

        </div>


        {/* ==================================================
            ALERT LIST
        ================================================== */}

        <div className="alerts-list-card">

          <div className="alerts-list-header">

            <div>

              <h2>
                Alert Feed
              </h2>

              <p>
                Latest traffic incidents
              </p>

            </div>

            <Clock size={20} />

          </div>


          {loading ? (

            <div className="alerts-loading">

              <RefreshCw
                size={28}
                className="spin"
              />

              <p>
                Loading alerts...
              </p>

            </div>

          ) : filteredAlerts.length === 0 ? (

            <div className="alerts-empty">

              <CheckCircle2
                size={42}
              />

              <h3>
                No alerts found
              </h3>

              <p>
                No alerts match the
                selected filters.
              </p>

            </div>

          ) : (

            <div className="alerts-table-wrapper">

              <table className="alerts-table">

                <thead>

                  <tr>

                    <th>
                      Alert
                    </th>

                    <th>
                      Location
                    </th>

                    <th>
                      Severity
                    </th>

                    <th>
                      Status
                    </th>

                    <th>
                      Created
                    </th>

                    <th>
                      Action
                    </th>

                  </tr>

                </thead>


                <tbody>

                  {filteredAlerts.map(
                    (alert) => (

                      <tr
                        key={alert.id}
                        onClick={() =>
                          setSelectedAlert(
                            alert
                          )
                        }
                        className="alert-row"
                      >

                        <td>

                          <div className="alert-type-cell">

                            <div className="alert-type-icon">
                              {getAlertIcon(
                                alert.alert_type
                              )}
                            </div>

                            <div>

                              <strong>
                                {alert.alert_type}
                              </strong>

                              <span>
                                Alert #{alert.id}
                              </span>

                            </div>

                          </div>

                        </td>


                        <td>

                          <div className="location-cell">

                            <MapPin
                              size={16}
                            />

                            <span>
                              {alert.location ||
                                "Unknown Location"}
                            </span>

                          </div>

                        </td>


                        <td>

                          <span
                            className={getSeverityClass(
                              alert.severity
                            )}
                          >
                            {alert.severity}
                          </span>

                        </td>


                        <td>

                          <span
                            className={getStatusClass(
                              alert.status
                            )}
                          >
                            {alert.status}
                          </span>

                        </td>


                        <td>

                          <div className="created-cell">

                            <Clock
                              size={15}
                            />

                            {formatDate(
                              alert.created_at
                            )}

                          </div>

                        </td>


                        <td
                          onClick={(e) =>
                            e.stopPropagation()
                          }
                        >

                          <div className="table-actions">

                            {alert.status ===
                              "Active" && (

                                <button
                                  type="button"
                                  onClick={() =>
                                    handleAction(
                                      alert.id,
                                      "assign"
                                    )
                                  }
                                  disabled={
                                    actionLoading ===
                                    `${alert.id}-assign`
                                  }
                                >
                                  Assign
                                </button>

                              )}


                            {alert.status ===
                              "Assigned" && (

                                <button
                                  type="button"
                                  onClick={() =>
                                    handleAction(
                                      alert.id,
                                      "acknowledge"
                                    )
                                  }
                                  disabled={
                                    actionLoading ===
                                    `${alert.id}-acknowledge`
                                  }
                                >
                                  Acknowledge
                                </button>

                              )}


                            {alert.status ===
                              "Acknowledged" && (

                                <button
                                  type="button"
                                  onClick={() =>
                                    handleAction(
                                      alert.id,
                                      "start"
                                    )
                                  }
                                  disabled={
                                    actionLoading ===
                                    `${alert.id}-start`
                                  }
                                >
                                  Start
                                </button>

                              )}


                            {alert.status !==
                              "Resolved" && (

                                <button
                                  type="button"
                                  className="resolve-btn"
                                  onClick={() =>
                                    handleAction(
                                      alert.id,
                                      "resolve"
                                    )
                                  }
                                  disabled={
                                    actionLoading ===
                                    `${alert.id}-resolve`
                                  }
                                >
                                  Resolve
                                </button>

                              )}

                          </div>

                        </td>

                      </tr>

                    )
                  )}

                </tbody>

              </table>

            </div>

          )}

        </div>

      </div>


      {/* ====================================================
          DETAILS MODAL
      ==================================================== */}

      {selectedAlert && (

        <div
          className="alert-modal-overlay"
          onClick={() =>
            setSelectedAlert(null)
          }
        >

          <div
            className="alert-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <div className="modal-header">

              <div>

                <div className="modal-type">

                  {getAlertIcon(
                    selectedAlert.alert_type
                  )}

                  <span>
                    {selectedAlert.alert_type}
                  </span>

                </div>

                <h2>
                  Alert #{selectedAlert.id}
                </h2>

              </div>


              <button
                type="button"
                className="modal-close"
                onClick={() =>
                  setSelectedAlert(null)
                }
              >
                <X size={20} />
              </button>

            </div>


            <div className="modal-status-row">

              <span
                className={getSeverityClass(
                  selectedAlert.severity
                )}
              >
                {selectedAlert.severity}
              </span>

              <span
                className={getStatusClass(
                  selectedAlert.status
                )}
              >
                {selectedAlert.status}
              </span>

            </div>


            <div className="modal-content">

              <div className="detail-item">

                <span>
                  Location
                </span>

                <strong>

                  <MapPin size={16} />

                  {selectedAlert.location ||
                    "Unknown Location"}

                </strong>

              </div>


              <div className="detail-item">

                <span>
                  Created
                </span>

                <strong>
                  {formatDate(
                    selectedAlert.created_at
                  )}
                </strong>

              </div>


              {selectedAlert.resolved_at && (

                <div className="detail-item">

                  <span>
                    Resolved
                  </span>

                  <strong>
                    {formatDate(
                      selectedAlert.resolved_at
                    )}
                  </strong>

                </div>

              )}


              {selectedAlert.traffic_id && (

                <div className="detail-item">

                  <span>
                    Traffic Record
                  </span>

                  <strong>
                    #{selectedAlert.traffic_id}
                  </strong>

                </div>

              )}


              <div className="detail-section">

                <h3>
                  Description
                </h3>

                <p>
                  {selectedAlert.description ||
                    "No description available."}
                </p>

              </div>


              <div className="detail-section recommendation">

                <h3>
                  <Zap size={17} />

                  Recommendation
                </h3>

                <p>
                  {selectedAlert.recommendation ||
                    "No recommendation available."}
                </p>

              </div>

            </div>


            {selectedAlert.status !==
              "Resolved" && (

                <div className="modal-actions">

                  {selectedAlert.status ===
                    "Active" && (

                      <button
                        type="button"
                        onClick={() =>
                          handleAction(
                            selectedAlert.id,
                            "assign"
                          )
                        }
                      >
                        Assign
                      </button>

                    )}

                  {selectedAlert.status ===
                    "Assigned" && (

                      <button
                        type="button"
                        onClick={() =>
                          handleAction(
                            selectedAlert.id,
                            "acknowledge"
                          )
                        }
                      >
                        Acknowledge
                      </button>

                    )}

                  {selectedAlert.status ===
                    "Acknowledged" && (

                      <button
                        type="button"
                        onClick={() =>
                          handleAction(
                            selectedAlert.id,
                            "start"
                          )
                        }
                      >
                        Start Response
                      </button>

                    )}

                  <button
                    type="button"
                    className="resolve-modal-btn"
                    onClick={() =>
                      handleAction(
                        selectedAlert.id,
                        "resolve"
                      )
                    }
                  >
                    <CheckCircle2
                      size={17}
                    />

                    Resolve Alert
                  </button>

                </div>

              )}

          </div>

        </div>

      )}


      {/* ====================================================
          PAGE STYLES
      ==================================================== */}

      <style>{`

  /* ============================================================
     DARK THEME - ALERTS PAGE
     ============================================================ */

  .alerts-page {
    padding: 24px;
    max-width: 1600px;
    margin: 0 auto;
    color: #e5e7eb;
  }

  /* ============================================================
     HEADER
     ============================================================ */

  .alerts-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 20px;
    margin-bottom: 24px;
  }

  .alerts-title-row {
    display: flex;
    align-items: center;
    gap: 14px;
  }

  .alerts-title-icon {
    width: 48px;
    height: 48px;
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(99, 102, 241, 0.15);
    color: #818cf8;
    border: 1px solid rgba(129, 140, 248, 0.2);
  }

  .alerts-header h1 {
    margin: 0;
    font-size: 28px;
    font-weight: 750;
    color: #f8fafc;
  }

  .alerts-header p {
    margin: 5px 0 0;
    color: #94a3b8;
    font-size: 14px;
  }

  .alerts-header-actions {
    display: flex;
    gap: 10px;
  }

  .alerts-btn {
    height: 42px;
    padding: 0 16px;
    border-radius: 10px;
    border: 1px solid #334155;
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 650;
    cursor: pointer;
    transition: all .2s ease;
  }

  .alerts-btn:disabled {
    opacity: .6;
    cursor: not-allowed;
  }

  .alerts-btn.secondary {
    background: #111827;
    color: #e2e8f0;
    border-color: #334155;
  }

  .alerts-btn.secondary:hover {
    background: #1e293b;
    border-color: #475569;
  }

  .alerts-btn.primary {
    background: #4f46e5;
    border-color: #6366f1;
    color: white;
  }

  .alerts-btn.primary:hover {
    background: #6366f1;
  }

  /* ============================================================
     ERROR
     ============================================================ */

  .alerts-error {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 13px 15px;
    margin-bottom: 18px;
    border: 1px solid rgba(248, 113, 113, .3);
    background: rgba(127, 29, 29, .25);
    color: #fca5a5;
    border-radius: 10px;
  }

  .alerts-error span {
    flex: 1;
  }

  .alerts-error button {
    border: 0;
    background: transparent;
    color: inherit;
    cursor: pointer;
  }

  /* ============================================================
     SUMMARY CARDS
     ============================================================ */

  .alerts-summary-grid {
    display: grid;
    grid-template-columns: repeat(5, minmax(0, 1fr));
    gap: 14px;
    margin-bottom: 20px;
  }

  .alert-summary-card {
    background: #111827;
    border: 1px solid #1f2937;
    border-radius: 14px;
    padding: 17px;
    display: flex;
    align-items: center;
    gap: 13px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, .25);
    transition: all .2s ease;
  }

  .alert-summary-card:hover {
    border-color: #334155;
    transform: translateY(-1px);
  }

  .summary-icon {
    width: 42px;
    height: 42px;
    border-radius: 11px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .summary-icon.total {
    background: rgba(99, 102, 241, .15);
    color: #818cf8;
  }

  .summary-icon.critical {
    background: rgba(239, 68, 68, .15);
    color: #f87171;
  }

  .summary-icon.high {
    background: rgba(249, 115, 22, .15);
    color: #fb923c;
  }

  .summary-icon.active {
    background: rgba(59, 130, 246, .15);
    color: #60a5fa;
  }

  .summary-icon.resolved {
    background: rgba(34, 197, 94, .15);
    color: #4ade80;
  }

  .alert-summary-card span {
    display: block;
    color: #94a3b8;
    font-size: 12px;
    margin-bottom: 4px;
  }

  .alert-summary-card strong {
    font-size: 23px;
    color: #f8fafc;
  }

  /* ============================================================
     FILTER CARD
     ============================================================ */

  .alerts-filter-card {
    background: #111827;
    border: 1px solid #1f2937;
    border-radius: 14px;
    padding: 17px;
    margin-bottom: 20px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, .2);
  }

  .filter-heading {
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 700;
    color: #f1f5f9;
    margin-bottom: 14px;
  }

  .filter-controls {
    display: grid;
    grid-template-columns:
      repeat(3, minmax(180px, 1fr))
      auto;
    gap: 14px;
    align-items: end;
  }

  .filter-select label {
    display: block;
    font-size: 12px;
    font-weight: 650;
    color: #94a3b8;
    margin-bottom: 6px;
  }

  .select-wrapper {
    position: relative;
  }

  .select-wrapper select {
    width: 100%;
    height: 40px;
    padding: 0 35px 0 12px;
    border: 1px solid #334155;
    border-radius: 9px;
    background: #0f172a;
    color: #e2e8f0;
    appearance: none;
    outline: none;
    cursor: pointer;
  }

  .select-wrapper select:focus {
    border-color: #6366f1;
    box-shadow: 0 0 0 2px rgba(99, 102, 241, .15);
  }

  .select-wrapper select option {
    background: #111827;
    color: #e2e8f0;
  }

  .select-wrapper svg {
    position: absolute;
    right: 11px;
    top: 12px;
    pointer-events: none;
    color: #64748b;
  }

  .filter-result {
    height: 40px;
    display: flex;
    align-items: center;
    gap: 5px;
    white-space: nowrap;
    color: #94a3b8;
    font-size: 13px;
  }

  .filter-result strong {
    color: #f8fafc;
  }

  /* ============================================================
     ALERT LIST
     ============================================================ */

  .alerts-list-card {
    background: #111827;
    border: 1px solid #1f2937;
    border-radius: 14px;
    overflow: hidden;
    box-shadow: 0 4px 15px rgba(0, 0, 0, .25);
  }

  .alerts-list-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 18px 20px;
    border-bottom: 1px solid #1f2937;
  }

  .alerts-list-header h2 {
    margin: 0;
    font-size: 18px;
    color: #f8fafc;
  }

  .alerts-list-header p {
    margin: 4px 0 0;
    color: #94a3b8;
    font-size: 13px;
  }

  .alerts-list-header > svg {
    color: #64748b;
  }

  .alerts-table-wrapper {
    overflow-x: auto;
  }

  .alerts-table {
    width: 100%;
    border-collapse: collapse;
    min-width: 1000px;
    background: #111827;
  }

  .alerts-table th {
    text-align: left;
    padding: 13px 16px;
    background: #0f172a;
    color: #94a3b8;
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: .04em;
    font-weight: 750;
  }

  .alerts-table td {
    padding: 15px 16px;
    border-top: 1px solid #1f2937;
    vertical-align: middle;
    color: #cbd5e1;
  }

  .alert-row {
    cursor: pointer;
    transition: background .15s ease;
  }

  .alert-row:hover {
    background: #172033;
  }

  /* ============================================================
     ALERT TYPE
     ============================================================ */

  .alert-type-cell {
    display: flex;
    align-items: center;
    gap: 11px;
  }

  .alert-type-icon {
    width: 36px;
    height: 36px;
    border-radius: 9px;
    background: #1e293b;
    color: #94a3b8;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .alert-type-cell strong {
    display: block;
    color: #f1f5f9;
    font-size: 13px;
  }

  .alert-type-cell span {
    display: block;
    color: #64748b;
    font-size: 11px;
    margin-top: 3px;
  }

  /* ============================================================
     LOCATION
     ============================================================ */

  .location-cell {
    display: flex;
    align-items: center;
    gap: 6px;
    color: #cbd5e1;
    font-size: 13px;
  }

  .location-cell svg {
    color: #64748b;
    flex-shrink: 0;
  }

  .created-cell {
    display: flex;
    align-items: center;
    gap: 6px;
    color: #94a3b8;
    font-size: 12px;
    white-space: nowrap;
  }

  .created-cell svg {
    color: #64748b;
  }

  /* ============================================================
     SEVERITY
     ============================================================ */

  .alert-severity,
  .alert-status {
    display: inline-flex;
    align-items: center;
    padding: 5px 9px;
    border-radius: 999px;
    font-size: 11px;
    font-weight: 750;
    white-space: nowrap;
  }

  .alert-severity.critical {
    background: rgba(239, 68, 68, .15);
    color: #f87171;
  }

  .alert-severity.high {
    background: rgba(249, 115, 22, .15);
    color: #fb923c;
  }

  .alert-severity.medium {
    background: rgba(245, 158, 11, .15);
    color: #fbbf24;
  }

  .alert-severity.low {
    background: rgba(34, 197, 94, .15);
    color: #4ade80;
  }

  /* ============================================================
     STATUS
     ============================================================ */

  .alert-status.active {
    background: rgba(59, 130, 246, .15);
    color: #60a5fa;
  }

  .alert-status.assigned {
    background: rgba(139, 92, 246, .15);
    color: #a78bfa;
  }

  .alert-status.acknowledged {
    background: rgba(6, 182, 212, .15);
    color: #22d3ee;
  }

  .alert-status.progress {
    background: rgba(249, 115, 22, .15);
    color: #fb923c;
  }

  .alert-status.resolved {
    background: rgba(34, 197, 94, .15);
    color: #4ade80;
  }

  /* ============================================================
     TABLE ACTIONS
     ============================================================ */

  .table-actions {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
  }

  .table-actions button {
    border: 1px solid #334155;
    background: #172033;
    color: #cbd5e1;
    border-radius: 7px;
    padding: 6px 9px;
    font-size: 11px;
    font-weight: 650;
    cursor: pointer;
    transition: all .15s ease;
  }

  .table-actions button:hover {
    background: #1e293b;
    border-color: #475569;
  }

  .table-actions button:disabled {
    opacity: .5;
    cursor: not-allowed;
  }

  .table-actions .resolve-btn {
    color: #4ade80;
    border-color: rgba(34, 197, 94, .3);
    background: rgba(34, 197, 94, .1);
  }

  .table-actions .resolve-btn:hover {
    background: rgba(34, 197, 94, .18);
  }

  /* ============================================================
     LOADING / EMPTY
     ============================================================ */

  .alerts-loading,
  .alerts-empty {
    min-height: 280px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: #64748b;
    background: #111827;
  }

  .alerts-loading p,
  .alerts-empty p {
    margin: 10px 0 0;
    font-size: 13px;
    color: #64748b;
  }

  .alerts-empty h3 {
    margin: 14px 0 0;
    color: #cbd5e1;
    font-size: 16px;
  }

  .alerts-empty svg {
    color: #4ade80;
  }

  /* ============================================================
     MODAL
     ============================================================ */

  .alert-modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(2, 6, 23, .78);
    backdrop-filter: blur(4px);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    z-index: 1000;
  }

  .alert-modal {
    width: min(620px, 100%);
    max-height: 90vh;
    overflow-y: auto;
    background: #111827;
    border: 1px solid #334155;
    border-radius: 16px;
    box-shadow: 0 25px 60px rgba(0, 0, 0, .55);
  }

  .modal-header {
    display: flex;
    justify-content: space-between;
    gap: 15px;
    padding: 20px;
    border-bottom: 1px solid #1f2937;
  }

  .modal-type {
    display: flex;
    align-items: center;
    gap: 7px;
    color: #818cf8;
    font-size: 13px;
    font-weight: 700;
  }

  .modal-header h2 {
    margin: 5px 0 0;
    color: #f8fafc;
    font-size: 22px;
  }

  .modal-close {
    width: 36px;
    height: 36px;
    border: 0;
    border-radius: 9px;
    background: #1e293b;
    color: #94a3b8;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
  }

  .modal-close:hover {
    background: #334155;
    color: #f8fafc;
  }

  .modal-status-row {
    display: flex;
    gap: 8px;
    padding: 15px 20px;
    border-bottom: 1px solid #1f2937;
  }

  .modal-content {
    padding: 20px;
  }

  .detail-item {
    padding: 11px 0;
    border-bottom: 1px solid #1f2937;
  }

  .detail-item span {
    display: block;
    color: #64748b;
    font-size: 11px;
    margin-bottom: 5px;
  }

  .detail-item strong {
    display: flex;
    align-items: center;
    gap: 6px;
    color: #cbd5e1;
    font-size: 13px;
  }

  .detail-section {
    margin-top: 20px;
  }

  .detail-section h3 {
    display: flex;
    align-items: center;
    gap: 7px;
    margin: 0 0 8px;
    color: #f1f5f9;
    font-size: 14px;
  }

  .detail-section p {
    margin: 0;
    color: #94a3b8;
    line-height: 1.6;
    font-size: 13px;
  }

  .detail-section.recommendation {
    padding: 14px;
    background: #0f172a;
    border: 1px solid #1f2937;
    border-radius: 10px;
  }

  .detail-section.recommendation h3 {
    color: #818cf8;
  }

  /* ============================================================
     MODAL ACTIONS
     ============================================================ */

  .modal-actions {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    padding: 16px 20px;
    border-top: 1px solid #1f2937;
  }

  .modal-actions button {
    padding: 9px 13px;
    border-radius: 8px;
    border: 1px solid #334155;
    background: #172033;
    color: #cbd5e1;
    font-weight: 650;
    cursor: pointer;
  }

  .modal-actions button:hover {
    background: #1e293b;
  }

  .modal-actions .resolve-modal-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    background: #16a34a;
    color: white;
    border-color: #16a34a;
  }

  .modal-actions .resolve-modal-btn:hover {
    background: #15803d;
  }

  /* ============================================================
     SCROLLBAR
     ============================================================ */

  .alerts-table-wrapper::-webkit-scrollbar,
  .alert-modal::-webkit-scrollbar {
    height: 7px;
    width: 7px;
  }

  .alerts-table-wrapper::-webkit-scrollbar-track,
  .alert-modal::-webkit-scrollbar-track {
    background: #0f172a;
  }

  .alerts-table-wrapper::-webkit-scrollbar-thumb,
  .alert-modal::-webkit-scrollbar-thumb {
    background: #334155;
    border-radius: 10px;
  }

  .alerts-table-wrapper::-webkit-scrollbar-thumb:hover,
  .alert-modal::-webkit-scrollbar-thumb:hover {
    background: #475569;
  }

  /* ============================================================
     SPINNER
     ============================================================ */

  .spin {
    animation: alert-spin 1s linear infinite;
  }

  @keyframes alert-spin {
    from {
      transform: rotate(0deg);
    }

    to {
      transform: rotate(360deg);
    }
  }

  /* ============================================================
     RESPONSIVE
     ============================================================ */

  @media (max-width: 1200px) {

    .alerts-summary-grid {
      grid-template-columns:
        repeat(3, minmax(0, 1fr));
    }

    .filter-controls {
      grid-template-columns:
        repeat(2, minmax(180px, 1fr));
    }

  }

  @media (max-width: 768px) {

    .alerts-page {
      padding: 15px;
    }

    .alerts-header {
      flex-direction: column;
      align-items: stretch;
    }

    .alerts-header-actions {
      width: 100%;
    }

    .alerts-btn {
      flex: 1;
      justify-content: center;
    }

    .alerts-summary-grid {
      grid-template-columns:
        repeat(2, minmax(0, 1fr));
    }

    .filter-controls {
      grid-template-columns: 1fr;
    }

  }

  @media (max-width: 480px) {

    .alerts-summary-grid {
      grid-template-columns: 1fr;
    }

    .alerts-header h1 {
      font-size: 23px;
    }

  }

`}</style>

    </Layout>
  );
}