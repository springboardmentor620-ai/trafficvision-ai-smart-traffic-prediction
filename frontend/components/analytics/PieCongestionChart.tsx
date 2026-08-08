"use client";

import {
  PieChart,
  Pie,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Legend,
} from "recharts";

interface Props {
  data: {
    name: string;
    value: number;
  }[];
}

const COLORS = [
  "#10B981",
  "#FACC15",
  "#F97316",
  "#EF4444",
];

export default function PieCongestionChart({ data }: Props) {
  return (
    <div className="bg-surface rounded-xl border border-border p-5">
      <h2 className="text-lg font-semibold mb-4 text-ink">
        Congestion Distribution
      </h2>

      <ResponsiveContainer width="100%" height={320}>
        <PieChart>
          <Pie
            data={data}
            outerRadius={110}
            dataKey="value"
            label
          >
            {data.map((_, index) => (
              <Cell
                key={index}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>

          <Legend />
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}