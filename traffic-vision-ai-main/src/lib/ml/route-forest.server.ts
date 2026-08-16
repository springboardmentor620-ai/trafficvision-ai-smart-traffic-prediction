// Random Forest inference for the Bangalore Traffic Analysis dataset.
//
// Trained offline with scikit-learn on 500k sampled rows of
// https://www.kaggle.com/datasets/asshridattaaigal/bangalore-traffic-analysis-dataset
// (see model/train_route_model.py). The .pkl artefacts live in /model and the
// same forests are exported to route-forest.json so they can be scored inside
// the edge runtime without Python.

import bundle from "./route-forest.json";

type Tree = { f: number[]; t: number[]; l: number[]; r: number[]; v: number[] };
type Forest = { features: string[]; trees: Tree[] };
type Bundle = {
  features: string[];
  travelTime: Forest;
  speed: Forest;
  vehicles: Forest;
  metrics: Record<string, { mae: number; rmse: number; r2: number; rows: number }>;
  dayOfWeek: string[];
  weather: string[];
};

const model = bundle as unknown as Bundle;

export const ROUTE_FEATURES = model.features;
export const ROUTE_MODEL_METRICS = model.metrics;
export const DAY_NAMES = model.dayOfWeek;
export const WEATHER_NAMES = model.weather;

export type RouteFeatureInput = {
  distance: number;
  hour: number;
  dow: number;
  is_weekend: number;
  is_peak: number;
  wea: number;
  road_capacity: number;
  signal_time: number;
};

function scoreTree(tree: Tree, x: number[]): number {
  let node = 0;
  while (tree.f[node] !== -2) {
    const feature = tree.f[node]!;
    node = x[feature]! <= tree.t[node]! ? tree.l[node]! : tree.r[node]!;
  }
  return tree.v[node]!;
}

function scoreForest(forest: Forest, x: number[]) {
  const votes = forest.trees.map((tree) => scoreTree(tree, x));
  const mean = votes.reduce((s, v) => s + v, 0) / votes.length;
  const variance = votes.reduce((s, v) => s + (v - mean) ** 2, 0) / votes.length;
  return { mean, spread: Math.sqrt(variance) };
}

function vectorize(input: RouteFeatureInput) {
  const row = input as unknown as Record<string, number>;
  return ROUTE_FEATURES.map((name) => Number(row[name] ?? 0));
}

/** Random Forest prediction of travel time, speed and vehicle flow for one leg. */
export function predictLeg(input: RouteFeatureInput) {
  const x = vectorize(input);
  const tt = scoreForest(model.travelTime, x);
  const sp = scoreForest(model.speed, x);
  const veh = scoreForest(model.vehicles, x);

  const speed = Math.max(5, Math.min(80, sp.mean));
  // Reconcile the direct travel-time forest with distance / speed physics.
  const physical = (input.distance / speed) * 60 + input.signal_time / 60;
  const travelTime = Math.max(1, (tt.mean * 0.5 + physical * 0.5));
  const relSpread = sp.spread / Math.max(1, speed);
  const confidence = Math.max(60, Math.min(98, 100 - relSpread * 90));

  return {
    travelTimeMin: Number(travelTime.toFixed(1)),
    speedKph: Number(speed.toFixed(1)),
    vehicles: Math.max(0, Math.round(veh.mean)),
    confidence: Number(confidence.toFixed(1)),
  };
}

export function weatherIndex(weather: string) {
  const i = WEATHER_NAMES.findIndex((w) => w.toLowerCase() === weather.toLowerCase());
  return i < 0 ? 0 : i;
}

export const isPeak = (hour: number) =>
  (hour >= 7 && hour <= 10) || (hour >= 17 && hour <= 20) ? 1 : 0;

/** Traffic condition thresholds defined by the dataset's volume/speed profile. */
export function trafficCondition(vehicles: number, speed: number) {
  if (vehicles > 300 || speed < 15) return "Heavy" as const;
  if (vehicles > 150 || speed < 30) return "Moderate" as const;
  return "Smooth" as const;
}
