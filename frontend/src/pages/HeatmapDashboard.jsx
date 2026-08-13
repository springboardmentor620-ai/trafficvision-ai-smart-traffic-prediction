import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import Layout from "../components/Layout";
import api from "../api/axios";

import {
  Map as MapIcon,
  RefreshCw,
  Activity,
  Layers,
  AlertTriangle,
  Filter,
  Car,
  Gauge,
  Navigation,
  Database,
  Radio,
  Clock3,
  Zap,
  History,
  Brain,
  Search,
  X,
  Eye,
  Target,
  TrendingUp,
  Cpu,
  Sparkles,
} from "lucide-react";

import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Popup,
  useMap,
} from "react-leaflet";

import "leaflet/dist/leaflet.css";

// ============================================================
// CONSTANTS
// ============================================================

const DEFAULT_CENTER = [17.385044, 78.486671];

const MAX_POINTS = 2000;

const CONGESTION_OPTIONS = [
  "All",
  "Low",
  "Moderate",
  "High",
  "Critical",
];

const VIEW_MODES = [
  {
    id: "current",
    label: "Current",
    icon: Activity,
    description: "Latest available traffic conditions",
  },
  {
    id: "historical",
    label: "Historical",
    icon: History,
    description: "Traffic records for the selected hour",
  },
  {
    id: "predicted",
    label: "Predicted",
    icon: Brain,
    description: "Random Forest traffic prediction",
  },
];

// ============================================================
// MAP CONTROLLER
// ============================================================

function MapController({ points }) {
  const map = useMap();

  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 250);

    return () => clearTimeout(timer);
  }, [map]);

  useEffect(() => {
    if (!Array.isArray(points) || points.length === 0) {
      return;
    }

    const validPoints = points
      .filter(
        (point) =>
          Number.isFinite(Number(point.latitude)) &&
          Number.isFinite(Number(point.longitude))
      )
      .map((point) => [
        Number(point.latitude),
        Number(point.longitude),
      ]);

    if (validPoints.length === 0) {
      return;
    }

    if (validPoints.length === 1) {
      map.setView(validPoints[0], 14, {
        animate: true,
      });

      return;
    }

    map.fitBounds(validPoints, {
      padding: [70, 70],
      maxZoom: 14,
      animate: true,
    });
  }, [points, map]);

  return null;
}

// ============================================================
// CONGESTION NORMALIZATION
// ============================================================

function normalizeCongestion(value) {
  if (!value) {
    return "Unknown";
  }

  const normalized = String(value)
    .trim()
    .toLowerCase();

  if (normalized === "low") {
    return "Low";
  }

  if (
    normalized === "moderate" ||
    normalized === "medium"
  ) {
    return "Moderate";
  }

  if (normalized === "high") {
    return "High";
  }

  if (
    normalized === "critical" ||
    normalized === "severe"
  ) {
    return "Critical";
  }

  return String(value).trim();
}

// ============================================================
// CONGESTION META
// ============================================================

function getCongestionMeta(level) {
  switch (normalizeCongestion(level)) {
    case "Low":
      return {
        label: "Low",
        color: "#22c55e",
        bg: "bg-emerald-500/10",
        border: "border-emerald-500/25",
        text: "text-emerald-400",
      };

    case "Moderate":
      return {
        label: "Moderate",
        color: "#facc15",
        bg: "bg-yellow-500/10",
        border: "border-yellow-500/25",
        text: "text-yellow-400",
      };

    case "High":
      return {
        label: "High",
        color: "#f97316",
        bg: "bg-orange-500/10",
        border: "border-orange-500/25",
        text: "text-orange-400",
      };

    case "Critical":
      return {
        label: "Critical",
        color: "#ef4444",
        bg: "bg-red-500/10",
        border: "border-red-500/25",
        text: "text-red-400",
      };

    default:
      return {
        label: "Unknown",
        color: "#64748b",
        bg: "bg-slate-500/10",
        border: "border-slate-500/25",
        text: "text-slate-400",
      };
  }
}

// ============================================================
// INTENSITY
// ============================================================

function getIntensity(point) {
  const value = Number(point?.intensity);

  if (Number.isFinite(value)) {
    return Math.max(
      0.05,
      Math.min(1, value)
    );
  }

  switch (
  normalizeCongestion(
    point?.congestion_level
  )
  ) {
    case "Low":
      return 0.30;

    case "Moderate":
      return 0.50;

    case "High":
      return 0.75;

    case "Critical":
      return 1;

    default:
      return 0.20;
  }
}

// ============================================================
// POINT RADIUS
// ============================================================

function getPointRadius(point) {
  const intensity = getIntensity(point);

  return Math.max(
    5,
    Math.min(
      17,
      5 + intensity * 12
    )
  );
}

// ============================================================
// HOUR HELPERS
// ============================================================

function formatHour(hour) {
  const normalized = Math.max(
    0,
    Math.min(
      23,
      Number(hour) || 0
    )
  );

  return `${String(normalized).padStart(
    2,
    "0"
  )}:00`;
}

// ============================================================
// TIME FORMAT
// ============================================================

function formatUpdatedTime(date) {
  if (!date) {
    return "—";
  }

  try {
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  } catch {
    return "—";
  }
}

// ============================================================
// ACCIDENT
// ============================================================

function isAccident(point) {
  const value = String(
    point?.accident ??
    point?.accident_status ??
    ""
  )
    .trim()
    .toLowerCase();

  return [
    "yes",
    "true",
    "1",
    "y",
  ].includes(value);
}

// ============================================================
// API ERROR
// ============================================================

function getApiErrorMessage(error) {
  if (
    error?.response?.data?.detail
  ) {
    const detail =
      error.response.data.detail;

    if (typeof detail === "string") {
      return detail;
    }

    try {
      return JSON.stringify(detail);
    } catch {
      return "Heatmap API returned an error.";
    }
  }

  if (error?.response?.status === 404) {
    return "Heatmap API endpoint was not found. Expected /api/heatmap.";
  }

  if (error?.response?.status === 503) {
    return "Prediction service is unavailable. Check the Random Forest model.";
  }

  if (error?.message) {
    return error.message;
  }

  return "Unable to load heatmap data.";
}

// ============================================================
// MAIN COMPONENT
// ============================================================

export default function HeatmapDashboard() {
  // ==========================================================
  // DATA
  // ==========================================================

  const [points, setPoints] = useState([]);

  const [roads, setRoads] = useState([]);

  // ==========================================================
  // FILTERS
  // ==========================================================

  const [roadFilter, setRoadFilter] =
    useState("");

  const [roadSearch, setRoadSearch] =
    useState("");

  const [congestionFilter, setCongestionFilter] =
    useState("All");

  // ==========================================================
  // VIEW
  // ==========================================================

  const [viewMode, setViewMode] =
    useState("current");

  const [selectedHour, setSelectedHour] =
    useState(new Date().getHours());

  // ==========================================================
  // API
  // ==========================================================

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState("");

  const [lastUpdated, setLastUpdated] =
    useState(null);

  const [apiMode, setApiMode] =
    useState("current");

  const [predictionInfo, setPredictionInfo] =
    useState(null);

  // ==========================================================
  // REFRESH
  // ==========================================================

  const [autoRefresh, setAutoRefresh] =
    useState(true);

  const intervalRef =
    useRef(null);

  const sliderTimerRef =
    useRef(null);

  // ==========================================================
  // LOAD ROADS
  // ==========================================================

  const loadRoads = useCallback(
    async () => {
      try {
        const response =
          await api.get(
            "/api/heatmap/roads"
          );

        const data =
          response?.data?.data;

        if (Array.isArray(data)) {
          setRoads(data);
        }
      } catch (err) {
        console.warn(
          "Unable to load heatmap roads:",
          err
        );
      }
    },
    []
  );

  // ==========================================================
  // LOAD HEATMAP
  // ==========================================================

  const loadHeatmap = useCallback(
    async ({
      silent = false,
    } = {}) => {
      try {
        if (silent) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError("");

        const params = {
          mode: viewMode,

          hour: selectedHour,

          limit: MAX_POINTS,
        };

        // ----------------------------------------------------
        // ROAD
        // ----------------------------------------------------

        if (
          roadFilter &&
          roadFilter.trim()
        ) {
          params.road_name =
            roadFilter.trim();
        }

        // ----------------------------------------------------
        // CONGESTION
        // ----------------------------------------------------

        if (
          congestionFilter &&
          congestionFilter !== "All"
        ) {
          /*
           * Backend database may still contain
           * "Severe" while frontend displays it
           * as "Critical".
           *
           * Therefore map Critical -> Severe
           * for the API query.
           */

          params.congestion_level =
            congestionFilter === "Critical"
              ? "Severe"
              : congestionFilter;
        }

        // ----------------------------------------------------
        // API REQUEST
        // ----------------------------------------------------

        const response =
          await api.get(
            "/api/heatmap",
            {
              params,
            }
          );

        const responseData =
          response?.data || {};

        if (
          responseData.status &&
          responseData.status !==
          "success"
        ) {
          throw new Error(
            "Heatmap API returned an unsuccessful status."
          );
        }

        const rawPoints =
          Array.isArray(
            responseData.data
          )
            ? responseData.data
            : [];

        // ----------------------------------------------------
        // VALIDATE POINTS
        // ----------------------------------------------------

        const validPoints =
          rawPoints
            .map(
              (
                point,
                index
              ) => {
                const latitude =
                  Number(
                    point?.latitude
                  );

                const longitude =
                  Number(
                    point?.longitude
                  );

                if (
                  !Number.isFinite(
                    latitude
                  ) ||
                  !Number.isFinite(
                    longitude
                  )
                ) {
                  return null;
                }

                if (
                  latitude < -90 ||
                  latitude > 90 ||
                  longitude < -180 ||
                  longitude > 180
                ) {
                  return null;
                }

                return {
                  ...point,

                  id:
                    point?.id ??
                    `${latitude}-${longitude}-${index}`,

                  latitude,

                  longitude,

                  intensity:
                    getIntensity(
                      point
                    ),

                  congestion_level:
                    normalizeCongestion(
                      point?.congestion_level
                    ),
                };
              }
            )
            .filter(Boolean);

        // ----------------------------------------------------
        // UPDATE
        // ----------------------------------------------------

        setPoints(
          validPoints
        );

        setLastUpdated(
          new Date()
        );

        setApiMode(
          responseData.mode ||
          viewMode
        );

        // ----------------------------------------------------
        // PREDICTION INFO
        // ----------------------------------------------------

        if (
          responseData.prediction
        ) {
          setPredictionInfo(
            responseData.prediction
          );
        } else {
          setPredictionInfo(null);
        }

        // ----------------------------------------------------
        // EMPTY DATA
        // ----------------------------------------------------

        if (
          rawPoints.length > 0 &&
          validPoints.length === 0
        ) {
          setError(
            "Traffic records were returned, but no valid latitude/longitude coordinates were found."
          );
        }
      } catch (err) {
        console.error(
          "Heatmap loading error:",
          err
        );

        setError(
          getApiErrorMessage(err)
        );

        setPoints([]);

        setPredictionInfo(null);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [
      viewMode,
      selectedHour,
      roadFilter,
      congestionFilter,
    ]
  );

  // ==========================================================
  // INITIAL LOAD
  // ==========================================================

  useEffect(() => {
    loadRoads();
  }, [loadRoads]);

  // ==========================================================
  // LOAD WHEN MODE/FILTER CHANGES
  // ==========================================================

  useEffect(() => {
    /*
     * Historical/predicted requests are triggered
     * against the backend.
     *
     * Small delay prevents excessive API calls while
     * dragging the 00:00–23:00 slider.
     */

    if (
      sliderTimerRef.current
    ) {
      clearTimeout(
        sliderTimerRef.current
      );
    }

    sliderTimerRef.current =
      setTimeout(() => {
        loadHeatmap();
      }, 250);

    return () => {
      if (
        sliderTimerRef.current
      ) {
        clearTimeout(
          sliderTimerRef.current
        );
      }
    };
  }, [
    viewMode,
    selectedHour,
    roadFilter,
    congestionFilter,
    loadHeatmap,
  ]);

  // ==========================================================
  // AUTO REFRESH
  // ==========================================================

  useEffect(() => {
    if (!autoRefresh) {
      return undefined;
    }

    /*
     * Current mode is refreshed automatically.
     *
     * Historical and predicted views are not repeatedly
     * requested every 30 seconds because those are
     * analytical views and can be expensive when ML
     * prediction is enabled.
     */

    if (viewMode !== "current") {
      return undefined;
    }

    intervalRef.current =
      setInterval(() => {
        loadHeatmap({
          silent: true,
        });
      }, 30000);

    return () => {
      if (intervalRef.current) {
        clearInterval(
          intervalRef.current
        );
      }
    };
  }, [
    autoRefresh,
    viewMode,
    loadHeatmap,
  ]);

  // ==========================================================
  // FILTERED ROADS
  // ==========================================================

  const filteredRoads =
    useMemo(() => {
      const query =
        roadSearch
          .trim()
          .toLowerCase();

      if (!query) {
        return roads;
      }

      return roads.filter(
        (road) =>
          String(road)
            .toLowerCase()
            .includes(query)
      );
    }, [
      roads,
      roadSearch,
    ]);

  // ==========================================================
  // SUMMARY
  // ==========================================================

  const summary =
    useMemo(() => {
      const result = {
        total: points.length,

        vehicles: 0,

        low: 0,

        moderate: 0,

        high: 0,

        critical: 0,

        accidents: 0,

        averageSpeed: 0,

        predictedVehicles: 0,
      };

      let speedTotal = 0;

      let speedCount = 0;

      points.forEach(
        (point) => {
          const level =
            normalizeCongestion(
              point.congestion_level
            );

          if (level === "Low") {
            result.low += 1;
          } else if (
            level === "Moderate"
          ) {
            result.moderate += 1;
          } else if (
            level === "High"
          ) {
            result.high += 1;
          } else if (
            level === "Critical"
          ) {
            result.critical += 1;
          }

          const vehicles =
            Number(
              point.vehicle_count
            );

          if (
            Number.isFinite(
              vehicles
            )
          ) {
            result.vehicles +=
              vehicles;
          }

          const predicted =
            Number(
              point.predicted_vehicle_count
            );

          if (
            Number.isFinite(
              predicted
            )
          ) {
            result.predictedVehicles +=
              predicted;
          }

          const speed =
            Number(
              point.speed
            );

          if (
            Number.isFinite(
              speed
            )
          ) {
            speedTotal += speed;

            speedCount += 1;
          }

          if (
            isAccident(point)
          ) {
            result.accidents += 1;
          }
        }
      );

      result.averageSpeed =
        speedCount > 0
          ? Math.round(
            speedTotal /
            speedCount
          )
          : 0;

      return result;
    }, [points]);

  // ==========================================================
  // HOTSPOTS
  // ==========================================================

  const hotspots =
    useMemo(() => {
      return [...points]
        .sort(
          (a, b) =>
            Number(
              b.intensity || 0
            ) -
            Number(
              a.intensity || 0
            )
        )
        .slice(0, 5);
    }, [points]);

  // ==========================================================
  // ACTIVE VIEW
  // ==========================================================

  const activeView =
    VIEW_MODES.find(
      (mode) =>
        mode.id === viewMode
    ) ||
    VIEW_MODES[0];

  // ==========================================================
  // CLEAR FILTERS
  // ==========================================================

  const clearFilters = () => {
    setRoadFilter("");
    setRoadSearch("");
    setCongestionFilter("All");
  };

  const hasFilters =
    Boolean(roadFilter) ||
    congestionFilter !== "All";

  // ==========================================================
  // VIEW CHANGE
  // ==========================================================

  const handleViewChange = (
    mode
  ) => {
    setViewMode(mode);

    setError("");

    /*
     * Current view doesn't need a historical
     * hour, but keeping the selected hour allows
     * seamless switching back to historical/predicted.
     */
  };

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <Layout>
      <div className="heatmap-page">
        <style>{`
          .heatmap-page {
            min-height: 100%;
          }

          .heatmap-shell {
            background:
              radial-gradient(
                circle at 50% 5%,
                rgba(37, 99, 235, 0.07),
                transparent 35%
              );
          }

          .heatmap-scroll {
            scrollbar-width: thin;
            scrollbar-color: #334155 transparent;
          }

          .heatmap-scroll::-webkit-scrollbar {
            width: 5px;
          }

          .heatmap-scroll::-webkit-scrollbar-track {
            background: transparent;
          }

          .heatmap-scroll::-webkit-scrollbar-thumb {
            background: #334155;
            border-radius: 999px;
          }

          .heat-slider {
            accent-color: #2563eb;
          }

          .heat-slider::-webkit-slider-thumb {
            cursor: pointer;
          }

          .heatmap-map .leaflet-control-zoom {
            border: 1px solid rgba(71, 85, 105, 0.7) !important;
            border-radius: 10px !important;
            overflow: hidden;
          }

          .heatmap-map .leaflet-control-zoom a {
            background: rgba(15, 23, 42, 0.92) !important;
            color: #cbd5e1 !important;
            border-color: rgba(71, 85, 105, 0.5) !important;
          }

          .heatmap-map .leaflet-control-zoom a:hover {
            background: rgba(30, 41, 59, 0.98) !important;
            color: white !important;
          }

          .heatmap-map .leaflet-control-attribution {
            background: rgba(255, 255, 255, 0.88) !important;
            color: #64748b !important;
            font-size: 8px !important;
          }

          .heatmap-map .leaflet-control-attribution a {
            color: #475569 !important;
          }

          .heatmap-map .leaflet-popup-content-wrapper,
          .heatmap-map .leaflet-popup-tip {
            background: #ffffff;
          }

          .heatmap-map .leaflet-popup-content {
            margin: 12px;
          }

          @keyframes heatPulse {
            0%, 100% {
              opacity: 0.45;
              transform: scale(0.92);
            }

            50% {
              opacity: 0.9;
              transform: scale(1.05);
            }
          }

          .heat-live-dot {
            animation: heatPulse 1.8s ease-in-out infinite;
          }
        `}</style>

        <div className="heatmap-shell space-y-4">

          {/* ==================================================
              HEADER
          ================================================== */}

          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-3 shadow-xl backdrop-blur-xl">

            <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-blue-500/20 bg-blue-500/10">
                  <MapIcon className="h-5 w-5 text-blue-400" />
                </div>

                <div>

                  <div className="flex items-center gap-2">

                    <h1 className="text-lg font-black text-white">
                      TrafficVisionAI HeatMap
                    </h1>

                    <span
                      className={`flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${viewMode ===
                        "current"
                        ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                        : viewMode ===
                          "historical"
                          ? "border-amber-500/20 bg-amber-500/10 text-amber-400"
                          : "border-violet-500/20 bg-violet-500/10 text-violet-400"
                        }`}
                    >
                      <span
                        className={`heat-live-dot h-1.5 w-1.5 rounded-full ${viewMode ===
                          "current"
                          ? "bg-emerald-400"
                          : viewMode ===
                            "historical"
                            ? "bg-amber-400"
                            : "bg-violet-400"
                          }`}
                      />

                      {activeView.label}
                    </span>

                  </div>

                  <p className="mt-0.5 text-[10px] text-slate-500">
                    Spatial traffic intelligence and congestion monitoring
                  </p>

                </div>

              </div>

              <div className="flex flex-wrap items-center gap-2">

                <div className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-950/60 px-3 py-2">

                  <Database className="h-3.5 w-3.5 text-blue-400" />

                  <div>
                    <p className="text-[8px] uppercase tracking-wider text-slate-600">
                      Points
                    </p>

                    <p className="text-xs font-black text-white">
                      {summary.total.toLocaleString()}
                    </p>
                  </div>

                </div>

                <div className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-950/60 px-3 py-2">

                  <Car className="h-3.5 w-3.5 text-cyan-400" />

                  <div>
                    <p className="text-[8px] uppercase tracking-wider text-slate-600">
                      Vehicles
                    </p>

                    <p className="text-xs font-black text-white">
                      {summary.vehicles.toLocaleString()}
                    </p>
                  </div>

                </div>

                <button
                  type="button"
                  onClick={() =>
                    setAutoRefresh(
                      (value) => !value
                    )
                  }
                  className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-[10px] font-bold transition ${autoRefresh
                    ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-400"
                    : "border-slate-700 bg-slate-950 text-slate-500"
                    }`}
                >
                  <Radio className="h-3.5 w-3.5" />

                  {autoRefresh
                    ? "AUTO"
                    : "PAUSED"}
                </button>

                <button
                  type="button"
                  onClick={() =>
                    loadHeatmap({
                      silent: true,
                    })
                  }
                  disabled={
                    loading ||
                    refreshing
                  }
                  className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-[10px] font-bold text-slate-200 transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <RefreshCw
                    className={
                      refreshing
                        ? "h-3.5 w-3.5 animate-spin"
                        : "h-3.5 w-3.5"
                    }
                  />

                  Refresh
                </button>

              </div>

            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2 text-[9px] text-slate-600">

              <Clock3 className="h-3 w-3" />

              <span>
                Updated{" "}
                {formatUpdatedTime(
                  lastUpdated
                )}
              </span>

              <span className="text-slate-800">
                •
              </span>

              <span>
                {activeView.description}
              </span>

              {viewMode !==
                "current" && (
                  <>
                    <span className="text-slate-800">
                      •
                    </span>

                    <span className="font-bold text-blue-400">
                      {formatHour(
                        selectedHour
                      )}
                    </span>
                  </>
                )}

            </div>

          </div>

          {/* ==================================================
              KPI STRIP
          ================================================== */}

          <div className="grid grid-cols-2 gap-3 md:grid-cols-5">

            <MiniKpi
              icon={Database}
              label="Traffic Points"
              value={summary.total}
              color="blue"
            />

            <MiniKpi
              icon={Activity}
              label="Low"
              value={summary.low}
              color="green"
            />

            <MiniKpi
              icon={Activity}
              label="Moderate"
              value={summary.moderate}
              color="yellow"
            />

            <MiniKpi
              icon={AlertTriangle}
              label="High"
              value={summary.high}
              color="orange"
            />

            <MiniKpi
              icon={AlertTriangle}
              label="Critical"
              value={summary.critical}
              color="red"
            />

          </div>

          {/* ==================================================
              MAIN GRID
          ================================================== */}

          <div className="grid min-h-[680px] grid-cols-1 gap-4 xl:grid-cols-[245px_minmax(0,1fr)_280px]">

            {/* =================================================
                LEFT PANEL
            ================================================= */}

            <aside className="flex flex-col gap-3">

              {/* VIEW MODE */}

              <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-3.5 shadow-lg">

                <SectionTitle
                  icon={Eye}
                  title="Traffic View"
                />

                <div className="mt-3 grid grid-cols-3 gap-1.5">

                  {VIEW_MODES.map(
                    (mode) => {
                      const Icon =
                        mode.icon;

                      const selected =
                        viewMode ===
                        mode.id;

                      return (
                        <button
                          key={
                            mode.id
                          }
                          type="button"
                          onClick={() =>
                            handleViewChange(
                              mode.id
                            )
                          }
                          className={`flex flex-col items-center justify-center gap-1.5 rounded-lg border px-2 py-2.5 text-[9px] font-bold transition ${selected
                            ? "border-blue-500/40 bg-blue-500/10 text-blue-300"
                            : "border-slate-800 bg-slate-950/40 text-slate-500 hover:border-slate-700 hover:text-slate-300"
                            }`}
                        >
                          <Icon className="h-3.5 w-3.5" />

                          <span>
                            {mode.label}
                          </span>
                        </button>
                      );
                    }
                  )}

                </div>

                <p className="mt-2 text-[9px] leading-relaxed text-slate-600">
                  {activeView.description}
                </p>

                {viewMode ===
                  "predicted" && (
                    <div className="mt-3 rounded-lg border border-violet-500/20 bg-violet-500/5 p-2.5">

                      <div className="flex items-start gap-2">

                        <Cpu className="mt-0.5 h-3.5 w-3.5 shrink-0 text-violet-400" />

                        <p className="text-[9px] leading-relaxed text-violet-300/80">
                          Random Forest predictions are generated by the backend for the selected hour.
                        </p>

                      </div>

                    </div>
                  )}

              </div>

              {/* TIME SLIDER */}

              <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-3.5 shadow-lg">

                <div className="flex items-center justify-between">

                  <SectionTitle
                    icon={Clock3}
                    title="Traffic Intensity"
                  />

                  <span className="rounded-md border border-blue-500/20 bg-blue-500/10 px-2 py-1 text-[10px] font-black text-blue-400">
                    {formatHour(
                      selectedHour
                    )}
                  </span>

                </div>

                <div className="mt-4">

                  <input
                    type="range"
                    min="0"
                    max="23"
                    step="1"
                    value={
                      selectedHour
                    }
                    onChange={(event) =>
                      setSelectedHour(
                        Number(
                          event.target
                            .value
                        )
                      )
                    }
                    className="heat-slider h-1.5 w-full cursor-pointer appearance-none rounded-full bg-slate-700"
                  />

                  <div className="mt-2 flex justify-between text-[8px] text-slate-600">

                    <span>
                      00:00
                    </span>

                    <span>
                      06:00
                    </span>

                    <span>
                      12:00
                    </span>

                    <span>
                      18:00
                    </span>

                    <span>
                      23:00
                    </span>

                  </div>

                </div>

                <div className="mt-3 rounded-lg border border-slate-800 bg-slate-950/60 p-2.5">

                  <div className="flex items-center justify-between">

                    <span className="text-[9px] text-slate-600">
                      Selected hour
                    </span>

                    <span className="font-mono text-[10px] font-bold text-white">
                      {formatHour(
                        selectedHour
                      )}
                    </span>

                  </div>

                  <p className="mt-1.5 text-[8px] leading-relaxed text-slate-700">

                    {viewMode ===
                      "current"
                      ? "The slider is ready for Historical or Predicted analysis."
                      : viewMode ===
                        "historical"
                        ? "Historical traffic is loaded from the selected database hour."
                        : "Random Forest predictions are generated for the selected hour."}

                  </p>

                </div>

              </div>

              {/* FILTERS */}

              <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-3.5 shadow-lg">

                <div className="flex items-center justify-between">

                  <SectionTitle
                    icon={Filter}
                    title="Filters"
                  />

                  {hasFilters && (
                    <button
                      type="button"
                      onClick={
                        clearFilters
                      }
                      className="flex items-center gap-1 text-[9px] font-bold text-red-400 hover:text-red-300"
                    >
                      <X className="h-3 w-3" />

                      Clear
                    </button>
                  )}

                </div>

                {/* ROAD */}

                <div className="mt-3">

                  <label className="mb-1.5 block text-[8px] font-bold uppercase tracking-widest text-slate-600">
                    Road
                  </label>

                  <div className="relative">

                    <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-600" />

                    <input
                      value={
                        roadSearch
                      }
                      onChange={(event) =>
                        setRoadSearch(
                          event.target
                            .value
                        )
                      }
                      placeholder="Search road..."
                      className="w-full rounded-lg border border-slate-700 bg-slate-950 py-2 pl-8 pr-3 text-[10px] text-white outline-none transition placeholder:text-slate-700 focus:border-blue-500/60"
                    />

                  </div>

                  <select
                    value={
                      roadFilter
                    }
                    onChange={(event) =>
                      setRoadFilter(
                        event.target
                          .value
                      )
                    }
                    className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-[10px] text-slate-200 outline-none focus:border-blue-500/60"
                  >

                    <option value="">
                      All Roads
                    </option>

                    {filteredRoads.map(
                      (road) => (
                        <option
                          key={road}
                          value={road}
                        >
                          {road}
                        </option>
                      )
                    )}

                  </select>

                </div>

                {/* CONGESTION */}

                <div className="mt-3">

                  <label className="mb-1.5 block text-[8px] font-bold uppercase tracking-widest text-slate-600">
                    Congestion
                  </label>

                  <select
                    value={
                      congestionFilter
                    }
                    onChange={(event) =>
                      setCongestionFilter(
                        event.target
                          .value
                      )
                    }
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-[10px] text-slate-200 outline-none focus:border-blue-500/60"
                  >

                    {CONGESTION_OPTIONS.map(
                      (option) => (
                        <option
                          key={option}
                          value={
                            option
                          }
                        >
                          {option}
                        </option>
                      )
                    )}

                  </select>

                </div>

                {hasFilters && (
                  <div className="mt-3 rounded-lg border border-blue-500/15 bg-blue-500/5 px-2.5 py-2 text-[8px] text-blue-300">
                    Filters active
                  </div>
                )}

              </div>

              {/* LEGEND */}

              <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-3.5 shadow-lg">

                <SectionTitle
                  icon={Layers}
                  title="Heatmap Legend"
                />

                <div className="mt-3 space-y-2.5">

                  <LegendRow
                    color="#22c55e"
                    label="Low"
                    description="Free flow"
                  />

                  <LegendRow
                    color="#facc15"
                    label="Moderate"
                    description="Traffic buildup"
                  />

                  <LegendRow
                    color="#f97316"
                    label="High"
                    description="Heavy congestion"
                  />

                  <LegendRow
                    color="#ef4444"
                    label="Critical"
                    description="Severe congestion"
                  />

                </div>

              </div>

            </aside>

            {/* =================================================
                CENTER MAP
            ================================================= */}

            <section className="relative min-h-[680px] overflow-hidden rounded-2xl border border-slate-800 bg-white shadow-2xl">

              <div className="heatmap-map absolute inset-0">

                <MapContainer
                  center={
                    DEFAULT_CENTER
                  }
                  zoom={11}
                  zoomControl
                  zoomControlPosition="topright"
                  style={{
                    height: "100%",
                    width: "100%",
                    background:
                      "#f8fafc",
                  }}
                >

                  {/* LIGHT MAP
                      Kept intentionally so road/place names
                      remain visible.
                  */}

                  <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                    attribution="&copy; OpenStreetMap contributors &copy; CARTO"
                    subdomains="abcd"
                    maxZoom={20}
                  />

                  <MapController
                    points={points}
                  />

                  {/* TRAFFIC POINTS */}

                  {points.map(
                    (point) => {
                      const meta =
                        getCongestionMeta(
                          point.congestion_level
                        );

                      return (
                        <CircleMarker
                          key={
                            point.id
                          }
                          center={[
                            point.latitude,
                            point.longitude,
                          ]}
                          radius={getPointRadius(
                            point
                          )}
                          pathOptions={{
                            color:
                              meta.color,

                            fillColor:
                              meta.color,

                            fillOpacity:
                              0.72,

                            opacity:
                              0.95,

                            weight:
                              1.5,
                          }}
                        >

                          <Popup>

                            <div className="min-w-[245px] font-sans">

                              {/* POPUP HEADER */}

                              <div className="mb-3 flex items-start justify-between border-b border-slate-200 pb-2">

                                <div>

                                  <p className="text-sm font-black text-slate-900">
                                    {point.road_name ||
                                      "Unknown Road"}
                                  </p>

                                  <p className="mt-0.5 text-[9px] uppercase tracking-wider text-slate-500">
                                    Traffic monitoring point
                                  </p>

                                </div>

                                <span
                                  className="rounded-full px-2 py-1 text-[9px] font-black text-white"
                                  style={{
                                    background:
                                      meta.color,
                                  }}
                                >
                                  {
                                    meta.label
                                  }
                                </span>

                              </div>

                              {/* METRICS */}

                              <div className="grid grid-cols-2 gap-2">

                                <PopupMetric
                                  icon={
                                    Car
                                  }
                                  label="Vehicles"
                                  value={
                                    point.vehicle_count ??
                                    "—"
                                  }
                                />

                                <PopupMetric
                                  icon={
                                    Gauge
                                  }
                                  label="Speed"
                                  value={
                                    point.speed !=
                                      null
                                      ? `${point.speed} km/h`
                                      : "—"
                                  }
                                />

                                <PopupMetric
                                  icon={
                                    Activity
                                  }
                                  label="Intensity"
                                  value={`${Math.round(
                                    getIntensity(
                                      point
                                    ) *
                                    100
                                  )}%`}
                                />

                                <PopupMetric
                                  icon={
                                    AlertTriangle
                                  }
                                  label="Accident"
                                  value={
                                    isAccident(
                                      point
                                    )
                                      ? "Yes"
                                      : "No"
                                  }
                                />

                              </div>

                              {/* PREDICTION */}

                              {viewMode ===
                                "predicted" &&
                                point.predicted_vehicle_count !=
                                null && (
                                  <div className="mt-2 rounded-lg border border-violet-200 bg-violet-50 p-2">

                                    <div className="flex items-center gap-1.5">

                                      <Brain className="h-3 w-3 text-violet-600" />

                                      <p className="text-[9px] font-bold text-violet-700">
                                        Random Forest Prediction
                                      </p>

                                    </div>

                                    <div className="mt-1 grid grid-cols-2 gap-2">

                                      <div>
                                        <p className="text-[8px] text-violet-500">
                                          Predicted
                                        </p>

                                        <p className="text-[11px] font-black text-violet-800">
                                          {
                                            point.predicted_vehicle_count
                                          }
                                        </p>

                                      </div>

                                      <div>
                                        <p className="text-[8px] text-violet-500">
                                          Hour
                                        </p>

                                        <p className="text-[11px] font-black text-violet-800">
                                          {formatHour(
                                            point.prediction_hour
                                          )}
                                        </p>

                                      </div>

                                    </div>

                                  </div>
                                )}

                              {/* TIMESTAMP */}

                              <div className="mt-2 rounded-lg bg-slate-100 p-2">

                                <p className="text-[9px] text-slate-500">
                                  Timestamp
                                </p>

                                <p className="mt-0.5 text-[10px] font-bold text-slate-800">
                                  {point.datetime ||
                                    "Unavailable"}
                                </p>

                              </div>

                            </div>

                          </Popup>

                        </CircleMarker>
                      );
                    }
                  )}

                </MapContainer>

              </div>

              {/* MAP HEADER */}

              <div className="pointer-events-none absolute left-3 top-3 z-[500]">

                <div className="rounded-xl border border-slate-200 bg-white/95 px-3 py-2.5 shadow-xl backdrop-blur-md">

                  <div className="flex items-center gap-2">

                    <Target className="h-3.5 w-3.5 text-blue-500" />

                    <div>

                      <p className="text-[10px] font-black text-slate-800">
                        {activeView.label} Traffic
                      </p>

                      <p className="text-[8px] text-slate-500">
                        {points.length.toLocaleString()} locations
                      </p>

                    </div>

                  </div>

                </div>

              </div>

              {/* MODE BADGE */}

              <div className="pointer-events-none absolute right-3 top-3 z-[500]">

                <div
                  className={`rounded-xl border px-3 py-2.5 shadow-xl backdrop-blur-md ${viewMode ===
                    "predicted"
                    ? "border-violet-200 bg-violet-50/95"
                    : viewMode ===
                      "historical"
                      ? "border-amber-200 bg-amber-50/95"
                      : "border-emerald-200 bg-emerald-50/95"
                    }`}
                >

                  <div className="flex items-center gap-2">

                    {viewMode ===
                      "predicted" ? (
                      <Brain className="h-3.5 w-3.5 text-violet-600" />
                    ) : viewMode ===
                      "historical" ? (
                      <History className="h-3.5 w-3.5 text-amber-600" />
                    ) : (
                      <Activity className="h-3.5 w-3.5 text-emerald-600" />
                    )}

                    <div>

                      <p className="text-[10px] font-black text-slate-800">
                        {activeView.label}
                      </p>

                      <p className="text-[8px] text-slate-500">
                        {formatHour(
                          selectedHour
                        )}
                      </p>

                    </div>

                  </div>

                </div>

              </div>

              {/* MAP LEGEND */}

              <div className="pointer-events-none absolute bottom-3 left-3 z-[500]">

                <div className="rounded-xl border border-slate-200 bg-white/95 p-3 shadow-xl backdrop-blur-md">

                  <p className="mb-2 text-[8px] font-black uppercase tracking-widest text-slate-500">
                    Traffic intensity
                  </p>

                  <div className="space-y-1.5">

                    <MapLegendDot
                      color="#22c55e"
                      label="Low"
                    />

                    <MapLegendDot
                      color="#facc15"
                      label="Moderate"
                    />

                    <MapLegendDot
                      color="#f97316"
                      label="High"
                    />

                    <MapLegendDot
                      color="#ef4444"
                      label="Critical"
                    />

                  </div>

                </div>

              </div>

              {/* LOADING */}

              {loading && (
                <div className="absolute inset-0 z-[600] flex items-center justify-center bg-white/65 backdrop-blur-[2px]">

                  <div className="rounded-2xl border border-slate-200 bg-white/95 px-6 py-5 text-center shadow-2xl">

                    <RefreshCw className="mx-auto h-7 w-7 animate-spin text-blue-500" />

                    <p className="mt-3 text-xs font-bold text-slate-800">
                      Loading traffic intelligence
                    </p>

                    <p className="mt-1 text-[9px] text-slate-500">

                      {viewMode ===
                        "predicted"
                        ? "Running Random Forest predictions..."
                        : viewMode ===
                          "historical"
                          ? `Loading historical traffic for ${formatHour(
                            selectedHour
                          )}...`
                          : "Loading current traffic..."}

                    </p>

                  </div>

                </div>
              )}

              {/* EMPTY */}

              {!loading &&
                points.length ===
                0 && (
                  <div className="pointer-events-none absolute inset-0 z-[450] flex items-center justify-center">

                    <div className="rounded-2xl border border-slate-200 bg-white/95 px-7 py-6 text-center shadow-2xl backdrop-blur">

                      <MapIcon className="mx-auto h-8 w-8 text-slate-300" />

                      <p className="mt-3 text-sm font-black text-slate-700">
                        No traffic points
                      </p>

                      <p className="mt-1 max-w-[250px] text-[10px] leading-relaxed text-slate-500">

                        No records match the selected filters or selected time.

                      </p>

                    </div>

                  </div>
                )}

            </section>

            {/* =================================================
                RIGHT INTELLIGENCE PANEL
            ================================================= */}

            <aside className="flex min-h-0 flex-col gap-3">

              {/* ACTIVE VIEW */}

              <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-3.5 shadow-lg">

                <SectionTitle
                  icon={Activity}
                  title="Traffic Intelligence"
                />

                <div className="mt-3 rounded-xl border border-slate-800 bg-slate-950/60 p-3">

                  <div className="flex items-center justify-between">

                    <div>

                      <p className="text-[8px] uppercase tracking-widest text-slate-600">
                        Active view
                      </p>

                      <p className="mt-1 text-lg font-black text-white">
                        {
                          activeView.label
                        }
                      </p>

                    </div>

                    <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-blue-500/20 bg-blue-500/10">

                      <activeView.icon className="h-4 w-4 text-blue-400" />

                    </div>

                  </div>

                  <p className="mt-2 text-[9px] leading-relaxed text-slate-600">
                    {
                      activeView.description
                    }
                  </p>

                </div>

              </div>

              {/* PREDICTION STATUS */}

              {viewMode ===
                "predicted" && (
                  <div className="rounded-2xl border border-violet-500/20 bg-violet-500/5 p-3.5 shadow-lg">

                    <div className="flex items-start gap-3">

                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-violet-500/20 bg-violet-500/10">

                        <Sparkles className="h-4 w-4 text-violet-400" />

                      </div>

                      <div className="min-w-0">

                        <p className="text-[10px] font-black text-violet-200">
                          AI Prediction
                        </p>

                        <p className="mt-1 text-[8px] leading-relaxed text-violet-300/70">
                          Random Forest traffic forecast for{" "}
                          <strong>
                            {formatHour(
                              selectedHour
                            )}
                          </strong>
                        </p>

                      </div>

                    </div>

                    {predictionInfo && (
                      <div className="mt-3 grid grid-cols-2 gap-2">

                        <div className="rounded-lg border border-violet-500/10 bg-slate-950/50 p-2">

                          <p className="text-[8px] uppercase text-slate-600">
                            Model
                          </p>

                          <p className="mt-1 text-[9px] font-bold text-violet-300">
                            Random Forest
                          </p>

                        </div>

                        <div className="rounded-lg border border-violet-500/10 bg-slate-950/50 p-2">

                          <p className="text-[8px] uppercase text-slate-600">
                            Hour
                          </p>

                          <p className="mt-1 text-[9px] font-bold text-violet-300">
                            {formatHour(
                              predictionInfo.hour ??
                              selectedHour
                            )}
                          </p>

                        </div>

                      </div>
                    )}

                  </div>
                )}

              {/* TIME WINDOW */}

              <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-3.5 shadow-lg">

                <SectionTitle
                  icon={Clock3}
                  title="Time Window"
                />

                <div className="mt-3 rounded-xl border border-slate-800 bg-slate-950/60 p-3">

                  <div className="flex items-center justify-between">

                    <div>

                      <p className="text-[8px] uppercase tracking-widest text-slate-600">
                        Selected hour
                      </p>

                      <p className="mt-1 font-mono text-lg font-black text-white">
                        {formatHour(
                          selectedHour
                        )}
                      </p>

                    </div>

                    <Clock3 className="h-5 w-5 text-violet-400" />

                  </div>

                  <div className="mt-3 h-px bg-slate-800" />

                  <div className="mt-2 flex justify-between">

                    <span className="text-[8px] text-slate-600">
                      Visible
                    </span>

                    <span className="text-[9px] font-bold text-blue-400">
                      {points.length.toLocaleString()}
                    </span>

                  </div>

                </div>

              </div>

              {/* DISTRIBUTION */}

              <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-3.5 shadow-lg">

                <SectionTitle
                  icon={TrendingUp}
                  title="Intensity Distribution"
                />

                <div className="mt-3 space-y-3">

                  <DistributionRow
                    label="Low"
                    value={
                      summary.low
                    }
                    total={
                      summary.total
                    }
                    color="#22c55e"
                  />

                  <DistributionRow
                    label="Moderate"
                    value={
                      summary.moderate
                    }
                    total={
                      summary.total
                    }
                    color="#facc15"
                  />

                  <DistributionRow
                    label="High"
                    value={
                      summary.high
                    }
                    total={
                      summary.total
                    }
                    color="#f97316"
                  />

                  <DistributionRow
                    label="Critical"
                    value={
                      summary.critical
                    }
                    total={
                      summary.total
                    }
                    color="#ef4444"
                  />

                </div>

              </div>

              {/* QUICK METRICS */}

              <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-3.5 shadow-lg">

                <SectionTitle
                  icon={Gauge}
                  title="Traffic Metrics"
                />

                <div className="mt-3 grid grid-cols-2 gap-2">

                  <SmallMetric
                    label="Avg Speed"
                    value={
                      summary.averageSpeed
                        ? `${summary.averageSpeed} km/h`
                        : "—"
                    }
                  />

                  <SmallMetric
                    label="Accidents"
                    value={
                      summary.accidents
                    }
                  />

                  {viewMode ===
                    "predicted" && (
                      <SmallMetric
                        label="Predicted"
                        value={
                          summary.predictedVehicles
                            ? summary.predictedVehicles.toLocaleString()
                            : "—"
                        }
                      />
                    )}

                  <SmallMetric
                    label="API Mode"
                    value={
                      apiMode
                        .charAt(0)
                        .toUpperCase() +
                      apiMode.slice(1)
                    }
                  />

                </div>

              </div>

              {/* HOTSPOTS */}

              <div className="min-h-0 flex-1 rounded-2xl border border-slate-800 bg-slate-900/80 p-3.5 shadow-lg">

                <div className="flex items-center justify-between">

                  <SectionTitle
                    icon={Navigation}
                    title="Top Hotspots"
                  />

                  <span className="text-[8px] font-bold text-slate-600">
                    {
                      hotspots.length
                    }
                  </span>

                </div>

                <div className="heatmap-scroll mt-3 max-h-[230px] space-y-2 overflow-y-auto pr-1">

                  {hotspots.length >
                    0 ? (
                    hotspots.map(
                      (
                        point,
                        index
                      ) => {
                        const meta =
                          getCongestionMeta(
                            point.congestion_level
                          );

                        return (
                          <div
                            key={
                              point.id
                            }
                            className="rounded-xl border border-slate-800 bg-slate-950/55 p-2.5 transition hover:border-slate-700"
                          >

                            <div className="flex items-start gap-2">

                              <div
                                className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg"
                                style={{
                                  background:
                                    `${meta.color}18`,
                                  border:
                                    `1px solid ${meta.color}35`,
                                }}
                              >

                                <span
                                  className="h-2.5 w-2.5 rounded-full"
                                  style={{
                                    background:
                                      meta.color,
                                    boxShadow:
                                      `0 0 8px ${meta.color}`,
                                  }}
                                />

                              </div>

                              <div className="min-w-0 flex-1">

                                <div className="flex items-center justify-between gap-2">

                                  <p className="truncate text-[10px] font-bold text-slate-200">
                                    {point.road_name ||
                                      "Unknown Road"}
                                  </p>

                                  <span className="shrink-0 text-[8px] font-black text-slate-600">
                                    #
                                    {index +
                                      1}
                                  </span>

                                </div>

                                <div className="mt-1 flex items-center gap-2 text-[8px] text-slate-600">

                                  <span>
                                    {
                                      point.vehicle_count ??
                                      0
                                    }{" "}
                                    vehicles
                                  </span>

                                  <span>
                                    •
                                  </span>

                                  <span>
                                    {point.speed !=
                                      null
                                      ? `${point.speed} km/h`
                                      : "—"}
                                  </span>

                                </div>

                                {viewMode ===
                                  "predicted" &&
                                  point.predicted_vehicle_count !=
                                  null && (
                                    <div className="mt-1 text-[8px] text-violet-400">

                                      Predicted:{" "}
                                      <strong>
                                        {
                                          point.predicted_vehicle_count
                                        }
                                      </strong>

                                    </div>
                                  )}

                                <div className="mt-1.5 flex items-center justify-between">

                                  <span
                                    className={`rounded-full border px-1.5 py-0.5 text-[7px] font-black uppercase ${meta.bg} ${meta.border} ${meta.text}`}
                                  >
                                    {
                                      meta.label
                                    }
                                  </span>

                                  <span className="text-[8px] font-bold text-slate-500">
                                    {Math.round(
                                      getIntensity(
                                        point
                                      ) *
                                      100
                                    )}
                                    %
                                  </span>

                                </div>

                              </div>

                            </div>

                          </div>
                        );
                      }
                    )
                  ) : (
                    <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-4 text-center">

                      <Target className="mx-auto h-5 w-5 text-slate-700" />

                      <p className="mt-2 text-[9px] text-slate-600">
                        No hotspots available
                      </p>

                    </div>
                  )}

                </div>

              </div>

              {/* AI INTELLIGENCE */}

              <div className="rounded-2xl border border-blue-500/15 bg-blue-500/[0.04] p-3.5 shadow-lg">

                <div className="flex items-start gap-3">

                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-yellow-500/20 bg-yellow-500/10">

                    <Zap className="h-4 w-4 text-yellow-400" />

                  </div>

                  <div>

                    <p className="text-[10px] font-black text-slate-200">
                      Traffic Intelligence
                    </p>

                    <p className="mt-1 text-[8px] leading-relaxed text-slate-600">

                      {viewMode ===
                        "predicted"
                        ? `Random Forest predictions are being analyzed for ${formatHour(
                          selectedHour
                        )}.`
                        : viewMode ===
                          "historical"
                          ? `Historical traffic conditions are being analyzed for ${formatHour(
                            selectedHour
                          )}.`
                          : "Heat intensity combines congestion level and vehicle volume. Higher intensity indicates greater traffic pressure at a location."}

                    </p>

                  </div>

                </div>

              </div>

            </aside>

          </div>

          {/* ==================================================
              ERROR
          ================================================== */}

          {error && (
            <div className="flex items-start gap-3 rounded-xl border border-red-500/25 bg-red-500/5 p-3.5">

              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />

              <div className="min-w-0">

                <p className="text-xs font-bold text-red-300">
                  Heatmap data issue
                </p>

                <p className="mt-1 break-words text-[9px] leading-relaxed text-red-400/80">
                  {error}
                </p>

              </div>

            </div>
          )}

          {/* ==================================================
              FOOTER
          ================================================== */}

          <div className="flex flex-col gap-2 rounded-xl border border-slate-800 bg-slate-900/30 px-3.5 py-2.5 text-[8px] text-slate-700 md:flex-row md:items-center md:justify-between">

            <span>
              Traffic data is retrieved from the TrafficVisionAI database.
            </span>

            <span>
              API limit: {MAX_POINTS.toLocaleString()} points
            </span>

            <span>
              {viewMode ===
                "current"
                ? `Auto refresh: ${autoRefresh
                  ? "30 seconds"
                  : "Paused"
                }`
                : `${activeView.label}: ${formatHour(
                  selectedHour
                )}`}
            </span>

          </div>

        </div>
      </div>
    </Layout>
  );
}

// ============================================================
// MINI KPI
// ============================================================

function MiniKpi({
  icon: Icon,
  label,
  value,
  color = "blue",
}) {
  const colorMap = {
    blue: {
      icon: "text-blue-400",
      bg: "bg-blue-500/10",
      border:
        "border-blue-500/15",
    },

    green: {
      icon: "text-emerald-400",
      bg: "bg-emerald-500/10",
      border:
        "border-emerald-500/15",
    },

    yellow: {
      icon: "text-yellow-400",
      bg: "bg-yellow-500/10",
      border:
        "border-yellow-500/15",
    },

    orange: {
      icon: "text-orange-400",
      bg: "bg-orange-500/10",
      border:
        "border-orange-500/15",
    },

    red: {
      icon: "text-red-400",
      bg: "bg-red-500/10",
      border:
        "border-red-500/15",
    },
  };

  const meta =
    colorMap[color] ||
    colorMap.blue;

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/70 px-3 py-2.5 shadow-lg">

      <div className="flex items-center justify-between">

        <span className="text-[8px] font-bold uppercase tracking-widest text-slate-600">
          {label}
        </span>

        <div
          className={`flex h-6 w-6 items-center justify-center rounded-md border ${meta.bg} ${meta.border}`}
        >
          <Icon
            className={`h-3.5 w-3.5 ${meta.icon}`}
          />
        </div>

      </div>

      <p className="mt-1.5 text-lg font-black text-white">
        {Number(
          value || 0
        ).toLocaleString()}
      </p>

    </div>
  );
}

// ============================================================
// SECTION TITLE
// ============================================================

function SectionTitle({
  icon: Icon,
  title,
}) {
  return (
    <div className="flex items-center gap-2">

      <Icon className="h-3.5 w-3.5 text-blue-400" />

      <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">
        {title}
      </span>

    </div>
  );
}

// ============================================================
// LEGEND ROW
// ============================================================

function LegendRow({
  color,
  label,
  description,
}) {
  return (
    <div className="flex items-center gap-2.5">

      <span
        className="h-2.5 w-2.5 shrink-0 rounded-full"
        style={{
          background: color,
          boxShadow:
            `0 0 8px ${color}`,
        }}
      />

      <div className="min-w-0 flex-1">

        <div className="flex items-center justify-between">

          <span className="text-[9px] font-bold text-slate-300">
            {label}
          </span>

          <span className="text-[8px] text-slate-700">
            {description}
          </span>

        </div>

      </div>

    </div>
  );
}

// ============================================================
// MAP LEGEND DOT
// ============================================================

function MapLegendDot({
  color,
  label,
}) {
  return (
    <div className="flex items-center gap-2">

      <span
        className="h-2 w-2 rounded-full"
        style={{
          background: color,
          boxShadow:
            `0 0 7px ${color}`,
        }}
      />

      <span className="text-[9px] text-slate-500">
        {label}
      </span>

    </div>
  );
}

// ============================================================
// DISTRIBUTION ROW
// ============================================================

function DistributionRow({
  label,
  value,
  total,
  color,
}) {
  const percentage =
    total > 0
      ? Math.round(
        (value / total) *
        100
      )
      : 0;

  return (
    <div>

      <div className="mb-1 flex items-center justify-between">

        <div className="flex items-center gap-2">

          <span
            className="h-2 w-2 rounded-full"
            style={{
              background: color,
            }}
          />

          <span className="text-[9px] text-slate-400">
            {label}
          </span>

        </div>

        <span className="text-[9px] font-bold text-slate-500">
          {value}
        </span>

      </div>

      <div className="h-1.5 overflow-hidden rounded-full bg-slate-800">

        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${percentage}%`,
            background: color,
            boxShadow:
              `0 0 8px ${color}55`,
          }}
        />

      </div>

    </div>
  );
}

// ============================================================
// SMALL METRIC
// ============================================================

function SmallMetric({
  label,
  value,
}) {
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-2">

      <p className="text-[8px] uppercase tracking-wider text-slate-600">
        {label}
      </p>

      <p className="mt-1 text-[10px] font-black text-white">
        {value}
      </p>

    </div>
  );
}

// ============================================================
// POPUP METRIC
// ============================================================

function PopupMetric({
  icon: Icon,
  label,
  value,
}) {
  return (
    <div className="rounded-lg bg-slate-100 p-2">

      <div className="flex items-center gap-1 text-[8px] text-slate-500">

        <Icon className="h-3 w-3" />

        {label}

      </div>

      <p className="mt-1 text-[10px] font-bold text-slate-800">
        {value}
      </p>

    </div>
  );
}