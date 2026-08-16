import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { PageHeader, SectionCard } from "@/components/tv/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { saveSettings } from "@/lib/traffic.functions";
import { useAccount } from "@/lib/use-account";

export const Route = createFileRoute("/dashboard/settings")({ component: Settings });

type Prefs = {
  organisation: string;
  language: string;
  timezone: string;
  notifications: Record<string, boolean>;
  predictionFrequency: string;
  congestionThreshold: number;
  autoRetrain: boolean;
  mapProvider: string;
  mapLayers: Record<string, boolean>;
  sessionTimeout: number;
  requireMfa: boolean;
  ipAllowlist: boolean;
};

const NOTIFICATIONS = ["Email alerts", "SMS alerts", "Push notifications", "Daily digest", "Weekly report"];
const MAP_LAYERS = ["Traffic overlay", "Incident markers", "Heatmap layer", "Camera positions"];

const defaults: Prefs = {
  organisation: "City Traffic Authority",
  language: "English",
  timezone: "Asia/Kolkata",
  notifications: Object.fromEntries(NOTIFICATIONS.map((n, i) => [n, i < 3])),
  predictionFrequency: "Every 15 minutes",
  congestionThreshold: 75,
  autoRetrain: true,
  mapProvider: "OpenStreetMap",
  mapLayers: Object.fromEntries(MAP_LAYERS.map((n, i) => [n, i !== 3])),
  sessionTimeout: 45,
  requireMfa: true,
  ipAllowlist: false,
};

function Settings() {
  const account = useAccount();
  const queryClient = useQueryClient();
  const stored = (account.settings?.preferences ?? {}) as Partial<Prefs>;
  const [prefs, setPrefs] = useState<Prefs>({
    ...defaults,
    ...stored,
    notifications: { ...defaults.notifications, ...(stored.notifications ?? {}) },
    mapLayers: { ...defaults.mapLayers, ...(stored.mapLayers ?? {}) },
  });

  const set = <K extends keyof Prefs>(key: K, value: Prefs[K]) => setPrefs((p) => ({ ...p, [key]: value }));

  const save = useServerFn(saveSettings);
  const mutation = useMutation({
    mutationFn: () => save({ data: { preferences: prefs } }),
    onSuccess: () => {
      toast.success("Settings saved");
      void queryClient.invalidateQueries({ queryKey: ["account"] });
    },
    onError: (e: Error) => toast.error("Could not save settings", { description: e.message }),
  });

  return (
    <>
      <PageHeader
        title="Settings"
        subtitle="General, notifications, security, AI and map preferences"
        actions={
          <Button
            className="bg-brand text-primary-foreground"
            disabled={mutation.isPending}
            onClick={() => mutation.mutate()}
          >
            {mutation.isPending ? "Saving…" : "Save changes"}
          </Button>
        }
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <SectionCard title="General" description="Workspace preferences">
          <div className="space-y-3">
            <Field label="Organisation">
              <Input value={prefs.organisation} onChange={(e) => set("organisation", e.target.value)} />
            </Field>
            <Field label="Language">
              <select
                className="h-10 w-full rounded-xl border bg-card px-3 text-sm"
                value={prefs.language}
                onChange={(e) => set("language", e.target.value)}
              >
                {["English", "हिन्दी", "Español", "Français", "Deutsch"].map((l) => <option key={l}>{l}</option>)}
              </select>
            </Field>
            <Field label="Timezone">
              <select
                className="h-10 w-full rounded-xl border bg-card px-3 text-sm"
                value={prefs.timezone}
                onChange={(e) => set("timezone", e.target.value)}
              >
                {["Asia/Kolkata", "UTC", "Europe/London", "America/New_York"].map((l) => <option key={l}>{l}</option>)}
              </select>
            </Field>
          </div>
        </SectionCard>

        <SectionCard title="Notifications" description="Choose how operators are alerted">
          <div className="space-y-3">
            {NOTIFICATIONS.map((n) => (
              <div key={n} className="flex items-center justify-between">
                <span className="text-sm font-semibold">{n}</span>
                <Switch
                  checked={prefs.notifications[n] ?? false}
                  onCheckedChange={(v) => set("notifications", { ...prefs.notifications, [n]: v })}
                />
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="AI settings" description="Prediction cadence and thresholds">
          <div className="space-y-3">
            <Field label="Prediction frequency">
              <select
                className="h-10 w-full rounded-xl border bg-card px-3 text-sm"
                value={prefs.predictionFrequency}
                onChange={(e) => set("predictionFrequency", e.target.value)}
              >
                {["Every 5 minutes", "Every 15 minutes", "Every 30 minutes", "Hourly"].map((l) => <option key={l}>{l}</option>)}
              </select>
            </Field>
            <Field label="Congestion alert threshold (%)">
              <Input
                type="number"
                value={prefs.congestionThreshold}
                onChange={(e) => set("congestionThreshold", Number(e.target.value))}
              />
            </Field>
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold">Auto retrain weekly</span>
              <Switch checked={prefs.autoRetrain} onCheckedChange={(v) => set("autoRetrain", v)} />
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Map settings" description="Base layer and overlays">
          <div className="space-y-3">
            <Field label="Map provider">
              <select
                className="h-10 w-full rounded-xl border bg-card px-3 text-sm"
                value={prefs.mapProvider}
                onChange={(e) => set("mapProvider", e.target.value)}
              >
                {["OpenStreetMap", "CARTO Light", "Stamen Terrain"].map((l) => <option key={l}>{l}</option>)}
              </select>
            </Field>
            {MAP_LAYERS.map((n) => (
              <div key={n} className="flex items-center justify-between">
                <span className="text-sm font-semibold">{n}</span>
                <Switch
                  checked={prefs.mapLayers[n] ?? false}
                  onCheckedChange={(v) => set("mapLayers", { ...prefs.mapLayers, [n]: v })}
                />
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Security" description="Session and access controls">
          <div className="space-y-3">
            <Field label="Session timeout (minutes)">
              <Input
                type="number"
                value={prefs.sessionTimeout}
                onChange={(e) => set("sessionTimeout", Number(e.target.value))}
              />
            </Field>
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold">Require MFA for admins</span>
              <Switch checked={prefs.requireMfa} onCheckedChange={(v) => set("requireMfa", v)} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold">IP allowlist</span>
              <Switch checked={prefs.ipAllowlist} onCheckedChange={(v) => set("ipAllowlist", v)} />
            </div>
          </div>
        </SectionCard>
      </div>
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}
