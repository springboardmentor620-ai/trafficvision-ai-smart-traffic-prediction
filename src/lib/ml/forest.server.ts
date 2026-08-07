// Random Forest inference for the edge runtime.
// The forest was trained offline with scikit-learn (RandomForestRegressor,
// 45 estimators) on ~90k real Bengaluru corridor observations and exported to a
// flat array-of-nodes representation so it can be scored without Python.

import forestJson from "./forest.json";
import metricsJson from "./metrics.json";

type Tree = { f: number[]; t: number[]; l: number[]; r: number[]; v: number[] };
type Forest = { features: string[]; trees: Tree[] };

const forest = forestJson as Forest;

export const FEATURES = forest.features;

export type FeatureInput = {
  hour: number;
  dow: number;
  is_weekend: number;
  is_peak: number;
  is_holiday: number;
  distance: number;
  temp: number;
  humidity: number;
  aqi: number;
  rain: number;
  lanes: number;
  width: number;
  signals: number;
  road_idx: number;
};

function scoreTree(tree: Tree, x: number[]): number {
  let node = 0;
  // Leaves are encoded with feature index -2.
  while (tree.f[node] !== -2) {
    const feature = tree.f[node]!;
    node = x[feature]! <= tree.t[node]! ? tree.l[node]! : tree.r[node]!;
  }
  return tree.v[node]!;
}

/** Returns predicted congestion percentage plus the spread across trees. */
export function predictCongestion(input: FeatureInput): {
  congestion: number;
  confidence: number;
  spread: number;
} {
  const x = FEATURES.map((name) => Number((input as unknown as Record<string, number>)[name] ?? 0));
  const votes = forest.trees.map((tree) => scoreTree(tree, x));
  const mean = votes.reduce((s, v) => s + v, 0) / votes.length;
  const variance = votes.reduce((s, v) => s + (v - mean) ** 2, 0) / votes.length;
  const spread = Math.sqrt(variance);
  // Tight agreement between trees => high confidence.
  const confidence = Math.max(62, Math.min(99, 100 - spread * 2.4));
  return {
    congestion: Math.max(0, Math.min(100, Number(mean.toFixed(2)))),
    confidence: Number(confidence.toFixed(1)),
    spread: Number(spread.toFixed(2)),
  };
}

export function categoryOf(congestion: number): "Low" | "Medium" | "High" {
  if (congestion < 33) return "Low";
  if (congestion < 66) return "Medium";
  return "High";
}

export function statusOf(congestion: number): "Free flow" | "Moderate" | "Heavy" | "Gridlock" {
  if (congestion < 30) return "Free flow";
  if (congestion < 55) return "Moderate";
  if (congestion < 80) return "Heavy";
  return "Gridlock";
}

export const MODEL_METRICS = metricsJson as {
  mae: number;
  rmse: number;
  r2: number;
  accuracy: number;
  precision: number;
  recall: number;
  f1: number;
  rows: number;
  train_rows: number;
  test_rows: number;
  importances: { name: string; weight: number }[];
  confusion: { label: string; tp: number; fp: number; fn: number }[];
};

export const isPeakHour = (hour: number) =>
  (hour >= 8 && hour <= 10) || (hour >= 17 && hour <= 20);
