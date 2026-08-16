import { lazy, Suspense } from "react";
import { ClientOnly } from "@tanstack/react-router";

import { cn } from "@/lib/utils";
import { useTraffic } from "@/lib/use-traffic";
import type { MapCell, MapRoad } from "./LeafletMap";

const LeafletMap = lazy(() => import("./LeafletMap"));

function MapSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("grid place-items-center rounded-2xl border bg-muted/40", className)}>
      <span className="text-xs font-semibold text-muted-foreground">Loading live map…</span>
    </div>
  );
}

/** Live Leaflet map of the Bengaluru corridor network, coloured by congestion. */
export function CityMap({
  className,
  showRoute = false,
  routeRoadIds,
  zoom,
  heat = false,
  heatIntensity = 1,
}: {
  className?: string;
  showRoute?: boolean;
  routeRoadIds?: string[];
  zoom?: number;
  /** Render weighted congestion circles (heatmap layer) on top of the base map. */
  heat?: boolean;
  heatIntensity?: number;
}) {
  const { roads, heatCells } = useTraffic();

  const mapRoads: MapRoad[] = roads
    .filter((r) => Number.isFinite(r.lat) && Number.isFinite(r.lng) && r.lat !== 0)
    .map((r) => ({
      code: r.code,
      name: r.name,
      area: r.area,
      lat: r.lat,
      lng: r.lng,
      congestion: r.congestion,
      avgSpeed: r.avgSpeed,
      vehicleCount: r.vehicleCount,
      status: r.status,
    }));

  const selected = routeRoadIds?.length
    ? routeRoadIds
        .map((code) => mapRoads.find((r) => r.code === code))
        .filter((r): r is MapRoad => Boolean(r))
    : [...mapRoads].sort((a, b) => a.congestion - b.congestion).slice(0, 4);

  const routePoints: [number, number][] = showRoute
    ? [...selected].sort((a, b) => a.lng - b.lng).map((r) => [r.lat, r.lng] as [number, number])
    : [];

  const cells: MapCell[] = heat
    ? heatCells
        .filter((c) => Number.isFinite(c.lat) && Number.isFinite(c.lng) && c.lat !== 0)
        .map((c) => ({ id: c.id, lat: c.lat, lng: c.lng, value: Math.min(100, c.value * heatIntensity) }))
    : [];

  return (
    <div className={cn("relative overflow-hidden rounded-2xl border bg-card", className)}>
      <ClientOnly fallback={<MapSkeleton className="h-full w-full" />}>
        <Suspense fallback={<MapSkeleton className="h-full w-full" />}>
          <LeafletMap
            roads={mapRoads}
            routePoints={routePoints}
            cells={cells}
            {...(zoom ? { zoom } : {})}
          />
        </Suspense>
      </ClientOnly>

      <div className="pointer-events-none absolute bottom-3 left-3 z-[400] flex flex-wrap gap-2 text-[11px] font-semibold">
        {[
          ["Free flow", "bg-success"],
          ["Moderate", "bg-warning"],
          ["Heavy", "bg-destructive"],
        ].map(([label, bg]) => (
          <span key={label} className="glass flex items-center gap-1.5 rounded-full px-2.5 py-1">
            <span className={cn("h-2 w-2 rounded-full", bg)} />
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}
