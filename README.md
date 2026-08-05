# 🚦 TrafficVision AI - Smart Traffic Prediction & Congestion Management System

> Infosys Springboard Internship Project

An AI-powered Smart Traffic Prediction and Congestion Management System that predicts future traffic volume using Machine Learning, estimates travel time, recommends optimized routes, visualizes traffic on an interactive heatmap, provides AI-based route recommendations, sends smart traffic alerts, and offers detailed analytics dashboards for traffic trend analysis.

---

# 📌 Project Overview

TrafficVision AI helps users make better travel decisions by predicting future traffic conditions using weather and date-time parameters.

The system integrates Machine Learning, OpenRouteService APIs, OpenStreetMap, and an interactive React dashboard to provide intelligent traffic insights.

---

# 🚀 Features

## ✅ Authentication

- User Registration
- User Login
- JWT Authentication
- Role Based Access (Admin/User)

---

## 🚦 Traffic Management

- Add Traffic Data (Admin)
- Edit Traffic Records
- Delete Traffic Records
- View Traffic Records
- Search & Filter Traffic Data

---

## 🚨 Smart Traffic Alerts

- Automatic Traffic Alert Generation
- Delay Notifications
- High Congestion Detection
- Alert History
- Read / Unread Notifications

---

## 🤖 AI Traffic Prediction

- Machine Learning Traffic Prediction
- Congestion Forecasting
- Traffic Status Classification
- Confidence Indicator
- Average Speed Estimation
- Delay Estimation
- Travel Time Estimation
- AI Route Recommendations

---

## 🗺 Route Optimization

- Source & Destination Selection
- OpenStreetMap Integration
- OpenRouteService API Integration
- Interactive Route Visualization
- Dynamic Route Recommendation Workflow
- Geocoding using OpenStreetMap Nominatim
- Alternative Route Suggestions

---

## 📊 Analytics & Insights

- Interactive Analytics Dashboard
- KPI Cards
- Daily Traffic Trends
- Weekly Traffic Trends
- Monthly Traffic Trends
- Peak Hour Analysis
- Congestion Distribution
- Weather Distribution
- Source-wise Analysis
- Destination-wise Analysis
- Route Statistics
- Top Congested Routes
- Traffic Heatmap
- Dashboard Summary

---

## 📄 Reports

- Download Prediction Report (PDF)
- Print Prediction Report

---

## 📚 Prediction History

- Stores Every Prediction
- User-wise Prediction History
- Search Previous Predictions
- Historical Traffic Analysis

---

# 🛠 Tech Stack

## Frontend

- React.js
- React Router
- Axios
- React Toastify
- Leaflet
- React Leaflet
- Recharts
- jsPDF

## Backend

- FastAPI
- SQLAlchemy
- PostgreSQL
- JWT Authentication
- REST APIs
- Uvicorn

## Machine Learning

- Python
- Pandas
- NumPy
- Scikit-learn
- Random Forest Regressor
- Joblib

## Database

- PostgreSQL

## APIs

- OpenStreetMap
- OpenRouteService
- Nominatim API

---

# 🏗 Project Architecture

                    User

                      │

                      ▼

              React Frontend

                      │

               FastAPI Backend

        ┌─────────────┼─────────────┐

        ▼             ▼             ▼

 Machine Learning   PostgreSQL   OpenRouteService

        │                           │

        ▼                           ▼

 Traffic Prediction        Route Optimization

        │

        ▼

 Analytics • Alerts • Heatmap • AI Recommendation

OpenStreetMap

```

---

# 📂 Project Structure

```
trafficvision-ai-smart-traffic-prediction/

│

├── frontend/

│     ├── components/

│     ├── pages/

│     ├── services/

│     └── assets/

│

├── backend/

    app/

        models/

        routes/

        services/

        schemas/

        security/

        database.py

        main.py

│

└── README.md
```

---

# ✅ Milestone Progress

## ✅ Milestone 1

### Smart Traffic Data Management

- User Authentication
- Admin Dashboard
- CRUD Operations
- Traffic Data Management
- Analytics Dashboard
- REST APIs
- Database Integration

Status:

**Completed ✅**

---

## ✅ Milestone 2

### Traffic Prediction & Route Optimization

Completed Features

- Machine Learning Traffic Prediction
- Congestion Forecasting
- Traffic Prediction Reports
- Prediction History
- Travel Time Estimation
- Average Speed Estimation
- Delay Calculation
- Interactive Traffic Map
- OpenStreetMap Integration
- OpenRouteService Integration
- Source & Destination Geocoding
- Route Visualization
- Dynamic Route Recommendation Workflow

Status:

**Completed ✅**

---

## ✅ Milestone 3

### Smart Analytics & Traffic Intelligence

Completed Features

- Traffic Analytics Dashboard
- Daily, Weekly & Monthly Traffic Trends
- Interactive Traffic Heatmap
- Peak Hour Analysis
- Congestion Distribution
- Weather Distribution
- Source-wise Traffic Analysis
- Destination-wise Traffic Analysis
- Route Statistics
- Top Congested Routes
- AI Route Recommendation Card
- Smart Traffic Alerts
- Notification Panel
- Dashboard Summary APIs
- Optimized SQLAlchemy Analytics
- Real-time Prediction History Analytics

Status:

**Completed ✅**


## Login

![alt text](<Screenshot 2026-07-24 001801-1.png>)

---

## Dashboard

![alt text](<Screenshot 2026-07-24 002012.png>)
![alt text](<Screenshot 2026-07-24 002059.png>)
![alt text](<Screenshot 2026-07-24 002131.png>)
![alt text](<Screenshot 2026-07-24 002204.png>)
![alt text](<Screenshot 2026-07-24 002234.png>)

---

## Traffic Prediction

![alt text](<Screenshot 2026-07-24 002353.png>)
![alt text](<Screenshot 2026-07-24 002431.png>)

---

## Prediction Result

![alt text](<Screenshot 2026-07-24 002514.png>)
![alt text](<Screenshot 2026-07-24 002542.png>)
![alt text](<Screenshot 2026-07-24 002642.png>)
![alt text](<Screenshot 2026-07-24 002730.png>)

---


## Clone Repository

```bash
git clone https://github.com/<deekshithagilla>/trafficvision-ai-smart-traffic-prediction.git
```


## Frontend

```bash
cd frontend
npm install
npm run dev
```

## Backend

```bash
cd backend
uvicorn app.main:app --reload
```

---

# 🤖 Machine Learning Setup

The trained model and encoder files are **not included** because GitHub has a file size limit of 100 MB.

Generate the model locally:

```bash
cd backend/ml
python train_model.py
```

Generated files:

- traffic_model.pkl
- holiday_encoder.pkl
- weather_encoder.pkl
- weather_description_encoder.pkl

---

# 🔮 Future Enhancements

- Live Traffic API Integration
- Real-time Congestion Detection
- Multiple Route Comparison
- ETA Prediction using Live Data
- Google Maps Integration
- Accident Detection
- Weather-based Traffic Alerts
- Mobile Application
- AI-based Smart Route Optimization

---

# 👩‍💻 Developed By

**Deekshitha Gilla**

Infosys Springboard Internship Project

TrafficVision AI