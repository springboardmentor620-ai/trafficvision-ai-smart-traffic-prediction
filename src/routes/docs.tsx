import { createFileRoute } from "@tanstack/react-router";
import { MarketingPage, InfoGrid } from "@/components/layout/MarketingPage";

export const Route = createFileRoute("/docs")({
  head: () => ({
    meta: [
      { title: "Documentation & API — TrafficVision AI" },
      { name: "description", content: "REST endpoints, authentication and integration guides for the platform." },
      { property: "og:title", content: "Documentation & API — TrafficVision AI" },
      { property: "og:description", content: "REST endpoints, authentication and integration guides for the platform." },
    ],
  }),
  component: Page,
});

const items = [
  {
    "title": "Authentication",
    "desc": "POST /api/auth/login, /register, /refresh \u2014 JWT bearer tokens."
  },
  {
    "title": "Traffic monitoring",
    "desc": "GET /api/traffic/roads, /cameras, /flow with city and area filters."
  },
  {
    "title": "Predictions",
    "desc": "GET /api/predictions?road_id= returns forecast, confidence and risk."
  },
  {
    "title": "Routes",
    "desc": "POST /api/routes/optimize with source and destination coordinates."
  },
  {
    "title": "Alerts",
    "desc": "GET/POST /api/alerts plus webhooks for external notification systems."
  },
  {
    "title": "Analytics & reports",
    "desc": "GET /api/analytics/{scope} and POST /api/reports/generate."
  }
];

function Page() {
  return (
    <MarketingPage eyebrow="Developers" title="Documentation & API" intro="REST endpoints, authentication and integration guides for the platform.">
      <InfoGrid items={items} />
    </MarketingPage>
  );
}
