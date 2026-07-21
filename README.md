# 🚦 TrafficVision AI - Smart Traffic Prediction & Congestion Management System

## 📖 Project Overview

**TrafficVision AI** is an AI-powered traffic prediction and congestion management platform that helps city authorities monitor traffic conditions, predict congestion levels, and optimize traffic flow using real-time and historical traffic data.

### 🎯 Objectives
- Monitor traffic conditions in real-time across various cities.
- Predict congestion levels and vehicle density using Machine Learning.
- Identify and visualize traffic hotspots dynamically on a live interactive map.
- Optimize traffic flow and suggest alternate route planning.
- Consider local factors like weather and regional festivals/holidays on traffic impact.
- Generate and download structured, human-readable traffic reports in PDF format.
- Provide smart alerts and notifications for operators.

### 👥 Target Users
- **City Traffic Authorities** - Monitor and manage city-wide traffic
- **Traffic Operators** - Track congestion and respond to incidents
- **Transportation Agencies** - Analyze traffic patterns and trends
- **Urban Mobility Planners** - Plan and optimize traffic infrastructure

## ✨ Key Features
 DATASET USED : https://www.kaggle.com/datasets/rauffauzanrambe/smart-city-traffic-flow-prediction-dataset
- **Live Traffic Map:** Interactive maps (using Leaflet.js) that dynamically locate and center on high-congestion areas in real-time.
- **AI Predictions & Forecasting:** Hourly traffic volume and congestion level predictions powered by Scikit-Learn (RandomForest).
- **Comprehensive Analytics:** Insights into peak traffic hours, average speed, congestion indexes, and week-over-week trends.
- **Smart Route Optimization:** Suggests alternate routes with estimated travel times factoring in current AI congestion levels.
- **Automated Report Generation:** One-click generation of beautifully formatted, print-ready PDF traffic reports.
- **Environmental & Cultural Context:** Dynamically adjusts traffic forecasts based on weather conditions and an integrated Indian Festival calendar.

## 🛠️ Technology Stack

### Frontend
- **Core:** HTML5, CSS3, JavaScript (ES6+)
- **Mapping:** Leaflet.js for interactive map visualizations
- **Export:** html2pdf.js for generating PDF reports
- **Assets:** Font Awesome 6.0.0 (icons), Google Fonts (Montserrat/Inter)

### Backend
- **Core:** Python 3.10+ with Flask 3.0.3
- **Machine Learning:** Pandas, NumPy, Scikit-Learn (RandomForestRegressor)
- **Authentication:** Flask-JWT-Extended 4.6.0 (JWT-based auth, Role-based access)
- **Database:** SQLite3 for persistent user and session storage
- **Security:** Hashlib for SHA-256 password hashing, Flask-CORS for cross-origin requests

## 🚀 Installation & Setup

### Prerequisites
- Python 3.10 or higher
- pip (Python package manager)
- Git (optional)

### Step 1: Clone the Repository
```bash
git clone https://github.com/yourusername/TrafficVision-AI.git
cd TrafficVision-AI
```

### Step 2: Create Virtual Environment
```bash
# Windows
python -m venv venv
venv\Scripts\activate

# Mac/Linux
python3 -m venv venv
source venv/bin/activate
```

### Step 3: Install Dependencies
```bash
pip install -r requirements.txt
```

### Step 4: Run the Application
```bash
python run.py
```

### Step 5: Access the Application
Open your web browser and navigate to:
```
http://localhost:5500
```
*(Note: The server runs on port 5500 by default. You can access the dashboard directly by logging in or registering a new account.)*

## 🔐 Authentication & Security
- **JWT-based authentication** for secure API communication.
- **Role-based access control** ensuring different permissions for Admins and Operators.
- **Secure password hashing** via SHA-256 before database storage.
- **Session management** persisting securely in the browser's `localStorage`.

## 🌤️ Environmental Context

### Indian Festival Impact
| Festival | Traffic Multiplier |
|----------|-------------------|
| Diwali | 2.0x |
| Holi | 1.8x |
| Dussehra | 1.7x |
| Ganesh Chaturthi | 1.6x |
| Christmas | 1.5x |

### Weather Impact
| Condition | Traffic Multiplier |
|-----------|-------------------|
| Rainy/Stormy | 1.4x |
| Foggy | 1.3x |
| Temperature > 35°C | 1.2x |
| Temperature < 10°C | 1.3x |

## ⚙️ How It Works

1. **Data Ingestion:** Traffic sensor data (CSV) is loaded and processed.
2. **Feature Engineering:** 50+ features are created including time-based, weather, and festival data.
3. **Model Training:** Ensemble model (RandomForest + XGBoost + LightGBM + GradientBoosting) is trained.
4. **Prediction:** Real-time predictions are made using the trained model.
5. **Visualization:** Results are displayed on interactive maps and dashboards.
6. **Reporting:** PDF reports are generated with comprehensive insights.

## 📂 Project Structure
```text
TrafficVision-AI/
├── backend/
│   ├── data/                 # Traffic sensor datasets
│   ├── traffic_predictor.py  # Machine Learning model class
│   └── traffic.db            # SQLite Database
├── frontend/
│   ├── index.html            # Login/Registration page
│   ├── dashboard.html        # Main application dashboard
│   ├── style.css             # UI styling
│   └── script.js             # Shared utility scripts
├── requirements.txt          # Python dependencies
└── run.py                    # Main Flask server entrypoint