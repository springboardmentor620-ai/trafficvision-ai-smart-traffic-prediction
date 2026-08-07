import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Bell, Mail, MessageSquare, Siren } from "lucide-react";
import { PageHeader, SectionCard } from "@/components/tv/PageHeader";
import { StatCard } from "@/components/tv/StatCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { updateAlertStatus } from "@/lib/traffic.functions";
import { useTraffic } from "@/lib/use-traffic";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/dashboard/alerts")({
  component: Alerts,
});

const severityTone: Record<string, string> = {
  Critical: "bg-destructive text-destructive-foreground",
  High: "bg-destructive/10 text-destructive",
  Medium: "bg-warning/20 text-warning",
  Low: "bg-success/10 text-success",
};

const filters = ["All", "Active", "Acknowledged", "Resolved"] as const;

function Alerts() {
  const { alerts } = useTraffic();
  const [filter, setFilter] = useState<(typeof filters)[number]>("All");
  const queryClient = useQueryClient();
  const setStatus = useServerFn(updateAlertStatus);
  const mutate = useMutation({
    mutationFn: (vars: { id: string; status: "Acknowledged" | "Resolved" }) => setStatus({ data: vars }),
    onSuccess: (_d, vars) => {
      toast.success(`Alert ${vars.status.toLowerCase()}`);
      void queryClient.invalidateQueries({ queryKey: ["traffic-bundle"] });
    },
    onError: (e: Error) => toast.error("Could not update alert", { description: e.message }),
  });
  const list = alerts.filter((a) => filter === "All" || a.status === filter);

  return (
    <>
      <PageHeader
        title="Alert system"
        subtitle="Real-time congestion, accident, closure, weather and emergency notifications"
        actions={<Button className="bg-brand text-primary-foreground">Create alert rule</Button>}
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Active alerts" value={alerts.filter((a) => a.status === "Active").length} icon={Siren} tone="destructive" delta={9} />
        <StatCard label="Critical" value={alerts.filter((a) => a.severity === "Critical").length} icon={Bell} tone="warning" />
        <StatCard label="Resolved today" value={alerts.filter((a) => a.status === "Resolved").length} icon={Bell} tone="success" delta={22} />
        <StatCard label="Avg response" value={4.6} decimals={1} suffix=" min" icon={Bell} tone="cyan" delta={-12} />
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
        <SectionCard
          title="Alert history"
          description="Prioritised feed with acknowledgement workflow"
          actions={
            <div className="flex flex-wrap gap-1.5">
              {filters.map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={cn(
                    "rounded-full px-3 py-1 text-xs font-semibold transition-colors",
                    filter === f ? "bg-brand text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-accent",
                  )}
                >
                  {f}
                </button>
              ))}
            </div>
          }
        >
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Alert</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {list.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell className="max-w-xs">
                      <div className="font-semibold">{a.type}</div>
                      <div className="truncate text-xs text-muted-foreground">{a.message}</div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{a.road}<br />{a.area}</TableCell>
                    <TableCell><Badge className={severityTone[a.severity]}>{a.severity}</Badge></TableCell>
                    <TableCell className="tabular-nums text-sm">{a.time}</TableCell>
                    <TableCell><Badge variant="outline">{a.status}</Badge></TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        {a.status === "Active" && (
                          <Button
                            size="sm"
                            variant="ghost"
                            disabled={mutate.isPending}
                            onClick={() => mutate.mutate({ id: a.id, status: "Acknowledged" })}
                          >
                            Acknowledge
                          </Button>
                        )}
                        {a.status !== "Resolved" && (
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={mutate.isPending}
                            onClick={() => mutate.mutate({ id: a.id, status: "Resolved" })}
                          >
                            Resolve
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </SectionCard>

        <div className="space-y-4">
          <SectionCard title="Notification centre" description="Delivery channels for this workspace">
            <ul className="space-y-3">
              {[
                { icon: Mail, label: "Email alerts", on: true },
                { icon: MessageSquare, label: "SMS alerts", on: true },
                { icon: Bell, label: "Push notifications", on: false },
                { icon: Siren, label: "Emergency siren sync", on: true },
              ].map((c) => (
                <li key={c.label} className="flex items-center gap-3">
                  <c.icon className="h-4 w-4 shrink-0 text-primary" />
                  <span className="min-w-0 flex-1 truncate text-sm font-semibold">{c.label}</span>
                  <Switch defaultChecked={c.on} />
                </li>
              ))}
            </ul>
          </SectionCard>

          <SectionCard title="Priority levels" description="Escalation matrix">
            <ul className="space-y-2 text-sm">
              {[
                ["Critical", "Page on-call + SMS + siren", "bg-destructive"],
                ["High", "SMS + push within 1 min", "bg-destructive/60"],
                ["Medium", "Console + email digest", "bg-warning"],
                ["Low", "Console only", "bg-success"],
              ].map(([l, d, c]) => (
                <li key={l as string} className="flex items-start gap-2">
                  <span className={cn("mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full", c as string)} />
                  <span><b>{l as string}</b> — <span className="text-muted-foreground">{d as string}</span></span>
                </li>
              ))}
            </ul>
          </SectionCard>
        </div>
      </div>
    </>
  );
}
