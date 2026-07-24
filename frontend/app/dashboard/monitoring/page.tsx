"use client";

import { useEffect, useState, useCallback, FormEvent } from "react";
import { DashboardShell } from "@/components/DashboardShell";
import { useAuth } from "@/lib/auth-context";
import * as api from "@/lib/api";
import { ApiError } from "@/lib/api";
import { Car, Gauge, RefreshCw, Plus, Send } from "lucide-react";

const LEVEL_STYLES: Record<string, { text: string; bg: string; bar: string; label: string }> = {
  low: { text: "text-flow", bg: "bg-flow/10", bar: "bg-flow", label: "Low" },
  moderate: { text: "text-caution", bg: "bg-caution/10", bar: "bg-caution", label: "Moderate" },
  high: { text: "text-caution", bg: "bg-caution/15", bar: "bg-caution", label: "High" },
  severe: { text: "text-congest", bg: "bg-congest/10", bar: "bg-congest", label: "Severe" },
};
function timeAgo(iso: string | null): string {
  if (!iso) return "No data yet";
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  return `${Math.floor(seconds / 3600)}h ago`;
}

function MonitoringContent() {
  const { token, user } = useAuth();
  const [data, setData] = useState<api.LiveMonitoringSummary | null>(null);
  const [utilization, setUtilization] = useState<api.RoadUtilization[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Add-road form state
  const [roadName, setRoadName] = useState("");
  const [roadZone, setRoadZone] = useState("");
  const [roadCapacity, setRoadCapacity] = useState("1000");
  const [roadError, setRoadError] = useState<string | null>(null);
  const [roadSuccess, setRoadSuccess] = useState(false);
  const [isAddingRoad, setIsAddingRoad] = useState(false);

  // Submit-reading form state
  const [selectedRoadId, setSelectedRoadId] = useState("");
  const [vehicleCount, setVehicleCount] = useState("");
  const [avgSpeed, setAvgSpeed] = useState("");
  const [readingError, setReadingError] = useState<string | null>(null);
  const [readingSuccess, setReadingSuccess] = useState(false);
  const [isSubmittingReading, setIsSubmittingReading] = useState(false);

  const canManage = user?.role === "admin" || user?.role === "traffic_operator";

  const fetchLive = useCallback(async () => {
    if (!token) return;
    try {
      const [summary, util] = await Promise.all([
        api.getLiveMonitoring(token),
        api.getRoadUtilization(token),
      ]);
      setData(summary);
      setUtilization(util);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load live traffic data");
    }
  }, [token]);

  useEffect(() => {
    fetchLive();
    const interval = setInterval(fetchLive, 8000);
    return () => clearInterval(interval);
  }, [fetchLive]);

  async function handleRefresh() {
    setIsRefreshing(true);
    await fetchLive();
    setIsRefreshing(false);
  }

  async function handleAddRoad(e: FormEvent) {
    e.preventDefault();
    if (!token) return;
    setRoadError(null);
    setRoadSuccess(false);
    setIsAddingRoad(true);
    try {
      await api.createRoad(token, {
        name: roadName,
        zone: roadZone || undefined,
        capacity: Number(roadCapacity) || 1000,
      });
      setRoadName("");
      setRoadZone("");
      setRoadCapacity("1000");
      setRoadSuccess(true);
      await fetchLive();
      setTimeout(() => setRoadSuccess(false), 3000);
    } catch (err) {
      setRoadError(err instanceof ApiError ? err.message : "Could not add road");
    } finally {
      setIsAddingRoad(false);
    }
  }

  async function handleSubmitReading(e: FormEvent) {
    e.preventDefault();
    if (!token || !selectedRoadId) return;
    setReadingError(null);
    setReadingSuccess(false);
    setIsSubmittingReading(true);
    try {
      await api.submitTrafficReading(token, {
        road_id: Number(selectedRoadId),
        vehicle_count: Number(vehicleCount),
        avg_speed_kmph: avgSpeed ? Number(avgSpeed) : undefined,
      });
      setVehicleCount("");
      setAvgSpeed("");
      setReadingSuccess(true);
      await fetchLive();
      setTimeout(() => setReadingSuccess(false), 3000);
    } catch (err) {
      setReadingError(err instanceof ApiError ? err.message : "Could not submit reading");
    } finally {
      setIsSubmittingReading(false);
    }
  }

  const roadsWithReadings = data?.roads.filter((r) => r.congestion_level !== null) ?? [];
  const avgSpeedOverall =
    roadsWithReadings.length > 0
      ? (
          roadsWithReadings.reduce((sum, r) => sum + (r.avg_speed_kmph ?? 0), 0) /
          roadsWithReadings.length
        ).toFixed(1)
      : "—";

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-medium text-ink">Traffic monitoring</h1>
          <p className="text-sm text-muted">Live vehicle density and congestion per road</p>
        </div>
        <button
          onClick={handleRefresh}
          className="flex items-center gap-1.5 text-xs text-muted hover:text-ink border border-border rounded-md px-2.5 py-1.5"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {error && (
        <p className="text-sm text-congest bg-congest/10 border border-congest/30 rounded-md px-3 py-2">
          {error}
        </p>
      )}

      {/* Summary stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-surface border border-border rounded-xl p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center text-signal bg-signal/10">
            <Car className="w-4.5 h-4.5" />
          </div>
          <div>
            <div className="text-xs text-muted">Total vehicles</div>
            <div className="text-lg font-medium text-ink font-mono">
              {data ? data.total_vehicles.toLocaleString() : "—"}
            </div>
          </div>
        </div>
        <div className="bg-surface border border-border rounded-xl p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center text-flow bg-flow/10">
            <Gauge className="w-4.5 h-4.5" />
          </div>
          <div>
            <div className="text-xs text-muted">Average speed</div>
            <div className="text-lg font-medium text-ink font-mono">
              {avgSpeedOverall !== "—" ? `${avgSpeedOverall} km/h` : "—"}
            </div>
          </div>
        </div>
        <div className="bg-surface border border-border rounded-xl p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center text-caution bg-caution/10">
            <Car className="w-4.5 h-4.5" />
          </div>
          <div>
            <div className="text-xs text-muted">Roads monitored</div>
            <div className="text-lg font-medium text-ink font-mono">{data ? data.total_roads : "—"}</div>
          </div>
        </div>
      </div>

      {/* Road status table */}
      <div className="bg-surface border border-border rounded-xl p-4">
        <div className="text-sm text-muted mb-3">Road status</div>
        {!data || data.roads.length === 0 ? (
          <div className="h-40 flex items-center justify-center text-muted text-sm">
            No roads yet — add one below to get started.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-muted border-b border-border">
                  <th className="pb-2 font-normal">Road</th>
                  <th className="pb-2 font-normal">Zone</th>
                  <th className="pb-2 font-normal">Vehicles</th>
                  <th className="pb-2 font-normal">Avg speed</th>
                  <th className="pb-2 font-normal">Congestion</th>
                  <th className="pb-2 font-normal">Last updated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {data.roads.map((road) => {
                  const style = road.congestion_level ? LEVEL_STYLES[road.congestion_level] : null;
                  return (
                    <tr key={road.road_id}>
                      <td className="py-2 text-ink">{road.road_name}</td>
                      <td className="py-2 text-muted">{road.zone ?? "—"}</td>
                      <td className="py-2 text-ink font-mono">{road.vehicle_count ?? "—"}</td>
                      <td className="py-2 text-ink font-mono">
                        {road.avg_speed_kmph !== null ? `${road.avg_speed_kmph} km/h` : "—"}
                      </td>
                      <td className="py-2">
                        {style ? (
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${style.text} ${style.bg}`}>
                            {style.label}
                          </span>
                        ) : (
                          <span className="text-xs text-muted">—</span>
                        )}
                      </td>
                      <td className="py-2 text-xs text-muted">{timeAgo(road.recorded_at)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Road utilization analysis */}
      <div className="bg-surface border border-border rounded-xl p-4">
        <div className="text-sm text-muted mb-1">Road utilization analysis</div>
        <p className="text-xs text-muted mb-3">
          How full each road is relative to its capacity — ranked most to least strained.
        </p>
        {!utilization || utilization.length === 0 ? (
          <div className="h-24 flex items-center justify-center text-muted text-sm">
            No utilization data yet
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {utilization.map((road) => {
              const style = road.congestion_level ? LEVEL_STYLES[road.congestion_level] : null;
              return (
                <div key={road.road_id}>
                  <div className="flex justify-between items-baseline text-xs mb-1">
                    <span className="text-ink">
                      {road.road_name}
                      {road.zone && <span className="text-muted"> · {road.zone}</span>}
                    </span>
                    <span className="text-muted font-mono">
                      {road.vehicle_count}/{road.capacity} vehicles ({road.utilization_percent}%)
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-surface2 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${style ? style.bar : "bg-muted"}`}
                      style={{ width: `${Math.min(road.utilization_percent, 100)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {canManage && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Add road form */}
          <form
            onSubmit={handleAddRoad}
            className="bg-surface border border-border rounded-xl p-4 flex flex-col gap-3"
          >
            <div className="text-sm text-ink font-medium flex items-center gap-1.5">
              <Plus className="w-4 h-4" /> Add a road
            </div>
            <div>
              <label className="block text-xs text-muted mb-1">Road name</label>
              <input
                required
                value={roadName}
                onChange={(e) => setRoadName(e.target.value)}
                placeholder="e.g. MG Road"
                className="w-full bg-surface2 border border-border rounded-md px-3 py-2 text-sm text-ink placeholder:text-muted outline-none focus:border-signal"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-muted mb-1">Zone (optional)</label>
                <input
                  value={roadZone}
                  onChange={(e) => setRoadZone(e.target.value)}
                  placeholder="Downtown"
                  className="w-full bg-surface2 border border-border rounded-md px-3 py-2 text-sm text-ink placeholder:text-muted outline-none focus:border-signal"
                />
              </div>
              <div>
                <label className="block text-xs text-muted mb-1">Capacity</label>
                <input
                  type="number"
                  min={1}
                  value={roadCapacity}
                  onChange={(e) => setRoadCapacity(e.target.value)}
                  className="w-full bg-surface2 border border-border rounded-md px-3 py-2 text-sm text-ink placeholder:text-muted outline-none focus:border-signal"
                />
              </div>
            </div>
            {roadError && <p className="text-xs text-congest">{roadError}</p>}
            {roadSuccess && <p className="text-xs text-flow">Road added.</p>}
            <button
              type="submit"
              disabled={isAddingRoad}
              className="mt-1 bg-signal hover:bg-signal/90 disabled:opacity-60 text-white text-sm font-medium rounded-md py-2 transition-colors"
            >
              {isAddingRoad ? "Adding..." : "Add road"}
            </button>
          </form>

          {/* Submit reading form */}
          <form
            onSubmit={handleSubmitReading}
            className="bg-surface border border-border rounded-xl p-4 flex flex-col gap-3"
          >
            <div className="text-sm text-ink font-medium flex items-center gap-1.5">
              <Send className="w-4 h-4" /> Submit a traffic reading
            </div>
            <div>
              <label className="block text-xs text-muted mb-1">Road</label>
              <select
                required
                value={selectedRoadId}
                onChange={(e) => setSelectedRoadId(e.target.value)}
                className="w-full bg-surface2 border border-border rounded-md px-3 py-2 text-sm text-ink outline-none focus:border-signal"
              >
                <option value="">Select a road...</option>
                {data?.roads.map((r) => (
                  <option key={r.road_id} value={r.road_id}>
                    {r.road_name}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-muted mb-1">Vehicle count</label>
                <input
                  type="number"
                  required
                  min={0}
                  value={vehicleCount}
                  onChange={(e) => setVehicleCount(e.target.value)}
                  placeholder="e.g. 320"
                  className="w-full bg-surface2 border border-border rounded-md px-3 py-2 text-sm text-ink placeholder:text-muted outline-none focus:border-signal"
                />
              </div>
              <div>
                <label className="block text-xs text-muted mb-1">Avg speed (km/h)</label>
                <input
                  type="number"
                  min={0}
                  value={avgSpeed}
                  onChange={(e) => setAvgSpeed(e.target.value)}
                  placeholder="Optional"
                  className="w-full bg-surface2 border border-border rounded-md px-3 py-2 text-sm text-ink placeholder:text-muted outline-none focus:border-signal"
                />
              </div>
            </div>
            {readingError && <p className="text-xs text-congest">{readingError}</p>}
            {readingSuccess && <p className="text-xs text-flow">Reading submitted.</p>}
            <button
              type="submit"
              disabled={isSubmittingReading || !data?.roads.length}
              className="mt-1 bg-signal hover:bg-signal/90 disabled:opacity-60 text-white text-sm font-medium rounded-md py-2 transition-colors"
            >
              {isSubmittingReading ? "Submitting..." : "Submit reading"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export default function MonitoringPage() {
  return (
    <DashboardShell>
      <MonitoringContent />
    </DashboardShell>
  );
}
