import { Link } from "@tanstack/react-router";
import { Radar } from "lucide-react";

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link to="/" className="flex min-w-0 items-center gap-2.5">
      <span className="bg-brand grid h-9 w-9 shrink-0 place-items-center rounded-xl text-primary-foreground shadow-[var(--shadow-soft)]">
        <Radar className="h-5 w-5" />
      </span>
      {!compact && (
        <span className="truncate font-display text-lg font-extrabold tracking-tight">
          Traffic<span className="text-gradient">Vision</span> AI
        </span>
      )}
    </Link>
  );
}
