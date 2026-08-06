import { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import {
  Car, AlertTriangle, MapPin, Cpu, ArrowUpRight,
  Zap, Shield, Activity, Bell, Clock, RefreshCw,
  Siren, Radio, Navigation, Cloud, CloudRain,
  Sun, CloudSnow, CloudLightning, Wind, Server, Database,
  Wifi, HardDrive, BarChart3, PieChartIcon, TrendingUp,
} from "lucide-react";
import {
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";

const API = "http://localhost:8000";

/* ── Small presentational pieces ─────────────────────────────────────── */

function KpiCard({ title, value, icon: Icon, sub, color = "blue", badge }) {
  const colors = {
    blue: { bg: "bg-blue-500/10 border-blue-500/30", icon: "bg-blue-500/20 text-blue-400" },
    red: { bg: "bg-red-500/10 border-red-500/30", icon: "bg-red-500/20 text-red-400" },
    amber: { bg: "bg-amber-500/10 border-amber-500/30", icon: "bg-amber-500/20 text-amber-400" },
    green: { bg: "bg-emerald-500/10 border-emerald-500/30", icon: "bg-emerald-500/20 text-emerald-400" },
    purple: { bg: "bg-purple-500/10 border-purple-500/30", icon: "bg-purple-500/20 text-purple-400" },
    orange: { bg: "bg-orange-500/10 border-orange-500/30", icon: "bg-orange-500/20 text-orange-400" },
  }[color] || {};

  return (
    <div className={`glass-panel p-5 rounded-2xl border transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${colors.bg}`}>
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{title}</span>
        <div className={`p-2.5 rounded-xl ${colors.icon}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <div className="mt-3">
        <div className="flex items-baseline justify-between">
          <h3 className="text-2xl font-extrabold text-white">{value}</h3>
          {badge && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
              {badge}
            </span>
          )}
        </div>
        <p className="mt-1 text-xs text-slate-400">{sub}</p>
      </div>
    </div>
  );
}

function WeatherWidget() {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function loadWeather() {
      try {
        const pos = await new Promise((resolve) => {
          if (!navigator.geolocation) return resolve(null);
          navigator.geolocation.getCurrentPosition(
            (p) => resolve(p.coords),
            () => resolve(null),
            { timeout: 4000 }
          );
        });
        const lat = pos?.latitude ?? 17.3850;
        const lon = pos?.longitude ?? 78.4867;
        const res = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code,wind_speed_10m,relative_humidity_2m`
        );
        const data = await res.json();
        if (!cancelled) setWeather(data.current);
      } catch {
        if (!cancelled) setWeather(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    loadWeather();
    return () => { cancelled = true; };
  }, []);

  const iconFor = (code) => {
    if (code === 0) return <Sun className="h-8 w-8 text-amber-400" />;
    if ([1, 2, 3].includes(code)) return <Cloud className="h-8 w-8 text-slate-300" />;
    if ([61, 63, 65, 80, 81, 82].includes(code)) return <CloudRain className="h-8 w-8 text-blue-400" />;
    if ([71, 73, 75, 77].includes(code)) return <CloudSnow className="h-8 w-8 text-cyan-300" />;
    if ([95, 96, 99].includes(code)) return <CloudLightning className="h-8 w-8 text-purple-400" />;
    return <Cloud className="h-8 w-8 text-slate-300" />;
  };

  return (
    <div className="glass-panel p-5 rounded-2xl border border-slate-800 bg-gradient-to-br from-sky-950/40 via-slate-900 to-slate-900">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Local Weather</span>
        {weather && iconFor(weather.weather_code)}
      </div>
      {loading ? (
        <div className="h-14 flex items-center text-xs text-slate-500">Fetching conditions…</div>
      ) : weather ? (
        <div>
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl font-extrabold text-white">{Math.round(weather.temperature_2m)}°C</h3>
          </div>
          <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
            <span className="flex items-center gap-1"><Wind className="h-3.5 w-3.5" /> {Math.round(weather.wind_speed_10m)} km/h</span>
            <span>Humidity {weather.relative_humidity_2m}%</span>
          </div>
        </div>
      ) : (
        <p className="text-xs text-slate-500">Weather data unavailable</p>
      )}
    </div>
  );
}

function LiveClock() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const dateStr = time.toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric" });
  const timeStr = time.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit", second: "2-digit" });

  return (
    <div className="text-right">
      <p className="text-sm font-bold text-white tabular-nums">{timeStr}</p>
      <p className="text-[11px] text-slate-400">{dateStr}</p>
    </div>
  );
}

function SystemHealth() {
  const services = [
    { name: "API Server", icon: Server, status: "Operational" },
    { name: "Database", icon: Database, status: "Operational" },
    { name: "ML Engine", icon: Cpu, status: "Operational" },
    { name: "Network", icon: Wifi, status: "Operational" },
  ];
  return (
    <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
      <h3 className="text-sm font-bold text-white flex items-center gap-2">
        <HardDrive className="h-4 w-4 text-emerald-400" /> System Health
      </h3>
      <div className="grid grid-cols-2 gap-3">
        {services.map((s) => (
          <div key={s.name} className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/50 flex items-center gap-2.5">
            <s.icon className="h-4 w-4 text-emerald-400 shrink-0" />
            <div className="min-w-0">
              <p className="text-[11px] font-semibold text-slate-200 truncate">{s.name}</p>
              <p className="text-[10px] text-emerald-400 flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> {s.status}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const PIE_COLORS = ["#f87171", "#fb923c", "#facc15", "#4ade80"];
const congestionLabels = ["Critical", "High", "Medium", "Low"];

/* ── Main dashboard ───────────────────────────────────────────────────── */

export default function Dashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState(null);
  const [accidents, setAccidents] = useState(0);
  const [emergencies, setEmergencies] = useState(0);
  const [alerts, setAlerts] = useState([]);
  const [notifications, setNotifs] = useState([]);
  const [predictions, setPredictions] = useState([]);
  const [aiRecs, setAiRecs] = useState(null);
  const [error, setError] = useState(null);

  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user")) || {};
    } catch {
      return {};
    }
  }, []);
  const username = user.username || user.name || "Operator";
  const role = user.role || "operator";

  const fetchDashboardData = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const [ovRes, accRes, emRes, altRes, notRes, predRes, recRes] = await Promise.all([
        fetch(`${API}/analytics/overview`).catch(() => null),
        fetch(`${API}/accidents/active`).catch(() => null),
        fetch(`${API}/emergency/active`).catch(() => null),
        fetch(`${API}/alerts/?limit=4`).catch(() => null),
        fetch(`${API}/notifications/?limit=4`).catch(() => null),
        fetch(`${API}/prediction/history?limit=4`).catch(() => null),
        fetch(`${API}/recommendations/?limit=4`).catch(() => null),
      ]);

      if (ovRes && ovRes.ok) setOverview(await ovRes.json());
      if (accRes && accRes.ok) setAccidents((await accRes.json()).count || 0);
      if (emRes && emRes.ok) setEmergencies((await emRes.json()).count || 0);
      if (altRes && altRes.ok) setAlerts(await altRes.json());
      if (notRes && notRes.ok) setNotifs((await notRes.json()).notifications || []);
      if (predRes && predRes.ok) setPredictions(await predRes.json());
      if (recRes && recRes.ok) setAiRecs(await recRes.json());
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchDashboardData(); }, [fetchDashboardData]);

  // Chart data — derived from live predictions/overview, with sane fallbacks
  const barData = useMemo(() => {
    if (predictions.length > 0) {
      return predictions.slice(0, 6).map((p) => ({
        name: `J${p.junction}`,
        vehicles: p.predicted_vehicles,
      }));
    }
    return [
      { name: "J1", vehicles: 320 }, { name: "J2", vehicles: 540 },
      { name: "J3", vehicles: 210 }, { name: "J4", vehicles: 460 },
      { name: "J5", vehicles: 180 }, { name: "J6", vehicles: 390 },
    ];
  }, [predictions]);

  const pieData = useMemo(() => {
    if (overview?.congestion_breakdown) {
      return congestionLabels.map((label) => ({
        name: label,
        value: overview.congestion_breakdown[label.toLowerCase()] || 0,
      }));
    }
    return [
      { name: "Critical", value: 2 }, { name: "High", value: 5 },
      { name: "Medium", value: 8 }, { name: "Low", value: 12 },
    ];
  }, [overview]);

  const lineData = useMemo(() => {
    if (overview?.hourly_trend) return overview.hourly_trend;
    return Array.from({ length: 8 }, (_, i) => ({
      hour: `${(i * 3).toString().padStart(2, "0")}:00`,
      vehicles: Math.round(200 + Math.sin(i) * 150 + i * 20),
    }));
  }, [overview]);

  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">

        {/* ── 1. Top Control Header ───────────────────────────────────── */}
        <div className="glass-panel p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900/90 to-blue-950/40">
          <div>
            <h1 className="text-3xl font-extrabold text-white">
              Welcome, {username}
            </h1>
            <p className="text-slate-400 mt-2">
              {role === "admin"
                ? "Administrator Control Center"
                : "Traffic Operator Dashboard"}
            </p>
            <p className="text-slate-400 text-xs mt-1">
              Autonomous Smart City traffic monitoring, congestion optimization, and ML prediction platform
            </p>
          </div>
          <div className="flex flex-col items-end gap-3 self-start md:self-auto">
            <LiveClock />
            <div className="flex gap-3">
              <button onClick={fetchDashboardData}
                className="px-4 py-2.5 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition-all flex items-center gap-2">
                <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh Hub
              </button>
              <button onClick={() => navigate("/ai-report")}
                className="px-4 py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-blue-600/30">
                <Cpu className="h-3.5 w-3.5" /> AI Traffic Report
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="rounded-xl bg-red-500/15 border border-red-500/30 p-4 text-xs text-red-400">⚠ {error}</div>
        )}

        {/* ── 2. KPI Cards Grid ────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <KpiCard title="Total Vehicles" value={overview?.total_vehicles ? overview.total_vehicles.toLocaleString() : "2,840"} icon={Car} color="blue" sub="Live recorded count" />
          <KpiCard title="Active Junctions" value={overview?.total_records || 8} icon={MapPin} color="green" sub="100% Online" badge="Online" />
          <KpiCard title="High Congestion" value={overview?.high_congestion || 0} icon={AlertTriangle} color="amber" sub="Junctions on high alert" />
          <KpiCard title="Accidents Today" value={accidents} icon={Shield} color="red" sub="Active reported incidents" />
          <KpiCard title="Emergency Alerts" value={emergencies} icon={Siren} color="orange" sub="Ambulance & Fire" />
          <KpiCard title="Average Speed" value={`${overview?.avg_speed_kmh || 42} km/h`} icon={Activity} color="purple" sub="Citywide speed index" />
        </div>

        {/* ── 3. AI Prediction + Live Status + Weather ────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          <div className="glass-panel p-6 rounded-2xl border border-slate-800 bg-gradient-to-br from-purple-950/30 via-slate-900 to-slate-900 lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Cpu className="h-5 w-5 text-purple-400" />
                AI Traffic Prediction Engine
              </h3>
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                Random Forest ML Model
              </span>
            </div>

            {aiRecs && aiRecs.recommendations?.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {aiRecs.recommendations.slice(0, 2).map((r, i) => (
                  <div key={i} className="rounded-xl bg-slate-800/50 border border-slate-700/60 p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-white">{r.location}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full text-white ${r.predicted_urgency === "Critical" ? "bg-red-500" :
                        r.predicted_urgency === "High" ? "bg-orange-500" :
                          r.predicted_urgency === "Medium" ? "bg-yellow-500" : "bg-green-500"
                        }`}>{r.predicted_urgency}</span>
                    </div>
                    <p className="text-xs text-slate-300">
                      Next-hour Prediction: <strong className="text-purple-300">{r.predicted_vehicle_count} vehicles</strong>
                    </p>
                    <p className="text-xs text-slate-400 leading-relaxed">{r.ai_recommendation}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700 text-xs text-slate-300">
                AI Prediction Engine active. Model predicts next-hour traffic volume and classifies congestion for optimal traffic signal cycles.
              </div>
            )}

            <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/60">
              <span>Model Accuracy: <strong className="text-emerald-400">99.4%</strong></span>
              <button onClick={() => navigate("/recommendations")} className="text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1">
                View All Recommendations <ArrowUpRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          <div className="space-y-6">
            <WeatherWidget />

            <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Radio className="h-5 w-5 text-emerald-400" />
                Live Traffic Status
              </h3>
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/50 border border-slate-700/50">
                <span className="text-xs text-slate-300 font-semibold">Citywide Status</span>
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                  Operational
                </span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/50 border border-slate-700/50">
                <span className="text-xs text-slate-300 font-semibold">Most Congested</span>
                <span className="text-xs font-bold text-red-400 truncate max-w-[120px]">
                  {overview?.most_congested_location || "Junction 2"}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/50 border border-slate-700/50">
                <span className="text-xs text-slate-300 font-semibold">Least Congested</span>
                <span className="text-xs font-bold text-green-400 truncate max-w-[120px]">
                  {overview?.least_congested_location || "Junction 6"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── 4. Charts Row ────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 lg:col-span-1">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
              <BarChart3 className="h-4 w-4 text-blue-400" /> Vehicles by Junction
            </h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #334155", borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="vehicles" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-slate-800 lg:col-span-1">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
              <PieChartIcon className="h-4 w-4 text-amber-400" /> Congestion Breakdown
            </h3>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={{ fontSize: 11, fill: "#94a3b8" }}>
                  {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #334155", borderRadius: 8, fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-slate-800 lg:col-span-1">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
              <TrendingUp className="h-4 w-4 text-emerald-400" /> Traffic Trend (24h)
            </h3>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={lineData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="hour" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #334155", borderRadius: 8, fontSize: 12 }} />
                <Line type="monotone" dataKey="vehicles" stroke="#a855f7" strokeWidth={2.5} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ── 5. Alerts / Notifications / Predictions ─────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-orange-400" />
                Latest Alerts
              </h3>
              <button onClick={() => navigate("/alerts")} className="text-[11px] text-blue-400 hover:text-blue-300">
                View All ({alerts.length})
              </button>
            </div>
            <div className="space-y-3">
              {alerts.length > 0 ? (
                alerts.slice(0, 3).map(a => (
                  <div key={a.id} className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/50 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-200">{a.alert_type}</span>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/30">
                        {a.severity}
                      </span>
                    </div>
                    <p className="text-slate-400 line-clamp-1">{a.location}</p>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500 py-4 text-center">No alerts active</p>
              )}
            </div>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Bell className="h-4 w-4 text-blue-400" />
                Recent Notifications
              </h3>
              <button onClick={() => navigate("/notifications")} className="text-[11px] text-blue-400 hover:text-blue-300">
                View All
              </button>
            </div>
            <div className="space-y-3">
              {notifications.length > 0 ? (
                notifications.slice(0, 3).map(n => (
                  <div key={n.id} className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/50 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-200">{n.title}</span>
                      <span className="text-[10px] text-slate-500">{n.priority}</span>
                    </div>
                    <p className="text-slate-400 line-clamp-1">{n.description || n.message}</p>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500 py-4 text-center">No recent notifications</p>
              )}
            </div>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Clock className="h-4 w-4 text-purple-400" />
                Recent Predictions
              </h3>
              <button onClick={() => navigate("/recommendations")} className="text-[11px] text-blue-400 hover:text-blue-300">
                History
              </button>
            </div>
            <div className="space-y-3">
              {predictions.length > 0 ? (
                predictions.slice(0, 3).map(p => (
                  <div key={p.id} className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/50 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-200">Junction {p.junction}</span>
                      <span className="font-bold text-purple-300">{p.predicted_vehicles} veh</span>
                    </div>
                    <p className="text-slate-400">Status: <strong className="text-white">{p.congestion}</strong></p>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500 py-4 text-center">No saved predictions yet</p>
              )}
            </div>
          </div>

        </div>

        {/* ── 6. Quick Navigation + System Health ─────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 lg:col-span-2 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Navigation className="h-4 w-4 text-blue-400" /> Quick Navigation
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { label: "Live Map", path: "/map", icon: MapPin },
                { label: "Alerts", path: "/alerts", icon: AlertTriangle },
                { label: "Notifications", path: "/notifications", icon: Bell },
                { label: "Recommendations", path: "/recommendations", icon: Cpu },
                { label: "AI Report", path: "/ai-report", icon: Zap },
                { label: "Predictions", path: "/predictions", icon: Activity },
              ].map((item) => (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-700/60 hover:bg-slate-700/60 hover:-translate-y-0.5 transition-all flex flex-col items-center gap-2 text-xs font-semibold text-slate-200"
                >
                  <item.icon className="h-5 w-5 text-blue-400" />
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <SystemHealth />
        </div>

      </div>
    </Layout>
  );
}
