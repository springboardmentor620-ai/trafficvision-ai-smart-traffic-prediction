import { useEffect, useState, useCallback } from "react";
import Layout from "../components/Layout";
import authFetch from "../api/http";
import {
  Car, AlertTriangle, MapPin, CheckCircle, RefreshCw,
  Zap, Shield, Clock, Navigation, Radio
} from "lucide-react";


const SEVERITY_CFG = {
  Fatal: { bg: "bg-red-950/60", border: "border-red-500/50", badge: "bg-red-600", text: "text-red-400" },
  Major: { bg: "bg-orange-950/60", border: "border-orange-500/50", badge: "bg-orange-600", text: "text-orange-400" },
  Minor: { bg: "bg-yellow-950/60", border: "border-yellow-500/50", badge: "bg-yellow-600", text: "text-yellow-400" },
};

const STATUS_CFG = {
  Active: { badge: "bg-red-500", label: "🔴 Active" },
  "Under Control": { badge: "bg-yellow-500", label: "🟡 Under Control" },
  Cleared: { badge: "bg-green-500", label: "✅ Cleared" },
};

const ROAD_STATUS_COLOR = {
  "Fully Blocked": "text-red-400",
  "Partially Blocked": "text-yellow-400",
  "Open": "text-green-400",
};

function AccidentCard({ acc, onClear }) {
  const sev = SEVERITY_CFG[acc.severity] || SEVERITY_CFG.Minor;
  const st = STATUS_CFG[acc.status] || STATUS_CFG.Active;

  return (
    <div className={`rounded-2xl border p-5 transition-all duration-300 hover:scale-[1.01] ${sev.bg} ${sev.border}`}>
      {/* Title row */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-slate-800/70">
            <Car className="w-5 h-5 text-red-400" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-sm font-bold ${sev.text}`}>{acc.severity} Accident</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full text-white ${sev.badge}`}>
                {acc.severity}
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full text-white ${st.badge}`}>
                {acc.status}
              </span>
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-xs text-slate-300">{acc.location}</span>
            </div>
          </div>
        </div>
        <span className="text-[11px] text-slate-500">
          {acc.reported_at ? new Date(acc.reported_at).toLocaleString() : "—"}
        </span>
      </div>

      {/* Road status */}
      <div className="flex items-center gap-2 mb-3">
        <Radio className="w-4 h-4 text-slate-400" />
        <span className="text-xs text-slate-400">Road Status:</span>
        <span className={`text-xs font-bold ${ROAD_STATUS_COLOR[acc.road_status] || "text-slate-300"}`}>
          {acc.road_status}
        </span>
        <span className="text-xs text-slate-500 ml-2">Source: {acc.source}</span>
      </div>

      {/* Diversion */}
      <div className="bg-slate-900/70 rounded-xl p-3 mb-4 border border-slate-700/40">
        <div className="flex items-center gap-1.5 mb-1">
          <Navigation className="w-3.5 h-3.5 text-blue-400" />
          <span className="text-xs font-semibold text-blue-400">Suggested Diversion</span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">{acc.diversion_route}</p>
      </div>

      {/* Notes */}
      {acc.notes && (
        <p className="text-xs text-slate-500 mb-3 italic">{acc.notes}</p>
      )}

      {/* Clear button */}
      {acc.status !== "Cleared" && (
        <button
          onClick={() => onClear(acc.id)}
          className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-semibold bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30 transition-colors"
        >
          <CheckCircle className="w-4 h-4" /> Mark as Cleared
        </button>
      )}
    </div>
  );
}

export default function Accidents() {
  const [accidents, setAccidents] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [simulating, setSimulating] = useState(false);
  const [filterSev, setFilterSev] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [error, setError] = useState(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ limit: 200 });
      if (filterSev !== "All") params.append("severity", filterSev);
      if (filterStatus !== "All") params.append("status", filterStatus);

      const res = await authFetch(`/accidents/?${params}`);
      if (!res.ok) throw new Error("Failed to fetch accidents");
      const data = await res.json();
      setAccidents(data);

      // Build local summary
      const total = data.length;
      const active = data.filter(a => a.status === "Active").length;
      const fatal = data.filter(a => a.severity === "Fatal").length;
      const major = data.filter(a => a.severity === "Major").length;
      const cleared = data.filter(a => a.status === "Cleared").length;
      setSummary({ total, active, fatal, major, cleared });
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [filterSev, filterStatus]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleSimulate = async () => {
    setSimulating(true);
    try {
      const res = await authFetch(`/accidents/simulate`, { method: "POST" });
      if (!res.ok) throw new Error("Simulation failed");
      await loadData();
    } catch (e) {
      setError(e.message);
    } finally {
      setSimulating(false);
    }
  };

  const handleClear = async (id) => {
    await authFetch(`/accidents/${id}/clear`, { method: "PATCH" });
    loadData();
  };

  const SEVS = ["All", "Fatal", "Major", "Minor"];
  const STATUSES = ["All", "Active", "Under Control", "Cleared"];

  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Car className="w-7 h-7 text-red-400" />
              Accident Notification System
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Simulated from traffic DB · Future: CCTV · GPS · Government API
            </p>
          </div>
          <div className="flex gap-3">
            <button onClick={loadData}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 transition-colors">
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </button>
            <button onClick={handleSimulate} disabled={simulating}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-red-600 text-white hover:bg-red-500 transition-colors disabled:opacity-50">
              <Zap className="w-4 h-4" />
              {simulating ? "Simulating…" : "Simulate from DB"}
            </button>
          </div>
        </div>

        {error && (
          <div className="rounded-xl bg-red-500/15 border border-red-500/30 p-4 text-sm text-red-400">⚠ {error}</div>
        )}

        {/* Summary */}
        {summary && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {[
              { label: "Total Accidents", value: summary.total, color: "bg-slate-800/80 border-slate-700", text: "text-white" },
              { label: "Active", value: summary.active, color: "bg-red-500/15 border-red-500/30", text: "text-red-400" },
              { label: "Fatal", value: summary.fatal, color: "bg-red-900/40 border-red-700/40", text: "text-red-300" },
              { label: "Major", value: summary.major, color: "bg-orange-500/15 border-orange-500/30", text: "text-orange-400" },
              { label: "Cleared", value: summary.cleared, color: "bg-green-500/15 border-green-500/30", text: "text-green-400" },
            ].map(card => (
              <div key={card.label} className={`rounded-2xl border p-4 text-center ${card.color}`}>
                <p className={`text-2xl font-bold ${card.text}`}>{card.value}</p>
                <p className="text-xs text-slate-400 mt-1">{card.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Filters */}
        <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-4 flex flex-wrap gap-3 items-center">
          <span className="text-sm font-semibold text-slate-300">Severity:</span>
          {SEVS.map(s => (
            <button key={s} onClick={() => setFilterSev(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors
                ${filterSev === s ? "bg-blue-600 text-white" : "bg-slate-800 text-slate-400 hover:bg-slate-700"}`}>
              {s}
            </button>
          ))}
          <span className="text-slate-700 hidden sm:block">|</span>
          <span className="text-sm font-semibold text-slate-300">Status:</span>
          {STATUSES.map(s => (
            <button key={s} onClick={() => setFilterStatus(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors
                ${filterStatus === s ? "bg-blue-600 text-white" : "bg-slate-800 text-slate-400 hover:bg-slate-700"}`}>
              {s}
            </button>
          ))}
          <span className="ml-auto text-sm text-slate-400">{accidents.length} record{accidents.length !== 1 ? "s" : ""}</span>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="rounded-2xl bg-slate-800/60 border border-slate-700/50 p-5 animate-pulse h-60" />
            ))}
          </div>
        ) : accidents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-500">
            <Shield className="w-16 h-16 mb-4 opacity-30" />
            <p className="text-lg font-semibold">No accident records found</p>
            <p className="text-sm mt-1">Click "Simulate from DB" to generate from traffic data</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {accidents.map(acc => (
              <AccidentCard key={acc.id} acc={acc} onClear={handleClear} />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
