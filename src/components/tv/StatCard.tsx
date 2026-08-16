import type { LucideIcon } from "lucide-react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { AnimatedCounter } from "./AnimatedCounter";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  suffix,
  prefix,
  decimals,
  delta,
  icon: Icon,
  tone = "primary",
  hint,
  className,
}: {
  label: string;
  value: number;
  suffix?: string;
  prefix?: string;
  decimals?: number;
  delta?: number;
  icon: LucideIcon;
  tone?: "primary" | "violet" | "cyan" | "success" | "warning" | "destructive";
  hint?: string;
  className?: string;
}) {
  const toneMap: Record<string, string> = {
    primary: "bg-primary/10 text-primary",
    violet: "bg-violet/10 text-violet",
    cyan: "bg-cyan/15 text-cyan",
    success: "bg-success/10 text-success",
    warning: "bg-warning/20 text-warning",
    destructive: "bg-destructive/10 text-destructive",
  };

  return (
    <div className={cn("glass card-hover rounded-2xl p-4", className)}>
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
        <div className="min-w-0">
          <p className="truncate text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {label}
          </p>
          <p className="mt-2 font-display text-2xl font-extrabold">
            <AnimatedCounter value={value} suffix={suffix} prefix={prefix} decimals={decimals} />
          </p>
        </div>
        <span className={cn("grid h-10 w-10 shrink-0 place-items-center rounded-xl", toneMap[tone])}>
          <Icon className="h-5 w-5" />
        </span>
      </div>
      <div className="mt-3 flex items-center gap-2 text-xs">
        {delta !== undefined && (
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-semibold",
              delta >= 0 ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive",
            )}
          >
            {delta >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
            {Math.abs(delta)}%
          </span>
        )}
        {hint && <span className="truncate text-muted-foreground">{hint}</span>}
      </div>
    </div>
  );
}
