import { trafficQueryOptions } from "@/lib/use-traffic";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { DashboardShell } from "@/components/layout/DashboardShell";

export const Route = createFileRoute("/dashboard")({
  // Supabase keeps the session in localStorage, so the gate runs client-side only.
  ssr: false,
  beforeLoad: async () => {
    const { supabase } = await import("@/integrations/supabase/client");
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/auth" });
    return { user: data.user };
  },
  head: () => ({
    meta: [
      { title: "Control Centre — TrafficVision AI" },
      { name: "description", content: "Live traffic operations console: monitoring, prediction, routing, alerts and analytics." },
      { property: "og:title", content: "TrafficVision AI Control Centre" },
      { property: "og:description", content: "Live traffic operations console for smart city traffic management." },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(trafficQueryOptions),
  component: DashboardShell,
});
