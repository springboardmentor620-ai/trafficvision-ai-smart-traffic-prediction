"use client";

import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

export function DashboardShell({ children }: { children: ReactNode }) {
  const { user, token, isLoading } = useAuth();
  const router = useRouter();

  // Redirect to login if there's no valid session once the initial
  // session-restore check (isLoading) has finished.
  useEffect(() => {
    if (!isLoading && !token) {
      router.replace("/login");
    }
  }, [isLoading, token, router]);

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center text-muted text-sm">
        Loading your session...
      </div>
    );
  }

  if (!token) {
    return null; // redirect is in flight
  }

  return (
    <div className="h-screen flex flex-col">
      <Topbar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar role={user?.role} />
        <main className="flex-1 overflow-y-auto p-6 bg-base">{children}</main>
      </div>
    </div>
  );
}
