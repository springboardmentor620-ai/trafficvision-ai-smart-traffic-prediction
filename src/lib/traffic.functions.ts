import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { roleLabel } from "./roles";

/** Public read of the whole live traffic bundle (PostgreSQL + Random Forest). */
export const getTrafficBundle = createServerFn({ method: "GET" }).handler(async () => {
  const { buildBundle } = await import("./traffic.server");
  return await buildBundle();
});

const predictInput = z.object({
  roadCode: z.string().min(1).max(40).optional(),
  sourceArea: z.string().trim().min(1).max(120),
  destinationArea: z.string().trim().min(1).max(120),
  hour: z.number().int().min(0).max(23),
  dayOfWeek: z.number().int().min(0).max(6),
  isHoliday: z.boolean().default(false),
  weather: z.string().max(40).default("Clear"),
  rain: z.number().min(0).max(200).default(0),
  temp: z.number().min(-10).max(60).default(26),
  vehicleType: z.string().max(40).default("Car"),
});

/** Random Forest inference for a corridor, persisted for the signed-in user. */
export const predictTraffic = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => predictInput.parse(data))
  .handler(async ({ data, context }) => {
    const { runPrediction } = await import("./traffic.server");
    const result = await runPrediction(data);

    await context.supabase.from("traffic_predictions").insert({
      user_id: context.userId,
      source_area: data.sourceArea,
      destination_area: data.destinationArea,
      inputs: data as never,
      traffic_density: result.trafficDensity,
      congestion_pct: result.congestionPct,
      travel_time_min: result.travelTimeMin,
      expected_delay_min: result.expectedDelayMin,
      vehicle_flow: result.vehicleFlow,
      category: result.category,
      confidence: result.confidence,
      explanation: result.explanation,
    });

    return result;
  });

/** Recent predictions made by the signed-in user. */
export const getMyPredictions = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase
      .from("traffic_predictions")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(25);
    return data ?? [];
  });

const routeInput = z.object({
  source: z.string().trim().min(1).max(120),
  destination: z.string().trim().min(1).max(120),
});

/** Route recommendation across the live corridor network. */
export const recommendRoutes = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => routeInput.parse(data))
  .handler(async ({ data, context }) => {
    const { buildRouteRecommendation } = await import("./traffic.server");
    const result = await buildRouteRecommendation(data.source, data.destination);

    await context.supabase.from("routes").insert({
      user_id: context.userId,
      source: data.source,
      destination: data.destination,
      options: result.options as never,
      recommended: result.recommended as never,
      reasoning: result.reasoning,
    });

    return result;
  });

/** Acknowledge or resolve an alert (admins and operators only, enforced by RLS). */
export const updateAlertStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z.object({ id: z.string().uuid(), status: z.enum(["Active", "Acknowledged", "Resolved"]) }).parse(data),
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("alerts").update({ status: data.status }).eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/** Profile, role, notifications, settings and activity for the signed-in user. */
export const getAccount = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const [profile, roles, notifications, settings, logs, reports] = await Promise.all([
      context.supabase.from("profiles").select("*").eq("id", context.userId).maybeSingle(),
      context.supabase.from("user_roles").select("role").eq("user_id", context.userId),
      context.supabase.from("notifications").select("*").order("created_at", { ascending: false }).limit(20),
      context.supabase.from("settings").select("*").eq("user_id", context.userId).maybeSingle(),
      context.supabase.from("logs").select("*").order("created_at", { ascending: false }).limit(20),
      context.supabase.from("reports").select("*").order("created_at", { ascending: false }).limit(20),
    ]);

    return {
      profile: profile.data,
      roles: (roles.data ?? []).map((r) => r.role),
      notifications: notifications.data ?? [],
      settings: settings.data,
      logs: logs.data ?? [],
      reports: reports.data ?? [],
      email: (context.claims as { email?: string } | null)?.email ?? profile.data?.email ?? "",
    };
  });

export const updateProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z
      .object({
        full_name: z.string().trim().max(120).optional(),
        mobile: z.string().trim().max(20).optional(),
        city: z.string().trim().max(80).optional(),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    const patch = Object.fromEntries(Object.entries(data).filter(([, v]) => v !== undefined));
    const { error } = await context.supabase.from("profiles").update(patch as never).eq("id", context.userId);
    if (error) throw new Error(error.message);
    await context.supabase.from("logs").insert({
      actor_id: context.userId,
      action: "Updated profile",
      target: "profiles",
    });
    return { ok: true };
  });

export const saveSettings = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({ preferences: z.record(z.string(), z.unknown()) }).parse(data))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("settings")
      .upsert({ user_id: context.userId, preferences: data.preferences as never }, { onConflict: "user_id" });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/** Generate and persist a report from live data. */
export const generateReport = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z
      .object({
        name: z.string().trim().min(1).max(120),
        kind: z.string().trim().min(1).max(40),
        period: z.string().trim().max(20).default("daily"),
        format: z.enum(["pdf", "csv", "excel"]).default("pdf"),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    const { buildReportPayload } = await import("./traffic.server");
    const payload = await buildReportPayload(data.kind);

    const { data: row, error } = await context.supabase
      .from("reports")
      .insert({
        user_id: context.userId,
        name: data.name,
        kind: data.kind,
        period: data.period,
        format: data.format,
        status: "ready",
        payload: payload as never,
      })
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

/** Directory of platform users + recent activity. Admins see everyone. */
export const getDirectory = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const fmt = (iso: string | null | undefined) =>
      iso ? new Date(iso).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }) : "Never";
    const ago = (iso: string) => {
      const mins = Math.max(1, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
      if (mins < 60) return `${mins} min ago`;
      if (mins < 1440) return `${Math.round(mins / 60)} h ago`;
      return `${Math.round(mins / 1440)} d ago`;
    };

    const { data: isAdmin } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });

    if (!isAdmin) {
      const [{ data: me }, { data: roles }, { data: logs }] = await Promise.all([
        context.supabase.from("profiles").select("*").eq("id", context.userId).maybeSingle(),
        context.supabase.from("user_roles").select("role").eq("user_id", context.userId),
        context.supabase.from("logs").select("*").order("created_at", { ascending: false }).limit(10),
      ]);
      return {
        isAdmin: false,
        users: me
          ? [
              {
                id: me.id,
                name: me.full_name || me.email,
                email: me.email,
                role: roleLabel(roles?.[0]?.role ?? "viewer"),
                status: "Active",
                lastLogin: fmt(me.updated_at),
                city: me.city,
              },
            ]
          : [],
        activityLogs: (logs ?? []).map((l) => ({
          id: l.id,
          actor: l.actor_name || "You",
          action: l.action,
          target: l.target,
          at: ago(l.created_at),
        })),
      };
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const [{ data: profiles }, { data: roles }, { data: logs }] = await Promise.all([
      supabaseAdmin.from("profiles").select("*").order("created_at", { ascending: false }),
      supabaseAdmin.from("user_roles").select("user_id, role"),
      supabaseAdmin.from("logs").select("*").order("created_at", { ascending: false }).limit(20),
    ]);
    const roleFor = new Map((roles ?? []).map((r) => [r.user_id, r.role]));

    return {
      isAdmin: true,
      users: (profiles ?? []).map((p) => ({
        id: p.id,
        name: p.full_name || p.email,
        email: p.email,
        role: roleLabel(roleFor.get(p.id) ?? "viewer"),
        status: "Active",
        lastLogin: fmt(p.updated_at),
        city: p.city,
      })),
      activityLogs: (logs ?? []).map((l) => ({
        id: l.id,
        actor: l.actor_name || "System",
        action: l.action,
        target: l.target,
        at: ago(l.created_at),
      })),
    };
  });
