import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Cloud, Fuel, Gauge, Leaf, Navigation, Route as RouteIcon, Timer, TrafficCone } from "lucide-react";

import { PageHeader, SectionCard } from "@/components/tv/PageHeader";
import { PlaceAutocomplete } from "@/components/tv/PlaceAutocomplete";
import { RouteMap } from "@/components/tv/RouteMap";
import type { MapLine, MapPin } from "@/components/tv/LeafletMap";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { planRoute } from "@/lib/route-planner.functions";
import type { RoutePlan } from "@/lib/route-planner.server";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/dashboard/routes")({
  component: RouteAnalysis,
});

const COLORS: Record<string, string> = {
  green: "#16a34a",
  yellow: "#f59e0b",
  blue: "#2563eb",
};

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const WEATHER = ["Clear", "Cloudy", "Rainy", "Foggy"] as const;

function nowIST() {
  const d = new Date(Date.now() + 5.5 * 3600_000);
  return { hour: d.getUTCHours(), dow: (d.getUTCDay() + 6) % 7 };
}

function RouteAnalysis() {
  const initial = nowIST();
  const [source, setSource] = useState("");
  const [destination, setDestination] = useState("");
  const [hour, setHour] = useState(initial.hour);
  const [dayOfWeek, setDayOfWeek] = useState(initial.dow);
  const [weather, setWeather] = useState<(typeof WEATHER)[number]>("Clear");
  const [selected, setSelected] = useState(0);

  const call = useServerFn(planRoute);
  const plan = useMutation({
    mutationFn: () =>
      call({ data: { source, destination, hour, dayOfWeek, weather } }) as Promise<RoutePlan>,
    onSuccess: (data) => {
      setSelected(Math.max(0, data.options.findIndex((o) => o.id === data.recommendedId)));
      toast.success(`${data.options.length} routes found from the Bengaluru dataset`);
    },
    onError: (e: Error) => toast.error("Could not plan this route", { description: e.message }),
  });

  const result = plan.data;
  const options = result?.options ?? [];
  const active = options[selected];

  const lines: MapLine[] = useMemo(
    () =>
      options.map((o, i) => ({
        id: o.id,
        color: COLORS[o.color] ?? "#2563eb",
        points: o.path,
        active: i === selected,
        label: `${o.name} · ${Math.round(o.time)} min · ${o.distance} km`,
      })),
    [options, selected],
  );

  const pins: MapPin[] = useMemo(() => {
    if (!result) return [];
    const base: MapPin[] = [
      { id: "src", lat: result.source.lat, lng: result.source.lng, label: result.source.name, kind: "start" },
      { id: "dst", lat: result.destination.lat, lng: result.destination.lng, label: result.destination.name, kind: "end" },
    ];
    const via = (active?.waypoints ?? []).slice(1, -1).map((w, i) => ({
      id: `via-${i}`,
      lat: w.lat,
      lng: w.lng,
      label: w.name,
      kind: "via" as const,
    }));
    return [...base, ...via];
  }, [result, active]);

  return (
    <>
      <PageHeader
        title="Route recommendation"
        subtitle="Search any Bengaluru location — alternate routes, live travel time and congestion scored by the Random Forest model on the real routes dataset"
      />

      <SectionCard
        title="Plan a route"
        description="Type any area, landmark, temple, college, hospital, mall, metro or bus stop from the dataset"
      >
        <div className="grid gap-3 lg:grid-cols-2">
          <PlaceAutocomplete value={source} onChange={setSource} placeholder="Source location" />
          <PlaceAutocomplete
            value={destination}
            onChange={setDestination}
            placeholder="Destination location"
            icon={<Navigation className="h-4 w-4 text-violet" />}
          />
        </div>

        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Select value={String(dayOfWeek)} onValueChange={(v) => setDayOfWeek(Number(v))}>
            <SelectTrigger><SelectValue placeholder="Day" /></SelectTrigger>
            <SelectContent>
              {DAYS.map((d, i) => (
                <SelectItem key={d} value={String(i)}>{d}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={String(hour)} onValueChange={(v) => setHour(Number(v))}>
            <SelectTrigger><SelectValue placeholder="Hour" /></SelectTrigger>
            <SelectContent>
              {Array.from({ length: 24 }, (_, h) => (
                <SelectItem key={h} value={String(h)}>{String(h).padStart(2, "0")}:00</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={weather} onValueChange={(v) => setWeather(v as (typeof WEATHER)[number])}>
            <SelectTrigger><SelectValue placeholder="Weather" /></SelectTrigger>
            <SelectContent>
              {WEATHER.map((w) => (
                <SelectItem key={w} value={w}>{w}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            className="bg-brand text-primary-foreground"
            disabled={plan.isPending || source.trim().length < 2 || destination.trim().length < 2}
            onClick={() => plan.mutate()}
          >
            {plan.isPending ? "Finding routes…" : "Find routes"}
          </Button>
        </div>
      </SectionCard>

      {!result && (
        <SectionCard title="No route yet" description="Pick a source and destination to see three dataset-derived alternatives">
          <div className="grid place-items-center gap-2 rounded-2xl border border-dashed py-14 text-center">
            <RouteIcon className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Every suggestion comes from the Bengaluru routes dataset — 12,520 mapped locations.
            </p>
          </div>
        </SectionCard>
      )}

      {result && active && (
        <>
          <div className="grid gap-4 xl:grid-cols-[1.35fr_1fr]">
            <SectionCard
              title="Route map"
              description={`${result.source.name} → ${result.destination.name}`}
              actions={
                <Badge className="bg-success/10 text-success">
                  ETA {Math.round(active.time)} min · {active.distance} km
                </Badge>
              }
            >
              <RouteMap className="h-[420px]" lines={lines} pins={pins} />
              <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold">
                {options.map((o, i) => (
                  <button
                    key={o.id}
                    onClick={() => setSelected(i)}
                    className={cn(
                      "flex items-center gap-2 rounded-full border px-3 py-1.5 transition-colors",
                      i === selected ? "bg-accent" : "hover:bg-accent/60",
                    )}
                  >
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: COLORS[o.color] }} />
                    {o.name} · {Math.round(o.time)} min
                  </button>
                ))}
              </div>
            </SectionCard>

            <SectionCard title="Alternate routes" description="Ranked by predicted travel time and traffic condition">
              <ul className="space-y-3">
                {options.map((o, i) => (
                  <li key={o.id}>
                    <button
                      onClick={() => setSelected(i)}
                      className={cn(
                        "w-full rounded-2xl border p-4 text-left transition-all",
                        i === selected ? "border-primary bg-primary/5 shadow-[var(--shadow-soft)]" : "hover:bg-accent/50",
                      )}
                    >
                      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-2">
                        <div className="min-w-0">
                          <p className="flex items-center gap-2 truncate font-display text-sm font-bold">
                            <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: COLORS[o.color] }} />
                            {o.name}
                          </p>
                          <p className="truncate text-xs text-muted-foreground">
                            via {o.via.length ? o.via.join(" → ") : "direct corridor"}
                          </p>
                        </div>
                        <Badge variant="outline" className="shrink-0">{o.tag}</Badge>
                      </div>

                      <div className="mt-3 grid grid-cols-4 gap-2 text-center text-xs">
                        <Metric label="Time" value={`${Math.round(o.time)}m`} />
                        <Metric label="Distance" value={`${o.distance}km`} />
                        <Metric label="Speed" value={`${o.speed}`} />
                        <Metric label="Traffic" value={o.condition} />
                      </div>

                      <div className="mt-3">
                        <div className="flex justify-between text-[11px] font-semibold">
                          <span>Route score</span>
                          <span>{o.trafficScore}/100</span>
                        </div>
                        <Progress value={o.trafficScore} className="mt-1 h-1.5" />
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            </SectionCard>
          </div>

          <SectionCard
            title="AI routing rationale"
            description={`${result.dayName} ${String(result.hour).padStart(2, "0")}:00 · ${result.weather} · ${result.isPeak ? "peak hour" : "off-peak"}`}
            actions={<Badge variant="outline">Confidence {active.confidence}%</Badge>}
          >
            <p className="text-sm text-muted-foreground">{result.reasoning}</p>
          </SectionCard>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Timer, label: "Estimated travel time", value: `${Math.round(active.time)} min`, tone: "text-primary" },
              { icon: Gauge, label: "Average speed", value: `${active.speed} km/h`, tone: "text-violet" },
              { icon: Fuel, label: "Fuel estimate", value: `${active.fuel} L`, tone: "text-warning" },
              { icon: Leaf, label: "CO₂ estimate", value: `${active.co2} kg`, tone: "text-success" },
            ].map((m) => (
              <div key={m.label} className="glass card-hover rounded-2xl p-4">
                <m.icon className={cn("h-5 w-5", m.tone)} />
                <p className="mt-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{m.label}</p>
                <p className="mt-1 font-display text-2xl font-extrabold">{m.value}</p>
              </div>
            ))}
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <SectionCard title="Segment conditions" description="Every leg scored from the dataset">
              <ul className="space-y-2">
                {active.legs.map((leg, i) => (
                  <li key={`${leg.from}-${i}`} className="glass-soft rounded-2xl p-3">
                    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
                      <p className="truncate text-sm font-semibold">
                        {leg.from} → {leg.to}
                      </p>
                      <Badge
                        variant="outline"
                        className={cn(
                          "shrink-0",
                          leg.condition === "Heavy" && "border-destructive/40 text-destructive",
                          leg.condition === "Moderate" && "border-warning/40 text-warning",
                          leg.condition === "Smooth" && "border-success/40 text-success",
                        )}
                      >
                        {leg.condition}
                      </Badge>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {leg.distance} km · {leg.time} min
                    </p>
                  </li>
                ))}
              </ul>
            </SectionCard>

            <SectionCard title="Traffic factors" description="Inputs the Random Forest used for this corridor">
              <div className="grid gap-3 sm:grid-cols-2">
                <Factor icon={TrafficCone} label="Vehicles / hour" value={String(active.vehicles)} />
                <Factor icon={Gauge} label="Road capacity" value={String(active.capacity)} />
                <Factor icon={Timer} label="Signal time" value={`${active.signalTime} s`} />
                <Factor icon={Cloud} label="Weather" value={result.weather} />
                <Factor icon={RouteIcon} label="Straight-line" value={`${result.straightLineKm} km`} />
                <Factor
                  icon={Timer}
                  label="Delay vs free flow"
                  value={`${Math.max(0, Math.round(active.time - active.baseTime))} min`}
                />
              </div>
              <div className="mt-4">
                <div className="flex justify-between text-xs font-semibold">
                  <span>Congestion level</span>
                  <span>{active.congestion}%</span>
                </div>
                <Progress value={active.congestion} className="mt-1 h-2" />
              </div>
            </SectionCard>
          </div>
        </>
      )}
    </>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-muted/60 py-1.5">
      <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="truncate font-semibold">{value}</p>
    </div>
  );
}

function Factor({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="glass-soft flex items-center gap-3 rounded-2xl p-3">
      <Icon className="h-4 w-4 text-primary" />
      <div className="min-w-0">
        <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className="truncate text-sm font-semibold">{value}</p>
      </div>
    </div>
  );
}
