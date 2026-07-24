# TrafficVision AI — Milestone 1 & 2 Complete

Smart Traffic Prediction & Congestion Management System — Project
Initialization & Core Setup (Week 1 & 2), plus Traffic Prediction & Route
Optimization (Week 3 & 4).

## Milestone 1 — Project Initialization, Design Process & Core Setup (Week 1 & 2)

| Spec requirement | Status |
|---|---|
| Define project objectives & workflows | Done — see `Modules to be Implemented` mapping below |
| Design system architecture & database schema | Done — `backend/app/models.py`, matches the API Gateway → Backend Services → Data Layer architecture |
| UI wireframes & workflow planning | Done — implemented directly as the live frontend |
| Frontend/backend environment setup | Done — FastAPI backend, static HTML/JS frontend, Docker Compose |
| Authentication & role-based access control | Done — JWT auth, 3 roles: `admin` (Traffic Authority), `operator` (Traffic Operator), `viewer` (Public/Commuter) |
| Live traffic monitoring dashboard | Done — polls `/traffic/live` every 5s, color-coded congestion beacons |
| Congestion tracking workflow | Done — rule-based `vehicle_count / lane_capacity` ratio, used for the **live** dashboard feed. As of Milestone 2, **forecasted** congestion instead comes from the trained ML model (see Traffic Prediction Module below) — the two are intentionally separate: live status reflects the latest actual reading, forecasts predict future ones. |

## Real dataset integration (Kaggle)

Traffic data is no longer purely randomly generated. On first startup, the
backend imports the full **Metro Interstate Traffic Volume** dataset from
Kaggle (~48,200 real hourly readings of I-94 westbound traffic near
Minneapolis-St Paul, MN, Oct 2012 – Sep 2018) directly into the
`traffic_readings` table — this is a one-time, idempotent import (it checks
row counts and skips re-importing on subsequent restarts).

The live 5-second dashboard feed for this road **replays the real dataset in
chronological order** (looping back to the start once exhausted) rather than
generating random numbers — so both the historical data *and* the live feed
are grounded in real-world traffic data. The dataset has no speed column, so
`avg_speed_kmph` for this road is estimated from vehicle volume using a
documented free-flow-speed model (see `app/kaggle_import.py`); vehicle counts
and timestamps are the real, unmodified dataset values.

The 4 original sample roads (MG Road Junction, etc.) still use the random
simulator, since there's no real dataset behind them — they exist to
demonstrate the "add a road" / multi-road UI flow.

## Full CRUD

| Resource | Create | Read | Update | Delete |
|---|---|---|---|---|
| Users | `POST /users` (admin) or `POST /auth/register` (public, viewer-only) | `GET /users`, `GET /users/{id}`, `GET /users/me` | `PUT /users/{id}` (admin), `PUT /users/me` (self) | `DELETE /users/{id}` (admin; blocks self-delete and deleting the last admin) |
| Roads | `POST /traffic/roads` | `GET /traffic/roads`, `GET /traffic/roads/{id}` | `PUT /traffic/roads/{id}` | `DELETE /traffic/roads/{id}` |
| Traffic Readings | `POST /traffic/readings` (manual) + automatic feeds | `GET /traffic/live`, `GET /traffic/roads/{id}/history` | — (intentionally append-only, like sensor/audit logs — readings are never edited, only new ones recorded) | — |

## Milestone 2 — Traffic Prediction & Route Optimization (Week 3 & 4)

### Traffic Prediction Module

A real scikit-learn `RandomForestRegressor` is trained directly from whatever
history is in the `traffic_readings` table for a given road — no synthetic
shortcuts. Features are purely time-based (hour, day of week, month, weekend
flag), since those are the only inputs available for a genuinely future
prediction. Trained on the ~48,200 real Kaggle readings for the I-94 road,
the model reaches **R² ≈ 0.94** and correctly recovers real rush-hour
patterns (morning climb, afternoon peak, overnight lull) — see the Prediction
panel on the dashboard, or the endpoints below directly.

| Endpoint | Access | Purpose |
|---|---|---|
| `POST /prediction/train/{road_id}` | admin, operator | Train/retrain the model for a road (needs ≥100 historical readings) |
| `GET /prediction/forecast/{road_id}?hours=24` | any authenticated user | Hour-by-hour predicted vehicle count + congestion level |
| `GET /prediction/report/{road_id}?hours=24` | any authenticated user | Same forecast + peak/quietest hour + summary, as JSON |
| `GET /prediction/report/{road_id}/download?hours=24` | any authenticated user | Same report as a downloadable CSV file |

### Route Analysis Module + Maps/Traffic API integration

Uses free, no-API-key **OpenStreetMap** services — chosen deliberately over
the paid Google Maps API (both are listed as valid options in the spec's
tech stack):

- **Nominatim** (nominatim.openstreetmap.org) for geocoding place names to coordinates
- **OSRM** (router.project-osrm.org), the OpenStreetMap Routing Machine's public
  demo server, for actual driving routes, distances, durations, and alternates

Every monitored road now has an optional `latitude`/`longitude`. The 4 demo
roads and the Kaggle road are seeded with real coordinates (Hyderabad and
Minneapolis respectively); if you're upgrading an existing database, these
are automatically backfilled on next startup — no reset required. A
lightweight auto-migration (`run_lightweight_migrations()` in `database.py`)
adds the new columns to any existing database without touching existing data
— this was tested directly against a real pre-existing database with zero
data loss.

| Endpoint | Purpose |
|---|---|
| `GET /routes/geocode?query=...` | Look up coordinates for a place name/address |
| `GET /routes/plan?origin_road_id=&destination_road_id=` (or raw lat/lon) | Alternate routes, route optimization, and **congestion-aware travel time estimation** — the estimate isn't just OSRM's raw number, it's scaled up based on the current live congestion level of whichever monitored road is nearest each endpoint |
| `GET /routes/road-condition/{road_id}` | Road condition monitoring — current congestion/speed framed as a condition (`normal` / `congested` / `slow-moving`) |

**Important note on testing:** the development sandbox this project was built
in has a restricted network allowlist that does not include the OpenStreetMap
domains above, so the `/routes/geocode` and `/routes/plan` endpoints' actual
network calls could not be integration-tested end-to-end — everything else
in this project was. The request/response handling matches OSRM's and
Nominatim's stable public API formats, and defensive error handling was
confirmed to work correctly (a blocked/unreachable service returns a clean
`400` with a clear message, not a crash). Do a live check once running with
real internet access, e.g.:
```
curl "http://localhost:8000/routes/geocode?query=Hyderabad" -H "Authorization: Bearer <token>"
```
`/routes/road-condition/{road_id}` has no external dependency and was fully
tested end-to-end — it works regardless of internet access.

**Milestone 2 is now complete**: traffic prediction models, congestion
forecasting workflows, prediction reports, route analysis (alternate routes,
route optimization, travel time estimation, road condition monitoring), and
maps/traffic API integration are all implemented.

## Project layout

```
trafficvision-ai/
├── backend/
│   ├── app/
│   │   ├── main.py        # FastAPI app, CORS, startup seed, sensor-feed simulator
│   │   ├── database.py    # SQLAlchemy engine (SQLite by default, Postgres-ready)
│   │   ├── models.py      # User, Road, TrafficReading
│   │   ├── schemas.py     # Pydantic request/response models
│   │   ├── security.py    # Password hashing, JWT, RBAC dependency
│   │   ├── seed.py        # Bootstraps demo admin/operator + 4 sample roads
│   │   ├── kaggle_import.py # One-time import of the real Metro Interstate dataset
│   │   ├── prediction.py  # RandomForestRegressor training/forecast logic (Milestone 2)
│   │   ├── routing.py     # Nominatim/OSRM client helpers (Milestone 2)
│   │   └── routers/
│   │       ├── auth.py       # /auth/register, /auth/login
│   │       ├── users.py      # /users/me (profile), /users (admin list — RBAC demo)
│   │       ├── traffic.py    # /traffic/roads, /traffic/readings, /traffic/live
│   │       ├── prediction.py # /prediction/train, /forecast, /report (Milestone 2)
│   │       └── routes.py     # /routes/geocode, /plan, /road-condition (Milestone 2)
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── index.html         # Login screen
│   ├── dashboard.html      # Live monitoring dashboard
│   ├── app.js              # Polling, RBAC-aware rendering
│   ├── config.js           # API_BASE — point at your backend URL
│   └── style.css
├── docker-compose.yml       # backend + Postgres + static frontend via nginx
└── README.md
```

## Run it locally (fastest path — SQLite, no Docker)

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Then open `frontend/index.html` directly in a browser (or `python -m http.server 3000`
from inside `frontend/`). `frontend/config.js` already points at `http://localhost:8000`.

**Demo accounts** (auto-seeded on first run):
- `admin` / `Admin@123` — Traffic Authority (full access, sees the Users panel)
- `operator1` / `Operator@123` — Traffic Operator (can add roads/readings)

A background thread simulates sensor/CCTV feeds every 5 seconds for 4 pre-seeded
roads, so the dashboard is "live" out of the box — swap `_simulate_sensor_feed`
in `main.py` for a real ingestion job once actual sensor/CCTV integration lands.

## Run it with Docker (production-shaped, PostgreSQL)

```bash
docker compose up --build
```

- Backend: http://localhost:8000 (docs at `/docs`)
- Frontend: http://localhost:3000
- Postgres: localhost:5432

## API quick reference

| Method | Path | Access | Purpose |
|---|---|---|---|
| POST | `/auth/register` | open (bootstraps first admin) | Create a user |
| POST | `/auth/login` | open | Get a JWT |
| GET | `/users/me` | any authenticated user | View own profile |
| GET | `/users` | admin only | List all users (RBAC demo) |
| POST | `/traffic/roads` | admin, operator | Register a monitored road |
| GET | `/traffic/roads` | any authenticated user | List roads |
| POST | `/traffic/readings` | admin, operator | Submit a traffic reading |
| GET | `/traffic/live` | any authenticated user | Latest reading per road (dashboard feed) |
| GET | `/traffic/roads/{id}/history` | any authenticated user | Historical readings for a road |
| POST | `/prediction/train/{road_id}` | admin, operator | Train/retrain the forecasting model |
| GET | `/prediction/forecast/{road_id}` | any authenticated user | Hour-by-hour predicted congestion |
| GET | `/prediction/report/{road_id}` | any authenticated user | Forecast summary (peak/quietest hour) |
| GET | `/prediction/report/{road_id}/download` | any authenticated user | Forecast report as CSV |
| GET | `/routes/geocode` | any authenticated user | Place name → coordinates |
| GET | `/routes/plan` | any authenticated user | Alternate routes + congestion-aware ETA |
| GET | `/routes/road-condition/{road_id}` | any authenticated user | Current road condition |

## Project status

- ✅ **Milestone 1** (Week 1–2): project init, architecture, auth & RBAC, live
  traffic monitoring dashboard, congestion tracking — complete.
- ✅ **Milestone 2** (Week 3–4): ML-based traffic prediction/forecasting,
  route optimization, travel time estimation, road condition monitoring,
  Maps/traffic API integration — complete.

## Next milestones (not built yet, by design)

- **Milestone 3** (Week 5–6): alert/notification workflows (congestion,
  accident, road closure, emergency alerts), analytics dashboard (traffic
  trend reports, congestion heatmaps, road performance tracking), AI-based
  traffic recommendations.
- **Milestone 4** (Week 7–8): application testing & workflow validation, UI
  responsiveness/performance optimization, full cloud deployment (Docker +
  AWS/Azure), final documentation and demo.
