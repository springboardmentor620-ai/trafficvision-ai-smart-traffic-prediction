import { useEffect, useState, useCallback } from "react";
import Layout from "../components/Layout";
import authFetch from "../api/http";
import {
  Siren, Zap, RefreshCw, CheckCircle, Shield,
  MapPin, Radio, Navigation, AlertTriangle, Plus, X
} from "lucide-react";


const EMERGENCY_TYPES = ["Ambulance", "FireVehicle", "PoliceVehicle", "RoadBlock", "VIPMovement"];

const TYPE_CFG = {
  Ambulance:     { icon: "🚑", color: "text-red-400",    bg: "bg-red-950/50    border-red-500/40",    badge: "bg-red-600"    },
  FireVehicle:   { icon: "🚒", color: "text-orange-400", bg: "bg-orange-950/50 border-orange-500/40", badge: "bg-orange-600" },
  PoliceVehicle: { icon: "🚔", color: "text-blue-400",   bg: "bg-blue-950/50   border-blue-500/40",   badge: "bg-blue-600"   },
  RoadBlock:     { icon: "🚧", color: "text-yellow-400", bg: "bg-yellow-950/50 border-yellow-500/40", badge: "bg-yellow-600" },
  VIPMovement:   { icon: "🚐", color: "text-purple-400", bg: "bg-purple-950/50 border-purple-500/40", badge: "bg-purple-600" },
};

const STATUS_BADGE = {
  Active:     "bg-red-500    text-white",
  "En Route": "bg-yellow-500 text-black",
  Resolved:   "bg-green-600  text-white",
};

function EmergencyCard({ alert, onResolve, onRouteClear }) {
  const cfg = TYPE_CFG[alert.emergency_type] || TYPE_CFG.RoadBlock;

  return (
    <div className={`rounded-2xl border p-5 transition-all duration-300 hover:scale-[1.01] ${cfg.bg}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className="text-3xl leading-none">{cfg.icon}</span>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-sm font-bold ${cfg.color}`}>{alert.emergency_type}</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full text-white ${cfg.badge}`}>
                CRITICAL
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${STATUS_BADGE[alert.status] || STATUS_BADGE.Active}`}>
                {alert.status}
              </span>
              {alert.route_cleared && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-600 text-white">
                  Route Cleared ✓
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-xs text-slate-300">{alert.location}</span>
            </div>
          </div>
        </div>
        <span className="text-[11px] text-slate-500 text-right">
          {alert.created_at ? new Date(alert.created_at).toLocaleString() : "—"}
        </span>
      </div>

      {/* Protocol */}
      <div className="bg-slate-900/70 rounded-xl p-3 mb-4 border border-slate-700/40">
        <div className="flex items-center gap-1.5 mb-1">
          <Radio className="w-3.5 h-3.5 text-blue-400" />
          <span className="text-xs font-semibold text-blue-400">Action Protocol</span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">{alert.action_protocol}</p>
      </div>

      {/* Affected junctions */}
      {alert.affected_junctions && (
        <div className="flex items-center gap-2 mb-3 text-xs text-slate-400">
          <Navigation className="w-3.5 h-3.5" />
          Affected: <span className="text-slate-300">{alert.affected_junctions}</span>
        </div>
      )}
      {alert.contact_unit && (
        <p className="text-xs text-slate-500 mb-3">Contact: {alert.contact_unit}</p>
      )}

      {/* Actions */}
      {alert.status !== "Resolved" && (
        <div className="flex gap-2">
          {!alert.route_cleared && (
            <button onClick={() => onRouteClear(alert.id)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 hover:bg-yellow-500/30 transition-colors">
              <Navigation className="w-3.5 h-3.5" /> Clear Route
            </button>
          )}
          <button onClick={() => onResolve(alert.id)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30 transition-colors">
            <CheckCircle className="w-3.5 h-3.5" /> Resolve
          </button>
        </div>
      )}
    </div>
  );
}

function CreateEmergencyModal({ onClose, onCreate }) {
  const [form, setForm] = useState({
    emergency_type: "Ambulance", location: "", latitude: "", longitude: "",
    affected_junctions: "", contact_unit: "", notes: ""
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authFetch(`/emergency/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          latitude: form.latitude ? parseFloat(form.latitude) : null,
          longitude: form.longitude ? parseFloat(form.longitude) : null,
        }),
      });
      onCreate();
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-lg">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Zap className="w-5 h-5 text-red-400" />
            Create Emergency Alert
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">Emergency Type *</label>
            <select value={form.emergency_type} onChange={e => setForm({...form, emergency_type: e.target.value})}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white">
              {EMERGENCY_TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">Location *</label>
            <input required value={form.location} onChange={e => setForm({...form, location: e.target.value})}
              placeholder="e.g. MG Road Junction, Pune"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white placeholder-slate-500" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">Latitude</label>
              <input type="number" step="any" value={form.latitude} onChange={e => setForm({...form, latitude: e.target.value})}
                placeholder="18.5204"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white placeholder-slate-500" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">Longitude</label>
              <input type="number" step="any" value={form.longitude} onChange={e => setForm({...form, longitude: e.target.value})}
                placeholder="73.8567"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white placeholder-slate-500" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">Affected Junctions</label>
            <input value={form.affected_junctions} onChange={e => setForm({...form, affected_junctions: e.target.value})}
              placeholder="Junction A, Junction B"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white placeholder-slate-500" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">Contact Unit</label>
            <input value={form.contact_unit} onChange={e => setForm({...form, contact_unit: e.target.value})}
              placeholder="Ambulance Unit 7 | Control Room 101"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white placeholder-slate-500" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">Notes</label>
            <textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})}
              rows={2} placeholder="Additional information..."
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white placeholder-slate-500 resize-none" />
          </div>
          <button type="submit" disabled={loading}
            className="w-full py-3 rounded-xl text-sm font-bold bg-red-600 text-white hover:bg-red-500 transition-colors disabled:opacity-50">
            {loading ? "Creating…" : "🚨 Create Emergency Alert"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function Emergency() {
  const [alerts, setAlerts]     = useState([]);
  const [summary, setSummary]   = useState(null);
  const [loading, setLoading]   = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [filterType, setFilterType] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [error, setError]       = useState(null);

  const loadData = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const params = new URLSearchParams({ limit: 200 });
      if (filterType   !== "All") params.append("emergency_type", filterType);
      if (filterStatus !== "All") params.append("status", filterStatus);

      const [aRes, sRes] = await Promise.all([
        authFetch(`/emergency/?${params}`),
        authFetch(`/emergency/summary`),
      ]);
      setAlerts(await aRes.json());
      setSummary(await sRes.json());
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }, [filterType, filterStatus]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleSimulate = async () => {
    await authFetch(`/emergency/simulate`, { method: "POST" });
    loadData();
  };

  const handleResolve = async (id) => {
    await authFetch(`/emergency/${id}/resolve`, { method: "PATCH" });
    loadData();
  };

  const handleRouteClear = async (id) => {
    await authFetch(`/emergency/${id}/route-cleared`, { method: "PATCH" });
    loadData();
  };

  const ALL_TYPES   = ["All", ...EMERGENCY_TYPES];
  const ALL_STATUS  = ["All", "Active", "En Route", "Resolved"];

  return (
    <Layout>
      {showModal && (
        <CreateEmergencyModal onClose={() => setShowModal(false)} onCreate={loadData} />
      )}
      <div className="space-y-6 animate-fade-in">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Siren className="w-7 h-7 text-red-500 animate-pulse" />
              Emergency Traffic Alert Module
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Ambulance · Fire Vehicle · Police · Road Block · VIP Movement
            </p>
          </div>
          <div className="flex gap-3 flex-wrap">
            <button onClick={loadData}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 transition-colors">
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </button>
            <button onClick={handleSimulate}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-orange-600 text-white hover:bg-orange-500 transition-colors">
              <Zap className="w-4 h-4" /> Simulate from DB
            </button>
            <button onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-red-600 text-white hover:bg-red-500 transition-colors">
              <Plus className="w-4 h-4" /> New Emergency
            </button>
          </div>
        </div>

        {error && <div className="rounded-xl bg-red-500/15 border border-red-500/30 p-4 text-sm text-red-400">⚠ {error}</div>}

        {/* Summary */}
        {summary && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { label: "Total",     value: summary.total,                    c: "border-slate-700 bg-slate-800/60" },
              { label: "Active",    value: summary.active,                   c: "border-red-500/30    bg-red-500/10" },
              { label: "Ambulance", value: summary.by_type?.Ambulance || 0,  c: "border-red-500/30    bg-red-950/40" },
              { label: "Fire",      value: summary.by_type?.FireVehicle || 0,c: "border-orange-500/30 bg-orange-950/40" },
              { label: "Police",    value: summary.by_type?.PoliceVehicle||0,c: "border-blue-500/30   bg-blue-950/40" },
              { label: "VIP",       value: summary.by_type?.VIPMovement || 0,c: "border-purple-500/30 bg-purple-950/40" },
            ].map(card => (
              <div key={card.label} className={`rounded-2xl border p-4 text-center ${card.c}`}>
                <p className="text-2xl font-bold text-white">{card.value}</p>
                <p className="text-xs text-slate-400 mt-1">{card.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Filters */}
        <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-4 flex flex-wrap gap-3 items-center">
          <span className="text-sm font-semibold text-slate-300">Type:</span>
          {ALL_TYPES.map(t => (
            <button key={t} onClick={() => setFilterType(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors
                ${filterType === t ? "bg-blue-600 text-white" : "bg-slate-800 text-slate-400 hover:bg-slate-700"}`}>
              {t}
            </button>
          ))}
          <span className="text-slate-700">|</span>
          <span className="text-sm font-semibold text-slate-300">Status:</span>
          {ALL_STATUS.map(s => (
            <button key={s} onClick={() => setFilterStatus(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors
                ${filterStatus === s ? "bg-blue-600 text-white" : "bg-slate-800 text-slate-400 hover:bg-slate-700"}`}>
              {s}
            </button>
          ))}
          <span className="ml-auto text-sm text-slate-400">{alerts.length} alert{alerts.length !== 1 ? "s" : ""}</span>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => <div key={i} className="rounded-2xl bg-slate-800/60 border border-slate-700/50 p-5 animate-pulse h-56" />)}
          </div>
        ) : alerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-500">
            <Shield className="w-16 h-16 mb-4 opacity-30" />
            <p className="text-lg font-semibold">No emergency alerts</p>
            <p className="text-sm mt-1">Simulate from DB or create a new alert</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {alerts.map(a => (
              <EmergencyCard key={a.id} alert={a} onResolve={handleResolve} onRouteClear={handleRouteClear} />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
