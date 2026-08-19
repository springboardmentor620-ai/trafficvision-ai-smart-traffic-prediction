"use client";

import { useEffect, useState, useCallback } from "react";
import { DashboardShell } from "@/components/DashboardShell";
import { useAuth } from "@/lib/auth-context";
import * as api from "@/lib/api";
import { Car, Gauge, AlertTriangle, Clock, RefreshCw, Plus } from "lucide-react";

const LEVEL_STYLES: Record<string, { text: string; bg: string; bar: string; label: string }> = {
  low: { text: "text-flow", bg: "bg-flow/10", bar: "bg-flow", label: "Low" },
  moderate: { text: "text-caution", bg: "bg-caution/10", bar: "bg-caution", label: "Moderate" },
  high: { text: "text-caution", bg: "bg-caution/15", bar: "bg-caution", label: "High" },
  severe: { text: "text-congest", bg: "bg-congest/10", bar: "bg-congest", label: "Severe" },
};

function StatCard({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: typeof Car;
  label: string;
  value: string;
  accent: "flow" | "caution" | "congest" | "signal";
}) {
  const accentClass = {
    flow: "text-flow bg-flow/10",
    caution: "text-caution bg-caution/10",
    congest: "text-congest bg-congest/10",
    signal: "text-signal bg-signal/10",
  }[accent];

  return (
    <div className="bg-surface border border-border rounded-xl p-4 flex items-center gap-3">
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${accentClass}`}>
        <Icon className="w-4.5 h-4.5" />
      </div>
      <div>
        <div className="text-xs text-muted">{label}</div>
        <div className="text-lg font-medium text-ink font-mono">{value}</div>
      </div>
    </div>
  );
}

function Panel({ title, action, className = "", children }: { title: string; action?: React.ReactNode; className?: string; children?: React.ReactNode }) {
  return (
    <div className={`bg-surface border border-border rounded-xl p-4 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="text-sm text-muted">{title}</div>
        {action}
      </div>
      {children}
    </div>
  );
}

function DashboardContent() {
  const { token, user } = useAuth();
  const [data, setData] = useState<api.LiveMonitoringSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);

  const canManage = user?.role === "admin" || user?.role === "traffic_operator";

  const fetchLive = useCallback(async () => {
    if (!token) return;
    try {
      const summary = await api.getLiveMonitoring(token);
      setData(summary);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load live traffic data");
    }
  }, [token]);

  useEffect(() => {
    fetchLive();
    // Poll every 8 seconds so the dashboard feels "live" without a websocket.
    const interval = setInterval(fetchLive, 8000);
    return () => clearInterval(interval);
  }, [fetchLive]);

  async function handleRefresh() {
    setIsRefreshing(true);
    await fetchLive();
    setIsRefreshing(false);
  }

  async function handleSeedDemoData() {
    if (!token) return;
    setIsSeeding(true);
    try {
      // Create a few sample roads if none exist yet, then simulate readings.
      if (!data || data.total_roads === 0) {
        await api.createRoad(token, { name: "MG Road", zone: "Downtown", capacity: 500 });
        await api.createRoad(token, { name: "Ring Road", zone: "Outer", capacity: 1000 });
        await api.createRoad(token, { name: "NH-16", zone: "Highway", capacity: 1500 });
      }
      await api.simulateReadings(token);
      await fetchLive();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not seed demo data");
    } finally {
      setIsSeeding(false);
    }
  }

  const activeAlerts = data
    ? (data.roads_by_level.high ?? 0) + (data.roads_by_level.severe ?? 0)
    : 0;

  const roadsWithReadings = data?.roads.filter((r) => r.congestion_level !== null) ?? [];
  const avgSpeed =
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
          <h1 className="text-lg font-medium text-ink">Dashboard</h1>
          <p className="text-sm text-muted">Live overview across all monitored zones</p>
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

      {data && data.total_roads === 0 && (
        <div className="bg-surface2 border border-border border-dashed rounded-xl p-6 text-center">
          <p className="text-sm text-ink mb-1">No roads are being monitored yet</p>
          <p className="text-xs text-muted mb-4">
            {canManage
              ? "You haven't registered any real sensors or CCTV feeds yet. Seed some demo roads and simulated traffic to see the dashboard in action."
              : "Ask an admin or traffic operator to add roads for monitoring."}
          </p>
          {canManage && (
            <button
              onClick={handleSeedDemoData}
              disabled={isSeeding}
              className="inline-flex items-center gap-1.5 bg-signal hover:bg-signal/90 disabled:opacity-60 text-white text-xs font-medium rounded-md px-3 py-2"
            >
              <Plus className="w-3.5 h-3.5" />
              {isSeeding ? "Seeding demo data..." : "Seed demo roads + simulate traffic"}
            </button>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard icon={Car} label="Recorded vehicles" value={data ? data.total_vehicles.toLocaleString() : "—"} accent="signal" />        <StatCard
          icon={Gauge}
          label="Roads monitored"
          value={data ? String(data.total_roads) : "—"}
          accent="flow"
        />
        <StatCard icon={AlertTriangle} label="High / severe congestion" value={data ? String(activeAlerts) : "—"} accent="congest" />
        <StatCard icon={Clock} label="Avg. speed" value={avgSpeed !== "—" ? `${avgSpeed} km/h` : "—"} accent="caution" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Panel
          title="Road status"
          className="lg:col-span-2"
          action={
            canManage && data && data.total_roads > 0 ? (
              <button
                onClick={handleSeedDemoData}
                disabled={isSeeding}
                className="text-xs text-signal hover:underline disabled:opacity-60"
              >
                {isSeeding ? "Simulating..." : "Simulate new readings"}
              </button>
            ) : undefined
          }
        >
          {!data || data.roads.length === 0 ? (
            <div className="h-56 flex items-center justify-center text-muted text-sm">
              No road data yet
            </div>
          ) : (
            <div className="flex flex-col divide-y divide-border max-h-72 overflow-y-auto">
              {data.roads.map((road) => {
                const style = road.congestion_level ? LEVEL_STYLES[road.congestion_level] : null;
                return (
                  <div key={road.road_id} className="flex items-center justify-between py-2.5">
                    <div>
                      <div className="text-sm text-ink">{road.road_name}</div>
                      <div className="text-xs text-muted">{road.zone ?? "Unzoned"}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-muted font-mono">
                        {road.vehicle_count !== null ? `${road.vehicle_count} recorded` : "No data"}
                      </span>
                      {style && (
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${style.text} ${style.bg}`}>
                          {style.label}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Panel>

        <Panel title="Congestion breakdown" className="h-72">
          {data ? (
            <div className="flex flex-col gap-3 mt-2">
              {(["low", "moderate", "high", "severe"] as const).map((level) => {
                const count = data.roads_by_level[level] ?? 0;
                const pct = data.total_roads > 0 ? (count / data.total_roads) * 100 : 0;
                const style = LEVEL_STYLES[level];
                return (
                  <div key={level}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className={style.text}>{style.label}</span>
                      <span className="text-muted">{count}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-surface2 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${style.bar}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="h-40 flex items-center justify-center text-muted text-sm">Loading...</div>
          )}
        </Panel>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <DashboardShell>
      <DashboardContent />
    </DashboardShell>
  );
}
