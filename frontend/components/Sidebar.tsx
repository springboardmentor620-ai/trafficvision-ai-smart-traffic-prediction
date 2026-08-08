"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Map,
  Activity,
  Route,
  BarChart3,
  Bell,
  Users,
  TrendingUp,
  Sparkles,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/live-map", label: "Live map", icon: Map },
  { href: "/dashboard/monitoring", label: "Traffic monitoring", icon: Activity },
  { href: "/dashboard/prediction", label: "Traffic prediction", icon: TrendingUp },
  { href: "/dashboard/routes", label: "Route analysis", icon: Route },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
  {
  href: "/dashboard/ai-recommendations",
  label: "AI Recommendations",
  icon: Sparkles,
  },
  { href: "/dashboard/alerts", label: "Alerts", icon: Bell },
  { href: "/dashboard/users", label: "User management", icon: Users, adminOnly: true },
];

export function Sidebar({ role }: { role?: string }) {
  const pathname = usePathname();

  return (
    <aside className="w-56 shrink-0 border-r border-border bg-surface flex flex-col gap-1 p-3">
      {NAV_ITEMS.filter((item) => !item.adminOnly || role === "admin").map((item) => {
        const isActive = pathname === item.href;
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
              isActive
                ? "bg-signal/15 text-ink font-medium"
                : "text-muted hover:bg-surface2 hover:text-ink"
            }`}
          >
            <Icon className="w-4 h-4 shrink-0" />
            {item.label}
          </Link>
        );
      })}
    </aside>
  );
}
