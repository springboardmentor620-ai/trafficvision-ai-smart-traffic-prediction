import { useEffect, useMemo, useRef, useState } from "react";
import Layout from "../components/Layout";

import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

import {
  BarChart3,
  TrendingUp,
  Car,
  AlertTriangle,
  Activity,
  Gauge,
  MapPin,
  RefreshCw,
  Sparkles,
  CloudSun,
  Bell,
} from "lucide-react";

// ============================================================
// API
// ============================================================

const API = "http://localhost:8000";

// ============================================================
// THEME
// ============================================================

const THEME = {
  blue: "#3B82F6",
  green: "#10B981",
  orange: "#F97316",
  red: "#EF4444",
  purple: "#8B5CF6",
  yellow: "#FACC15",
};

// ============================================================
// CONGESTION COLORS
// ============================================================

const CONGESTION_COLOR = {
  Low: THEME.green,
  Medium: THEME.yellow,
  High: THEME.red,
  Critical: THEME.red,
};

const CONGESTION_DOT = {
  Low: "🟢",
  Medium: "🟠",
  High: "🔴",
  Critical: "🔴",
};

// ============================================================
// FETCH WITH TIMEOUT
// ============================================================

async function fetchWithTimeout(url, ms = 6000) {
  const controller = new AbortController();

  const timer = setTimeout(() => {
    controller.abort();
  }, ms);

  try {
    return await fetch(url, {
      signal: controller.signal,
    });
  } catch (error) {
    console.error(`Request failed: ${url}`, error);
    return null;
  } finally {
    clearTimeout(timer);
  }
}

// ============================================================
// SAFE FIELD READER
// Supports PascalCase, snake_case and aliases
// ============================================================

const getField = (record, ...keys) => {
  if (!record) {
    return undefined;
  }

  for (const key of keys) {
    if (
      record[key] !== undefined &&
      record[key] !== null
    ) {
      return record[key];
    }
  }

  return undefined;
};

// ============================================================
// CHART STYLES
// ============================================================

const AXIS_STYLE = {
  stroke: "#64748B",
  fontSize: 11,
};

const GRID_STYLE = {
  stroke: "#1E293B",
  strokeDasharray: "3 3",
};

const TOOLTIP_STYLE = {
  contentStyle: {
    background: "#1E293B",
    border: "1px solid #334155",
    borderRadius: 8,
    fontSize: 12,
  },

  labelStyle: {
    color: "#F1F5F9",
  },
};

// ============================================================
// ANIMATED KPI COUNTER
// ============================================================

function useCountUp(target, duration = 900) {
  const [value, setValue] = useState(0);

  const startRef = useRef(null);
  const fromRef = useRef(0);
  const valueRef = useRef(0);

  useEffect(() => {
    const end = Number(target) || 0;

    fromRef.current = valueRef.current;
    startRef.current = null;

    let frame;

    const animate = (time) => {
      if (!startRef.current) {
        startRef.current = time;
      }

      const progress = Math.min(
        (time - startRef.current) / duration,
        1
      );

      const eased =
        1 - Math.pow(1 - progress, 3);

      const nextValue =
        fromRef.current +
        (end - fromRef.current) * eased;

      valueRef.current = nextValue;

      setValue(nextValue);

      if (progress < 1) {
        frame = requestAnimationFrame(animate);
      }
    };

    frame = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(frame);
    };
  }, [target, duration]);

  return value;
}

// ============================================================
// KPI CARD
// ============================================================

function KpiCard({
  icon: Icon,
  label,
  value,
  suffix = "",
  isText = false,
  sub,
  color,
}) {
  const animated = useCountUp(
    isText ? 0 : value
  );

  return (
    <div
      className="rounded-2xl border p-5 transition hover:-translate-y-1"
      style={{
        background: `linear-gradient(135deg, ${color}22, transparent)`,
        borderColor: `${color}55`,
      }}
    >
      <div
        className="p-2 rounded-xl w-fit"
        style={{
          background: `${color}33`,
          color,
        }}
      >
        <Icon size={22} />
      </div>

      <p className="text-xs text-slate-400 mt-4">
        {label}
      </p>

      <h2 className="text-xl font-bold text-white">
        {isText
          ? value
          : `${Math.round(
            animated
          ).toLocaleString()}${suffix}`}
      </h2>

      {sub && (
        <p
          className="text-xs mt-1"
          style={{ color }}
        >
          {sub}
        </p>
      )}
    </div>
  );
}

// ============================================================
// MAIN ANALYTICS PAGE
// ============================================================

export default function Analytics() {
  const [overview, setOverview] = useState(null);

  const [hourly, setHourly] = useState([]);

  const [records, setRecords] = useState([]);

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  const [lastUpdated, setLastUpdated] = useState(
    new Date()
  );

  const [selectedRoad, setSelectedRoad] =
    useState(null);

  // ==========================================================
  // LOAD DATA
  // ==========================================================

  const loadData = async () => {
    try {
      const [
        overviewRes,
        hourlyRes,
        recordsRes,
      ] = await Promise.all([
        fetchWithTimeout(
          `${API}/analytics/overview`
        ),

        fetchWithTimeout(
          `${API}/analytics/hourly`
        ),

        fetchWithTimeout(
          `${API}/traffic-records?limit=200`
        ),
      ]);

      // ------------------------------------------------------
      // OVERVIEW
      // ------------------------------------------------------

      setOverview(
        overviewRes && overviewRes.ok
          ? await overviewRes.json()
          : null
      );

      // ------------------------------------------------------
      // HOURLY
      // ------------------------------------------------------

      const hourlyData =
        hourlyRes && hourlyRes.ok
          ? await hourlyRes.json()
          : [];

      setHourly(
        Array.isArray(hourlyData)
          ? hourlyData
          : []
      );

      // ------------------------------------------------------
      // TRAFFIC RECORDS
      // ------------------------------------------------------

      const recordsData =
        recordsRes && recordsRes.ok
          ? await recordsRes.json()
          : [];

      setRecords(
        Array.isArray(recordsData)
          ? recordsData
          : []
      );

      setLastUpdated(new Date());
    } catch (error) {
      console.error(
        "Analytics loading error:",
        error
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // ==========================================================
  // INITIAL LOAD
  // ==========================================================

  useEffect(() => {
    loadData();
  }, []);

  // ==========================================================
  // REFRESH
  // ==========================================================

  const refresh = () => {
    setRefreshing(true);
    loadData();
  };

  // ==========================================================
  // ROAD LEVEL ANALYTICS
  // ==========================================================

  const roadStats = useMemo(() => {
    // --------------------------------------------------------
    // FALLBACK DATA
    // --------------------------------------------------------

    if (
      !Array.isArray(records) ||
      records.length === 0
    ) {
      return [
        {
          road: "MG Road",
          vehicles: 680,
          speed: 45,
          congestion: "High",
          weather: "Sunny",
          accident: false,
        },

        {
          road: "NH-16",
          vehicles: 450,
          speed: 62,
          congestion: "Low",
          weather: "Cloudy",
          accident: false,
        },

        {
          road: "Airport Road",
          vehicles: 520,
          speed: 38,
          congestion: "Medium",
          weather: "Rain",
          accident: true,
        },
      ];
    }

    // --------------------------------------------------------
    // GROUP RECORDS BY ROAD
    // --------------------------------------------------------

    const grouped = {};

    records.forEach((record) => {
      const road =
        getField(
          record,
          "Road_Name",
          "road_name",
          "location"
        ) || "Unknown";

      const vehicles =
        Number(
          getField(
            record,
            "Vehicle_Count",
            "vehicle_count"
          )
        ) || 0;

      const speed =
        Number(
          getField(
            record,
            "Speed",
            "speed",
            "average_speed"
          )
        );

      const congestion =
        getField(
          record,
          "Congestion_Level",
          "congestion_level"
        ) || "Medium";

      const weather =
        getField(
          record,
          "Weather",
          "weather"
        ) || "Unknown";

      const accident =
        String(
          getField(
            record,
            "Accident",
            "accident",
            "accident_status"
          ) || ""
        )
          .toLowerCase()
          .trim();

      if (!grouped[road]) {
        grouped[road] = {
          road,
          vehicles: 0,
          speeds: [],
          congestion: [],
          weather,
          accident: false,
        };
      }

      grouped[road].vehicles += vehicles;

      if (!Number.isNaN(speed)) {
        grouped[road].speeds.push(speed);
      }

      grouped[road].congestion.push(
        congestion
      );

      if (
        ["yes", "true", "1", "y"].includes(
          accident
        )
      ) {
        grouped[road].accident = true;
      }

      if (
        weather &&
        weather !== "Unknown"
      ) {
        grouped[road].weather = weather;
      }
    });

    // --------------------------------------------------------
    // DETERMINE WORST CONGESTION
    // --------------------------------------------------------

    return Object.values(grouped).map(
      (roadData) => {
        const order = {
          Low: 1,
          Medium: 2,
          High: 3,
          Critical: 4,
        };

        const worst =
          roadData.congestion.reduce(
            (a, b) =>
              (order[b] || 0) >
                (order[a] || 0)
                ? b
                : a,
            "Low"
          );

        return {
          road: roadData.road,

          vehicles:
            roadData.vehicles,

          speed:
            roadData.speeds.length > 0
              ? Math.round(
                roadData.speeds.reduce(
                  (a, b) => a + b,
                  0
                ) /
                roadData.speeds
                  .length
              )
              : 0,

          congestion: worst,

          weather:
            roadData.weather,

          accident:
            roadData.accident,
        };
      }
    );
  }, [records]);

  // ==========================================================
  // SELECTED ROAD
  // ==========================================================

  const displayedRoadStats =
    selectedRoad
      ? roadStats.filter(
        (road) =>
          road.road === selectedRoad
      )
      : roadStats;

  // ==========================================================
  // KPI VALUES
  // ==========================================================

  const totalVehicles =
    Number(overview?.total_vehicles) ||
    displayedRoadStats.reduce(
      (total, road) =>
        total + road.vehicles,
      0
    );

  const avgSpeed =
    Number(overview?.avg_speed_kmh) ||
    Math.round(
      displayedRoadStats.reduce(
        (total, road) =>
          total + road.speed,
        0
      ) /
      (displayedRoadStats.length || 1)
    );

  // ==========================================================
  // CONGESTION DISTRIBUTION
  // ==========================================================

  const congestionData = [
    {
      name: "Low",
      value:
        displayedRoadStats.filter(
          (road) =>
            road.congestion === "Low"
        ).length,
    },

    {
      name: "Medium",
      value:
        displayedRoadStats.filter(
          (road) =>
            road.congestion === "Medium"
        ).length,
    },

    {
      name: "High",
      value:
        displayedRoadStats.filter(
          (road) =>
            road.congestion === "High" ||
            road.congestion === "Critical"
        ).length,
    },
  ];

  // ==========================================================
  // TRAFFIC TREND
  // ==========================================================

  const trendData =
    Array.isArray(hourly) &&
      hourly.length > 0
      ? hourly.map((item) => ({
        time:
          item.hour_label ??
          item.hour ??
          "Unknown",

        vehicles:
          Number(
            item.avg_vehicle_count ??
            item.vehicle_count ??
            item.Vehicle_Count
          ) || 0,
      }))
      : [
        {
          time: "6 AM",
          vehicles: 300,
        },

        {
          time: "9 AM",
          vehicles: 620,
        },

        {
          time: "12 PM",
          vehicles: 500,
        },

        {
          time: "5 PM",
          vehicles: 850,
        },

        {
          time: "8 PM",
          vehicles: 400,
        },
      ];

  // ==========================================================
  // WEATHER DATA
  // ==========================================================

  const weatherData = [
    {
      weather: "Sunny",
      speed: 55,
    },

    {
      weather: "Cloudy",
      speed: 45,
    },

    {
      weather: "Rain",
      speed: 30,
    },
  ];

  // ==========================================================
  // ALERTS
  // ==========================================================

  const alerts = displayedRoadStats
    .filter(
      (road) =>
        road.accident ||
        road.congestion === "High" ||
        road.congestion === "Critical"
    )
    .map((road) => ({
      text: road.accident
        ? `Accident detected near ${road.road}`
        : `Heavy congestion near ${road.road}`,
    }));

  // ==========================================================
  // CURRENT CONGESTION
  // ==========================================================

  const currentCongestion =
    displayedRoadStats[0]?.congestion ||
    "Medium";

  // ==========================================================
  // LOADING SCREEN
  // ==========================================================

  if (loading) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-center">
            <RefreshCw
              size={32}
              className="text-blue-500 animate-spin mx-auto mb-4"
            />

            <p className="text-white font-medium">
              Loading Traffic Analytics...
            </p>

            <p className="text-slate-500 text-sm mt-1">
              Analysing traffic data
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  // ==========================================================
  // PAGE
  // ==========================================================

  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">

        {/* ================================================== */}
        {/* HEADER */}
        {/* ================================================== */}

        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">

          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <BarChart3 className="text-blue-500" />

              Traffic Insights & Analytics
            </h1>

            <p className="text-slate-400 text-sm mt-1">
              AI powered traffic monitoring dashboard
            </p>

            <p className="text-slate-500 text-xs mt-1">
              Last updated{" "}
              {lastUpdated.toLocaleTimeString()}
            </p>
          </div>

          <button
            onClick={refresh}
            disabled={refreshing}
            className="bg-slate-800 hover:bg-slate-700 disabled:opacity-60 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition"
          >
            <RefreshCw
              size={16}
              className={
                refreshing
                  ? "animate-spin"
                  : ""
              }
            />

            {refreshing
              ? "Refreshing..."
              : "Refresh"}
          </button>
        </div>

        {/* ================================================== */}
        {/* KPI CARDS */}
        {/* ================================================== */}

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">

          <KpiCard
            icon={Car}
            label="Total Vehicles"
            value={totalVehicles}
            color={THEME.blue}
          />

          <KpiCard
            icon={Gauge}
            label="Average Speed"
            value={avgSpeed}
            suffix=" km/h"
            color={THEME.green}
          />

          <KpiCard
            icon={AlertTriangle}
            label="Congestion"
            value={currentCongestion}
            isText
            color={
              CONGESTION_COLOR[
              currentCongestion
              ] || THEME.red
            }
          />

          <KpiCard
            icon={Bell}
            label="Alerts"
            value={alerts.length}
            color={THEME.orange}
          />
        </div>

        {/* ================================================== */}
        {/* TRAFFIC TREND */}
        {/* ================================================== */}

        <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">

          <h3 className="text-white font-bold mb-4 flex items-center gap-2">
            <TrendingUp className="text-blue-400" />

            Traffic Trend
          </h3>

          <div className="h-72">

            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <AreaChart data={trendData}>

                <CartesianGrid
                  {...GRID_STYLE}
                />

                <XAxis
                  dataKey="time"
                  tick={AXIS_STYLE}
                />

                <YAxis
                  tick={AXIS_STYLE}
                />

                <Tooltip
                  {...TOOLTIP_STYLE}
                />

                <Area
                  type="monotone"
                  dataKey="vehicles"
                  stroke={THEME.blue}
                  fill={THEME.blue}
                  fillOpacity={0.18}
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>

          </div>
        </div>

        {/* ================================================== */}
        {/* CHART GRID */}
        {/* ================================================== */}

        <div className="grid lg:grid-cols-2 gap-6">

          {/* ================================================ */}
          {/* CONGESTION DISTRIBUTION */}
          {/* ================================================ */}

          <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">

            <h3 className="text-white font-bold mb-4 flex items-center gap-2">
              <Activity className="text-orange-400" />

              Congestion Distribution
            </h3>

            <div className="h-64">

              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <PieChart>

                  <Pie
                    data={congestionData}
                    dataKey="value"
                    nameKey="name"
                    outerRadius={90}
                    innerRadius={45}
                    paddingAngle={3}
                  >
                    {congestionData.map(
                      (item) => (
                        <Cell
                          key={item.name}
                          fill={
                            CONGESTION_COLOR[
                            item.name
                            ]
                          }
                        />
                      )
                    )}
                  </Pie>

                  <Tooltip
                    contentStyle={{
                      background:
                        "#1E293B",
                      border:
                        "1px solid #334155",
                      borderRadius: 8,
                    }}
                  />

                  <Legend />

                </PieChart>
              </ResponsiveContainer>

            </div>
          </div>

          {/* ================================================ */}
          {/* WEATHER */}
          {/* ================================================ */}

          <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">

            <h3 className="text-white font-bold mb-4 flex items-center gap-2">
              <CloudSun className="text-yellow-400" />

              Weather Impact
            </h3>

            <div className="h-64">

              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <BarChart
                  data={weatherData}
                >

                  <CartesianGrid
                    {...GRID_STYLE}
                  />

                  <XAxis
                    dataKey="weather"
                    tick={AXIS_STYLE}
                  />

                  <YAxis
                    tick={AXIS_STYLE}
                  />

                  <Tooltip
                    {...TOOLTIP_STYLE}
                  />

                  <Bar
                    dataKey="speed"
                    fill={THEME.green}
                    radius={[
                      6,
                      6,
                      0,
                      0,
                    ]}
                  />

                </BarChart>
              </ResponsiveContainer>

            </div>
          </div>
        </div>

        {/* ================================================== */}
        {/* ROAD PERFORMANCE */}
        {/* ================================================== */}

        <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-5">

            <div>
              <h3 className="text-white font-bold flex items-center gap-2">
                <MapPin className="text-blue-400" />

                Road Performance
              </h3>

              <p className="text-slate-500 text-xs mt-1">
                Road-level traffic performance
                overview
              </p>
            </div>

            {selectedRoad && (
              <button
                onClick={() =>
                  setSelectedRoad(null)
                }
                className="text-xs bg-slate-700 hover:bg-slate-600 text-slate-200 px-3 py-2 rounded-lg"
              >
                Show All Roads
              </button>
            )}
          </div>

          {/* ROAD CARDS */}

          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">

            {displayedRoadStats.map(
              (road) => {
                const statusColor =
                  CONGESTION_COLOR[
                  road.congestion
                  ] ||
                  THEME.blue;

                const statusDot =
                  CONGESTION_DOT[
                  road.congestion
                  ] || "⚪";

                return (
                  <button
                    key={road.road}
                    type="button"
                    onClick={() =>
                      setSelectedRoad(
                        road.road
                      )
                    }
                    className="text-left rounded-xl border border-slate-700 bg-slate-900/60 hover:bg-slate-900 hover:border-slate-600 p-4 transition"
                  >

                    {/* ROAD HEADER */}

                    <div className="flex items-start justify-between gap-3">

                      <div className="min-w-0">

                        <p className="text-white font-semibold truncate">
                          {road.road}
                        </p>

                        <p className="text-slate-500 text-xs mt-1">
                          {road.weather}
                        </p>

                      </div>

                      <span
                        className="text-xs px-2 py-1 rounded-full whitespace-nowrap"
                        style={{
                          color:
                            statusColor,
                          background:
                            `${statusColor}18`,
                        }}
                      >
                        {statusDot}{" "}
                        {road.congestion}
                      </span>
                    </div>

                    {/* METRICS */}

                    <div className="grid grid-cols-2 gap-3 mt-5">

                      <div className="rounded-lg bg-slate-800 p-3">

                        <p className="text-slate-500 text-[11px]">
                          Vehicles
                        </p>

                        <p className="text-white font-bold mt-1">
                          {Number(
                            road.vehicles
                          ).toLocaleString()}
                        </p>

                      </div>

                      <div className="rounded-lg bg-slate-800 p-3">

                        <p className="text-slate-500 text-[11px]">
                          Avg Speed
                        </p>

                        <p className="text-white font-bold mt-1">
                          {road.speed}{" "}
                          <span className="text-xs text-slate-500">
                            km/h
                          </span>
                        </p>

                      </div>
                    </div>

                    {/* ACCIDENT */}

                    {road.accident && (
                      <div className="mt-3 flex items-center gap-2 text-xs text-red-400">
                        <AlertTriangle
                          size={14}
                        />

                        Accident reported
                      </div>
                    )}

                    {/* VIEW */}

                    <div className="mt-4 text-xs text-blue-400">
                      View road details →
                    </div>

                  </button>
                );
              }
            )}

          </div>

          {displayedRoadStats.length ===
            0 && (
              <div className="text-center py-10 text-slate-500">
                No road performance data
                available.
              </div>
            )}

        </div>

        {/* ================================================== */}
        {/* AI RECOMMENDATION */}
        {/* ================================================== */}

        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">

          <h3 className="text-white font-bold flex items-center gap-2">
            <Sparkles className="text-purple-400" />

            AI Recommendation
          </h3>

          <p className="text-slate-300 mt-3 leading-relaxed">
            Increase signal timing at high
            congestion roads and suggest
            alternate routes during peak
            hours.
          </p>

          {/* AI INSIGHTS */}

          <div className="grid md:grid-cols-3 gap-3 mt-5">

            <div className="rounded-xl bg-slate-900/60 border border-slate-700 p-4">

              <p className="text-xs text-slate-500">
                Current Traffic
              </p>

              <p className="text-white font-semibold mt-1">
                {currentCongestion}
              </p>

            </div>

            <div className="rounded-xl bg-slate-900/60 border border-slate-700 p-4">

              <p className="text-xs text-slate-500">
                Average Speed
              </p>

              <p className="text-white font-semibold mt-1">
                {avgSpeed} km/h
              </p>

            </div>

            <div className="rounded-xl bg-slate-900/60 border border-slate-700 p-4">

              <p className="text-xs text-slate-500">
                Attention Required
              </p>

              <p className="text-white font-semibold mt-1">
                {alerts.length > 0
                  ? `${alerts.length} alert${alerts.length > 1
                    ? "s"
                    : ""
                  }`
                  : "No active alerts"}
              </p>

            </div>

          </div>
        </div>

        {/* ================================================== */}
        {/* FOOTER */}
        {/* ================================================== */}

        <p className="text-center text-xs text-slate-500 pb-4">
          Powered by TrafficVision AI
        </p>

      </div>
    </Layout>
  );
}