import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Brain, Clock, Target, TriangleAlert } from "lucide-react";
import {
  Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { PageHeader, SectionCard } from "@/components/tv/PageHeader";
import { StatCard } from "@/components/tv/StatCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { predictTraffic } from "@/lib/traffic.functions";
import { useTraffic } from "@/lib/use-traffic";

export const Route = createFileRoute("/dashboard/prediction")({
  component: Prediction,
});

const tooltipStyle = { borderRadius: 12, border: "1px solid var(--border)" };

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function Prediction() {
  const { hourly, model, predictions, weekly, roads, areas } = useTraffic();
  const now = new Date();
  const [form, setForm] = useState({
    roadCode: roads[0]?.code ?? "",
    sourceArea: areas[0] ?? "",
    destinationArea: areas[1] ?? areas[0] ?? "",
    hour: now.getHours(),
    dayOfWeek: now.getDay(),
    isHoliday: false,
    weather: "Clear",
    rain: 0,
    temp: 27,
    vehicleType: "Car",
  });

  const predict = useServerFn(predictTraffic);
  const run = useMutation({
    mutationFn: () => predict({ data: form }),
    onSuccess: () => toast.success("Random Forest forecast generated"),
    onError: (e: Error) => toast.error("Prediction failed", { description: e.message }),
  });
  const result = run.data;

  return (
    <>
      <PageHeader
        title="Traffic prediction"
        subtitle="AI congestion forecasting, peak-hour windows and delay estimation"
        actions={
          <>
            <Button
              className="bg-brand text-primary-foreground"
              disabled={run.isPending}
              onClick={() => run.mutate()}
            >
              {run.isPending ? "Running…" : "Run forecast"}
            </Button>
          </>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Model accuracy" value={model.accuracy} decimals={1} suffix="%" icon={Target} tone="success" delta={1.2} />
        <StatCard label="Avg confidence" value={91} suffix="%" icon={Brain} tone="violet" delta={0.8} />
        <StatCard label="Predicted peak" value={18.5} decimals={1} suffix=":00" icon={Clock} tone="warning" hint="evening peak window" />
        <StatCard label="High risk corridors" value={5} icon={TriangleAlert} tone="destructive" delta={-14} />
      </div>

      <SectionCard
        title="Run a prediction"
        description="Score a corridor with the trained Random Forest using live conditions"
        actions={
          <Button className="bg-brand text-primary-foreground" disabled={run.isPending} onClick={() => run.mutate()}>
            {run.isPending ? "Predicting…" : "Predict congestion"}
          </Button>
        }
      >
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <PField label="Corridor">
            <select
              className="h-10 w-full rounded-xl border bg-card px-3 text-sm"
              value={form.roadCode}
              onChange={(e) => setForm((f) => ({ ...f, roadCode: e.target.value }))}
            >
              {roads.map((r) => (
                <option key={r.code} value={r.code}>{r.name}</option>
              ))}
            </select>
          </PField>
          <PField label="Source area">
            <select
              className="h-10 w-full rounded-xl border bg-card px-3 text-sm"
              value={form.sourceArea}
              onChange={(e) => setForm((f) => ({ ...f, sourceArea: e.target.value }))}
            >
              {areas.map((a) => <option key={a}>{a}</option>)}
            </select>
          </PField>
          <PField label="Destination area">
            <select
              className="h-10 w-full rounded-xl border bg-card px-3 text-sm"
              value={form.destinationArea}
              onChange={(e) => setForm((f) => ({ ...f, destinationArea: e.target.value }))}
            >
              {areas.map((a) => <option key={a}>{a}</option>)}
            </select>
          </PField>
          <PField label="Day">
            <select
              className="h-10 w-full rounded-xl border bg-card px-3 text-sm"
              value={form.dayOfWeek}
              onChange={(e) => setForm((f) => ({ ...f, dayOfWeek: Number(e.target.value) }))}
            >
              {DAYS.map((d, i) => <option key={d} value={i}>{d}</option>)}
            </select>
          </PField>
          <PField label="Hour of day">
            <Input
              type="number"
              min={0}
              max={23}
              value={form.hour}
              onChange={(e) => setForm((f) => ({ ...f, hour: Number(e.target.value) }))}
            />
          </PField>
          <PField label="Weather">
            <select
              className="h-10 w-full rounded-xl border bg-card px-3 text-sm"
              value={form.weather}
              onChange={(e) => setForm((f) => ({ ...f, weather: e.target.value }))}
            >
              {["Clear", "Cloudy", "Rain", "Heavy rain", "Fog"].map((w) => <option key={w}>{w}</option>)}
            </select>
          </PField>
          <PField label="Rainfall (mm)">
            <Input
              type="number"
              min={0}
              value={form.rain}
              onChange={(e) => setForm((f) => ({ ...f, rain: Number(e.target.value) }))}
            />
          </PField>
          <PField label="Vehicle type">
            <select
              className="h-10 w-full rounded-xl border bg-card px-3 text-sm"
              value={form.vehicleType}
              onChange={(e) => setForm((f) => ({ ...f, vehicleType: e.target.value }))}
            >
              {["Car", "Two-wheeler", "Bus", "Truck", "Emergency"].map((v) => <option key={v}>{v}</option>)}
            </select>
          </PField>
        </div>

        {result && (
          <div className="mt-5 space-y-4">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[
                ["Congestion", `${result.congestionPct}%`],
                ["Category", result.category],
                ["Travel time", `${result.travelTimeMin} min`],
                ["Expected delay", `+${result.expectedDelayMin} min`],
                ["Vehicle flow", `${result.vehicleFlow.toLocaleString()} veh/h`],
                ["Density", `${result.trafficDensity}`],
                ["Confidence", `${result.confidence}%`],
                ["Avg speed", `${result.avgSpeed} km/h`],
              ].map(([k, v]) => (
                <div key={k} className="glass-soft rounded-2xl p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{k}</p>
                  <p className="mt-1 font-display text-xl font-extrabold">{v}</p>
                </div>
              ))}
            </div>
            <p className="text-sm text-muted-foreground">{result.explanation}</p>
          </div>
        )}
      </SectionCard>

      <div className="grid gap-4 lg:grid-cols-2">
        <SectionCard title="Forecast graph" description="Actual vs predicted congestion for the next 24 hours">
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={hourly}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="hour" tick={{ fontSize: 11 }} interval={3} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line type="monotone" dataKey="congestion" name="Actual" stroke="var(--chart-1)" strokeWidth={2.5} dot={false} />
                <Line type="monotone" dataKey="predicted" name="Predicted" stroke="var(--chart-2)" strokeWidth={2.5} strokeDasharray="6 5" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard title="Historical comparison" description="This week vs model accuracy per day">
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weekly}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="congestion" name="Congestion %" fill="var(--chart-1)" radius={[6, 6, 0, 0]} />
                <Bar dataKey="accuracy" name="Accuracy %" fill="var(--chart-5)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>
      </div>

      <SectionCard
        title="AI prediction panel"
        description="Per-corridor congestion forecast with confidence and risk scoring"
        actions={<Badge className="bg-violet/10 text-violet">{model.name}</Badge>}
      >
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Road</TableHead>
                <TableHead className="text-right">Now</TableHead>
                <TableHead className="text-right">+30 min</TableHead>
                <TableHead className="text-right">+60 min</TableHead>
                <TableHead className="text-right">Peak at</TableHead>
                <TableHead className="text-right">Delay</TableHead>
                <TableHead className="w-40">Confidence</TableHead>
                <TableHead className="text-right">Risk</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {predictions.map((p) => (
                <TableRow key={p.road}>
                  <TableCell>
                    <div className="font-semibold">{p.road}</div>
                    <div className="text-xs text-muted-foreground">{p.area}</div>
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{p.current}%</TableCell>
                  <TableCell className="text-right tabular-nums">{p.in30}%</TableCell>
                  <TableCell className="text-right tabular-nums">{p.in60}%</TableCell>
                  <TableCell className="text-right tabular-nums">{p.peakAt}</TableCell>
                  <TableCell className="text-right tabular-nums">+{p.delayMin} min</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Progress value={p.confidence} className="h-2" />
                      <span className="w-9 shrink-0 text-xs font-semibold">{p.confidence}%</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge className={p.risk > 70 ? "bg-destructive/10 text-destructive" : p.risk > 40 ? "bg-warning/20 text-warning" : "bg-success/10 text-success"}>
                      {p.risk}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </SectionCard>

      <div className="grid gap-4 lg:grid-cols-3">
        <SectionCard title="Machine learning status" description="Serving model and pipeline health">
          <dl className="space-y-3 text-sm">
            {[
              ["Latest model", model.name],
              ["Status", model.status],
              ["Trained at", model.trainedAt],
              ["Dataset rows", model.datasetRows.toLocaleString()],
              ["MAE", `${model.mae} pts`],
            ].map(([k, v]) => (
              <div key={k} className="flex items-center justify-between gap-3">
                <dt className="text-muted-foreground">{k}</dt>
                <dd className="truncate font-semibold">{v}</dd>
              </div>
            ))}
          </dl>
          <Progress value={model.training} className="mt-4 h-2" />
          <p className="mt-2 text-xs text-muted-foreground">Training pipeline complete · next retrain in 6h</p>
        </SectionCard>

        <SectionCard title="Feature importance" description="Contribution to congestion predictions">
          <ul className="space-y-3">
            {model.features.map((f) => (
              <li key={f.name}>
                <div className="flex justify-between text-xs font-semibold">
                  <span>{f.name}</span>
                  <span>{f.weight}%</span>
                </div>
                <Progress value={f.weight} className="mt-1 h-2" />
              </li>
            ))}
          </ul>
        </SectionCard>

        <SectionCard title="Prediction logs" description="Most recent inference batches">
          <ul className="space-y-2 text-sm">
            {predictions.slice(0, 7).map((p, i) => (
              <li key={p.road} className="glass-soft rounded-xl p-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate font-semibold">{p.road}</span>
                  <span className="shrink-0 text-xs text-muted-foreground">{i + 1} min ago</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Forecast {p.in60}% congestion · confidence {p.confidence}%
                </p>
              </li>
            ))}
          </ul>
        </SectionCard>
      </div>
    </>
  );
}

function PField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}
