# trafficvision-ai-smart-traffic-prediction
Infosys Internship Project - Smart Traffic Prediction & Congestion Management System
# TrafficVision AI

**Smart Traffic Prediction & Congestion Management System**

An AI-powered platform that helps city authorities monitor live traffic, predict congestion before it happens, and recommend faster routes — built as a full-stack web application with a FastAPI backend and a Next.js frontend.

---

## Project Objective

Build an AI-powered traffic prediction and congestion management platform that helps city authorities monitor traffic conditions, predict congestion levels, and optimize traffic flow using real-time and historical traffic data. The system supports traffic monitoring, congestion prediction, route analysis, alerting, analytics, and role-based access, all through a centralized dashboard.

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

### ✅ Milestone 1: Week 1 & 2 — Project Initialization, Design Process & Core Setup

- Defined project objectives and smart traffic workflows
- Designed system architecture and database schema (`Users`, `Roles`, `Roads`, `TrafficReadings`)
- Created UI wireframes and workflow planning for all core screens
- Set up frontend (Next.js) and backend (FastAPI) environments
- **User Management Module**: admin authentication, traffic operator login, role-based access control (RBAC), profile management — including the admin-facing User Management frontend page (list/deactivate users from the UI)
- **Traffic Monitoring Module**: vehicle density tracking, congestion monitoring, road utilization analysis, live traffic dashboard
- Developed congestion tracking workflows

**Outcomes:**
- Understand smart traffic management and transportation workflows
- Learn system architecture and database design concepts
- Build frontend and backend project initialization
- Working authentication and traffic monitoring system

**Key endpoints:**
- `POST /auth/register`, `POST /auth/login`, `GET /users/me`
- `POST /traffic/monitoring/roads`, `GET /traffic/monitoring/roads`, `PUT/DELETE /traffic/monitoring/roads/{id}`
- `POST /traffic/monitoring/readings`, `POST /traffic/monitoring/readings/simulate`
- `GET /traffic/monitoring/live`, `GET /traffic/monitoring/utilization`

**Datasets used:**
https://www.kaggle.com/datasets/preethamgouda/banglore-city-traffic-dataset

---

### ✅ Milestone 2: Week 3 & 4 — Traffic Prediction & Route Optimization

- **Traffic Prediction Module**: trains a Ridge regression model per road on its historical readings (time-of-day and day-of-week encoded cyclically, plus a trend term), forecasts vehicle count and congestion level N hours ahead
- **Congestion forecasting workflows**: on-demand forecasting per road, with a minimum-data-points safeguard and a bounded prediction range to prevent unrealistic extrapolation
- **Traffic prediction reports**: side-by-side current vs. predicted view for every road, with trend indicators (increasing / decreasing / stable)
- **Maps integration**: live map view (Google Maps JavaScript API) plotting all monitored roads as color-coded pins based on real-time congestion level
- **Route analysis**: origin/destination road selector comparing a direct route against alternate routes via other monitored roads
- **Travel time estimation**: distance (haversine formula between road coordinates) combined with congestion-based speed estimates to calculate realistic travel times, and recommend whichever route is genuinely fastest given current conditions

**Outcomes:**
- Implement traffic prediction and route optimization systems
- Build AI-based congestion forecasting workflows
- Understand transportation analytics and smart routing concepts
- Generate real-time traffic prediction insights

**Key endpoints:**
- `POST /traffic/prediction/forecast/{road_id}?hours_ahead=1`
- `GET /traffic/prediction/report`
- `GET /traffic/prediction/history/{road_id}`
- `GET /traffic/routes/recommend?origin_road_id=&destination_road_id=`

---

### ✅ Milestone 3: Week 5 & 6 — Alerts, Analytics & AI Insights

- **Alert & Notification Module**: automatic congestion alerts (fires when a road hits severe congestion, with duplicate-prevention so the same unresolved alert doesn't spam), manual accident / road closure / emergency reporting by admins and operators, resolve/delete workflows, and public read-only visibility
- **Analytics Dashboard**: 8 summary cards (total roads, total vehicles today, average utilization, busiest/least congested zone, alerts generated today, average speed, prediction accuracy) each with a real today-vs-yesterday comparison computed from actual historical readings — no comparison is shown as faked when yesterday's data doesn't exist yet
- **Congestion heatmap**: zone-level cards color-banded by utilization (0–40% green, 40–70% yellow, 70–90% orange, 90%+ red), each showing average utilization, road count, total vehicles, and the most/least congested road in that zone
- **Road performance tracking**: a searchable, filterable, sortable table of every road ranked by utilization, with per-road trend and the current best/worst performer flagged
- **AI Recommendations Module**: generates a real, forecast-driven recommendation per road — combines the road's current status with a freshly trained prediction, assigns a priority (Critical / High / Medium / Low) based on the *forecast* rather than just current conditions, and produces a plain-English recommendation. Roads without enough history to forecast are clearly marked rather than given a fake prediction

**Outcomes:**
- Build traffic analytics and monitoring systems
- Implement alert and notification workflows
- Understand AI-driven traffic analysis concepts
- Complete end-to-end smart traffic management workflows

**Key endpoints:**
- `GET /traffic/alerts`, `POST /traffic/alerts`, `PUT /traffic/alerts/{id}/resolve`, `DELETE /traffic/alerts/{id}`
- `GET /traffic/analytics/dashboard`, `GET /traffic/analytics/zones`, `GET /traffic/analytics/performance`
- `GET /traffic/analytics/heatmap`, `GET /traffic/analytics/summary`
- `GET /traffic/ai/recommendations?hours_ahead=1`

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
│   │       ├── route_analysis/        # route + travel time estimation
│   │       ├── alerts/                # congestion/accident/closure/emergency alerts
│   │       ├── analytics/             # dashboard summary, heatmap, performance
│   │       └── ai_recommendations/    # forecast-driven per-road recommendations
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
    │       ├── routes/                # route analysis
    │       ├── alerts/                # alert feed + incident reporting
    │       ├── analytics/             # summary cards, heatmap, performance table
    │       ├── ai-recommendations/    # AI recommendation cards
    │       └── users/                 # admin user management (list/deactivate)
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
| Admin | Full access — manage users, roads, alerts, and all data |
| Traffic Operator | Manage roads, submit readings, generate forecasts, report/resolve alerts |
| Public | Read-only access to live traffic, predictions, and alerts |

---

## Known Limitations

- Travel time and route recommendations use straight-line (haversine) distance between roads rather than real road-network routing, since the project doesn't yet integrate a routing/directions API.
- Prediction model accuracy (R² score) is currently limited by the amount of historical data available per road — accuracy improves as more readings accumulate over time.
- Google Maps integration uses a Demo Key, suitable for development/demo purposes; a production deployment would require a billed API key.
- "Busiest zone" / "least congested zone" are ranked by **average** utilization across all roads in that zone — a zone can rank as less congested overall even if it contains one severely congested road, if its other roads are light. The heatmap and performance table surface the individual road-level detail to compensate for this.
- AI recommendation priority is based on the **forecast**, not just current conditions — a road that's currently severe but predicted to ease will show a lower priority than its current status alone would suggest. This is intentional (the report is meant to say what's coming, not repeat what the live dashboard already shows), but worth explaining if asked.

---

## What's Next (Milestone 4: Week 7 & 8 — Testing, Deployment & Documentation)

- Perform application testing and workflow validation
- Improve UI responsiveness and system optimization
- Deploy platform using Docker and cloud environments
- Prepare final project documentation and presentation
- Demonstrate the complete TrafficVision AI platform

**Target Outcomes:**
- Gain deployment and testing experience
- Improve platform stability and usability
- Complete live deployment and final demonstration
- Prepare professional project documentation and presentation