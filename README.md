# trafficvision-ai-smart-traffic-prediction
Infosys Internship Project - Smart Traffic Prediction &amp; Congestion Management System
# TrafficVision AI

**Smart Traffic Prediction & Congestion Management System**

An AI-powered platform that helps city authorities monitor live traffic, predict congestion before it happens, and recommend faster routes — built as a full-stack web application with a FastAPI backend and a Next.js frontend.

---

## Project Objective

Build an AI-powered traffic prediction and congestion management platform that helps city authorities monitor traffic conditions, predict congestion levels, and optimize traffic flow using real-time and historical traffic data. The system supports traffic monitoring, congestion prediction, route analysis, and role-based access, all through a centralized dashboard.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Python, FastAPI |
| Frontend | Next.js (React), TypeScript, Tailwind CSS |
| Database | PostgreSQL (SQLAlchemy ORM) |
| Authentication | JWT (OAuth2 password flow), bcrypt password hashing |
| Machine Learning | scikit-learn (Ridge Regression), pandas, numpy |
| Maps | Google Maps JavaScript API |
| Icons | lucide-react |

---

## Milestones Completed

### ✅ Milestone 1: Project Initialization, Design Process & Core Setup (Week 1–2)

- Defined project objectives and smart traffic workflows
- Designed system architecture and database schema (`Users`, `Roles`, `Roads`, `TrafficReadings`)
- Created UI wireframes and workflow planning for all core screens
- Set up frontend (Next.js) and backend (FastAPI) environments
- **User Management Module**: admin authentication, traffic operator login, role-based access control (RBAC), profile management
- **Traffic Monitoring Module**: vehicle density tracking, congestion monitoring, road utilization analysis, live traffic dashboard

**Key endpoints:**
- `POST /auth/register`, `POST /auth/login`, `GET /users/me`
- `POST /traffic/monitoring/roads`, `GET /traffic/monitoring/roads`, `PUT/DELETE /traffic/monitoring/roads/{id}`
- `POST /traffic/monitoring/readings`, `POST /traffic/monitoring/readings/simulate`
- `GET /traffic/monitoring/live`, `GET /traffic/monitoring/utilization`

**Datasets used:**
- [Traffic Prediction Dataset (fedesoriano)](https://www.kaggle.com/datasets/fedesoriano/traffic-prediction-dataset) — 4 junctions with historical vehicle counts
- [Metro Interstate Traffic Volume (pooriamst)](https://www.kaggle.com/datasets/pooriamst/metro-interstate-traffic-volume) — real hourly traffic volume with weather features

---

### ✅ Milestone 2: Traffic Prediction & Route Optimization (Week 3–4)

- **Traffic Prediction Module**: trains a Ridge regression model per road on its historical readings (time-of-day and day-of-week encoded cyclically, plus a trend term), forecasts vehicle count and congestion level N hours ahead
- **Congestion forecasting workflows**: on-demand forecasting per road, with a minimum-data-points safeguard and a bounded prediction range to prevent unrealistic extrapolation
- **Traffic prediction reports**: side-by-side current vs. predicted view for every road, with trend indicators (increasing / decreasing / stable)
- **Maps integration**: live map view (Google Maps JavaScript API) plotting all monitored roads as color-coded pins based on real-time congestion level
- **Route analysis**: origin/destination road selector comparing a direct route against alternate routes via other monitored roads
- **Travel time estimation**: distance (haversine formula between road coordinates) combined with congestion-based speed estimates to calculate realistic travel times, and recommend whichever route is genuinely fastest given current conditions

**Key endpoints:**
- `POST /traffic/prediction/forecast/{road_id}?hours_ahead=1`
- `GET /traffic/prediction/report`
- `GET /traffic/prediction/history/{road_id}`
- `GET /traffic/routes/recommend?origin_road_id=&destination_road_id=`

---

## Project Structure

```
TrafficVision-AI/
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── config.py
│   │   ├── database.py
│   │   └── modules/
│   │       ├── user_management/       # auth, RBAC, profiles
│   │       ├── traffic_monitoring/    # roads, readings, live status
│   │       ├── traffic_prediction/    # ML forecasting, reports
│   │       └── route_analysis/        # route + travel time estimation
│   ├── data/                          # Kaggle datasets
│   ├── scripts/                       # dataset seed scripts
│   └── requirements.txt
│
└── frontend/
    ├── app/
    │   ├── login/, register/
    │   └── dashboard/
    │       ├── page.tsx               # overview dashboard
    │       ├── monitoring/            # traffic monitoring
    │       ├── prediction/            # traffic prediction
    │       ├── live-map/              # Google Maps view
    │       └── routes/                # route analysis
    ├── components/                    # Sidebar, Topbar, DashboardShell
    └── lib/                           # API client, auth context
```

---

## Setup Instructions

### Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate          # Windows
pip install -r requirements.txt

# Create .env with:
# DATABASE_URL=postgresql://user:password@localhost:5432/trafficvision
# SECRET_KEY=your_secret_key
# ALGORITHM=HS256
# ACCESS_TOKEN_EXPIRE_MINUTES=60

uvicorn app.main:app --reload --reload-dir app
```
API docs available at `http://localhost:8000/docs`

### Frontend
```bash
cd frontend
npm install

# Create .env.local with:
# NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_maps_key

npm run dev
```
App available at `http://localhost:3000`

---

## Roles & Access

| Role | Access |
|---|---|
| Admin | Full access — manage users, roads, and all data |
| Traffic Operator | Manage roads, submit readings, generate forecasts |
| Public | Read-only access to live traffic and predictions |

---

## Known Limitations

- Travel time and route recommendations use straight-line (haversine) distance between roads rather than real road-network routing, since the project doesn't yet integrate a routing/directions API.
- Prediction model accuracy (R² score) is currently limited by the amount of historical data available per road — accuracy improves as more readings accumulate over time.
- Google Maps integration uses a Demo Key, suitable for development/demo purposes; a production deployment would require a billed API key.

---

