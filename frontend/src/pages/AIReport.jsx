import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import {
  FileText, Download, RefreshCw, Cpu, MapPin, Clock,
  AlertTriangle, Car, TrendingUp, Shield, CheckCircle,
  Zap, Activity, BarChart3
} from "lucide-react";

const API = "http://localhost:8000";

function StatRow({ label, value, color = "text-white" }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-slate-800/60 last:border-0">
      <span className="text-sm text-slate-400">{label}</span>
      <span className={`text-sm font-bold ${color}`}>{value}</span>
    </div>
  );
}

function ReportSection({ title, icon: Icon, children, color = "blue" }) {
  const colors = {
    blue:   "border-blue-500/30   bg-blue-500/5",
    red:    "border-red-500/30    bg-red-500/5",
    green:  "border-green-500/30  bg-green-500/5",
    purple: "border-purple-500/30 bg-purple-500/5",
    yellow: "border-yellow-500/30 bg-yellow-500/5",
  };
  const iconColors = {
    blue: "text-blue-400", red: "text-red-400", green: "text-green-400",
    purple: "text-purple-400", yellow: "text-yellow-400",
  };
  return (
    <div className={`rounded-2xl border p-5 ${colors[color]}`}>
      <h3 className={`text-sm font-bold mb-4 flex items-center gap-2 ${iconColors[color]}`}>
        <Icon className="w-4 h-4" />
        {title}
      </h3>
      {children}
    </div>
  );
}

export default function AIReport() {
  const [report, setReport]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  const loadReport = async () => {
    setLoading(true); setError(null);
    try {
      const res = await fetch(`${API}/report/ai-report`);
      if (!res.ok) throw new Error("Failed to generate report");
      setReport(await res.json());
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadReport(); }, []);

  const handleDownload = async () => {
    const res = await fetch(`${API}/report/download`);
    const text = await res.text();
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `TrafficVisionAI_Report_${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <Layout>
        <div className="space-y-4">
          <div className="flex items-center gap-3 mb-6">
            <Cpu className="w-8 h-8 text-blue-400 animate-pulse" />
            <div>
              <h1 className="text-2xl font-bold text-white">AI Traffic Report</h1>
              <p className="text-sm text-slate-400">Generating report from MySQL + Random Forest…</p>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="rounded-2xl bg-slate-800/60 border border-slate-700/50 p-5 h-48 animate-pulse" />
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="rounded-xl bg-red-500/15 border border-red-500/30 p-6 text-center">
          <AlertTriangle className="w-10 h-10 text-red-400 mx-auto mb-3" />
          <p className="text-red-400 font-semibold">{error}</p>
          <button onClick={loadReport} className="mt-4 px-4 py-2 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-500 transition-colors">
            Retry
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Cpu className="w-7 h-7 text-blue-400" />
              AI Traffic Intelligence Report
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              {report?.report_date} · {report?.report_time} · Powered by Random Forest ML
            </p>
          </div>
          <div className="flex gap-3">
            <button onClick={loadReport}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 transition-colors">
              <RefreshCw className="w-4 h-4" />
              Regenerate
            </button>
            <button onClick={handleDownload}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-blue-600 text-white hover:bg-blue-500 transition-colors">
              <Download className="w-4 h-4" />
              Download Report
            </button>
          </div>
        </div>

        {/* Overall Status Banner */}
        {report && (
          <div className={`rounded-2xl border p-5 ${
            report.overall_status?.includes("CRITICAL") ? "bg-red-500/15 border-red-500/40" :
            report.overall_status?.includes("HIGH")     ? "bg-orange-500/15 border-orange-500/40" :
            report.overall_status?.includes("MODERATE") ? "bg-yellow-500/15 border-yellow-500/40" :
                                                           "bg-green-500/15 border-green-500/40"
          }`}>
            <div className="flex items-start gap-3">
              <Shield className={`w-6 h-6 mt-0.5 flex-shrink-0 ${
                report.overall_status?.includes("CRITICAL") ? "text-red-400" :
                report.overall_status?.includes("HIGH")     ? "text-orange-400" :
                report.overall_status?.includes("MODERATE") ? "text-yellow-400" :
                                                               "text-green-400"
              }`} />
              <div>
                <p className="text-sm font-bold text-white">{report.overall_status}</p>
                <p className="text-sm text-slate-300 mt-1">{report.overall_action_required}</p>
              </div>
            </div>
          </div>
        )}

        {/* KPI Grid */}
        {report && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: Car,       label: "Total Locations",  value: report.total_locations_monitored,   color: "blue"   },
              { icon: Activity,  label: "Total Vehicles",   value: report.total_vehicles_recorded?.toLocaleString(), color: "purple" },
              { icon: BarChart3, label: "Avg Vehicle Count",value: report.average_vehicle_count,        color: "yellow" },
              { icon: TrendingUp,label: "Avg Speed",        value: `${report.average_speed_kmh} km/h`,  color: "green"  },
            ].map(card => (
              <div key={card.label} className={`rounded-2xl border p-5 flex items-center gap-4
                ${card.color === "blue"   ? "bg-blue-500/10   border-blue-500/30"   : ""}
                ${card.color === "purple" ? "bg-purple-500/10 border-purple-500/30" : ""}
                ${card.color === "yellow" ? "bg-yellow-500/10 border-yellow-500/30" : ""}
                ${card.color === "green"  ? "bg-green-500/10  border-green-500/30"  : ""}
              `}>
                <div className={`p-3 rounded-xl
                  ${card.color === "blue"   ? "bg-blue-500/20   text-blue-400"   : ""}
                  ${card.color === "purple" ? "bg-purple-500/20 text-purple-400" : ""}
                  ${card.color === "yellow" ? "bg-yellow-500/20 text-yellow-400" : ""}
                  ${card.color === "green"  ? "bg-green-500/20  text-green-400"  : ""}
                `}>
                  <card.icon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{card.value}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{card.label}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Main Report Grid */}
        {report && (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">

            {/* Most Congested */}
            <ReportSection title="Most Congested Junction" icon={AlertTriangle} color="red">
              <div className="space-y-1">
                <p className="text-lg font-bold text-white">{report.most_congested_junction?.location}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-red-500 text-white">
                    {report.most_congested_junction?.congestion_level}
                  </span>
                  <span className="text-xs text-slate-400">{report.most_congested_junction?.road_status}</span>
                </div>
                <p className="text-3xl font-bold text-red-400 mt-3">
                  {report.most_congested_junction?.vehicle_count}
                  <span className="text-sm font-normal text-slate-400 ml-1">vehicles</span>
                </p>
              </div>
            </ReportSection>

            {/* Least Congested */}
            <ReportSection title="Least Congested Junction" icon={CheckCircle} color="green">
              <p className="text-lg font-bold text-white">{report.least_congested_junction?.location}</p>
              <p className="text-3xl font-bold text-green-400 mt-3">
                {report.least_congested_junction?.vehicle_count}
                <span className="text-sm font-normal text-slate-400 ml-1">vehicles</span>
              </p>
              <p className="text-xs text-slate-400 mt-2">
                Congestion: {report.least_congested_junction?.congestion_level}
              </p>
            </ReportSection>

            {/* Peak Traffic */}
            <ReportSection title="Peak Traffic Hour" icon={Clock} color="yellow">
              <p className="text-4xl font-bold text-yellow-400">{report.peak_traffic_hour}</p>
              <p className="text-sm text-slate-300 mt-2">
                Avg {report.peak_hour_avg_vehicles} vehicles at peak
              </p>
              <div className="mt-3 pt-3 border-t border-slate-800">
                <StatRow label="High Congestion" value={`${report.high_congestion_count} (${report.high_congestion_percentage}%)`} color="text-red-400" />
                <StatRow label="Medium Congestion" value={report.medium_congestion_count} color="text-yellow-400" />
                <StatRow label="Low Congestion" value={report.low_congestion_count} color="text-green-400" />
              </div>
            </ReportSection>

            {/* Incidents */}
            <ReportSection title="Active Incidents" icon={AlertTriangle} color="red">
              <StatRow label="Accident Locations"  value={report.accident_count}  color="text-red-400"    />
              <StatRow label="Emergency Events"    value={report.emergency_count} color="text-orange-400" />
              {report.accident_locations?.length > 0 && (
                <div className="mt-3">
                  <p className="text-xs font-semibold text-slate-400 mb-2">Accident Sites:</p>
                  <div className="flex flex-wrap gap-1">
                    {report.accident_locations.map((loc, i) => (
                      <span key={i} className="flex items-center gap-1 text-xs bg-red-500/20 text-red-300 px-2 py-0.5 rounded-lg">
                        <MapPin className="w-3 h-3" />{loc}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </ReportSection>

            {/* RF Predictions */}
            <ReportSection title="RF Predictions — Next Hour" icon={Cpu} color="purple">
              <div className="space-y-2">
                {report.rf_predictions_next_hour?.map(p => (
                  <div key={p.junction} className="flex items-center justify-between">
                    <span className="text-xs text-slate-400">Junction {p.junction}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white">{p.predicted_vehicles}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full text-white ${
                        p.urgency === "Critical" ? "bg-red-500" :
                        p.urgency === "High"     ? "bg-orange-500" :
                        p.urgency === "Medium"   ? "bg-yellow-500" : "bg-green-500"
                      }`}>{p.congestion_level}</span>
                    </div>
                  </div>
                ))}
              </div>
              {report.rf_predicted_peak_junction && (
                <div className="mt-3 pt-3 border-t border-slate-800">
                  <p className="text-xs text-slate-400">Predicted Peak Junction:</p>
                  <p className="text-sm font-bold text-purple-300 mt-1">
                    Junction {report.rf_predicted_peak_junction.junction} —
                    {" "}{report.rf_predicted_peak_junction.predicted_vehicles} vehicles
                  </p>
                </div>
              )}
            </ReportSection>

            {/* AI Recommendations */}
            <ReportSection title="AI Recommendations" icon={Zap} color="blue">
              <div className="space-y-3">
                {report.ai_recommendations?.map((rec, i) => (
                  <div key={i} className="flex gap-2 text-xs">
                    <span className="w-5 h-5 flex-shrink-0 flex items-center justify-center rounded-full bg-blue-600 text-white font-bold text-[10px]">
                      {i + 1}
                    </span>
                    <p className="text-slate-300 leading-relaxed">{rec}</p>
                  </div>
                ))}
              </div>
            </ReportSection>

          </div>
        )}

        {/* Footer */}
        <div className="rounded-2xl bg-slate-900/50 border border-slate-800 p-4 flex items-center gap-3">
          <FileText className="w-5 h-5 text-slate-400 flex-shrink-0" />
          <p className="text-xs text-slate-400">
            This report was auto-generated by <strong className="text-white">TrafficVision AI</strong> using
            a trained <strong className="text-blue-400">Random Forest machine learning model</strong> and
            live traffic data from the <strong className="text-white">MySQL database</strong>.
            Report generated at: <strong className="text-white">{report?.report_time}</strong>
          </p>
        </div>
      </div>
    </Layout>
  );
}
