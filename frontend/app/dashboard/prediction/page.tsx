"use client";

import { useEffect, useState, useCallback } from "react";
import { DashboardShell } from "@/components/DashboardShell";
import { useAuth } from "@/lib/auth-context";
import * as api from "@/lib/api";
import { TrendingUp, TrendingDown, Minus, Sparkles } from "lucide-react";

const LEVEL_STYLES: Record<string, { text: string; bg: string; label: string }> = {
  low: { text: "text-flow", bg: "bg-flow/10", label: "Low" },
  moderate: { text: "text-caution", bg: "bg-caution/10", label: "Moderate" },
  high: { text: "text-caution", bg: "bg-caution/15", label: "High" },
  severe: { text: "text-congest", bg: "bg-congest/10", label: "Severe" },
};

const TREND_ICON: Record<string, typeof TrendingUp> = {
  increasing: TrendingUp,
  decreasing: TrendingDown,
  stable: Minus,
};

function PredictionContent() {
  const { token } = useAuth();
  const [report, setReport] = useState<api.PredictionReportItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [forecastingRoadId, setForecastingRoadId] = useState<number | null>(null);
  const [hoursAhead, setHoursAhead] = useState("1");
  const [insufficientDataMsg, setInsufficientDataMsg] = useState<string | null>(null);

  const fetchReport = useCallback(async () => {
    if (!token) return;
    try {
      const data = await api.getPredictionReport(token);
      setReport(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load prediction report");
    }
  }, [token]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  async function handleForecast(roadId: number) {
    if (!token) return;
    setForecastingRoadId(roadId);
    setInsufficientDataMsg(null);
    try {
      const result = await api.forecastRoad(token, roadId, Number(hoursAhead) || 1);
      if (result.insufficient_data) {
        setInsufficientDataMsg(
          `${result.road_name} only has ${result.data_points_available} reading(s) — needs at least ${result.data_points_required} to forecast.`
        );
      } else {
        await fetchReport();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not generate forecast");
    } finally {
      setForecastingRoadId(null);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-lg font-medium text-ink">Traffic prediction</h1>
          <p className="text-sm text-muted">Forecast congestion ahead of time, per road</p>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs text-muted">Hours ahead</label>
          <input
            type="number"
            min={0.5}
            max={48}
            step={0.5}
            value={hoursAhead}
            onChange={(e) => setHoursAhead(e.target.value)}
            className="w-20 bg-surface2 border border-border rounded-md px-2 py-1.5 text-sm text-ink outline-none focus:border-signal"
          />
        </div>
      </div>

      {error && (
        <p className="text-sm text-congest bg-congest/10 border border-congest/30 rounded-md px-3 py-2">
          {error}
        </p>
      )}
      {insufficientDataMsg && (
        <p className="text-sm text-caution bg-caution/10 border border-caution/30 rounded-md px-3 py-2">
          {insufficientDataMsg}
        </p>
      )}

      <div className="bg-surface border border-border rounded-xl p-4">
        <div className="text-sm text-muted mb-3">Prediction report</div>
        {!report || report.length === 0 ? (
          <div className="h-40 flex items-center justify-center text-muted text-sm">
            No roads yet
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-muted border-b border-border">
                  <th className="pb-2 font-normal">Road</th>
                  <th className="pb-2 font-normal">Current</th>
                  <th className="pb-2 font-normal">Predicted</th>
                  <th className="pb-2 font-normal">Trend</th>
                  <th className="pb-2 font-normal"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {report.map((item) => {
                  const currentStyle = item.current_congestion_level ? LEVEL_STYLES[item.current_congestion_level] : null;
                  const predictedStyle = item.predicted_congestion_level ? LEVEL_STYLES[item.predicted_congestion_level] : null;
                  const TrendIcon = item.trend ? TREND_ICON[item.trend] : null;

                  return (
                    <tr key={item.road_id}>
                      <td className="py-2.5">
                        <div className="text-ink">{item.road_name}</div>
                        <div className="text-xs text-muted">{item.zone ?? "—"}</div>
                      </td>
                      <td className="py-2.5">
                        {currentStyle ? (
                          <div className="flex items-center gap-2">
                            <span className="text-ink font-mono text-xs">{item.current_vehicle_count}</span>
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${currentStyle.text} ${currentStyle.bg}`}>
                              {currentStyle.label}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-muted">No data</span>
                        )}
                      </td>
                      <td className="py-2.5">
                        {predictedStyle ? (
                          <div className="flex items-center gap-2">
                            <span className="text-ink font-mono text-xs">{item.predicted_vehicle_count}</span>
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${predictedStyle.text} ${predictedStyle.bg}`}>
                              {predictedStyle.label}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-muted">Not forecasted yet</span>
                        )}
                      </td>
                      <td className="py-2.5">
                        {TrendIcon ? (
                          <TrendIcon
                            className={`w-4 h-4 ${
                              item.trend === "increasing" ? "text-congest" : item.trend === "decreasing" ? "text-flow" : "text-muted"
                            }`}
                          />
                        ) : (
                          <span className="text-xs text-muted">—</span>
                        )}
                      </td>
                      <td className="py-2.5 text-right">
                        <button
                          onClick={() => handleForecast(item.road_id)}
                          disabled={forecastingRoadId === item.road_id}
                          className="inline-flex items-center gap-1.5 text-xs text-signal hover:underline disabled:opacity-60"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          {forecastingRoadId === item.road_id ? "Forecasting..." : "Forecast"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default function PredictionPage() {
  return (
    <DashboardShell>
      <PredictionContent />
    </DashboardShell>
  );
}