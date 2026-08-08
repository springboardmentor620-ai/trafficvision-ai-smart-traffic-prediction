import { useState } from "react";
import { predictCongestion } from "../../services/prediction";

import "../../styles/prediction.css";

function PredictionPanel({

    predictionResult,

    setPredictionResult

}) {

    const areas = [
        "Indiranagar",
        "Whitefield",
        "Koramangala",
        "Electronic City",
        "M.G. Road",
        "Jayanagar",
        "Yeshwanthpur",
        "Hebbal"
    ];

    const roads = [
        "100 Feet Road",
        "CMH Road",
        "Marathahalli Bridge",
        "Sony World Junction",
        "Sarjapur Road",
        "Hosur Road",
        "Trinity Circle",
        "Anil Kumble Circle",
        "South End Circle",
        "Yeshwanthpur Circle"
    ];

    const weatherOptions = [

        "Clear",
        "Overcast",
        "Fog",
        "Rain",
        "Windy"
    ];

    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({

        Area_Name: "Whitefield",

        Road_Intersection_Name: "Marathahalli Bridge",

        Traffic_Category: "High",

        Traffic_Volume: 20000,

        Average_Speed: 42,

        Travel_Time_Index: 1.6,

        Road_Capacity_Utilization: 85,

        Incident_Reports: 2,

        Environmental_Impact: 72,

        Public_Transport_Usage: 40,

        Traffic_Signal_Compliance: 90,

        Parking_Usage: 68,

        Pedestrian_and_Cyclist_Count: 220,

        Year: 2023,

        Month: 9,

        Day: 15,

        DayOfWeek: 5,

        Weather: "Clear",

        Roadwork: false

    });
    
    const handleChange = (e) => {

        const { name, value } = e.target;

        setFormData({
            ...formData,
            [name]: value
        });

    };

    const handlePredict = async () => {

        try {

            setLoading(true);

            const result = await predictCongestion(formData);

            setPredictionResult({

                ...result,

                area: formData.Area_Name,

                road: formData.Road_Intersection_Name,

                trafficVolume: formData.Traffic_Volume,

                averageSpeed: formData.Average_Speed,

                weather: formData.Weather

            });

        }
        catch (err) {

            console.error(err);
            alert("Prediction Failed");

        }
        finally {

            setLoading(false);

        }

    };

    return (

        <div className="prediction-panel">

            <h2>🤖 AI Congestion Prediction</h2>

            <br />

            <label>Area</label>

            <select
                name="Area_Name"
                value={formData.Area_Name}
                onChange={handleChange}
            >
                {areas.map(area => (
                    <option key={area} value={area}>
                        {area}
                    </option>
                ))}
            </select>

            <br /><br />

            <label>Road</label>

            <select
                name="Road_Intersection_Name"
                value={formData.Road_Intersection_Name}
                onChange={handleChange}
            >
                {roads.map(road => (
                    <option key={road} value={road}>
                        {road}
                    </option>
                ))}
            </select>

            <br /><br />

            <label>Traffic Volume</label>

            <input
                name="Traffic_Volume"
                type="number"
                value={formData.Traffic_Volume}
                onChange={handleChange}
            />

            <br /><br />

            <label>Average Speed (km/h)</label>

            <input
                name="Average_Speed"
                type="number"
                value={formData.Average_Speed}
                onChange={handleChange}
            />

            <br /><br />

            <label>Weather</label>

            <select
                name="Weather"
                value={formData.Weather}
                onChange={handleChange}
            >
                {weatherOptions.map(weather => (
                    <option key={weather} value={weather}>
                        {weather}
                    </option>
                ))}
            </select>

            <br /><br />

            <label>Roadwork</label>

            <select
                name="Roadwork"
                value={formData.Roadwork}
                onChange={(e) =>
                    setFormData({
                        ...formData,
                        Roadwork: e.target.value === "true"
                    })
                }
            >
                <option value="false">No</option>
                <option value="true">Yes</option>
            </select>

            <br /><br />

            <button
                onClick={handlePredict}
                style={{
                    width: "100%",
                    padding: "12px",
                    border: "none",
                    borderRadius: "8px",
                    background: "#1976d2",
                    color: "white",
                    fontSize: "16px",
                    cursor: "pointer"
                }}
            >

                {loading ? "Predicting..." : "Predict"}

            </button>

            <br /><br />

            {predictionResult && (

            <div
                className="prediction-result"
                style={{
                    marginTop: "30px",
                    borderRadius: "12px",
                    padding: "25px",
                    background: "#ffffff",
                    border: "2px solid #1976d2",
                    boxShadow: "0 8px 20px rgba(0,0,0,.08)"
                }}
            >

                <h2 style={{marginBottom:"20px"}}>
                    🤖 AI Prediction Result
                </h2>

                <div
                    style={{
                        display:"grid",
                        gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",
                        gap:"15px"
                    }}
                >

                    <div>

                        <strong>Congestion Score</strong>

                        <h2>

                            {predictionResult.congestion_prediction.toFixed(2)} %

                        </h2>

                    </div>

                    <div>

                        <strong>Risk Level</strong>

                        <h2>

                            {predictionResult.prediction_level}

                        </h2>

                    </div>

                    <div>

                        <strong>AI Confidence</strong>

                        <h2>

                            {predictionResult.confidence} %

                        </h2>

                    </div>

                </div>

                <hr style={{margin:"25px 0"}}/>

                <h3>

                    🚦 AI Recommendation

                </h3>

                <p>

                    {predictionResult.recommended_action}

                </p>

                <br/>

                <h3>

                    🗺 Suggested Alternate Route

                </h3>

                <p>

                    {predictionResult.alternate_route}

                </p>

            </div>

            )}

        </div>

    );

}

export default PredictionPanel;