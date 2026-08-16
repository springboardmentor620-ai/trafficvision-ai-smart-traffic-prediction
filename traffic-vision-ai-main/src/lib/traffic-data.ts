// Deterministic mock data layer for TrafficVision AI.
// Mirrors the planned FastAPI / PostgreSQL schema so it can be swapped for real APIs.

function rng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}
const r = rng(20260802);
const pick = <T,>(arr: readonly T[]): T => arr[Math.floor(r() * arr.length)]!;
const int = (min: number, max: number) => Math.floor(min + r() * (max - min + 1));

export const cities = ["Bengaluru", "Mumbai", "Delhi NCR", "Hyderabad", "Pune"];
export const areas = ["Central Business", "Whitefield", "Airport Corridor", "Old Town", "Tech Park", "Harbour"];

export type Road = {
  id: string;
  name: string;
  city: string;
  area: string;
  lanes: number;
  lengthKm: number;
  vehicleCount: number;
  avgSpeed: number;
  congestion: number;
  occupancy: number;
  status: "Free flow" | "Moderate" | "Heavy" | "Gridlock";
  condition: "Good" | "Fair" | "Under repair";
  cameras: number;
  signals: number;
};

const roadNames = [
  "Outer Ring Road", "MG Road", "Hosur Highway", "Airport Expressway", "Marine Drive",
  "Silk Board Junction", "Sarjapur Road", "Bellandur Link", "Old Madras Road", "Tumkur Highway",
  "Bannerghatta Road", "電 Kasturba Rd".replace("電 ", ""), "Indiranagar 100ft", "Whitefield Main", "Peripheral Ring",
  "Hebbal Flyover", "Jayanagar 4th Block", "Koramangala Inner Ring", "Yeshwanthpur Bypass", "Electronic City Elevated",
];

function statusFor(c: number): Road["status"] {
  if (c < 30) return "Free flow";
  if (c < 55) return "Moderate";
  if (c < 80) return "Heavy";
  return "Gridlock";
}

export const roads: Road[] = roadNames.map((name, i) => {
  const congestion = int(12, 96);
  return {
    id: `RD-${String(i + 1).padStart(3, "0")}`,
    name,
    city: cities[i % cities.length]!,
    area: areas[i % areas.length]!,
    lanes: int(2, 8),
    lengthKm: Number((2 + r() * 18).toFixed(1)),
    vehicleCount: int(420, 5200),
    avgSpeed: Math.max(6, Math.round(72 - congestion * 0.6 + r() * 8)),
    congestion,
    occupancy: Math.min(99, congestion + int(-8, 10)),
    status: statusFor(congestion),
    condition: pick(["Good", "Good", "Fair", "Under repair"] as const),
    cameras: int(2, 14),
    signals: int(1, 9),
  };
});

export const topCongested = [...roads].sort((a, b) => b.congestion - a.congestion).slice(0, 8);

export const kpis = {
  totalRoads: roads.length * 12,
  totalCameras: roads.reduce((s, x) => s + x.cameras, 0) * 6,
  camerasOnline: 96.4,
  trafficDensity: Math.round(roads.reduce((s, x) => s + x.occupancy, 0) / roads.length),
  congestionIndex: Number((roads.reduce((s, x) => s + x.congestion, 0) / roads.length / 10).toFixed(1)),
  avgSpeed: Math.round(roads.reduce((s, x) => s + x.avgSpeed, 0) / roads.length),
  activeAlerts: 17,
  accidentsToday: 6,
  aiPredictions: 1284,
  weather: "Light rain · 24°C",
};

export const hourly = Array.from({ length: 24 }, (_, h) => {
  const peak = Math.exp(-((h - 9) ** 2) / 8) + Math.exp(-((h - 18.5) ** 2) / 7);
  const volume = Math.round(900 + peak * 5200 + r() * 350);
  return {
    hour: `${String(h).padStart(2, "0")}:00`,
    volume,
    congestion: Math.min(98, Math.round(18 + peak * 62 + r() * 8)),
    predicted: Math.min(98, Math.round(20 + peak * 60 + r() * 6)),
    speed: Math.max(8, Math.round(64 - peak * 34 + r() * 5)),
    travelTime: Math.round(12 + peak * 26 + r() * 4),
  };
});

export const weekly = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, i) => ({
  day,
  volume: int(48000, 96000),
  congestion: int(38, 84),
  incidents: int(2, 14),
  accuracy: 88 + Number((r() * 8).toFixed(1)),
  index: i,
}));

export const monthly = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
].map((month) => ({
  month,
  volume: int(1200000, 2400000),
  congestion: int(35, 82),
  growth: Number((r() * 12 - 3).toFixed(1)),
  co2: int(1200, 3800),
}));

export const vehicleMix = [
  { name: "Cars", value: 46, color: "var(--chart-1)" },
  { name: "Two-wheelers", value: 27, color: "var(--chart-2)" },
  { name: "Buses", value: 11, color: "var(--chart-3)" },
  { name: "Trucks", value: 10, color: "var(--chart-4)" },
  { name: "Emergency", value: 6, color: "var(--chart-5)" },
];

export type Alert = {
  id: string;
  type: string;
  road: string;
  area: string;
  severity: "Critical" | "High" | "Medium" | "Low";
  time: string;
  status: "Active" | "Acknowledged" | "Resolved";
  message: string;
};

const alertTypes = [
  "Congestion", "Accident", "Road closure", "Heavy traffic", "Emergency vehicle",
  "Weather warning", "Flood alert", "Construction",
];

export const alerts: Alert[] = Array.from({ length: 16 }, (_, i) => {
  const type = alertTypes[i % alertTypes.length]!;
  const road = roads[int(0, roads.length - 1)]!;
  return {
    id: `ALT-${1200 + i}`,
    type,
    road: road.name,
    area: road.area,
    severity: pick(["Critical", "High", "Medium", "Low"] as const),
    time: `${String(int(0, 23)).padStart(2, "0")}:${String(int(0, 59)).padStart(2, "0")}`,
    status: pick(["Active", "Active", "Acknowledged", "Resolved"] as const),
    message: `${type} detected on ${road.name} (${road.area}). AI suggests diverting via ${roads[int(0, roads.length - 1)]!.name}.`,
  };
});

export type User = {
  id: string;
  name: string;
  email: string;
  role: "Admin" | "Traffic Operator" | "Analyst" | "Viewer";
  status: "Active" | "Suspended" | "Invited";
  lastLogin: string;
  city: string;
};

const names = [
  "Ananya Rao", "Vikram Shetty", "Priya Nair", "Rohan Mehta", "Sara Iqbal", "Dev Patel",
  "Nikhil Kumar", "Meera Joshi", "Arjun Reddy", "Kavya Menon", "Imran Sheikh", "Tara Bose",
];

export const users: User[] = names.map((name, i) => ({
  id: `USR-${100 + i}`,
  name,
  email: `${name.split(" ")[0]!.toLowerCase()}@trafficvision.ai`,
  role: pick(["Admin", "Traffic Operator", "Traffic Operator", "Analyst", "Viewer"] as const),
  status: pick(["Active", "Active", "Active", "Suspended", "Invited"] as const),
  lastLogin: `${int(1, 28)} Jul 2026, ${String(int(7, 21)).padStart(2, "0")}:${String(int(0, 59)).padStart(2, "0")}`,
  city: cities[i % cities.length]!,
}));

export const activityLogs = Array.from({ length: 10 }, (_, i) => ({
  id: `LOG-${900 + i}`,
  actor: names[i % names.length]!,
  action: pick([
    "Acknowledged congestion alert", "Retrained prediction model", "Exported traffic report",
    "Updated signal timing", "Added new camera", "Changed user role", "Generated heatmap",
  ] as const),
  target: roads[int(0, roads.length - 1)]!.name,
  at: `${int(1, 12)} min ago`,
}));

export const model = {
  name: "TV-Congestion-LSTM v4.2",
  accuracy: 94.3,
  precision: 92.7,
  recall: 91.4,
  f1: 92.0,
  mae: 3.8,
  trainedAt: "01 Aug 2026, 03:20 UTC",
  status: "Serving",
  training: 100,
  datasetRows: 8_420_000,
  features: [
    { name: "Historical volume", weight: 92 },
    { name: "Hour of day", weight: 86 },
    { name: "Weather", weight: 71 },
    { name: "Day of week", weight: 65 },
    { name: "Incidents nearby", weight: 58 },
    { name: "Road capacity", weight: 44 },
    { name: "Event calendar", weight: 31 },
  ],
  confusion: [
    { label: "Free flow", tp: 1820, fp: 74, fn: 61 },
    { label: "Moderate", tp: 1543, fp: 118, fn: 132 },
    { label: "Heavy", tp: 1187, fp: 96, fn: 88 },
    { label: "Gridlock", tp: 642, fp: 41, fn: 37 },
  ],
  roc: Array.from({ length: 11 }, (_, i) => ({
    fpr: i / 10,
    tpr: Number(Math.min(1, Math.sqrt(i / 10) * 1.06).toFixed(3)),
  })),
};

export const predictions = roads.slice(0, 10).map((road) => ({
  road: road.name,
  area: road.area,
  current: road.congestion,
  in30: Math.min(99, road.congestion + int(-12, 22)),
  in60: Math.min(99, road.congestion + int(-16, 28)),
  peakAt: `${int(16, 20)}:${pick(["00", "15", "30", "45"])}`,
  delayMin: int(3, 34),
  confidence: int(78, 98),
  risk: int(12, 95),
}));

export const routeOptions = [
  {
    name: "Recommended route",
    tag: "Best balance",
    distance: 14.2,
    time: 26,
    trafficScore: 82,
    fuel: 1.1,
    co2: 2.6,
    condition: "Good",
    via: "Outer Ring Road → Hebbal Flyover",
  },
  {
    name: "Fastest route",
    tag: "Time optimised",
    distance: 16.8,
    time: 23,
    trafficScore: 74,
    fuel: 1.35,
    co2: 3.1,
    condition: "Fair",
    via: "Airport Expressway → Peripheral Ring",
  },
  {
    name: "Least congested",
    tag: "Smooth drive",
    distance: 18.4,
    time: 31,
    trafficScore: 91,
    fuel: 1.42,
    co2: 3.3,
    condition: "Good",
    via: "Old Madras Road → Tumkur Highway",
  },
  {
    name: "Safest route",
    tag: "Low incident",
    distance: 15.9,
    time: 34,
    trafficScore: 88,
    fuel: 1.25,
    co2: 2.9,
    condition: "Good",
    via: "MG Road → Jayanagar 4th Block",
  },
];

export const insights = [
  {
    title: "Retime Silk Board signals",
    impact: "High",
    detail: "Extending the north-bound green phase by 18s between 17:30–19:30 is projected to cut queue length by 21%.",
    metric: "-21% queue",
  },
  {
    title: "Divert freight off MG Road",
    impact: "High",
    detail: "Freight traffic contributes 34% of peak-hour occupancy. A 06:00–10:00 restriction frees ~1.4 lanes equivalent.",
    metric: "+1.4 lanes",
  },
  {
    title: "Expand Sarjapur Road corridor",
    impact: "Medium",
    detail: "Sustained congestion above 78% for 9 consecutive weeks indicates structural capacity shortfall.",
    metric: "78% sustained",
  },
  {
    title: "Pre-position emergency units",
    impact: "Medium",
    detail: "Accident clustering near Hebbal Flyover suggests staging a response unit within 2km during evening peak.",
    metric: "-6 min response",
  },
  {
    title: "Weather-aware prediction boost",
    impact: "Low",
    detail: "Rain events degrade accuracy by 4.1%. Adding radar nowcast features should recover most of the gap.",
    metric: "+4.1% accuracy",
  },
  {
    title: "Shift bus departures by 10 min",
    impact: "Medium",
    detail: "Staggering depot departures reduces platooning on the Airport Corridor morning peak.",
    metric: "-9% platooning",
  },
];

export const heatCells = Array.from({ length: 12 * 14 }, (_, i) => ({
  id: i,
  x: i % 14,
  y: Math.floor(i / 14),
  value: Math.round(
    Math.max(
      4,
      Math.min(
        100,
        90 * Math.exp(-(((i % 14) - 7) ** 2 + (Math.floor(i / 14) - 6) ** 2) / 26) + r() * 30,
      ),
    ),
  ),
}));

export const reportTemplates = [
  { name: "Traffic summary report", desc: "Volume, speed and occupancy across all monitored corridors.", pages: 12 },
  { name: "Congestion report", desc: "Congestion index trends, hotspots and duration analysis.", pages: 9 },
  { name: "Vehicle analytics report", desc: "Classification mix, flow rates and freight movement.", pages: 7 },
  { name: "Road performance report", desc: "Per-road utilisation, incidents and condition scoring.", pages: 14 },
  { name: "Prediction accuracy report", desc: "Model performance, drift and confidence distribution.", pages: 6 },
  { name: "Heatmap export", desc: "Density and incident heatmaps for the selected window.", pages: 4 },
];

export const cameras = Array.from({ length: 12 }, (_, i) => ({
  id: `CAM-${400 + i}`,
  road: roads[i % roads.length]!.name,
  area: roads[i % roads.length]!.area,
  online: r() > 0.12,
  fps: int(18, 30),
  vehicles: int(20, 180),
  density: int(20, 96),
}));
