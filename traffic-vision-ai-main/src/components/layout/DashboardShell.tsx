import { Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Activity, AlertTriangle, BarChart3, Bell, Bot, Brain, ChevronLeft, LayoutDashboard, LogOut,
  Menu, Moon, Search, Settings, Shield, Sun, User, Users, Waves, FileText, Route as RouteIcon, X,
} from "lucide-react";
import { Logo } from "@/components/tv/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTraffic } from "@/lib/use-traffic";
import { cn } from "@/lib/utils";

const nav = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, exact: true as boolean | undefined },
  { to: "/dashboard/monitoring", label: "Traffic monitoring", icon: Activity },
  { to: "/dashboard/prediction", label: "Traffic prediction", icon: Brain },
  { to: "/dashboard/routes", label: "Route optimization", icon: RouteIcon },
  { to: "/dashboard/alerts", label: "Alerts", icon: AlertTriangle },
  { to: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/dashboard/heatmaps", label: "Heatmaps", icon: Waves },
  { to: "/dashboard/reports", label: "Reports", icon: FileText },
  { to: "/dashboard/ai-insights", label: "AI insights", icon: Bot },
  { to: "/dashboard/users", label: "User management", icon: Users },
  { to: "/dashboard/admin", label: "Admin panel", icon: Shield },
  { to: "/dashboard/settings", label: "Settings", icon: Settings },
  { to: "/dashboard/profile", label: "Profile", icon: User },
] as const;

export function DashboardShell() {
  const { alerts } = useTraffic();
  const queryClient = useQueryClient();

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  const [mobileOpen, setMobileOpen] = useState(false);
  const [dark, setDark] = useState(false);
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const activeAlerts = alerts.filter((a) => a.status === "Active").length;

  const sidebar = (
    <div className="flex h-full flex-col gap-2 bg-sidebar p-3">
      <div className="flex items-center justify-between px-1 py-2">
        <Logo />
        <button className="lg:hidden" onClick={() => setMobileOpen(false)} aria-label="Close menu">
          <X className="h-5 w-5" />
        </button>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto">
        {nav.map((item) => {
          const active = "exact" in item && item.exact ? pathname === item.to : pathname.startsWith(item.to);
          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors",
                active
                  ? "bg-brand text-primary-foreground shadow-[var(--shadow-soft)]"
                  : "text-sidebar-foreground hover:bg-sidebar-accent",
              )}
            >
              <item.icon className="h-4.5 w-4.5 shrink-0" style={{ width: 18, height: 18 }} />
              <span className="truncate">{item.label}</span>
              {item.label === "Alerts" && activeAlerts > 0 && (
                <span className="ml-auto rounded-full bg-destructive px-1.5 py-0.5 text-[10px] font-bold text-destructive-foreground">
                  {activeAlerts}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
      <button
        type="button"
        onClick={signOut}
        className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-muted-foreground transition-colors hover:bg-sidebar-accent"
      >
        <LogOut style={{ width: 18, height: 18 }} /> Logout
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r lg:block">{sidebar}</aside>
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-foreground/30 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-72 border-r shadow-xl">{sidebar}</aside>
        </div>
      )}

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 border-b border-border/60 bg-background/75 backdrop-blur-xl">
          <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 px-3 py-3 sm:px-5">
            <button
              className="grid h-10 w-10 place-items-center rounded-xl border lg:hidden"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="relative hidden min-w-0 sm:block">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search roads, cameras, alerts, users…  (⌘K)" className="max-w-md pl-9" />
            </div>
            <div className="hidden sm:hidden" />
            <div className="flex shrink-0 items-center gap-2">
              <Badge variant="outline" className="hidden gap-1.5 md:inline-flex">
                <span className="h-2 w-2 animate-pulse rounded-full bg-success" /> Live
              </Badge>
              <Button variant="ghost" size="icon" onClick={() => setDark((v) => !v)} aria-label="Toggle theme">
                {dark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>
              <Button variant="ghost" size="icon" className="relative" onClick={() => navigate({ to: "/dashboard/alerts" })} aria-label="Notifications">
                <Bell className="h-5 w-5" />
                <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-destructive" />
              </Button>
              <Link to="/dashboard/profile" className="bg-brand grid h-9 w-9 place-items-center rounded-full text-sm font-bold text-primary-foreground">
                AR
              </Link>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-[1500px] space-y-6 px-3 py-6 sm:px-5">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export function BackToDashboard() {
  return (
    <Link to="/dashboard" className="inline-flex items-center gap-1 text-sm font-semibold text-primary">
      <ChevronLeft className="h-4 w-4" /> Back to dashboard
    </Link>
  );
}
