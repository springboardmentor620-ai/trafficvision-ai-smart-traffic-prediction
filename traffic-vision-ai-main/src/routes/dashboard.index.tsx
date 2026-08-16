import { createFileRoute } from "@tanstack/react-router";
import {
  Activity, AlertTriangle, Brain, Camera, CarFront, CloudRain, Gauge, Route as RouteIcon,
  Siren, TrendingUp,
} from "lucide-react";
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart,
  PolarAngleAxis, RadialBar, RadialBarChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { PageHeader, SectionCard } from "@/components/tv/PageHeader";
import { StatCard } from "@/components/tv/StatCard";
import { CityMap } from "@/components/tv/CityMap";
import { HeatmapGrid, HeatLegend } from "@/components/tv/Heatmap";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useTraffic } from "@/lib/use-traffic";

export const Route = createFileRoute("/dashboard/")({
  component: DashboardHome,
});

const tooltipStyle = { borderRadius: 12, border: "1px solid var(--border)", background: "var(--card)" };

function DashboardHome() {
  const { heatCells, alerts, hourly, kpis, model, monthly, topCongested, vehicleMix, weekly } = useTraffic();
  return (
    <>
      <PageHeader
        title="Traffic control centre"
        subtitle="City-wide network status, AI forecasts and live incidents · updated 12 seconds ago"
        actions={
          <>
            <Button variant="outline">Export snapshot</Button>
            <Button className="bg-brand text-primary-foreground">Run prediction</Button>
          </>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard label="Total roads" value={kpis.totalRoads} icon={RouteIcon} delta={2.4} hint="monitored segments" />
        <StatCard label="Total cameras" value={kpis.totalCameras} icon={Camera} tone="violet" delta={1.1} hint={`${kpis.camerasOnline}% online`} />
        <StatCard label="Traffic density" value={kpis.trafficDensity} suffix="%" icon={CarFront} tone="cyan" delta={-3.6} hint="network occupancy" />
        <StatCard label="Congestion index" value={kpis.congestionIndex} decimals={1} suffix="/10" icon={Gauge} tone="warning" delta={-1.8} />
        <StatCard label="Average speed" value={kpis.avgSpeed} suffix=" km/h" icon={TrendingUp} tone="success" delta={4.2} />
        <StatCard label="Active alerts" value={kpis.activeAlerts} icon={AlertTriangle} tone="destructive" delta={12} hint="7 critical" />
        <StatCard label="Accidents today" value={kpis.accidentsToday} icon={Siren} tone="destructive" delta={-25} />
        <StatCard label="AI predictions" value={kpis.aiPredictions} icon={Brain} tone="violet" delta={8.9} hint="last 24 hours" />
        <StatCard label="Cameras online" value={kpis.camerasOnline} decimals={1} suffix="%" icon={Activity} tone="success" delta={0.6} />
        <StatCard label="Weather status" value={24} suffix="°C" icon={CloudRain} tone="cyan" hint="Light rain · visibility fair" />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.6fr_1fr]">
        <SectionCard
          title="Live network map"
          description="Traffic markers, congestion colouring and live vehicle density"
          actions={<Badge className="bg-success/10 text-success">Realtime</Badge>}
        >
          <CityMap className="h-[340px]" showRoute />
        </SectionCard>

        <SectionCard title="Vehicle distribution" description="Classification mix across all corridors">
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={vehicleMix} dataKey="value" nameKey="name" innerRadius={52} outerRadius={82} paddingAngle={3}>
                  {vehicleMix.map((v) => (
                    <Cell key={v.name} fill={v.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <ul className="mt-2 space-y-2">
            {vehicleMix.map((v) => (
              <li key={v.name} className="flex items-center gap-2 text-sm">
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: v.color }} />
                <span className="min-w-0 flex-1 truncate text-muted-foreground">{v.name}</span>
                <span className="font-semibold">{v.value}%</span>
              </li>
            ))}
          </ul>
        </SectionCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <SectionCard title="Daily traffic & peak hour analysis" description="Volume vs congestion across 24 hours">
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={hourly}>
                <defs>
                  <linearGradient id="vol" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.55} />
                    <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0.03} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="hour" tick={{ fontSize: 11 }} interval={3} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={tooltipStyle} />
                <Area type="monotone" dataKey="volume" stroke="var(--chart-1)" strokeWidth={2.5} fill="url(#vol)" />
                <Line type="monotone" dataKey="congestion" stroke="var(--chart-2)" strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard title="Weekly traffic & incidents" description="Volume, congestion and reported incidents">
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weekly}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="volume" name="Volume" fill="var(--chart-1)" radius={[6, 6, 0, 0]} />
                <Bar dataKey="congestion" name="Congestion %" fill="var(--chart-3)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard title="Monthly traffic growth" description="Volume trend and year-over-year growth">
          <div className="h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthly}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={tooltipStyle} />
                <Line type="monotone" dataKey="volume" stroke="var(--chart-2)" strokeWidth={2.5} dot={false} />
                <Line type="monotone" dataKey="congestion" stroke="var(--chart-4)" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard title="Prediction accuracy" description={`${model.name} · rolling 7 day accuracy`}>
          <div className="grid grid-cols-[160px_minmax(0,1fr)] items-center gap-4">
            <div className="h-[160px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart innerRadius="70%" outerRadius="100%" data={[{ name: "acc", value: model.accuracy }]} startAngle={90} endAngle={-270}>
                  <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
                  <RadialBar dataKey="value" cornerRadius={20} fill="var(--chart-1)" background />
                </RadialBarChart>
              </ResponsiveContainer>
            </div>
            <div>
              <p className="font-display text-3xl font-extrabold">{model.accuracy}%</p>
              <p className="text-sm text-muted-foreground">Congestion class accuracy</p>
              <div className="mt-4 space-y-3">
                {[["Precision", model.precision], ["Recall", model.recall], ["F1 score", model.f1]].map(([k, v]) => (
                  <div key={k as string}>
                    <div className="flex justify-between text-xs font-semibold">
                      <span>{k as string}</span>
                      <span>{v as number}%</span>
                    </div>
                    <Progress value={v as number} className="mt-1 h-2" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </SectionCard>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr_1fr]">
        <SectionCard title="Top congested roads" description="Ranked by current congestion index">
          <ul className="space-y-3">
            {topCongested.map((r) => (
              <li key={r.id} className="min-w-0">
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="truncate font-semibold">{r.name}</span>
                  <span className="shrink-0 text-muted-foreground">{r.congestion}% · {r.avgSpeed} km/h</span>
                </div>
                <Progress value={r.congestion} className="mt-1.5 h-2" />
              </li>
            ))}
          </ul>
        </SectionCard>

        <SectionCard title="Recent alerts" description="Latest incidents raised by the alert engine">
          <ul className="space-y-2">
            {alerts.slice(0, 6).map((a) => (
              <li key={a.id} className="glass-soft flex items-start gap-3 rounded-xl p-3">
                <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-destructive/10 text-destructive">
                  <AlertTriangle className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{a.type} · {a.road}</p>
                  <p className="truncate text-xs text-muted-foreground">{a.message}</p>
                </div>
                <Badge variant="outline" className="ml-auto shrink-0">{a.severity}</Badge>
              </li>
            ))}
          </ul>
        </SectionCard>
      </div>

      <SectionCard title="Peak hour congestion heatmap" description="Grid cells represent 1km² zones across the monitored area" actions={<HeatLegend />}>
        <HeatmapGrid cells={heatCells} />
      </SectionCard>
    </>
  );
}
