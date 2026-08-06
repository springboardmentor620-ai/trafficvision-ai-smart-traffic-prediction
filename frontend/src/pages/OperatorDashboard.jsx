import { useCallback, useEffect, useState } from "react";
import Layout from "../components/Layout";
import { useNavigate } from "react-router-dom";
import {
  TrafficCone, Car, AlertTriangle, Siren, Activity, Construction,
  MapPin, Flame, Radio, TrafficCone as SignalIcon, RefreshCw,
  ShieldAlert, MessageSquareWarning, PencilLine, PhoneCall,
  Thermometer, Route,
} from "lucide-react";

const API = "http://localhost:8000";

function StatCard({ title, value, icon: Icon, color = "blue", sub }) {
  const colors = {
    blue: { bg: "bg-blue-500/10 border-blue-500/30", icon: "bg-blue-500/20 text-blue-400" },
    red: { bg: "bg-red-500/10 border-red-500/30", icon: "bg-red-500/20 text-red-400" },
    orange: { bg: "bg-orange-500/10 border-orange-500/30", icon: "bg-orange-500/20 text-orange-400" },
    purple: { bg: "bg-purple-500/10 border-purple-500/30", icon: "bg-purple-500/20 text-purple-400" },
    amber: { bg: "bg-amber-500/10 border-amber-500/30", icon: "bg-amber-500/20 text-amber-400" },
    green: { bg: "bg-emerald-500/10 border-emerald-500/30", icon: "bg-emerald-500/20 text-emerald-400" },
  }[color] || {};

  return (
    <div className={`glass-panel p-5 rounded-2xl border transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${colors.bg}`}>
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{title}</span>
        <div className={`p-2.5 rounded-xl ${colors.icon}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <h3 className="mt-3 text-2xl font-extrabold text-white">{value}</h3>
      <p className="mt-1 text-xs text-slate-400">{sub}</p>
    </div>
  );
}

function ActionButton({ label, icon: Icon, onClick, color = "blue" }) {
  const colors = {
    blue: "bg-blue-600 hover:bg-blue-500",
    red: "bg-red-600 hover:bg-red-500",
    orange: "bg-orange-600 hover:bg-orange-500",
    purple: "bg-purple-600 hover:bg-purple-500",
    slate: "bg-slate-700 hover:bg-slate-600",
    emerald: "bg-emerald-600 hover:bg-emerald-500",
  }[color];

  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl text-white text-xs font-semibold shadow transition-all hover:-translate-y-0.5 ${colors}`}
    >
      <Icon className="h-5 w-5" />
      {label}
    </button>
  );
}

const LAYERS = [
  { key: "heatmap", label: "Heatmap", icon: Thermometer },
  { key: "traffic", label: "Current Traffic", icon: Car },
  { key: "roads", label: "Road Status", icon: Route },
  { key: "signals", label: "Signals", icon: SignalIcon },
];

function OperatorDashboard() {
  const name = localStorage.getItem("name") || "Operator";
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    vehicles: null, alerts: 0, emergencies: 0, avgSpeed: null,
    congestedRoads: 0, assignedJunction: null,
  });
  const [activeLayer, setActiveLayer] = useState("heatmap");

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const [ovRes, altRes, emRes] = await Promise.all([
        fetch(`${API}/analytics/overview`).catch(() => null),
        fetch(`${API}/alerts/?limit=1`).catch(() => null),
        fetch(`${API}/emergency/active`).catch(() => null),
      ]);
      const overview = ovRes && ovRes.ok ? await ovRes.json() : null;
      const alertsData = altRes && altRes.ok ? await altRes.json() : null;
      const emData = emRes && emRes.ok ? await emRes.json() : null;

      setStats({
        vehicles: overview?.total_vehicles ?? null,
        alerts: Array.isArray(alertsData) ? alertsData.length : (alertsData?.count ?? 0),
        emergencies: emData?.count ?? 0,
        avgSpeed: overview?.avg_speed_kmh ?? null,
        congestedRoads: overview?.high_congestion ?? 0,
        assignedJunction: localStorage.getItem("assigned_junction") || overview?.most_congested_location || "Junction 3",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  return (
    <Layout>
      <div className="space-y-8 py-4 animate-fade-in">

        {/* Welcome Section */}
        <div className="glass-panel p-6 rounded-2xl flex flex-col md:flex-row justify-between md:items-center gap-4">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <TrafficCone className="h-6 w-6 text-blue-500 animate-pulse" />
              Welcome back, Operator {name}
            </h2>
            <p className="text-slate-400 text-xs">
              TrafficVision AI operator console synced. Active monitoring loops operational.
            </p>
          </div>
          <button onClick={fetchStats}
            className="px-4 py-2.5 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition-all flex items-center gap-2 self-start md:self-auto">
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
          </button>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <StatCard title="Current Vehicles" value={stats.vehicles?.toLocaleString() ?? "—"} icon={Car} color="blue" sub="Live recorded count" />
          <StatCard title="Today's Alerts" value={stats.alerts} icon={AlertTriangle} color="amber" sub="Raised in the last 24h" />
          <StatCard title="Emergency Calls" value={stats.emergencies} icon={Siren} color="red" sub="Ambulance & Fire" />
          <StatCard title="Average Speed" value={stats.avgSpeed ? `${stats.avgSpeed} km/h` : "—"} icon={Activity} color="purple" sub="Citywide speed index" />
          <StatCard title="Congested Roads" value={stats.congestedRoads} icon={Construction} color="orange" sub="Above threshold now" />
          <StatCard title="Assigned Junction" value={stats.assignedJunction ?? "—"} icon={MapPin} color="green" sub="Your monitoring zone" />
        </div>

        {/* Live Map */}
        <div className="glass-panel p-6 rounded-2xl space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Radio className="h-5 w-5 text-emerald-400" /> Live Map
            </h3>
            <div className="flex gap-2 flex-wrap">
              {LAYERS.map((l) => (
                <button
                  key={l.key}
                  onClick={() => setActiveLayer(l.key)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold border transition-all ${activeLayer === l.key
                    ? "bg-blue-600 border-blue-500 text-white"
                    : "bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-700/60"
                    }`}
                >
                  <l.icon className="h-3.5 w-3.5" /> {l.label}
                </button>
              ))}
            </div>
          </div>

          <div
            onClick={() => navigate("/map", { state: { layer: activeLayer } })}
            className="relative h-72 rounded-xl border border-slate-700/60 bg-gradient-to-br from-slate-800/60 via-slate-900 to-slate-900 flex items-center justify-center cursor-pointer overflow-hidden group"
          >
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_30%_40%,#f87171_0,transparent_35%),radial-gradient(circle_at_70%_60%,#fb923c_0,transparent_30%),radial-gradient(circle_at_50%_80%,#facc15_0,transparent_25%)]" />
            <div className="relative text-center space-y-2">
              <MapPin className="h-8 w-8 text-blue-400 mx-auto" />
              <p className="text-sm font-semibold text-slate-200">
                {LAYERS.find((l) => l.key === activeLayer)?.label} preview
              </p>
              <p className="text-xs text-slate-500 group-hover:text-blue-400 transition-colors">
                Click to open full live monitoring map
              </p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="glass-panel p-6 rounded-2xl space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-orange-400" /> Quick Actions
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <ActionButton label="Report Accident" icon={ShieldAlert} color="red" onClick={() => navigate("/accidents/report")} />
            <ActionButton label="Report Congestion" icon={MessageSquareWarning} color="orange" onClick={() => navigate("/congestion/report")} />
            <ActionButton label="Update Traffic" icon={PencilLine} color="blue" onClick={() => navigate("/traffic-records")} />
            <ActionButton label="Emergency" icon={PhoneCall} color="red" onClick={() => navigate("/emergency")} />
            <ActionButton label="Heatmap" icon={Flame} color="purple" onClick={() => navigate("/heatmap")} />
            <ActionButton label="Route Prediction" icon={Route} color="emerald" onClick={() => navigate("/route-prediction")} />
          </div>
        </div>

      </div>
    </Layout>
  );
}

export default OperatorDashboard;
