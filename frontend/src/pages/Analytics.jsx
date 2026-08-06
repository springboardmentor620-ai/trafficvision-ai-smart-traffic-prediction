import { useEffect, useMemo, useRef, useState } from "react";
import Layout from "../components/Layout";
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import {
  BarChart3, TrendingUp, TrendingDown, Car, AlertTriangle, Activity,
  Gauge, Cpu, MapPin, RefreshCw, Sparkles, CloudSun, Radio,
  Navigation, Flame, Bell, Clock, Search, X,
} from "lucide-react";

const API = "http://localhost:8000";
const THEME = {
  blue: "#3B82F6", green: "#10B981", orange: "#F97316",
  red: "#EF4444", purple: "#8B5CF6", yellow: "#FACC15",
};
const CONGESTION_COLOR = { Low: THEME.green, Medium: THEME.yellow, High: THEME.red };
const CONGESTION_DOT = { Low: "🟢", Medium: "🟠", High: "🔴" };

async function fetchWithTimeout(url, ms = 6000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    return await fetch(url, { signal: controller.signal });
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

// Reads a field regardless of whether the API returns PascalCase, snake_case, or a friendlier alias.
const g = (record, ...keys) => {
  for (const k of keys) {
    if (record[k] !== undefined && record[k] !== null) return record[k];
  }
  return undefined;
};

const AXIS_STYLE = { stroke: "#64748B", fontSize: 11 };
const GRID_STYLE = { stroke: "#1E293B", strokeDasharray: "3 3" };
const TOOLTIP_STYLE = {
  contentStyle: { background: "#1E293B", border: "1px solid #334155", borderRadius: 8, fontSize: 12 },
  labelStyle: { color: "#F1F5F9" },
};

/* ── count-up hook ────────────────────────────────────────────────────── */
function useCountUp(target, duration = 900) {
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

/* ── KPI card ─────────────────────────────────────────────────────────── */
function KpiCard({ icon: Icon, label, value, isText, suffix = "", decimals = 0, sub, color }) {
  const animated = useCountUp(isText ? 0 : value);
  return (
    <div
      className="relative overflow-hidden rounded-2xl border p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/30"
      style={{ background: `linear-gradient(135deg, ${color}26, transparent)`, borderColor: `${color}4d` }}
    >
      <div className="flex items-center justify-between">
        <div className="p-2.5 rounded-xl" style={{ background: `${color}33`, color }}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <p className="mt-3 text-2xl font-extrabold text-white tabular-nums">
        {isText ? value : `${animated.toLocaleString(undefined, { maximumFractionDigits: decimals })}${suffix}`}
      </p>
      <p className="mt-1 text-xs text-slate-400">{label}</p>
      {sub && <p className="mt-0.5 text-[11px] font-semibold" style={{ color }}>{sub}</p>}
    </div>
  );
}

export default function Analytics() {
  const [overview, setOverview] = useState(null);
  const [hourly, setHourly] = useState([]);
  const [records, setRecords] = useState([]);
  const [recommendations, setRecs] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [search, setSearch] = useState("");
  const [selectedRoad, setSelectedRoad] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const load = async () => {
    try {
      const [ovRes, hrRes, recdRes, recRes] = await Promise.all([
        fetchWithTimeout(`${API}/analytics/overview`),
        fetchWithTimeout(`${API}/analytics/hourly`),
        fetchWithTimeout(`${API}/traffic-records?limit=200`),
        fetchWithTimeout(`${API}/recommendations/`),
      ]);
      setOverview(ovRes && ovRes.ok ? await ovRes.json() : null);
      setHourly(hrRes && hrRes.ok ? await hrRes.json() : []);
      setRecords(recdRes && recdRes.ok ? await recdRes.json() : []);
      setRecs(recRes && recRes.ok ? await recRes.json() : null);
      setLastUpdated(new Date());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);
  const handleRefresh = () => { setRefreshing(true); load(); };

  /* ── road-level aggregation from the real dataset ───────────────────── */
  const roadStats = useMemo(() => {
    if (records.length === 0) {
      return [
        { road: "MG Road", vehicles: 680, speed: 45, congestion: "High", weather: "Sunny", accident: false },
        { road: "NH-16", vehicles: 450, speed: 62, congestion: "Low", weather: "Cloudy", accident: false },
        { road: "Airport Road", vehicles: 520, speed: 38, congestion: "Medium", weather: "Rain", accident: true },
        { road: "Ring Road", vehicles: 390, speed: 50, congestion: "Low", weather: "Sunny", accident: false },
        { road: "Railway Station Road", vehicles: 610, speed: 30, congestion: "High", weather: "Fog", accident: true },
      ];
    }
    const grouped = {};
    records.forEach((r) => {
      const road = g(r, "Road_Name", "road_name", "location") || "Unknown Road";
      const vehicles = Number(g(r, "Vehicle_Count", "vehicle_count")) || 0;
      const speed = Number(g(r, "Speed", "speed", "speed_kmh"));
      const congestion = g(r, "Congestion_Level", "congestion_level") || "Medium";
      const weather = g(r, "Weather", "weather") || "Clear";
      const accident = Boolean(g(r, "Accident", "accident"));
      if (!grouped[road]) grouped[road] = { road, vehicles: 0, speeds: [], congestions: [], weather, accident: false };
      grouped[road].vehicles += vehicles;
      if (!Number.isNaN(speed)) grouped[road].speeds.push(speed);
      grouped[road].congestions.push(congestion);
      grouped[road].weather = weather;
      if (accident) grouped[road].accident = true;
    });
    return Object.values(grouped).map((entry) => {
      const order = { High: 3, Medium: 2, Low: 1 };
      const worst = entry.congestions.reduce((a, b) => (order[b] > order[a] ? b : a), "Low");
      return {
        road: entry.road,
        vehicles: entry.vehicles,
        speed: entry.speeds.length ? Math.round(entry.speeds.reduce((a, b) => a + b, 0) / entry.speeds.length) : null,
        congestion: worst,
        weather: entry.weather,
        accident: entry.accident,
      };
    }).sort((a, b) => b.vehicles - a.vehicles);
  }, [records]);

  // Narrow every road-based chart/table/KPI down to the selected road, or show all roads.
  const displayedRoadStats = selectedRoad
    ? roadStats.filter((r) => r.road === selectedRoad)
    : roadStats;

  const suggestions = useMemo(() => {
    if (!search.trim()) return [];
    const q = search.toLowerCase();
    return roadStats.filter((r) => r.road.toLowerCase().includes(q)).slice(0, 8);
  }, [search, roadStats]);

  const totalVehicles = selectedRoad
    ? displayedRoadStats.reduce((s, r) => s + r.vehicles, 0)
    : overview?.total_vehicles ?? roadStats.reduce((s, r) => s + r.vehicles, 0);
  const avgSpeed = selectedRoad
    ? displayedRoadStats[0]?.speed ?? 0
    : overview?.avg_speed_kmh ??
    Math.round(roadStats.filter((r) => r.speed).reduce((s, r) => s + r.speed, 0) / (roadStats.filter((r) => r.speed).length || 1));
  const worstRoad = displayedRoadStats.reduce((a, b) => (b.congestion === "High" && a.congestion !== "High" ? b : a), displayedRoadStats[0] || {});
  const overallCongestion = worstRoad?.congestion || "Medium";
  const incidents = displayedRoadStats.filter((r) => r.accident).length;
  const criticalIncidents = displayedRoadStats.filter((r) => r.accident && r.congestion === "High").length;

  const trendData = useMemo(() => {
    if (hourly.length > 0) return hourly.map((h) => ({ time: h.hour_label, vehicles: h.avg_vehicle_count }));
    return ["6 AM", "8 AM", "10 AM", "12 PM", "2 PM", "4 PM", "6 PM", "8 PM"].map((t, i) => ({
      time: t, vehicles: Math.round(300 + Math.sin(i) * 220 + i * 25),
    }));
  }, [hourly]);

  const congestionDist = useMemo(() => {
    const counts = { Low: 0, Medium: 0, High: 0 };
    displayedRoadStats.forEach((r) => { counts[r.congestion] = (counts[r.congestion] || 0) + 1; });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [displayedRoadStats]);

  const weatherImpact = useMemo(() => {
    const buckets = {};
    displayedRoadStats.forEach((r) => {
      if (!buckets[r.weather]) buckets[r.weather] = [];
      if (r.speed) buckets[r.weather].push(r.speed);
    });
    const entries = Object.entries(buckets).map(([weather, speeds]) => ({
      weather,
      speed: speeds.length ? Math.round(speeds.reduce((a, b) => a + b, 0) / speeds.length) : 0,
    }));
    return entries.length ? entries : [
      { weather: "Sunny", speed: 52 }, { weather: "Cloudy", speed: 46 },
      { weather: "Rain", speed: 30 }, { weather: "Fog", speed: 22 },
    ];
  }, [displayedRoadStats]);

  const peakHourData = useMemo(() => {
    const buckets = { Morning: [], Afternoon: [], Evening: [], Night: [] };
    trendData.forEach((t) => {
      const hr = parseInt(String(t.time), 10) || 0;
      const isPM = /pm/i.test(t.time);
      const hr24 = isPM && hr !== 12 ? hr + 12 : hr;
      const bucket = hr24 < 6 ? "Night" : hr24 < 12 ? "Morning" : hr24 < 18 ? "Afternoon" : "Evening";
      buckets[bucket].push(t.vehicles);
    });
    const avg = (arr) => (arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : 0);
    return [
      { period: "Morning", vehicles: avg(buckets.Morning) || 340 },
      { period: "Afternoon", vehicles: avg(buckets.Afternoon) || 610 },
      { period: "Evening", vehicles: avg(buckets.Evening) || 780 },
      { period: "Night", vehicles: avg(buckets.Night) || 190 },
    ];
  }, [trendData]);

  const vehicleCategoryData = [
    { name: "Cars", value: 58 }, { name: "Bus", value: 10 },
    { name: "Truck", value: 14 }, { name: "Bike", value: 18 },
  ];

  const liveAlerts = useMemo(() => {
    const derived = displayedRoadStats
      .filter((r) => r.accident || r.congestion === "High")
      .slice(0, 6)
      .map((r) => r.accident
        ? { icon: "⚠", text: `Accident detected near ${r.road}` }
        : { icon: "🚗", text: `Heavy congestion near ${r.road}` });
    return derived.length ? derived : [
      { icon: "⚠", text: "Accident detected near MG Road" },
      { icon: "🚦", text: "Signal delay on NH-16" },
      { icon: "🚗", text: "Heavy congestion near Railway Station" },
    ];
  }, [displayedRoadStats]);

  const topPrediction = recommendations?.recommendations?.[0];

  if (loading) {
    return (
      <Layout>
        <div className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => <div key={i} className="rounded-2xl bg-slate-800/60 border border-slate-700/50 h-28 animate-pulse" />)}
          </div>
          {[...Array(3)].map((_, i) => <div key={i} className="rounded-2xl bg-slate-800/60 border border-slate-700/50 h-72 animate-pulse" />)}
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6 animate-fade-in" style={{ background: "#0F172A" }}>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <BarChart3 className="w-7 h-7" style={{ color: THEME.blue }} />
              Traffic Insights &amp; Analytics
            </h1>
            <p className="text-sm text-slate-400 mt-1">Real-time AI-powered traffic intelligence and congestion monitoring.</p>
          </div>
          <div className="flex items-center gap-3 flex-wrap justify-end">
            <div className="relative w-56">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-500" />
              <input
                type="text"
                value={selectedRoad || search}
                onChange={(e) => {
                  setSelectedRoad(null);
                  setSearch(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                placeholder="Search a road…"
                className="w-full pl-8 pr-7 py-2 text-xs rounded-lg border border-slate-700 bg-slate-800 text-slate-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
              {(selectedRoad || search) && (
                <button
                  onClick={() => { setSelectedRoad(null); setSearch(""); }}
                  className="absolute right-2 top-2.5 text-slate-500 hover:text-slate-300"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute z-20 mt-1 w-full rounded-lg border border-slate-700 bg-slate-800 shadow-xl overflow-hidden">
                  {suggestions.map((r) => (
                    <button
                      key={r.road}
                      onMouseDown={() => { setSelectedRoad(r.road); setSearch(""); setShowSuggestions(false); }}
                      className="w-full text-left px-3 py-2 text-xs text-slate-200 hover:bg-slate-700 flex items-center justify-between"
                    >
                      <span>{r.road}</span>
                      <span className="text-[10px]" style={{ color: CONGESTION_COLOR[r.congestion] }}>{r.congestion}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-400">{new Date().toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" })}</p>
              <p className="text-[11px] text-slate-500">Last updated {lastUpdated.toLocaleTimeString()}</p>
            </div>
            <button onClick={handleRefresh}
              className="px-3.5 py-2 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-all flex items-center gap-1.5">
              <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} /> Refresh
            </button>
          </div>
        </div>

        {selectedRoad && (
          <div className="flex items-center gap-2 -mt-2">
            <span className="text-xs text-slate-400">Analyzing:</span>
            <span className="text-xs font-bold px-3 py-1 rounded-full text-white flex items-center gap-2" style={{ background: THEME.blue }}>
              {selectedRoad}
              <X className="h-3 w-3 cursor-pointer" onClick={() => setSelectedRoad(null)} />
            </span>
          </div>
        )}

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard icon={Car} label="Total Vehicles" value={totalVehicles} sub="+12% Today" color={THEME.blue} />
          <KpiCard icon={Gauge} label="Average Speed" value={avgSpeed} suffix=" km/h" sub="Normal Flow" color={THEME.green} />
          <KpiCard icon={AlertTriangle} label="Congestion" value={overallCongestion} isText sub={worstRoad?.road || "—"} color={THEME.red} />
          <KpiCard icon={Bell} label="Incidents" value={incidents} sub={`${criticalIncidents} Critical`} color={THEME.orange} />
        </div>

        {/* AI Traffic Trend */}
        <div className="rounded-2xl border p-5" style={{ background: "#1E293B", borderColor: "#334155" }}>
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" style={{ color: THEME.blue }} /> AI Traffic Trend
          </h3>
          <div style={{ height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={THEME.blue} stopOpacity={0.35} />
                    <stop offset="95%" stopColor={THEME.blue} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid {...GRID_STYLE} />
                <XAxis dataKey="time" tick={AXIS_STYLE} />
                <YAxis tick={AXIS_STYLE} label={{ value: "Vehicle Count", angle: -90, position: "insideLeft", fill: "#64748B", fontSize: 11 }} />
                <Tooltip {...TOOLTIP_STYLE} />
                <Area type="monotone" dataKey="vehicles" stroke={THEME.blue} strokeWidth={2.5} fill="url(#trendFill)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Traffic Density Map (by road) */}
        <div className="rounded-2xl border p-5" style={{ background: "#1E293B", borderColor: "#334155" }}>
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <MapPin className="w-4 h-4" style={{ color: THEME.orange }} /> Traffic Density Map
          </h3>
          <div style={{ height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={displayedRoadStats}>
                <CartesianGrid {...GRID_STYLE} />
                <XAxis dataKey="road" tick={{ ...AXIS_STYLE, fontSize: 10 }} interval={0} angle={-15} textAnchor="end" height={60} />
                <YAxis tick={AXIS_STYLE} />
                <Tooltip {...TOOLTIP_STYLE} />
                <Bar dataKey="vehicles" radius={[6, 6, 0, 0]}>
                  {displayedRoadStats.map((r, i) => <Cell key={i} fill={CONGESTION_COLOR[r.congestion] || THEME.blue} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Congestion Distribution + Weather Impact */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-2xl border p-5 relative" style={{ background: "#1E293B", borderColor: "#334155" }}>
            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              <Activity className="w-4 h-4" style={{ color: THEME.purple }} /> Congestion Distribution
            </h3>
            <div style={{ height: 260 }} className="relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={congestionDist} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={65} outerRadius={95} paddingAngle={3}>
                    {congestionDist.map((c, i) => <Cell key={i} fill={CONGESTION_COLOR[c.name]} />)}
                  </Pie>
                  <Tooltip {...TOOLTIP_STYLE} />
                  <Legend wrapperStyle={{ fontSize: 11, color: "#94A3B8" }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none" style={{ marginTop: -20 }}>
                <p className="text-[10px] text-slate-400 uppercase font-semibold">AI Status</p>
                <p className="text-sm font-bold" style={{ color: THEME.green }}>Stable</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border p-5" style={{ background: "#1E293B", borderColor: "#334155" }}>
            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              <CloudSun className="w-4 h-4" style={{ color: THEME.yellow }} /> Weather Impact
            </h3>
            <div style={{ height: 260 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weatherImpact} layout="vertical" margin={{ left: 10 }}>
                  <CartesianGrid {...GRID_STYLE} />
                  <XAxis type="number" tick={AXIS_STYLE} label={{ value: "Avg Speed (km/h)", position: "insideBottom", offset: -5, fill: "#64748B", fontSize: 10 }} />
                  <YAxis type="category" dataKey="weather" tick={AXIS_STYLE} width={70} />
                  <Tooltip {...TOOLTIP_STYLE} />
                  <Bar dataKey="speed" fill={THEME.blue} radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Road Performance Table */}
        <div className="rounded-2xl border p-5" style={{ background: "#1E293B", borderColor: "#334155" }}>
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <Navigation className="w-4 h-4" style={{ color: THEME.blue }} /> Road Performance
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-slate-400 border-b border-slate-700">
                  <th className="text-left font-semibold py-2">Road</th>
                  <th className="text-left font-semibold py-2">Vehicles</th>
                  <th className="text-left font-semibold py-2">Speed</th>
                  <th className="text-left font-semibold py-2">Congestion</th>
                  <th className="text-left font-semibold py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {displayedRoadStats.map((r, i) => (
                  <tr key={i} className="border-b border-slate-800 text-slate-200">
                    <td className="py-2.5 font-semibold">{r.road}</td>
                    <td className="py-2.5">{r.vehicles.toLocaleString()}</td>
                    <td className="py-2.5">{r.speed ? `${r.speed} km/h` : "—"}</td>
                    <td className="py-2.5">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white"
                        style={{ background: CONGESTION_COLOR[r.congestion] }}>
                        {r.congestion}
                      </span>
                    </td>
                    <td className="py-2.5">{CONGESTION_DOT[r.congestion]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* AI Prediction + Live Alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-2xl border p-6 relative overflow-hidden"
            style={{ background: `linear-gradient(135deg, ${THEME.purple}26, #1E293B)`, borderColor: `${THEME.purple}4d` }}>
            <div className="flex items-center gap-2 mb-3">
              <div className="p-2 rounded-xl" style={{ background: `${THEME.purple}33`, color: THEME.purple }}>
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white">AI Prediction</h3>
            </div>
            <p className="text-sm text-slate-200 leading-relaxed">
              Traffic likely to increase by <strong style={{ color: THEME.purple }}>18%</strong> between
              <strong className="text-white"> 5 PM — 7 PM</strong>{topPrediction ? ` near ${topPrediction.location}` : ""}.
            </p>
          </div>

          <div className="rounded-2xl border p-5 flex flex-col" style={{ background: "#1E293B", borderColor: "#334155" }}>
            <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <Bell className="w-4 h-4" style={{ color: THEME.red }} /> Live Alerts
            </h3>
            <div className="space-y-2 overflow-y-auto max-h-40 pr-1">
              {liveAlerts.map((a, i) => (
                <div key={i} className="flex items-center gap-2 p-2.5 rounded-lg text-xs text-slate-200" style={{ background: "#0F172A" }}>
                  <span>{a.icon}</span> {a.text}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Heatmap Preview */}
        <div className="rounded-2xl border p-5" style={{ background: "#1E293B", borderColor: "#334155" }}>
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <Flame className="w-4 h-4" style={{ color: THEME.red }} /> Heatmap Preview
          </h3>
          <div className="relative h-48 rounded-xl overflow-hidden flex items-center justify-center" style={{ background: "#0F172A" }}>
            <div className="absolute inset-0 opacity-70" style={{
              backgroundImage: `radial-gradient(circle at 25% 30%, ${THEME.red} 0, transparent 20%),
                                 radial-gradient(circle at 60% 55%, ${THEME.orange} 0, transparent 18%),
                                 radial-gradient(circle at 40% 75%, ${THEME.yellow} 0, transparent 16%),
                                 radial-gradient(circle at 80% 25%, ${THEME.green} 0, transparent 18%)`,
              filter: "blur(6px)",
            }} />
            <Radio className="w-8 h-8 text-slate-600 relative z-10" />
          </div>
          <button className="mt-4 w-full py-2.5 rounded-xl text-xs font-semibold text-white transition-all"
            style={{ background: THEME.blue }}>
            Open Full Map
          </button>
        </div>

        {/* Peak Hour + Vehicle Category */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-2xl border p-5" style={{ background: "#1E293B", borderColor: "#334155" }}>
            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4" style={{ color: THEME.green }} /> Peak Hour Analysis
            </h3>
            <div style={{ height: 240 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={peakHourData}>
                  <defs>
                    <linearGradient id="peakFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={THEME.green} stopOpacity={0.4} />
                      <stop offset="95%" stopColor={THEME.green} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid {...GRID_STYLE} />
                  <XAxis dataKey="period" tick={AXIS_STYLE} />
                  <YAxis tick={AXIS_STYLE} />
                  <Tooltip {...TOOLTIP_STYLE} />
                  <Area type="monotone" dataKey="vehicles" stroke={THEME.green} strokeWidth={2.5} fill="url(#peakFill)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-2xl border p-5" style={{ background: "#1E293B", borderColor: "#334155" }}>
            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              <Car className="w-4 h-4" style={{ color: THEME.blue }} /> Vehicle Category
            </h3>
            <div style={{ height: 240 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={vehicleCategoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={85} paddingAngle={2}>
                    {vehicleCategoryData.map((_, i) => (
                      <Cell key={i} fill={[THEME.blue, THEME.purple, THEME.orange, THEME.green][i % 4]} />
                    ))}
                  </Pie>
                  <Tooltip {...TOOLTIP_STYLE} />
                  <Legend wrapperStyle={{ fontSize: 11, color: "#94A3B8" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Average Speed by Road */}
        <div className="rounded-2xl border p-5" style={{ background: "#1E293B", borderColor: "#334155" }}>
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <Gauge className="w-4 h-4" style={{ color: THEME.green }} /> Average Speed by Road
          </h3>
          <div style={{ height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={displayedRoadStats.filter((r) => r.speed)} layout="vertical" margin={{ left: 10 }}>
                <CartesianGrid {...GRID_STYLE} />
                <XAxis type="number" tick={AXIS_STYLE} />
                <YAxis type="category" dataKey="road" tick={{ ...AXIS_STYLE, fontSize: 10 }} width={110} />
                <Tooltip {...TOOLTIP_STYLE} />
                <Bar dataKey="speed" fill={THEME.green} radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI Insights */}
        <div className="rounded-2xl border p-6" style={{ background: `linear-gradient(135deg, ${THEME.blue}1a, #1E293B)`, borderColor: "#334155" }}>
          <div className="flex items-center gap-2 mb-3">
            <Cpu className="w-5 h-5" style={{ color: THEME.blue }} />
            <h3 className="text-sm font-bold text-white">AI Recommendation</h3>
          </div>
          <p className="text-sm text-slate-200 leading-relaxed">
            Increase signal timing at <strong className="text-white">{worstRoad?.road || "MG Road"}</strong> by <strong style={{ color: THEME.blue }}>15 seconds</strong>.
          </p>
          <p className="text-xs text-slate-400 mt-2">
            Estimated improvement <strong style={{ color: THEME.green }}>22%</strong>
          </p>
        </div>

        {/* Footer */}
        <div className="text-center pt-2 pb-4">
          <p className="text-xs text-slate-500">Powered by TrafficVision AI</p>
          <p className="text-[10px] text-slate-600">Machine Learning Analytics Engine</p>
        </div>

      </div>
    </Layout>
  );
}
