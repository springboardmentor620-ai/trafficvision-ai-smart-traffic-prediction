# TrafficVision AI — Milestone 1

Smart Traffic Prediction & Congestion Management System — Project Initialization,
Design Process & Core Setup (Week 1 & 2).

## What's implemented in this milestone

| Spec requirement | Status |
|---|---|
| Define project objectives & workflows | Done — see `Modules to be Implemented` mapping below |
| Design system architecture & database schema | Done — `backend/app/models.py`, matches the API Gateway → Backend Services → Data Layer architecture |
| UI wireframes & workflow planning | Done — implemented directly as the live frontend |
| Frontend/backend environment setup | Done — FastAPI backend, static HTML/JS frontend, Docker Compose |
| Authentication & role-based access control | Done — JWT auth, 3 roles: `admin` (Traffic Authority), `operator` (Traffic Operator), `viewer` (Public/Commuter) |
| Live traffic monitoring dashboard | Done — polls `/traffic/live` every 5s, color-coded congestion beacons |
| Congestion tracking workflow | Done — rule-based `vehicle_count / lane_capacity` ratio (stand-in for the ML model due in Milestone 2/7) |

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

## Next milestones (not built yet, by design)

- **Milestone 2** (Week 3–4): replace the ratio-based `compute_congestion_level`
  with a trained forecasting model (scikit-learn/TensorFlow), plus route
  optimization and Maps API integration.
- **Milestone 3** (Week 5–6): alert/notification workflows, analytics/heatmap
  dashboards, AI-based recommendations.
- **Milestone 4** (Week 7–8): full test suite, cloud deployment, documentation.
