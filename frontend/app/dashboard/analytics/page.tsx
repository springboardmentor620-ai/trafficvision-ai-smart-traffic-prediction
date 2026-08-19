"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { DashboardShell } from "@/components/DashboardShell";
import { useAuth } from "@/lib/auth-context";
import * as api from "@/lib/api";

import {
  MapPinned,
  Car,
  Gauge,
  Flame,
  Leaf,
  Bell,
  Zap,
  Target,
  TrendingUp,
  TrendingDown,
  Minus,
  RefreshCw,
  Search,
  ArrowUpDown,
} from "lucide-react";

import LineTrafficChart from "@/components/analytics/LineTrafficChart";
import PieCongestionChart from "@/components/analytics/PieCongestionChart";
import ZoneBarChart from "@/components/analytics/ZoneBarChart";
import TrafficHeatMap from "@/components/analytics/TrafficHeatMap";


// ============================================================
// CONGESTION STYLES
// ============================================================

const LEVEL_TEXT: Record<string, string> = {
  low: "text-flow",
  moderate: "text-caution",
  high: "text-caution",
  severe: "text-congest",
};

const LEVEL_BG: Record<string, string> = {
  low: "bg-flow/10",
  moderate: "bg-caution/10",
  high: "bg-caution/15",
  severe: "bg-congest/10",
};


// ============================================================
// UTILIZATION COLOR
// ============================================================

function utilizationColor(
  percent: number
): { bg: string; border: string; text: string } {
  if (percent < 40) {
    return {
      bg: "bg-flow/15",
      border: "border-flow/40",
      text: "text-flow",
    };
  }

  if (percent < 70) {
    return {
      bg: "bg-caution/15",
      border: "border-caution/40",
      text: "text-caution",
    };
  }

  if (percent < 90) {
    return {
      bg: "bg-caution/25",
      border: "border-caution/60",
      text: "text-caution",
    };
  }

  return {
    bg: "bg-congest/15",
    border: "border-congest/40",
    text: "text-congest",
  };
}


// ============================================================
// SUMMARY CARD CONFIGURATION
// ============================================================

type GoodDirection = "up" | "down" | "neutral";

const CARD_CONFIG: {
  key: keyof api.DashboardSummary;
  icon: typeof Car;
  goodWhen: GoodDirection;
}[] = [
  {
    key: "total_roads_monitored",
    icon: MapPinned,
    goodWhen: "neutral",
  },
  {
    key: "total_vehicles_today",
    icon: Car,
    goodWhen: "down",
  },
  {
    key: "avg_utilization",
    icon: Gauge,
    goodWhen: "down",
  },
  {
    key: "busiest_zone",
    icon: Flame,
    goodWhen: "neutral",
  },
  {
    key: "least_congested_zone",
    icon: Leaf,
    goodWhen: "neutral",
  },
  {
    key: "total_alerts_today",
    icon: Bell,
    goodWhen: "down",
  },
  {
    key: "avg_vehicle_speed",
    icon: Zap,
    goodWhen: "up",
  },
  {
    key: "prediction_accuracy",
    icon: Target,
    goodWhen: "up",
  },
];


// ============================================================
// SUMMARY CARD
// ============================================================

function SummaryCard({
  card,
  icon: Icon,
  goodWhen,
}: {
  card: api.MetricCard;
  icon: typeof Car;
  goodWhen: GoodDirection;
}) {
  const displayValue =
    card.display_value ??
    (card.unit ? `${card.value} ${card.unit}` : `${card.value}`);

  let trendColor = "text-muted";
  let TrendIcon = Minus;

  if (card.trend === "up") {
    TrendIcon = TrendingUp;

    trendColor =
      goodWhen === "up"
        ? "text-flow"
        : goodWhen === "down"
        ? "text-congest"
        : "text-signal";
  } else if (card.trend === "down") {
    TrendIcon = TrendingDown;

    trendColor =
      goodWhen === "down"
        ? "text-flow"
        : goodWhen === "up"
        ? "text-congest"
        : "text-signal";
  }

  return (
    <div className="bg-surface border border-border rounded-xl p-4 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <div className="w-9 h-9 rounded-lg flex items-center justify-center text-signal bg-signal/10">
          <Icon className="w-4.5 h-4.5" />
        </div>

        {card.change_percent !== null && (
          <div
            className={`flex items-center gap-1 text-xs font-medium ${trendColor}`}
          >
            <TrendIcon className="w-3.5 h-3.5" />
            {Math.abs(card.change_percent)}%
          </div>
        )}
      </div>

      <div>
        <div className="text-xs text-muted">{card.label}</div>

        <div className="text-lg font-medium text-ink font-mono truncate">
          {displayValue}
        </div>
      </div>

      {card.yesterday_value === null &&
        card.change_percent === null &&
        card.display_value === null && (
          <div className="text-[11px] text-muted">
            No comparison data yet
          </div>
        )}
    </div>
  );
}


// ============================================================
// ROAD PERFORMANCE TABLE
// ============================================================

type SortKey =
  | "utilization_percent"
  | "current_vehicles"
  | "avg_speed_kmph"
  | "road_name";

function RoadPerformanceTable({
  roads,
}: {
  roads: api.RoadPerformanceItem[];
}) {
  const [search, setSearch] = useState("");
  const [levelFilter, setLevelFilter] = useState("all");
  const [sortKey, setSortKey] =
    useState<SortKey>("utilization_percent");
  const [sortAsc, setSortAsc] = useState(false);

  const filtered = useMemo(() => {
    let list = roads.filter((road) => {
      const searchText = search.toLowerCase().trim();

      const matchesSearch =
        searchText === "" ||
        road.road_name.toLowerCase().includes(searchText) ||
        (road.zone ?? "").toLowerCase().includes(searchText);

      const matchesLevel =
        levelFilter === "all" ||
        road.congestion_level === levelFilter;

      return matchesSearch && matchesLevel;
    });

    list = [...list].sort((a, b) => {
      const av = a[sortKey] ?? 0;
      const bv = b[sortKey] ?? 0;

      if (typeof av === "string" && typeof bv === "string") {
        return sortAsc
          ? av.localeCompare(bv)
          : bv.localeCompare(av);
      }

      return sortAsc
        ? Number(av) - Number(bv)
        : Number(bv) - Number(av);
    });

    return list;
  }, [roads, search, levelFilter, sortKey, sortAsc]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortAsc((value) => !value);
    } else {
      setSortKey(key);
      setSortAsc(false);
    }
  }

  const columns: {
    key: SortKey;
    label: string;
  }[] = [
    {
      key: "road_name",
      label: "Road",
    },
    {
      key: "current_vehicles",
      label: "Vehicles",
    },
    {
      key: "utilization_percent",
      label: "Utilization",
    },
    {
      key: "avg_speed_kmph",
      label: "Speed",
    },
  ];

  return (
    <div className="bg-surface border border-border rounded-xl p-4">
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <div>
          <div className="text-sm text-ink font-medium">
            Road performance
          </div>

          <div className="text-xs text-muted mt-1">
            Road-level traffic and congestion performance
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-surface2 border border-border rounded-md px-2.5 py-1.5">
            <Search className="w-3.5 h-3.5 text-muted" />

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search road or zone..."
              className="bg-transparent text-xs text-ink placeholder:text-muted outline-none w-40"
            />
          </div>

          <select
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value)}
            className="bg-surface2 border border-border rounded-md px-2 py-1.5 text-xs text-ink outline-none"
          >
            <option value="all">All levels</option>
            <option value="low">Low</option>
            <option value="moderate">Moderate</option>
            <option value="high">High</option>
            <option value="severe">Severe</option>
          </select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="h-32 flex items-center justify-center text-muted text-sm">
          No roads match your filters
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-muted border-b border-border">
                <th className="pb-2 font-normal w-12"></th>

                {columns.map((column) => (
                  <th
                    key={column.key}
                    className="pb-2 font-normal"
                  >
                    <button
                      onClick={() => toggleSort(column.key)}
                      className="flex items-center gap-1 hover:text-ink"
                    >
                      {column.label}
                      <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                ))}

                <th className="pb-2 font-normal">
                  Zone
                </th>

                <th className="pb-2 font-normal">
                  Congestion
                </th>

                <th className="pb-2 font-normal">
                  Trend
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-border">
              {filtered.map((road) => (
                <tr
                  key={road.road_id}
                  className={
                    road.status === "worst"
                      ? "bg-congest/5"
                      : road.status === "best"
                      ? "bg-flow/5"
                      : ""
                  }
                >
                  <td className="py-2.5">
                    {road.status === "worst" && (
                      <span className="text-[10px] text-congest font-medium">
                        WORST
                      </span>
                    )}

                    {road.status === "best" && (
                      <span className="text-[10px] text-flow font-medium">
                        BEST
                      </span>
                    )}
                  </td>

                  <td className="py-2.5 text-ink">
                    {road.road_name}
                  </td>

                  <td className="py-2.5 text-ink font-mono">
                    {road.current_vehicles ?? "—"}
                  </td>

                  <td className="py-2.5 text-ink font-mono">
                    {Number(road.utilization_percent).toFixed(2)}%
                  </td>

                  <td className="py-2.5 text-ink font-mono">
                    {road.avg_speed_kmph !== null
                      ? `${road.avg_speed_kmph.toFixed(2)} km/h`
                      : "—"}
                  </td>

                  <td className="py-2.5 text-muted">
                    {road.zone ?? "—"}
                  </td>

                  <td className="py-2.5">
                    {road.congestion_level ? (
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                          LEVEL_TEXT[road.congestion_level]
                        } ${
                          LEVEL_BG[road.congestion_level]
                        }`}
                      >
                        {road.congestion_level}
                      </span>
                    ) : (
                      <span className="text-xs text-muted">
                        —
                      </span>
                    )}
                  </td>

                  <td className="py-2.5">
                    {road.trend === "increasing" && (
                      <TrendingUp className="w-4 h-4 text-congest" />
                    )}

                    {road.trend === "decreasing" && (
                      <TrendingDown className="w-4 h-4 text-flow" />
                    )}

                    {road.trend === "stable" && (
                      <Minus className="w-4 h-4 text-muted" />
                    )}

                    {!road.trend && (
                      <span className="text-xs text-muted">
                        —
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}


// ============================================================
// WEEKLY ANALYTICS CARDS
// ============================================================

function WeeklyAnalyticsSection({
  weeklyData,
}: {
  weeklyData: api.WeeklyAnalyticsItem[];
}) {
  const orderedDays = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  const sortedData = useMemo(() => {
    return [...weeklyData].sort(
      (a, b) =>
        orderedDays.indexOf(a.day) -
        orderedDays.indexOf(b.day)
    );
  }, [weeklyData]);

  const maxVehicles = Math.max(
    ...sortedData.map((item) => item.total_vehicles),
    1
  );

  function getDominantCongestion(
    congestion: api.WeeklyAnalyticsItem["congestion"]
  ) {
    const entries = Object.entries(congestion);

    if (entries.length === 0) {
      return "low";
    }

    return entries.sort((a, b) => b[1] - a[1])[0][0];
  }

  function congestionClass(level: string) {
    if (level === "severe") {
      return "text-congest bg-congest/10";
    }

    if (level === "high") {
      return "text-caution bg-caution/15";
    }

    if (level === "moderate") {
      return "text-caution bg-caution/10";
    }

    return "text-flow bg-flow/10";
  }

  return (
    <div className="flex flex-col gap-4">

      {/* HEADER */}
      <div className="bg-surface border border-border rounded-xl p-5">
        <div className="flex items-center justify-between flex-wrap gap-3 mb-5">
          <div>
            <h2 className="text-base font-medium text-ink">
              Weekly Traffic Analytics
            </h2>

            <p className="text-xs text-muted mt-1">
              Traffic performance from Sunday to Saturday
            </p>
          </div>

          {sortedData.length > 0 && (
            <div className="text-xs text-muted">
              {sortedData[0].date.slice(0, 10)}
              {" — "}
              {sortedData[sortedData.length - 1].date.slice(0, 10)}
            </div>
          )}
        </div>

        {sortedData.length === 0 ? (
          <div className="h-32 flex items-center justify-center text-sm text-muted">
            No weekly analytics data available
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-3">
            {sortedData.map((day) => {
              const dominant =
                getDominantCongestion(day.congestion);

              return (
                <div
                  key={day.date}
                  className="bg-surface2 border border-border rounded-lg p-3"
                >
                  <div className="flex items-start justify-between gap-2 mb-4">
                    <div>
                      <div className="text-sm font-medium text-ink">
                        {day.day}
                      </div>

                      <div className="text-[10px] text-muted mt-0.5">
                        {day.date.slice(0, 10)}
                      </div>
                    </div>

                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-full capitalize ${congestionClass(
                        dominant
                      )}`}
                    >
                      {dominant}
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    <div>
                      <div className="text-[10px] text-muted">
                        Total vehicles
                      </div>

                      <div className="text-sm font-mono text-ink">
                        {day.total_vehicles.toLocaleString()}
                      </div>
                    </div>

                    <div>
                      <div className="text-[10px] text-muted">
                        Avg. speed
                      </div>

                      <div className="text-sm font-mono text-ink">
                        {day.avg_speed_kmph.toFixed(2)} km/h
                      </div>
                    </div>

                    <div>
                      <div className="text-[10px] text-muted">
                        Utilization
                      </div>

                      <div className="text-sm font-mono text-ink">
                        {day.avg_utilization_percent.toFixed(2)}%
                      </div>
                    </div>

                    <div>
                      <div className="text-[10px] text-muted">
                        Readings
                      </div>

                      <div className="text-sm font-mono text-ink">
                        {day.readings_count}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>


      {/* DAILY VEHICLE VOLUME */}
      {sortedData.length > 0 && (
        <div className="bg-surface border border-border rounded-xl p-5">
          <div className="mb-5">
            <h2 className="text-base font-medium text-ink">
              Daily Vehicle Volume
            </h2>

            <p className="text-xs text-muted mt-1">
              Total recorded vehicles for each day
            </p>
          </div>

          <div className="h-64 flex items-end gap-2 sm:gap-4">
            {sortedData.map((day) => {
              const height =
                day.total_vehicles === 0
                  ? 2
                  : Math.max(
                      (day.total_vehicles /
                        maxVehicles) *
                        100,
                      5
                    );

              return (
                <div
                  key={day.date}
                  className="flex-1 h-full flex flex-col justify-end items-center gap-2"
                >
                  <div className="text-[10px] text-muted font-mono">
                    {day.total_vehicles > 0
                      ? `${Math.round(
                          day.total_vehicles / 1000
                        )}K`
                      : "0"}
                  </div>

                  <div className="w-full h-full flex items-end justify-center">
                    <div
                      className="w-full max-w-14 bg-signal/70 hover:bg-signal rounded-t-md transition-all"
                      style={{
                        height: `${height}%`,
                      }}
                      title={`${day.day}: ${day.total_vehicles.toLocaleString()} vehicles`}
                    />
                  </div>

                  <div className="text-[11px] text-muted">
                    {day.day.slice(0, 3)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}


      {/* DAILY SPEED + UTILIZATION */}
      {sortedData.length > 0 && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">

          <div className="bg-surface border border-border rounded-xl p-5">
            <div className="mb-5">
              <h2 className="text-base font-medium text-ink">
                Average Speed
              </h2>

              <p className="text-xs text-muted mt-1">
                Average traffic speed by day
              </p>
            </div>

            <div className="space-y-4">
              {sortedData.map((day) => {
                const maxSpeed = Math.max(
                  ...sortedData.map(
                    (item) => item.avg_speed_kmph
                  ),
                  1
                );

                const width =
                  day.avg_speed_kmph === 0
                    ? 0
                    : (day.avg_speed_kmph /
                        maxSpeed) *
                      100;

                return (
                  <div key={day.date}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-muted">
                        {day.day}
                      </span>

                      <span className="text-xs font-mono text-ink">
                        {day.avg_speed_kmph.toFixed(2)} km/h
                      </span>
                    </div>

                    <div className="h-2 bg-surface2 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-flow rounded-full"
                        style={{
                          width: `${width}%`,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>


          <div className="bg-surface border border-border rounded-xl p-5">
            <div className="mb-5">
              <h2 className="text-base font-medium text-ink">
                Road Utilization
              </h2>

              <p className="text-xs text-muted mt-1">
                Average road capacity utilization by day
              </p>
            </div>

            <div className="space-y-4">
              {sortedData.map((day) => {
                const color = utilizationColor(
                  day.avg_utilization_percent
                );

                return (
                  <div key={day.date}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-muted">
                        {day.day}
                      </span>

                      <span
                        className={`text-xs font-mono ${color.text}`}
                      >
                        {day.avg_utilization_percent.toFixed(2)}%
                      </span>
                    </div>

                    <div className="h-2 bg-surface2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${color.bg}`}
                        style={{
                          width: `${Math.min(
                            day.avg_utilization_percent,
                            100
                          )}%`,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      )}


      {/* CONGESTION BY DAY */}
      {sortedData.length > 0 && (
        <div className="bg-surface border border-border rounded-xl p-5">
          <div className="mb-5">
            <h2 className="text-base font-medium text-ink">
              Weekly Congestion Distribution
            </h2>

            <p className="text-xs text-muted mt-1">
              Congestion levels recorded for each day
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-muted border-b border-border">
                  <th className="pb-3 font-normal">
                    Day
                  </th>

                  <th className="pb-3 font-normal text-flow">
                    Low
                  </th>

                  <th className="pb-3 font-normal text-caution">
                    Moderate
                  </th>

                  <th className="pb-3 font-normal text-caution">
                    High
                  </th>

                  <th className="pb-3 font-normal text-congest">
                    Severe
                  </th>

                  <th className="pb-3 font-normal">
                    Total
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-border">
                {sortedData.map((day) => (
                  <tr key={day.date}>
                    <td className="py-3 text-ink font-medium">
                      {day.day}
                    </td>

                    <td className="py-3 text-flow font-mono">
                      {day.congestion.low}
                    </td>

                    <td className="py-3 text-caution font-mono">
                      {day.congestion.moderate}
                    </td>

                    <td className="py-3 text-caution font-mono">
                      {day.congestion.high}
                    </td>

                    <td className="py-3 text-congest font-mono">
                      {day.congestion.severe}
                    </td>

                    <td className="py-3 text-ink font-mono">
                      {day.readings_count}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}


// ============================================================
// MAIN ANALYTICS CONTENT
// ============================================================

function AnalyticsContent() {
  const { token } = useAuth();

  const [summary, setSummary] =
    useState<api.DashboardSummary | null>(null);

  const [zones, setZones] =
    useState<api.ZoneAnalyticsItem[]>([]);

  const [roads, setRoads] =
    useState<api.RoadPerformanceItem[]>([]);

  const [weeklyData, setWeeklyData] =
    useState<api.WeeklyAnalyticsItem[]>([]);

  const [error, setError] =
    useState<string | null>(null);

  const [isRefreshing, setIsRefreshing] =
    useState(false);


  // ==========================================================
  // FETCH ALL ANALYTICS
  // ==========================================================

  const fetchAll = useCallback(async () => {
    if (!token) return;

    try {
      const [
        summaryData,
        zonesData,
        roadsData,
        weeklyDataResponse,
      ] = await Promise.all([
        api.getDashboardSummary(token),
        api.getZoneAnalytics(token),
        api.getRoadPerformance(token),
        api.getWeeklyAnalytics(token),
      ]);

      setSummary(summaryData);
      setZones(zonesData);
      setRoads(roadsData);
      setWeeklyData(weeklyDataResponse);

      setError(null);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not load analytics"
      );
    }
  }, [token]);


  useEffect(() => {
    fetchAll();

    const interval = setInterval(
      fetchAll,
      30000
    );

    return () => clearInterval(interval);
  }, [fetchAll]);


  // ==========================================================
  // REFRESH
  // ==========================================================

  async function handleRefresh() {
    setIsRefreshing(true);

    await fetchAll();

    setIsRefreshing(false);
  }


  // ==========================================================
  // EXISTING CHART DATA
  // ==========================================================

  const lineChartData = useMemo(
    () =>
      roads.map((road) => ({
        road_name: road.road_name,
        current_vehicle_count:
          road.current_vehicles ?? 0,

        predicted_vehicle_count:
          (
            road as {
              predicted_vehicles?: number;
            }
          ).predicted_vehicles ??
          road.current_vehicles ??
          0,
      })),
    [roads]
  );


  const pieChartData = useMemo(
    () => [
      {
        name: "Low",
        value: roads.filter(
          (road) =>
            road.congestion_level === "low"
        ).length,
      },
      {
        name: "Moderate",
        value: roads.filter(
          (road) =>
            road.congestion_level === "moderate"
        ).length,
      },
      {
        name: "High",
        value: roads.filter(
          (road) =>
            road.congestion_level === "high"
        ).length,
      },
      {
        name: "Severe",
        value: roads.filter(
          (road) =>
            road.congestion_level === "severe"
        ).length,
      },
    ],
    [roads]
  );


  const zoneChartData = useMemo(
    () =>
      zones.map((zone) => ({
        zone: zone.zone,
        vehicles: zone.total_vehicles,
      })),
    [zones]
  );


  const heatMapData = useMemo(
    () =>
      zones.map((zone) => ({
        zone: zone.zone,
        utilization:
          zone.avg_utilization_percent,
      })),
    [zones]
  );


  // ==========================================================
  // PAGE
  // ==========================================================

  return (
    <div className="flex flex-col gap-5">

      {/* PAGE HEADER */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-lg font-medium text-ink">
            Analytics
          </h1>

          <p className="text-sm text-muted">
            City-wide traffic insights, weekly trends,
            congestion, and road performance
          </p>
        </div>

        <button
          onClick={handleRefresh}
          className="flex items-center gap-1.5 text-xs text-muted hover:text-ink border border-border rounded-md px-2.5 py-1.5"
        >
          <RefreshCw
            className={`w-3.5 h-3.5 ${
              isRefreshing ? "animate-spin" : ""
            }`}
          />

          Refresh
        </button>
      </div>


      {/* ERROR */}
      {error && (
        <p className="text-sm text-congest bg-congest/10 border border-congest/30 rounded-md px-3 py-2">
          {error}
        </p>
      )}


      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {summary &&
          CARD_CONFIG.map(
            ({
              key,
              icon,
              goodWhen,
            }) => (
              <SummaryCard
                key={key}
                card={summary[key]}
                icon={icon}
                goodWhen={goodWhen}
              />
            )
          )}

        {!summary &&
          Array.from({ length: 8 }).map(
            (_, index) => (
              <div
                key={index}
                className="bg-surface border border-border rounded-xl p-4 h-24 animate-pulse"
              />
            )
          )}
      </div>


      {/* ======================================================
          NEW WEEKLY SECTION
          SUNDAY → SATURDAY
         ====================================================== */}

      <WeeklyAnalyticsSection
        weeklyData={weeklyData}
      />


      {/* EXISTING TRAFFIC CHARTS */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <LineTrafficChart
          data={lineChartData}
        />

        <PieCongestionChart
          data={pieChartData}
        />
      </div>


      {/* EXISTING ZONE ANALYTICS */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <ZoneBarChart
          data={zoneChartData}
        />

        <TrafficHeatMap
          data={heatMapData}
        />
      </div>


      {/* ROAD PERFORMANCE */}
      <RoadPerformanceTable
        roads={roads}
      />

    </div>
  );
}


// ============================================================
// PAGE
// ============================================================

export default function AnalyticsPage() {
  return (
    <DashboardShell>
      <AnalyticsContent />
    </DashboardShell>
  );
}