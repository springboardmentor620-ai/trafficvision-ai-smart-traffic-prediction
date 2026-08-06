import { useEffect, useState, useCallback } from "react";
import Layout from "../components/Layout";
import {
  Cpu, Zap, Radio, RefreshCw, Shield, MapPin,
  CheckCircle, AlertTriangle, Clock, ArrowRight, UserCheck
} from "lucide-react";

const API = "http://localhost:8000";

const URGENCY_CFG = {
  Critical: { bg: "bg-red-500/15 border-red-500/40",    text: "text-red-400",    badge: "bg-red-600"    },
  High:     { bg: "bg-orange-500/15 border-orange-500/40", text: "text-orange-400", badge: "bg-orange-600" },
  Medium:   { bg: "bg-yellow-500/15 border-yellow-500/40", text: "text-yellow-400", badge: "bg-yellow-600" },
  Low:      { bg: "bg-green-500/15 border-green-500/40",  text: "text-green-400",  badge: "bg-green-600"  },
};

export default function Recommendations() {
  const [data, setData]       = useState(null);
  const [signals, setSignals] = useState([]);
  const [police, setPolice]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [activeTab, setActiveTab] = useState("all");

  const loadData = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const [recsRes, sigRes, polRes] = await Promise.all([
        fetch(`${API}/recommendations/`),
        fetch(`${API}/recommendations/signal-optimization`),
        fetch(`${API}/recommendations/police-deployment`),
      ]);

      if (!recsRes.ok) throw new Error("Failed to fetch AI recommendations");

      setData(await recsRes.json());
      setSignals((await sigRes.json()).optimizations || []);
      setPolice(await polRes.json());
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const recs = data?.recommendations || [];
  const filteredRecs = activeTab === "critical"
    ? recs.filter(r => r.predicted_urgency === "Critical")
    : activeTab === "police"
    ? recs.filter(r => r.deploy_police)
    : recs;

  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Cpu className="w-7 h-7 text-purple-400" />
              AI Traffic Recommendations Engine
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Random Forest model predictions · Signal timing optimization · Police deployment advisories
            </p>
          </div>
          <button onClick={loadData}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 transition-colors self-start">
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} /> Refresh Engine
          </button>
        </div>

        {error && (
          <div className="rounded-xl bg-red-500/15 border border-red-500/30 p-4 text-sm text-red-400">⚠ {error}</div>
        )}

        {/* KPI Banner */}
        {data && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-2xl border p-5 bg-purple-500/10 border-purple-500/30">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400">Target Hour</span>
                <Clock className="w-5 h-5 text-purple-400" />
              </div>
              <p className="text-2xl font-bold text-white mt-2">{data.prediction_hour}</p>
              <p className="text-xs text-purple-400 mt-1">Next hour prediction window</p>
            </div>
            <div className="rounded-2xl border p-5 bg-red-500/10 border-red-500/30">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400">Critical Locations</span>
                <AlertTriangle className="w-5 h-5 text-red-400" />
              </div>
              <p className="text-2xl font-bold text-red-400 mt-2">{data.critical_count}</p>
              <p className="text-xs text-red-300 mt-1">Requires immediate intervention</p>
            </div>
            <div className="rounded-2xl border p-5 bg-orange-500/10 border-orange-500/30">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400">Police Deployments</span>
                <UserCheck className="w-5 h-5 text-orange-400" />
              </div>
              <p className="text-2xl font-bold text-orange-400 mt-2">{police?.junctions_needing_police || 0}</p>
              <p className="text-xs text-orange-300 mt-1">Junctions flagged for officers</p>
            </div>
            <div className="rounded-2xl border p-5 bg-blue-500/10 border-blue-500/30">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400">Optimized Signals</span>
                <Zap className="w-5 h-5 text-blue-400" />
              </div>
              <p className="text-2xl font-bold text-blue-400 mt-2">{signals.length}</p>
              <p className="text-xs text-blue-300 mt-1">Dynamic signal cycle rules</p>
            </div>
          </div>
        )}

        {/* Tab Filters */}
        <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-4 flex gap-2 items-center">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mr-2">View:</span>
          {[
            { id: "all", label: `All Recommendations (${recs.length})` },
            { id: "critical", label: `Critical Priority (${data?.critical_count || 0})` },
            { id: "police", label: `Police Deployments Needed (${police?.junctions_needing_police || 0})` },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors
                ${activeTab === tab.id ? "bg-purple-600 text-white" : "bg-slate-800 text-slate-400 hover:bg-slate-700"}`}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Recommendations Cards */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="rounded-2xl bg-slate-800/60 border border-slate-700/50 p-5 h-64 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredRecs.map((r, i) => {
              const cfg = URGENCY_CFG[r.predicted_urgency] || URGENCY_CFG.Low;
              return (
                <div key={i} className={`rounded-2xl border p-5 transition-all duration-300 hover:scale-[1.01] ${cfg.bg}`}>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-purple-400" />
                        <h3 className="text-sm font-bold text-white">{r.location}</h3>
                      </div>
                      <span className={`inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full text-white ${cfg.badge}`}>
                        {r.predicted_urgency} Urgency
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-400">RF Predicted</p>
                      <p className="text-lg font-bold text-purple-300">{r.predicted_vehicle_count} <span className="text-xs font-normal">veh</span></p>
                    </div>
                  </div>

                  <div className="bg-slate-900/80 rounded-xl p-3.5 mb-3 border border-slate-700/50">
                    <p className="text-xs font-semibold text-purple-400 mb-1 flex items-center gap-1">
                      <Zap className="w-3.5 h-3.5" /> AI Recommendation
                    </p>
                    <p className="text-xs text-slate-300 leading-relaxed">{r.ai_recommendation}</p>
                  </div>

                  {/* Signal Timing Rule */}
                  {r.signal_optimization && (
                    <div className="flex items-center justify-between text-xs text-slate-400 bg-slate-800/40 rounded-lg p-2.5 mb-2">
                      <span>Green: <strong className="text-emerald-400">{r.signal_optimization.green_time}s</strong></span>
                      <span>Red: <strong className="text-red-400">{r.signal_optimization.red_time}s</strong></span>
                      <span className="text-[10px] text-slate-500 font-semibold">{r.signal_optimization.strategy?.split("—")[0]}</span>
                    </div>
                  )}

                  {r.deploy_police && (
                    <div className="flex items-center gap-1.5 text-xs text-red-400 font-bold bg-red-500/20 rounded-lg p-2 border border-red-500/30">
                      🚔 Police Deployment Advisory Active
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Signal Optimization Table */}
        {signals.length > 0 && (
          <div className="rounded-2xl bg-slate-900/70 border border-slate-800 overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Radio className="w-4 h-4 text-blue-400" />
                Traffic Signal Timing Strategy Table
              </h3>
              <span className="text-xs text-slate-400">{signals.length} Junctions Optimized</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-800 text-xs font-semibold text-slate-400">
                    <th className="px-4 py-3 text-left">Location</th>
                    <th className="px-4 py-3 text-left">Predicted Volume</th>
                    <th className="px-4 py-3 text-left">Green Time</th>
                    <th className="px-4 py-3 text-left">Red Time</th>
                    <th className="px-4 py-3 text-left">Cycle</th>
                    <th className="px-4 py-3 text-left">Strategy</th>
                  </tr>
                </thead>
                <tbody>
                  {signals.map((s, i) => (
                    <tr key={i} className="border-b border-slate-800/50 hover:bg-slate-800/40 transition-colors">
                      <td className="px-4 py-3 font-semibold text-white">{s.location}</td>
                      <td className="px-4 py-3 font-bold text-purple-300">{s.predicted_volume} vehicles</td>
                      <td className="px-4 py-3 font-bold text-emerald-400">{s.recommended_green_time_sec}s</td>
                      <td className="px-4 py-3 font-bold text-red-400">{s.recommended_red_time_sec}s</td>
                      <td className="px-4 py-3 text-slate-300">{s.cycle_length_sec}s</td>
                      <td className="px-4 py-3 text-xs text-slate-400">{s.strategy}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
