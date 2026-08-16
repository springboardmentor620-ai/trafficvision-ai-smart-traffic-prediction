# TrafficVision AI

**Smart Traffic Prediction & Congestion Management Platform for Bengaluru**
 
 Data Set Link : https://www.kaggle.com/datasets/asshridattaaigal/bangalore-traffic-analysis-dataset

TrafficVision AI is a production-grade, full-stack traffic operations platform. It ingests a real Bengaluru traffic dataset, trains Random Forest models on it, serves live congestion forecasts and Google-Maps-style route recommendations, and presents everything through an enterprise SaaS dashboard with authentication, role-based access, alerts, analytics, heatmaps and downloadable reports.

Live preview: run `npm run dev` and open `http://localhost:8080`.

---

## Table of contents

1. [Feature overview](#1-feature-overview)
2. [Technology stack](#2-technology-stack)
3. [Architecture](#3-architecture)
4. [Dataset & machine learning](#4-dataset--machine-learning)
5. [Database schema](#5-database-schema)
6. [Backend API surface](#6-backend-api-surface)
7. [Authentication & security](#7-authentication--security)
8. [Route recommendation engine](#8-route-recommendation-engine)
9. [Maps & visualisation](#9-maps--visualisation)
10. [Reports & email](#10-reports--email)
11. [Pages & routes](#11-pages--routes)
12. [Project structure](#12-project-structure)
13. [Development history — how this was built, step by step](#13-development-history--how-this-was-built-step-by-step)
14. [Local setup](#14-local-setup)
15. [Environment variables](#15-environment-variables)

---

## 1. Feature overview

**Public site**
- Animated landing page with live KPIs pulled from the database (corridors, cameras, congestion index, model accuracy)
- Features, How it works, Technology, About, Contact, Docs, Privacy, Terms pages
- Fully responsive light theme with glassmorphism, gradients and motion

**Authentication**
- Email + password registration restricted to Gmail addresses
- Strong password policy (8+ chars, upper, lower, digit, symbol) enforced client- and server-side
- Remember-me sessions, forgot password, dedicated `/reset-password` page
- Automatic profile + default role provisioning through a database trigger

**Dashboard modules**
| Module | What it does |
|---|---|
| Control Centre | 12 live KPIs, hourly/weekly/monthly charts, live map, top congested corridors, AI insights |
| Traffic Monitoring | Per-corridor telemetry, camera fleet status, occupancy, speed, filters by city/area/road |
| Traffic Prediction | Random Forest inference form (hour, day, weather, rain, temperature, vehicle type) returning congestion %, travel time, delay, risk, confidence and an explanation |
| Route Optimisation | Google-Maps-style autocomplete over 12,520 real Bengaluru places, 3 colour-coded alternate routes on Leaflet, per-segment conditions, fuel and CO₂ estimates, AI rationale |
| Alerts | Real-time alert table with acknowledge/resolve actions, severity filters, 
| Analytics | Hourly/daily/monthly analysis, road ranking, vehicle flow, travel-time analysis |
| Heatmaps | Geographic Leaflet heat layers for density, congestion, accidents and utilisation |
| Reports | Six report templates + custom builder; detailed PDF (print-ready) and multi-section CSV downloads;|
| AI Insights | Ranked recommendations (signal retiming, diversion, expansion) with impact and supporting metrics |
| User Management | Directory, roles, permissions, last login, activity logs (admin-scoped) |
| Settings | Workspace, notification, AI, map, security and theme preferences persisted per user |
| Profile | Live account data, profile edit, activity trail |

---

## 2. Technology stack

| Layer | Technology |
|---|---|
| Framework | **TanStack Start v1** (React 19 full-stack framework, SSR + server functions) |
| Build tool | **Vite 7/8** |
| Language | **TypeScript** (strict) |
| Styling | **Tailwind CSS v4** with a custom OKLCH token theme in `src/styles.css` |
| UI components | shadcn/ui + Radix primitives, lucide-react icons, sonner toasts |
| Charts | **Recharts** (area, bar, line, radar, pie, scatter) |
| Maps | **Leaflet** + react-leaflet with CartoDB Light tiles |
| Data fetching | **TanStack Query** (route loaders + `useSuspenseQuery`) |
| Routing | **TanStack Router** file-based routing |
| Backend runtime | TanStack **server functions** (`createServerFn`) on the edge runtime |
| Database | **PostgreSQL** ( Cloud / Supabase), `pg_trgm` fuzzy search |
| Auth | Supabase Auth — JWT bearer tokens, bcrypt password hashing, Google OAuth |
| Security | Row Level Security on every table + `has_role()` security-definer function |
| ML training | **Python**, scikit-learn (RandomForestRegressor/Classifier), pandas, NumPy |
| ML inference | Custom **TypeScript forest scorer** reading exported JSON weights (edge compatible) |
| Validation | **Zod** on every server function input |

> Note on the original spec: FastAPI, MongoDB and Docker cannot execute on this hosting runtime. Every FastAPI endpoint in the specification is implemented as an equivalent, authenticated, validated TypeScript server function, and the trained scikit-learn models are exported to JSON so the exact same Random Forest logic runs at the edge. The Python training pipeline (`/model`) and the `.pkl` artefacts are kept in the repository.

---

## 3. Architecture

```text
Browser (React 19 + TanStack Router)
   │  TanStack Query (loaders, suspense, cache)
   ▼
Server functions  (createServerFn, Zod-validated, JWT bearer attached)
   │        │                 │
   │        │                 └── Random Forest scorers (forest.server.ts, route-forest.server.ts)
   │        └── Email service ( managed email API)
   ▼
PostgreSQL (RLS enforced)  ← seeded from the real Bengaluru dataset
```

- **Public reads** (landing page KPIs, dashboard bundle) use a publishable-key server client with narrow `TO anon` SELECT policies.
- **User-scoped reads/writes** use `requireSupabaseAuth` middleware, so RLS evaluates as the signed-in user.
- **Admin-only reads** verify `has_role(uid,'admin')` first, then use the service-role client.
- The bearer token is attached to every server-function call by `functionMiddleware` in `src/start.ts`.

---

## 4. Dataset & machine learning

### Data sources
- **`bangalore_routes.csv`** — ~2.1M rows / 323 MB of real Bengaluru origin–destination observations: `source_location`, `destination_location`, `lat_src`, `lon_src`, `lat_dest`, `lon_dest`, `distance`, `day_of_week`, `hour`, `is_peak`, `weather`, `road_capacity`, `vehicles`, `speed`, `signal_time`, `travel_time`. Contains **12,520 unique named locations** and ~2M unique location pairs.
- Public Bengaluru corridor traffic datasets used to build the 13 monitored corridors with real coordinates, lane counts, widths and signal counts.

### Training pipelines
| Script | Output | Purpose |
|---|---|---|
| `model/train_route_model.py` | `model/route_*_rf.pkl`, `src/lib/ml/route-forest.json` (1.1 MB) | Three Random Forests — travel time, speed, vehicle flow — trained on a 500k-row sample |
| (corridor pipeline) | `src/lib/ml/forest.json` (890 KB), `src/lib/ml/metrics.json` | Congestion regressor + classifier over ~90k corridor observations |
| `model/export_places.py` | `places` table (12,520 rows) | Extracts, categorises (metro, bus, hospital, temple, mall, park, college, office…) and geocodes every unique location |

### Measured metrics
**Corridor congestion model** — MAE **4.31**, R² **0.9088**, classification accuracy **91.9 %**

**Route models** (500,000 rows each)

| Target | MAE | RMSE | R² |
|---|---|---|---|
| Travel time | 12.998 | 201.036 | 0.662 |
| Speed | 7.790 | 9.452 | 0.658 |
| Vehicles | 202.027 | 248.861 | 0.775 |

Forests were capped at 20 trees / depth 11 so the exported JSON stays inside the edge runtime's memory budget while preserving accuracy.

### Inference at runtime
`src/lib/ml/forest.server.ts` and `src/lib/ml/route-forest.server.ts` implement tree traversal in TypeScript: feature vector → per-tree leaf value → averaged prediction, plus a confidence score derived from inter-tree variance. Zero Python at request time.

---

## 5. Database schema

PostgreSQL tables (all with RLS enabled and explicit GRANTs):

| Table | Contents |
|---|---|
| `profiles` | Display name, email, mobile, city; auto-created on signup |
| `user_roles` | `app_role` enum (`admin`, `operator`, `viewer`) — roles are **never** stored on profiles |
| `roads` | 13 monitored corridors: code, name, area, type, lanes, width, length, signals, cameras, lat/lng |
| `traffic_data` | Time-series vehicle count, speed, occupancy, congestion, travel time, status |
| `vehicle_counts` | Per-class vehicle counts per corridor |
| `road_conditions` | Surface condition scoring |
| `accidents` | Location, severity, casualties, description, timestamp |
| `alerts` | Type, severity, status, message, corridor, area |
| `traffic_predictions` | Every AI forecast made by a user with inputs and outputs |
| `routes` | Saved route searches: source, destination, options, recommended, reasoning |
| `places` | 12,520 searchable Bengaluru locations with `pg_trgm` GIN indexes |
| `analytics` | Pre-aggregated hourly/weekly/monthly metric buckets |
| `heatmaps` | Grid cells per layer with lat/lng and intensity |
| `ai_models` | Registered model versions, algorithm, accuracy, MAE, RMSE, dataset size |
| `weather` | Condition, temperature, humidity, rainfall |
| `reports` | Generated report documents with payload, format and status |
| `settings` | Per-user JSON preferences |
| `notifications` | In-app notification feed |
| `logs` | Activity/audit trail |

Helper database objects: `has_role(uuid, app_role)` (security definer), `handle_new_user()` trigger, `update_updated_at_column()` trigger.

---

## 6. Backend API surface

All endpoints are typed server functions with Zod validation.

`src/lib/traffic.functions.ts`
- `getTrafficBundle()` — the whole live dashboard payload (roads, KPIs, hourly/weekly/monthly analytics, alerts, heat cells, model card, accidents, cameras, forecasts, insights, templates)
- `predictTraffic(input)` — Random Forest congestion forecast, persisted to `traffic_predictions`
- `getMyPredictions()` — last 25 forecasts for the user
- `recommendRoutes(source, destination)` — corridor-level route options
- `updateAlertStatus(id, status)` — acknowledge / resolve
- `getAccount()` — profile, roles, settings, notifications, logs, reports
- `updateProfile(patch)` / `saveSettings(preferences)`
- `generateReport(name, kind, period, format)` — builds and persists a full report document
- `getDirectory()` — user directory + activity logs, admin-aware

`src/lib/route-planner.functions.ts`
- `searchPlaces(query)` — fuzzy autocomplete over the 12,520-place gazetteer
- `planRoute(source, destination, day, hour, weather)` — three dataset-derived alternates, persisted to `routes`

---

## 7. Authentication & security

- JWT bearer tokens issued by Supabase Auth; passwords hashed with bcrypt; tokens attached automatically to every server function call.
- Gmail-only registration; password policy in `src/lib/auth-rules.ts`.
- Email confirmation required; `/reset-password` handles recovery links.
- `/dashboard/*` is gated client-side (`ssr: false` + `beforeLoad` session check) and every protected server function re-verifies the token independently.
- Row Level Security on all tables; roles in a separate `user_roles` table read through a `SECURITY DEFINER` function to avoid recursive policies and privilege escalation.
- All user input validated with Zod before touching the database.

---

## 8. Route recommendation engine

1. User types a source/destination — `searchPlaces` fuzzy-matches the `places` table (trigram GIN index) and returns ranked suggestions with category icons.
2. `planRoute` resolves both endpoints, then looks for direct dataset pairs; when a pair is unseen (**zero-shot**), it finds corridor waypoints by geographic proximity and composes a multi-leg path.
3. Each candidate path is scored per-segment by the Random Forest models using the selected day, hour, peak flag and weather.
4. Multipliers are applied: peak hours ×1.5, weekends ×1.2, weather up to ×1.4.
5. Three alternates are returned and colour-coded: **green** (recommended / fastest), **yellow** (moderate alternate), **blue** (longer but steadier backup) — each with distance, ETA, congestion %, traffic score, fuel litres, CO₂ grams and a written AI rationale.
6. Polylines, A/B pins and waypoint markers render on Leaflet with automatic bounds fitting; the search is written to the user's route history and activity log.

---

## 9. Maps & visualisation

- `LeafletMap.tsx` — base component: CartoDB Light tiles, congestion-coloured markers, multiple polylines, popups, `fitBounds`.
- `CityMap.tsx` — `ClientOnly`-wrapped live network map for the dashboard and monitoring pages.
- `RouteMap.tsx` — alternate-route renderer for the route planner.
- `Heatmap.tsx` — geographic heat layers for density, congestion, accidents and utilisation.
- Charts: Recharts area/bar/line/pie/radar with animated counters and skeleton loading states.

---

## 10. Reports & email

**Report documents** are built server-side by `buildReportPayload(kind, period)` and contain:
- Title, generation timestamp, period
- A written executive summary (busiest corridor, best performer, network peak, incident counts, model provenance)
- 12 key metrics
- Multiple full data tables depending on the report kind — corridor performance, hourly profile, weekly and monthly trends, vehicle mix, alerts log, incidents, AI forecasts, camera fleet, model evaluation, feature importance, heatmap grid, AI recommendations

**Downloads** (`src/lib/report-export.ts`)
- **PDF** — opens a fully styled, print-ready document (branded header, KPI grid, summary, all tables) and triggers the browser print dialog so it saves to your machine as a PDF.
- **CSV** — a multi-section workbook with the header block, executive summary, KPI table and every data table, correctly quoted and escaped.

---

## 11. Pages & routes

| Route | Description |
|---|---|
| `/` | Landing page with live KPIs |
| `/features`, `/how-it-works`, `/technology`, `/about`, `/contact`, `/docs`, `/privacy`, `/terms` | Marketing & policy pages |
| `/auth` | Login / Register / Forgot password + Google sign-in |
| `/reset-password` | Password recovery |
| `/dashboard` | Control centre |
| `/dashboard/monitoring` | Live traffic monitoring |
| `/dashboard/prediction` | AI prediction workbench |
| `/dashboard/routes` | Route optimisation |
| `/dashboard/alerts` | Alert system |
| `/dashboard/analytics` | Analytics |
| `/dashboard/heatmaps` | Heatmaps |
| `/dashboard/reports` | Reports |
| `/dashboard/ai-insights` | AI recommendations |
| `/dashboard/users` | User management |
| `/dashboard/admin` | Admin panel & system health |
| `/dashboard/settings` | Settings |
| `/dashboard/profile` | Profile |

---

## 12. Project structure

```text
src/
├── routes/                 file-based routes (public + dashboard)
├── components/
│   ├── layout/             SiteHeader, SiteFooter, DashboardShell, MarketingPage
│   ├── tv/                 StatCard, CityMap, LeafletMap, RouteMap, Heatmap,
│   │                       PlaceAutocomplete, AnimatedCounter, PageHeader, Logo
│   └── ui/                 shadcn/ui primitives
├── lib/
│   ├── traffic.functions.ts    public API (server functions)
│   ├── traffic.server.ts       data layer + report builder
│   ├── route-planner.functions.ts / .server.ts   route engine
│   ├── report-export.ts        PDF/CSV rendering
│   ├── email/send.server.ts    managed email helper
│   ├── ml/                     forest.json, route-forest.json, TS scorers, metrics
│   ├── use-traffic.ts / use-account.ts   query hooks
│   ├── auth-rules.ts, roles.ts, utils.ts
├── integrations/
│   ├── supabase/           generated clients, auth middleware, types
│   └── lovable/            managed Google OAuth
├── styles.css              Tailwind v4 theme tokens
model/
├── train_route_model.py    Random Forest training pipeline
├── export_places.py        gazetteer extraction
├── route_*_rf.pkl          trained scikit-learn artefacts
└── metrics.json            measured evaluation metrics
```

---

## 13. Development history — how this was built, step by step

**Phase 1 — Specification analysis and design system**
The PDF specification was parsed into modules (landing, auth, dashboard, monitoring, prediction, routing, alerts, analytics, heatmaps, reports, settings, admin). A light-theme design system was authored in `src/styles.css` using OKLCH colour tokens, glassmorphism utilities, gradient surfaces, shadow scales and motion presets — deliberately avoiding generic template aesthetics.

**Phase 2 — Frontend build**
Every page, layout, chart, card and navigation element was implemented against a deterministic mock data layer so the full product could be reviewed before any backend existed. Reusable primitives (`StatCard`, `PageHeader`, `SectionCard`, `AnimatedCounter`) were extracted, and TypeScript strict mode issues were resolved across the data layer.

**Phase 3 — Backend decision**
The specification asked for FastAPI + MongoDB + Docker. Those cannot execute on this runtime, so the plan was agreed with the client: build the identical functional backend on Lovable Cloud (PostgreSQL + typed server functions + edge ML inference), keeping the Python training pipeline in the repository.

**Phase 4 — Database and real data**
The PostgreSQL schema was created by migration with RLS policies, GRANTs, the `app_role` enum, the `user_roles` table, the `has_role()` security-definer function and signup triggers. Real Bengaluru corridor data (13 corridors with true coordinates, lanes, widths and signal counts) was sourced, cleaned and seeded together with ~2,500 rows of traffic records, heatmap cells, analytics buckets and alerts.

**Phase 5 — Machine learning**
A scikit-learn pipeline trained a Random Forest regressor and classifier over ~90k corridor observations (MAE 4.31, R² 0.9088, accuracy 91.9 %) and exported an 890 KB JSON forest. A matching TypeScript scorer (`forest.server.ts`) reproduces inference at the edge.

**Phase 6 — Backend service layer**
`traffic.server.ts` assembles the complete dashboard bundle from ten parallel PostgreSQL queries; `traffic.functions.ts` exposes validated server functions. TanStack Query hooks and route loaders replaced every mock import, so all pages now render live database data.

**Phase 7 — Authentication**
Gmail-only registration with strong-password validation, email confirmation, remember-me, forgot/reset password, dashboard route gating and per-request token verification.

**Phase 8 — Leaflet maps**
Google Maps was replaced with Leaflet across the platform: a shared `LeafletMap` component with CartoDB Light tiles, a `ClientOnly` wrapper for SSR safety, Vite `optimizeDeps` fixes for React 19, and integration into the dashboard, monitoring, routing and heatmap pages.

**Phase 9 — Interactive wiring**
The prediction form, alert acknowledge/resolve actions, profile editing and the settings page were connected to their endpoints, then verified end-to-end with Playwright (live forecasts returned, settings persisted, alerts updated).

**Phase 10 — Real dataset route engine**
`bangalore_routes.csv` (2.1M rows) was analysed; three Random Forests were trained on a 500k-row sample and exported to a 1.1 MB JSON forest; 12,520 unique locations were extracted, categorised and loaded into a `places` table with trigram indexes. The route planner (fuzzy autocomplete → endpoint resolution → zero-shot waypoint composition → ML-scored alternates → colour-coded Leaflet rendering) was built and verified on Koramangala → Whitefield.

**Phase 11 —  meaningful reports and email**
The report builder was rewritten to emit a structured document (executive summary, 12 KPIs, up to eight full data tables per report kind), with print-ready PDF and multi-section CSV exporters. 
---

## 14. Local setup

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev      # http://localhost:8080
```

Retrain the models (optional, requires Python 3 with pandas, numpy, scikit-learn):

```sh
python model/train_route_model.py     # writes src/lib/ml/route-forest.json
python model/export_places.py         # writes the places gazetteer CSV
```

---

## 15. Environment variables

| Variable | Scope | Purpose |
|---|---|---|
| `VITE_SUPABASE_URL` / `SUPABASE_URL` | client / server | Database + auth endpoint |
| `VITE_SUPABASE_PUBLISHABLE_KEY` / `SUPABASE_PUBLISHABLE_KEY` | client / server | Public API key (RLS enforced) |
| `SUPABASE_SERVICE_ROLE_KEY` | server only | Admin operations |
| `LOVABLE_API_KEY` | server only | Managed email + AI gateway |
| `EMAIL_SENDER_DOMAIN` | server only | Verified sender subdomain for outgoing mail |

Never expose service-role keys to the browser.



