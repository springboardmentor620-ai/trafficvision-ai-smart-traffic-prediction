"use client";

import { useEffect, useState, useCallback, FormEvent } from "react";
import { DashboardShell } from "@/components/DashboardShell";
import { useAuth } from "@/lib/auth-context";
import * as api from "@/lib/api";
import { ApiError } from "@/lib/api";
import { Navigation, Sparkles, ArrowRight, CheckCircle2 } from "lucide-react";

const LEVEL_STYLES: Record<string, { text: string; bg: string; label: string }> = {
  low: { text: "text-flow", bg: "bg-flow/10", label: "Low" },
  moderate: { text: "text-caution", bg: "bg-caution/10", label: "Moderate" },
  high: { text: "text-caution", bg: "bg-caution/15", label: "High" },
  severe: { text: "text-congest", bg: "bg-congest/10", label: "Severe" },
};

function RouteOptionCard({
  option,
  isRecommended,
}: {
  option: api.RouteOption;
  isRecommended: boolean;
}) {
  return (
    <div
      className={`rounded-xl border p-4 ${
        isRecommended ? "border-flow bg-flow/5" : "border-border bg-surface"
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-ink">{option.label}</span>
          {isRecommended && (
            <span className="flex items-center gap-1 text-xs text-flow bg-flow/10 px-2 py-0.5 rounded-full">
              <CheckCircle2 className="w-3 h-3" /> Recommended
            </span>
          )}
        </div>
        <div className="text-right">
          <div className="text-sm font-mono text-ink">{option.total_time_minutes} min</div>
          <div className="text-xs text-muted">{option.total_distance_km} km</div>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {option.legs.map((leg, i) => {
          const style = leg.congestion_level ? LEVEL_STYLES[leg.congestion_level] : null;
          return (
            <div key={i} className="flex items-center justify-between text-xs bg-surface2 rounded-md px-3 py-2">
              <div className="flex items-center gap-1.5 text-ink">
                {leg.from_road_name}
                <ArrowRight className="w-3 h-3 text-muted" />
                {leg.to_road_name}
              </div>
              <div className="flex items-center gap-2 text-muted">
                <span className="font-mono">{leg.distance_km} km</span>
                <span className="font-mono">{leg.estimated_speed_kmph} km/h</span>
                {style && (
                  <span className={`font-medium px-2 py-0.5 rounded-full ${style.text} ${style.bg}`}>
                    {style.label}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function RouteAnalysisContent() {
  const { token } = useAuth();
  const [roads, setRoads] = useState<api.Road[]>([]);
  const [originId, setOriginId] = useState("");
  const [destinationId, setDestinationId] = useState("");
  const [result, setResult] = useState<api.RouteRecommendation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchRoads = useCallback(async () => {
    if (!token) return;
    try {
      const data = await api.listRoads(token);
      setRoads(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load roads");
    }
  }, [token]);

  useEffect(() => {
    fetchRoads();
  }, [fetchRoads]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!token || !originId || !destinationId) return;
    setError(null);
    setResult(null);
    setIsLoading(true);
    try {
      const data = await api.recommendRoute(token, Number(originId), Number(destinationId));
      setResult(data);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not find a route");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-lg font-medium text-ink">Route analysis</h1>
        <p className="text-sm text-muted">Compare direct vs alternate routes based on live congestion</p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-surface border border-border rounded-xl p-4 flex flex-col sm:flex-row items-end gap-3"
      >
        <div className="flex-1 w-full">
          <label className="block text-xs text-muted mb-1">From</label>
          <select
            required
            value={originId}
            onChange={(e) => setOriginId(e.target.value)}
            className="w-full bg-surface2 border border-border rounded-md px-3 py-2 text-sm text-ink outline-none focus:border-signal"
          >
            <option value="">Select origin...</option>
            {roads.map((r) => (
              <option key={r.id} value={r.id} disabled={String(r.id) === destinationId}>
                {r.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex-1 w-full">
          <label className="block text-xs text-muted mb-1">To</label>
          <select
            required
            value={destinationId}
            onChange={(e) => setDestinationId(e.target.value)}
            className="w-full bg-surface2 border border-border rounded-md px-3 py-2 text-sm text-ink outline-none focus:border-signal"
          >
            <option value="">Select destination...</option>
            {roads.map((r) => (
              <option key={r.id} value={r.id} disabled={String(r.id) === originId}>
                {r.name}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          disabled={isLoading || !originId || !destinationId}
          className="flex items-center gap-1.5 bg-signal hover:bg-signal/90 disabled:opacity-60 text-white text-sm font-medium rounded-md px-4 py-2 whitespace-nowrap"
        >
          <Navigation className="w-4 h-4" />
          {isLoading ? "Finding route..." : "Find best route"}
        </button>
      </form>

      {error && (
        <p className="text-sm text-congest bg-congest/10 border border-congest/30 rounded-md px-3 py-2">
          {error}
        </p>
      )}

      {result && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2 text-sm text-ink bg-surface2 border border-border rounded-md px-3 py-2.5">
            <Sparkles className="w-4 h-4 text-signal shrink-0" />
            {result.reason}
          </div>

          <RouteOptionCard option={result.direct} isRecommended={result.recommended_label === result.direct.label} />

          {result.alternates.map((alt) => (
            <RouteOptionCard key={alt.label} option={alt} isRecommended={result.recommended_label === alt.label} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function RouteAnalysisPage() {
  return (
    <DashboardShell>
      <RouteAnalysisContent />
    </DashboardShell>
  );
}