import { useEffect, useMemo, useState } from "react";
import Layout from "../components/Layout";
import api from "../api/axios";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, PieChart, Pie, Cell
} from "recharts";
import {
  TrendingUp, TrendingDown, CalendarDays, CalendarRange,
  BarChart3, RefreshCw, Car, Gauge, Clock, AlertTriangle,
  Download, Activity, Zap, Filter, Lightbulb
} from "lucide-react";

const C = {
  blue: "#3B82F6", green: "#10B981", purple: "#A855F7",
  orange: "#F97316", red: "#EF4444", yellow: "#EAB308"
};

const tooltipStyle = {
  contentStyle: {
    background: "#0F172A", border: "1px solid #334155",
    borderRadius: 10, color: "#F8FAFC"
  },
  labelStyle: { color: "#F8FAFC", fontWeight: 600 }
};

async function fetchData(endpoint) {
  try {
    const response = await api.get(endpoint);
    return response.data?.data || response.data || [];
  } catch (error) {
    console.error(`Failed to fetch ${endpoint}`, error);
    return [];
  }
}

function StatCard({ icon: Icon, title, value, subtitle, color }) {
  return (
    <div
      className="rounded-2xl border p-5 transition-all duration-300 hover:-translate-y-1"
      style={{
        background: `linear-gradient(135deg, ${color}18, #0F172A)`,
        borderColor: `${color}45`
      }}
    >
      <div className="flex items-center justify-between">
        <div className="p-2.5 rounded-xl" style={{ background: `${color}25`, color }}>
          <Icon className="w-5 h-5" />
        </div>
        <Activity className="w-4 h-4" style={{ color: `${color}99` }} />
      </div>
      <p className="text-xs text-slate-400 mt-4">{title}</p>
      <p className="text-2xl font-bold text-white mt-1">{value}</p>
      <p className="text-[11px] text-slate-500 mt-1">{subtitle}</p>
    </div>
  );
}

function SectionHeader({ icon: Icon, title, description, color }) {
  return (
    <div className="mb-5">
      <div className="flex items-center gap-2">
        <div className="p-2 rounded-lg" style={{ background: `${color}20`, color }}>
          <Icon className="w-4 h-4" />
        </div>
        <h2 className="text-sm font-bold text-white">{title}</h2>
      </div>
      {description && <p className="text-xs text-slate-500 mt-2">{description}</p>}
    </div>
  );
}

function EmptyState({ text }) {
  return (
    <div className="h-[300px] flex flex-col items-center justify-center">
      <BarChart3 className="w-10 h-10 text-slate-700 mb-3" />
      <p className="text-sm text-slate-400">{text}</p>
    </div>
  );
}

export default function TrafficTrends() {
  const [daily, setDaily] = useState([]);
  const [monthly, setMonthly] = useState([]);
  const [yearly, setYearly] = useState([]);
  const [activeTrend, setActiveTrend] = useState("daily");
  const [metric, setMetric] = useState("vehicles");
  const [dateRange, setDateRange] = useState("all");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  const loadTrafficTrends = async () => {
    setRefreshing(true);
    try {
      const [d, m, y] = await Promise.all([
        fetchData("/traffic-trends/daily"),
        fetchData("/traffic-trends/monthly"),
        fetchData("/traffic-trends/yearly")
      ]);
      setDaily(Array.isArray(d) ? d : []);
      setMonthly(Array.isArray(m) ? m : []);
      setYearly(Array.isArray(y) ? y : []);
      setLastUpdated(new Date());
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { loadTrafficTrends(); }, []);

  const dailyChart = useMemo(() => daily.map(x => ({
    date: x.date,
    vehicles: Number(x.avg_vehicle_count || 0),
    speed: Number(x.avg_speed || 0),
    delay: Number(x.avg_delay || 0),
    congestion: Number(x.high_congestion_count || 0),
    totalRecords: Number(x.total_records || 0)
  })), [daily]);

  const monthlyChart = useMemo(() => monthly.map(x => ({
    month: x.month_name,
    shortMonth: x.month_name?.substring(0, 3),
    monthLabel: x.month_label,
    vehicles: Number(x.avg_vehicle_count || 0),
    speed: Number(x.avg_speed || 0),
    delay: Number(x.avg_delay || 0),
    congestion: Number(x.high_congestion_count || 0),
    totalRecords: Number(x.total_records || 0)
  })), [monthly]);

  const yearlyChart = useMemo(() => yearly.map(x => ({
    year: String(x.year),
    vehicles: Number(x.avg_vehicle_count || 0),
    speed: Number(x.avg_speed || 0),
    delay: Number(x.avg_delay || 0),
    congestion: Number(x.high_congestion_count || 0),
    totalRecords: Number(x.total_records || 0)
  })), [yearly]);

  // Feature 1: daily range filter.
  const filteredDaily = useMemo(() => {
    if (dateRange === "all") return dailyChart;
    return dailyChart.slice(-Number(dateRange));
  }, [dailyChart, dateRange]);

  const activeData = activeTrend === "daily"
    ? filteredDaily
    : activeTrend === "monthly"
      ? monthlyChart
      : yearlyChart;

  // Feature 2: latest-period comparison for the selected metric.
  const trendInfo = useMemo(() => {
    if (activeData.length < 2) return null;
    const previous = Number(activeData[activeData.length - 2][metric]);
    const current = Number(activeData[activeData.length - 1][metric]);
    if (!Number.isFinite(previous) || !Number.isFinite(current) || previous === 0) return null;
    const percentage = Math.round(((current - previous) / previous) * 100);
    return { percentage, increasing: percentage >= 0 };
  }, [activeData, metric]);

  // Feature 3: congestion distribution using aggregated record counts.
  const congestionData = useMemo(() => {
    const high = activeData.reduce((sum, x) => sum + Math.max(Number(x.congestion) || 0, 0), 0);
    const total = activeData.reduce((sum, x) => sum + Math.max(Number(x.totalRecords) || 0, 0), 0);
    const other = Math.max(total - high, 0);

    // If total_records is unavailable, fall back to the number of periods.
    const fallbackOther = total > 0 ? other : Math.max(activeData.length - high, 0);
    return [
      { name: "High / Severe", value: high },
      { name: "Other", value: fallbackOther }
    ].filter(x => x.value > 0);
  }, [activeData]);

  // Feature 4: automatic insights.
  const insights = useMemo(() => {
    if (!activeData.length) return [];
    const highestTraffic = [...activeData].sort((a, b) => b.vehicles - a.vehicles)[0];
    const highestDelay = [...activeData].sort((a, b) => b.delay - a.delay)[0];
    const lowestSpeed = [...activeData].sort((a, b) => a.speed - b.speed)[0];
    const label = x => x.date || x.monthLabel || x.month || x.year || "Period";
    return [
      {
        icon: Car, color: C.blue, title: "Highest traffic volume",
        text: `${label(highestTraffic)} had ${Math.round(highestTraffic.vehicles).toLocaleString()} average vehicles.`
      },
      {
        icon: Clock, color: C.orange, title: "Highest estimated delay",
        text: `${label(highestDelay)} had an estimated delay of ${highestDelay.delay.toFixed(1)} minutes.`
      },
      {
        icon: Gauge, color: C.red, title: "Lowest average speed",
        text: `${label(lowestSpeed)} recorded ${lowestSpeed.speed.toFixed(1)} km/h average speed.`
      }
    ];
  }, [activeData]);

  const summary = useMemo(() => {
    if (!activeData.length) return { vehicles: 0, speed: 0, delay: 0, congestion: 0 };
    const avg = key => activeData.reduce((s, x) => s + (Number(x[key]) || 0), 0) / activeData.length;
    return {
      vehicles: Math.round(avg("vehicles")),
      speed: Math.round(avg("speed")),
      delay: Number(avg("delay").toFixed(1)),
      congestion: Math.round(avg("congestion"))
    };
  }, [activeData]);

  const exportCSV = () => {
    if (!activeData.length) return;
    const headers = Object.keys(activeData[0]);
    const rows = [
      headers.join(","),
      ...activeData.map(row => headers.map(h => JSON.stringify(row[h] ?? "")).join(","))
    ];
    const blob = new Blob([rows.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `traffic-${activeTrend}-trend.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const metricName = {
    vehicles: "Average Vehicles",
    speed: "Average Speed",
    delay: "Average Delay",
    congestion: "High Congestion"
  }[metric];

  if (loading) {
    return (
      <Layout>
        <div className="p-6 space-y-5">
          <div className="h-8 w-64 bg-slate-800 rounded-lg animate-pulse" />
          <div className="h-4 w-96 bg-slate-800 rounded animate-pulse" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(x => <div key={x} className="h-32 rounded-2xl bg-slate-800/60 animate-pulse" />)}
          </div>
          <div className="h-[420px] rounded-2xl bg-slate-800/60 animate-pulse" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-4 md:p-6 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl" style={{ background: `${C.blue}20`, color: C.blue }}>
                <TrendingUp className="w-6 h-6" />
              </div>
              <h1 className="text-2xl font-bold text-white">Traffic Trend Analysis</h1>
            </div>
            <p className="text-sm text-slate-400 mt-2">
              Analyze traffic patterns across daily, monthly and yearly periods.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {lastUpdated && (
              <div className="hidden sm:block text-right">
                <p className="text-[10px] text-slate-500">Last updated</p>
                <p className="text-xs text-slate-300">{lastUpdated.toLocaleTimeString()}</p>
              </div>
            )}
            <button
              onClick={loadTrafficTrends}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white hover:bg-slate-700 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={Car} title="Average Vehicles" value={summary.vehicles.toLocaleString()} subtitle="Selected period" color={C.blue} />
          <StatCard icon={Gauge} title="Average Speed" value={`${summary.speed} km/h`} subtitle="Selected period" color={C.green} />
          <StatCard icon={Clock} title="Average Delay" value={`${summary.delay} min`} subtitle="Estimated traffic delay" color={C.orange} />
          <StatCard icon={AlertTriangle} title="High Congestion" value={summary.congestion.toLocaleString()} subtitle="Average high/severe records" color={C.red} />
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-blue-400" />
              <div>
                <p className="text-xs text-slate-500 uppercase font-semibold">Analysis Controls</p>
                <p className="text-sm text-white font-semibold mt-1">Choose period and metric</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {[
                ["daily", "Daily", CalendarDays],
                ["monthly", "Monthly", CalendarRange],
                ["yearly", "Yearly", BarChart3]
              ].map(([key, label, Icon]) => (
                <button
                  key={key}
                  onClick={() => setActiveTrend(key)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold border ${activeTrend === key
                    ? "bg-blue-600 border-blue-500 text-white"
                    : "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700"
                    }`}
                >
                  <Icon className="w-4 h-4" /> {label}
                </button>
              ))}

              {activeTrend === "daily" && (
                <select
                  value={dateRange}
                  onChange={e => setDateRange(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-200"
                >
                  <option value="all">All days</option>
                  <option value="7">Last 7 days</option>
                  <option value="14">Last 14 days</option>
                  <option value="30">Last 30 days</option>
                </select>
              )}

              <select
                value={metric}
                onChange={e => setMetric(e.target.value)}
                className="px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-200"
              >
                <option value="vehicles">Vehicles</option>
                <option value="speed">Speed</option>
                <option value="delay">Delay</option>
                <option value="congestion">Congestion</option>
              </select>
            </div>
          </div>
        </div>

        {trendInfo && (
          <div className="rounded-2xl border p-4 flex items-center justify-between"
            style={{
              background: trendInfo.increasing ? `${C.red}10` : `${C.green}10`,
              borderColor: trendInfo.increasing ? `${C.red}35` : `${C.green}35`
            }}
          >
            <div className="flex items-center gap-3">
              {trendInfo.increasing
                ? <TrendingUp className="w-5 h-5" style={{ color: C.red }} />
                : <TrendingDown className="w-5 h-5" style={{ color: C.green }} />}
              <div>
                <p className="text-xs text-slate-400">Latest period comparison</p>
                <p className="text-sm text-white font-semibold">
                  {metricName} has {trendInfo.increasing ? "increased" : "decreased"} compared with the previous period.
                </p>
              </div>
            </div>
            <div className="text-xl font-bold" style={{ color: trendInfo.increasing ? C.red : C.green }}>
              {trendInfo.increasing ? "+" : ""}{trendInfo.percentage}%
            </div>
          </div>
        )}

        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-5">
            <SectionHeader
              icon={activeTrend === "daily" ? CalendarDays : activeTrend === "monthly" ? CalendarRange : BarChart3}
              title={`${activeTrend[0].toUpperCase()}${activeTrend.slice(1)} Traffic Trend`}
              description={`Track ${metricName.toLowerCase()} over time.`}
              color={activeTrend === "daily" ? C.blue : activeTrend === "monthly" ? C.purple : C.orange}
            />
            <button
              onClick={exportCSV}
              className="self-start flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-300 hover:text-white"
            >
              <Download className="w-3.5 h-3.5" /> Export CSV
            </button>
          </div>

          {!activeData.length ? (
            <EmptyState text={`No ${activeTrend} traffic data available.`} />
          ) : (
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                {activeTrend === "monthly" ? (
                  <BarChart data={activeData}>
                    <CartesianGrid stroke="#1E293B" strokeDasharray="3 3" />
                    <XAxis dataKey="shortMonth" tick={{ fill: "#94A3B8", fontSize: 11 }} />
                    <YAxis tick={{ fill: "#94A3B8", fontSize: 11 }} />
                    <Tooltip {...tooltipStyle} formatter={(v) => [Number(v).toFixed(1), metricName]} />
                    <Legend />
                    <Bar dataKey={metric} name={metricName} fill={C.purple} radius={[6, 6, 0, 0]} />
                  </BarChart>
                ) : activeTrend === "yearly" ? (
                  <LineChart data={activeData}>
                    <CartesianGrid stroke="#1E293B" strokeDasharray="3 3" />
                    <XAxis dataKey="year" tick={{ fill: "#94A3B8", fontSize: 11 }} />
                    <YAxis tick={{ fill: "#94A3B8", fontSize: 11 }} />
                    <Tooltip {...tooltipStyle} formatter={(v) => [Number(v).toFixed(1), metricName]} />
                    <Legend />
                    <Line type="monotone" dataKey={metric} name={metricName} stroke={C.orange} strokeWidth={3} dot={{ r: 5 }} />
                  </LineChart>
                ) : (
                  <AreaChart data={activeData}>
                    <defs>
                      <linearGradient id="trafficTrendGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={C.blue} stopOpacity={0.4} />
                        <stop offset="95%" stopColor={C.blue} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="#1E293B" strokeDasharray="3 3" />
                    <XAxis dataKey="date" tick={{ fill: "#94A3B8", fontSize: 11 }} tickFormatter={v => v?.slice(5)} />
                    <YAxis tick={{ fill: "#94A3B8", fontSize: 11 }} />
                    <Tooltip {...tooltipStyle} formatter={(v) => [Number(v).toFixed(1), metricName]} />
                    <Legend />
                    <Area type="monotone" dataKey={metric} name={metricName} stroke={C.blue} strokeWidth={3} fill="url(#trafficTrendGradient)" />
                  </AreaChart>
                )}
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
            <SectionHeader
              icon={AlertTriangle}
              title="Congestion Distribution"
              description="High/severe congestion compared with other periods."
              color={C.red}
            />
            {congestionData.length ? (
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={congestionData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={95}
                      paddingAngle={4}
                      label
                    >
                      {congestionData.map((_, i) => (
                        <Cell key={i} fill={i === 0 ? C.red : C.green} />
                      ))}
                    </Pie>
                    <Tooltip {...tooltipStyle} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : <EmptyState text="No congestion distribution data available." />}
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
            <SectionHeader
              icon={Lightbulb}
              title="Traffic Insights"
              description="Automatic observations from the selected period."
              color={C.yellow}
            />
            <div className="space-y-3">
              {insights.map((item, i) => {
                const Icon = item.icon;
                return (
                  <div key={i} className="rounded-xl border border-slate-800 bg-slate-950/40 p-4">
                    <div className="flex gap-3">
                      <div className="p-2 rounded-lg h-fit" style={{ background: `${item.color}18`, color: item.color }}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-white">{item.title}</p>
                        <p className="text-xs text-slate-400 mt-1 leading-5">{item.text}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
              {!insights.length && <EmptyState text="Not enough data to generate insights." />}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
            <div className="flex items-center gap-2 mb-4"><Zap className="w-4 h-4 text-orange-400" /><h3 className="text-sm font-bold text-white">Dataset Coverage</h3></div>
            <p className="text-2xl font-bold text-white">{daily.length}</p>
            <p className="text-xs text-slate-500 mt-1">Days of traffic records</p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
            <div className="flex items-center gap-2 mb-4"><CalendarRange className="w-4 h-4 text-purple-400" /><h3 className="text-sm font-bold text-white">Monthly Coverage</h3></div>
            <p className="text-2xl font-bold text-white">{monthly.length}</p>
            <p className="text-xs text-slate-500 mt-1">Months available</p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
            <div className="flex items-center gap-2 mb-4"><BarChart3 className="w-4 h-4 text-blue-400" /><h3 className="text-sm font-bold text-white">Yearly Coverage</h3></div>
            <p className="text-2xl font-bold text-white">{yearly.length}</p>
            <p className="text-xs text-slate-500 mt-1">Years available</p>
          </div>
        </div>

        <div className="flex justify-between px-1">
          <p className="text-[11px] text-slate-600">TrafficVision AI · Traffic Trend Analytics</p>
          <p className="text-[11px] text-slate-600">Source: traffic_data</p>
        </div>
      </div>
    </Layout>
  );
}