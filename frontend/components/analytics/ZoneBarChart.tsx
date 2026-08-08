"use client";

import {
  ResponsiveContainer,
  BarChart,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Bar,
} from "recharts";

interface Props {
  data: {
    zone: string;
    vehicles: number;
  }[];
}

export default function ZoneBarChart({ data }: Props) {
  return (
    <div className="bg-surface rounded-xl border border-border p-5">
      <h2 className="text-lg font-semibold mb-4 text-ink">
        Zone Vehicle Count
      </h2>

      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />

          <XAxis
            dataKey="zone"
            stroke="#94A3B8"
          />

          <YAxis stroke="#94A3B8" />

          <Tooltip />

          <Bar
            dataKey="vehicles"
            fill="#3B82F6"
            radius={[8, 8, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}