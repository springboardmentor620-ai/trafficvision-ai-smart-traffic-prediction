#  TrafficVision AI

Smart Traffic Prediction & Congestion Management System

---

##  Project Overview

TrafficVision AI is a Smart Traffic Prediction and Congestion Management System developed as part of the Infosys Internship Program. The project uses React, FastAPI, PostgreSQL, and Machine Learning concepts to monitor historical traffic data, analyze congestion, and provide an interactive dashboard for traffic management.

---

#  Technologies Used

## Frontend

- React.js
- Vite
- React Router DOM
- CSS
- React Leaflet
- Leaflet

## Backend

- Python
- FastAPI
- Uvicorn
- Pandas
- SQLAlchemy
- Pydantic
- Swagger UI

## Database

- PostgreSQL 18.4
- pgAdmin 4

## Version Control

- Git
- GitHub
- Git Bash

---

#  Project Structure

```
TrafficVision-AI/
│
├── backend/
│   ├── core/
│   ├── database/
│   ├── models/
│   ├── routers/
│   ├── services/
│   ├── dataset/
│   ├── app.py
│   └── requirements.txt
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── context/
│   │   ├── layouts/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── styles/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── package.json
│   └── vite.config.js
│
├── database/
│   ├── database.py
│   └── schema.sql
│
├── dataset/
├── docker/
├── docs/
├── ml_model/
├── README.md
└── .gitignore
```

---

#  Week 1 & Week 2 Progress

- Project initialization
- React + Vite setup
- FastAPI backend setup
- Login page implementation
- Dashboard UI
- Logout functionality
- React Router configuration
- Authentication REST API
- Swagger API testing
- Backend folder architecture
- GitHub collaboration setup
- Created personal branch (Veni-1303)

---

#  Week 3 Progress

## Traffic Dataset Integration

- Selected Smart Mobility Traffic Dataset
- Performed Exploratory Data Analysis (EDA)
- Understood dataset columns
- Integrated dataset using Pandas
- Created Traffic Service
- Created Traffic APIs
- Connected React frontend with FastAPI
- Displayed dynamic dashboard statistics

### Traffic APIs

- GET /traffic
- GET /traffic/statistics

---

## Historical Traffic Records

Implemented:

- Historical Traffic Records page
- Weather Search
- Weather Filter
- Traffic Condition Filter
- Pagination
- Dashboard Navigation
- Dynamic table from dataset

---

#  Week 4 Progress

## PostgreSQL Integration

Completed:

- Installed PostgreSQL 18.4
- Installed pgAdmin 4
- Created trafficvision_db
- Created users table
- Inserted Admin and User credentials
- Connected FastAPI with PostgreSQL
- SQLAlchemy database configuration
- Database authentication completed

---

## Authentication

Implemented:

- Admin Login
- User Login
- Database Authentication
- Removed hardcoded credentials
- Backend Login API
- Frontend Login Integration

---

## Dashboard Enhancement

Added:

- Bengaluru Smart Traffic Dashboard
- City Information Cards
- Current Date & Time
- Average Vehicle Count
- Average Traffic Speed
- Weather Information
- Congestion Level
- Traffic Health Indicator
- Total Dataset Records

---

## Live Map

Completed:

- Installed Leaflet
- Installed React Leaflet
- Created LiveMap Component
- OpenStreetMap Integration
- Bengaluru Map View
- Dashboard Navigation

---

#  Software Versions

| Software | Version |
|----------|----------|
| React | 19 |
| Vite | Latest |
| FastAPI | Latest |
| Python | 3.x |
| PostgreSQL | 18.4 |
| pgAdmin | 4 |
| Git | Latest |

---

#  Learning Outcomes

During this project I learned:

- React Components
- React Hooks
- React Router
- API Integration
- FastAPI
- REST API Development
- Swagger Testing
- PostgreSQL
- SQLAlchemy
- Database Connectivity
- Authentication
- Git Branching
- GitHub Collaboration
- Responsive UI Design
- OpenStreetMap Integration
- React Leaflet

#  Learning Resources

During the development of this project, I referred to the following official documentation and learning resources:

## React

- React Official Documentation  
  https://react.dev

- React Router Documentation  
  https://reactrouter.com

- Vite Documentation  
  https://vitejs.dev

---

## FastAPI

- FastAPI Official Documentation  
  https://fastapi.tiangolo.com

- Uvicorn Documentation  
  https://www.uvicorn.org

- Pydantic Documentation  
  https://docs.pydantic.dev

---

## Python

- Python Official Documentation  
  https://docs.python.org/3

- Pandas Documentation  
  https://pandas.pydata.org/docs

---

## Database

- PostgreSQL Documentation  
  https://www.postgresql.org/docs/

- pgAdmin Documentation  
  https://www.pgadmin.org/docs/

- SQLAlchemy Documentation  
  https://docs.sqlalchemy.org

---

## Maps

- React Leaflet Documentation  
  https://react-leaflet.js.org

- Leaflet Documentation  
  https://leafletjs.com

- OpenStreetMap  
  https://www.openstreetmap.org

---

## API Testing

- Swagger Documentation  
  https://swagger.io

---

## Version Control

- Git Documentation  
  https://git-scm.com/docs

- GitHub Documentation  
  https://docs.github.com

---

## Machine Learning

- Scikit-Learn Documentation  
  https://scikit-learn.org/stable/

- NumPy Documentation  
  https://numpy.org/doc/

---

## Development Tools

- Visual Studio Code Documentation  
  https://code.visualstudio.com/docs

---

#  Challenges Faced

- React routing issues
- API integration errors
- PostgreSQL installation and configuration
- Database connectivity
- Git branch management
- Mentor repository synchronization
- Frontend-backend communication

---

# Current Project Status

###  Completed

- Frontend Setup
- Backend Setup
- Authentication
- Dashboard
- Traffic Dataset Integration
- Historical Traffic Records
- PostgreSQL Integration
- Live Map Setup

###  In Progress

- Live Traffic Markers
- Machine Learning Model
- Traffic Prediction
- Route Optimization
- Traffic Analytics

---

---

# Week 5 Progress

## Machine Learning Integration

Completed:

- Integrated Bengaluru Traffic Prediction Dataset
- Performed Data Preprocessing
- Feature Engineering
- Data Cleaning
- Model Training using Random Forest Regressor
- Model Evaluation
- Saved Trained Machine Learning Model
- Integrated ML Model with FastAPI Backend

---

## Traffic Prediction Module

Implemented:

- Traffic Prediction Page
- Area Selection
- Road Selection
- Weather Selection
- Vehicle Count Input
- Journey Time Selection
- Prediction Result Card
- Dynamic Prediction API Integration
- Frontend-Backend Communication
- Prediction Response Display

### Prediction APIs

- GET /traffic/prediction-options
- POST /traffic/predict

---

# Week 6 Progress

## Smart Navigation

Completed:

- Route Optimization Module
- Source Area Selection
- Source Road Selection
- Destination Area Selection
- Destination Road Selection
- Vehicle Type Selection
- Best Route Recommendation
- Alternate Route Suggestions
- Journey Planner Interface

### Navigation APIs

- POST /traffic/routes

---

## Traffic Analytics

Implemented:

- Traffic Analytics Dashboard
- Traffic Distribution Charts
- Congestion Analysis
- Weather Distribution
- Vehicle Count Analysis
- AI Traffic Insights
- Performance Statistics
- Interactive Charts

---

## Reports Module

Completed:

- Daily Traffic Reports
- Weekly Traffic Reports
- Monthly Traffic Reports
- CSV Export
- PDF Export
- AI Summary Generation
- Traffic Statistics Summary
- Operational Reporting Dashboard

---

## Traffic Alerts

Completed:

- Traffic Alerts Module
- Active Alerts Dashboard
- Congestion Notifications
- Incident Monitoring
- Alert Status Cards

---

## Dashboard Enhancement

Added:

- Smart Navigation Shortcut
- AI Traffic Forecast Section
- Live Traffic Insights
- Enhanced Dashboard Cards
- Responsive User Interface
- Improved User Experience

---

# Machine Learning

## Algorithm Used

- Random Forest Regressor

### Machine Learning Libraries

- Scikit-Learn
- NumPy
- Pandas
- Joblib

---

# Current Project Status

### Completed

- Frontend Setup
- Backend Setup
- Authentication
- Dashboard
- Traffic Dataset Integration
- Historical Traffic Records
- PostgreSQL Integration
- Live Map
- Machine Learning Integration
- Traffic Prediction
- Smart Navigation
- Route Optimization
- Traffic Analytics
- Traffic Alerts
- Reports Module
- CSV Export
- PDF Export
- AI Insights
- Logout Functionality
- Responsive Dashboard

### Minor UI Improvements

- Weather Dropdown Refinement
- Analytics Chart Label Enhancement
- Notification Improvements

---

# Roadmap

## Week 7

- UI Refinements
- Performance Optimization
- Bug Fixes
- Analytics Improvements
- Notification Enhancements

## Week 8

- Docker Deployment
- Cloud Deployment
- Final Testing
- Final Documentation
- Project Presentation
- Project Submission

---
