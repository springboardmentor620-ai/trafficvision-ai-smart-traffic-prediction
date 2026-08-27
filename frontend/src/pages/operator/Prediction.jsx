import { useState, useEffect } from "react";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import DashboardHeader from "../../components/dashboard/DashboardHeader";
import PredictionPanel from "../../components/dashboard/PredictionPanel";
import api from "../../services/api";

function Prediction() {
  const [predictionResult, setPredictionResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const fetchHistory = async () => {
    try {
      setLoadingHistory(true);
      const res = await api.get("/prediction-history");
      setHistory(res.data || []);
    } catch (err) {
      console.error("Failed to load prediction history", err);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [predictionResult]);

  return (
    <DashboardLayout>
      <DashboardHeader
        title="Operator Prediction Console"
        subtitle="Simulate traffic parameters, calculate ML congestion scores, and view prediction history."
      />

      <div style={{ width: "100%", marginBottom: "28px" }}>
        <PredictionPanel
          predictionResult={predictionResult}
          setPredictionResult={setPredictionResult}
        />
      </div>

      <div
        style={{
          width: "100%",
          padding: "24px",
          backgroundColor: "var(--bg-surface)",
          borderRadius: "16px",
          border: "1px solid var(--border-color)",
          boxShadow: "var(--shadow-sm)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <div>
            <h2 style={{ fontSize: "18px", fontWeight: "700", margin: "0 0 4px 0", color: "var(--text-primary)" }}>
              Recent Prediction Audit Log
            </h2>
            <p style={{ fontSize: "13px", color: "var(--text-muted)", margin: 0 }}>
              Audit trail of simulated corridor parameters and ML-generated congestion scores.
            </p>
          </div>

          <button
            onClick={fetchHistory}
            style={{
              padding: "8px 16px",
              background: "var(--bg-surface-secondary)",
              color: "var(--text-primary)",
              border: "1px solid var(--border-color)",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "13px",
              fontWeight: "600",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            🔄 Refresh Log
          </button>
        </div>

        {loadingHistory ? (
          <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>Loading prediction history...</p>
        ) : history.length === 0 ? (
          <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>No previous predictions recorded yet.</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px", textAlign: "left" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid var(--border-color)", color: "var(--text-muted)" }}>
                  <th style={{ padding: "12px 14px" }}>Road Intersection</th>
                  <th style={{ padding: "12px 14px" }}>Sector / Area</th>
                  <th style={{ padding: "12px 14px" }}>Volume</th>
                  <th style={{ padding: "12px 14px" }}>Velocity</th>
                  <th style={{ padding: "12px 14px" }}>Weather</th>
                  <th style={{ padding: "12px 14px" }}>Congestion Score</th>
                  <th style={{ padding: "12px 14px" }}>Risk Level</th>
                  <th style={{ padding: "12px 14px" }}>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {history.slice(0, 10).map((row, idx) => {
                  const score =
                    typeof row.predicted_congestion === "number"
                      ? row.predicted_congestion
                      : typeof row.prediction === "number"
                      ? row.prediction
                      : 0;

                  const level = row.prediction_level || row.level || (score >= 70 ? "High" : score >= 40 ? "Moderate" : "Low");
                  const timeVal = row.timestamp || row.created_at;

                  return (
                    <tr key={idx} style={{ borderBottom: "1px solid var(--border-color)" }}>
                      <td style={{ padding: "12px 14px", fontWeight: "600", color: "var(--text-primary)" }}>
                        {row.road_name || "Corridor"}
                      </td>
                      <td style={{ padding: "12px 14px", color: "var(--text-secondary)" }}>
                        {row.area_name || "-"}
                      </td>
                      <td style={{ padding: "12px 14px" }}>
                        {row.traffic_volume ? row.traffic_volume.toLocaleString() : "-"}
                      </td>
                      <td style={{ padding: "12px 14px" }}>
                        {row.average_speed ? `${row.average_speed} km/h` : "-"}
                      </td>
                      <td style={{ padding: "12px 14px" }}>
                        <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                          {row.weather === "Rain" ? "🌧️ Rain" : row.weather === "Fog" ? "🌫️ Fog" : "☀️ " + (row.weather || "Clear")}
                        </span>
                      </td>
                      <td style={{ padding: "12px 14px", fontWeight: "700" }}>
                        <span
                          style={{
                            color: score >= 70 ? "var(--danger)" : score >= 40 ? "var(--warning)" : "var(--success)",
                          }}
                        >
                          {score.toFixed(1)}%
                        </span>
                      </td>
                      <td style={{ padding: "12px 14px" }}>
                        <span
                          style={{
                            fontSize: "11px",
                            padding: "3px 8px",
                            borderRadius: "6px",
                            backgroundColor:
                              level === "High"
                                ? "rgba(239, 68, 68, 0.12)"
                                : level === "Moderate"
                                ? "rgba(245, 158, 11, 0.12)"
                                : "rgba(16, 185, 129, 0.12)",
                            color:
                              level === "High"
                                ? "var(--danger)"
                                : level === "Moderate"
                                ? "var(--warning)"
                                : "var(--success)",
                            fontWeight: "700",
                          }}
                        >
                          ● {level}
                        </span>
                      </td>
                      <td style={{ padding: "12px 14px", color: "var(--text-muted)", fontSize: "12px" }}>
                        {timeVal ? new Date(timeVal).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : "-"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default Prediction;
