import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Loader2, KeyRound } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { passwordIssues } from "@/lib/auth-rules";

export const Route = createFileRoute("/reset-password")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Reset password — TrafficVision AI" },
      { name: "description", content: "Set a new password for your TrafficVision AI traffic operations account." },
      { property: "og:title", content: "Reset password — TrafficVision AI" },
      { property: "og:description", content: "Securely choose a new password for your control centre account." },
    ],
  }),
  component: ResetPassword,
});

function ResetPassword() {
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  const issues = passwordIssues(password);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (issues.length) {
      toast.error("Password too weak", { description: issues[0] });
      return;
    }
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (error) {
      toast.error("Could not update password", { description: error.message });
      return;
    }
    toast.success("Password updated");
    navigate({ to: "/dashboard" });
  }

  return (
    <div className="grid min-h-screen place-items-center px-4">
      <div className="glass w-full max-w-md rounded-3xl p-7">
        <span className="bg-brand grid h-11 w-11 place-items-center rounded-2xl text-primary-foreground">
          <KeyRound className="h-5 w-5" />
        </span>
        <h1 className="mt-4 font-display text-2xl font-extrabold">Choose a new password</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Your reset link is verified. Set a strong password to regain access to the control centre.
        </p>
        <form className="mt-5 space-y-3" onSubmit={onSubmit}>
          <div className="space-y-1.5">
            <Label htmlFor="new-password">New password</Label>
            <Input
              id="new-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
            {password.length > 0 && (
              <ul className="mt-1 space-y-0.5 text-xs">
                {issues.length === 0 ? (
                  <li className="text-success">Strong password</li>
                ) : (
                  issues.map((i: string) => (
                    <li key={i} className="text-muted-foreground">
                      · {i}
                    </li>
                  ))
                )}
              </ul>
            )}
          </div>
          <Button type="submit" disabled={busy} size="lg" className="bg-brand w-full text-primary-foreground">
            {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Update password
          </Button>
        </form>
      </div>
    </div>
  );
}
