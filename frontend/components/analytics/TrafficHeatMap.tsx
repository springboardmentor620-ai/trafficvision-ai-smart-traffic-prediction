"use client";

interface HeatmapData {
  zone: string;
  utilization: number;
}

interface Props {
  data: HeatmapData[];
}

export default function TrafficHeatMap({ data }: Props) {
  function getColor(value: number) {
    if (value >= 90)
      return "bg-red-600";

    if (value >= 70)
      return "bg-orange-500";

    if (value >= 50)
      return "bg-yellow-500";

    return "bg-green-600";
  }

  return (
    <div className="bg-surface rounded-xl border border-border p-5">
      <h2 className="text-lg font-semibold mb-4 text-ink">
        Traffic Heatmap
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {data.map((zone) => (
          <div
            key={zone.zone}
            className={`${getColor(
              zone.utilization
            )} rounded-xl p-5 text-white`}
          >
            <div className="text-lg font-bold">
              {zone.zone}
            </div>

            <div className="text-3xl font-bold mt-4">
              {zone.utilization.toFixed(1)}%
            </div>

            <div className="mt-2 text-sm">
              Traffic Utilization
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}