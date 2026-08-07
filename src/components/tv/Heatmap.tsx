import { cn } from "@/lib/utils";

function color(v: number) {
  if (v > 80) return "oklch(0.58 0.22 25 / 0.92)";
  if (v > 62) return "oklch(0.72 0.19 45 / 0.88)";
  if (v > 45) return "oklch(0.82 0.16 85 / 0.85)";
  if (v > 28) return "oklch(0.78 0.13 150 / 0.75)";
  return "oklch(0.72 0.14 205 / 0.55)";
}

export type HeatCell = { id: string | number; x: number; y: number; value: number };

export function HeatmapGrid({
  cells,
  className,
  intensity = 1,
}: {
  cells: HeatCell[];
  className?: string;
  intensity?: number;
}) {
  return (
    <div className={cn("grid grid-cols-14 gap-1", className)} style={{ gridTemplateColumns: "repeat(14, minmax(0, 1fr))" }}>
      {cells.map((c) => {
        const v = Math.min(100, Math.round(c.value * intensity));
        return (
          <div
            key={c.id}
            title={`Cell ${c.x},${c.y} — ${v}%`}
            className="aspect-square rounded-[5px] transition-transform duration-200 hover:scale-125"
            style={{ background: color(v) }}
          />
        );
      })}
    </div>
  );
}

export function HeatLegend() {
  return (
    <div className="flex items-center gap-3 text-xs text-muted-foreground">
      <span>Low</span>
      <div
        className="h-2 w-40 rounded-full"
        style={{
          background:
            "linear-gradient(90deg, oklch(0.72 0.14 205), oklch(0.78 0.13 150), oklch(0.82 0.16 85), oklch(0.72 0.19 45), oklch(0.58 0.22 25))",
        }}
      />
      <span>Severe</span>
    </div>
  );
}
