import { createFileRoute } from "@tanstack/react-router";
import { BarChart3, Clock, Gauge, TrendingUp } from "lucide-react";
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart,
  Radar, RadarChart, PolarAngleAxis, PolarGrid, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { PageHeader, SectionCard } from "@/components/tv/PageHeader";
import { StatCard } from "@/components/tv/StatCard";
import { HeatmapGrid, HeatLegend } from "@/components/tv/Heatmap";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useTraffic } from "@/lib/use-traffic";

export const Route = createFileRoute("/dashboard/analytics")({
  component: Analytics,
});

const tooltipStyle = { borderRadius: 12, border: "1px solid var(--border)" };

function Analytics() {
  const { heatCells, areas, hourly, insights, monthly, roads, topCongested, vehicleMix, weekly } = useTraffic();
  const areaPerformance = areas.map((area) => {
    const rs = roads.filter((r) => r.area === area);
    const avg = rs.length ? Math.round(rs.reduce((s, r) => s + r.congestion, 0) / rs.length) : 40;
    return { area, congestion: avg, utilisation: Math.min(100, avg + 8), speed: Math.max(10, 70 - avg / 2) };
  });

  return (
    <>
      <PageHeader
        title="Analytics"
        subtitle="Traffic, congestion, road performance and vehicle analytics across every time horizon"
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total trips analysed" value={14_820_400} icon={BarChart3} delta={6.4} />
        <StatCard label="Avg congestion" value={57} suffix="%" icon={Gauge} tone="warning" delta={-2.9} />
        <StatCard label="Avg travel time" value={27} suffix=" min" icon={Clock} tone="violet" delta={-4.1} />
        <StatCard label="Network throughput" value={92} suffix="%" icon={TrendingUp} tone="success" delta={3.3} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <SectionCard title="Hourly analysis" description="Volume, congestion and travel time by hour">
          <div className="h-[270px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={hourly}>
                <defs>
                  <linearGradient id="a1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--chart-2)" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="var(--chart-2)" stopOpacity={0.03} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="hour" tick={{ fontSize: 11 }} interval={3} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={tooltipStyle} />
                <Area type="monotone" dataKey="travelTime" name="Travel time" stroke="var(--chart-2)" fill="url(#a1)" strokeWidth={2.5} />
                <Line type="monotone" dataKey="congestion" name="Congestion" stroke="var(--chart-4)" strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard title="Daily analysis" description="Volume and incident correlation">
          <div className="h-[270px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weekly}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="volume" name="Volume" fill="var(--chart-1)" radius={[6, 6, 0, 0]} />
                <Bar dataKey="incidents" name="Incidents" fill="var(--chart-4)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard title="Monthly & yearly trend" description="Volume growth and emissions estimate">
          <div className="h-[270px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthly}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line type="monotone" dataKey="volume" name="Volume" stroke="var(--chart-1)" strokeWidth={2.5} dot={false} />
                <Line type="monotone" dataKey="co2" name="CO₂ (t)" stroke="var(--chart-5)" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard title="Area wise performance" description="Congestion, utilisation and speed by zone">
          <div className="h-[270px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={areaPerformance} outerRadius="75%">
                <PolarGrid stroke="var(--border)" />
                <PolarAngleAxis dataKey="area" tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={tooltipStyle} />
                <Radar name="Congestion" dataKey="congestion" stroke="var(--chart-1)" fill="var(--chart-1)" fillOpacity={0.35} />
                <Radar name="Utilisation" dataKey="utilisation" stroke="var(--chart-3)" fill="var(--chart-3)" fillOpacity={0.25} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.4fr_1fr]">
        <SectionCard title="Road ranking" description="Top congested roads with utilisation and speed">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>#</TableHead>
                  <TableHead>Road</TableHead>
                  <TableHead>Area</TableHead>
                  <TableHead className="w-40">Congestion</TableHead>
                  <TableHead className="text-right">Speed</TableHead>
                  <TableHead className="text-right">Vehicles</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topCongested.map((r, i) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-bold text-muted-foreground">{i + 1}</TableCell>
                    <TableCell className="font-semibold">{r.name}</TableCell>
                    <TableCell className="text-muted-foreground">{r.area}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress value={r.congestion} className="h-2" />
                        <span className="w-9 text-xs font-semibold">{r.congestion}%</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right tabular-nums">{r.avgSpeed} km/h</TableCell>
                    <TableCell className="text-right tabular-nums">{r.vehicleCount.toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </SectionCard>

        <SectionCard title="Vehicle flow analysis" description="Share of network by vehicle class">
          <div className="h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={vehicleMix} dataKey="value" nameKey="name" outerRadius={90} label={{ fontSize: 11 }}>
                  {vehicleMix.map((v) => <Cell key={v.name} fill={v.color} />)}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>
      </div>

      <SectionCard title="Peak hour heatmap" description="Density across monitored zones" actions={<HeatLegend />}>
        <HeatmapGrid cells={heatCells} />
      </SectionCard>

      <SectionCard title="AI insights" description="Generated from the latest analytics run">
        <div className="grid gap-3 md:grid-cols-3">
          {insights.slice(0, 3).map((i) => (
            <article key={i.title} className="glass-soft card-hover rounded-2xl p-4">
              <Badge variant="outline">{i.impact} impact</Badge>
              <h3 className="mt-2 font-display text-sm font-bold">{i.title}</h3>
              <p className="mt-1 text-xs text-muted-foreground">{i.detail}</p>
              <p className="mt-3 font-display text-lg font-extrabold text-gradient">{i.metric}</p>
            </article>
          ))}
        </div>
      </SectionCard>
    </>
  );
}
