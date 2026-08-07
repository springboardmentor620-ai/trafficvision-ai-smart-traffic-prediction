import { createFileRoute } from "@tanstack/react-router";
import { MarketingPage, InfoGrid } from "@/components/layout/MarketingPage";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Talk to our team — TrafficVision AI" },
      { name: "description", content: "Tell us about your network and we will map out a deployment plan." },
      { property: "og:title", content: "Talk to our team — TrafficVision AI" },
      { property: "og:description", content: "Tell us about your network and we will map out a deployment plan." },
    ],
  }),
  component: Page,
});

const items = [
  {
    "title": "Sales",
    "desc": "sales@trafficvision.ai \u00b7 Mon\u2013Fri, 09:00\u201318:00 IST."
  },
  {
    "title": "Support",
    "desc": "support@trafficvision.ai \u00b7 24/7 for production incidents."
  },
  {
    "title": "Partnerships",
    "desc": "partners@trafficvision.ai for integrators and OEMs."
  },
  {
    "title": "Offices",
    "desc": "Bengaluru \u00b7 Mumbai \u00b7 Singapore."
  },
  {
    "title": "Phone",
    "desc": "+91 80 4000 1200"
  },
  {
    "title": "Response time",
    "desc": "We reply to every enquiry within one business day."
  }
];

function Page() {
  return (
    <MarketingPage eyebrow="Contact" title="Talk to our team" intro="Tell us about your network and we will map out a deployment plan.">
      <InfoGrid items={items} />
    </MarketingPage>
  );
}
