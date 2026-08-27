import { useEffect, useState, useMemo } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import AdminLayout from "../../components/dashboard/AdminLayout";
import { getPredictionHistory } from "../../services/predictionHistory";

const PIE_COLORS = {
  High: "#ef4444",
  Moderate: "#f59e0b",
  Low: "#10b981",
};

function formatTime(isoString) {
  if (!isoString) return "";
  try {
    const d = new Date(isoString);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  } catch {
    return isoString;
  }
}

function formatDate(isoString) {
  if (!isoString) return "";
  try {
    const d = new Date(isoString);
    return d.toLocaleDateString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  } catch {
    return isoString;
  }
}

function HistoricalAnalytics() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [levelFilter, setLevelFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    async function loadHistory(isInitial = false) {
      try {
        if (isInitial) setLoading(true);
        const data = await getPredictionHistory();
        setHistory(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to load historical analytics", err);
      } finally {
        if (isInitial) setLoading(false);
      }
    }

    loadHistory(true);
    const interval = setInterval(() => loadHistory(false), 5000);
    return () => clearInterval(interval);
  }, []);

  // Summary Metrics Calculation
  const stats = useMemo(() => {
    if (!history.length) {
      return {
        avgCongestion: 0,
        avgSpeed: 0,
        avgVolume: 0,
        highCount: 0,
        modCount: 0,
        lowCount: 0,
        total: 0,
      };
    }

    const total = history.length;
    const avgCongestion = (
      history.reduce((sum, item) => sum + (Number(item.predicted_congestion) || 0), 0) / total
    ).toFixed(1);

    const avgSpeed = (
      history.reduce((sum, item) => sum + (Number(item.average_speed) || 0), 0) / total
    ).toFixed(1);

    const avgVolume = Math.round(
      history.reduce((sum, item) => sum + (Number(item.traffic_volume) || 0), 0) / total
    );

    const highCount = history.filter((i) => i.prediction_level === "High").length;
    const modCount = history.filter((i) => i.prediction_level === "Moderate").length;
    const lowCount = history.filter((i) => i.prediction_level === "Low").length;

    return {
      avgCongestion,
      avgSpeed,
      avgVolume,
      highCount,
      modCount,
      lowCount,
      total,
    };
  }, [history]);

  // Distribution for Pie Chart
  const distributionData = useMemo(() => {
    const data = [
      { name: "High", value: stats.highCount, color: PIE_COLORS.High },
      { name: "Moderate", value: stats.modCount, color: PIE_COLORS.Moderate },
      { name: "Low", value: stats.lowCount, color: PIE_COLORS.Low },
    ].filter((item) => item.value > 0);

    return data.length > 0
      ? data
      : [{ name: "No Data", value: 1, color: "var(--border-color)" }];
  }, [stats]);

  // Aggregated Volume Data by Road (Top 8 Corridors)
  const volumeByRoadData = useMemo(() => {
    if (!history.length) return [];
    const roadMap = {};
    history.forEach((item) => {
      const road = item.road_name || "Unknown";
      if (!roadMap[road]) {
        roadMap[road] = { road_name: road, total_volume: 0, count: 0, avg_speed: 0 };
      }
      roadMap[road].total_volume += Number(item.traffic_volume) || 0;
      roadMap[road].avg_speed += Number(item.average_speed) || 0;
      roadMap[road].count += 1;
    });

    return Object.values(roadMap)
      .map((r) => ({
        road_name: r.road_name,
        average_volume: Math.round(r.total_volume / r.count),
        avg_speed: Math.round(r.avg_speed / r.count),
      }))
      .sort((a, b) => b.average_volume - a.average_volume)
      .slice(0, 8);
  }, [history]);

  // Chronological Time-Series for Line Chart (Oldest to Newest)
  const timeSeriesData = useMemo(() => {
    if (!history.length) return [];
    return history
      .slice(0, 30) // Take recent 30 samples
      .reverse() // Reverse so time flows left to right
      .map((item) => ({
        time: formatTime(item.timestamp),
        rawTime: item.timestamp,
        speed: Number(item.average_speed) || 0,
        congestion: Number(Number(item.predicted_congestion).toFixed(1)) || 0,
        road: item.road_name || "Corridor",
      }));
  }, [history]);

  // Filtered & Paginated Table Data
  const filteredHistory = useMemo(() => {
    return history.filter((item) => {
      const matchSearch =
        !searchTerm ||
        (item.road_name && item.road_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.area_name && item.area_name.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchLevel =
        levelFilter === "ALL" ||
        (item.prediction_level && item.prediction_level.toUpperCase() === levelFilter.toUpperCase());

      return matchSearch && matchLevel;
    });
  }, [history, searchTerm, levelFilter]);

  const totalPages = Math.ceil(filteredHistory.length / pageSize) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredHistory.slice(start, start + pageSize);
  }, [filteredHistory, currentPage, pageSize]);

  // Export CSV Handler
  const exportCSV = () => {
    if (!history.length) return;
    const headers = [
      "ID",
      "Road Name",
      "Area Name",
      "Traffic Volume",
      "Average Speed (km/h)",
      "Predicted Congestion (%)",
      "Risk Level",
      "Weather",
      "Roadwork",
      "Timestamp",
    ];

    const rows = history.map((item) => [
      item.id || "",
      `"${item.road_name || ""}"`,
      `"${item.area_name || ""}"`,
      item.traffic_volume || 0,
      item.average_speed || 0,
      Number(item.predicted_congestion || 0).toFixed(2),
      item.prediction_level || "",
      item.weather || "",
      item.roadwork ? "Yes" : "No",
      item.timestamp || "",
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `TrafficVision_Historical_Analytics_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
  };

  // Export PDF Handler
  const exportPDF = () => {
    if (!history.length) return;
    const doc = new jsPDF("landscape");

    doc.setFontSize(18);
    doc.setTextColor(37, 99, 235);
    doc.text("TrafficVision AI — Historical Analytics Report", 14, 18);

    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text(`Generated on: ${new Date().toLocaleString()} | Total Sampled Records: ${history.length}`, 14, 26);

    autoTable(doc, {
      startY: 32,
      head: [
        [
          "ID",
          "Road / Corridor",
          "Area",
          "Volume (veh)",
          "Avg Speed",
          "Congestion (%)",
          "Risk Level",
          "Weather",
          "Timestamp",
        ],
      ],
      body: history.slice(0, 100).map((item) => [
        item.id || "-",
        item.road_name || "-",
        item.area_name || "-",
        item.traffic_volume?.toLocaleString() || "0",
        `${item.average_speed || 0} km/h`,
        `${Number(item.predicted_congestion || 0).toFixed(1)}%`,
        item.prediction_level || "-",
        item.weather || "Clear",
        formatDate(item.timestamp),
      ]),
      styles: {
        fontSize: 8,
        halign: "left",
      },
      headStyles: {
        fillColor: [37, 99, 235],
        textColor: [255, 255, 255],
        fontStyle: "bold",
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },
    });

    doc.save(`TrafficVision_Historical_Report_${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  return (
    <AdminLayout
      title="Historical Analytics"
      subtitle="Comprehensive analysis of historical traffic volume, network speed trends, and ML congestion patterns"
    >
      {/* Top Summary Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "18px",
          marginBottom: "28px",
        }}
      >
        <div
          style={{
            background: "var(--bg-surface)",
            borderRadius: "12px",
            padding: "20px",
            border: "1px solid var(--border-color)",
            boxShadow: "var(--shadow-sm)",
            display: "flex",
            flexDirection: "column",
            gap: "8px",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-secondary)" }}>
              🤖 Avg Congestion
            </span>
            <span style={{ fontSize: "18px" }}>📊</span>
          </div>
          <div style={{ fontSize: "26px", fontWeight: "700", color: "var(--primary)" }}>
            {stats.avgCongestion}%
          </div>
          <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
            Across {stats.total} logged runs
          </span>
        </div>

        <div
          style={{
            background: "var(--bg-surface)",
            borderRadius: "12px",
            padding: "20px",
            border: "1px solid var(--border-color)",
            boxShadow: "var(--shadow-sm)",
            display: "flex",
            flexDirection: "column",
            gap: "8px",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-secondary)" }}>
              ⚡ Avg Velocity
            </span>
            <span style={{ fontSize: "18px" }}>🏎️</span>
          </div>
          <div style={{ fontSize: "26px", fontWeight: "700", color: "var(--text-primary)" }}>
            {stats.avgSpeed} <span style={{ fontSize: "14px", fontWeight: "500" }}>km/h</span>
          </div>
          <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
            Average network velocity
          </span>
        </div>

        <div
          style={{
            background: "var(--bg-surface)",
            borderRadius: "12px",
            padding: "20px",
            border: "1px solid var(--border-color)",
            boxShadow: "var(--shadow-sm)",
            display: "flex",
            flexDirection: "column",
            gap: "8px",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-secondary)" }}>
              🔴 High Risk
            </span>
            <span style={{ fontSize: "18px" }}>🚨</span>
          </div>
          <div style={{ fontSize: "26px", fontWeight: "700", color: "var(--danger)" }}>
            {stats.highCount}
          </div>
          <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
            Congestion level &ge; 70%
          </span>
        </div>

        <div
          style={{
            background: "var(--bg-surface)",
            borderRadius: "12px",
            padding: "20px",
            border: "1px solid var(--border-color)",
            boxShadow: "var(--shadow-sm)",
            display: "flex",
            flexDirection: "column",
            gap: "8px",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-secondary)" }}>
              🟠 Moderate Risk
            </span>
            <span style={{ fontSize: "18px" }}>⚠️</span>
          </div>
          <div style={{ fontSize: "26px", fontWeight: "700", color: "var(--warning)" }}>
            {stats.modCount}
          </div>
          <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
            Congestion level 40%–69%
          </span>
        </div>

        <div
          style={{
            background: "var(--bg-surface)",
            borderRadius: "12px",
            padding: "20px",
            border: "1px solid var(--border-color)",
            boxShadow: "var(--shadow-sm)",
            display: "flex",
            flexDirection: "column",
            gap: "8px",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-secondary)" }}>
              🟢 Low Risk
            </span>
            <span style={{ fontSize: "18px" }}>✅</span>
          </div>
          <div style={{ fontSize: "26px", fontWeight: "700", color: "var(--success)" }}>
            {stats.lowCount}
          </div>
          <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
            Congestion level &lt; 40%
          </span>
        </div>
      </div>

      {/* Main Charts Row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(420px, 1fr))",
          gap: "24px",
          marginBottom: "28px",
        }}
      >
        {/* Chart 1: Vehicle Volume by Corridor */}
        <div
          style={{
            background: "var(--bg-surface)",
            color: "var(--text-primary)",
            padding: "24px",
            borderRadius: "14px",
            border: "1px solid var(--border-color)",
            boxShadow: "var(--shadow-sm)",
            height: "380px",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div style={{ marginBottom: "16px" }}>
            <h2 style={{ fontSize: "17px", fontWeight: "700", margin: 0, color: "var(--text-primary)" }}>
              🚗 Average Vehicle Volume by Corridor
            </h2>
            <p style={{ fontSize: "12px", color: "var(--text-muted)", margin: "4px 0 0 0" }}>
              Top monitored corridors ranked by traffic throughput
            </p>
          </div>

          <div style={{ flex: 1, minHeight: 0 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={volumeByRoadData} margin={{ top: 10, right: 20, left: -10, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" opacity={0.6} />
                <XAxis
                  dataKey="road_name"
                  stroke="var(--text-secondary)"
                  fontSize={11}
                  interval={0}
                  angle={-20}
                  textAnchor="end"
                />
                <YAxis stroke="var(--text-secondary)" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--bg-surface)",
                    borderColor: "var(--border-color)",
                    color: "var(--text-primary)",
                    borderRadius: "8px",
                    boxShadow: "var(--shadow-md)",
                    fontSize: "13px",
                  }}
                  formatter={(value, name) => [
                    name === "average_volume" ? `${value.toLocaleString()} vehicles` : `${value} km/h`,
                    name === "average_volume" ? "Avg Volume" : "Avg Speed",
                  ]}
                />
                <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }} />
                <Bar dataKey="average_volume" fill="#3b82f6" name="Average Volume" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Congestion & Speed Time-Series Trend */}
        <div
          style={{
            background: "var(--bg-surface)",
            color: "var(--text-primary)",
            padding: "24px",
            borderRadius: "14px",
            border: "1px solid var(--border-color)",
            boxShadow: "var(--shadow-sm)",
            height: "380px",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div style={{ marginBottom: "16px" }}>
            <h2 style={{ fontSize: "17px", fontWeight: "700", margin: 0, color: "var(--text-primary)" }}>
              📈 Network Speed & Congestion Time Trend
            </h2>
            <p style={{ fontSize: "12px", color: "var(--text-muted)", margin: "4px 0 0 0" }}>
              Chronological progression of corridor velocity vs. ML congestion score
            </p>
          </div>

          <div style={{ flex: 1, minHeight: 0 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timeSeriesData} margin={{ top: 10, right: 20, left: -10, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" opacity={0.6} />
                <XAxis
                  dataKey="time"
                  stroke="var(--text-secondary)"
                  fontSize={11}
                  angle={-15}
                  textAnchor="end"
                />
                <YAxis stroke="var(--text-secondary)" fontSize={11} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--bg-surface)",
                    borderColor: "var(--border-color)",
                    color: "var(--text-primary)",
                    borderRadius: "8px",
                    boxShadow: "var(--shadow-md)",
                    fontSize: "13px",
                  }}
                  formatter={(value, name) => [
                    name === "Speed (km/h)" ? `${value} km/h` : `${value}%`,
                    name,
                  ]}
                  labelFormatter={(label, items) => {
                    const item = items?.[0]?.payload;
                    return item ? `${item.road} @ ${label}` : label;
                  }}
                />
                <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }} />
                <Line
                  type="monotone"
                  dataKey="speed"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  dot={{ r: 3 }}
                  name="Speed (km/h)"
                />
                <Line
                  type="monotone"
                  dataKey="congestion"
                  stroke="#ef4444"
                  strokeWidth={2.5}
                  dot={{ r: 3 }}
                  name="Congestion (%)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Second Row: Congestion Breakdown Donut & Action Card */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: "24px",
          marginBottom: "28px",
        }}
      >
        {/* Congestion Level Distribution Donut */}
        <div
          style={{
            background: "var(--bg-surface)",
            color: "var(--text-primary)",
            padding: "24px",
            borderRadius: "14px",
            border: "1px solid var(--border-color)",
            boxShadow: "var(--shadow-sm)",
            height: "340px",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div>
            <h2 style={{ fontSize: "17px", fontWeight: "700", margin: 0, color: "var(--text-primary)" }}>
              🎯 Congestion Severity Distribution
            </h2>
            <p style={{ fontSize: "12px", color: "var(--text-muted)", margin: "4px 0 0 0" }}>
              Breakdown of sampled intervals by risk severity tier
            </p>
          </div>

          <div style={{ flex: 1, minHeight: 0 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={distributionData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={95}
                  paddingAngle={4}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {distributionData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--bg-surface)",
                    borderColor: "var(--border-color)",
                    color: "var(--text-primary)",
                    borderRadius: "8px",
                    boxShadow: "var(--shadow-md)",
                    fontSize: "13px",
                  }}
                  formatter={(value, name) => [`${value} logs`, name]}
                />
                <Legend wrapperStyle={{ fontSize: "12px" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Historical Insights & Export Actions */}
        <div
          style={{
            background: "var(--bg-surface)",
            color: "var(--text-primary)",
            padding: "24px",
            borderRadius: "14px",
            border: "1px solid var(--border-color)",
            boxShadow: "var(--shadow-sm)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <div>
            <h2 style={{ fontSize: "17px", fontWeight: "700", margin: 0, color: "var(--text-primary)" }}>
              📑 Export & Compliance Reports
            </h2>
            <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "6px", lineHeight: 1.5 }}>
              Export complete historical prediction logs with telemetry parameters, weather indices, and ML confidence levels for audit and city planning.
            </p>

            <div style={{ marginTop: "16px", display: "flex", flexDirection: "column", gap: "10px" }}>
              <div style={{ padding: "10px 14px", backgroundColor: "var(--bg-surface-secondary)", borderRadius: "8px", border: "1px solid var(--border-color)", fontSize: "13px" }}>
                📊 <strong>Total Dataset Size:</strong> {history.length} logged intervals
              </div>
              <div style={{ padding: "10px 14px", backgroundColor: "var(--bg-surface-secondary)", borderRadius: "8px", border: "1px solid var(--border-color)", fontSize: "13px" }}>
                🕒 <strong>Latest Recording:</strong> {history[0]?.timestamp ? formatDate(history[0].timestamp) : "N/A"}
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: "14px", marginTop: "20px", flexWrap: "wrap" }}>
            <button
              onClick={exportCSV}
              style={{
                flex: 1,
                minWidth: "140px",
                padding: "12px 18px",
                background: "var(--primary)",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: "600",
                fontSize: "14px",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                transition: "all 0.2s",
              }}
            >
              ⬇️ Export CSV
            </button>

            <button
              onClick={exportPDF}
              style={{
                flex: 1,
                minWidth: "140px",
                padding: "12px 18px",
                background: "#dc2626",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: "600",
                fontSize: "14px",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                transition: "all 0.2s",
              }}
            >
              📄 Export PDF
            </button>
          </div>
        </div>
      </div>

      {/* Historical Records Data Table Card */}
      <div
        style={{
          background: "var(--bg-surface)",
          color: "var(--text-primary)",
          padding: "24px",
          borderRadius: "14px",
          border: "1px solid var(--border-color)",
          boxShadow: "var(--shadow-sm)",
        }}
      >
        {/* Table Header Controls */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "16px",
            marginBottom: "20px",
          }}
        >
          <div>
            <h2 style={{ fontSize: "18px", fontWeight: "700", margin: 0, color: "var(--text-primary)" }}>
              Detailed Historical Prediction Logs
            </h2>
            <p style={{ fontSize: "13px", color: "var(--text-muted)", margin: "4px 0 0 0" }}>
              Showing {filteredHistory.length} matching telemetry snapshots
            </p>
          </div>

          <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
            <input
              type="text"
              placeholder="Filter by road or area..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              style={{
                height: "38px",
                padding: "0 14px",
                borderRadius: "8px",
                border: "1px solid var(--border-color)",
                backgroundColor: "var(--bg-input)",
                color: "var(--text-primary)",
                fontSize: "13px",
                minWidth: "200px",
              }}
            />

            <select
              value={levelFilter}
              onChange={(e) => {
                setLevelFilter(e.target.value);
                setCurrentPage(1);
              }}
              style={{
                height: "38px",
                padding: "0 12px",
                borderRadius: "8px",
                border: "1px solid var(--border-color)",
                backgroundColor: "var(--bg-input)",
                color: "var(--text-primary)",
                fontSize: "13px",
                cursor: "pointer",
              }}
            >
              <option value="ALL">All Severity Levels</option>
              <option value="HIGH">High Severity</option>
              <option value="MODERATE">Moderate Severity</option>
              <option value="LOW">Low Severity</option>
            </select>
          </div>
        </div>

        {/* Data Table */}
        {loading ? (
          <div style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>
            Loading historical records...
          </div>
        ) : paginatedData.length === 0 ? (
          <div
            style={{
              padding: "40px",
              textAlign: "center",
              backgroundColor: "var(--bg-surface-secondary)",
              borderRadius: "10px",
              color: "var(--text-muted)",
              fontSize: "14px",
            }}
          >
            No historical records match your search criteria.
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: "13px",
                textAlign: "left",
              }}
            >
              <thead>
                <tr
                  style={{
                    borderBottom: "2px solid var(--border-color)",
                    backgroundColor: "var(--bg-surface-secondary)",
                    color: "var(--text-secondary)",
                  }}
                >
                  <th style={{ padding: "12px 14px" }}>ID</th>
                  <th style={{ padding: "12px 14px" }}>Road & Corridor</th>
                  <th style={{ padding: "12px 14px" }}>Area</th>
                  <th style={{ padding: "12px 14px" }}>Traffic Volume</th>
                  <th style={{ padding: "12px 14px" }}>Average Speed</th>
                  <th style={{ padding: "12px 14px" }}>Predicted Congestion</th>
                  <th style={{ padding: "12px 14px" }}>Risk Level</th>
                  <th style={{ padding: "12px 14px" }}>Weather</th>
                  <th style={{ padding: "12px 14px" }}>Logged Time</th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.map((item) => (
                  <tr
                    key={item.id}
                    style={{
                      borderBottom: "1px solid var(--border-color)",
                      transition: "background-color 0.15s",
                    }}
                  >
                    <td style={{ padding: "12px 14px", color: "var(--text-muted)", fontWeight: "500" }}>
                      #{item.id}
                    </td>
                    <td style={{ padding: "12px 14px", fontWeight: "600", color: "var(--text-primary)" }}>
                      {item.road_name}
                    </td>
                    <td style={{ padding: "12px 14px", color: "var(--text-secondary)" }}>
                      {item.area_name}
                    </td>
                    <td style={{ padding: "12px 14px", fontWeight: "500" }}>
                      {item.traffic_volume ? item.traffic_volume.toLocaleString() : "-"}
                    </td>
                    <td style={{ padding: "12px 14px" }}>
                      <span
                        style={{
                          padding: "3px 8px",
                          borderRadius: "6px",
                          backgroundColor: "var(--bg-surface-secondary)",
                          border: "1px solid var(--border-color)",
                          fontWeight: "600",
                        }}
                      >
                        {item.average_speed} km/h
                      </span>
                    </td>
                    <td style={{ padding: "12px 14px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <div
                          style={{
                            flex: 1,
                            maxWidth: "80px",
                            height: "6px",
                            backgroundColor: "var(--border-color)",
                            borderRadius: "3px",
                            overflow: "hidden",
                          }}
                        >
                          <div
                            style={{
                              width: `${Math.min(item.predicted_congestion || 0, 100)}%`,
                              height: "100%",
                              backgroundColor:
                                item.prediction_level === "High"
                                  ? "var(--danger)"
                                  : item.prediction_level === "Moderate"
                                  ? "var(--warning)"
                                  : "var(--success)",
                            }}
                          />
                        </div>
                        <span style={{ fontWeight: "700" }}>
                          {Number(item.predicted_congestion || 0).toFixed(1)}%
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: "12px 14px" }}>
                      <span
                        style={{
                          fontSize: "12px",
                          fontWeight: "600",
                          padding: "3px 10px",
                          borderRadius: "20px",
                          backgroundColor:
                            item.prediction_level === "High"
                              ? "var(--danger-tint, #fee2e2)"
                              : item.prediction_level === "Moderate"
                              ? "var(--warning-tint, #fef3c7)"
                              : "var(--success-tint, #dcfce7)",
                          color:
                            item.prediction_level === "High"
                              ? "#dc2626"
                              : item.prediction_level === "Moderate"
                              ? "#d97706"
                              : "#16a34a",
                        }}
                      >
                        {item.prediction_level || "Normal"}
                      </span>
                    </td>
                    <td style={{ padding: "12px 14px", color: "var(--text-secondary)" }}>
                      {item.weather === "Rain" ? "🌧️ Rain" : item.weather === "Fog" ? "🌫️ Fog" : "☀️ " + (item.weather || "Clear")}
                    </td>
                    <td style={{ padding: "12px 14px", color: "var(--text-muted)", fontSize: "12px" }}>
                      {formatDate(item.timestamp)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        {filteredHistory.length > pageSize && (
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: "20px",
              paddingTop: "16px",
              borderTop: "1px solid var(--border-color)",
              flexWrap: "wrap",
              gap: "12px",
            }}
          >
            <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>
              Showing {(currentPage - 1) * pageSize + 1} to{" "}
              {Math.min(currentPage * pageSize, filteredHistory.length)} of {filteredHistory.length} entries
            </span>

            <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                style={{
                  padding: "6px 12px",
                  borderRadius: "6px",
                  border: "1px solid var(--border-color)",
                  backgroundColor: "var(--bg-surface)",
                  color: currentPage === 1 ? "var(--text-muted)" : "var(--text-primary)",
                  cursor: currentPage === 1 ? "not-allowed" : "pointer",
                  fontSize: "13px",
                  fontWeight: "600",
                }}
              >
                ◀ Prev
              </button>

              <span style={{ fontSize: "13px", fontWeight: "600", padding: "0 8px" }}>
                Page {currentPage} of {totalPages}
              </span>

              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                style={{
                  padding: "6px 12px",
                  borderRadius: "6px",
                  border: "1px solid var(--border-color)",
                  backgroundColor: "var(--bg-surface)",
                  color: currentPage === totalPages ? "var(--text-muted)" : "var(--text-primary)",
                  cursor: currentPage === totalPages ? "not-allowed" : "pointer",
                  fontSize: "13px",
                  fontWeight: "600",
                }}
              >
                Next ▶
              </button>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

export default HistoricalAnalytics;