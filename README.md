# 🚦 TrafficVision AI
### AI-Powered Smart Traffic Prediction and Intelligent Route Recommendation System

![Status](https://img.shields.io/badge/Status-Under%20Development-blue)
![AI](https://img.shields.io/badge/AI-Random%20Forest-green)
![Frontend](https://img.shields.io/badge/Frontend-React%20%2B%20TypeScript-61DAFB)
![Backend](https://img.shields.io/badge/Backend-Python-yellow)
![License](https://img.shields.io/badge/License-Academic-orange)

---

# 📌 Overview

TrafficVision AI is an AI-powered Smart Traffic Prediction and Intelligent Route Recommendation System developed to improve urban transportation by predicting traffic conditions, recommending optimal routes, generating congestion alerts, and providing comprehensive traffic analytics.

Unlike traditional navigation systems that rely only on live GPS data, TrafficVision AI combines Machine Learning with historical traffic data to estimate travel time, traffic congestion, average vehicle speed, and route efficiency.

The system provides Google Maps-style route recommendations, interactive dashboards, traffic heatmaps, predictive analytics, AI-generated reports, and intelligent traffic alerts.

This project is being developed as a Bachelor of Engineering (Artificial Intelligence and Machine Learning) Final Year Project.

---

# 🎯 Objectives

- Predict traffic congestion using Machine Learning.
- Recommend the best route between any two locations.
- Estimate travel time based on historical traffic patterns.
- Visualize traffic conditions using interactive maps.
- Generate intelligent traffic alerts.
- Analyze traffic trends.
- Build a scalable Smart City traffic management solution.

---

# 🚀 Key Features

## 🤖 AI Traffic Prediction

- Random Forest Machine Learning model
- Travel time prediction
- Vehicle density estimation
- Average speed prediction
- Congestion prediction
- Traffic severity classification
- Prediction confidence

---

## 🗺 Intelligent Route Recommendation

The system recommends:

- Fastest Route
- Shortest Route
- Least Congested Route

Each recommendation includes:

- Distance
- Estimated travel time
- Traffic condition
- Congestion level
- Average speed
- Vehicle density
- Route summary

---

## 🔍 Smart Search

Users can search:

- Areas
- Roads
- Colleges
- Hospitals
- Companies
- Metro stations
- Railway stations
- Airports
- Hotels
- Restaurants
- Shopping malls
- Parks
- Tourist attractions

Features:

- Auto suggestion
- Fuzzy search
- Zero-shot location matching
- Intelligent location recommendation

---

## 🗺 Interactive Map

The application integrates Leaflet Maps to display:

- Source location
- Destination location
- Route visualization
- Multiple route options
- Route markers
- Traffic hotspots
- Congestion visualization

---

## 📊 Analytics Dashboard

Interactive dashboard displaying:

- Daily traffic
- Weekly traffic
- Monthly traffic
- Vehicle count
- Road utilization
- Congestion statistics
- Peak hour analysis
- Average travel time
- Speed trends

---

## 🔥 Heatmaps

Traffic heatmaps visualize:

- High congestion zones
- Low congestion zones
- Accident-prone regions
- Traffic intensity

---

## 🚨 Traffic Alerts

The system generates alerts for:

- Heavy congestion
- Road blockage
- Accident zones
- Slow-moving traffic
- Peak hour congestion
- Weather-related traffic

Future enhancement:

- Email alerts
- SMS alerts
- Push notifications

---

## 📄 AI Reports

The system generates user-friendly reports containing:

- Route Summary
- Travel Time
- Traffic Condition
- Congestion Analysis
- AI Predictions
- Recommendations
- Graphical Analytics
- Generated Date & Time

Reports are designed for human readability instead of raw JSON output.

---

# 🧠 Machine Learning

TrafficVision AI uses Random Forest Regression models trained on historical Bengaluru traffic data.

The trained models predict:

- Travel Time
- Average Speed
- Vehicle Count

Models are stored inside the project and loaded during prediction for real-time inference.

---

# 📂 Dataset

The project uses the **Bangalore Traffic Analysis Dataset** from Kaggle.

Dataset Link:

https://www.kaggle.com/datasets/asshridattaaigal/bangalore-traffic-analysis-dataset

The dataset contains:

- Source
- Destination
- Latitude
- Longitude
- Distance
- Travel Time
- Vehicle Count
- Traffic Volume
- Average Speed
- Weather Condition
- Temperature
- Humidity
- Signal Timing
- Road Capacity

---

# 🏗 System Architecture

```
User

↓

TrafficVision AI Dashboard

↓

Smart Search Engine

↓

Traffic Dataset

↓

Feature Engineering

↓

Random Forest Model

↓

Traffic Prediction

↓

Route Recommendation Engine

↓

Analytics Dashboard

↓

Interactive Maps

↓

Traffic Reports & Alerts
```

---

# 🛠 Technology Stack

## Frontend

- React
- TypeScript
- Vite
- Tailwind CSS
- TanStack Router
- React Query
- Leaflet
- Recharts

## Backend

- Python

## Machine Learning

- Scikit-Learn
- Random Forest
- Pandas
- NumPy
- Joblib

## Database

- Supabase

---

# 📁 Project Structure

```
traffic-vision-ai-main/

│

├── model/
│ ├── train_route_model.py
│ ├── export_places.py
│ ├── route_speed_rf.pkl
│ ├── route_travel_time_rf.pkl
│ ├── route_vehicles_rf.pkl
│ └── metrics.json
│

├── public/

├── src/

├── supabase/

├── package.json

├── vite.config.ts

└── README.md
```

---

# ⚙ Installation

Clone the repository

```bash
git clone <repository-url>
```

Move into the project

```bash
cd traffic-vision-ai-main
```

Install dependencies

```bash
npm install
```

Run the application

```bash
npm run dev
```

Build production version

```bash
npm run build
```

---

# 📈 Future Enhancements

- Live Traffic API integration
- Multi-city support
- AI Chat Assistant
- Voice search
- Smart traffic signal optimization
- Email notifications
- SMS notifications
- Push notifications
- CCTV integration
- IoT traffic sensors
- Digital Twin simulation
- Accident prediction
- Reinforcement Learning-based signal control

---

# 🎓 Academic Purpose

This project is developed as a Final Year Bachelor of Engineering (Artificial Intelligence and Machine Learning) project.

The objective is to demonstrate the practical application of Artificial Intelligence, Machine Learning, Data Analytics, and Smart City technologies in intelligent transportation systems.

