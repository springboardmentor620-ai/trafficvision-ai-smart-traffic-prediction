import { useEffect, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  MdDirectionsCar,
  MdInsights,
  MdSpeed,
  MdTimeline,
  MdTraffic,
  MdWeekend,
  MdWbCloudy,
} from "react-icons/md";

import { getAnalytics } from "../services/trafficService";
import "../styles/Analytics.css";

const CHART_COLORS = ["#38bdf8", "#a78bfa", "#fbbf24", "#fb7185"];
const tooltipStyle = {
  background: "#0f1c2f",
  border: "1px solid rgba(148,163,184,.22)",
  borderRadius: "10px",
  color: "#e2e8f0",
};

function ChartPanel({ title, subtitle, children }) {
  return (
    <section className="analytics-chart-panel">
      <header>
        <div>
          <h2>{title}</h2>
          <p>{subtitle}</p>
        </div>
      </header>
      <div className="analytics-chart">{children}</div>
    </section>
  );
}

function Analytics() {
  const [analytics, setAnalytics] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadAnalytics() {
      try {
        const data = await getAnalytics();
        if (active) setAnalytics(data);
      } catch (requestError) {
        console.error("Unable to load analytics:", requestError);
        if (active) setError("Analytics data is temporarily unavailable.");
      }
    }

    loadAnalytics();
    return () => { active = false; };
  }, []);

  if (error) return <div className="analytics-state analytics-state--error">{error}</div>;
  if (!analytics?.metrics) return <div className="analytics-state">Loading analytics dashboard...</div>;

  const { metrics, charts } = analytics;
  const dashboardCards = [
    { label: "Average Speed", value: `${metrics.average_speed} km/h`, detail: "Across all processed records", icon: MdSpeed, tone: "blue" },
    { label: "Vehicle Count", value: metrics.average_vehicle_count, detail: "Average vehicles per record", icon: MdDirectionsCar, tone: "purple" },
    { label: "Traffic Health", value: `${metrics.traffic_health.score}%`, detail: metrics.traffic_health.status, icon: MdInsights, tone: "green" },
    { label: "Congestion", value: `${metrics.congestion_percentage}%`, detail: "Records marked high traffic", icon: MdTraffic, tone: "rose" },
    { label: "Weather", value: metrics.weather.label, detail: `${metrics.weather.percentage}% of records`, icon: MdWbCloudy, tone: "amber" },
    { label: "Rush Hour", value: `${metrics.rush_hour_percentage}%`, detail: "Records flagged as rush hour", icon: MdTimeline, tone: "blue" },
    { label: "Weekend Traffic", value: metrics.weekend_traffic.average_vehicle_count, detail: `${metrics.weekend_traffic.record_count.toLocaleString()} weekend records`, icon: MdWeekend, tone: "purple" },
  ];
  const weatherData = charts.weather_distribution.map((item) => ({ name: item.label, value: item.value }));
  const congestionData = charts.congestion_distribution.map((item) => ({ name: item.label, value: item.value }));

  return (
    <main className="analytics-page" aria-labelledby="analytics-title">
      <header className="analytics-page__header">
        <div>
          <p className="analytics-page__eyebrow">Data intelligence</p>
          <h1 id="analytics-title">Traffic Analytics</h1>
          <p>Operational insights calculated from {metrics.total_records.toLocaleString()} processed traffic records.</p>
        </div>
        <span className="analytics-page__badge"><i /> Dataset insights</span>
      </header>

      <section className="analytics-cards" aria-label="Traffic summary metrics">
        {dashboardCards.map(({ label, value, detail, icon: Icon, tone }) => (
          <article className={`analytics-metric analytics-metric--${tone}`} key={label}>
            <div className="analytics-metric__icon"><Icon /></div>
            <p>{label}</p>
            <h2>{value}</h2>
            <span>{detail}</span>
          </article>
        ))}
      </section>

      <section className="analytics-charts-grid" aria-label="Traffic analytics charts">
        <ChartPanel title="Traffic Trend" subtitle="Average traffic speed by hour">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={charts.traffic_trend} margin={{ top: 8, right: 6, left: -14, bottom: 0 }}>
              <CartesianGrid stroke="#334155" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="hour" tick={{ fill: "#8ea1bb", fontSize: 11 }} interval={3} />
              <YAxis tick={{ fill: "#8ea1bb", fontSize: 11 }} unit=" km/h" />
              <Tooltip contentStyle={tooltipStyle} formatter={(value) => [`${value} km/h`, "Average speed"]} />
              <Line type="monotone" dataKey="average_speed" stroke="#38bdf8" strokeWidth={2.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </ChartPanel>

        <ChartPanel title="Vehicle Count" subtitle="Average vehicle count by hour">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={charts.vehicle_count} margin={{ top: 8, right: 6, left: -14, bottom: 0 }}>
              <CartesianGrid stroke="#334155" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="hour" tick={{ fill: "#8ea1bb", fontSize: 11 }} interval={3} />
              <YAxis tick={{ fill: "#8ea1bb", fontSize: 11 }} />
              <Tooltip contentStyle={tooltipStyle} formatter={(value) => [value, "Average vehicles"]} />
              <Bar dataKey="average_vehicle_count" fill="#a78bfa" radius={[5, 5, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartPanel>

        <ChartPanel title="Weather Distribution" subtitle="Dataset weather conditions">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={weatherData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={48} outerRadius={75} paddingAngle={3}>
                {weatherData.map((item, index) => <Cell key={item.name} fill={CHART_COLORS[index % CHART_COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: "11px" }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartPanel>

        <ChartPanel title="Congestion Distribution" subtitle="Traffic-condition labels in the dataset">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={congestionData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={48} outerRadius={75} paddingAngle={3}>
                {congestionData.map((item, index) => <Cell key={item.name} fill={CHART_COLORS[index % CHART_COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: "11px" }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartPanel>

        <ChartPanel title="Peak Hour Analysis" subtitle="Share of records flagged as rush hour">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={charts.peak_hour_analysis} margin={{ top: 8, right: 6, left: -14, bottom: 0 }}>
              <defs><linearGradient id="rushGradient" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#fbbf24" stopOpacity={.6} /><stop offset="100%" stopColor="#fbbf24" stopOpacity={0} /></linearGradient></defs>
              <CartesianGrid stroke="#334155" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="hour" tick={{ fill: "#8ea1bb", fontSize: 11 }} interval={3} />
              <YAxis tick={{ fill: "#8ea1bb", fontSize: 11 }} unit="%" />
              <Tooltip contentStyle={tooltipStyle} formatter={(value) => [`${value}%`, "Rush-hour records"]} />
              <Area type="monotone" dataKey="rush_hour_percentage" stroke="#fbbf24" strokeWidth={2.5} fill="url(#rushGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartPanel>

        <ChartPanel title="Accident Analysis" subtitle="Accident-report flags in the dataset">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={charts.accident_analysis} layout="vertical" margin={{ top: 8, right: 12, left: 22, bottom: 0 }}>
              <CartesianGrid stroke="#334155" strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" tick={{ fill: "#8ea1bb", fontSize: 11 }} />
              <YAxis type="category" dataKey="label" tick={{ fill: "#8ea1bb", fontSize: 11 }} width={86} />
              <Tooltip contentStyle={tooltipStyle} formatter={(value) => [value, "Records"]} />
              <Bar dataKey="value" fill="#fb7185" radius={[0, 5, 5, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartPanel>
      </section>
    </main>
  );
}

export default Analytics;
