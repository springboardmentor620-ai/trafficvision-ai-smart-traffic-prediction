import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/tv/Logo";
import { Button } from "@/components/ui/button";

const links = [
  { to: "/features", label: "Features" },
  { to: "/how-it-works", label: "How it works" },
  { to: "/technology", label: "Technology" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto grid max-w-7xl grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-4 py-3 sm:px-6">
        <div className="flex min-w-0 items-center gap-8">
          <Logo />
          <nav className="hidden items-center gap-6 lg:flex">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className="text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
                activeProps={{ className: "text-foreground" }}
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Button asChild variant="ghost" className="hidden sm:inline-flex">
            <Link to="/auth">Sign in</Link>
          </Button>
          <Button asChild className="bg-brand hidden text-primary-foreground sm:inline-flex">
            <Link to="/dashboard">Live dashboard</Link>
          </Button>
          <button
            className="grid h-10 w-10 place-items-center rounded-xl border lg:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>
      {open && (
        <div className="border-t bg-background px-4 py-3 lg:hidden">
          <nav className="flex flex-col gap-1">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2 text-sm font-semibold hover:bg-accent"
              >
                {l.label}
              </Link>
            ))}
            <Link to="/auth" onClick={() => setOpen(false)} className="rounded-lg px-3 py-2 text-sm font-semibold hover:bg-accent">
              Sign in
            </Link>
            <Link to="/dashboard" onClick={() => setOpen(false)} className="rounded-lg px-3 py-2 text-sm font-semibold hover:bg-accent">
              Live dashboard
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
