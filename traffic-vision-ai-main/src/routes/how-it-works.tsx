import { createFileRoute } from "@tanstack/react-router";
import { MarketingPage, InfoGrid } from "@/components/layout/MarketingPage";

export const Route = createFileRoute("/how-it-works")({
  head: () => ({
    meta: [
      { title: "How TrafficVision AI works — TrafficVision AI" },
      { name: "description", content: "From raw sensor data to operational decisions in six automated stages." },
      { property: "og:title", content: "How TrafficVision AI works — TrafficVision AI" },
      { property: "og:description", content: "From raw sensor data to operational decisions in six automated stages." },
    ],
  }),
  component: Page,
});

const items = [
  {
    "title": "1 \u00b7 Collect traffic data",
    "desc": "Cameras, loop detectors, GPS probes and weather feeds stream in."
  },
  {
    "title": "2 \u00b7 Analyze traffic flow",
    "desc": "Vehicle classification, density, occupancy and speed per segment."
  },
  {
    "title": "3 \u00b7 Predict congestion",
    "desc": "Models forecast congestion levels, peak windows and delay."
  },
  {
    "title": "4 \u00b7 Recommend routes",
    "desc": "Ranked alternatives computed in real time for every corridor."
  },
  {
    "title": "5 \u00b7 Generate alerts",
    "desc": "Operators notified via console, email, SMS and push."
  },
  {
    "title": "6 \u00b7 Analytics dashboard",
    "desc": "Trends, heatmaps and reports feed smart city planning."
  }
];

function Page() {
  return (
    <MarketingPage eyebrow="Workflow" title="How TrafficVision AI works" intro="From raw sensor data to operational decisions in six automated stages.">
      <InfoGrid items={items} />
    </MarketingPage>
  );
}
