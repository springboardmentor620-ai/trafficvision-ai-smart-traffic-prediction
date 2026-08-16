import { lazy, Suspense } from "react";
import { ClientOnly } from "@tanstack/react-router";

import { cn } from "@/lib/utils";
import type { MapLine, MapPin } from "./LeafletMap";

const LeafletMap = lazy(() => import("./LeafletMap"));

function Skeleton({ className }: { className?: string }) {
  return (
    <div className={cn("grid h-full w-full place-items-center rounded-2xl bg-muted/40", className)}>
      <span className="text-xs font-semibold text-muted-foreground">Loading map…</span>
    </div>
  );
}

/** Leaflet map dedicated to route rendering: coloured alternates + A/B pins. */
export function RouteMap({
  className,
  lines,
  pins,
}: {
  className?: string;
  lines: MapLine[];
  pins: MapPin[];
}) {
  const fit = [...lines.flatMap((l) => l.points), ...pins.map((p) => [p.lat, p.lng] as [number, number])];

  return (
    <div className={cn("relative overflow-hidden rounded-2xl border bg-card", className)}>
      <ClientOnly fallback={<Skeleton />}>
        <Suspense fallback={<Skeleton />}>
          <LeafletMap roads={[]} lines={lines} pins={pins} fit={fit} zoom={12} />
        </Suspense>
      </ClientOnly>
    </div>
  );
}
