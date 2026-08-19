"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
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
  Menu,
  X,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/live-map", label: "Live map", icon: Map },
  { href: "/dashboard/monitoring", label: "Traffic monitoring", icon: Activity },
  {
    href: "/dashboard/prediction",
    label: "Traffic prediction",
    icon: TrendingUp,
  },
  { href: "/dashboard/routes", label: "Route analysis", icon: Route },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
  {
    href: "/dashboard/ai-recommendations",
    label: "AI Recommendations",
    icon: Sparkles,
  },
  { href: "/dashboard/alerts", label: "Alerts", icon: Bell },
  {
    href: "/dashboard/users",
    label: "User management",
    icon: Users,
    adminOnly: true,
  },
];

export function Sidebar({ role }: { role?: string }) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const filteredItems = NAV_ITEMS.filter(
    (item) => !item.adminOnly || role === "admin"
  );

  return (
    <>
      {/* Mobile menu button */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label="Open navigation menu"
        className="fixed left-3 top-3 z-50 flex h-10 w-10 items-center justify-center rounded-md border border-border bg-surface text-ink shadow-panel md:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Mobile overlay */}
      {isOpen && (
        <button
          type="button"
          aria-label="Close navigation menu"
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50
          w-64 shrink-0
          border-r border-border
          bg-surface
          flex flex-col gap-1
          p-3
          transform transition-transform duration-200
          md:static md:translate-x-0
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Mobile close button */}
        <div className="mb-3 flex items-center justify-between md:hidden">
          <span className="px-3 text-sm font-medium text-ink">
            Navigation
          </span>

          <button
            type="button"
            onClick={() => setIsOpen(false)}
            aria-label="Close navigation menu"
            className="rounded-md p-2 text-muted hover:bg-surface2 hover:text-ink"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {filteredItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsOpen(false)}
              className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors ${
                isActive
                  ? "bg-signal/15 text-ink font-medium"
                  : "text-muted hover:bg-surface2 hover:text-ink"
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </aside>
    </>
  );
}