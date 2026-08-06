"use client";

import { useEffect, useState, useCallback, FormEvent } from "react";
import { DashboardShell } from "@/components/DashboardShell";
import { useAuth } from "@/lib/auth-context";
import * as api from "@/lib/api";
import { ApiError } from "@/lib/api";
import {
  AlertTriangle,
  Car,
  Construction,
  Siren,
  CheckCircle2,
  Plus,
  Trash2,
} from "lucide-react";

const TYPE_META: Record<api.AlertType, { icon: typeof AlertTriangle; label: string }> = {
  congestion: { icon: Car, label: "Congestion" },
  accident: { icon: AlertTriangle, label: "Accident" },
  road_closure: { icon: Construction, label: "Road closure" },
  emergency: { icon: Siren, label: "Emergency" },
};

const SEVERITY_STYLES: Record<api.AlertSeverity, { text: string; bg: string; border: string }> = {
  info: { text: "text-signal", bg: "bg-signal/10", border: "border-signal/30" },
  warning: { text: "text-caution", bg: "bg-caution/10", border: "border-caution/30" },
  critical: { text: "text-congest", bg: "bg-congest/10", border: "border-congest/30" },
};

function timeAgo(iso: string): string {
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

function AlertsContent() {
  const { token, user } = useAuth();
  const [alerts, setAlerts] = useState<api.Alert[]>([]);
  const [filter, setFilter] = useState<"all" | "unresolved" | "resolved">("unresolved");
  const [error, setError] = useState<string | null>(null);
  const [resolvingId, setResolvingId] = useState<number | null>(null);

  const [roads, setRoads] = useState<api.Road[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formRoadId, setFormRoadId] = useState("");
  const [formType, setFormType] = useState<api.AlertType>("accident");
  const [formSeverity, setFormSeverity] = useState<api.AlertSeverity>("warning");
  const [formMessage, setFormMessage] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canManage = user?.role === "admin" || user?.role === "traffic_operator";

  const fetchAlerts = useCallback(async () => {
    if (!token) return;
    try {
      const resolvedFilter = filter === "all" ? undefined : filter === "resolved";
      const data = await api.getAlerts(token, resolvedFilter);
      setAlerts(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load alerts");
    }
  }, [token, filter]);

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 10000);
    return () => clearInterval(interval);
  }, [fetchAlerts]);

  useEffect(() => {
    if (!token || !canManage) return;
    api.listRoads(token).then(setRoads).catch(() => {});
  }, [token, canManage]);

  async function handleResolve(alertId: number) {
    if (!token) return;
    setResolvingId(alertId);
    try {
      await api.resolveAlert(token, alertId);
      await fetchAlerts();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not resolve alert");
    } finally {
      setResolvingId(null);
    }
  }

  async function handleDelete(alertId: number) {
    if (!token) return;
    try {
      await api.deleteAlert(token, alertId);
      await fetchAlerts();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete alert");
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!token) return;
    setFormError(null);
    setIsSubmitting(true);
    try {
      await api.createAlert(token, {
        road_id: formRoadId ? Number(formRoadId) : undefined,
        type: formType,
        severity: formSeverity,
        message: formMessage,
      });
      setFormMessage("");
      setFormRoadId("");
      setShowForm(false);
      await fetchAlerts();
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "Could not create alert");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-lg font-medium text-ink">Alerts</h1>
          <p className="text-sm text-muted">Congestion, accidents, closures, and emergencies</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-surface2 rounded-md p-0.5 text-xs">
            {(["unresolved", "all", "resolved"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-md capitalize transition-colors ${
                  filter === f ? "bg-signal text-white" : "text-muted hover:text-ink"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
          {canManage && (
            <button
              onClick={() => setShowForm((v) => !v)}
              className="flex items-center gap-1.5 bg-signal hover:bg-signal/90 text-white text-xs font-medium rounded-md px-3 py-2"
            >
              <Plus className="w-3.5 h-3.5" /> Report incident
            </button>
          )}
        </div>
      </div>

      {error && (
        <p className="text-sm text-congest bg-congest/10 border border-congest/30 rounded-md px-3 py-2">
          {error}
        </p>
      )}

      {showForm && canManage && (
        <form
          onSubmit={handleSubmit}
          className="bg-surface border border-border rounded-xl p-4 flex flex-col gap-3"
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs text-muted mb-1">Type</label>
              <select
                value={formType}
                onChange={(e) => setFormType(e.target.value as api.AlertType)}
                className="w-full bg-surface2 border border-border rounded-md px-3 py-2 text-sm text-ink outline-none focus:border-signal"
              >
                <option value="accident">Accident</option>
                <option value="road_closure">Road closure</option>
                <option value="emergency">Emergency</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-muted mb-1">Severity</label>
              <select
                value={formSeverity}
                onChange={(e) => setFormSeverity(e.target.value as api.AlertSeverity)}
                className="w-full bg-surface2 border border-border rounded-md px-3 py-2 text-sm text-ink outline-none focus:border-signal"
              >
                <option value="info">Info</option>
                <option value="warning">Warning</option>
                <option value="critical">Critical</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-muted mb-1">Road (optional)</label>
              <select
                value={formRoadId}
                onChange={(e) => setFormRoadId(e.target.value)}
                className="w-full bg-surface2 border border-border rounded-md px-3 py-2 text-sm text-ink outline-none focus:border-signal"
              >
                <option value="">General / unspecified</option>
                {roads.map((r) => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs text-muted mb-1">Message</label>
            <input
              required
              minLength={3}
              value={formMessage}
              onChange={(e) => setFormMessage(e.target.value)}
              placeholder="e.g. Multi-vehicle collision near the flyover, one lane blocked"
              className="w-full bg-surface2 border border-border rounded-md px-3 py-2 text-sm text-ink placeholder:text-muted outline-none focus:border-signal"
            />
          </div>
          {formError && <p className="text-xs text-congest">{formError}</p>}
          <button
            type="submit"
            disabled={isSubmitting}
            className="self-start bg-signal hover:bg-signal/90 disabled:opacity-60 text-white text-sm font-medium rounded-md px-4 py-2"
          >
            {isSubmitting ? "Reporting..." : "Report incident"}
          </button>
        </form>
      )}

      <div className="flex flex-col gap-2">
        {alerts.length === 0 ? (
          <div className="bg-surface border border-border rounded-xl h-32 flex items-center justify-center text-muted text-sm">
            No {filter !== "all" ? filter : ""} alerts
          </div>
        ) : (
          alerts.map((alert) => {
            const meta = TYPE_META[alert.type];
            const style = SEVERITY_STYLES[alert.severity];
            const Icon = meta.icon;
            return (
              <div
                key={alert.id}
                className={`flex items-start gap-3 rounded-xl border p-4 ${style.border} ${
                  alert.is_resolved ? "bg-surface opacity-60" : style.bg
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${style.bg} ${style.text}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-xs font-medium ${style.text}`}>{meta.label}</span>
                    {alert.road_name && <span className="text-xs text-muted">· {alert.road_name}</span>}
                    <span className="text-xs text-muted">· {timeAgo(alert.created_at)}</span>
                    {alert.is_resolved && (
                      <span className="flex items-center gap-1 text-xs text-flow">
                        <CheckCircle2 className="w-3 h-3" /> Resolved
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-ink mt-1">{alert.message}</p>
                </div>
                {canManage && !alert.is_resolved && (
                  <button
                    onClick={() => handleResolve(alert.id)}
                    disabled={resolvingId === alert.id}
                    className="text-xs text-signal hover:underline disabled:opacity-60 shrink-0"
                  >
                    {resolvingId === alert.id ? "Resolving..." : "Resolve"}
                  </button>
                )}
                {user?.role === "admin" && (
                  <button
                    onClick={() => handleDelete(alert.id)}
                    aria-label="Delete alert"
                    className="text-muted hover:text-congest shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default function AlertsPage() {
  return (
    <DashboardShell>
      <AlertsContent />
    </DashboardShell>
  );
}