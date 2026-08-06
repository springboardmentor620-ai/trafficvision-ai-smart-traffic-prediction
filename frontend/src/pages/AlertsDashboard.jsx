import { useEffect, useState, useCallback } from "react";
import Layout from "../components/Layout";
import {
  AlertTriangle, Zap, Car, Shield, Activity,
  CheckCircle, Clock, RefreshCw, Filter, Bell, MapPin, ChevronRight
} from "lucide-react";

const API = "http://localhost:8000";

const SEVERITY_CONFIG = {
  Critical: { color: "red", bg: "bg-red-500/10", border: "border-red-500/30", text: "text-red-400", badge: "bg-red-600" },
  High: { color: "orange", bg: "bg-orange-500/10", border: "border-orange-500/30", text: "text-orange-400", badge: "bg-orange-600" },
  Medium: { color: "yellow", bg: "bg-yellow-500/10", border: "border-yellow-500/30", text: "text-yellow-400", badge: "bg-yellow-600" },
  Low: { color: "green", bg: "bg-green-500/10", border: "border-green-500/30", text: "text-green-400", badge: "bg-green-600" },
};

const TYPE_ICONS = {
  Congestion: Car,
  Accident: AlertTriangle,
  RouteDelay: Clock,
  Emergency: Zap,
};

const TYPE_COLORS = {
  Congestion: "text-orange-400",
  Accident: "text-red-400",
  RouteDelay: "text-yellow-400",
  Emergency: "text-purple-400",
};

function SummaryCard({ label, value, color, icon: Icon }) {
  const colorMap = {
    red: "bg-red-500/10 border-red-500/20 text-red-400",
    orange: "bg-orange-500/10 border-orange-500/20 text-orange-400",
    yellow: "bg-yellow-500/10 border-yellow-500/20 text-yellow-400",
    green: "bg-green-500/10 border-green-500/20 text-green-400",
    blue: "bg-blue-500/10 border-blue-500/20 text-blue-400",
  };

  return (
    <div className={`rounded-2xl border p-4 sm:p-5 flex items-center gap-4 backdrop-blur-md transition-all hover:shadow-lg ${colorMap[color] || "bg-slate-800/40 border-slate-700/50"}`}>
      <div className={`p-3 rounded-xl bg-white/5`}>
        <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
      </div>
      <div className="min-w-0">
        <p className="text-xl sm:text-2xl font-bold text-white truncate">{value}</p>
        <p className="text-[10px] sm:text-xs text-slate-400 uppercase tracking-wider font-medium mt-0.5 truncate">{label}</p>
      </div>
    </div>
  );
}

function AlertCard({ alert, onResolve, onAcknowledge }) {
  const cfg = SEVERITY_CONFIG[alert.severity] || SEVERITY_CONFIG.Low;
  const Icon = TYPE_ICONS[alert.alert_type] || Bell;

  return (
    <div className={`flex flex-col h-full rounded-2xl border transition-all duration-300 hover:translate-y-[-2px] hover:shadow-xl ${cfg.bg} ${cfg.border}`}>
      <div className="p-5 flex-grow">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2.5 rounded-xl bg-slate-900/80 shrink-0 shadow-inner">
              <Icon className={`w-5 h-5 ${TYPE_COLORS[alert.alert_type] || "text-slate-400"}`} />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`text-sm font-bold tracking-tight truncate ${cfg.text}`}>{alert.alert_type}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full text-white shadow-sm ${cfg.badge}`}>
                  {alert.severity}
                </span>
              </div>
              <div className="flex items-center gap-1.5 mt-1">
                <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span className="text-xs text-slate-300 font-medium truncate">{alert.location}</span>
              </div>
            </div>
          </div>
          <div className="shrink-0 text-right">
            <span className="text-[10px] text-slate-500 font-mono block">
              {alert.created_at ? new Date(alert.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "—"}
            </span>
            <span className="text-[9px] text-slate-600 block">
              {alert.created_at ? new Date(alert.created_at).toLocaleDateString() : ""}
            </span>
          </div>
        </div>

        {/* Status Badges for Non-Active */}
        <div className="flex gap-2 mb-3">
          {alert.status === "Resolved" && (
            <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/20">
              <CheckCircle className="w-3 h-3" /> RESOLVED
            </span>
          )}
          {alert.status === "Acknowledged" && (
            <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/20">
              <Activity className="w-3 h-3" /> ACKNOWLEDGED
            </span>
          )}
        </div>

        {/* Description */}
        <p className="text-sm text-slate-300 mb-4 line-clamp-3 leading-relaxed">
          {alert.description}
        </p>

        {/* Recommendation */}
        {alert.recommendation && (
          <div className="bg-slate-950/40 rounded-xl p-3 border border-slate-800/50">
            <div className="flex items-center gap-1.5 mb-1.5">
              <Zap className="w-3 h-3 text-blue-400" />
              <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">AI Suggestion</p>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed italic line-clamp-2">
              "{alert.recommendation}"
            </p>
          </div>
        )}
      </div>

      {/* Actions */}
      {alert.status === "Active" && (
        <div className="p-4 pt-0 mt-auto">
          <div className="flex gap-2">
            <button
              onClick={() => onAcknowledge(alert.id)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-bold bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 hover:text-white transition-all active:scale-95"
            >
              <Bell className="w-3.5 h-3.5" /> ACK
            </button>
            <button
              onClick={() => onResolve(alert.id)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-bold bg-emerald-600 text-white shadow-lg shadow-emerald-900/20 hover:bg-emerald-500 transition-all active:scale-95"
            >
              <CheckCircle className="w-3.5 h-3.5" /> RESOLVE
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AlertsDashboard() {
  const [alerts, setAlerts] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [filterType, setFilterType] = useState("All");
  const [filterSev, setFilterSev] = useState("All");
  const [filterStatus, setFilterStatus] = useState("Active");
  const [error, setError] = useState(null);

  const loadAlerts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({ limit: 200 });
      if (filterType !== "All") params.append("alert_type", filterType);
      if (filterSev !== "All") params.append("severity", filterSev);
      if (filterStatus !== "All") params.append("status", filterStatus);

      const [alertsRes, summaryRes] = await Promise.all([
        fetch(`${API}/alerts/?${params}`),
        fetch(`${API}/alerts/summary`),
      ]);

      if (!alertsRes.ok) throw new Error("Connection failed");

      setAlerts(await alertsRes.json());
      setSummary(await summaryRes.json());
    } catch (e) {
      setError("Unable to sync with traffic server. Please check connection.");
    } finally {
      setLoading(false);
    }
  }, [filterType, filterSev, filterStatus]);

  useEffect(() => { loadAlerts(); }, [loadAlerts]);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const res = await fetch(`${API}/alerts/generate`, { method: "POST" });
      if (!res.ok) throw new Error("Generation failed");
      await loadAlerts();
    } catch (e) {
      setError("Failed to generate new alerts.");
    } finally {
      setGenerating(false);
    }
  };

  const handleResolve = async (id) => {
    await fetch(`${API}/alerts/${id}/resolve`, { method: "PATCH" });
    loadAlerts();
  };

  const handleAcknowledge = async (id) => {
    await fetch(`${API}/alerts/${id}/acknowledge`, { method: "PATCH" });
    loadAlerts();
  };

  const TYPES = ["All", "Congestion", "Accident", "RouteDelay", "Emergency"];
  const SEVS = ["All", "Critical", "High", "Medium", "Low"];
  const STATUSES = ["All", "Active", "Acknowledged", "Resolved"];

  return (
    <Layout>
      <div className="max-w-[1600px] mx-auto space-y-8 p-2 sm:p-4 animate-in fade-in duration-700">

        {/* ── Header ─────────────────────────────────────────────── */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-2 border-b border-slate-800/50">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-500/20 rounded-lg">
                <AlertTriangle className="w-8 h-8 text-red-500 animate-pulse" />
              </div>
              <h1 className="text-3xl font-black text-white tracking-tight">
                Alert <span className="text-red-500">Command</span>
              </h1>
            </div>
            <p className="text-slate-400 font-medium pl-1">
              Real-time incident monitoring & AI response orchestration
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadAlerts}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-bold bg-slate-900 text-slate-300 border border-slate-800 hover:bg-slate-800 hover:text-white transition-all shadow-xl active:scale-95"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              Sync
            </button>
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-bold bg-red-600 text-white hover:bg-red-500 transition-all shadow-lg shadow-red-900/20 disabled:opacity-50 active:scale-95"
            >
              <Zap className={`w-4 h-4 ${generating ? "animate-bounce" : ""}`} />
              {generating ? "Scanning..." : "Scan Traffic"}
            </button>
          </div>
        </div>

        {/* ── Error ──────────────────────────────────────────────── */}
        {error && (
          <div className="rounded-2xl bg-red-500/10 border border-red-500/20 p-4 flex items-center gap-3 text-sm text-red-400 animate-in slide-in-from-top-2">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <span className="font-semibold">{error}</span>
          </div>
        )}

        {/* ── Summary Cards ───────────────────────────────────────── */}
        {summary && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            <SummaryCard label="Total Feed" value={summary.total} color="blue" icon={Bell} />
            <SummaryCard label="Critical" value={summary.by_severity?.Critical || 0} color="red" icon={Zap} />
            <SummaryCard label="High Priority" value={summary.by_severity?.High || 0} color="orange" icon={AlertTriangle} />
            <SummaryCard label="Active Incidents" value={summary.by_status?.Active || 0} color="red" icon={Activity} />
            <SummaryCard label="Accidents" value={summary.by_type?.Accident || 0} color="orange" icon={Car} />
            <SummaryCard label="Resolved" value={summary.by_status?.Resolved || 0} color="green" icon={CheckCircle} />
          </div>
        )}

        {/* ── Filter & Control Bar ────────────────────────────────── */}
        <div className="sticky top-4 z-30 rounded-3xl bg-slate-900/80 backdrop-blur-xl border border-slate-800/50 p-3 sm:p-4 shadow-2xl">
          <div className="flex flex-col xl:flex-row gap-6 xl:items-center">

            {/* Filter Groups */}
            <div className="flex flex-col md:flex-row gap-6 flex-grow">

              {/* Type Filter */}
              <div className="space-y-2">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Incident Type</p>
                <div className="flex flex-wrap gap-1.5">
                  {TYPES.map(t => (
                    <button key={t} onClick={() => setFilterType(t)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all
                        ${filterType === t ? "bg-blue-600 text-white shadow-md shadow-blue-900/20" : "bg-slate-800/50 text-slate-400 hover:bg-slate-800"}`}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div className="hidden md:block w-px h-10 bg-slate-800 self-end mb-1"></div>

              {/* Severity Filter */}
              <div className="space-y-2">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Priority</p>
                <div className="flex flex-wrap gap-1.5">
                  {SEVS.map(s => (
                    <button key={s} onClick={() => setFilterSev(s)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all
                        ${filterSev === s ? "bg-blue-600 text-white shadow-md shadow-blue-900/20" : "bg-slate-800/50 text-slate-400 hover:bg-slate-800"}`}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div className="hidden md:block w-px h-10 bg-slate-800 self-end mb-1"></div>

              {/* Status Filter */}
              <div className="space-y-2">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Lifecycle</p>
                <div className="flex flex-wrap gap-1.5">
                  {STATUSES.map(s => (
                    <button key={s} onClick={() => setFilterStatus(s)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all
                        ${filterStatus === s ? "bg-blue-600 text-white shadow-md shadow-blue-900/20" : "bg-slate-800/50 text-slate-400 hover:bg-slate-800"}`}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Results Count */}
            <div className="shrink-0 flex items-center justify-between xl:justify-end gap-4 border-t xl:border-t-0 border-slate-800 pt-4 xl:pt-0">
              <div className="text-right">
                <p className="text-2xl font-black text-white leading-none">{alerts.length}</p>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter mt-1">Matched Records</p>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-700 hidden xl:block" />
            </div>

          </div>
        </div>

        {/* ── Alert Grid ──────────────────────────────────────────── */}
        <div className="min-h-[400px]">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="rounded-3xl bg-slate-900/40 border border-slate-800/50 p-6 animate-pulse h-[280px]" />
              ))}
            </div>
          ) : alerts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 text-slate-600 bg-slate-900/20 rounded-3xl border-2 border-dashed border-slate-800/50">
              <div className="p-6 bg-slate-900/50 rounded-full mb-6">
                <Shield className="w-16 h-16 opacity-20" />
              </div>
              <p className="text-xl font-bold text-slate-400">Clear Skies</p>
              <p className="text-sm mt-2 font-medium">No incidents matching your current filters.</p>
              <button
                onClick={() => { setFilterType("All"); setFilterSev("All"); setFilterStatus("All"); }}
                className="mt-6 text-blue-500 font-bold text-xs hover:underline"
              >
                Reset all filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
              {alerts.map(alert => (
                <AlertCard
                  key={alert.id}
                  alert={alert}
                  onResolve={handleResolve}
                  onAcknowledge={handleAcknowledge}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="text-center py-10">
          <p className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.2em]">Traffic Management System v4.2.0 • Live Data Stream</p>
        </div>
      </div>
    </Layout>
  );
}
