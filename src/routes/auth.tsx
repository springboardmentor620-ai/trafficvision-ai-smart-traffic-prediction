import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Loader2, Radar, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { passwordIssues } from "@/lib/auth-rules";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — TrafficVision AI" },
      { name: "description", content: "Secure JWT authentication for admins and traffic operators on TrafficVision AI." },
      { property: "og:title", content: "Sign in — TrafficVision AI" },
      { property: "og:description", content: "Role based access for city traffic operations teams." },
    ],
  }),
  component: Auth,
});

const modes = ["Login", "Register", "Forgot password"] as const;

function Auth() {
  const [mode, setMode] = useState<(typeof modes)[number]>("Login");
  const [fullName, setFullName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  const issues = passwordIssues(password);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;

    const normalisedEmail = email.trim().toLowerCase();
    if (!normalisedEmail.endsWith("@gmail.com")) {
      toast.error("Only Gmail addresses are accepted", { description: "Use an @gmail.com email to continue." });
      return;
    }

    setBusy(true);
    try {
      if (mode === "Forgot password") {
        const { error } = await supabase.auth.resetPasswordForEmail(normalisedEmail, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
        toast.success("Reset link sent", { description: "Check your Gmail inbox for the secure reset link." });
        setMode("Login");
        return;
      }

      if (mode === "Register") {
        if (issues.length) {
          toast.error("Password too weak", { description: issues[0] });
          return;
        }
        const { error } = await supabase.auth.signUp({
          email: normalisedEmail,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/dashboard`,
            data: { full_name: fullName.trim(), mobile: mobile.trim() },
          },
        });
        if (error) throw error;
        toast.success("Account created", {
          description: "Confirm your email using the link we just sent, then sign in.",
        });
        setMode("Login");
        setPassword("");
        return;
      }

      const { error } = await supabase.auth.signInWithPassword({ email: normalisedEmail, password });
      if (error) throw error;
      if (!remember) sessionStorage.setItem("tv-session-only", "1");
      toast.success("Welcome back");
      navigate({ to: "/dashboard" });
    } catch (error) {
      toast.error("Authentication failed", {
        description: error instanceof Error ? error.message : "Please try again.",
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="relative grid min-h-screen lg:grid-cols-2">
      <div className="bg-brand relative hidden flex-col justify-between p-12 text-primary-foreground lg:flex">
        <div className="pointer-events-none absolute inset-0 grid-lines opacity-25" />
        <Link to="/" className="relative flex items-center gap-2.5 font-display text-lg font-extrabold">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary-foreground/15"><Radar className="h-5 w-5" /></span>
          TrafficVision AI
        </Link>
        <div className="relative">
          <h1 className="font-display text-4xl font-extrabold leading-tight">
            One control plane for your entire road network
          </h1>
          <p className="mt-4 max-w-md text-sm opacity-90">
            Live monitoring, AI congestion forecasting, smart routing and analytics — secured with JWT and
            role based access control.
          </p>
        </div>
        <p className="relative flex items-center gap-2 text-xs opacity-80">
          <ShieldCheck className="h-4 w-4" /> Bcrypt hashed credentials · encrypted at rest and in transit
        </p>
      </div>

      <div className="flex items-center justify-center px-4 py-12">
        <div className="glass w-full max-w-md rounded-3xl p-7">
          <div className="mb-6 flex flex-wrap gap-1.5">
            {modes.map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className={cn(
                  "rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
                  mode === m ? "bg-brand text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-accent",
                )}
              >
                {m}
              </button>
            ))}
          </div>

          <h2 className="font-display text-2xl font-extrabold">
            {mode === "Login" ? "Welcome back" : mode === "Register" ? "Create your account" : "Reset your password"}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {mode === "Forgot password"
              ? "We'll email you a secure reset link."
              : "Gmail accounts only. Access is granted through role based permissions."}
          </p>

          <form className="mt-5 space-y-3" onSubmit={onSubmit}>
            {mode === "Register" && (
              <>
                <div className="space-y-1.5">
                  <Label htmlFor="name">Full name</Label>
                  <Input id="name" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Ananya Rao" required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="mobile">Mobile number</Label>
                  <Input id="mobile" value={mobile} onChange={(e) => setMobile(e.target.value)} placeholder="+91 98450 12345" />
                </div>
              </>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="email">Gmail address</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@gmail.com"
                required
              />
            </div>
            {mode !== "Forgot password" && (
              <div className="space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
                {mode === "Register" && password.length > 0 && (
                  <ul className="mt-1 space-y-0.5 text-xs">
                    {issues.length === 0 ? (
                      <li className="text-success">Strong password</li>
                    ) : (
                      issues.map((i) => (
                        <li key={i} className="text-muted-foreground">
                          · {i}
                        </li>
                      ))
                    )}
                  </ul>
                )}
              </div>
            )}
            {mode === "Login" && (
              <label className="flex items-center gap-2 text-xs text-muted-foreground">
                <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
                Remember me on this device
              </label>
            )}
            <Button type="submit" disabled={busy} className="bg-brand w-full text-primary-foreground" size="lg">
              {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {mode === "Login" ? "Sign in" : mode === "Register" ? "Create account & verify email" : "Send reset link"}
            </Button>
          </form>

          <p className="mt-4 text-center text-xs text-muted-foreground">
            Passwords need 8+ characters with upper, lower, number and symbol.
          </p>
        </div>
      </div>
    </div>
  );
}
