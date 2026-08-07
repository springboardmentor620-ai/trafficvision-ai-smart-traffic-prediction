import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/** Autocomplete over every location in the Bengaluru routes dataset. */
export const searchPlaces = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) =>
    z.object({ q: z.string().trim().max(120), limit: z.number().int().min(1).max(12).default(8) }).parse(data),
  )
  .handler(async ({ data }) => {
    const { searchPlaces: search } = await import("./route-planner.server");
    return await search(data.q, data.limit);
  });

const planInput = z.object({
  source: z.string().trim().min(2).max(160),
  destination: z.string().trim().min(2).max(160),
  hour: z.number().int().min(0).max(23).optional(),
  dayOfWeek: z.number().int().min(0).max(6).optional(),
  weather: z.enum(["Clear", "Cloudy", "Rainy", "Foggy"]).optional(),
});

/** Google-Maps-style route recommendation computed from the dataset + Random Forest. */
export const planRoute = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => planInput.parse(data))
  .handler(async ({ data, context }) => {
    const { planRoutes } = await import("./route-planner.server");
    const plan = await planRoutes(data);

    const recommended = plan.options.find((o) => o.id === plan.recommendedId) ?? plan.options[0];
    await context.supabase.from("routes").insert({
      user_id: context.userId,
      source: plan.source.name,
      destination: plan.destination.name,
      options: plan.options as never,
      recommended: recommended as never,
      reasoning: plan.reasoning,
    });
    await context.supabase.from("logs").insert({
      actor_id: context.userId,
      action: `Planned route ${plan.source.name} → ${plan.destination.name}`,
      target: "routes",
    });

    return plan;
  });

/** Recent route searches made by the signed-in user. */
export const getMyRoutes = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase
      .from("routes")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(10);
    return data ?? [];
  });
