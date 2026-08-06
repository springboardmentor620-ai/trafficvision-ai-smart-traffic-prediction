import React, { useState, useEffect, useRef, useCallback } from "react";
import Layout from "../components/Layout";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import {
  Navigation,
  MapPin,
  Clock,
  Gauge,
  Route,
  Zap,
  BarChart2,
  ChevronRight,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Info,
  ArrowRight,
} from "lucide-react";

// ── Fix Leaflet default marker icons ──────────────────────────
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// ── Custom pulse markers ───────────────────────────────────────
const makePulseIcon = (color) =>
  new L.DivIcon({
    html: `<div style="position:relative;display:flex;align-items:center;justify-content:center;width:28px;height:28px;">
             <span style="position:absolute;width:28px;height:28px;border-radius:50%;background:${color};opacity:0.25;animation:ping 1.4s cubic-bezier(0,0,0.2,1) infinite;"></span>
             <span style="position:relative;width:14px;height:14px;border-radius:50%;background:${color};border:2.5px solid #0f172a;box-shadow:0 0 10px ${color}80;"></span>
           </div>`,
    className: "",
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });

const srcIcon = makePulseIcon("#3b82f6");
const dstIcon = makePulseIcon("#ef4444");

// ── Map auto-fit component ─────────────────────────────────────
function FitBounds({ geometry }) {
  const map = useMap();
  useEffect(() => {
    if (geometry && geometry.length > 0) {
      const bounds = L.latLngBounds(geometry.map(([lat, lng]) => [lat, lng]));
      map.fitBounds(bounds, { padding: [48, 48] });
    }
  }, [geometry, map]);
  return null;
}

// ── Color helpers ──────────────────────────────────────────────
const congestionMeta = {
  Low:    { color: "#22c55e", badge: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30", icon: CheckCircle },
  Medium: { color: "#f59e0b", badge: "bg-amber-500/15   text-amber-400   border-amber-500/30",   icon: AlertTriangle },
  High:   { color: "#ef4444", badge: "bg-red-500/15     text-red-400     border-red-500/30",     icon: AlertTriangle },
};

const routeColors = ["#22c55e", "#f59e0b", "#64748b"];   // best, alt1, alt2

// ── Nominatim autocomplete hook ────────────────────────────────
function useSuggestions(query) {
  const [suggestions, setSuggestions] = useState([]);
  const timerRef = useRef(null);

  useEffect(() => {
    if (query.length < 3) { setSuggestions([]); return; }
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5`,
          { headers: { "User-Agent": "TrafficVisionAI/1.0" } }
        );
        const data = await res.json();
        setSuggestions(data.map((d) => d.display_name));
      } catch {
        setSuggestions([]);
      }
    }, 400);
    return () => clearTimeout(timerRef.current);
  }, [query]);

  return [suggestions, setSuggestions];
}

// ── Location Input with autocomplete ──────────────────────────
function LocationInput({ id, label, icon: Icon, color, value, onChange }) {
  const [suggestions, setSuggestions] = useSuggestions(value);
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <label htmlFor={id} className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">
        {label}
      </label>
      <div className="relative">
        <Icon className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${color}`} />
        <input
          id={id}
          type="text"
          value={value}
          onChange={(e) => { onChange(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          placeholder={`Enter ${label.toLowerCase()}...`}
          autoComplete="off"
          className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-slate-700 bg-slate-800/80 text-slate-200 text-sm placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/40 transition-all"
        />
      </div>
      {open && suggestions.length > 0 && (
        <ul className="absolute z-50 mt-1 w-full rounded-lg border border-slate-700 bg-slate-900/95 backdrop-blur-md shadow-xl overflow-hidden">
          {suggestions.map((s, i) => (
            <li
              key={i}
              onMouseDown={() => { onChange(s); setSuggestions([]); setOpen(false); }}
              className="px-3 py-2 text-xs text-slate-300 hover:bg-blue-600/20 hover:text-white cursor-pointer transition-colors border-b border-slate-800 last:border-0 truncate"
            >
              <MapPin className="inline h-3 w-3 mr-1.5 text-slate-500" />
              {s}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ── Info card component ────────────────────────────────────────
function InfoCard({ icon: Icon, label, value, sub, accent }) {
  return (
    <div className={`rounded-xl p-3.5 border ${accent} bg-slate-900/60 backdrop-blur-sm flex items-start gap-3 transition-all hover:scale-[1.02]`}>
      <div className={`p-2 rounded-lg ${accent} flex-shrink-0`}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] text-slate-400 uppercase tracking-wider">{label}</p>
        <p className="text-sm font-bold text-white mt-0.5 leading-tight">{value}</p>
        {sub && <p className="text-[10px] text-slate-500 mt-0.5 truncate">{sub}</p>}
      </div>
    </div>
  );
}

// ── Route badge ────────────────────────────────────────────────
function RouteBadge({ route, index, isSelected, onClick, recommended }) {
  const color = routeColors[index] ?? "#64748b";
  const cong = congestionMeta[route.congestion_level] ?? congestionMeta["Medium"];
  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-3 rounded-xl border transition-all duration-200 ${
        isSelected
          ? "border-blue-500/50 bg-blue-500/10 shadow-lg shadow-blue-500/10"
          : "border-slate-700/60 bg-slate-800/40 hover:border-slate-600 hover:bg-slate-800/70"
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span
            className="h-3 w-3 rounded-full flex-shrink-0"
            style={{ background: color, boxShadow: `0 0 8px ${color}80` }}
          />
          <span className="text-xs font-semibold text-slate-200">
            {recommended ? "⭐ Recommended" : `Alternative ${index}`}
          </span>
        </div>
        <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${cong.badge}`}>
          {route.congestion_level}
        </span>
      </div>
      <div className="flex items-center gap-3 text-[11px] text-slate-400">
        <span className="flex items-center gap-1">
          <Route className="h-3 w-3" />
          {route.distance_km} km
        </span>
        <span className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {route.duration_min} min
        </span>
        <span className="flex items-center gap-1 ml-auto text-slate-500">
          <Gauge className="h-3 w-3" />
          Score: {route.traffic_score}
        </span>
      </div>
    </button>
  );
}

// ── Main Page ──────────────────────────────────────────────────
export default function RoutePlanner() {
  const [source, setSource] = useState("");
  const [destination, setDestination] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [selectedRouteIdx, setSelectedRouteIdx] = useState(0);
  const [mapCenter] = useState([16.8148, 81.5275]);

  // All routes (best first) for rendering
  const allRoutes = result
    ? [result.recommended_route, ...result.alternative_routes]
    : [];

  const selectedRoute = allRoutes[selectedRouteIdx] ?? null;

  const handleFindRoutes = useCallback(async () => {
    if (!source.trim() || !destination.trim()) {
      setError("Please enter both source and destination.");
      return;
    }
    setError("");
    setLoading(true);
    setResult(null);
    setSelectedRouteIdx(0);
    try {
      const res = await fetch("http://localhost:8000/route/traffic-recommendation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source: source.trim(), destination: destination.trim() }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail ?? "Routing failed");
      }
      const data = await res.json();
      setResult(data);
    } catch (e) {
      setError(e.message ?? "Could not reach the routing service. Is the backend running?");
    } finally {
      setLoading(false);
    }
  }, [source, destination]);

  const cong = result ? (congestionMeta[result.congestion_level] ?? congestionMeta["Medium"]) : null;

  return (
    <Layout>
      {/* Keyframe for pulse animation injected once */}
      <style>{`
        @keyframes ping {
          75%, 100% { transform: scale(2); opacity: 0; }
        }
        .route-fade-in { animation: routeFadeIn 0.4s ease both; }
        @keyframes routeFadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div className="flex flex-col gap-5 animate-fade-in h-full">
        {/* ── Page Header ───────────────────────────────── */}
        <div className="glass-panel p-4 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Navigation className="h-5 w-5 text-blue-400" />
              AI Route Planner
            </h2>
            <p className="text-slate-400 text-xs mt-0.5">
              Traffic-aware route optimization powered by OpenStreetMap &amp; real-time congestion analysis.
            </p>
          </div>
          {result && (
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium ${cong.badge}`}>
              <cong.icon className="h-3.5 w-3.5" />
              {result.congestion_level} Congestion Detected
            </div>
          )}
        </div>

        {/* ── Main 3-col grid ───────────────────────────── */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 flex-1">
          {/* ── LEFT PANEL ─────────────────────────────── */}
          <div className="xl:col-span-3 flex flex-col gap-4">
            {/* Input card */}
            <div className="glass-panel p-4 rounded-2xl space-y-3">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                Plan Your Route
              </span>

              <LocationInput
                id="route-source"
                label="Source"
                icon={MapPin}
                color="text-blue-400"
                value={source}
                onChange={setSource}
              />

              <div className="flex justify-center">
                <div className="flex flex-col items-center gap-0.5">
                  <div className="h-3 w-px bg-slate-700" />
                  <ArrowRight className="h-4 w-4 text-slate-600 rotate-90" />
                  <div className="h-3 w-px bg-slate-700" />
                </div>
              </div>

              <LocationInput
                id="route-destination"
                label="Destination"
                icon={MapPin}
                color="text-red-400"
                value={destination}
                onChange={setDestination}
              />

              {error && (
                <p className="text-[11px] text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                  {error}
                </p>
              )}

              <button
                id="find-routes-btn"
                onClick={handleFindRoutes}
                disabled={loading}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-blue-600/25"
              >
                {loading ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Calculating Routes…
                  </>
                ) : (
                  <>
                    <Navigation className="h-4 w-4" />
                    Find Best Route
                  </>
                )}
              </button>
            </div>

            {/* Route list */}
            {result && allRoutes.length > 0 && (
              <div className="glass-panel p-4 rounded-2xl space-y-3 route-fade-in">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                  Available Routes
                </span>
                {allRoutes.map((r, i) => (
                  <RouteBadge
                    key={r.route_index}
                    route={r}
                    index={i}
                    isSelected={selectedRouteIdx === i}
                    recommended={i === 0}
                    onClick={() => setSelectedRouteIdx(i)}
                  />
                ))}
              </div>
            )}

            {/* Traffic prediction */}
            {result && (
              <div className="glass-panel p-4 rounded-2xl space-y-2 route-fade-in">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Zap className="h-3.5 w-3.5 text-yellow-400" />
                  AI Traffic Prediction
                </span>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {result.traffic_prediction}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] text-slate-500">Junctions analyzed:</span>
                  <span className="text-[10px] font-bold text-blue-400">{result.db_junctions_analyzed}</span>
                </div>
              </div>
            )}
          </div>

          {/* ── CENTER: MAP ────────────────────────────── */}
          <div className="xl:col-span-6 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl relative" style={{ minHeight: 520 }}>
            <MapContainer
              center={mapCenter}
              zoom={10}
              style={{ height: "100%", width: "100%", minHeight: 520, background: "#0B0F19" }}
            >
              <TileLayer
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
              />

              {/* Draw all route polylines */}
              {allRoutes.map((r, i) => {
                const isSelected = i === selectedRouteIdx;
                const color = routeColors[i] ?? "#64748b";
                return (
                  <Polyline
                    key={r.route_index}
                    positions={r.geometry}
                    pathOptions={{
                      color,
                      weight: isSelected ? 6 : 3,
                      opacity: isSelected ? 0.95 : 0.45,
                      dashArray: i === 0 ? undefined : "8 6",
                    }}
                  >
                    <Popup>
                      <div className="text-xs space-y-1 p-1">
                        <strong>{i === 0 ? "⭐ Recommended Route" : `Alternative Route ${i}`}</strong>
                        <div>📏 {r.distance_km} km · ⏱ {r.duration_min} min</div>
                        <div>🚦 Congestion: {r.congestion_level}</div>
                        <div>🕐 ETA: {r.estimated_arrival}</div>
                      </div>
                    </Popup>
                  </Polyline>
                );
              })}

              {/* Source marker */}
              {result && (
                <Marker
                  position={[result.source.lat, result.source.lon]}
                  icon={srcIcon}
                >
                  <Popup>
                    <div className="text-xs p-1">
                      <strong>🔵 Origin</strong>
                      <div className="text-gray-600 mt-0.5">{result.source.display_name.slice(0, 60)}…</div>
                    </div>
                  </Popup>
                </Marker>
              )}

              {/* Destination marker */}
              {result && (
                <Marker
                  position={[result.destination.lat, result.destination.lon]}
                  icon={dstIcon}
                >
                  <Popup>
                    <div className="text-xs p-1">
                      <strong>🔴 Destination</strong>
                      <div className="text-gray-600 mt-0.5">{result.destination.display_name.slice(0, 60)}…</div>
                    </div>
                  </Popup>
                </Marker>
              )}

              {/* Auto-fit to best route */}
              {selectedRoute && <FitBounds geometry={selectedRoute.geometry} />}
            </MapContainer>

            {/* Map legend overlay */}
            <div className="absolute bottom-4 left-4 z-[500] bg-slate-900/90 border border-slate-800 rounded-xl p-3 backdrop-blur-md space-y-1.5">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Route Legend</p>
              {[
                { color: "#22c55e", label: "Best Route" },
                { color: "#f59e0b", label: "Alternative 1" },
                { color: "#64748b", label: "Alternative 2" },
              ].map(({ color, label }) => (
                <div key={label} className="flex items-center gap-2 text-[11px] text-slate-300">
                  <span className="h-2 w-6 rounded-full" style={{ background: color }} />
                  {label}
                </div>
              ))}
            </div>

            {/* Loading overlay */}
            {loading && (
              <div className="absolute inset-0 z-[600] flex flex-col items-center justify-center bg-slate-900/80 backdrop-blur-sm">
                <div className="h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-xs text-slate-400 mt-3">Routing via OSRM + AI analysis…</p>
              </div>
            )}

            {/* Empty state */}
            {!result && !loading && (
              <div className="absolute inset-0 z-[400] flex flex-col items-center justify-center pointer-events-none">
                <div className="text-center space-y-2">
                  <Navigation className="h-10 w-10 text-slate-700 mx-auto" />
                  <p className="text-sm text-slate-600">Enter source &amp; destination to see routes</p>
                </div>
              </div>
            )}
          </div>

          {/* ── RIGHT PANEL: Info Cards ────────────────── */}
          <div className="xl:col-span-3 flex flex-col gap-4">
            {result && selectedRoute ? (
              <>
                {/* Route summary */}
                <div className="glass-panel p-4 rounded-2xl route-fade-in">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-3">
                    {selectedRouteIdx === 0 ? "⭐ Recommended Route" : `Alternative Route ${selectedRouteIdx}`}
                  </span>
                  <div className="space-y-2.5">
                    <InfoCard
                      icon={Route}
                      label="Distance"
                      value={`${selectedRoute.distance_km} km`}
                      sub="Calculated via OSRM"
                      accent="border-blue-500/20 text-blue-400"
                    />
                    <InfoCard
                      icon={Clock}
                      label="Travel Time"
                      value={`${selectedRoute.duration_min} min`}
                      sub={`Arrive at ${selectedRoute.estimated_arrival}`}
                      accent="border-purple-500/20 text-purple-400"
                    />
                    <InfoCard
                      icon={Gauge}
                      label="Traffic Score"
                      value={`${selectedRoute.traffic_score} / 100`}
                      sub="AI-computed routing score"
                      accent="border-cyan-500/20 text-cyan-400"
                    />
                    <InfoCard
                      icon={BarChart2}
                      label="Congestion"
                      value={selectedRoute.congestion_level}
                      sub={`${result.db_junctions_analyzed} junctions checked`}
                      accent={congestionMeta[selectedRoute.congestion_level]?.badge ?? "border-slate-600 text-slate-300"}
                    />
                  </div>
                </div>

                {/* Journey details */}
                <div className="glass-panel p-4 rounded-2xl space-y-3 route-fade-in">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Info className="h-3.5 w-3.5 text-slate-500" />
                    Journey Details
                  </span>
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <div className="mt-1 h-2 w-2 rounded-full bg-blue-500 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-[10px] text-slate-500 uppercase tracking-wider">From</p>
                        <p className="text-xs text-slate-300 leading-tight">{result.source.display_name.split(",").slice(0, 3).join(", ")}</p>
                      </div>
                    </div>
                    <div className="ml-1 h-6 w-px bg-slate-700" />
                    <div className="flex items-start gap-2">
                      <div className="mt-1 h-2 w-2 rounded-full bg-red-500 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-[10px] text-slate-500 uppercase tracking-wider">To</p>
                        <p className="text-xs text-slate-300 leading-tight">{result.destination.display_name.split(",").slice(0, 3).join(", ")}</p>
                      </div>
                    </div>
                  </div>
                  <div className="border-t border-slate-800 pt-2 flex justify-between text-[11px]">
                    <span className="text-slate-500">Estimated Arrival</span>
                    <span className="font-bold text-blue-400 font-mono">{selectedRoute.estimated_arrival}</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-500">Routes Computed</span>
                    <span className="font-bold text-slate-300">{allRoutes.length}</span>
                  </div>
                </div>

                {/* Traffic color indicators */}
                <div className="glass-panel p-4 rounded-2xl space-y-3 route-fade-in">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Traffic Indicators
                  </span>
                  {[
                    { level: "Low",    desc: "Free flow — ideal conditions",     color: "#22c55e" },
                    { level: "Medium", desc: "Moderate — allow buffer time",      color: "#f59e0b" },
                    { level: "High",   desc: "Heavy — consider alternatives",     color: "#ef4444" },
                  ].map(({ level, desc, color }) => (
                    <div key={level} className="flex items-center gap-3">
                      <span
                        className="h-3 w-3 rounded-full flex-shrink-0"
                        style={{ background: color, boxShadow: `0 0 8px ${color}60` }}
                      />
                      <div>
                        <p className="text-xs font-semibold text-slate-300">{level}</p>
                        <p className="text-[10px] text-slate-500">{desc}</p>
                      </div>
                      {result.congestion_level === level && (
                        <ChevronRight className="h-3.5 w-3.5 text-slate-500 ml-auto" />
                      )}
                    </div>
                  ))}
                </div>
              </>
            ) : (
              /* Empty state for right panel */
              <div className="glass-panel p-6 rounded-2xl flex flex-col items-center justify-center text-center gap-3 flex-1">
                <BarChart2 className="h-10 w-10 text-slate-700" />
                <div>
                  <p className="text-sm font-semibold text-slate-500">Route Analysis</p>
                  <p className="text-xs text-slate-600 mt-1">Enter locations and click<br/>Find Best Route to see metrics.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}