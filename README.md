# 🚦 TrafficVision AI - Smart Traffic Prediction & Congestion Management System

## 📖 Project Overview

**TrafficVision AI** is an AI-powered traffic prediction and congestion management platform that helps city authorities monitor traffic conditions, predict congestion levels, and optimize traffic flow using real-time and historical traffic data.

### 🎯 Objectives
- Monitor traffic conditions in real-time
- Predict congestion levels using AI
- Optimize traffic flow and route planning
- Provide smart alerts and notifications
- Support smart city traffic management initiatives

### 👥 Target Users
- **City Traffic Authorities** - Monitor and manage city-wide traffic
- **Traffic Operators** - Track congestion and respond to incidents
- **Transportation Agencies** - Analyze traffic patterns and trends
- **Urban Mobility Planners** - Plan and optimize traffic infrastructure

### 🔐 Authentication & Security
- JWT-based authentication
- Role-based access control (Admin/Operator)
- Secure password hashing (SHA-256)
- Session management with localStorage

## 🛠️ Technology Stack

### Frontend
- HTML5, CSS3, JavaScript (ES6+)
- Font Awesome 6.0.0 for icons
- Google Fonts (Montserrat) for typography

### Backend
- Python 3.10+ with Flask 3.0.3
- Flask-CORS 4.0.1 for cross-origin requests
- Flask-JWT-Extended 4.6.0 for authentication
- SQLite3 for database
- hashlib for password hashing

### Development Tools
- VS Code for coding
- Git/GitHub for version control
- Postman for API testing
- Chrome DevTools for debugging

## 🚀 Installation & Setup

### Prerequisites
- Python 3.10 or higher
- pip (Python package manager)
- Git (optional)

### Step 1: Clone the Repository
```bash
git clone https://github.com/yourusername/TrafficVision-AI.git
cd TrafficVision-AI

Step 2: Create Virtual Environment
bash
# Windows
python -m venv venv
venv\Scripts\activate

# Mac/Linux
python3 -m venv venv
source venv/bin/activate

Step 3: Install Dependencies
bash
pip install -r requirements.txt

Step 4: Run the Application
bash
python run.py

Access the Application