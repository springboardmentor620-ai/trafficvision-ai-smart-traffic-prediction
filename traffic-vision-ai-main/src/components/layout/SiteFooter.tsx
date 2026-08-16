import { Link } from "@tanstack/react-router";
import { Logo } from "@/components/tv/Logo";

const groups = [
  {
    title: "Product",
    items: [
      { label: "Features", to: "/features" as const },
      { label: "How it works", to: "/how-it-works" as const },
      { label: "Technology", to: "/technology" as const },
      { label: "Live dashboard", to: "/dashboard" as const },
    ],
  },
  {
    title: "Developers",
    items: [
      { label: "Documentation", to: "/docs" as const },
      { label: "API reference", to: "/docs" as const },
      { label: "GitHub", to: "/docs" as const },
      { label: "Status", to: "/docs" as const },
    ],
  },
  {
    title: "Company",
    items: [
      { label: "About", to: "/about" as const },
      { label: "Contact", to: "/contact" as const },
      { label: "Privacy", to: "/privacy" as const },
      { label: "Terms", to: "/terms" as const },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t bg-card/60">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div className="min-w-0">
          <Logo />
          <p className="mt-4 max-w-sm text-sm text-muted-foreground">
            AI powered smart traffic prediction and congestion management for modern cities — monitoring,
            forecasting, routing and analytics in one control plane.
          </p>
        </div>
        {groups.map((g) => (
          <div key={g.title}>
            <h3 className="font-display text-sm font-bold">{g.title}</h3>
            <ul className="mt-3 space-y-2">
              {g.items.map((i) => (
                <li key={i.label}>
                  <Link to={i.to} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                    {i.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t px-4 py-5 text-center text-xs text-muted-foreground sm:px-6">
        © 2026 TrafficVision AI · Built for smart city traffic operations
      </div>
    </footer>
  );
}
