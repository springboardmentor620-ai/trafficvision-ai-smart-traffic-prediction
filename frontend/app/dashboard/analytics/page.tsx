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

function utilizationColor(percent: number): { bg: string; border: string; text: string } {
  if (percent < 40) return { bg: "bg-flow/15", border: "border-flow/40", text: "text-flow" };
  if (percent < 70) return { bg: "bg-caution/15", border: "border-caution/40", text: "text-caution" };
  if (percent < 90) return { bg: "bg-caution/25", border: "border-caution/60", text: "text-caution" };
  return { bg: "bg-congest/15", border: "border-congest/40", text: "text-congest" };
}

type GoodDirection = "up" | "down" | "neutral";

const CARD_CONFIG: {
  key: keyof api.DashboardSummary;
  icon: typeof Car;
  goodWhen: GoodDirection;
}[] = [
  { key: "total_roads_monitored", icon: MapPinned, goodWhen: "neutral" },
  { key: "total_vehicles_today", icon: Car, goodWhen: "down" },
  { key: "avg_utilization", icon: Gauge, goodWhen: "down" },
  { key: "busiest_zone", icon: Flame, goodWhen: "neutral" },
  { key: "least_congested_zone", icon: Leaf, goodWhen: "neutral" },
  { key: "total_alerts_today", icon: Bell, goodWhen: "down" },
  { key: "avg_vehicle_speed", icon: Zap, goodWhen: "up" },
  { key: "prediction_accuracy", icon: Target, goodWhen: "up" },
];

function SummaryCard({ card, icon: Icon, goodWhen }: { card: api.MetricCard; icon: typeof Car; goodWhen: GoodDirection }) {
  const displayValue = card.display_value ?? (card.unit ? `${card.value} ${card.unit}` : `${card.value}`);

  let trendColor = "text-muted";
  let TrendIcon = Minus;
  if (card.trend === "up") {
    TrendIcon = TrendingUp;
    trendColor = goodWhen === "up" ? "text-flow" : goodWhen === "down" ? "text-congest" : "text-signal";
  } else if (card.trend === "down") {
    TrendIcon = TrendingDown;
    trendColor = goodWhen === "down" ? "text-flow" : goodWhen === "up" ? "text-congest" : "text-signal";
  }

  return (
    <div className="bg-surface border border-border rounded-xl p-4 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <div className="w-9 h-9 rounded-lg flex items-center justify-center text-signal bg-signal/10">
          <Icon className="w-4.5 h-4.5" />
        </div>
        {card.change_percent !== null && (
          <div className={`flex items-center gap-1 text-xs font-medium ${trendColor}`}>
            <TrendIcon className="w-3.5 h-3.5" />
            {Math.abs(card.change_percent)}%
          </div>
        )}
      </div>
      <div>
        <div className="text-xs text-muted">{card.label}</div>
        <div className="text-lg font-medium text-ink font-mono truncate">{displayValue}</div>
      </div>
      {card.yesterday_value === null && card.change_percent === null && card.display_value === null && (
        <div className="text-[11px] text-muted">No comparison data yet</div>
      )}
    </div>
  );
}

type SortKey = "utilization_percent" | "current_vehicles" | "avg_speed_kmph" | "road_name";

function RoadPerformanceTable({ roads }: { roads: api.RoadPerformanceItem[] }) {
  const [search, setSearch] = useState("");
  const [levelFilter, setLevelFilter] = useState<string>("all");
  const [sortKey, setSortKey] = useState<SortKey>("utilization_percent");
  const [sortAsc, setSortAsc] = useState(false);

  const filtered = useMemo(() => {
    let list = roads.filter((r) => {
      const matchesSearch =
        search.trim() === "" ||
        r.road_name.toLowerCase().includes(search.toLowerCase()) ||
        (r.zone ?? "").toLowerCase().includes(search.toLowerCase());
      const matchesLevel = levelFilter === "all" || r.congestion_level === levelFilter;
      return matchesSearch && matchesLevel;
    });

    list = [...list].sort((a, b) => {
      const av: number | string = a[sortKey] ?? 0;
      const bv: number | string = b[sortKey] ?? 0;
      if (typeof av === "string" && typeof bv === "string") {
        return sortAsc ? av.localeCompare(bv) : bv.localeCompare(av);
      }
      return sortAsc ? (av as number) - (bv as number) : (bv as number) - (av as number);
    });
    return list;
  }, [roads, search, levelFilter, sortKey, sortAsc]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortAsc((v) => !v);
    } else {
      setSortKey(key);
      setSortAsc(false);
    }
  }

  const columns: { key: SortKey; label: string }[] = [
    { key: "road_name", label: "Road" },
    { key: "current_vehicles", label: "Vehicles" },
    { key: "utilization_percent", label: "Utilization" },
    { key: "avg_speed_kmph", label: "Speed" },
  ];

  return (
    <div className="bg-surface border border-border rounded-xl p-4">
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <div className="text-sm text-muted">Road performance</div>
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
        <div className="h-32 flex items-center justify-center text-muted text-sm">No roads match your filters</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-muted border-b border-border">
                <th className="pb-2 font-normal w-8"></th>
                {columns.map((col) => (
                  <th key={col.key} className="pb-2 font-normal">
                    <button onClick={() => toggleSort(col.key)} className="flex items-center gap-1 hover:text-ink">
                      {col.label}
                      <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                ))}
                <th className="pb-2 font-normal">Zone</th>
                <th className="pb-2 font-normal">Congestion</th>
                <th className="pb-2 font-normal">Trend</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((road) => (
                <tr key={road.road_id} className={road.status === "worst" ? "bg-congest/5" : road.status === "best" ? "bg-flow/5" : ""}>
                  <td className="py-2.5">
                    {road.status === "worst" && <span className="text-[10px] text-congest font-medium">WORST</span>}
                    {road.status === "best" && <span className="text-[10px] text-flow font-medium">BEST</span>}
                  </td>
                  <td className="py-2.5 text-ink">{road.road_name}</td>
                  <td className="py-2.5 text-ink font-mono">{road.current_vehicles ?? "—"}</td>
                  <td className="py-2.5 text-ink font-mono">{road.utilization_percent}%</td>
                  <td className="py-2.5 text-ink font-mono">
                    {road.avg_speed_kmph !== null ? `${road.avg_speed_kmph} km/h` : "—"}
                  </td>
                  <td className="py-2.5 text-muted">{road.zone ?? "—"}</td>
                  <td className="py-2.5">
                    {road.congestion_level ? (
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${LEVEL_TEXT[road.congestion_level]} ${LEVEL_BG[road.congestion_level]}`}>
                        {road.congestion_level}
                      </span>
                    ) : (
                      <span className="text-xs text-muted">—</span>
                    )}
                  </td>
                  <td className="py-2.5">
                    {road.trend === "increasing" && <TrendingUp className="w-4 h-4 text-congest" />}
                    {road.trend === "decreasing" && <TrendingDown className="w-4 h-4 text-flow" />}
                    {road.trend === "stable" && <Minus className="w-4 h-4 text-muted" />}
                    {!road.trend && <span className="text-xs text-muted">—</span>}
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

function AnalyticsContent() {
  const { token } = useAuth();
  const [summary, setSummary] = useState<api.DashboardSummary | null>(null);
  const [zones, setZones] = useState<api.ZoneAnalyticsItem[]>([]);
  const [roads, setRoads] = useState<api.RoadPerformanceItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchAll = useCallback(async () => {
    if (!token) return;
    try {
      const [summaryData, zonesData, roadsData] = await Promise.all([
        api.getDashboardSummary(token),
        api.getZoneAnalytics(token),
        api.getRoadPerformance(token),
      ]);
      setSummary(summaryData);
      setZones(zonesData);
      setRoads(roadsData);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load analytics");
    }
  }, [token]);

  useEffect(() => {
    fetchAll();
    const interval = setInterval(fetchAll, 30000);
    return () => clearInterval(interval);
  }, [fetchAll]);

  async function handleRefresh() {
    setIsRefreshing(true);
    await fetchAll();
    setIsRefreshing(false);
  }

  // Chart data derived from the same roads/zones state used by the table above.
  // Note: RoadPerformanceItem doesn't currently expose a `predicted_vehicles`
  // field, so the line chart falls back to current_vehicles until the API adds it.
  const lineChartData = useMemo(
    () =>
      roads.map((road) => ({
        road_name: road.road_name,
        current_vehicle_count: road.current_vehicles ?? 0,
        predicted_vehicle_count:
          (road as { predicted_vehicles?: number }).predicted_vehicles ?? road.current_vehicles ?? 0,
      })),
    [roads]
  );

  const pieChartData = useMemo(
    () => [
      { name: "Low", value: roads.filter((r) => r.congestion_level === "low").length },
      { name: "Moderate", value: roads.filter((r) => r.congestion_level === "moderate").length },
      { name: "High", value: roads.filter((r) => r.congestion_level === "high").length },
      { name: "Severe", value: roads.filter((r) => r.congestion_level === "severe").length },
    ],
    [roads]
  );

  const zoneChartData = useMemo(
    () => zones.map((zone) => ({ zone: zone.zone, vehicles: zone.total_vehicles })),
    [zones]
  );

  const heatMapData = useMemo(
    () => zones.map((zone) => ({ zone: zone.zone, utilization: zone.avg_utilization_percent })),
    [zones]
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-medium text-ink">Analytics</h1>
          <p className="text-sm text-muted">City-wide traffic insights, zone congestion, and road performance</p>
        </div>
        <button
          onClick={handleRefresh}
          className="flex items-center gap-1.5 text-xs text-muted hover:text-ink border border-border rounded-md px-2.5 py-1.5"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {error && <p className="text-sm text-congest bg-congest/10 border border-congest/30 rounded-md px-3 py-2">{error}</p>}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {summary &&
          CARD_CONFIG.map(({ key, icon, goodWhen }) => (
            <SummaryCard key={key} card={summary[key]} icon={icon} goodWhen={goodWhen} />
          ))}
        {!summary &&
          Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-surface border border-border rounded-xl p-4 h-24 animate-pulse" />
          ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <LineTrafficChart data={lineChartData} />
        <PieCongestionChart data={pieChartData} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <ZoneBarChart data={zoneChartData} />
        <TrafficHeatMap data={heatMapData} />
      </div>

      <RoadPerformanceTable roads={roads} />
    </div>
  );
}

export default function AnalyticsPage() {
  return (
    <DashboardShell>
      <AnalyticsContent />
    </DashboardShell>
  );
}