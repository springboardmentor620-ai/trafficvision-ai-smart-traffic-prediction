# 🚦 TrafficVision AI - Smart Traffic Prediction & Congestion Management System

> Infosys Springboard Internship Project

An AI-powered Smart Traffic Prediction and Congestion Management System that predicts future traffic volume using Machine Learning, estimates travel time, recommends optimized routes, visualizes routes on an interactive map, and maintains prediction history for future analysis.

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

## 🤖 AI Traffic Prediction

- Machine Learning based Traffic Prediction
- Congestion Forecasting
- Traffic Status Classification
- Confidence Indicator
- Average Speed Estimation
- Delay Estimation
- Travel Time Estimation

---

## 🗺 Route Optimization

- Source & Destination Selection
- OpenStreetMap Integration
- OpenRouteService API Integration
- Interactive Route Visualization
- Dynamic Route Recommendation Workflow
- Geocoding using OpenStreetMap Nominatim

---

## 📊 Analytics

- Traffic Analytics Dashboard
- Charts & Graphs
- Traffic Distribution
- Congestion Analysis

---

## 📄 Reports

- Download Prediction Report (PDF)
- Print Prediction Report

---

## 📚 Prediction History

- Stores every prediction
- Displays previous predictions
- User-wise prediction history

---

# 🛠 Tech Stack

## Frontend

- React.js
- React Router
- Axios
- React Toastify
- Leaflet
- React Leaflet
- jsPDF

## Backend

- Spring Boot
- Spring Security
- JWT Authentication
- REST APIs
- Maven

## Machine Learning

- Python
- Pandas
- NumPy
- Scikit-learn
- Random Forest Regressor
- Joblib

## Database

- MySQL

## APIs

- OpenStreetMap
- OpenRouteService
- Nominatim API

---

# 🏗 Project Architecture

```
                    User

                      │

                      ▼

            React Frontend

                      │

          REST API (Spring Boot)

                      │

     ┌────────────────────────┐
     │                        │
     ▼                        ▼

Machine Learning         MySQL Database

     │

Traffic Prediction

     │

Route Recommendation

     │

OpenRouteService API

     │

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

│     ├── controller/

│     ├── service/

│     ├── repository/

│     ├── security/

│     ├── entity/

│     ├── dto/

│     └── ml/

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