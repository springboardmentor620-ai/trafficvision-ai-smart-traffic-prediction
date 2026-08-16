import { createFileRoute } from "@tanstack/react-router";
import { MarketingPage, InfoGrid } from "@/components/layout/MarketingPage";

export const Route = createFileRoute("/technology")({
  head: () => ({
    meta: [
      { title: "A modern, containerised stack — TrafficVision AI" },
      { name: "description", content: "FastAPI services, PostgreSQL and MongoDB storage, TensorFlow models and a React front end." },
      { property: "og:title", content: "A modern, containerised stack — TrafficVision AI" },
      { property: "og:description", content: "FastAPI services, PostgreSQL and MongoDB storage, TensorFlow models and a React front end." },
    ],
  }),
  component: Page,
});

const items = [
  {
    "title": "Backend",
    "desc": "FastAPI async REST APIs with JWT authentication and role based permissions."
  },
  {
    "title": "Databases",
    "desc": "PostgreSQL for relational traffic entities, MongoDB for high-volume telemetry."
  },
  {
    "title": "AI & ML",
    "desc": "TensorFlow and Scikit-learn pipelines with Pandas/NumPy feature engineering."
  },
  {
    "title": "Maps",
    "desc": "Google Maps and OpenStreetMap layers with live traffic overlays."
  },
  {
    "title": "Frontend",
    "desc": "React, TanStack Router, TailwindCSS and Recharts visualisations."
  },
  {
    "title": "DevOps",
    "desc": "Docker Compose locally, AWS or Azure in production with env-based config."
  }
];

function Page() {
  return (
    <MarketingPage eyebrow="Architecture" title="A modern, containerised stack" intro="FastAPI services, PostgreSQL and MongoDB storage, TensorFlow models and a React front end.">
      <InfoGrid items={items} />
    </MarketingPage>
  );
}
