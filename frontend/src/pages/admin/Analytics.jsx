import { useEffect, useState } from "react";

import AdminLayout from "../../components/dashboard/AdminLayout";
import AnalyticsCards from "../../components/analytics/AnalyticsCards";
import CongestionPieChart from "../../components/analytics/CongestionPieChart";
import BusyRoadChart from "../../components/analytics/BusyRoadChart";
import TrafficTrendChart from "../../components/analytics/TrafficTrendChart";
import RoadRankingTable from "../../components/analytics/RoadRankingTable";
import AIInsights from "../../components/analytics/AIInsights";

import { getDashboardSummary } from "../../services/traffic";

function Analytics() {
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    let mounted = true;

    const fetchSummary = async () => {
      try {
        const data = await getDashboardSummary();
        if (!mounted) return;
        setSummary(data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchSummary();
    const interval = setInterval(fetchSummary, 5000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <AdminLayout
      title="Traffic Analytics & Insights"
      subtitle="Deep real-time and historical velocity, congestion distributions, and AI predictive insights"
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "24px", width: "100%" }}>
        {/* Top Summary Cards */}
        <AnalyticsCards summary={summary} />

        {/* 2-Column High-Impact Visualizations Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(460px, 1fr))",
            gap: "24px",
            alignItems: "stretch",
          }}
        >
          <div style={{ background: "var(--bg-surface)", borderRadius: "14px", border: "1px solid var(--border-color)", overflow: "hidden" }}>
            <CongestionPieChart />
          </div>

          <div style={{ background: "var(--bg-surface)", borderRadius: "14px", border: "1px solid var(--border-color)", overflow: "hidden" }}>
            <BusyRoadChart />
          </div>
        </div>

        {/* Full-Width Telemetry Velocity Trends */}
        <div style={{ background: "var(--bg-surface)", borderRadius: "14px", border: "1px solid var(--border-color)", overflow: "hidden" }}>
          <TrafficTrendChart />
        </div>

        {/* 2-Column Road Rankings and AI Insights */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(460px, 1fr))",
            gap: "24px",
            alignItems: "stretch",
          }}
        >
          <div style={{ background: "var(--bg-surface)", borderRadius: "14px", border: "1px solid var(--border-color)", overflow: "hidden" }}>
            <RoadRankingTable />
          </div>

          <div style={{ background: "var(--bg-surface)", borderRadius: "14px", border: "1px solid var(--border-color)", overflow: "hidden" }}>
            <AIInsights />
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

export default Analytics;