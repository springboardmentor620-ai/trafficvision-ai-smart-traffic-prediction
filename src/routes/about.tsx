import { createFileRoute } from "@tanstack/react-router";
import { MarketingPage, InfoGrid } from "@/components/layout/MarketingPage";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About TrafficVision AI — TrafficVision AI" },
      { name: "description", content: "We build decision-support software for city traffic authorities and urban mobility teams." },
      { property: "og:title", content: "About TrafficVision AI — TrafficVision AI" },
      { property: "og:description", content: "We build decision-support software for city traffic authorities and urban mobility teams." },
    ],
  }),
  component: Page,
});

const items = [
  {
    "title": "Mission",
    "desc": "Cut urban congestion using transparent, explainable AI forecasting."
  },
  {
    "title": "Who we serve",
    "desc": "Smart cities, traffic control departments, transport agencies and operators."
  },
  {
    "title": "Approach",
    "desc": "Modular, scalable architecture that plugs into existing camera and sensor estates."
  },
  {
    "title": "Impact",
    "desc": "Pilot corridors report up to 24% lower peak congestion and 9 fewer commute minutes."
  },
  {
    "title": "Security",
    "desc": "JWT sessions, audit logs, encrypted secrets and API key rotation."
  },
  {
    "title": "Roadmap",
    "desc": "Signal control automation, incident auto-dispatch and multi-city federation."
  }
];

function Page() {
  return (
    <MarketingPage eyebrow="Company" title="About TrafficVision AI" intro="We build decision-support software for city traffic authorities and urban mobility teams.">
      <InfoGrid items={items} />
    </MarketingPage>
  );
}
