import type { ReactNode } from "react";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";

export function MarketingPage({
  eyebrow,
  title,
  intro,
  children,
}: {
  eyebrow: string;
  title: string;
  intro: string;
  children?: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <section className="relative overflow-hidden border-b">
        <div className="grid-lines pointer-events-none absolute inset-0 opacity-60" />
        <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-violet/20 blur-3xl" />
        <div className="relative mx-auto max-w-4xl px-4 py-16 text-center sm:px-6">
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary">{eyebrow}</span>
          <h1 className="mt-3 font-display text-4xl font-extrabold sm:text-5xl">{title}</h1>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">{intro}</p>
        </div>
      </section>
      <main className="mx-auto max-w-6xl space-y-6 px-4 py-14 sm:px-6">{children}</main>
      <SiteFooter />
    </div>
  );
}

export function InfoGrid({ items }: { items: { title: string; desc: string }[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {items.map((i) => (
        <article key={i.title} className="glass card-hover rounded-2xl p-5">
          <h2 className="font-display text-base font-bold">{i.title}</h2>
          <p className="mt-1.5 text-sm text-muted-foreground">{i.desc}</p>
        </article>
      ))}
    </div>
  );
}
