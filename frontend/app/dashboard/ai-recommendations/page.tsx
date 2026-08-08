"use client";

import { useEffect, useState } from "react";
import { DashboardShell } from "@/components/DashboardShell";
import { useAuth } from "@/lib/auth-context";
import * as api from "@/lib/api";
import {
  Sparkles,
  MapPin,
  Car,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
} from "lucide-react";

const PRIORITY_STYLES: Record<string, string> = {
  Critical: "bg-red-600/15 text-red-400 border-red-600/40",
  High: "bg-orange-500/15 text-orange-400 border-orange-500/40",
  Medium: "bg-yellow-500/15 text-yellow-400 border-yellow-500/40",
  Low: "bg-emerald-500/15 text-emerald-400 border-emerald-500/40",
};

function priorityStyle(priority: string) {
  return PRIORITY_STYLES[priority] ?? PRIORITY_STYLES.Low;
}

function trendIcon(trend: string) {
  const normalized = trend?.toLowerCase() ?? "";
  if (normalized.includes("increas")) return <TrendingUp size={18} className="text-red-400" />;
  if (normalized.includes("decreas")) return <TrendingDown size={18} className="text-emerald-400" />;
  return <Minus size={18} className="text-muted" />;
}

export default function AIRecommendationPage() {
  const { token } = useAuth();

  const [roads, setRoads] = useState<api.Road[]>([]);
  const [selectedRoad, setSelectedRoad] = useState("");

  const [recommendation, setRecommendation] =
    useState<api.RoadRecommendation | null>(null);

  const [loadingRoads, setLoadingRoads] = useState(true);
  const [loadingRecommendation, setLoadingRecommendation] = useState(false);

  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) return;

    async function loadRoads() {
      try {
        const data = await api.listRoads(token as string);
        setRoads(data);
      } catch (err) {
        console.error(err);
        setError("Unable to load roads.");
      } finally {
        setLoadingRoads(false);
      }
    }

    loadRoads();
  }, [token]);

  async function handleRecommendation() {
    if (!selectedRoad || !token) return;

    setLoadingRecommendation(true);

    try {
      const result = await api.getAiRecommendation(token, Number(selectedRoad));
      setRecommendation(result);
      setError("");
    } catch (err) {
      console.error(err);
      setRecommendation(null);
      setError("Unable to fetch recommendation.");
    } finally {
      setLoadingRecommendation(false);
    }
  }

  return (
    <DashboardShell>
      <div className="space-y-6 w-full">
        <div>
          <h1 className="text-3xl font-bold text-ink flex items-center gap-3">
            <Sparkles className="text-signal" />
            AI Recommendation
          </h1>
          <p className="text-muted mt-2">
            Select a road to get AI-powered traffic recommendations.
          </p>
        </div>

        <div className="rounded-xl border border-border bg-surface p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div className="md:col-span-2">
              <label className="text-sm font-medium mb-2 block text-muted">
                Select Road
              </label>

              {loadingRoads ? (
                <div className="w-full rounded-lg border border-border bg-surface2 p-3 text-muted">
                  Loading roads...
                </div>
              ) : (
                <select
                  className="w-full rounded-lg border border-border bg-surface2 p-3 text-ink focus:outline-none focus:ring-2 focus:ring-signal"
                  value={selectedRoad}
                  onChange={(e) => setSelectedRoad(e.target.value)}
                >
                  <option value="">-- Choose Road --</option>
                  {roads.map((road) => (
                    <option key={road.id} value={road.id}>
                      {road.name} ({road.zone ?? "Unzoned"})
                    </option>
                  ))}
                </select>
              )}
            </div>

            <button
              onClick={handleRecommendation}
              disabled={!selectedRoad || loadingRecommendation}
              className="h-12 rounded-lg bg-signal text-white font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              {loadingRecommendation ? "Loading..." : "Get Recommendation"}
            </button>
          </div>
        </div>

        {error && (
          <div className="rounded-lg border border-red-500 bg-red-500/10 p-4 text-red-400 flex items-center gap-2">
            <AlertTriangle size={18} />
            {error}
          </div>
        )}

        {recommendation && (
          <div className="rounded-xl border border-border bg-surface p-6">
            <div className="flex justify-between items-start gap-4 flex-wrap">
              <div>
                <h2 className="text-2xl font-bold text-ink">
                  {recommendation.road_name}
                </h2>
                <p className="text-muted mt-1 flex items-center gap-1">
                  <MapPin size={16} />
                  {recommendation.zone ?? "Unzoned"}
                </p>
              </div>

              <span
                className={`px-4 py-1.5 rounded-full text-sm font-semibold border ${priorityStyle(
                  recommendation.priority
                )}`}
              >
                {recommendation.priority}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div className="rounded-lg border border-border bg-surface2 p-4">
                <h3 className="font-semibold text-ink mb-3">Current Status</h3>

                <p className="flex items-center gap-2 text-ink">
                  <Car size={16} className="text-muted" />
                  Vehicles:
                  <strong>{recommendation.current_vehicle_count.toLocaleString()}</strong>
                </p>

                <p className="mt-2 text-ink">
                  Congestion:{" "}
                  <strong>
                    {recommendation.current_congestion?.toUpperCase() ?? "N/A"}
                  </strong>
                </p>
              </div>

              <div className="rounded-lg border border-border bg-surface2 p-4">
                <h3 className="font-semibold text-ink mb-3">AI Prediction</h3>

                <p className="flex items-center gap-2 text-ink">
                  <Car size={16} className="text-muted" />
                  Vehicles:{" "}
                  <strong>
                    {recommendation.predicted_vehicle_count?.toLocaleString() ?? "N/A"}
                  </strong>
                </p>

                <p className="mt-2 text-ink">
                  Congestion:{" "}
                  <strong>
                    {recommendation.predicted_congestion?.toUpperCase() ?? "N/A"}
                  </strong>
                </p>
              </div>
            </div>

            <div className="mt-6 flex items-center gap-2 text-ink">
              {trendIcon(recommendation.trend)}
              <span className="font-semibold">Trend:</span>
              <span className="text-muted">{recommendation.trend}</span>
            </div>

            <div className="mt-6 rounded-lg border border-signal/30 bg-signal/10 p-5">
              <h3 className="text-signal font-bold flex items-center gap-2">
                <Sparkles size={18} />
                AI Recommendation
              </h3>
              <p className="mt-2 text-ink">{recommendation.recommendation}</p>
            </div>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}