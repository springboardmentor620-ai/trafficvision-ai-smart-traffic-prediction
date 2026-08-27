# 🚦 TrafficVision AI

### Smart Traffic Monitoring & Congestion Management System

_A full-stack web application for real-time traffic monitoring, secure user authentication, and intelligent traffic management, built using React, FastAPI, and PostgreSQL._

## 📖 Project Description

TrafficVision AI is a full-stack Smart Traffic Monitoring and Congestion Management System designed to improve urban transportation through Artificial Intelligence, Machine Learning, and real-time traffic analytics.

The project is being developed as part of the Infosys Springboard Internship to simulate a modern Intelligent Transportation System (ITS) capable of monitoring traffic conditions, predicting congestion, recommending optimal travel routes, and assisting commuters and traffic authorities with data-driven decision making.

The system follows a scalable client-server architecture consisting of:

- React + Vite frontend
- FastAPI backend
- PostgreSQL database
- Machine Learning prediction service
- Interactive Leaflet & Canvas traffic visualization
- Background real-time traffic simulation service
- Multi-container Docker Compose deployment

Currently, the application provides secure JWT-based authentication, 2-Step OTP email verification, Google OAuth integration, Role-Based Access Control (RBAC), live traffic monitoring, AI-powered congestion prediction using a trained Random Forest Regression model, interactive map visualization, AI-assisted route recommendation, comprehensive analytics dashboards, multi-tier historical traffic analytics, intelligent emergency traffic alerts with automated SMTP email dispatch, 6-camera CCTV canvas intersection monitoring, PDF report generation, AI-generated traffic insights, route optimization, and real-time administrative monitoring tools.

The machine learning pipeline includes dataset preprocessing, feature engineering, model comparison, hyperparameter tuning, model serialization using Joblib, and deployment through FastAPI REST APIs.

## 🚧 Project Status

**Completed Milestone:** Milestone 1: Week 1 & 2 — Project Initialization, Design Process & Core Setup

**Completed Milestone:** Milestone 2: Week 3 & 4 — Traffic Prediction & Route Optimization

**Completed Milestone:** Milestone 3: Week 5 & 6 — Alerts, Analytics & AI Insights

**Completed Milestone:** Milestone 4: Week 7 & 8 — Testing, Deployment & Documentation

---

### ✅ Completed

#### Core System

- Project architecture and modular folder structure
- Backend setup using FastAPI
- Frontend setup using React (Vite)
- PostgreSQL database integration
- SQLAlchemy ORM configuration
- JWT Authentication & OAuth2 Password Flow
- 2-Step OTP Security for Login and Registration
- Google OAuth Sign-In & Instant Provisioning
- Password Reset via Email OTP
- Fake / Disposable Email Registration Defense
- Role-Based Access Control (RBAC: Admin, Traffic Operator, Commuter)
- User Management Center (CRUD accounts & role assignments)
- Background Live Traffic Simulation Engine
- Automated High Congestion SMTP Email Alert Dispatch
- Telegram-Style Seamless Circular Reveal Dark Mode Transition
- Docker Containerization (Frontend, Backend, DB, Simulator)
- Protected API endpoints & CORS middleware
- Frontend–Backend–Database connectivity
- Historical Traffic Analytics Module (Low, Moderate, High risk distributions)
- Traffic Alert Management System
- Prediction History Management
- PDF Report Generation System

#### Dashboard

- Live Traffic Monitoring Dashboard
- Traffic Summary Cards with live synchronization
- Traffic Trend Chart (Recharts)
- Live Traffic Data Table with search and pagination
- Dashboard Layout & Responsive Sidebar
- Role-specific dashboards (Admin, Traffic Operator, Commuter)
- Public Navigation Bar & Landing Page
- 2-Step Login & Registration Interface
- Forgot Password & Reset UI
- Historical Analytics Dashboard with Multi-tier Risk Breakdown
- Traffic Distribution Dashboard (Pie & Bar charts)
- AI Insights Dashboard
- Alert Monitoring Dashboard
- 6-Camera CCTV Intersection Surveillance Console
- PDF Report Generation & Export Dashboard
- Route Optimization & A* Bypass Planner

#### Machine Learning

- Dataset Selection & Ingestion
- Data Quality Assessment
- Missing Value Analysis
- Duplicate Analysis
- Exploratory Data Analysis (EDA)
- Feature Engineering (Traffic Category, Speed, Capacity Utilization, Weather, Incidents)
- Data Preprocessing Pipeline
- Decision Tree Model
- Random Forest Model
- Extra Trees Model
- Gradient Boosting Model
- Model Performance Comparison
- Hyperparameter Tuning
- Final Random Forest Model Selection
- Model Serialization using Joblib

#### Artificial Intelligence

- FastAPI Prediction API (`/prediction/predict`)
- Real-time Multi-factor Congestion Inference
- AI Congestion Prediction Dashboard
- Interactive Prediction Form
- AI Prediction Cards & Velocity Gauges
- AI Recommendation Panel & Action Directives
- Automated AI Emergency Alerts
- Prediction History Tracking
- AI Congestion Analytics & Historical Correlations
- Multi-tier Risk Categorization (Low, Moderate, High)
- Alternate Route Recommendation

#### Map & Route Visualization

- Interactive Leaflet Map & OpenStreetMap Tiles
- Dynamic Traffic Markers across 18+ Bengaluru Corridors
- Color-coded Congestion Velocity Indicators
- Live Corridor Information Popups
- Real-time Traffic Heat Map Layer
- AI Route Planner with Interactive Origin & Destination Pickers
- A* Algorithm Bypass Route Computation
- Step-by-Step Navigation & Travel Time Estimation

#### Surveillance & Edge Simulation

- 6 Strategic Intersection Camera Nodes
- HTML5 Canvas Computer Vision Rendering Engine
- 5 Simulated Vehicle Classifications (Car, Bus, Auto, Bike, Truck)
- YOLO-Style AI Bounding Boxes with Confidence & Velocity Tags
- Dynamic Density & Speed Regulation based on Congestion Status
- Multi-Camera Grid and Detailed Single-Camera Inspector Modes

#### Development & DevOps

- Git Version Control & GitHub Repository
- Multi-container Docker Compose Architecture
- Nginx Web Server configuration
- Modular Service Layer Architecture
- Swagger UI & ReDoc API Documentation
- Structured Error Handling & Input Validation

---

### 🚧 Currently In Progress

- Multi-City and Pan-India Traffic Dataset Expansion
- Hardware Edge Telemetry Streaming Integration
- Automated Adaptive Traffic Signal Phasing Interface
- Cloud CI/CD Automated Staging Deployment

---

### 📅 Upcoming Milestones

- Multi-State Real-Time Traffic Mesh
- Physical IoT Road Sensor Telemetry Streaming
- Distributed Edge AI Acceleration (ONNX / TensorRT)
- Municipal Traffic Management Cloud Deployment

## 🎯 Project Objectives

The primary objectives of TrafficVision AI are:

- Develop a scalable full-stack Smart Traffic Management System.
- Monitor traffic conditions in real time through an interactive dashboard.
- Implement secure user authentication using JWT, 2-Step OTP email verification, and Google OAuth.
- Enforce Role-Based Access Control (RBAC) for Admin, Operator, and Commuter roles.
- Build a modular and maintainable backend using FastAPI and SQLAlchemy.
- Integrate a PostgreSQL database for reliable data storage and retrieval.
- Establish seamless communication between frontend, backend, simulator, and database.
- Predict traffic congestion dynamically using a trained Random Forest Regression model.
- Generate intelligent traffic alerts and dispatch automated emergency emails when severe congestion occurs.
- Provide historical traffic analytics for trend analysis, risk distribution, and administrative decision-making.
- Generate downloadable PDF traffic reports for administrators and municipal authorities.
- Deliver AI-driven recommendations and alternate route suggestions to minimize urban delays.
- Package the entire system into portable Docker containers for streamlined deployment.

## ✨ Features

### ✅ Current Features

### 🔐 Authentication & Security

- JWT (JSON Web Token) Access Authentication
- 2-Step OTP Verification for Account Registration
- 2-Step OTP Verification for Account Login
- Google OAuth 2.0 Sign-In and Automatic Provisioning
- Password Reset Flow with 6-Digit Email OTP Verification
- Disposable & Fake Email Domain Defense
- Role-Based Access Control (RBAC: Admin, Traffic Operator, Commuter)
- Password Hashing using Bcrypt
- User Profile Management & Password Updates
- Admin User Management Center (Create, Update, Role Assignment, Deletion)

### 🛠 Backend Architecture

- FastAPI High-Performance REST API
- PostgreSQL Relational Database
- SQLAlchemy ORM with Connection Pooling
- Pydantic Schema Validation & Type Safety
- Environment Variable Configuration via `.env`
- Modular Service Layer & Router Architecture
- Background Traffic Simulation Worker
- Asynchronous SMTP Email Dispatch Service (OTP & Incident Alerts)
- CORS Middleware Configuration

### 💻 Frontend User Experience

- React + Vite Single Page Application
- React Router Client-Side Routing
- Telegram-Style Seamless Circular Reveal Dark Mode Transition
- Responsive Collapsible Hover Sidebar
- Clean Modern UI Design System with Dynamic CSS Tokens
- Axios API Layer with Bearer Token Interceptors
- Public Landing Page with Feature Showcases
- Interactive Auth Forms with Auto-Advancing OTP Inputs

### 🚦 Traffic Dashboard & Analytics

- Live Network Overview with Summary Cards
- Real-time Traffic Velocity & Volume Charts (Recharts)
- Live Traffic Data Table with Search and Filtering
- Role-Specific Tailored Consoles for Admin, Operator, and Commuter
- Historical Analytics Center with Low, Moderate, and High Risk Distribution
- Corridor Volume Rankings & Congestion Pie Distribution Charts
- Downloadable Official PDF Traffic Reports (ReportLab)
- Real-Time Alert Ticker & Incident Status Management

### 🤖 Machine Learning & AI

- Random Forest Congestion Regression Engine
- Real-time Traffic Feature Prediction API
- Multi-factor Input Analysis (Volume, Speed, Road Capacity, Weather, Roadwork, Incidents)
- Dynamic Prediction Level Mapping (Low < 30%, Moderate 30-69%, High ≥ 70%)
- AI Operational Recommendations & Detour Suggestions
- Prediction History Logging & Trend Analytics

### 🗺️ Interactive Maps & Route Navigation

- Interactive Leaflet Map with Custom Marker Clusters
- 18+ Arterial Corridors mapped across Bengaluru
- Color-Coded Congestion Status (Green: Normal, Yellow: Moderate, Red: Heavy)
- AI Route Planner with Origin & Destination Selection
- A* Algorithm Shortest & Least-Congested Route Calculation
- Estimated Travel Time, Distance, and Live Delay Feedback

### 📹 CCTV Surveillance Module

- 6 Arterial Intersection Camera Feeds
- HTML5 Canvas 2D Computer Vision Rendering Loop
- 5 Vehicle Classifications (Car, City Bus, Auto-Rickshaw, 2-Wheeler, Truck)
- YOLO-Style Bounding Boxes with Live Speeds & AI Confidence Ratings
- Speed Limit Monitoring and Lane-by-Lane Density Gauges
- Grid View and Single-Camera Inspector Modes

### 🐳 DevOps & Deployment

- Docker Containerization with Multi-Stage Builds
- Docker Compose Orchestration (Frontend, Backend, DB, Simulator)
- Nginx Production Static Asset Server
- Automated Database Initialization & Seeding

---

### 🚀 Planned Features

- Hardware IoT Sensor Stream Ingestion
- Multi-City and Pan-India Road Expansion
- Automated Cloud CI/CD Pipelines
- Distributed Edge Model Deployment

## 🛠️ Technology Stack

| Category | Technologies |
| --- | --- |
| **Frontend** | React, Vite, React Router, Axios |
| **Backend** | FastAPI, SQLAlchemy, Pydantic, Uvicorn |
| **Database** | PostgreSQL |
| **Authentication** | JWT, OAuth2, Google Identity OAuth, Passlib (bcrypt), OTP |
| **Machine Learning** | Scikit-learn, Pandas, NumPy, Joblib |
| **Visualization** | Leaflet, React-Leaflet, Recharts, HTML5 Canvas 2D |
| **Email & Alerts** | Python SMTPLib, Email MIMEMultipart |
| **Reports** | ReportLab (PDF Generation) |
| **DevOps & Containers** | Docker, Docker Compose, Nginx |
| **API Documentation** | Swagger UI, ReDoc |
| **Development Tools** | Git, GitHub, VS Code, pgAdmin |

## 📊 Machine Learning Workflow

TrafficVision AI follows a complete end-to-end Machine Learning pipeline for intelligent traffic congestion prediction and AI-assisted route recommendation.

1. Dataset Collection & Ingestion
2. Data Quality Assessment & Missing Value Handling
3. Exploratory Data Analysis (EDA)
4. Duplicate Data Removal & Outlier Filtering
5. Feature Engineering (Derived Traffic Category, Speed-to-Capacity ratios, Environmental indices)
6. Feature Encoding & Normalization Pipeline
7. Multi-Model Training (Decision Tree, Random Forest, Extra Trees, Gradient Boosting)
8. Cross-Validation & Model Performance Comparison
9. Hyperparameter Tuning using Grid Search
10. Final Random Forest Model Selection
11. Model Serialization using Joblib (`best_model.pkl`)
12. FastAPI Prediction API Development (`/prediction/predict`)
13. Interactive React Prediction Workspace Integration
14. Real-time Live Prediction & History Storage
15. Multi-tier Risk Analysis (Low, Moderate, High)
16. Automated AI Threshold Alert Generation & Emergency Email Notification
17. Alternate Route & Bypass Recommendation Generation
18. End-to-End Autonomous AI Traffic Flow Control

## 🏗️ System Architecture

```mermaid
flowchart TD

    A[👤 User / Admin / Operator / Commuter]

    A --> B[React + Vite Frontend]

    B --> C[Navigation & Dashboards]

    C --> D[AI Prediction Workspace]
    C --> E[Interactive Traffic Map - Leaflet]
    C --> F[CCTV 6-Camera Surveillance Canvas]
    C --> G[A* Route Optimization Planner]
    C --> H[Analytics & Historical Charts]
    C --> I[Alerts & Emergency Center]
    C --> J[PDF Reports Export]

    D --> K[Axios API Client]
    E --> K
    G --> K
    H --> K
    I --> K
    J --> K

    K --> L[FastAPI Backend Engine]

    L --> M[JWT & 2-Step OTP Auth]
    L --> N[Google OAuth Verification]
    L --> O[Traffic & Telemetry APIs]
    L --> P[AI Prediction APIs]
    L --> Q[Analytics & History APIs]
    L --> R[Alert & Emergency APIs]
    L --> S[PDF Report Generation APIs]
    L --> T[User Management APIs]

    P --> U[Random Forest ML Model - Joblib]

    L --> V[SQLAlchemy ORM Connection Pool]
    V --> W[(PostgreSQL Database)]

    R --> X[SMTP Email Alert Service]
    M --> X

    Y[🚦 Background Simulator Worker] --> L
```

## 📁 Project Structure

```text
trafficvision-ai-smart-traffic-prediction/
│
├── analysis/
│   ├── datasets/
│   │   ├── raw/
│   │   │   └── Banglore_traffic_Dataset.csv        # Original traffic dataset
│   │   └── processed/
│   │       └── traffic_processed.csv               # Preprocessed dataset
│   │
│   ├── models/
│   │   └── best_model.pkl                          # Trained Random Forest model
│   │
│   ├── notebooks/
│   │   ├── 00_environment_setup.ipynb              # Environment setup
│   │   ├── 01_dataset_evaluator.ipynb              # Dataset quality assessment
│   │   ├── 02_eda.ipynb                            # Exploratory Data Analysis
│   │   ├── 03_feature_engineering.ipynb            # Feature engineering
│   │   ├── 04_preprocessing.ipynb                  # Data preprocessing
│   │   ├── 05_model_training.ipynb                 # Model training
│   │   ├── 06_model_comparison.ipynb               # Model comparison
│   │   └── 07_hyperparameter_tuning.ipynb          # Hyperparameter tuning
│   │
│   └── src/
│       ├── eda.py                                  # EDA helper functions
│       ├── feature_engineering.py                  # Feature engineering pipeline
│       ├── preprocessing.py                        # Data preprocessing utilities
│       └── quality.py                              # Dataset quality utilities
│
├── backend/
│   ├── app/
│   │   ├── config/
│   │   │   └── auth.py                             # JWT & Security configuration
│   │   │
│   │   ├── constants/
│   │   │   ├── roles.py                            # Role definitions (admin, operator, commuter)
│   │   │   └── traffic.py                          # Traffic categories & threshold constants
│   │   │
│   │   ├── database/
│   │   │   ├── base.py                             # SQLAlchemy Base class
│   │   │   └── connection.py                       # PostgreSQL connection pool
│   │   │
│   │   ├── dependencies/
│   │   │   └── auth.py                             # Authentication & RBAC dependencies
│   │   │
│   │   ├── ml/
│   │   │   ├── best_model.pkl                      # Serialized ML model
│   │   │   └── predictor.py                        # ML Inference wrapper
│   │   │
│   │   ├── models/
│   │   │   ├── alert.py                            # Alert SQLAlchemy model
│   │   │   ├── notification.py                     # Notification SQLAlchemy model
│   │   │   ├── prediction_history.py               # Prediction history SQLAlchemy model
│   │   │   ├── report.py                           # Report SQLAlchemy model
│   │   │   ├── road.py                             # Road SQLAlchemy model
│   │   │   ├── traffic.py                          # Traffic SQLAlchemy model
│   │   │   ├── user.py                             # User SQLAlchemy model
│   │   │   └── zone.py                             # Zone SQLAlchemy model
│   │   │
│   │   ├── routers/
│   │   │   ├── alerts.py                           # Alert management endpoints
│   │   │   ├── analytics.py                        # Analytics summary endpoints
│   │   │   ├── history.py                          # General history endpoints
│   │   │   ├── notifications.py                    # Notification endpoints
│   │   │   ├── prediction.py                       # AI prediction endpoints
│   │   │   ├── prediction_history.py               # Prediction history endpoints
│   │   │   ├── reports.py                          # PDF report endpoints
│   │   │   ├── roads.py                            # Road inventory CRUD endpoints
│   │   │   ├── routes.py                           # Route recommendation endpoints
│   │   │   ├── traffic.py                          # Live traffic telemetry endpoints
│   │   │   ├── user.py                             # Auth, OTP, Google OAuth & User endpoints
│   │   │   └── zones.py                            # Zone topology CRUD endpoints
│   │   │
│   │   ├── schemas/
│   │   │   ├── alert.py                            # Alert Pydantic schemas
│   │   │   ├── notification.py                     # Notification Pydantic schemas
│   │   │   ├── prediction.py                       # Prediction Pydantic schemas
│   │   │   ├── prediction_history.py               # Prediction history Pydantic schemas
│   │   │   ├── report.py                           # Report Pydantic schemas
│   │   │   ├── road.py                             # Road Pydantic schemas
│   │   │   ├── traffic.py                          # Traffic Pydantic schemas
│   │   │   ├── user.py                             # User & Auth Pydantic schemas
│   │   │   └── zone.py                             # Zone Pydantic schemas
│   │   │
│   │   ├── services/
│   │   │   ├── alert_service.py                    # Alert business logic & trigger rules
│   │   │   ├── analytics_service.py                # Analytics aggregation service
│   │   │   ├── email_service.py                    # SMTP email dispatch service
│   │   │   ├── history_service.py                  # Historical traffic data service
│   │   │   ├── notification_service.py             # User notification service
│   │   │   ├── otp_service.py                      # 2-Step OTP security service
│   │   │   ├── prediction_history_service.py       # Prediction history service
│   │   │   ├── report_service.py                   # Report metadata service
│   │   │   ├── road_service.py                     # Road management service
│   │   │   ├── route_service.py                    # A* route optimization service
│   │   │   ├── traffic_service.py                  # Real-time traffic service
│   │   │   └── zone_service.py                     # Zone management service
│   │   │
│   │   ├── utils/
│   │   │   ├── email_validator.py                  # Email authenticity & disposable domain filter
│   │   │   ├── pdf_generator.py                    # ReportLab PDF generation utility
│   │   │   └── security.py                         # Bcrypt hashing & JWT utility
│   │   │
│   │   └── main.py                                 # FastAPI application entry point
│   │
│   ├── .dockerignore                               # Docker build ignore rules
│   ├── .env                                        # Backend environment variables
│   ├── .env.example                                # Sample backend configuration
│   ├── Dockerfile                                  # Backend Docker build specification
│   ├── requirements.txt                            # Python backend dependencies
│   ├── seed_users.py                               # Database seed utility for default users
│   └── simulator.py                                # Dynamic real-time traffic simulator
│
├── frontend/
│   ├── public/
│   │   ├── favicon.svg                             # Website favicon
│   │   ├── icons.svg                               # SVG icon collection
│   │   └── logo.svg                                # Vector brand logo
│   │
│   ├── src/
│   │   ├── assets/                                 # Static graphic assets
│   │   │
│   │   ├── components/
│   │   │   ├── alerts/                             # Alert UI components
│   │   │   ├── analytics/                          # Analytics chart & summary components
│   │   │   ├── common/
│   │   │   │   ├── GoogleAuthButton.jsx            # Google OAuth button component
│   │   │   │   ├── Logo.jsx                        # Brand logo component
│   │   │   │   └── NotificationPanel.jsx           # Notification drawer component
│   │   │   ├── dashboard/                          # Dashboard & Map components
│   │   │   ├── maps/                               # Map presentation components
│   │   │   ├── reports/                            # Report UI components
│   │   │   ├── roads/                              # Road management forms & cards
│   │   │   ├── zones/                              # Zone management forms & cards
│   │   │   ├── FeaturesSection.jsx                 # Homepage features section
│   │   │   ├── HeroSection.jsx                     # Homepage hero banner
│   │   │   ├── HowItWorksSection.jsx               # Workflow section
│   │   │   ├── Navbar.jsx                          # Dashboard navigation bar
│   │   │   ├── ProtectedRoute.jsx                  # Route authentication guard
│   │   │   ├── PublicNavbar.jsx                    # Public website navigation bar
│   │   │   ├── RoleProtectedRoute.jsx              # RBAC route authorization guard
│   │   │   ├── RoleShowcaseSection.jsx             # Role capabilities showcase
│   │   │   ├── Sidebar.jsx                         # Collapsible hover sidebar
│   │   │   ├── TrafficCard.jsx                     # Stat summary card
│   │   │   ├── TrafficChart.jsx                    # Velocity trend chart
│   │   │   └── TrafficTable.jsx                    # Live traffic records table
│   │   │
│   │   ├── constants/                              # Frontend static constants
│   │   │
│   │   ├── context/
│   │   │   ├── SidebarContext.jsx                  # Sidebar state context
│   │   │   └── ThemeContext.jsx                    # Telegram-style theme transition context
│   │   │
│   │   ├── pages/
│   │   │   ├── admin/
│   │   │   │   ├── Alerts.jsx                      # Alerts & Incident center
│   │   │   │   ├── Analytics.jsx                   # Deep traffic analytics
│   │   │   │   ├── Dashboard.jsx                   # Admin root dashboard
│   │   │   │   ├── HistoricalAnalytics.jsx         # Multi-tier historical analytics & audit
│   │   │   │   ├── Reports.jsx                     # PDF reports center
│   │   │   │   ├── RoadManagement.jsx              # Road inventory management
│   │   │   │   ├── RouteOptimization.jsx           # A* route planner & detour engine
│   │   │   │   ├── Settings.jsx                    # Profile & system governance page
│   │   │   │   ├── TrafficMonitoring.jsx           # 6-Camera CCTV surveillance console
│   │   │   │   ├── UserManagement.jsx              # User administration & role governance
│   │   │   │   └── ZoneManagement.jsx              # Traffic zone topology
│   │   │   │
│   │   │   ├── commuter/
│   │   │   │   ├── CityTrafficMap.jsx              # Commuter interactive city traffic map
│   │   │   │   └── Dashboard.jsx                   # Commuter live mobility portal
│   │   │   │
│   │   │   ├── operator/
│   │   │   │   ├── Dashboard.jsx                   # Traffic operator console
│   │   │   │   └── Prediction.jsx                  # AI prediction workspace
│   │   │   │
│   │   │   ├── ForgotPassword.jsx                  # 2-Step OTP password reset page
│   │   │   ├── Home.jsx                            # Public landing page
│   │   │   ├── Login.jsx                           # 2-Step OTP login & Google OAuth page
│   │   │   └── Register.jsx                        # 2-Step OTP registration & Google OAuth page
│   │   │
│   │   ├── services/                               # Axios API service modules
│   │   ├── styles/                                 # Modular CSS stylesheets
│   │   ├── App.jsx                                 # Application routes & layout root
│   │   └── main.jsx                                # React application entry point
│   │
│   ├── .dockerignore                               # Frontend Docker ignore rules
│   ├── .env                                        # Frontend environment variables
│   ├── .env.example                                # Sample frontend configuration
│   ├── Dockerfile                                  # Frontend multi-stage Nginx Dockerfile
│   ├── eslint.config.js                            # ESLint configuration
│   ├── index.html                                  # HTML entry page
│   ├── nginx.conf                                  # Production Nginx configuration
│   ├── package.json                                # Frontend dependencies
│   ├── package-lock.json                           # Locked dependency versions
│   └── vite.config.js                              # Vite build configuration
│
├── docker-compose.yml                              # Multi-container Docker orchestration
├── LICENSE                                         # MIT License
├── project_structure.txt                           # Project directory snapshot
└── README.md                                       # Main documentation
```

## 🚀 Getting Started

Follow the steps below to set up and run **TrafficVision AI** on your local machine using either **Docker Compose** (Recommended) or manual local setup.

### 📋 Prerequisites

| Software | Recommended Version |
| --- | --- |
| Docker & Docker Desktop | Latest Version |
| Python | 3.11 or later |
| Node.js | 20.x LTS or later |
| PostgreSQL | 16 or later |
| Git | Latest Version |

---

### 🐳 Running with Docker Compose (Recommended)

1. Clone the repository and navigate into the project directory:

```bash
git clone https://github.com/springboardmentor620-ai/trafficvision-ai-smart-traffic-prediction.git
cd trafficvision-ai-smart-traffic-prediction
```

2. Build and start all multi-container services in detached mode:

```bash
docker compose up -d --build
```

3. Access the services:
- **Frontend Web Application**: `http://localhost:3000` (or `http://localhost:5173` if running locally)
- **FastAPI Backend & Swagger UI**: `http://localhost:8000/docs`
- **PostgreSQL Database**: Port `5432`

---

### ⚙️ Manual Local Setup

#### Backend Setup

1. Navigate to the backend folder:

```bash
cd backend
```

2. Create and activate a Python virtual environment:

```bash
python -m venv venv
```

**Windows (PowerShell)**:
```powershell
venv\Scripts\Activate.ps1
```

**Linux/macOS**:
```bash
source venv/bin/activate
```

3. Install backend dependencies:

```bash
pip install -r requirements.txt
```

4. Configure the backend `.env` file:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/trafficvision_db
SECRET_KEY=trafficvision_super_secret_jwt_key_2026
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
SIMULATOR_INTERVAL_SECONDS=5
```

5. Start the FastAPI backend server:

```bash
python -m uvicorn app.main:app --reload --port 8000
```

6. In a separate terminal, start the background traffic simulator:

```bash
cd backend
python simulator.py
```

---

#### Frontend Setup

1. In a new terminal, navigate to the frontend folder:

```bash
cd frontend
```

2. Install dependencies:

```bash
npm install
```

3. Start the Vite development server:

```bash
npm run dev
```

4. Open your browser:

```text
http://localhost:5173
```

## 🌐 API Overview

The TrafficVision AI backend exposes modular REST APIs across 12 domain routers for authentication, traffic telemetry, AI predictions, analytics, alerts, reports, roads, routes, zones, notifications, and user administration.

### 🔐 Authentication & Security APIs

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| POST | `/register` | Public | Standard commuter registration |
| POST | `/login` | Public | Standard OAuth2 username/password login |
| POST | `/auth/send-register-otp` | Public | Validates email domain and dispatches 6-digit registration OTP |
| POST | `/auth/verify-register-otp` | Public | Verifies 6-digit OTP and creates verified commuter account |
| POST | `/auth/login-step1` | Public | Validates credentials and sends 2-Step verification OTP |
| POST | `/auth/login-verify-otp` | Public | Verifies 2-Step OTP and returns signed JWT access token |
| POST | `/auth/forgot-password` | Public | Sends password reset OTP code to registered email |
| POST | `/auth/reset-password` | Public | Verifies reset OTP and updates user's password |
| POST | `/auth/google-auth` | Public | Authenticates via Google OAuth 2.0 credential |

---

### 👤 User Administration APIs

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| GET | `/me` | Authenticated | Retrieve current user's profile |
| PUT | `/me` | Authenticated | Update current user's name or password |
| GET | `/users` | Admin Only | Retrieve list of all registered users |
| POST | `/admin/users` | Admin Only | Create user account with specified role |
| PUT | `/admin/users/{user_id}` | Admin Only | Update name, email, password, or role of user |
| DELETE | `/admin/users/{user_id}` | Admin Only | Delete user account (prevents self-lockout) |
| POST | `/admin/users/cleanup-fake-emails` | Admin Only | Purge accounts with disposable/fake email domains |

---

### 🤖 AI Prediction APIs

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| POST | `/prediction/predict` | Authenticated | Run Random Forest congestion prediction |
| GET | `/prediction/history` | Authenticated | Retrieve recent prediction logs |
| GET | `/prediction/trends` | Authenticated | Retrieve prediction trends |
| GET | `/prediction-history` | Authenticated | Retrieve stored prediction history records |

---

### 🚦 Live Traffic Telemetry APIs

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| GET | `/traffic` | Authenticated | Retrieve real-time traffic volume, speed, and status |

---

### 📊 Analytics APIs

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| GET | `/analytics/summary` | Authenticated | Retrieve aggregated network metrics & congestion counts |

---

### 🚨 Alert & Emergency APIs

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| GET | `/alerts` | Authenticated | Retrieve active and resolved traffic alerts |
| POST | `/alerts` | Authorized | Create a traffic alert & trigger email notifications |
| PUT | `/alerts/{alert_id}` | Authorized | Update alert status (e.g. resolve alert) |
| DELETE | `/alerts/{alert_id}` | Authorized | Remove an alert record |

---

### 📄 Report APIs

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| GET | `/reports/download` | Authenticated | Generate and download official PDF traffic report |

---

### 🛣️ Road Inventory APIs

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| GET | `/roads` | Authenticated | Retrieve all monitored corridors |
| POST | `/roads` | Admin/Operator | Register a new road corridor |
| GET | `/roads/{road_id}` | Authenticated | Retrieve road details by ID |
| PUT | `/roads/{road_id}` | Admin/Operator | Update road metadata |
| DELETE | `/roads/{road_id}` | Admin/Operator | Remove a road from monitoring |
| GET | `/roads/zone/{zone_id}` | Authenticated | Retrieve roads by municipal zone |

---

### 🗺️ Zone Topology APIs

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| GET | `/zones` | Authenticated | Retrieve traffic zones |
| POST | `/zones` | Admin/Operator | Create a new traffic zone |
| GET | `/zones/{zone_id}` | Authenticated | Retrieve zone details |
| PUT | `/zones/{zone_id}` | Admin/Operator | Update zone information |
| DELETE | `/zones/{zone_id}` | Admin/Operator | Delete a zone |

---

### 🧭 Route Optimization APIs

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| GET | `/routes` | Authenticated | Retrieve optimized route suggestions |

---

### 🔔 Notification APIs

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| GET | `/notifications` | Authenticated | Retrieve user notification inbox |
| POST | `/notifications` | Authorized | Dispatch a notification |
| PUT | `/notifications/{notification_id}` | Authenticated | Mark notification as read |
| DELETE | `/notifications/{notification_id}` | Authenticated | Delete a notification |

---

### 📈 Historical Telemetry APIs

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| GET | `/history` | Authenticated | Retrieve historical traffic telemetry records |

---

### 📚 API Documentation

FastAPI automatically serves interactive API documentation:

- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

## 📅 Development Progress

The development of **TrafficVision AI** has been completed across multiple structured engineering phases:

---

### 🚀 Phase 1: Project Initialization & Core Architecture

**Status: ✅ Completed**

- Selected project technology stack (React, Vite, FastAPI, PostgreSQL, Scikit-learn).
- Created GitHub repository and designed client-server architecture.
- Configured backend and frontend folder structure and environment configurations.
- Established Git workflow and dependency management.

---

### 🗄️ Phase 2: Backend, Database & Service Architecture

**Status: ✅ Completed**

- Developed FastAPI backend with modular routers and schemas.
- Configured PostgreSQL connection pool with SQLAlchemy ORM models.
- Implemented automatic database initialization and seeding.
- Created service layers for traffic, predictions, alerts, analytics, reports, roads, and zones.

---

### 🔐 Phase 3: Authentication, 2-Step OTP & RBAC Security

**Status: ✅ Completed**

- Implemented JWT token generation, validation, and refresh.
- Built 2-Step OTP email verification for registration and login.
- Integrated Google OAuth 2.0 sign-in and automated profile provisioning.
- Implemented secure password reset via 6-digit email OTP.
- Implemented disposable and fake email domain filtering.
- Implemented Role-Based Access Control (Admin, Operator, Commuter) with route guards.

---

### 💻 Phase 4: Frontend UI, Theming & Navigation

**Status: ✅ Completed**

- Built React application using Vite and React Router.
- Implemented Telegram-style seamless circular reveal dark mode transitions.
- Designed collapsible hover sidebar and role-specific navigation bars.
- Built clean, responsive auth pages with interactive OTP input fields.

---

### 📊 Phase 5: Dashboards, Analytics & Reporting

**Status: ✅ Completed**

- Created Admin, Operator, and Commuter dashboard portals.
- Developed real-time summary cards synchronized across consoles.
- Built Historical Analytics dashboard with Low, Moderate, and High risk distribution charts.
- Implemented PDF report generation and download using ReportLab.
- Built Alert management center and real-time notification feeds.

---

### 🤖 Phase 6: Machine Learning & Predictive Modeling

**Status: ✅ Completed**

- Performed exploratory data analysis (EDA), cleaning, and feature engineering.
- Trained and evaluated Decision Tree, Extra Trees, Gradient Boosting, and Random Forest models.
- Performed hyperparameter tuning and selected best Random Forest model.
- Serialized trained model with Joblib and deployed in FastAPI prediction pipeline.
- Added automated AI alert trigger when high congestion is detected.

---

### 🗺️ Phase 7: Map Navigation, Route Optimization & CCTV Surveillance

**Status: ✅ Completed**

- Built interactive Leaflet map with 18+ Bengaluru arterial corridor markers.
- Implemented A* shortest and least-congested route optimization planner.
- Built 6-camera CCTV intersection surveillance console with HTML5 Canvas.
- Implemented YOLO-style AI bounding box overlays with live confidence and velocity tags.
- Built dynamic vehicle flow regulation based on corridor congestion status.

---

### 🐳 Phase 8: Containerization & Production Deployment

**Status: ✅ Completed**

- Created multi-stage Dockerfiles for frontend (Nginx) and backend (FastAPI).
- Configured multi-container Docker Compose stack (frontend, backend, db, simulator).
- Optimized database connection pooling and backend performance.
- Validated end-to-end automated tests across all services.

## 🛠️ Problems Faced & Solutions

During the development of TrafficVision AI, several technical challenges were encountered and resolved.

| Problem | Solution |
| --- | --- |
| Python environment setup and PATH configuration | Configured virtual environment and verified PATH bindings. |
| Missing PostgreSQL database driver | Configured `psycopg2-binary` and verified SQLAlchemy connection strings. |
| CORS errors between React and FastAPI | Configured FastAPI `CORSMiddleware` with allowed origins and credentials. |
| OAuth2 authentication format mismatch | Standardized login requests to use `OAuth2PasswordRequestForm` with fallback JSON support. |
| Dark mode transition popping | Implemented View Transitions API with circular radial reveal from click coordinates. |
| Moderate-only predictions in history | Updated simulator to generate realistic multi-factor feature distributions (Volume, Speed, Capacity). |
| Disposable/fake email registrations | Implemented domain blacklist and format validation in backend and frontend. |
| Operator vs. Admin dashboard metric discrepancies | Synchronized `DashboardCards.jsx` to fetch directly from `/analytics/summary`. |
| OTP delivery in development environments | Built dual-mode OTP service supporting SMTP email dispatch and local Docker logging. |
| CCTV stream restrictions on public feeds | Built high-fidelity Canvas 2D simulation with interchangeable RTSP/HLS stream interfaces. |
| Large bundle sizes on frontend build | Split vendor chunks and optimized Vite build configuration. |
| Database connection exhaust under load | Configured SQLAlchemy connection pool with `pool_size=20` and `max_overflow=30`. |

## 🧪 Testing

The following comprehensive tests have been conducted across the backend, database, authentication, machine learning, and frontend modules to verify system reliability:

| Component / Feature | Test Scope | Status | Testing Method |
| --- | --- | --- | --- |
| **2-Step OTP Registration** | Email validation, OTP dispatch, code verification, account creation | ✅ Passed | Automated API test suite & Form submission |
| **2-Step OTP Login** | Credential check, OTP generation, 2FA code verification, JWT issuance | ✅ Passed | Automated Python script & Interactive UI |
| **Google OAuth 2.0** | Token exchange, automated user provisioning, session establishment | ✅ Passed | Google Identity client & Auth API verification |
| **Password Reset Flow** | Email OTP dispatch, verification, bcrypt password update, re-login | ✅ Passed | Automated API test & Forgot Password UI |
| **Fake Email Defense** | Disposable domain rejection (`mailinator`, `tempmail`, etc.) | ✅ Passed | Blacklist validation test (HTTP 400 rejection) |
| **Role-Based Access Control** | Admin, Operator, Commuter route protection & permission barriers | ✅ Passed | Protected route guards & unauthorized access tests |
| **AI ML Prediction Engine** | Random Forest model inference, confidence scores, recommendations | ✅ Passed | Swagger UI (`/prediction/predict`) & batch test |
| **Dynamic Telemetry Simulator** | Multi-tier risk generation (Low <30%, Mod 30-69%, High ≥70%) | ✅ Passed | Simulator loop verification & history assertions |
| **High Congestion Email Alerts** | Emergency alert creation and asynchronous SMTP email dispatch | ✅ Passed | High congestion trigger test & SMTP service check |
| **6-Camera CCTV Surveillance** | Canvas 2D rendering, YOLO bounding boxes, vehicle class tracking | ✅ Passed | Browser rendering test & stream speed scaling |
| **Route Optimization Engine** | A* algorithm shortest path & congestion-aware detour calculation | ✅ Passed | Route optimization API & interactive map planner |
| **Historical Analytics Sync** | Live 5-second polling of distribution pie charts & velocity graphs | ✅ Passed | Real-time telemetry feed verification |
| **Console Synchronization** | Metric consistency between Admin Dashboard and Operator Console | ✅ Passed | Dashboard summary API consistency assertion |
| **PDF Report Generation** | PDF structure, traffic audit tables, and download streaming | ✅ Passed | `/reports/download` endpoint & PDF inspection |
| **Docker Compose Stack** | Frontend (Nginx), Backend, PostgreSQL, and Simulator health | ✅ Passed | `docker compose up --build` healthcheck validation |
| **Theme Switching Engine** | Telegram-style circular wipe animation (Light ↔ Dark) | ✅ Passed | Browser View Transitions API verification |

## 🗺️ Roadmap

The following enhancements are planned for future versions of TrafficVision AI:

### 🎨 User Interface & Experience

- Mobile Progressive Web App (PWA) support
- Multi-language localization (Kannada, Hindi, English)
- Voice-assisted commuter navigation

### 🚦 Advanced Traffic Management

- Physical IoT radar and inductive loop sensor telemetry streaming
- Adaptive traffic signal timing hardware controllers
- Automated incident detection via live RTSP video stream ingestion

### 🤖 Machine Learning & AI

- Deep Learning traffic prediction (LSTM / Transformer time-series models)
- City-wide origin-destination matrix simulation
- Continuous model retraining on newly collected traffic streams

### ☁️ Cloud & Infrastructure

- Kubernetes deployment (Helm charts)
- CI/CD automated testing and deployment pipeline
- Multi-region high availability database replication

## 📄 License

This project is licensed under the **MIT License**.

You are free to use, modify, and distribute this project in accordance with the terms of the license.

For more information, see the [LICENSE](LICENSE) file.

## 🙏 Acknowledgements

This project has been developed as part of an internship to gain practical experience in full-stack web development, artificial intelligence, machine learning, database management, and modern software engineering practices.

Special thanks to:

- The internship mentors for providing project guidance, technical requirements, and continuous support.
- The open-source community for maintaining the libraries, frameworks, and development tools used in this project.
- The developers and maintainers of FastAPI, React, PostgreSQL, SQLAlchemy, Vite, and other open-source technologies used throughout the application.
- The contributors and maintainers of the Python machine learning ecosystem (Scikit-learn, Pandas, NumPy, Joblib).
