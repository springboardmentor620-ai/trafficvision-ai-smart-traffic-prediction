import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Camera, CircleDot, Gauge, TrafficCone, Video } from "lucide-react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { PageHeader, SectionCard } from "@/components/tv/PageHeader";
import { StatCard } from "@/components/tv/StatCard";
import { CityMap } from "@/components/tv/CityMap";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { useTraffic } from "@/lib/use-traffic";

export const Route = createFileRoute("/dashboard/monitoring")({
  component: Monitoring,
});

const statusTone: Record<string, string> = {
  "Free flow": "bg-success/10 text-success",
  Moderate: "bg-warning/20 text-warning",
  Heavy: "bg-destructive/10 text-destructive",
  Gridlock: "bg-destructive text-destructive-foreground",
};

function Monitoring() {
  const { areas, cameras, cities, hourly, roads } = useTraffic();
  const [city, setCity] = useState("All");
  const [area, setArea] = useState("All");
  const [q, setQ] = useState("");

  const filtered = roads.filter(
    (r) =>
      (city === "All" || r.city === city) &&
      (area === "All" || r.area === area) &&
      r.name.toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <>
      <PageHeader
        title="Traffic monitoring"
        subtitle="Live vehicle counts, occupancy, speed and signal state across the network"
        actions={<Button className="bg-brand text-primary-foreground">Add camera</Button>}
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Vehicles detected" value={48213} icon={CircleDot} delta={5.2} hint="last hour" />
        <StatCard label="Avg road occupancy" value={64} suffix="%" icon={Gauge} tone="warning" delta={-2.1} />
        <StatCard label="Signals online" value={412} icon={TrafficCone} tone="violet" delta={0.4} />
        <StatCard label="Cameras streaming" value={11} suffix="/12" icon={Video} tone="cyan" />
      </div>

      <SectionCard title="Filters" description="Narrow the live feed by city, area, road, date and time">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <select className="h-10 rounded-xl border bg-card px-3 text-sm" value={city} onChange={(e) => setCity(e.target.value)}>
            {["All", ...cities].map((c) => <option key={c}>{c}</option>)}
          </select>
          <select className="h-10 rounded-xl border bg-card px-3 text-sm" value={area} onChange={(e) => setArea(e.target.value)}>
            {["All", ...areas].map((c) => <option key={c}>{c}</option>)}
          </select>
          <Input placeholder="Search road" value={q} onChange={(e) => setQ(e.target.value)} />
          <Input type="date" defaultValue="2026-08-02" />
          <Input type="time" defaultValue="09:30" />
        </div>
      </SectionCard>

      <div className="grid gap-4 xl:grid-cols-[1.4fr_1fr]">
        <SectionCard title="Live map" description="Congestion colouring with incident markers">
          <CityMap className="h-[320px]" />
        </SectionCard>
        <SectionCard title="Traffic flow timeline" description="Rolling 24h flow and speed">
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={hourly}>
                <defs>
                  <linearGradient id="flow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--chart-3)" stopOpacity={0.6} />
                    <stop offset="100%" stopColor="var(--chart-3)" stopOpacity={0.04} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="hour" tick={{ fontSize: 11 }} interval={4} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--border)" }} />
                <Area type="monotone" dataKey="volume" stroke="var(--chart-3)" fill="url(#flow)" strokeWidth={2.5} />
                <Area type="monotone" dataKey="speed" stroke="var(--chart-5)" fill="transparent" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>
      </div>

      <SectionCard title="Live camera feeds" description="Edge inference running on each stream">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {cameras.map((c) => (
            <article key={c.id} className="glass card-hover overflow-hidden rounded-2xl">
              <div className="relative grid h-28 place-items-center bg-[var(--gradient-soft)]">
                <Camera className="h-8 w-8 text-primary/60" />
                <span className="absolute left-2 top-2 rounded-md bg-card/80 px-2 py-0.5 text-[10px] font-bold">{c.id}</span>
                <span className={`absolute right-2 top-2 rounded-md px-2 py-0.5 text-[10px] font-bold ${c.online ? "bg-success text-success-foreground" : "bg-destructive text-destructive-foreground"}`}>
                  {c.online ? "LIVE" : "OFFLINE"}
                </span>
              </div>
              <div className="p-3">
                <p className="truncate text-sm font-semibold">{c.road}</p>
                <p className="truncate text-xs text-muted-foreground">{c.area} · {c.fps} fps</p>
                <div className="mt-2 flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">{c.vehicles} vehicles</span>
                  <span className="font-semibold">{c.density}% density</span>
                </div>
                <Progress value={c.density} className="mt-1.5 h-1.5" />
              </div>
            </article>
          ))}
        </div>
      </SectionCard>

      <SectionCard title={`Road utilisation (${filtered.length})`} description="Per-segment occupancy, speed and congestion level">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Road</TableHead>
                <TableHead>City</TableHead>
                <TableHead>Area</TableHead>
                <TableHead className="text-right">Vehicles</TableHead>
                <TableHead className="text-right">Speed</TableHead>
                <TableHead className="text-right">Occupancy</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-semibold">{r.name}</TableCell>
                  <TableCell className="text-muted-foreground">{r.city}</TableCell>
                  <TableCell className="text-muted-foreground">{r.area}</TableCell>
                  <TableCell className="text-right tabular-nums">{r.vehicleCount.toLocaleString()}</TableCell>
                  <TableCell className="text-right tabular-nums">{r.avgSpeed} km/h</TableCell>
                  <TableCell className="text-right tabular-nums">{r.occupancy}%</TableCell>
                  <TableCell>
                    <Badge className={statusTone[r.status]}>{r.status}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </SectionCard>
    </>
  );
}
