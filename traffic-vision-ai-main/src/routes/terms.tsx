import { createFileRoute } from "@tanstack/react-router";
import { MarketingPage, InfoGrid } from "@/components/layout/MarketingPage";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of service — TrafficVision AI" },
      { name: "description", content: "The agreement governing use of the TrafficVision AI platform." },
      { property: "og:title", content: "Terms of service — TrafficVision AI" },
      { property: "og:description", content: "The agreement governing use of the TrafficVision AI platform." },
    ],
  }),
  component: Page,
});

const items = [
  {
    "title": "Licence",
    "desc": "A non-exclusive right to use the platform for your authorised traffic operations."
  },
  {
    "title": "Acceptable use",
    "desc": "No reverse engineering, resale or use that endangers public safety."
  },
  {
    "title": "Availability",
    "desc": "99.9% monthly uptime target for production workspaces."
  },
  {
    "title": "Support",
    "desc": "Standard support included; 24/7 incident response on enterprise plans."
  },
  {
    "title": "Liability",
    "desc": "Insights are decision support \u2014 operators remain responsible for actions taken."
  },
  {
    "title": "Changes",
    "desc": "Material changes to these terms are announced 30 days in advance."
  }
];

function Page() {
  return (
    <MarketingPage eyebrow="Legal" title="Terms of service" intro="The agreement governing use of the TrafficVision AI platform.">
      <InfoGrid items={items} />
    </MarketingPage>
  );
}
