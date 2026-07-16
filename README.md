# trafficvision-ai-smart-traffic-prediction
Infosys Internship Project - Smart Traffic Prediction &amp; Congestion Management System

## Machine Learning Setup

The trained model and encoder files are **not included** in this repository because GitHub has a file size limit of 100 MB.

Before using the Traffic Prediction API, generate the model locally by running:

```bash
cd backend/ml
python train_model.py
```

This will generate the following files:

- `traffic_model.pkl`
- `holiday_encoder.pkl`
- `weather_encoder.pkl`
- `weather_description_encoder.pkl`

These files are automatically ignored by Git and are generated locally whenever needed.