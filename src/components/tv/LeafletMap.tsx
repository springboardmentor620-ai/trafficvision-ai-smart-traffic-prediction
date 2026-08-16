import "leaflet/dist/leaflet.css";

import { useEffect } from "react";
import {
  Circle,
  CircleMarker,
  MapContainer,
  Polyline,
  Popup,
  TileLayer,
  Tooltip,
  useMap,
} from "react-leaflet";

export type MapLine = {
  id: string;
  color: string;
  points: [number, number][];
  active?: boolean;
  label?: string;
};

export type MapPin = { id: string; lat: number; lng: number; label: string; kind: "start" | "end" | "via" };

function FitBounds({ points }: { points: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (points.length < 2) return;
    const lats = points.map((p) => p[0]);
    const lngs = points.map((p) => p[1]);
    map.fitBounds(
      [
        [Math.min(...lats), Math.min(...lngs)],
        [Math.max(...lats), Math.max(...lngs)],
      ],
      { padding: [42, 42], animate: true },
    );
  }, [map, JSON.stringify(points)]);
  return null;
}


export type MapRoad = {
  code: string;
  name: string;
  area: string;
  lat: number;
  lng: number;
  congestion: number;
  avgSpeed: number;
  vehicleCount: number;
  status: string;
};

export type MapCell = { id: number | string; lat: number; lng: number; value: number };

const BENGALURU: [number, number] = [12.9716, 77.5946];

function colorFor(congestion: number) {
  if (congestion >= 66) return "#dc2626";
  if (congestion >= 33) return "#f59e0b";
  return "#16a34a";
}

export default function LeafletMap({
  roads,
  routePoints = [],
  cells = [],
  zoom = 11,
  lines = [],
  pins = [],
  fit = [],
}: {
  roads: MapRoad[];
  routePoints?: [number, number][];
  cells?: MapCell[];
  zoom?: number;
  lines?: MapLine[];
  pins?: MapPin[];
  fit?: [number, number][];
}) {
  const center: [number, number] = pins.length
    ? [pins.reduce((s, p) => s + p.lat, 0) / pins.length, pins.reduce((s, p) => s + p.lng, 0) / pins.length]
    : roads.length
      ? [
          roads.reduce((s, r) => s + r.lat, 0) / roads.length,
          roads.reduce((s, r) => s + r.lng, 0) / roads.length,
        ]
      : BENGALURU;


  return (
    <MapContainer
      center={center}
      zoom={zoom}
      scrollWheelZoom={false}
      className="h-full w-full"
      style={{ background: "var(--muted)" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
      />

      {fit.length > 1 && <FitBounds points={fit} />}

      {cells.map((c) => (
        <Circle
          key={c.id}
          center={[c.lat, c.lng]}
          radius={Math.max(320, 260 + c.value * 8)}
          pathOptions={{
            stroke: false,
            fillColor: colorFor(c.value),
            fillOpacity: 0.1 + Math.min(0.45, (c.value / 100) * 0.45),
          }}
        >
          <Tooltip direction="top" opacity={1}>
            <span className="text-xs font-semibold">Intensity {Math.round(c.value)}%</span>
          </Tooltip>
        </Circle>
      ))}

      {[...lines].sort((a, b) => Number(Boolean(a.active)) - Number(Boolean(b.active))).map((l) => (
        <Polyline
          key={l.id}
          positions={l.points}
          pathOptions={{
            color: l.color,
            weight: l.active ? 7 : 4,
            opacity: l.active ? 0.95 : 0.45,
            lineCap: "round",
            lineJoin: "round",
          }}
        >
          {l.label && (
            <Tooltip sticky opacity={1}>
              <span className="text-xs font-semibold">{l.label}</span>
            </Tooltip>
          )}
        </Polyline>
      ))}

      {pins.map((p) => (
        <CircleMarker
          key={p.id}
          center={[p.lat, p.lng]}
          radius={p.kind === "via" ? 6 : 10}
          pathOptions={{
            color: "#ffffff",
            weight: 3,
            fillColor: p.kind === "start" ? "#16a34a" : p.kind === "end" ? "#dc2626" : "#2563eb",
            fillOpacity: 1,
          }}
        >
          <Tooltip direction="top" offset={[0, -8]} opacity={1} permanent={p.kind !== "via"}>
            <span className="text-xs font-semibold">{p.label}</span>
          </Tooltip>
        </CircleMarker>
      ))}

      {routePoints.length > 1 && (
        <>
          <Polyline positions={routePoints} pathOptions={{ color: "#1d4ed8", weight: 8, opacity: 0.25 }} />
          <Polyline
            positions={routePoints}
            pathOptions={{ color: "#2563eb", weight: 4, dashArray: "10 10" }}
          />
        </>
      )}


      {roads.map((r) => (
        <CircleMarker
          key={r.code}
          center={[r.lat, r.lng]}
          radius={9}
          pathOptions={{
            color: "#ffffff",
            weight: 2,
            fillColor: colorFor(r.congestion),
            fillOpacity: 0.9,
          }}
        >
          <Tooltip direction="top" offset={[0, -8]} opacity={1}>
            <span className="text-xs font-semibold">
              {r.name} · {r.congestion}%
            </span>
          </Tooltip>
          <Popup>
            <div className="space-y-0.5 text-xs">
              <p className="text-sm font-bold">{r.name}</p>
              <p className="text-muted-foreground">{r.area}</p>
              <p>Congestion: {r.congestion}%</p>
              <p>Avg speed: {r.avgSpeed} km/h</p>
              <p>Vehicles: {r.vehicleCount.toLocaleString()}</p>
              <p>Status: {r.status}</p>
            </div>
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}
