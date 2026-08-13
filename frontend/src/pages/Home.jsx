import Layout from "../components/Layout";
import { useNavigate } from "react-router-dom";
import { TrafficCone, Database, Navigation, Users, Cpu } from "lucide-react";

function Home() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const name = user.name || "Chief Inspector";
  const role = user.role || "operator";

  return (
    <Layout>
      <div className="space-y-8 py-4 animate-fade-in">
        {/* Splash Welcome Banner */}
        <div className="glass-panel p-8 rounded-2xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6 border border-slate-800 shadow-2xl">
          <div className="space-y-3 z-10 max-w-xl">
            <div className="inline-flex px-2.5 py-1 rounded-md text-[9px] font-bold tracking-widest bg-blue-600/10 border border-blue-500/30 text-blue-400 uppercase">
              Operational Command Portal
            </div>
            <h1 className="text-3xl font-extrabold tracking-wide text-white leading-tight">
              Welcome back, <span className="text-blue-500">{name}</span>
            </h1>
            <p className="text-xs text-slate-400 leading-relaxed">
              You are signed in as an authorization group <span className="text-slate-300 font-bold uppercase underline decoration-blue-500 decoration-2">{role}</span>. All active telemetry controls are synced.
            </p>
          </div>
          
          <div className="flex flex-wrap gap-3 z-10 shrink-0">
            <button
              onClick={() => navigate("/dashboard")}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow-lg shadow-blue-600/25 transition-all flex items-center gap-1.5"
            >
              <TrafficCone className="h-4 w-4" />
              Open Hub Dashboard
            </button>
            <button
              onClick={() => navigate("/map")}
              className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 hover:text-white rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5"
            >
              <Navigation className="h-4 w-4 rotate-45" />
              Launch GIS Maps
            </button>
          </div>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="glass-panel p-6 rounded-2xl space-y-4 hover:-translate-y-1 hover:border-blue-500/30 transition-all duration-300 group">
            <div className="h-10 w-10 rounded-xl bg-blue-600/10 border border-blue-500/20 text-blue-500 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
              <Database className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-slate-200 text-sm">Traffic Registries</h3>
              <p className="text-[10px] text-slate-400 leading-relaxed">
                Log and regulate lane vehicle count and lane clearance categories.
              </p>
            </div>
            <button
              onClick={() => navigate("/traffic-records")}
              className="text-[10px] text-blue-400 font-semibold group-hover:underline flex items-center gap-1.5"
            >
              View Records &rarr;
            </button>
          </div>

          <div className="glass-panel p-6 rounded-2xl space-y-4 hover:-translate-y-1 hover:border-purple-500/30 transition-all duration-300 group">
            <div className="h-10 w-10 rounded-xl bg-purple-600/10 border border-purple-500/20 text-purple-500 flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-colors duration-300">
              <Cpu className="h-5 w-5 animate-pulse" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-slate-200 text-sm">AI Congestion Forecasts</h3>
              <p className="text-[10px] text-slate-400 leading-relaxed">
                Predict queue lengths and peak load trends via machine learning model inference.
              </p>
            </div>
            <button
              onClick={() => navigate("/route")}
              className="text-[10px] text-purple-400 font-semibold group-hover:underline flex items-center gap-1.5"
            >
              Simulate Predictions &rarr;
            </button>
          </div>

          <div className="glass-panel p-6 rounded-2xl space-y-4 hover:-translate-y-1 hover:border-emerald-500/30 transition-all duration-300 group">
            <div className="h-10 w-10 rounded-xl bg-emerald-600/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-300">
              <Navigation className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-slate-200 text-sm">Route Pathfinder</h3>
              <p className="text-[10px] text-slate-400 leading-relaxed">
                Identify clearing paths and optimal highways across connected telemetry loops.
              </p>
            </div>
            <button
              onClick={() => navigate("/map")}
              className="text-[10px] text-emerald-400 font-semibold group-hover:underline flex items-center gap-1.5"
            >
              Analyze Paths &rarr;
            </button>
          </div>

          <div className="glass-panel p-6 rounded-2xl space-y-4 hover:-translate-y-1 hover:border-pink-500/30 transition-all duration-300 group">
            <div className="h-10 w-10 rounded-xl bg-pink-600/10 border border-pink-500/20 text-pink-500 flex items-center justify-center group-hover:bg-pink-600 group-hover:text-white transition-colors duration-300">
              <Users className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-slate-200 text-sm">Operator Accounts</h3>
              <p className="text-[10px] text-slate-400 leading-relaxed">
                Verify operator activities, update permissions profiles, and issue key tokens.
              </p>
            </div>
            <button
              onClick={() => navigate("/users")}
              className="text-[10px] text-pink-400 font-semibold group-hover:underline flex items-center gap-1.5"
            >
              Manage Users &rarr;
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default Home;