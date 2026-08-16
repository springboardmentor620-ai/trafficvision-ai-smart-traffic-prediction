// Google-Maps-style route engine backed entirely by the Bangalore Traffic
// Analysis dataset (public.places gazetteer) and the Random Forest models.

import { publicClient } from "./traffic.server";
import { isPeak, predictLeg, trafficCondition, weatherIndex, DAY_NAMES } from "./ml/route-forest.server";

export type Place = {
  id: number;
  name: string;
  area: string;
  category: string;
  lat: number;
  lng: number;
  capacity: number;
  vehicles: number;
  speed: number;
  signal: number;
  samples: number;
};

const R = 6371;
export function haversine(a: [number, number], b: [number, number]) {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b[0] - a[0]);
  const dLng = toRad(b[1] - a[1]);
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a[0])) * Math.cos(toRad(b[0])) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

function row(p: Record<string, unknown>): Place {
  return {
    id: Number(p['id']),
    name: String(p['name']),
    area: String(p['area'] ?? ""),
    category: String(p['category'] ?? "Area"),
    lat: Number(p['lat']),
    lng: Number(p['lng']),
    capacity: Number(p['capacity'] ?? 1500),
    vehicles: Number(p['vehicles'] ?? 0),
    speed: Number(p['speed'] ?? 0),
    signal: Number(p['signal'] ?? 0),
    samples: Number(p['samples'] ?? 0),
  };
}

/** Autocomplete over the 12,520 dataset locations. */
export async function searchPlaces(term: string, limit = 8): Promise<Place[]> {
  const q = term.trim().toLowerCase();
  if (q.length < 2) return [];
  const sb = publicClient();
  const like = `%${q.replace(/[%_]/g, "")}%`;

  const [starts, contains] = await Promise.all([
    sb.from("places").select("*").ilike("name", `${q.replace(/[%_]/g, "")}%`).order("samples", { ascending: false }).limit(limit),
    sb.from("places").select("*").ilike("search", like).order("samples", { ascending: false }).limit(limit * 2),
  ]);

  const seen = new Set<number>();
  const out: Place[] = [];
  for (const r of [...(starts.data ?? []), ...(contains.data ?? [])]) {
    const p = row(r as Record<string, unknown>);
    if (seen.has(p.id)) continue;
    seen.add(p.id);
    out.push(p);
    if (out.length >= limit) break;
  }
  return out;
}

async function resolvePlace(term: string): Promise<Place | null> {
  const sb = publicClient();
  const exact = await sb.from("places").select("*").eq("name", term.trim()).limit(1);
  if (exact.data?.length) return row(exact.data[0] as Record<string, unknown>);
  const found = await searchPlaces(term, 1);
  return found[0] ?? null;
}

/** Candidate waypoints near the corridor between two points. */
async function corridorPlaces(a: Place, b: Place): Promise<Place[]> {
  const sb = publicClient();
  const pad = 0.02;
  const { data } = await sb
    .from("places")
    .select("*")
    .gte("lat", Math.min(a.lat, b.lat) - pad)
    .lte("lat", Math.max(a.lat, b.lat) + pad)
    .gte("lng", Math.min(a.lng, b.lng) - pad)
    .lte("lng", Math.max(a.lng, b.lng) + pad)
    .order("samples", { ascending: false })
    .limit(400);
  return (data ?? []).map((r) => row(r as Record<string, unknown>));
}

export type PlanInput = {
  source: string;
  destination: string;
  hour?: number | undefined;
  dayOfWeek?: number | undefined;
  weather?: string | undefined;
};

export type RouteLeg = { from: string; to: string; distance: number; time: number; condition: string };

export type PlannedRoute = {
  id: string;
  name: string;
  color: "green" | "yellow" | "blue";
  tag: string;
  via: string[];
  waypoints: { name: string; lat: number; lng: number; category: string }[];
  path: [number, number][];
  distance: number;
  time: number;
  baseTime: number;
  speed: number;
  vehicles: number;
  capacity: number;
  signalTime: number;
  congestion: number;
  condition: string;
  confidence: number;
  fuel: number;
  co2: number;
  trafficScore: number;
  legs: RouteLeg[];
};

function projectionFraction(p: Place, a: Place, b: Place) {
  const ax = a.lng, ay = a.lat, bx = b.lng, by = b.lat;
  const dx = bx - ax, dy = by - ay;
  const len2 = dx * dx + dy * dy || 1e-9;
  const t = ((p.lng - ax) * dx + (p.lat - ay) * dy) / len2;
  const px = ax + t * dx, py = ay + t * dy;
  const off = Math.hypot(p.lng - px, p.lat - py);
  return { t, off };
}

function scoreLeg(from: Place, to: Place, hour: number, dow: number, weather: string) {
  const distance = Number(haversine([from.lat, from.lng], [to.lat, to.lng]).toFixed(3));
  const capacity = (from.capacity + to.capacity) / 2 || 1500;
  const signal = (from.signal + to.signal) / 2 || 30;
  const p = predictLeg({
    distance,
    hour,
    dow,
    is_weekend: dow >= 5 ? 1 : 0,
    is_peak: isPeak(hour),
    wea: weatherIndex(weather),
    road_capacity: capacity,
    signal_time: signal,
  });
  return { distance, capacity, signal, ...p };
}

function buildRoute(
  nodes: Place[],
  meta: { id: string; name: string; color: PlannedRoute["color"]; tag: string },
  hour: number,
  dow: number,
  weather: string,
): PlannedRoute {
  const legs: RouteLeg[] = [];
  let distance = 0, time = 0, speedSum = 0, vehSum = 0, capSum = 0, sigSum = 0, confSum = 0;

  for (let i = 0; i < nodes.length - 1; i++) {
    const from = nodes[i]!, to = nodes[i + 1]!;
    const s = scoreLeg(from, to, hour, dow, weather);
    distance += s.distance;
    time += s.travelTimeMin;
    speedSum += s.speedKph;
    vehSum += s.vehicles;
    capSum += s.capacity;
    sigSum += s.signal;
    confSum += s.confidence;
    legs.push({
      from: from.name,
      to: to.name,
      distance: Number(s.distance.toFixed(2)),
      time: Number(s.travelTimeMin.toFixed(1)),
      condition: trafficCondition(s.vehicles, s.speedKph),
    });
  }

  const n = Math.max(1, legs.length);
  const speed = speedSum / n;
  const vehicles = Math.round(vehSum / n);
  const capacity = Math.round(capSum / n);
  const congestion = Math.max(3, Math.min(100, Math.round((vehicles / Math.max(200, capacity / 4)) * 100)));
  const condition = trafficCondition(vehicles, speed);
  const freeFlowTime = (distance / 45) * 60;

  return {
    ...meta,
    via: nodes.slice(1, -1).map((p) => p.name),
    waypoints: nodes.map((p) => ({ name: p.name, lat: p.lat, lng: p.lng, category: p.category })),
    path: nodes.map((p) => [p.lat, p.lng] as [number, number]),
    distance: Number(distance.toFixed(2)),
    time: Number(time.toFixed(1)),
    baseTime: Number(freeFlowTime.toFixed(1)),
    speed: Number(speed.toFixed(1)),
    vehicles,
    capacity,
    signalTime: Math.round(sigSum / n),
    congestion,
    condition,
    confidence: Number((confSum / n).toFixed(1)),
    fuel: Number((distance / (condition === "Heavy" ? 9 : condition === "Moderate" ? 12 : 16)).toFixed(2)),
    co2: Number(((distance / (condition === "Heavy" ? 9 : condition === "Moderate" ? 12 : 16)) * 2.31).toFixed(2)),
    trafficScore: Math.max(5, Math.min(100, Math.round(100 - congestion * 0.6 - Math.max(0, time - freeFlowTime)))),
    legs,
  };
}

/** Three dataset-derived alternatives (fastest / shortest / least-traffic). */
export async function planRoutes(input: PlanInput) {
  const now = new Date(Date.now() + 5.5 * 3600_000); // IST
  const hour = input.hour ?? now.getUTCHours();
  const dow = input.dayOfWeek ?? (now.getUTCDay() + 6) % 7;
  const weather = input.weather ?? "Clear";

  const [src, dest] = await Promise.all([resolvePlace(input.source), resolvePlace(input.destination)]);
  if (!src) throw new Error(`No location in the dataset matches "${input.source}"`);
  if (!dest) throw new Error(`No location in the dataset matches "${input.destination}"`);
  if (src.id === dest.id) throw new Error("Source and destination are the same location");

  const pool = await corridorPlaces(src, dest);
  const straight = haversine([src.lat, src.lng], [dest.lat, dest.lng]);

  const scored = pool
    .filter((p) => p.id !== src.id && p.id !== dest.id)
    .map((p) => ({ p, ...projectionFraction(p, src, dest) }))
    .filter((x) => x.t > 0.12 && x.t < 0.88);

  const pick = (minOff: number, maxOff: number, band: [number, number]) => {
    const cands = scored.filter((x) => x.off >= minOff && x.off <= maxOff && x.t >= band[0] && x.t <= band[1]);
    if (!cands.length) return null;
    cands.sort((a, b) => b.p.samples - a.p.samples || a.off - b.off);
    return cands[0]!.p;
  };

  const spanDeg = Math.max(0.004, Math.hypot(dest.lng - src.lng, dest.lat - src.lat));
  const near1 = pick(0, spanDeg * 0.05, [0.18, 0.42]);
  const near2 = pick(0, spanDeg * 0.05, [0.45, 0.68]);
  const near3 = pick(0, spanDeg * 0.06, [0.7, 0.86]);
  const midA = pick(spanDeg * 0.05, spanDeg * 0.16, [0.25, 0.5]);
  const midB = pick(spanDeg * 0.05, spanDeg * 0.16, [0.52, 0.78]);
  const wideA = pick(spanDeg * 0.14, spanDeg * 0.32, [0.25, 0.5]);
  const wideB = pick(spanDeg * 0.12, spanDeg * 0.3, [0.52, 0.78]);
  const mid = midA ?? midB;
  const wide = wideA ?? wideB;

  const uniq = (arr: (Place | null)[]) => {
    const seen = new Set<number>();
    return arr.filter((p): p is Place => Boolean(p) && !seen.has(p!.id) && Boolean(seen.add(p!.id)));
  };

  const options: PlannedRoute[] = [];
  options.push(
    buildRoute(uniq([src, near1, near2, near3, dest]), { id: "fastest", name: "Fastest route", color: "green", tag: "Recommended" }, hour, dow, weather),
  );
  if (mid) {
    options.push(
      buildRoute(uniq([src, midA, midB, dest]), { id: "balanced", name: "Alternate route", color: "yellow", tag: "Moderate traffic" }, hour, dow, weather),
    );
  }
  if (wide) {
    options.push(
      buildRoute(uniq([src, wideA, wideB, dest]), { id: "scenic", name: "Low-traffic route", color: "blue", tag: "Avoids congestion" }, hour, dow, weather),
    );
  }
  if (options.length < 3) {
    options.push(
      buildRoute([src, dest], { id: "direct", name: "Direct route", color: "blue", tag: "Shortest distance" }, hour, dow, weather),
    );
  }

  // Rank by predicted travel time, then relabel green / yellow / blue.
  const ranked = [...options].sort((a, b) => a.time - b.time);
  const LABELS: { id: string; name: string; color: PlannedRoute["color"]; tag: string }[] = [
    { id: "fastest", name: "Fastest route", color: "green", tag: "Recommended" },
    { id: "alternate", name: "Alternate route", color: "yellow", tag: "Moderate traffic" },
    { id: "backup", name: "Backup route", color: "blue", tag: "Longer but steady" },
  ];
  ranked.forEach((r, i) => {
    const label = LABELS[Math.min(i, LABELS.length - 1)]!;
    r.id = i < LABELS.length ? label.id : `option-${i}`;
    r.name = label.name;
    r.color = label.color;
    r.tag = r.congestion === Math.min(...ranked.map((x) => x.congestion)) && i > 0 ? "Least traffic" : label.tag;
  });
  const best = ranked[0]!;
  const worst = ranked[ranked.length - 1]!;
  const peak = isPeak(hour) === 1;

  const reasoning =
    `${best.name} via ${best.via.slice(0, 2).join(", ") || "a direct corridor"} is recommended: ` +
    `${best.distance} km at an average ${best.speed} km/h giving ${Math.round(best.time)} min, ` +
    `${Math.max(0, Math.round(worst.time - best.time))} min faster than the slowest alternative. ` +
    `Random Forest scoring used ${DAY_NAMES[dow]} ${String(hour).padStart(2, "0")}:00, ` +
    `${peak ? "peak-hour" : "off-peak"} conditions and ${weather.toLowerCase()} weather; ` +
    `traffic on this corridor is ${best.condition.toLowerCase()} (${best.vehicles} vehicles/hr vs ${best.capacity} capacity). ` +
    `Expected delay against free flow is ${Math.max(0, Math.round(best.time - best.baseTime))} min.`;

  return {
    source: { name: src.name, area: src.area, category: src.category, lat: src.lat, lng: src.lng },
    destination: { name: dest.name, area: dest.area, category: dest.category, lat: dest.lat, lng: dest.lng },
    straightLineKm: Number(straight.toFixed(2)),
    hour,
    dayOfWeek: dow,
    dayName: DAY_NAMES[dow] ?? "Monday",
    weather,
    isPeak: peak,
    options: ranked,
    recommendedId: best.id,
    reasoning,
  };
}

export type RoutePlan = Awaited<ReturnType<typeof planRoutes>>;
