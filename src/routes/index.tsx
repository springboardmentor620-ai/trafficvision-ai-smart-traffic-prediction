import { trafficQueryOptions } from "@/lib/use-traffic";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Activity, AlertTriangle, BarChart3, Boxes, Brain, Camera, Cloud, Container, Route as RouteIcon,
  Gauge, LineChart, Lock, Map as MapIcon, PlayCircle, Radar, ShieldCheck, Sparkles, Timer,
  TrendingDown, Users, Waves, Zap, Leaf, Building2, Siren, ArrowRight,
} from "lucide-react";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { CityMap } from "@/components/tv/CityMap";
import { AnimatedCounter } from "@/components/tv/AnimatedCounter";
import { Button } from "@/components/ui/button";
import { useTraffic } from "@/lib/use-traffic";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "TrafficVision AI — Smart Traffic Prediction & Congestion Platform" },
      {
        name: "description",
        content:
          "AI powered traffic prediction, live congestion monitoring, route optimisation, heatmaps and analytics for smart cities and traffic control departments.",
      },
      { property: "og:title", content: "TrafficVision AI — Smart Traffic Prediction Platform" },
      {
        property: "og:description",
        content:
          "Monitor, predict and manage urban congestion with AI forecasting, live maps, smart alerts and analytics dashboards.",
      },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(trafficQueryOptions),
  component: Landing,
});

const features = [
  { icon: Brain, title: "AI traffic prediction", desc: "LSTM + gradient boosting models forecast congestion 15–120 minutes ahead." },
  { icon: Activity, title: "Real-time monitoring", desc: "Live vehicle counts, occupancy and speed from every connected camera." },
  { icon: TrendingDown, title: "Congestion forecasting", desc: "Peak-hour and delay estimation per corridor with confidence scoring." },
  { icon: RouteIcon, title: "Alternate routes", desc: "Fastest, safest and least congested routes recomputed continuously." },
  { icon: BarChart3, title: "Traffic analytics", desc: "Hourly to yearly analysis of flow, utilisation and road performance." },
  { icon: Waves, title: "Heatmaps", desc: "Density, congestion, accident and utilisation heatmaps with filters." },
  { icon: AlertTriangle, title: "Smart alerts", desc: "Accidents, closures, floods and emergency vehicle priority alerts." },
  { icon: LineChart, title: "Historical insights", desc: "Years of traffic history for planning and trend comparison." },
  { icon: Sparkles, title: "AI recommendations", desc: "Signal retiming, corridor expansion and peak-hour management advice." },
  { icon: Users, title: "Role based access", desc: "Admin, operator, analyst and viewer roles with granular permissions." },
  { icon: Cloud, title: "Cloud deployment", desc: "AWS and Azure ready with horizontal scaling for city-wide fleets." },
  { icon: Zap, title: "FastAPI backend", desc: "High-throughput async REST APIs with JWT authentication." },
  { icon: Boxes, title: "TensorFlow integration", desc: "Model registry, retraining pipelines and evaluation metrics." },
  { icon: MapIcon, title: "Maps API", desc: "Google Maps and OpenStreetMap layers with live traffic overlays." },
  { icon: Container, title: "Docker support", desc: "Compose stack for API, workers, PostgreSQL, MongoDB and Redis." },
  { icon: Lock, title: "Secure by design", desc: "JWT sessions, audit logs, encrypted secrets and API key rotation." },
];

const steps = [
  { icon: Camera, title: "Collect traffic data", desc: "Cameras, loop detectors, GPS probes and weather feeds stream into the platform." },
  { icon: Gauge, title: "Analyze traffic flow", desc: "Vehicle classification, density, occupancy and speed computed per segment." },
  { icon: Brain, title: "Predict congestion", desc: "Models forecast congestion levels, peak windows and expected delay." },
  { icon: RouteIcon, title: "Recommend routes", desc: "Optimal, fastest and least congested alternatives ranked in real time." },
  { icon: Siren, title: "Generate alerts", desc: "Operators are notified over the console, email, SMS and push channels." },
  { icon: BarChart3, title: "Analytics dashboard", desc: "Trends, heatmaps and reports feed long-term smart city planning." },
];

const benefits = [
  { icon: TrendingDown, title: "Reduce traffic", desc: "Up to 24% lower peak congestion on managed corridors." },
  { icon: Leaf, title: "Save fuel & CO₂", desc: "Route optimisation cuts idling and emissions city-wide." },
  { icon: Timer, title: "Reduce travel time", desc: "Average commute reduced by 9 minutes on monitored routes." },
  { icon: Building2, title: "Smart city planning", desc: "Evidence-based expansion and infrastructure decisions." },
  { icon: Siren, title: "Emergency routing", desc: "Green-corridor routing for ambulances and fire response." },
  { icon: Gauge, title: "Traffic efficiency", desc: "Signal timing tuned continuously against live demand." },
  { icon: Radar, title: "Real-time visibility", desc: "One operational picture for the whole road network." },
  { icon: Brain, title: "AI decision support", desc: "Ranked recommendations with projected impact for every action." },
];

const stack = [
  "FastAPI", "React", "Next.js", "TensorFlow", "Scikit-learn", "PostgreSQL", "MongoDB", "Docker",
  "AWS", "Azure", "Google Maps", "OpenStreetMap", "Chart.js", "TailwindCSS", "JWT",
];

function Landing() {
  const { hourly, kpis } = useTraffic();
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="grid-lines pointer-events-none absolute inset-0 opacity-70" />
        <div className="pointer-events-none absolute -left-40 -top-40 h-[28rem] w-[28rem] rounded-full bg-primary/20 blur-3xl" />
        <div className="pointer-events-none absolute -right-32 top-20 h-[26rem] w-[26rem] rounded-full bg-violet/20 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-cyan/20 blur-3xl" />

        <div className="relative mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1.05fr_1fr] lg:py-24">
          <div className="animate-rise min-w-0">
            <span className="glass inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold">
              <Sparkles className="h-3.5 w-3.5 text-violet" />
              Live AI congestion forecasting · 94.3% accuracy
            </span>
            <h1 className="mt-5 font-display text-4xl font-extrabold leading-[1.05] sm:text-6xl">
              Traffic<span className="text-gradient">Vision</span> AI
            </h1>
            <p className="mt-4 max-w-xl text-lg text-muted-foreground">
              AI powered smart traffic prediction & congestion management platform for city authorities,
              transport agencies and smart city operations centres.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button asChild size="lg" className="bg-brand text-primary-foreground">
                <Link to="/auth">Get started <ArrowRight className="ml-1 h-4 w-4" /></Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/dashboard">Live dashboard</Link>
              </Button>
              <Button asChild size="lg" variant="ghost">
                <Link to="/how-it-works"><PlayCircle className="mr-1 h-4 w-4" /> Watch demo</Link>
              </Button>
            </div>

            <dl className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                { k: "Roads monitored", v: kpis.totalRoads, s: "" },
                { k: "Cameras", v: kpis.totalCameras, s: "" },
                { k: "Prediction acc.", v: 94.3, s: "%" },
                { k: "Avg speed", v: kpis.avgSpeed, s: " km/h" },
              ].map((s) => (
                <div key={s.k} className="glass rounded-2xl p-3">
                  <dt className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{s.k}</dt>
                  <dd className="mt-1 font-display text-xl font-extrabold">
                    <AnimatedCounter value={s.v} suffix={s.s} decimals={s.s === "%" ? 1 : 0} />
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="animate-rise min-w-0 space-y-4" style={{ animationDelay: "120ms" }}>
            <CityMap className="h-[300px] shadow-[var(--shadow-glass)] sm:h-[340px]" showRoute />
            <div className="glass animate-float rounded-2xl p-4">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Live network congestion
                </p>
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-success">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-success" /> streaming
                </span>
              </div>
              <div className="mt-2 h-28">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={hourly}>
                    <defs>
                      <linearGradient id="heroArea" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.6} />
                        <stop offset="100%" stopColor="var(--chart-3)" stopOpacity={0.05} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="hour" hide />
                    <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--border)" }} />
                    <Area type="monotone" dataKey="congestion" stroke="var(--chart-1)" strokeWidth={2.5} fill="url(#heroArea)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <SectionTitle eyebrow="Platform" title="Everything a traffic control room needs" sub="Sixteen production modules covering monitoring, prediction, routing, alerts and analytics." />
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <article key={f.title} className="glass card-hover rounded-2xl p-5">
              <span className="bg-brand grid h-10 w-10 place-items-center rounded-xl text-primary-foreground">
                <f.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 font-display text-base font-bold">{f.title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{f.desc}</p>
            </article>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="relative overflow-hidden border-y bg-card/50 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <SectionTitle eyebrow="Workflow" title="How TrafficVision AI works" sub="From raw sensor data to operational decisions in six automated stages." />
          <ol className="mt-10 grid gap-4 md:grid-cols-3">
            {steps.map((s, i) => (
              <li key={s.title} className="glass card-hover relative rounded-2xl p-5">
                <span className="absolute right-4 top-4 font-display text-3xl font-extrabold text-primary/15">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
                  <s.icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 font-display text-base font-bold">{s.title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{s.desc}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* BENEFITS */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <SectionTitle eyebrow="Impact" title="Measurable outcomes for your city" sub="Operational gains reported across pilot corridors within the first quarter." />
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map((b) => (
            <article key={b.title} className="glass-soft card-hover rounded-2xl p-5">
              <b.icon className="h-6 w-6 text-violet" />
              <h3 className="mt-3 font-display text-base font-bold">{b.title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{b.desc}</p>
            </article>
          ))}
        </div>
      </section>

      {/* STACK */}
      <section className="border-y bg-card/50 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <SectionTitle eyebrow="Architecture" title="Built on a proven modern stack" sub="Modular, containerised and cloud ready — swap the mock data layer for live APIs any time." />
          <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {stack.map((t) => (
              <div key={t} className="glass card-hover flex items-center gap-3 rounded-xl px-4 py-3">
                <span className="bg-brand h-2.5 w-2.5 shrink-0 rounded-full" />
                <span className="truncate text-sm font-semibold">{t}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="bg-brand relative overflow-hidden rounded-3xl px-6 py-14 text-center text-primary-foreground">
          <div className="pointer-events-none absolute inset-0 opacity-25 grid-lines" />
          <ShieldCheck className="relative mx-auto h-10 w-10" />
          <h2 className="relative mt-4 font-display text-3xl font-extrabold sm:text-4xl">
            Take control of your city's traffic
          </h2>
          <p className="relative mx-auto mt-3 max-w-2xl text-sm opacity-90">
            Deploy TrafficVision AI on your infrastructure in days. Connect cameras, traffic APIs and weather
            feeds, then let the models do the forecasting.
          </p>
          <div className="relative mt-7 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg" variant="secondary">
              <Link to="/auth">Get started free</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-primary-foreground/40 bg-transparent text-primary-foreground hover:bg-primary-foreground/10">
              <Link to="/contact">Talk to our team</Link>
            </Button>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}

function SectionTitle({ eyebrow, title, sub }: { eyebrow: string; title: string; sub: string }) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary">{eyebrow}</span>
      <h2 className="mt-3 font-display text-3xl font-extrabold sm:text-4xl">{title}</h2>
      <p className="mt-3 text-sm text-muted-foreground">{sub}</p>
    </div>
  );
}
