"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface Props {
  data: {
    road_name: string;
    current_vehicle_count: number;
    predicted_vehicle_count: number | null;
  }[];
}

export default function LineTrafficChart({ data }: Props) {
  return (
    <div className="bg-surface rounded-xl border border-border p-5">
      <h2 className="text-lg font-semibold mb-4 text-ink">
        Traffic Prediction Trend
      </h2>

      <ResponsiveContainer width="100%" height={320}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis dataKey="road_name" stroke="#94A3B8" />
          <YAxis stroke="#94A3B8" />
          <Tooltip />

          <Line
            type="monotone"
            dataKey="current_vehicle_count"
            stroke="#3B82F6"
            strokeWidth={3}
            name="Current"
          />

          <Line
            type="monotone"
            dataKey="predicted_vehicle_count"
            stroke="#10B981"
            strokeWidth={3}
            name="Predicted"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}