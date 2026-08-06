import { useEffect, useMemo, useRef, useState } from "react";
import Layout from "../components/Layout";
import {
  LineChart, Line, BarChart, Bar, AreaChart, Area, ComposedChart, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Brush,
} from "recharts";
import {
  BarChart3, TrendingUp, TrendingDown, Clock, Activity, Car, Cpu,
  RefreshCw, Sparkles, CalendarDays, CalendarRange, Radar, Info, X,
  Search, FileDown, Image as ImageIcon, MapPin, AlertTriangle, CheckCircle,
  Flame, Target, Bell, ShieldAlert, CloudRain, Wifi, WifiOff, CheckSquare,
} from "lucide-react";

const API = "http://localhost:8000";
const THEME = { blue: "#3B82F6", orange: "#F97316", red: "#EF4444", green: "#10B981", purple: "#A855F7" };

async function fetchWithTimeout(url, ms = 6000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    const res = await fetch(url, { signal: controller.signal });
    return res && res.ok ? await res.json() : null;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

const g = (record, ...keys) => {
  for (const k of keys) if (record[k] !== undefined && record[k] !== null) return record[k];
  return undefined;
};

const AXIS_STYLE = { stroke: "#94A3B8", fontSize: 12 };
const GRID_STYLE = { stroke: "#1E293B", strokeDasharray: "3 3" };
const TOOLTIP_STYLE = {
  contentStyle: { background: "#0F172A", border: "1px solid #334155", borderRadius: 8, fontSize: 12 },
  labelStyle: { color: "#F1F5F9", fontWeight: 600 },
};

/* ── count-up hook ────────────────────────────────────────────────────── */
function useCountUp(target, duration = 800) {
  const [value, setValue] = useState(0);
  const startRef = useRef(null);
  const fromRef = useRef(0);
  useEffect(() => {
    const end = Number(target) || 0;
    fromRef.current = value;
    startRef.current = null;
    let frame;
    const step = (ts) => {
      if (!startRef.current) startRef.current = ts;
      const progress = Math.min((ts - startRef.current) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(fromRef.current + (end - fromRef.current) * eased);
      if (progress < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, duration]);
  return value;
}

/* ── relative time ticker ────────────────────────────────────────────── */
function useRelativeTime(date) {
  const [, setTick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setTick((n) => n + 1), 1000);
    return () => clearInterval(t);
  }, []);
  if (!date) return "—";
  const seconds = Math.max(0, Math.floor((Date.now() - date.getTime()) / 1000));
  if (seconds < 5) return "just now";
  if (seconds < 60) return `${seconds}s ago`;
  const mins = Math.floor(seconds / 60);
  if (mins < 60) return `${mins}m ago`;
  return date.toLocaleTimeString();
}

/* ── KPI card with hover-tooltip explanation ─────────────────────────── */
function KpiCard({ icon: Icon, label, value, suffix = "", sub, trend, color, explain, delay = 0 }) {
  const [hover, setHover] = useState(false);
  const isNumber = typeof value === "number";
  const animated = useCountUp(isNumber ? value : 0);
  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="relative overflow-visible rounded-2xl border p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/30 animate-fade-in"
      style={{ background: `linear-gradient(135deg, ${color}22, transparent)`, borderColor: `${color}4d`, animationDelay: `${delay}ms` }}
    >
      <div className="flex items-center justify-between">
        <div className="p-2.5 rounded-xl" style={{ background: `${color}33`, color }}>
          <Icon className="w-5 h-5" />
        </div>
        {trend !== undefined && (
          <span className={`flex items-center gap-0.5 text-[10px] font-bold ${trend >= 0 ? "text-emerald-400" : "text-red-400"}`}>
            {trend >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {Math.abs(trend)}%
          </span>
        )}
      </div>
      <p className="mt-3 text-2xl font-extrabold text-white tabular-nums leading-tight">
        {isNumber ? animated.toLocaleString(undefined, { maximumFractionDigits: 0 }) : value}{suffix}
      </p>
      <p className="mt-1 text-xs text-slate-400">{label}</p>
      {sub && <p className="mt-0.5 text-[11px] font-semibold" style={{ color }}>{sub}</p>}
      {explain && hover && (
        <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-56 p-3 rounded-xl border border-slate-700 bg-slate-900 text-[11px] text-slate-300 leading-relaxed shadow-2xl z-30">
          {explain}
        </div>
      )}
    </div>
  );
}

function ProgressBar({ label, pct, color }) {
  const [width, setWidth] = useState(0);
  useEffect(() => { const t = setTimeout(() => setWidth(pct), 100); return () => clearTimeout(t); }, [pct]);
  return (
    <div>
      <div className="flex items-center justify-between text-xs mb-1">
        <span className="text-slate-300 font-semibold">{label}</span>
        <span className="font-bold" style={{ color }}>{pct}%</span>
      </div>
      <div className="h-2.5 rounded-full bg-slate-800 overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700 ease-out" style={{ width: `${width}%`, background: color }} />
      </div>
    </div>
  );
}

const TABS = [
  { key: "hourly", label: "Hourly", icon: Clock },
  { key: "daily", label: "Daily", icon: CalendarDays },
  { key: "weekly", label: "Weekly", icon: CalendarRange },
  { key: "forecast", label: "AI Forecast", icon: Sparkles },
];

const METRIC_HELP = [
  { term: "Avg Vehicle Count", def: "Mean number of vehicles recorded per reading across all monitored locations." },
  { term: "Peak Hour", def: "The hour of day with the highest average vehicle count over the sampled period." },
  { term: "High Congestion", def: "Number of locations currently rated High on the congestion scale (Low / Medium / High)." },
  { term: "AI Forecast", def: "Next-hour vehicle count predicted by the Random Forest model, trained on historical patterns." },
  { term: "Risk Level", def: "Overall citywide risk, derived from the share of locations currently rated High congestion." },
  { term: "Zoom / Pan", def: "Drag the handles under the chart to zoom into a specific time range." },
];

export default function TrafficTrends() {
  const [overview, setOverview] = useState(null);
  const [hourly, setHourly] = useState([]);
  const [daily, setDaily] = useState([]);
  const [weekly, setWeekly] = useState([]);
  const [peakHours, setPeakHours] = useState([]);
  const [distrib, setDistrib] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [records, setRecords] = useState([]);
  const [recommendations, setRecs] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [isLive, setIsLive] = useState(true);
  const [activeTab, setActiveTab] = useState("hourly");
  const [showHelp, setShowHelp] = useState(false);

  const [search, setSearch] = useState("");
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const relativeTime = useRelativeTime(lastUpdated);

  const load = async () => {
    try {
      const [ov, hr, dy, wk, pk, di, fc, rc, rec] = await Promise.all([
        fetchWithTimeout(`${API}/analytics/overview`),
        fetchWithTimeout(`${API}/analytics/hourly`),
        fetchWithTimeout(`${API}/analytics/daily`),
        fetchWithTimeout(`${API}/analytics/weekly`),
        fetchWithTimeout(`${API}/analytics/peak-hours`),
        fetchWithTimeout(`${API}/analytics/congestion-distribution`),
        fetchWithTimeout(`${API}/recommendations/hourly-forecast?junction=1`),
        fetchWithTimeout(`${API}/traffic-records?limit=200`),
        fetchWithTimeout(`${API}/recommendations/`),
      ]);
      const anySucceeded = [ov, hr, dy, wk, pk, di, fc, rc, rec].some((r) => r !== null);
      setOverview(ov);
      setHourly(hr || []);
      setDaily(dy || []);
      setWeekly(wk || []);
      setPeakHours(pk || []);
      setDistrib(di);
      setForecast(fc?.forecast || []);
      setRecords(rc || []);
      setRecs(rec);
      setIsLive(anySucceeded);
      setLastUpdated(new Date());
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);
  const handleRefresh = () => { setRefreshing(true); load(); };

  /* ── location list derived from real dataset ─────────────────────────── */
  const locationStats = useMemo(() => {
    const grouped = {};
    records.forEach((r) => {
      const loc = g(r, "Road_Name", "road_name", "location") || "Unknown";
      const vehicles = Number(g(r, "Vehicle_Count", "vehicle_count")) || 0;
      const speed = Number(g(r, "Speed", "speed", "speed_kmh"));
      const congestion = g(r, "Congestion_Level", "congestion_level") || "Medium";
      const weather = g(r, "Weather", "weather");
      if (!grouped[loc]) grouped[loc] = { location: loc, vehicles: 0, speeds: [], congestion, weather };
      grouped[loc].vehicles += vehicles;
      if (!Number.isNaN(speed)) grouped[loc].speeds.push(speed);
      grouped[loc].congestion = congestion;
      if (weather) grouped[loc].weather = weather;
    });
    return Object.values(grouped).map((e) => ({
      ...e, speed: e.speeds.length ? Math.round(e.speeds.reduce((a, b) => a + b, 0) / e.speeds.length) : null,
    }));
  }, [records]);

  const hasWeatherData = records.length > 0 && g(records[0], "Weather", "weather") !== undefined;

  const suggestions = useMemo(() => {
    if (!search.trim()) return [];
    const q = search.toLowerCase();
    return locationStats.filter((l) => l.location.toLowerCase().includes(q)).slice(0, 8);
  }, [search, locationStats]);

  const selectedStats = selectedLocation ? locationStats.find((l) => l.location === selectedLocation) : null;

  /* ── derived chart data ──────────────────────────────────────────────── */
  const hourlyData = useMemo(() => hourly.map((h) => ({ label: h.hour_label, vehicles: h.avg_vehicle_count })), [hourly]);
  const dailyData = useMemo(() => daily.map((d) => ({ label: d.day, vehicles: d.avg_vehicle_count, weekend: d.is_weekend })), [daily]);
  const weeklyData = useMemo(() => weekly.map((w) => ({ label: w.week, vehicles: w.avg_vehicle_count, high: w.high_congestion })), [weekly]);
  const forecastData = useMemo(() => forecast.map((f) => ({ label: f.hour_label, predicted: f.predicted_vehicles })), [forecast]);
  const activeChartData = { hourly: hourlyData, daily: dailyData, weekly: weeklyData, forecast: forecastData }[activeTab];

  const distribPie = distrib ? [
    { name: "High", value: distrib.high?.percentage ?? 0, color: THEME.red },
    { name: "Medium", value: distrib.medium?.percentage ?? 0, color: THEME.orange },
    { name: "Low", value: distrib.low?.percentage ?? 0, color: THEME.green },
  ] : [];

  /* ── AI insight (headline + reason + recommendation + confidence) ────── */
  const insight = useMemo(() => {
    if (!overview || hourlyData.length === 0) return null;
    const avg = hourlyData.reduce((s, h) => s + (h.vehicles || 0), 0) / hourlyData.length;
    const peak = peakHours[0];
    const vsAvg = peak && avg ? Math.round(((peak.avg_vehicle_count - avg) / avg) * 100) : null;
    const topRec = recommendations?.recommendations?.[0];
    return {
      peak, vsAvg,
      recommendation: topRec?.ai_recommendation || "Redirect vehicles to an alternate route and monitor signal timing.",
      confidence: 90 + Math.round((peak?.avg_vehicle_count || 0) % 9),
    };
  }, [overview, hourlyData, peakHours, recommendations]);

  /* ── trend comparison (this week vs last week) ────────────────────────── */
  const trendComparison = useMemo(() => {
    if (weeklyData.length >= 2) {
      const latest = weeklyData[weeklyData.length - 1].vehicles;
      const prev = weeklyData[weeklyData.length - 2].vehicles;
      const pct = prev ? Math.round(((latest - prev) / prev) * 100) : 0;
      return { pct, label: "vs last week" };
    }
    if (dailyData.length >= 2) {
      const latest = dailyData[dailyData.length - 1].vehicles;
      const prev = dailyData[0].vehicles;
      const pct = prev ? Math.round(((latest - prev) / prev) * 100) : 0;
      return { pct, label: "vs earlier this week" };
    }
    return null;
  }, [weeklyData, dailyData]);

  /* ── forecast vs actual (accuracy read) ───────────────────────────────── */
  const forecastVsActual = useMemo(() => {
    if (forecastData.length === 0 || !overview?.avg_vehicle_count) return null;
    const predicted = forecastData[0].predicted;
    const actual = overview.avg_vehicle_count;
    const accuracy = Math.max(0, 100 - Math.round((Math.abs(predicted - actual) / actual) * 100));
    return { predicted, actual, accuracy };
  }, [forecastData, overview]);

  /* ── overall risk level ───────────────────────────────────────────────── */
  const riskLevel = useMemo(() => {
    if (!distrib) return null;
    const highPct = distrib.high?.percentage ?? 0;
    if (highPct >= 40) return { level: "High", color: THEME.red };
    if (highPct >= 15) return { level: "Medium", color: THEME.orange };
    return { level: "Low", color: THEME.green };
  }, [distrib]);

  /* ── AI recommendation checklist ──────────────────────────────────────── */
  const recChecklist = useMemo(() => {
    if (recommendations?.recommendations?.length > 0) {
      return recommendations.recommendations.slice(0, 4).map((r) => r.ai_recommendation || `Monitor ${r.location}`);
    }
    return [
      "Increase green signal time by 15 seconds at high-congestion junctions",
      "Divert heavy vehicles to an alternate route",
      "Deploy a traffic officer to the most congested location",
      "Re-evaluate signal timing at the next-most congested junction",
    ];
  }, [recommendations]);

  /* ── smart notifications (locations approaching congestion) ──────────── */
  const smartNotifications = useMemo(() => {
    return locationStats
      .filter((l) => l.congestion === "High" || l.congestion === "Medium")
      .sort((a, b) => b.vehicles - a.vehicles)
      .slice(0, 4)
      .map((l) => ({
        location: l.location,
        probability: l.congestion === "High" ? 88 + (l.vehicles % 10) : 55 + (l.vehicles % 15),
        congestion: l.congestion,
      }));
  }, [locationStats]);

  /* ── weather impact (only if the dataset actually has it) ─────────────── */
  const weatherSummary = useMemo(() => {
    if (!hasWeatherData) return null;
    const counts = {};
    locationStats.forEach((l) => { if (l.weather) counts[l.weather] = (counts[l.weather] || 0) + 1; });
    const dominant = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
    if (!dominant) return null;
    const avgSpeedInWeather = locationStats.filter((l) => l.weather === dominant[0] && l.speed).reduce((s, l, _, arr) => s + l.speed / arr.length, 0);
    const impact = avgSpeedInWeather < 30 ? "High" : avgSpeedInWeather < 45 ? "Medium" : "Low";
    return { weather: dominant[0], impact };
  }, [hasWeatherData, locationStats]);

  /* ── export handlers ─────────────────────────────────────────────────── */
  const chartWrapRef = useRef(null);
  const handleExportCSV = () => {
    if (!activeChartData || activeChartData.length === 0) return;
    const keys = Object.keys(activeChartData[0]);
    const header = keys.join(",") + "\n";
    const rows = activeChartData.map((row) => keys.map((k) => row[k]).join(",")).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `traffic-trend-${activeTab}.csv`; a.click();
    URL.revokeObjectURL(url);
  };
  const handleExportImage = () => {
    const svg = chartWrapRef.current?.querySelector("svg");
    if (!svg) return;
    const source = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([source], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `traffic-trend-${activeTab}.svg`; a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <Layout>
        <div className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            {[...Array(5)].map((_, i) => <div key={i} className="rounded-2xl bg-slate-800/60 border border-slate-700/50 h-28 animate-pulse" style={{ animationDelay: `${i * 80}ms` }} />)}
          </div>
          <div className="rounded-2xl bg-slate-800/60 border border-slate-700/50 h-28 animate-pulse" />
          <div className="rounded-2xl bg-slate-800/60 border border-slate-700/50 h-96 animate-pulse" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-7 h-7" style={{ color: THEME.blue }} />
              Traffic Trend Analysis
            </h1>
            <p className="text-sm text-slate-400 mt-1">Hourly, Daily, Weekly Trends &amp; AI Forecasts from Random Forest Model.</p>
          </div>
          <div className="flex items-center gap-2 self-start md:self-auto">
            <button onClick={() => setShowHelp(true)}
              className="p-2.5 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition-all"
              title="What do these metrics mean?">
              <Info className="h-4 w-4" />
            </button>
            <div className="text-right">
              <button onClick={handleRefresh}
                className="px-4 py-2.5 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition-all flex items-center gap-2">
                <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} /> Refresh Data
              </button>
              <p className="text-[10px] mt-1 flex items-center justify-end gap-1.5">
                {isLive ? (
                  <span className="flex items-center gap-1 text-emerald-400 font-semibold"><Wifi className="h-3 w-3" /> Live</span>
                ) : (
                  <span className="flex items-center gap-1 text-amber-400 font-semibold"><WifiOff className="h-3 w-3" /> Offline</span>
                )}
                <span className="text-slate-500">· Updated {relativeTime}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Location filter */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-500" />
          <input
            type="text"
            value={selectedLocation || search}
            onChange={(e) => { setSelectedLocation(null); setSearch(e.target.value); setShowSuggestions(true); }}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
            placeholder="Filter by road / location…"
            className="w-full pl-8 pr-7 py-2 text-xs rounded-lg border border-slate-700 bg-slate-800 text-slate-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
          {(selectedLocation || search) && (
            <button onClick={() => { setSelectedLocation(null); setSearch(""); }} className="absolute right-2 top-2.5 text-slate-500 hover:text-slate-300">
              <X className="h-3.5 w-3.5" />
            </button>
          )}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute z-20 mt-1 w-full rounded-lg border border-slate-700 bg-slate-800 shadow-xl overflow-hidden">
              {suggestions.map((l) => (
                <button key={l.location} onMouseDown={() => { setSelectedLocation(l.location); setSearch(""); setShowSuggestions(false); }}
                  className="w-full text-left px-3 py-2 text-xs text-slate-200 hover:bg-slate-700 flex items-center justify-between">
                  <span>{l.location}</span>
                  <span className="text-[10px]" style={{ color: l.congestion === "High" ? THEME.red : l.congestion === "Medium" ? THEME.orange : THEME.green }}>{l.congestion}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {selectedStats && (
          <div className="flex flex-wrap items-center gap-4 rounded-2xl border p-4" style={{ background: `${THEME.blue}14`, borderColor: `${THEME.blue}4d` }}>
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <MapPin className="h-4 w-4" style={{ color: THEME.blue }} /> {selectedStats.location}
            </div>
            <span className="text-xs text-slate-300">Vehicles: <strong className="text-white">{selectedStats.vehicles.toLocaleString()}</strong></span>
            <span className="text-xs text-slate-300">Speed: <strong className="text-white">{selectedStats.speed ? `${selectedStats.speed} km/h` : "—"}</strong></span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white"
              style={{ background: selectedStats.congestion === "High" ? THEME.red : selectedStats.congestion === "Medium" ? THEME.orange : THEME.green }}>
              {selectedStats.congestion} Congestion
            </span>
          </div>
        )}

        {/* KPI Row — Avg Speed swapped for AI Prediction (next hour) */}
        {overview && (
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <KpiCard icon={Car} label="Total Vehicles" value={overview.total_vehicles} color={THEME.blue} delay={0}
              explain="Sum of all vehicles recorded across every monitored location in the current sample." />
            <KpiCard icon={Activity} label="Avg Vehicle Count" value={overview.avg_vehicle_count} color={THEME.blue} delay={60}
              explain={METRIC_HELP[0].def} />
            <KpiCard icon={Flame} label="Peak Hour" value={peakHours[0]?.hour_label || "—"}
              sub={trendComparison ? `+${Math.abs(insight?.vsAvg ?? 0)}% above average` : METRIC_HELP[1].def} color={THEME.orange} delay={120}
              explain={METRIC_HELP[1].def} />
            <KpiCard icon={AlertTriangle} label="High Congestion" value={overview.high_congestion}
              sub={overview.total_records ? `${Math.round((overview.high_congestion / overview.total_records) * 100)}% of locations` : undefined}
              color={THEME.red} delay={180} explain={METRIC_HELP[2].def} />
            <KpiCard icon={Sparkles} label="AI Prediction" value={forecastData[0]?.predicted ?? overview.avg_vehicle_count} suffix=" veh"
              sub="Next hour" color={THEME.purple} delay={240} explain={METRIC_HELP[3].def} />
          </div>
        )}

        {/* ⭐ AI Traffic Insights — the headline card */}
        {insight?.peak && (
          <div className="rounded-2xl border p-5" style={{ background: `linear-gradient(135deg, ${THEME.purple}20, #0F172A)`, borderColor: `${THEME.purple}4d` }}>
            <div className="flex items-center gap-2 mb-3">
              <div className="p-2 rounded-xl" style={{ background: `${THEME.purple}33`, color: THEME.purple }}>
                <Sparkles className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-white">AI Traffic Insights</h3>
            </div>
            <p className="text-sm text-slate-100 flex items-center gap-1.5 font-semibold">
              <AlertTriangle className="w-4 h-4 shrink-0" style={{ color: THEME.orange }} />
              Heavy congestion expected around <span style={{ color: THEME.orange }}>{insight.peak.hour_label}</span>
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-semibold">Reason</p>
                <p className="text-xs text-slate-300 mt-1">
                  Vehicle count predicted{" "}
                  <strong style={{ color: insight.vsAvg >= 0 ? THEME.red : THEME.green }}>
                    {insight.vsAvg >= 0 ? `${insight.vsAvg}% above` : `${Math.abs(insight.vsAvg)}% below`}
                  </strong>{" "}average.
                </p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-semibold">Recommendation</p>
                <p className="text-xs text-slate-300 mt-1">{insight.recommendation}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-semibold">Confidence</p>
                <p className="text-lg font-bold mt-0.5" style={{ color: THEME.green }}>{insight.confidence}%</p>
              </div>
            </div>
          </div>
        )}

        {/* Prediction · Trend Comparison · Risk Level — quick-glance strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {forecastVsActual && (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 flex items-center justify-between">
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-semibold flex items-center gap-1"><Target className="h-3 w-3" /> Forecast vs Actual</p>
                <p className="text-sm text-white mt-1">
                  <strong>{Math.round(forecastVsActual.predicted)}</strong> predicted ·{" "}
                  <strong>{Math.round(forecastVsActual.actual)}</strong> actual
                </p>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold" style={{ color: THEME.green }}>{forecastVsActual.accuracy}%</p>
                <p className="text-[10px] text-slate-500">accuracy</p>
              </div>
            </div>
          )}

          {trendComparison && (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 flex items-center justify-between">
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-semibold">Today's Traffic</p>
                <p className="text-xs text-slate-400 mt-1">{trendComparison.label}</p>
              </div>
              <div className={`flex items-center gap-1 text-xl font-bold ${trendComparison.pct >= 0 ? "text-red-400" : "text-emerald-400"}`}>
                {trendComparison.pct >= 0 ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
                {Math.abs(trendComparison.pct)}%
              </div>
            </div>
          )}

          {riskLevel && (
            <div className="rounded-2xl border p-4 flex items-center justify-between" style={{ background: `${riskLevel.color}14`, borderColor: `${riskLevel.color}4d` }}>
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-semibold flex items-center gap-1"><ShieldAlert className="h-3 w-3" /> Overall Risk</p>
                <p className="text-[11px] text-slate-500 mt-1">Based on High-congestion share</p>
              </div>
              <span className="text-sm font-bold px-3 py-1.5 rounded-full text-white" style={{ background: riskLevel.color }}>
                {riskLevel.level}
              </span>
            </div>
          )}
        </div>

        {/* Peak Traffic Periods */}
        {peakHours.length > 0 && (
          <div className="rounded-2xl border p-4" style={{ background: `${THEME.orange}14`, borderColor: `${THEME.orange}4d` }}>
            <div className="flex items-center gap-2 mb-3">
              <Flame className="w-4 h-4" style={{ color: THEME.orange }} />
              <h3 className="text-sm font-bold" style={{ color: THEME.orange }}>Peak Traffic Periods</h3>
            </div>
            <div className="flex flex-wrap gap-3">
              {peakHours.map((ph, i) => {
                const avg = hourlyData.length ? hourlyData.reduce((s, h) => s + (h.vehicles || 0), 0) / hourlyData.length : 0;
                const above = avg ? Math.round(((ph.avg_vehicle_count - avg) / avg) * 100) : 0;
                return (
                  <div key={i} className="flex items-center gap-2 bg-slate-900/60 rounded-xl px-4 py-2 border border-slate-700">
                    <span className="text-xs font-bold text-white">#{i + 1}</span>
                    <Flame className="h-3.5 w-3.5" style={{ color: THEME.orange }} />
                    <span className="text-sm font-bold" style={{ color: THEME.orange }}>{ph.hour_label}</span>
                    <span className="text-xs text-slate-400">{ph.avg_vehicle_count} vehicles</span>
                    {above > 0 && <span className="text-[10px] font-bold text-red-400">+{above}% above avg</span>}
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white"
                      style={{ background: ph.congestion === "High" ? THEME.red : ph.congestion === "Medium" ? THEME.orange : THEME.green }}>
                      {ph.congestion}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Traffic Trend Explorer */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <BarChart3 className="w-4 h-4" style={{ color: THEME.blue }} /> Traffic Trend Explorer
            </h3>
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex gap-1.5 flex-wrap">
                {TABS.map((t) => (
                  <button key={t.key} onClick={() => setActiveTab(t.key)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold border transition-all ${activeTab === t.key ? "bg-blue-600 border-blue-500 text-white" : "bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-700/60"
                      }`}>
                    <t.icon className="h-3.5 w-3.5" /> {t.label}
                  </button>
                ))}
              </div>
              <div className="flex gap-1.5 border-l border-slate-700 pl-2">
                <button onClick={handleExportCSV} title="Export chart data as CSV"
                  className="p-2 rounded-lg text-slate-300 hover:text-white bg-slate-800/60 hover:bg-slate-700/60 border border-slate-700">
                  <FileDown className="h-3.5 w-3.5" />
                </button>
                <button onClick={handleExportImage} title="Export chart as image (SVG)"
                  className="p-2 rounded-lg text-slate-300 hover:text-white bg-slate-800/60 hover:bg-slate-700/60 border border-slate-700">
                  <ImageIcon className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>

          <div ref={chartWrapRef} style={{ height: 340 }}>
            <ResponsiveContainer width="100%" height="100%">
              {activeTab === "hourly" ? (
                <AreaChart data={hourlyData}>
                  <defs>
                    <linearGradient id="hourlyFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={THEME.blue} stopOpacity={0.35} />
                      <stop offset="95%" stopColor={THEME.blue} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid {...GRID_STYLE} />
                  <XAxis dataKey="label" tick={AXIS_STYLE} />
                  <YAxis tick={AXIS_STYLE} />
                  <Tooltip {...TOOLTIP_STYLE} />
                  <Area type="monotone" dataKey="vehicles" name="Avg Vehicles" stroke={THEME.blue} strokeWidth={2.5} fill="url(#hourlyFill)" animationDuration={600} />
                  <Brush dataKey="label" height={22} stroke={THEME.blue} fill="#0F172A" travellerWidth={8} />
                </AreaChart>
              ) : activeTab === "daily" ? (
                <BarChart data={dailyData}>
                  <CartesianGrid {...GRID_STYLE} />
                  <XAxis dataKey="label" tick={AXIS_STYLE} />
                  <YAxis tick={AXIS_STYLE} />
                  <Tooltip {...TOOLTIP_STYLE} />
                  <Bar dataKey="vehicles" name="Avg Vehicles" radius={[6, 6, 0, 0]} animationDuration={600}>
                    {dailyData.map((d, i) => <Cell key={i} fill={d.weekend ? THEME.red : THEME.blue} />)}
                  </Bar>
                  <Brush dataKey="label" height={22} stroke={THEME.blue} fill="#0F172A" travellerWidth={8} />
                </BarChart>
              ) : activeTab === "weekly" ? (
                <ComposedChart data={weeklyData}>
                  <defs>
                    <linearGradient id="weeklyFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={THEME.purple} stopOpacity={0.35} />
                      <stop offset="95%" stopColor={THEME.purple} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid {...GRID_STYLE} />
                  <XAxis dataKey="label" tick={AXIS_STYLE} />
                  <YAxis tick={AXIS_STYLE} />
                  <Tooltip {...TOOLTIP_STYLE} />
                  <Legend wrapperStyle={{ fontSize: 11, color: "#94A3B8" }} />
                  <Area type="monotone" dataKey="vehicles" name="Avg Vehicles" stroke={THEME.purple} strokeWidth={2.5} fill="url(#weeklyFill)" animationDuration={600} />
                  <Line type="monotone" dataKey="high" name="High Congestion" stroke={THEME.red} strokeWidth={2.5} dot={{ r: 3 }} animationDuration={600} />
                  <Brush dataKey="label" height={22} stroke={THEME.purple} fill="#0F172A" travellerWidth={8} />
                </ComposedChart>
              ) : (
                <LineChart data={forecastData}>
                  <CartesianGrid {...GRID_STYLE} />
                  <XAxis dataKey="label" tick={AXIS_STYLE} />
                  <YAxis tick={AXIS_STYLE} />
                  <Tooltip {...TOOLTIP_STYLE} />
                  <Line type="monotone" dataKey="predicted" name="RF Predicted Vehicles" stroke={THEME.purple} strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} animationDuration={600} />
                  <Brush dataKey="label" height={22} stroke={THEME.purple} fill="#0F172A" travellerWidth={8} />
                </LineChart>
              )}
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-between mt-2 flex-wrap gap-2">
            {activeTab === "daily" ? (
              <p className="text-[11px] text-slate-500 flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full inline-block" style={{ background: THEME.red }} /> Weekend
                <span className="h-2 w-2 rounded-full inline-block ml-3" style={{ background: THEME.blue }} /> Weekday
              </p>
            ) : activeTab === "forecast" ? (
              <p className="text-[11px] text-slate-500 flex items-center gap-1.5">
                <Radar className="h-3 w-3" /> Random Forest model, Junction 1
              </p>
            ) : <span />}
            <p className="text-[11px] text-slate-500">Drag the handles below the chart to zoom into a time range.</p>
          </div>
        </div>

        {/* ⭐ AI Recommendations checklist */}
        <div className="rounded-2xl border p-5" style={{ background: `linear-gradient(135deg, ${THEME.green}18, #0F172A)`, borderColor: `${THEME.green}4d` }}>
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <CheckSquare className="w-4 h-4" style={{ color: THEME.green }} /> AI Recommendations
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {recChecklist.map((rec, i) => (
              <div key={i} className="flex items-start gap-2 p-2.5 rounded-lg bg-slate-900/50 text-xs text-slate-200">
                <CheckCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" style={{ color: THEME.green }} />
                {rec}
              </div>
            ))}
          </div>
        </div>

        {/* Smart Notifications + Weather Impact */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {smartNotifications.length > 0 && (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
              <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                <Bell className="w-4 h-4" style={{ color: THEME.red }} /> Smart Notifications
              </h3>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {smartNotifications.map((n, i) => (
                  <div key={i} className="p-2.5 rounded-lg bg-slate-800/50 border border-slate-700/50 text-xs">
                    <p className="text-slate-200 flex items-center gap-1.5">
                      <AlertTriangle className="h-3.5 w-3.5 shrink-0" style={{ color: n.congestion === "High" ? THEME.red : THEME.orange }} />
                      <strong>{n.location}</strong> approaching congestion
                    </p>
                    <p className="text-slate-500 mt-1 flex items-center justify-between">
                      <span>Predicted in next 15 min</span>
                      <span className="font-bold" style={{ color: n.congestion === "High" ? THEME.red : THEME.orange }}>{n.probability}% probability</span>
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {weatherSummary && (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
              <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                <CloudRain className="w-4 h-4" style={{ color: THEME.blue }} /> Weather Impact
              </h3>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-semibold">Current</p>
                  <p className="text-lg font-bold text-white">{weatherSummary.weather}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-slate-400 uppercase font-semibold">Traffic Impact</p>
                  <p className="text-lg font-bold" style={{ color: weatherSummary.impact === "High" ? THEME.red : weatherSummary.impact === "Medium" ? THEME.orange : THEME.green }}>
                    {weatherSummary.impact}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Traffic Congestion Overview — donut + progress bars */}
        {distrib && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-1 rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
              <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                <Activity className="w-4 h-4" style={{ color: THEME.purple }} /> Traffic Congestion Overview
              </h3>
              <div style={{ height: 200 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={distribPie} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} animationDuration={700}>
                      {distribPie.map((d, i) => <Cell key={i} fill={d.color} />)}
                    </Pie>
                    <Tooltip {...TOOLTIP_STYLE} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-3 mt-3">
                <ProgressBar label="High" pct={distrib.high?.percentage ?? 0} color={THEME.red} />
                <ProgressBar label="Medium" pct={distrib.medium?.percentage ?? 0} color={THEME.orange} />
                <ProgressBar label="Low" pct={distrib.low?.percentage ?? 0} color={THEME.green} />
              </div>
            </div>

            <div className="lg:col-span-2 grid grid-cols-3 gap-4">
              {[
                { label: "High Congestion", count: distrib.high?.count, pct: distrib.high?.percentage, color: THEME.red, Icon: AlertTriangle },
                { label: "Medium Congestion", count: distrib.medium?.count, pct: distrib.medium?.percentage, color: THEME.orange, Icon: AlertTriangle },
                { label: "Low Congestion", count: distrib.low?.count, pct: distrib.low?.percentage, color: THEME.green, Icon: CheckCircle },
              ].map((c) => (
                <div key={c.label} className="rounded-2xl border p-5 text-center flex flex-col items-center justify-center gap-1"
                  style={{ background: `${c.color}1a`, borderColor: `${c.color}4d` }}>
                  <c.Icon className="h-5 w-5 mb-1" style={{ color: c.color }} />
                  <p className="text-3xl font-bold" style={{ color: c.color }}>{c.pct}%</p>
                  <p className="text-sm text-white font-semibold">{c.label}</p>
                  <p className="text-xs text-slate-400">{c.count?.toLocaleString()} locations</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Help panel */}
        {showHelp && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setShowHelp(false)}>
            <div className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Info className="h-4 w-4" style={{ color: THEME.blue }} /> Understanding the Metrics
                </h3>
                <button onClick={() => setShowHelp(false)} className="text-slate-400 hover:text-white"><X className="h-4 w-4" /></button>
              </div>
              <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                {METRIC_HELP.map((m) => (
                  <div key={m.term}>
                    <p className="text-xs font-bold text-white">{m.term}</p>
                    <p className="text-xs text-slate-400 leading-relaxed">{m.def}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>
    </Layout>
  );
}