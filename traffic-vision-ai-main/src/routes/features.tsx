import { createFileRoute } from "@tanstack/react-router";
import { MarketingPage, InfoGrid } from "@/components/layout/MarketingPage";

export const Route = createFileRoute("/features")({
  head: () => ({
    meta: [
      { title: "Features built for traffic operations — TrafficVision AI" },
      { name: "description", content: "Sixteen modules covering monitoring, prediction, routing, alerts, heatmaps and analytics." },
      { property: "og:title", content: "Features built for traffic operations — TrafficVision AI" },
      { property: "og:description", content: "Sixteen modules covering monitoring, prediction, routing, alerts, heatmaps and analytics." },
    ],
  }),
  component: Page,
});

const items = [
  {
    "title": "AI traffic prediction",
    "desc": "Congestion forecast 15-120 minutes ahead with confidence scoring."
  },
  {
    "title": "Real-time monitoring",
    "desc": "Vehicle counts, occupancy and speed from every connected camera."
  },
  {
    "title": "Route optimization",
    "desc": "Fastest, safest and least congested alternatives, recomputed live."
  },
  {
    "title": "Smart alerts",
    "desc": "Accidents, closures, floods, weather and emergency vehicle priority."
  },
  {
    "title": "Analytics & heatmaps",
    "desc": "Hourly to yearly analysis with density and incident heatmaps."
  },
  {
    "title": "Role based access",
    "desc": "Admin, operator, analyst and viewer roles with audit logging."
  }
];

function Page() {
  return (
    <MarketingPage eyebrow="Platform" title="Features built for traffic operations" intro="Sixteen modules covering monitoring, prediction, routing, alerts, heatmaps and analytics.">
      <InfoGrid items={items} />
    </MarketingPage>
  );
}
