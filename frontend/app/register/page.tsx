"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import * as api from "@/lib/api";
import { ApiError } from "@/lib/api";

const ROLES: { value: "admin" | "traffic_operator" | "public"; label: string; hint: string }[] = [
  { value: "admin", label: "Admin", hint: "Full access, manages users and roads" },
  { value: "traffic_operator", label: "Traffic operator", hint: "Monitors traffic, submits readings" },
  { value: "public", label: "Public / commuter", hint: "Views live traffic only" },
];

export default function RegisterPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"admin" | "traffic_operator" | "public">("public");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await api.register({ full_name: fullName, email, password, role });
      setSuccess(true);
      setTimeout(() => router.push("/login"), 1200);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Could not reach the server. Is the backend running on port 8000?");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-base px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="font-display text-xl font-medium text-ink">
            TrafficVision<span className="text-flow">AI</span>
          </h1>
          <p className="text-muted text-sm mt-1">Create an account</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-surface border border-border rounded-xl p-6 shadow-panel flex flex-col gap-4"
        >
          <div>
            <label htmlFor="fullName" className="block text-sm text-muted mb-1.5">Full name</label>
            <input
              id="fullName"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Angad Divya Valli"
              className="w-full bg-surface2 border border-border rounded-md px-3 py-2 text-sm text-ink placeholder:text-muted outline-none focus:border-signal"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm text-muted mb-1.5">Email address</label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full bg-surface2 border border-border rounded-md px-3 py-2 text-sm text-ink placeholder:text-muted outline-none focus:border-signal"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm text-muted mb-1.5">Password</label>
            <input
              id="password"
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              className="w-full bg-surface2 border border-border rounded-md px-3 py-2 text-sm text-ink placeholder:text-muted outline-none focus:border-signal"
            />
          </div>

          <div>
            <label className="block text-sm text-muted mb-1.5">Role</label>
            <div className="flex flex-col gap-2">
              {ROLES.map((r) => (
                <label
                  key={r.value}
                  className={`flex items-start gap-2 rounded-md border px-3 py-2 cursor-pointer transition-colors ${
                    role === r.value ? "border-signal bg-signal/10" : "border-border bg-surface2"
                  }`}
                >
                  <input
                    type="radio"
                    name="role"
                    value={r.value}
                    checked={role === r.value}
                    onChange={() => setRole(r.value)}
                    className="mt-1"
                  />
                  <span>
                    <span className="block text-sm text-ink">{r.label}</span>
                    <span className="block text-xs text-muted">{r.hint}</span>
                  </span>
                </label>
              ))}
            </div>
          </div>

          {error && (
            <p role="alert" className="text-sm text-congest bg-congest/10 border border-congest/30 rounded-md px-3 py-2">
              {error}
            </p>
          )}
          {success && (
            <p className="text-sm text-flow bg-flow/10 border border-flow/30 rounded-md px-3 py-2">
              Account created! Redirecting to login...
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-2 bg-signal hover:bg-signal/90 disabled:opacity-60 text-white text-sm font-medium rounded-md py-2.5 transition-colors"
          >
            {isSubmitting ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="text-center text-xs text-muted mt-6">
          Already have an account?{" "}
          <Link href="/login" className="text-signal hover:underline">Log in</Link>
        </p>
      </div>
    </div>
  );
}
