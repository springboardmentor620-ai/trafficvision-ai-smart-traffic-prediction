import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { PageHeader, SectionCard } from "@/components/tv/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { passwordIssues } from "@/lib/auth-rules";
import { roleLabel } from "@/lib/roles";
import { updateProfile } from "@/lib/traffic.functions";
import { useAccount, useDirectory } from "@/lib/use-account";

export const Route = createFileRoute("/dashboard/profile")({ component: Profile });

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

function Profile() {
  const { activityLogs } = useDirectory();
  const account = useAccount();
  const queryClient = useQueryClient();

  const [form, setForm] = useState({
    full_name: account.profile?.full_name ?? "",
    mobile: account.profile?.mobile ?? "",
    city: account.profile?.city ?? "",
  });
  useEffect(() => {
    setForm({
      full_name: account.profile?.full_name ?? "",
      mobile: account.profile?.mobile ?? "",
      city: account.profile?.city ?? "",
    });
  }, [account.profile?.full_name, account.profile?.mobile, account.profile?.city]);

  const [pw, setPw] = useState({ next: "", confirm: "" });

  const save = useServerFn(updateProfile);
  const saveMutation = useMutation({
    mutationFn: () => save({ data: form }),
    onSuccess: () => {
      toast.success("Profile updated");
      void queryClient.invalidateQueries({ queryKey: ["account"] });
      void queryClient.invalidateQueries({ queryKey: ["directory"] });
    },
    onError: (e: Error) => toast.error("Could not save profile", { description: e.message }),
  });

  const passwordMutation = useMutation({
    mutationFn: async () => {
      const issues = passwordIssues(pw.next);
      if (issues.length) throw new Error(issues.join(", "));
      if (pw.next !== pw.confirm) throw new Error("Passwords do not match");
      const { error } = await supabase.auth.updateUser({ password: pw.next });
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      setPw({ next: "", confirm: "" });
      toast.success("Password updated");
    },
    onError: (e: Error) => toast.error("Could not update password", { description: e.message }),
  });

  const displayName = form.full_name || account.email || "Operator";

  return (
    <>
      <PageHeader title="Profile" subtitle="Account details, password and activity history" />

      <div className="grid gap-4 lg:grid-cols-[320px_minmax(0,1fr)]">
        <SectionCard title="Profile picture" description="Shown across the console">
          <div className="flex flex-col items-center gap-4 py-2">
            <span className="bg-brand grid h-24 w-24 place-items-center rounded-full font-display text-2xl font-extrabold text-primary-foreground">
              {initials(displayName) || "TV"}
            </span>
            <div className="text-center">
              <p className="font-display text-lg font-bold">{displayName}</p>
              <p className="text-sm text-muted-foreground">{account.email}</p>
              <Badge className="mt-2 bg-violet/10 text-violet">{roleLabel(account.roles[0] ?? "viewer")}</Badge>
            </div>
          </div>
        </SectionCard>

        <div className="space-y-4">
          <SectionCard
            title="Edit profile"
            description="Update your personal information"
            actions={
              <Button
                size="sm"
                className="bg-brand text-primary-foreground"
                disabled={saveMutation.isPending}
                onClick={() => saveMutation.mutate()}
              >
                {saveMutation.isPending ? "Saving…" : "Save"}
              </Button>
            }
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Full name">
                <Input value={form.full_name} onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))} />
              </Field>
              <Field label="Email">
                <Input value={account.email} readOnly />
              </Field>
              <Field label="Phone">
                <Input value={form.mobile} onChange={(e) => setForm((f) => ({ ...f, mobile: e.target.value }))} />
              </Field>
              <Field label="City">
                <Input value={form.city} onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))} />
              </Field>
            </div>
          </SectionCard>

          <SectionCard title="Change password" description="Use a strong, unique password">
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="New">
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={pw.next}
                  onChange={(e) => setPw((p) => ({ ...p, next: e.target.value }))}
                />
              </Field>
              <Field label="Confirm">
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={pw.confirm}
                  onChange={(e) => setPw((p) => ({ ...p, confirm: e.target.value }))}
                />
              </Field>
            </div>
            <Button
              className="mt-4 bg-brand text-primary-foreground"
              disabled={passwordMutation.isPending}
              onClick={() => passwordMutation.mutate()}
            >
              {passwordMutation.isPending ? "Updating…" : "Update password"}
            </Button>
          </SectionCard>

          <SectionCard title="Activity logs" description="Your recent actions">
            <ul className="space-y-2 text-sm">
              {activityLogs.slice(0, 6).map((l) => (
                <li key={l.id} className="glass-soft flex items-center justify-between gap-3 rounded-xl p-3">
                  <span className="min-w-0 truncate text-muted-foreground">{l.action} · {l.target}</span>
                  <span className="shrink-0 text-xs text-muted-foreground">{l.at}</span>
                </li>
              ))}
            </ul>
          </SectionCard>
        </div>
      </div>
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}
