import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader, SectionCard } from "@/components/tv/PageHeader";
import { HeatmapGrid, HeatLegend } from "@/components/tv/Heatmap";
import { CityMap } from "@/components/tv/CityMap";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { useTraffic } from "@/lib/use-traffic";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/dashboard/heatmaps")({
  component: Heatmaps,
});

const layers = ["Traffic density", "Congestion", "Accidents", "Road utilisation"] as const;

function Heatmaps() {
  const { heatCells, areas } = useTraffic();
  const [layer, setLayer] = useState<(typeof layers)[number]>("Traffic density");
  const [intensity, setIntensity] = useState([100]);

  const factor: Record<string, number> = {
    "Traffic density": 1,
    Congestion: 0.92,
    Accidents: 0.55,
    "Road utilisation": 1.08,
  };

  return (
    <>
      <PageHeader
        title="Heatmaps"
        subtitle="Spatial view of density, congestion, accidents and utilisation"
        actions={<Button variant="outline">Export heatmap</Button>}
      />

      <SectionCard title="Filters" description="Time, area, date and vehicle type">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Input type="date" defaultValue="2026-08-02" />
          <Input type="time" defaultValue="18:00" />
          <select className="h-10 rounded-xl border bg-card px-3 text-sm">
            {["All areas", ...areas].map((a) => <option key={a}>{a}</option>)}
          </select>
          <select className="h-10 rounded-xl border bg-card px-3 text-sm">
            {["All vehicles", "Cars", "Two-wheelers", "Buses", "Trucks", "Emergency"].map((a) => <option key={a}>{a}</option>)}
          </select>
        </div>
      </SectionCard>

      <SectionCard
        title="Geographic heat layer"
        description="Live congestion weighting projected on the Bengaluru road network"
        actions={<HeatLegend />}
      >
        <CityMap className="h-[380px]" heat heatIntensity={(factor[layer] ?? 1) * ((intensity[0] ?? 100) / 100)} />
      </SectionCard>

      <SectionCard
        title={`${layer} heatmap`}
        description="Each cell represents a 1km² zone · hover for exact values"
        actions={<HeatLegend />}
      >
        <div className="mb-4 flex flex-wrap gap-2">
          {layers.map((l) => (
            <button
              key={l}
              onClick={() => setLayer(l)}
              className={cn(
                "rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors",
                layer === l ? "bg-brand text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-accent",
              )}
            >
              {l}
            </button>
          ))}
        </div>
        <HeatmapGrid cells={heatCells} intensity={(factor[layer] ?? 1) * ((intensity[0] ?? 100) / 100)} />
        <div className="mt-5 max-w-sm">
          <p className="mb-2 text-xs font-semibold text-muted-foreground">Intensity · {intensity[0]}%</p>
          <Slider value={intensity} onValueChange={setIntensity} min={40} max={140} step={5} />
        </div>
      </SectionCard>

      <div className="grid gap-4 md:grid-cols-3">
        {[
          { title: "Hottest zone", value: "Zone 7-6 · Silk Board", desc: "98% sustained density during evening peak." },
          { title: "Fastest improving", value: "Zone 2-3 · Old Town", desc: "Density down 18% after signal retiming." },
          { title: "Accident cluster", value: "Zone 9-4 · Hebbal", desc: "11 incidents in the last 30 days." },
        ].map((c) => (
          <div key={c.title} className="glass card-hover rounded-2xl p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{c.title}</p>
            <p className="mt-2 font-display text-lg font-extrabold">{c.value}</p>
            <p className="mt-1 text-sm text-muted-foreground">{c.desc}</p>
          </div>
        ))}
      </div>
    </>
  );
}
