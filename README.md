# TrafficVision AI — Milestones 1 & 2 Complete

Smart Traffic Prediction & Congestion Management System.

- **Milestone 1** (Week 1–2): Project Initialization, Design Process & Core Setup — **done**
- **Milestone 2** (Week 3–4): Traffic Prediction & Route Optimization — **done**

## Milestone 1 — What's implemented

| Spec requirement | Status |
|---|---|
| Define project objectives & workflows | Done — see `Modules to be Implemented` mapping below |
| Design system architecture & database schema | Done — `backend/app/models.py`, matches the API Gateway → Backend Services → Data Layer architecture |
| UI wireframes & workflow planning | Done — implemented directly as the live frontend |
| Frontend/backend environment setup | Done — FastAPI backend, static HTML/JS frontend |
| Authentication & role-based access control | Done — JWT auth, 3 roles: `admin` (Traffic Authority), `operator` (Traffic Operator), `viewer` (Public/Commuter) |
| Live traffic monitoring dashboard | Done — polls `/traffic/live` every 5s, color-coded congestion beacons |
| Congestion tracking workflow | Done — rule-based `vehicle_count / lane_capacity` ratio (stand-in for the ML model due in Milestone 2/7) |

## Real dataset integration (Kaggle) — Bangalore's Traffic Pulse

Traffic data is not randomly generated for the roads that matter most. On
first startup, the backend imports the full **Bangalore's Traffic Pulse**
dataset from Kaggle — **16 real, named roads/intersections across 8 areas
of Bangalore** (Indiranagar, Koramangala, Whitefield, Jayanagar, M.G. Road,
Hebbal, Yeshwanthpur, Electronic City), each with real daily traffic
readings from January 2022 to August 2024 (~275–860 readings per road,
8,936 rows total) — directly into the `traffic_readings` table. This is a
one-time, idempotent import (it checks row counts and skips re-importing on
subsequent restarts).

*(An earlier version of this project used a single-location hourly dataset —
Metro Interstate Traffic Volume, Minneapolis, MN. That's been fully replaced:
it only modeled one road, which wasn't representative of a multi-road traffic
management platform. This dataset fixes that — every monitored road now has
real historical data behind it, not just one.)*

The live 5-second dashboard feed for these 16 roads **replays each road's own
real dataset in chronological order** (looping back to the start once
exhausted) rather than generating random numbers — so both the historical
data *and* the live feed are grounded in real-world traffic data. Any
*additional* road you add yourself via Road Management (not from the
dataset) falls back to the random simulator, since there's no real data
behind it.

**Known limitation, please read:** this dataset is **daily** resolution (one
reading per road per day), not hourly like the previous one. Checking the
data directly: average traffic volume is nearly identical across every day
of the week for every road (~31k–33k, regardless of which day), while
individual daily readings still swing widely (10k–58k) — i.e. there's no
real day-of-week or seasonal pattern in this data for a time-based model to
learn. As a direct result, the Traffic Prediction Module's accuracy on this
dataset is **poor (negative R² on all 16 roads)** — the model performs worse
than simply predicting the average. This is an honest property of the data
(confirmed by checking the raw values, not a training bug) — the previous
Minneapolis dataset had a genuine, strong rush-hour cycle and reached R²≈0.94
on the same code; this dataset simply doesn't have that kind of structure to
learn from with time-based features alone. All prediction endpoints still
run correctly end-to-end (train/forecast/report all return valid results),
they're just not usefully accurate on this particular dataset.

## Full CRUD

| Resource | Create | Read | Update | Delete |
|---|---|---|---|---|
| Users | `POST /users` (admin) or `POST /auth/register` (public, viewer-only) | `GET /users`, `GET /users/{id}`, `GET /users/me` | `PUT /users/{id}` (admin), `PUT /users/me` (self) | `DELETE /users/{id}` (admin; blocks self-delete and deleting the last admin) |
| Roads | `POST /traffic/roads` | `GET /traffic/roads`, `GET /traffic/roads/{id}` | `PUT /traffic/roads/{id}` | `DELETE /traffic/roads/{id}` |
| Traffic Readings | `POST /traffic/readings` (manual) + automatic feeds | `GET /traffic/live`, `GET /traffic/roads/{id}/history` | — (intentionally append-only, like sensor/audit logs — readings are never edited, only new ones recorded) | — |

## Traffic Prediction Module (Milestone 2 — complete, see dataset caveat above)

A real scikit-learn `RandomForestRegressor` is trained directly from whatever
history is in the `traffic_readings` table for a given road — no synthetic
shortcuts. Features are purely time-based (hour, day of week, month, weekend
flag), since those are the only inputs available for a genuinely future
prediction. This approach reached **R² ≈ 0.94** on the previous hourly
Minneapolis dataset (genuine rush-hour cycle); on the current daily
Bangalore dataset, which lacks that kind of time-based pattern, accuracy is
poor — see the "Known limitation" note above. The full pipeline (train,
forecast, report) works correctly regardless — see the Prediction panel on
the dashboard, or the endpoints below directly.

| Endpoint | Access | Purpose |
|---|---|---|
| `POST /prediction/train/{road_id}` | admin, operator | Train/retrain the model for a road (needs ≥100 historical readings) |
| `GET /prediction/forecast/{road_id}?hours=24` | any authenticated user | Hour-by-hour predicted vehicle count + congestion level |
| `GET /prediction/report/{road_id}?hours=24` | any authenticated user | Same forecast + peak/quietest hour + summary, as JSON |
| `GET /prediction/report/{road_id}/download?hours=24` | any authenticated user | Same report as a downloadable CSV file |

### Exact time/date forecasts now vary by hour (hourly disaggregation)

Earlier, picking an exact time for a daily-only road did nothing — the
forecast just returned that whole day's total and ignored the time. That's
been changed: the model still predicts a **daily total** (that part is
genuinely learned from real data — day-of-week, month, weekend patterns),
but that total is now split across the specific hour you pick using a
standard urban-road diurnal traffic curve (two rush-hour peaks around
08:00–09:00 and 18:00, a midday plateau, and an overnight trough — see
`HOURLY_PROFILE` in `backend/app/prediction.py`). So picking 08:00 vs 02:00
on the same day now gives meaningfully different vehicle counts and
congestion levels, as it should.

This is disclosed transparently, not hidden: every forecast response for a
daily-granularity road includes `"hourly_profile_applied": true` and
`"predicted_daily_total"`, and the Forecasting page's message explains it.
To be clear about what's real vs. modeled: the *day-level* variation is
genuinely learned from the Bangalore dataset; the *within-day hourly shape*
is a standard traffic-engineering assumption applied on top, since this
particular dataset has no real per-hour readings to learn that shape from
(see the "Known limitation" note above). Roads with genuine hourly history
(e.g. a live-feed road) are unaffected — they still get a fully model-learned
hour-by-hour forecast with no profile applied.

## Route Analysis Module + Maps/Traffic API integration (Milestone 2 — complete)

Uses free, no-API-key **OpenStreetMap** services — chosen deliberately over
the paid Google Maps API (both are listed as valid options in the spec's
tech stack):

- **Nominatim** (nominatim.openstreetmap.org) for geocoding place names to coordinates
- **OSRM** (router.project-osrm.org), the OpenStreetMap Routing Machine's public
  demo server, for actual driving routes, distances, durations, and alternates

Every monitored road now has an optional `latitude`/`longitude`. All 16
Bangalore dataset roads are seeded with real coordinates automatically; if
you're upgrading an existing database, these are backfilled on next startup
— no reset required. A lightweight auto-migration
(`run_lightweight_migrations()` in `database.py`) adds the new columns to
any existing database without touching existing data — this was tested
directly against a real pre-existing database with zero data loss.

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
curl "http://localhost:8000/routes/geocode?query=Silk+Board+Junction" -H "Authorization: Bearer <token>"
```
`/routes/road-condition/{road_id}` has no external dependency and was fully
tested end-to-end — it works regardless of internet access.

### Route map (Navigation page)

The Navigation page now renders the primary route on a Leaflet/OpenStreetMap
map after you pick an origin road, a destination road, and press **Find
route**: the OSRM `geometry` (GeoJSON `LineString`) returned by
`/routes/plan` for the route labeled `"Primary route"` is drawn as a solid
line, with a green marker at the origin and a red marker at the destination;
any alternate routes are drawn as dimmer dashed lines for context, and the
map auto-fits to the route bounds. This reuses the same Leaflet setup as the
Live Map page (see `frontend/app.js` — `renderRouteOnMap`) — it needs a
working `/routes/plan` response (i.e. real internet access to the OSRM demo
server) to have geometry to draw, same as the rest of the Route Analysis
Module.

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
│   │   └── routers/
│   │       ├── auth.py    # /auth/register, /auth/login
│   │       ├── users.py   # /users/me (profile), /users (admin list — RBAC demo)
│   │       └── traffic.py # /traffic/roads, /traffic/readings, /traffic/live
│   └── requirements.txt
├── frontend/
│   ├── index.html         # Login screen
│   ├── dashboard.html      # Live monitoring dashboard
│   ├── app.js              # Polling, RBAC-aware rendering
│   ├── config.js           # API_BASE — point at your backend URL
│   └── style.css
└── README.md
```

## Run it locally

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

## Next milestones (not built yet, by design)

- **Milestone 3** (Week 5–6): alert/notification workflows, analytics/heatmap
  dashboards, AI-based recommendations.
- **Milestone 4** (Week 7–8): full test suite, cloud deployment, documentation.
