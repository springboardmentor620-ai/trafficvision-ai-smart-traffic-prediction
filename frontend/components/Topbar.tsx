"use client";

import { Bell, Search, LogOut } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

export function Topbar() {
  const { user, logout } = useAuth();

  return (
    <header className="h-14 shrink-0 border-b border-border bg-surface flex items-center gap-4 px-4">
      <span className="font-display font-medium text-sm tracking-wide text-ink shrink-0">
        TrafficVision<span className="text-flow">AI</span>
      </span>

      <div className="flex-1 flex items-center gap-2 max-w-md bg-surface2 rounded-md px-3 py-1.5">
        <Search className="w-4 h-4 text-muted" />
        <input
          type="text"
          placeholder="Search road, zone, or vehicle ID"
          className="bg-transparent text-sm text-ink placeholder:text-muted outline-none flex-1"
        />
      </div>

      <button
        aria-label="Notifications"
        className="relative p-2 rounded-md hover:bg-surface2 text-muted hover:text-ink"
      >
        <Bell className="w-4 h-4" />
        <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-congest" />
      </button>

      <div className="flex items-center gap-2 pl-2 border-l border-border">
        <div className="text-right leading-tight">
          <div className="text-sm text-ink">{user?.full_name ?? "..."}</div>
          <div className="text-xs text-muted capitalize">{user?.role?.replace("_", " ") ?? ""}</div>
        </div>
        <button
          onClick={logout}
          aria-label="Log out"
          className="p-2 rounded-md hover:bg-surface2 text-muted hover:text-congest"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
