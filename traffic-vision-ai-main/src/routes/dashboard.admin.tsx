import { createFileRoute } from "@tanstack/react-router";
import { Activity, Camera, Cpu, Database, Server, TrafficCone } from "lucide-react";
import { PageHeader, SectionCard } from "@/components/tv/PageHeader";
import { StatCard } from "@/components/tv/StatCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useDirectory } from "@/lib/use-account";
import { useTraffic } from "@/lib/use-traffic";

export const Route = createFileRoute("/dashboard/admin")({ component: AdminPanel });

const manage = [
  "Manage users", "Manage roads", "Manage cameras", "Manage traffic signals", "Manage alerts",
  "Manage AI models", "Manage APIs", "Manage reports", "Manage roles", "Manage permissions",
];

function AdminPanel() {
  const { roads } = useTraffic();
  const { activityLogs } = useDirectory();
  return (
    <>
      <PageHeader title="Admin panel" subtitle="System configuration, infrastructure health and audit logs" />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="API uptime" value={99.98} decimals={2} suffix="%" icon={Server} tone="success" />
        <StatCard label="DB latency" value={38} suffix=" ms" icon={Database} tone="cyan" delta={-6} />
        <StatCard label="Inference load" value={62} suffix="%" icon={Cpu} tone="violet" delta={4} />
        <StatCard label="Devices registered" value={roads.length * 8} icon={Camera} delta={1.8} />
      </div>

      <SectionCard title="Management" description="Administrative modules">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {manage.map((m) => (
            <button key={m} className="glass card-hover rounded-2xl p-4 text-left">
              <TrafficCone className="h-5 w-5 text-primary" />
              <p className="mt-3 text-sm font-semibold">{m}</p>
            </button>
          ))}
        </div>
      </SectionCard>

      <div className="grid gap-4 lg:grid-cols-2">
        <SectionCard title="System health" description="Live service status" actions={<Badge className="bg-success/10 text-success">All systems operational</Badge>}>
          <ul className="space-y-3">
            {[
              ["FastAPI gateway", 99], ["Prediction workers", 94], ["PostgreSQL cluster", 97],
              ["MongoDB telemetry", 91], ["Redis stream", 88], ["Camera ingest", 96],
            ].map(([n, v]) => (
              <li key={n as string}>
                <div className="flex justify-between text-xs font-semibold">
                  <span>{n as string}</span><span>{v as number}%</span>
                </div>
                <Progress value={v as number} className="mt-1 h-2" />
              </li>
            ))}
          </ul>
        </SectionCard>

        <SectionCard title="Audit logs" description="Administrative actions" actions={<Button size="sm" variant="outline">Export</Button>}>
          <ul className="space-y-2 text-sm">
            {activityLogs.map((l) => (
              <li key={l.id} className="glass-soft flex items-center justify-between gap-3 rounded-xl p-3">
                <span className="min-w-0 truncate"><Activity className="mr-2 inline h-3.5 w-3.5 text-primary" /><b>{l.actor}</b> <span className="text-muted-foreground">{l.action}</span></span>
                <span className="shrink-0 text-xs text-muted-foreground">{l.at}</span>
              </li>
            ))}
          </ul>
        </SectionCard>
      </div>
    </>
  );
}
