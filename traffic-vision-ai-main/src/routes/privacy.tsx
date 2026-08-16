import { createFileRoute } from "@tanstack/react-router";
import { MarketingPage, InfoGrid } from "@/components/layout/MarketingPage";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy policy — TrafficVision AI" },
      { name: "description", content: "How TrafficVision AI collects, processes and protects traffic and account data." },
      { property: "og:title", content: "Privacy policy — TrafficVision AI" },
      { property: "og:description", content: "How TrafficVision AI collects, processes and protects traffic and account data." },
    ],
  }),
  component: Page,
});

const items = [
  {
    "title": "Data we collect",
    "desc": "Account details, workspace configuration and aggregated traffic telemetry."
  },
  {
    "title": "Video handling",
    "desc": "Camera frames are processed for counts and discarded; no faces or plates stored."
  },
  {
    "title": "Retention",
    "desc": "Aggregated traffic metrics retained 24 months; audit logs 12 months."
  },
  {
    "title": "Sub-processors",
    "desc": "Cloud hosting and notification providers under data processing agreements."
  },
  {
    "title": "Your rights",
    "desc": "Access, correction, export and deletion requests handled within 30 days."
  },
  {
    "title": "Contact",
    "desc": "privacy@trafficvision.ai for any data protection question."
  }
];

function Page() {
  return (
    <MarketingPage eyebrow="Legal" title="Privacy policy" intro="How TrafficVision AI collects, processes and protects traffic and account data.">
      <InfoGrid items={items} />
    </MarketingPage>
  );
}
