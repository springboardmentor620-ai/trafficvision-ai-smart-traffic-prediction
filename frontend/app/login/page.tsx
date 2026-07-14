"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { ApiError } from "@/lib/api";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await login(email, password);
      router.push("/dashboard");
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.status === 401 ? "Incorrect email or password" : err.message);
      } else {
        setError("Could not reach the server. Is the backend running?");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-base px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="font-display text-xl font-medium text-ink">
            TrafficVision<span className="text-flow">AI</span>
          </h1>
          <p className="text-muted text-sm mt-1">Smart traffic prediction & congestion management</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-surface border border-border rounded-xl p-6 shadow-panel flex flex-col gap-4"
        >
          <div>
            <label htmlFor="email" className="block text-sm text-muted mb-1.5">
              Email address
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@cityauthority.gov"
              className="w-full bg-surface2 border border-border rounded-md px-3 py-2 text-sm text-ink placeholder:text-muted outline-none focus:border-signal"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm text-muted mb-1.5">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-surface2 border border-border rounded-md px-3 py-2 text-sm text-ink placeholder:text-muted outline-none focus:border-signal"
            />
          </div>

          {error && (
            <p role="alert" className="text-sm text-congest bg-congest/10 border border-congest/30 rounded-md px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-2 bg-signal hover:bg-signal/90 disabled:opacity-60 text-white text-sm font-medium rounded-md py-2.5 transition-colors"
          >
            {isSubmitting ? "Logging in..." : "Log in"}
          </button>
        </form>

        <p className="text-center text-xs text-muted mt-6">
          Don&apos;t have an account?{" "}
          <a href="/register" className="text-signal hover:underline">Register here</a>
        </p>
        <p className="text-center text-xs text-muted mt-2">
          Access is provisioned by your traffic authority admin.
        </p>
      </div>
    </div>
  );
}
