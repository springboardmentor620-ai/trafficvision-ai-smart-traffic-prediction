import { useState } from "react";
import api from "../services/api";

function Prediction() {
    const [formData, setFormData] = useState({
        holiday: "None",
        temp: 288.28,
        rain_1h: 0,
        snow_1h: 0,
        clouds_all: 40,
        weather_main: "Clouds",
        weather_description: "scattered clouds",
        hour: 17,
        day: 15,
        month: 7,
        weekday: 2
    });

    const [prediction, setPrediction] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]:
                e.target.type === "number"
                    ? Number(e.target.value)
                    : e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setLoading(true);

        try {
            const token = localStorage.getItem("token");

            const response = await api.post(
                "/prediction/predict",
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            setPrediction(response.data.predicted_traffic);
        } catch (error) {
            console.error(error);
            alert("Prediction failed");
        }

        setLoading(false);
    };

    return (
        <div
            style={{
                maxWidth: "700px",
                margin: "30px auto"
            }}
        >
            <h1>Traffic Prediction</h1>

            <form onSubmit={handleSubmit}>

                <label>Holiday</label>
                <input
                    name="holiday"
                    value={formData.holiday}
                    onChange={handleChange}
                />

                <label>Temperature</label>
                <input
                    type="number"
                    step="0.01"
                    name="temp"
                    value={formData.temp}
                    onChange={handleChange}
                />

                <label>Rain (1h)</label>
                <input
                    type="number"
                    step="0.01"
                    name="rain_1h"
                    value={formData.rain_1h}
                    onChange={handleChange}
                />

                <label>Snow (1h)</label>
                <input
                    type="number"
                    step="0.01"
                    name="snow_1h"
                    value={formData.snow_1h}
                    onChange={handleChange}
                />

                <label>Clouds</label>
                <input
                    type="number"
                    name="clouds_all"
                    value={formData.clouds_all}
                    onChange={handleChange}
                />

                <label>Weather</label>
                <input
                    name="weather_main"
                    value={formData.weather_main}
                    onChange={handleChange}
                />

                <label>Weather Description</label>
                <input
                    name="weather_description"
                    value={formData.weather_description}
                    onChange={handleChange}
                />

                <label>Hour</label>
                <input
                    type="number"
                    name="hour"
                    value={formData.hour}
                    onChange={handleChange}
                />

                <label>Day</label>
                <input
                    type="number"
                    name="day"
                    value={formData.day}
                    onChange={handleChange}
                />

                <label>Month</label>
                <input
                    type="number"
                    name="month"
                    value={formData.month}
                    onChange={handleChange}
                />

                <label>Weekday</label>
                <input
                    type="number"
                    name="weekday"
                    value={formData.weekday}
                    onChange={handleChange}
                />

                <br />
                <br />

                <button type="submit">
                    {loading ? "Predicting..." : "Predict Traffic"}
                </button>
            </form>

            {prediction !== null && (
                <div
                    style={{
                        marginTop: "30px",
                        padding: "20px",
                        border: "1px solid #ddd",
                        borderRadius: "10px"
                    }}
                >
                    <h2>Prediction Result</h2>

                    <h1>{prediction}</h1>

                    <p>Predicted Traffic Volume</p>
                </div>
            )}
        </div>
    );
}

export default Prediction;