import {
  useCallback,
  useEffect,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";

import Layout from "../components/Layout";

import {
  Car,
  MapPin,
  Activity,
  AlertTriangle,
  Shield,
  Cpu,
  RefreshCw,
  Navigation,
  Clock,
  Sun,
  Bell,
  CheckCircle,
  TrendingUp,
  BarChart3,
} from "lucide-react";

import {
  ResponsiveContainer,
  LineChart,
  Line,
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
} from "recharts";


// ================================================================
// API
// ================================================================

const API = "http://localhost:8000";


// ================================================================
// DEFAULT OVERVIEW
// ================================================================

const DEFAULT_OVERVIEW = {
  total_records: 0,
  total_vehicles: 0,
  avg_vehicle_count: 0,
  avg_speed_kmh: 0,
  total_junctions: 0,

  high_congestion: 0,
  medium_congestion: 0,
  low_congestion: 0,

  accident_locations: 0,
  accidents: 0,
  emergencies: 0,

  most_congested_location: "Unknown",
  most_congested_vehicles: 0,

  least_congested_location: "Unknown",
  least_congested_vehicles: 0,
};


// ================================================================
// DASHBOARD CARD
// ================================================================

function DashboardCard({
  title,
  value,
  icon: Icon,
  color,
  sub,
  suffix = "",
}) {
  const numericValue = Number(value);

  const safeValue = Number.isFinite(numericValue)
    ? numericValue
    : 0;

  const formattedValue =
    Number.isInteger(safeValue)
      ? safeValue.toLocaleString()
      : safeValue.toLocaleString(undefined, {
        maximumFractionDigits: 1,
      });

  return (
    <div
      className={`
        rounded-2xl
        border
        ${color}
        p-5
        shadow-lg
        transition-all
        duration-300
        hover:-translate-y-1
      `}
    >
      <div className="flex justify-between items-center">

        <div>

          <p className="text-xs uppercase tracking-widest text-slate-400 font-bold">
            {title}
          </p>

          <div className="flex items-baseline gap-1 mt-3">

            <h2 className="text-3xl font-bold text-white">
              {formattedValue}
            </h2>

            {suffix && (
              <span className="text-sm text-slate-400">
                {suffix}
              </span>
            )}

          </div>

          <p className="text-xs text-slate-400 mt-2">
            {sub}
          </p>

        </div>

        <div className="p-4 rounded-xl bg-white/10">

          <Icon className="h-8 w-8 text-white" />

        </div>

      </div>
    </div>
  );
}


// ================================================================
// CHART CARD
// ================================================================

function ChartCard({
  title,
  subtitle,
  children,
  className = "",
}) {
  return (
    <div
      className={`
        rounded-3xl
        bg-slate-900
        border
        border-slate-700
        p-6
        shadow-xl
        ${className}
      `}
    >

      <div className="mb-5">

        <h2 className="text-xl font-bold text-white">
          {title}
        </h2>

        {subtitle && (
          <p className="text-sm text-slate-400 mt-1">
            {subtitle}
          </p>
        )}

      </div>

      {children}

    </div>
  );
}


// ================================================================
// CUSTOM PIE LABEL
// ================================================================

function renderPieLabel({
  name,
  percent,
}) {
  if (!percent || percent < 0.05) {
    return "";
  }

  return `${name} ${(percent * 100).toFixed(0)}%`;
}


// ================================================================
// DASHBOARD
// ================================================================

export default function Dashboard() {

  const navigate = useNavigate();


  // ============================================================
  // USER
  // ============================================================

  const [name] = useState(
    localStorage.getItem("name")
  );

  const [role] = useState(
    localStorage.getItem("role")
  );


  // ============================================================
  // CLOCK
  // ============================================================

  const [currentTime, setCurrentTime] =
    useState(new Date());


  // ============================================================
  // OVERVIEW
  // ============================================================

  const [overview, setOverview] =
    useState(DEFAULT_OVERVIEW);


  // ============================================================
  // CHART DATA
  // ============================================================

  const [hourlyData, setHourlyData] =
    useState([]);

  const [congestionData, setCongestionData] =
    useState([]);

  const [speedData, setSpeedData] =
    useState([]);


  // ============================================================
  // LOADING
  // ============================================================

  const [loading, setLoading] =
    useState(false);


  const [error, setError] =
    useState(null);


  // ============================================================
  // WEATHER
  // ============================================================

  const weather = {
    temperature: 32,
    condition: "Sunny",
    humidity: 68,
  };


  // ============================================================
  // FETCH DASHBOARD
  //
  // IMPORTANT:
  // All API calls run in parallel.
  //
  // We do NOT download traffic records.
  //
  // Backend returns:
  //   overview -> 1 object
  //   hourly -> 24 rows
  //   congestion -> 3 rows
  //   speed -> 5 rows
  //
  // ============================================================

  const fetchDashboard = useCallback(
    async () => {

      setLoading(true);
      setError(null);

      const controller =
        new AbortController();

      const timeout =
        setTimeout(() => {
          controller.abort();
        }, 10000);


      try {

        const endpoints = [
          `${API}/analytics/overview`,
          `${API}/analytics/hourly`,
          `${API}/analytics/congestion-distribution`,
          `${API}/analytics/speed-distribution`,
        ];


        const responses =
          await Promise.all(
            endpoints.map((url) =>
              fetch(
                url,
                {
                  method: "GET",

                  cache: "no-store",

                  signal:
                    controller.signal,

                  headers: {
                    Accept:
                      "application/json",
                  },
                }
              )
            )
          );


        const failedResponse =
          responses.find(
            (response) =>
              !response.ok
          );


        if (failedResponse) {

          throw new Error(
            `Dashboard API error: ${failedResponse.status}`
          );

        }


        const [
          overviewResponse,
          hourlyResponse,
          congestionResponse,
          speedResponse,
        ] = await Promise.all(
          responses.map(
            (response) =>
              response.json()
          )
        );


        // ------------------------------------------------------
        // OVERVIEW
        // ------------------------------------------------------

        setOverview({
          ...DEFAULT_OVERVIEW,
          ...(overviewResponse || {}),
        });


        // ------------------------------------------------------
        // HOURLY
        // ------------------------------------------------------

        if (
          Array.isArray(
            hourlyResponse
          )
        ) {

          setHourlyData(
            hourlyResponse
          );

        } else {

          setHourlyData([]);

        }


        // ------------------------------------------------------
        // CONGESTION
        // ------------------------------------------------------

        if (
          congestionResponse &&
          Array.isArray(
            congestionResponse.chart_labels
          ) &&
          Array.isArray(
            congestionResponse.chart_data
          )
        ) {

          const chartData =
            congestionResponse.chart_labels.map(
              (label, index) => ({
                name: label,

                value:
                  Number(
                    congestionResponse
                      .chart_data[index]
                  ) || 0,
              })
            );

          setCongestionData(
            chartData
          );

        } else {

          setCongestionData([]);

        }


        // ------------------------------------------------------
        // SPEED
        // ------------------------------------------------------

        if (
          Array.isArray(
            speedResponse
          )
        ) {

          setSpeedData(
            speedResponse.map(
              (item) => ({
                ...item,

                count:
                  Number(
                    item.count
                  ) || 0,
              })
            )
          );

        } else {

          setSpeedData([]);

        }

      } catch (err) {

        console.error(
          "Dashboard loading error:",
          err
        );


        if (
          err.name ===
          "AbortError"
        ) {

          setError(
            "Dashboard request timed out."
          );

        } else {

          setError(
            "Unable to load dashboard data."
          );

        }

      } finally {

        clearTimeout(timeout);

        setLoading(false);

      }

    },
    []
  );


  // ============================================================
  // INITIAL LOAD
  // ============================================================

  useEffect(() => {

    fetchDashboard();

  }, [fetchDashboard]);


  // ============================================================
  // CLOCK
  // ============================================================

  useEffect(() => {

    const timer =
      setInterval(() => {

        setCurrentTime(
          new Date()
        );

      }, 1000);


    return () => {

      clearInterval(timer);

    };

  }, []);


  // ============================================================
  // PIE COLORS
  // ============================================================

  const congestionColors = {
    High: "#ef4444",
    Medium: "#f59e0b",
    Low: "#22c55e",
  };


  // ============================================================
  // RENDER
  // ============================================================

  return (

    <Layout>

      <div className="space-y-6">


        {/* ======================================================
            HEADER
        ====================================================== */}

        <div
          className="
            rounded-3xl
            p-8
            bg-gradient-to-r
            from-blue-900
            via-slate-900
            to-purple-900
            shadow-2xl
            border
            border-slate-700
          "
        >

          <div
            className="
              flex
              flex-col
              lg:flex-row
              justify-between
              gap-6
            "
          >

            <div>

              <h1
                className="
                  text-4xl
                  font-extrabold
                  text-white
                "
              >

                Welcome,

                <span className="text-blue-400">

                  {" "}
                  {name || "Administrator"}

                </span>

              </h1>


              <p className="text-slate-300 mt-2">

                {role === "admin"
                  ? "Administrator Control Center"
                  : "Traffic Operator Dashboard"}

              </p>


              <div
                className="
                  mt-4
                  flex
                  flex-wrap
                  gap-5
                  text-sm
                  text-slate-300
                "
              >

                <div className="flex items-center gap-2">

                  <Clock className="h-4 w-4" />

                  {currentTime.toLocaleDateString()}

                </div>


                <div className="flex items-center gap-2">

                  <Activity className="h-4 w-4" />

                  {currentTime.toLocaleTimeString()}

                </div>

              </div>

            </div>


            {/* BUTTONS */}

            <div className="flex gap-3">

              <button
                onClick={fetchDashboard}
                disabled={loading}
                className="
                  px-5
                  py-3
                  rounded-xl
                  bg-slate-800
                  hover:bg-slate-700
                  disabled:opacity-60
                  text-white
                  flex
                  items-center
                  gap-2
                "
              >

                <RefreshCw
                  className={`
                    h-4
                    w-4
                    ${loading
                      ? "animate-spin"
                      : ""
                    }
                  `}
                />

                {loading
                  ? "Refreshing..."
                  : "Refresh"}

              </button>


              <button
                onClick={() =>
                  navigate("/ai-report")
                }
                className="
                  px-5
                  py-3
                  rounded-xl
                  bg-blue-600
                  hover:bg-blue-500
                  text-white
                  flex
                  items-center
                  gap-2
                "
              >

                <Cpu className="h-4 w-4" />

                AI Report

              </button>

            </div>

          </div>

        </div>


        {/* ======================================================
            ERROR
        ====================================================== */}

        {error && (

          <div
            className="
              rounded-xl
              border
              border-red-500/30
              bg-red-500/10
              px-5
              py-4
              text-sm
              text-red-300
              flex
              items-center
              justify-between
            "
          >

            <span>
              {error}
            </span>


            <button
              onClick={fetchDashboard}
              className="
                text-red-200
                underline
                font-semibold
              "
            >
              Retry
            </button>

          </div>

        )}


        {/* ======================================================
            KPI CARDS
        ====================================================== */}

        <div
          className="
            grid
            grid-cols-1
            sm:grid-cols-2
            lg:grid-cols-3
            xl:grid-cols-6
            gap-5
          "
        >

          <DashboardCard
            title="Vehicles"
            value={
              overview.total_vehicles
            }
            icon={Car}
            color="
              bg-blue-500/10
              border-blue-500/40
            "
            sub="Total Vehicles"
          />


          <DashboardCard
            title="Junctions"
            value={
              overview.total_junctions ||
              overview.total_records
            }
            icon={MapPin}
            color="
              bg-green-500/10
              border-green-500/40
            "
            sub="Connected Roads"
          />


          <DashboardCard
            title="Congestion"
            value={
              overview.high_congestion
            }
            icon={AlertTriangle}
            color="
              bg-yellow-500/10
              border-yellow-500/40
            "
            sub="High Traffic Records"
          />


          <DashboardCard
            title="Accidents"
            value={
              overview.accident_locations
            }
            icon={Shield}
            color="
              bg-red-500/10
              border-red-500/40
            "
            sub="Reported Cases"
          />


          <DashboardCard
            title="Emergencies"
            value={
              overview.emergencies
            }
            icon={Bell}
            color="
              bg-orange-500/10
              border-orange-500/40
            "
            sub="Emergency Records"
          />


          <DashboardCard
            title="Average Speed"
            value={
              overview.avg_speed_kmh
            }
            suffix="km/h"
            icon={Navigation}
            color="
              bg-purple-500/10
              border-purple-500/40
            "
            sub="Network Average"
          />

        </div>


        {/* ======================================================
            CHARTS ROW 1
        ====================================================== */}

        <div
          className="
            grid
            grid-cols-1
            xl:grid-cols-3
            gap-6
          "
        >


          {/* ====================================================
              HOURLY TRAFFIC LINE CHART
          ==================================================== */}

          <ChartCard
            title="Hourly Traffic Trend"
            subtitle="Average vehicle count by hour"
            className="xl:col-span-2"
          >

            <div className="h-[320px]">

              {hourlyData.length > 0 ? (

                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >

                  <LineChart
                    data={hourlyData}
                    margin={{
                      top: 10,
                      right: 20,
                      left: 0,
                      bottom: 5,
                    }}
                  >

                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#334155"
                    />

                    <XAxis
                      dataKey="hour_label"
                      stroke="#94a3b8"
                      tick={{
                        fontSize: 11,
                      }}
                    />

                    <YAxis
                      stroke="#94a3b8"
                      tick={{
                        fontSize: 11,
                      }}
                    />

                    <Tooltip
                      contentStyle={{
                        backgroundColor:
                          "#0f172a",
                        border:
                          "1px solid #334155",
                        borderRadius:
                          "12px",
                        color:
                          "#fff",
                      }}
                    />

                    <Legend />

                    <Line
                      type="monotone"
                      dataKey="avg_vehicle_count"
                      name="Average Vehicles"
                      stroke="#3b82f6"
                      strokeWidth={3}
                      dot={{
                        r: 3,
                      }}
                      activeDot={{
                        r: 6,
                      }}
                    />

                  </LineChart>

                </ResponsiveContainer>

              ) : (

                <div
                  className="
                    h-full
                    flex
                    items-center
                    justify-center
                    text-slate-500
                  "
                >
                  {loading
                    ? "Loading chart..."
                    : "No hourly data available"}
                </div>

              )}

            </div>

          </ChartCard>


          {/* ====================================================
              CONGESTION PIE CHART
          ==================================================== */}

          <ChartCard
            title="Congestion Distribution"
            subtitle="Traffic condition breakdown"
          >

            <div className="h-[320px]">

              {congestionData.length > 0 ? (

                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >

                  <PieChart>

                    <Pie
                      data={congestionData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="45%"
                      innerRadius={65}
                      outerRadius={105}
                      paddingAngle={3}
                      label={renderPieLabel}
                      labelLine={false}
                    >

                      {congestionData.map(
                        (entry) => (

                          <Cell
                            key={
                              entry.name
                            }
                            fill={
                              congestionColors[
                              entry.name
                              ] || "#64748b"
                            }
                          />

                        )
                      )}

                    </Pie>

                    <Tooltip
                      contentStyle={{
                        backgroundColor:
                          "#0f172a",
                        border:
                          "1px solid #334155",
                        borderRadius:
                          "12px",
                        color:
                          "#fff",
                      }}
                    />

                    <Legend />

                  </PieChart>

                </ResponsiveContainer>

              ) : (

                <div
                  className="
                    h-full
                    flex
                    items-center
                    justify-center
                    text-slate-500
                  "
                >
                  {loading
                    ? "Loading chart..."
                    : "No congestion data available"}
                </div>

              )}

            </div>

          </ChartCard>

        </div>


        {/* ======================================================
            CHARTS ROW 2
        ====================================================== */}

        <div
          className="
            grid
            grid-cols-1
            lg:grid-cols-2
            gap-6
          "
        >


          {/* ====================================================
              SPEED DISTRIBUTION
          ==================================================== */}

          <ChartCard
            title="Speed Distribution"
            subtitle="Traffic records grouped by vehicle speed"
          >

            <div className="h-[320px]">

              {speedData.length > 0 ? (

                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >

                  <BarChart
                    data={speedData}
                    margin={{
                      top: 10,
                      right: 10,
                      left: 0,
                      bottom: 5,
                    }}
                  >

                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#334155"
                    />

                    <XAxis
                      dataKey="range"
                      stroke="#94a3b8"
                      tick={{
                        fontSize: 10,
                      }}
                    />

                    <YAxis
                      stroke="#94a3b8"
                      tick={{
                        fontSize: 11,
                      }}
                    />

                    <Tooltip
                      contentStyle={{
                        backgroundColor:
                          "#0f172a",
                        border:
                          "1px solid #334155",
                        borderRadius:
                          "12px",
                        color:
                          "#fff",
                      }}
                    />

                    <Legend />

                    <Bar
                      dataKey="count"
                      name="Traffic Records"
                      fill="#8b5cf6"
                      radius={[
                        6,
                        6,
                        0,
                        0,
                      ]}
                    />

                  </BarChart>

                </ResponsiveContainer>

              ) : (

                <div
                  className="
                    h-full
                    flex
                    items-center
                    justify-center
                    text-slate-500
                  "
                >
                  {loading
                    ? "Loading chart..."
                    : "No speed data available"}
                </div>

              )}

            </div>

          </ChartCard>


          {/* ====================================================
              TRAFFIC SUMMARY
          ==================================================== */}

          <ChartCard
            title="Traffic Summary"
            subtitle="Current network congestion overview"
          >

            <div className="space-y-5">


              {/* HIGH */}

              <div>

                <div
                  className="
                    flex
                    justify-between
                    mb-2
                  "
                >

                  <span
                    className="
                      text-sm
                      text-slate-300
                    "
                  >
                    High Congestion
                  </span>

                  <span
                    className="
                      text-sm
                      font-bold
                      text-red-400
                    "
                  >
                    {Number(
                      overview.high_congestion
                    ).toLocaleString()}
                  </span>

                </div>

                <div
                  className="
                    h-3
                    rounded-full
                    bg-slate-800
                    overflow-hidden
                  "
                >

                  <div
                    className="
                      h-full
                      bg-red-500
                      rounded-full
                    "
                    style={{
                      width: `${Math.min(
                        100,
                        (
                          Number(
                            overview.high_congestion
                          ) /
                          Math.max(
                            1,
                            Number(
                              overview.total_records
                            )
                          )
                        ) *
                        100
                      )
                        }%`,
                    }}
                  />

                </div>

              </div>


              {/* MEDIUM */}

              <div>

                <div
                  className="
                    flex
                    justify-between
                    mb-2
                  "
                >

                  <span
                    className="
                      text-sm
                      text-slate-300
                    "
                  >
                    Medium Congestion
                  </span>

                  <span
                    className="
                      text-sm
                      font-bold
                      text-yellow-400
                    "
                  >
                    {Number(
                      overview.medium_congestion
                    ).toLocaleString()}
                  </span>

                </div>

                <div
                  className="
                    h-3
                    rounded-full
                    bg-slate-800
                    overflow-hidden
                  "
                >

                  <div
                    className="
                      h-full
                      bg-yellow-500
                      rounded-full
                    "
                    style={{
                      width: `${Math.min(
                        100,
                        (
                          Number(
                            overview.medium_congestion
                          ) /
                          Math.max(
                            1,
                            Number(
                              overview.total_records
                            )
                          )
                        ) *
                        100
                      )
                        }%`,
                    }}
                  />

                </div>

              </div>


              {/* LOW */}

              <div>

                <div
                  className="
                    flex
                    justify-between
                    mb-2
                  "
                >

                  <span
                    className="
                      text-sm
                      text-slate-300
                    "
                  >
                    Low Congestion
                  </span>

                  <span
                    className="
                      text-sm
                      font-bold
                      text-green-400
                    "
                  >
                    {Number(
                      overview.low_congestion
                    ).toLocaleString()}
                  </span>

                </div>

                <div
                  className="
                    h-3
                    rounded-full
                    bg-slate-800
                    overflow-hidden
                  "
                >

                  <div
                    className="
                      h-full
                      bg-green-500
                      rounded-full
                    "
                    style={{
                      width: `${Math.min(
                        100,
                        (
                          Number(
                            overview.low_congestion
                          ) /
                          Math.max(
                            1,
                            Number(
                              overview.total_records
                            )
                          )
                        ) *
                        100
                      )
                        }%`,
                    }}
                  />

                </div>

              </div>


              {/* NETWORK TOTAL */}

              <div
                className="
                  mt-6
                  rounded-2xl
                  bg-slate-800/70
                  border
                  border-slate-700
                  p-5
                "
              >

                <div className="flex items-center gap-3">

                  <TrendingUp
                    className="
                      h-6
                      w-6
                      text-blue-400
                    "
                  />

                  <div>

                    <p className="text-xs text-slate-500 uppercase tracking-wider">
                      Network Average
                    </p>

                    <p className="text-2xl font-bold text-white">
                      {Number(
                        overview.avg_vehicle_count
                      ).toLocaleString()}
                    </p>

                    <p className="text-xs text-slate-400">
                      vehicles per traffic record
                    </p>

                  </div>

                </div>

              </div>

            </div>

          </ChartCard>

        </div>


        {/* ======================================================
            ROAD PERFORMANCE
        ====================================================== */}

        <div
          className="
            grid
            grid-cols-1
            lg:grid-cols-2
            gap-6
          "
        >

          {/* MOST CONGESTED */}

          <div
            className="
              rounded-3xl
              p-6
              bg-slate-900
              border
              border-red-500/30
            "
          >

            <div className="flex items-center gap-3">

              <div
                className="
                  p-3
                  rounded-xl
                  bg-red-500/15
                "
              >

                <AlertTriangle
                  className="
                    h-6
                    w-6
                    text-red-400
                  "
                />

              </div>


              <div>

                <p className="text-xs uppercase tracking-wider text-slate-500">
                  Most Congested Road
                </p>

                <h2 className="text-xl font-bold text-white mt-1">

                  {overview.most_congested_location}

                </h2>

              </div>

            </div>


            <div className="mt-6">

              <p className="text-slate-400 text-sm">
                Average Vehicles
              </p>

              <p
                className="
                  text-3xl
                  font-bold
                  text-red-400
                  mt-1
                "
              >

                {Number(
                  overview.most_congested_vehicles
                ).toLocaleString()}

              </p>

            </div>

          </div>


          {/* LEAST CONGESTED */}

          <div
            className="
              rounded-3xl
              p-6
              bg-slate-900
              border
              border-green-500/30
            "
          >

            <div className="flex items-center gap-3">

              <div
                className="
                  p-3
                  rounded-xl
                  bg-green-500/15
                "
              >

                <CheckCircle
                  className="
                    h-6
                    w-6
                    text-green-400
                  "
                />

              </div>


              <div>

                <p className="text-xs uppercase tracking-wider text-slate-500">
                  Least Congested Road
                </p>

                <h2 className="text-xl font-bold text-white mt-1">

                  {overview.least_congested_location}

                </h2>

              </div>

            </div>


            <div className="mt-6">

              <p className="text-slate-400 text-sm">
                Average Vehicles
              </p>

              <p
                className="
                  text-3xl
                  font-bold
                  text-green-400
                  mt-1
                "
              >

                {Number(
                  overview.least_congested_vehicles
                ).toLocaleString()}

              </p>

            </div>

          </div>

        </div>


        {/* ======================================================
            WEATHER + SYSTEM STATUS
        ====================================================== */}

        <div
          className="
            grid
            grid-cols-1
            lg:grid-cols-2
            gap-6
          "
        >

          {/* WEATHER */}

          <div
            className="
              rounded-3xl
              p-6
              bg-slate-900
              border
              border-slate-700
            "
          >

            <div className="flex justify-between">

              <h2
                className="
                  text-xl
                  font-bold
                  text-white
                "
              >
                Weather
              </h2>


              <Sun
                className="
                  text-yellow-400
                  h-8
                  w-8
                "
              />

            </div>


            <div className="mt-6">

              <h1
                className="
                  text-5xl
                  font-bold
                  text-white
                "
              >
                {weather.temperature}°
              </h1>


              <p className="text-slate-300 mt-2">
                {weather.condition}
              </p>


              <p className="text-slate-400 mt-1">
                Humidity {weather.humidity}%
              </p>

            </div>

          </div>


          {/* SYSTEM */}

          <div
            className="
              rounded-3xl
              p-6
              bg-slate-900
              border
              border-slate-700
            "
          >

            <h2
              className="
                text-xl
                font-bold
                text-white
              "
            >
              System Status
            </h2>


            <div className="space-y-5 mt-6">

              <div className="flex justify-between">

                <span className="text-slate-300">
                  Backend
                </span>

                <span
                  className="
                    flex
                    items-center
                    gap-2
                    text-green-400
                  "
                >

                  <CheckCircle className="h-5 w-5" />

                  Online

                </span>

              </div>


              <div className="flex justify-between">

                <span className="text-slate-300">
                  Database
                </span>

                <span
                  className="
                    flex
                    items-center
                    gap-2
                    text-green-400
                  "
                >

                  <CheckCircle className="h-5 w-5" />

                  Connected

                </span>

              </div>


              <div className="flex justify-between">

                <span className="text-slate-300">
                  AI Engine
                </span>

                <span
                  className="
                    flex
                    items-center
                    gap-2
                    text-green-400
                  "
                >

                  <CheckCircle className="h-5 w-5" />

                  Running

                </span>

              </div>

            </div>

          </div>

        </div>


        {/* ======================================================
            AI PREDICTION
        ====================================================== */}

        <div
          className="
            rounded-3xl
            p-8
            bg-gradient-to-r
            from-purple-900/40
            to-slate-900
            border
            border-purple-500/40
          "
        >

          <div className="flex justify-between">

            <div>

              <h2
                className="
                  text-2xl
                  font-bold
                  text-white
                "
              >
                AI Traffic Prediction
              </h2>


              <p className="text-slate-400 mt-2">

                Random Forest model prediction
                module.

              </p>

            </div>


            <Cpu
              className="
                h-12
                w-12
                text-purple-400
              "
            />

          </div>


          <div
            className="
              grid
              md:grid-cols-3
              gap-6
              mt-8
            "
          >

            <div
              className="
                rounded-xl
                bg-slate-800
                p-5
              "
            >

              <p className="text-slate-400">
                Current Average
              </p>

              <h1
                className="
                  text-4xl
                  font-bold
                  text-white
                  mt-2
                "
              >

                {Number(
                  overview.avg_vehicle_count
                ).toLocaleString()}

              </h1>

            </div>


            <div
              className="
                rounded-xl
                bg-slate-800
                p-5
              "
            >

              <p className="text-slate-400">
                Network Speed
              </p>

              <h1
                className="
                  text-4xl
                  font-bold
                  text-blue-400
                  mt-2
                "
              >

                {Number(
                  overview.avg_speed_kmh
                ).toLocaleString(
                  undefined,
                  {
                    maximumFractionDigits: 1,
                  }
                )}

                <span className="text-lg ml-1">
                  km/h
                </span>

              </h1>

            </div>


            <div
              className="
                rounded-xl
                bg-slate-800
                p-5
              "
            >

              <p className="text-slate-400">
                High Congestion
              </p>

              <h1
                className="
                  text-4xl
                  font-bold
                  text-red-400
                  mt-2
                "
              >

                {Number(
                  overview.high_congestion
                ).toLocaleString()}

              </h1>

            </div>

          </div>

        </div>


      </div>

    </Layout>
  );
}