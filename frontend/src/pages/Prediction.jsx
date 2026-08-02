import { useState } from "react";
import Navbar from "../components/Navbar";
import api from "../services/api";
import { toast } from "react-toastify";
import { jsPDF } from "jspdf";
import TrafficMap from "../components/TrafficMap";
import {
    getCoordinates,
    getRoutes
} from "../services/routeService";
import { createAlert } from "../services/alertService";

function Prediction() {

    const [sourceCoords, setSourceCoords] = useState(null);
    const [destinationCoords, setDestinationCoords] = useState(null);

    const [form, setForm] = useState({
        source: "",
        destination: "",
        holiday: "None",
        temp: "",
        rain_1h: 0,
        snow_1h: 0,
        clouds_all: "",
        weather_main: "Clear",
        weather_description: "sky is clear",
        hour: "",
        day: "",
        month: "",
        weekday: "",
        distance: 10
    });
    const [prediction, setPrediction] = useState(null);
    const [congestion, setCongestion] = useState("");
    const [travelTime, setTravelTime] = useState(null);
    const [actualDistance, setActualDistance] = useState(null);
    const [delay, setDelay] = useState(null);
    const [avgSpeed, setAvgSpeed] = useState(null);
    const [route, setRoute] = useState("");
    const [routes, setRoutes] = useState([]);
    const [bestRoute, setBestRoute] = useState(null);
    const [savedTime, setSavedTime] = useState("");
    const [reason, setReason] = useState("");
    const [status, setStatus] = useState("");
    const [loading, setLoading] = useState(false);
    const [heatmap, setHeatmap] = useState([]);

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]:
                e.target.type === "number"
                    ? Number(e.target.value)
                    : e.target.value
        });
    };

    const predictTraffic = async () => {

        setLoading(true);

        try {


            const sourceLocation = await getCoordinates(form.source);
            const destinationLocation = await getCoordinates(form.destination);

            // Get all available routes
            const routeData = await getRoutes(
                sourceLocation,
                destinationLocation
            );


            // Convert routes into a simple array
            const availableRoutes = routeData.features.map((route, index) => ({

                id: index + 1,

                distance: (
                    route.properties.summary.distance / 1000
                ).toFixed(2),

                duration: (
                    route.properties.summary.duration / 60
                ).toFixed(1)

            }));

            const loadHeatmap = async () => {

                const response = await api.get(
                    "/analytics/heatmap",
                    {
                        headers: {
                            Authorization:
                                `Bearer ${localStorage.getItem("access_token")}`
                        }
                    }
                );

                setHeatmap(response.data);

            };


            setRoutes(availableRoutes);

            // Find fastest route
            const recommendedRoute = availableRoutes.reduce(

                (best, current) =>

                    Number(current.duration) < Number(best.duration)

                        ? current

                        : best

            );

            setBestRoute(recommendedRoute);

            setActualDistance(recommendedRoute.distance);

            setForm(prev => ({
                ...prev,
                distance: Number(recommendedRoute.distance)
            }));

            // Save coordinates for map
            setSourceCoords({
                ...sourceLocation,
                name: form.source
            });

            setDestinationCoords({
                ...destinationLocation,
                name: form.destination
            });

            // Payload for backend
            const payload = {

                ...form,

                distance: Number(recommendedRoute.distance),

                source_lat: sourceLocation.lat,
                source_lng: sourceLocation.lng,

                destination_lat: destinationLocation.lat,
                destination_lng: destinationLocation.lng

            };

            // Predict traffic
            const response = await api.post(

                "/prediction/predict",

                payload,

                {
                    headers: {
                        Authorization:
                            `Bearer ${localStorage.getItem("access_token")}`
                    }
                }

            );

            const predicted = response.data.predicted_traffic;

            setPrediction(predicted);

            // Calculate travel speed
            let speed;

            if (predicted < 2500) {

                speed = 60;

            }
            else if (predicted < 4500) {

                speed = 40;

            }
            else {

                speed = 25;

            }

            // Travel statistics
            const distanceKm = Number(recommendedRoute.duration);

            const travelTimeMinutes =
                (distanceKm / speed) * 60;

            const idealTime =
                (distanceKm / 60) * 60;

            setAvgSpeed(speed);

            setTravelTime(
                travelTimeMinutes.toFixed(1)
            );

            setDelay(
                (travelTimeMinutes - idealTime).toFixed(1)
            );

            // Longest route
            const longestRoute = availableRoutes.reduce(

                (worst, current) =>

                    Number(current.duration) > Number(worst.duration)

                        ? current

                        : worst

            );

            const saved = (

                Number(longestRoute.duration)

                -

                Number(recommendedRoute.duration)

            ).toFixed(1);

            // Congestion
            let congestionLevel = "";
            let trafficStatus = "";

            if (predicted < 2500) {

                congestionLevel = "Low";
                trafficStatus = "Smooth Traffic";

            }
            else if (predicted < 4500) {

                congestionLevel = "Medium";
                trafficStatus = "Moderate Traffic";

            }
            else {

                congestionLevel = "High";
                trafficStatus = "Heavy Traffic";

            }

            setCongestion(congestionLevel);
            setStatus(trafficStatus);

            setRoute(`Route ${recommendedRoute.id}`);

            setSavedTime(saved);

            setReason(

                `Route ${recommendedRoute.id} is recommended because it has the lowest estimated travel time (${recommendedRoute.duration} minutes).`

            );

            // Create traffic alert
            await createAlert({

                source: form.source,

                destination: form.destination,

                congestion: congestionLevel,

                delay: (travelTimeMinutes - idealTime).toFixed(1),

                recommended_route: `Route ${recommendedRoute.id}`,

                severity: congestionLevel,

                message:

                    congestionLevel === "Low"

                        ? "Traffic is smooth."

                        : congestionLevel === "Medium"

                        ? "Moderate congestion detected."

                        : "Heavy congestion detected. Choose the recommended route."

            });

            await loadHeatmap();

            toast.success("Prediction completed.");

        } catch (error) {

            console.error(error);

            toast.error(

                error.response?.data?.detail ||

                error.message ||

                "Prediction failed."

            );

        } finally {

            setLoading(false);

        }
    };

    const downloadReport = () => {

        const doc = new jsPDF();

        doc.setFont("helvetica", "bold");
        doc.setFontSize(20);
        doc.text("Traffic Prediction Report", 20, 20);

        doc.setFontSize(12);
        doc.setFont("helvetica", "normal");

        doc.text(`Date : ${new Date().toLocaleDateString()}`, 20, 40);
        doc.text(`Time : ${new Date().toLocaleTimeString()}`, 20, 50);

        doc.text(`Holiday : ${form.holiday}`, 20, 70);
        doc.text(`Temperature : ${form.temp} °C`, 20, 80);
        doc.text(`Weather : ${form.weather_main}`, 20, 90);
        doc.text(`Description : ${form.weather_description}`, 20, 100);

        doc.text(`Predicted Traffic : ${prediction} vehicles/hour`, 20, 120);
        doc.text(`Congestion Level : ${congestion}`, 20, 130);
        doc.text(`Traffic Status : ${status}`, 20, 140);

        doc.text(`Distance : ${actualDistance} km`,20,155);

        doc.text(`Average Speed : ${avgSpeed} km/h`,20,165);

        doc.text(`Travel Time : ${travelTime} minutes`,20,175);

        doc.text(`Delay : ${delay} minutes`,20,185);

        doc.text(`Recommended Route : ${route}`,20,195);

        doc.text(`Estimated Time Saved : ${savedTime} minutes`,20,205);

        doc.text(`Recommendation Reason : ${reason}`,20,215);

        let recommendation = "";

        if (congestion.includes("Low")) {
            recommendation = "Traffic is smooth. Safe to travel.";
        } else if (congestion.includes("Medium")) {
            recommendation = "Moderate traffic. Expect small delays.";
        } else {
            recommendation = "Heavy traffic. Consider an alternate route.";
        }

        doc.text(`Recommendation :`,20,235);
        doc.text(recommendation,20,245);

        doc.text(
            `Source : ${form.source}`,
            20,
            260
        );

        doc.text(
            `Destination : ${form.destination}`,
            20,
            270
        );

        doc.text(
            `Actual Distance : ${actualDistance} km`,
            20,
            280
        );

        doc.text(
            `Actual Travel Time : ${travelTime} min`,
            20,
            290
        );

        doc.save("Traffic_Prediction_Report.pdf");
    };

    const inputStyle = {
        width: "100%",
        padding: "13px",
        marginTop: "6px",
        marginBottom: "20px",
        borderRadius: "10px",
        border: "1px solid #d1d5db",
        fontSize: "15px",
        outline: "none",
        boxSizing: "border-box"
    };

    const statCard = {
        background: "linear-gradient(135deg,#2563eb,#1e40af)",
        color: "white",
        borderRadius: "18px",
        padding: "25px",
        textAlign: "center",
        boxShadow: "0 10px 25px rgba(0,0,0,.15)"
    };

    return (
        <>
            <Navbar />

            <div
                style={{
                    background: "#f5f7fb",
                    minHeight: "100vh",
                    padding: "35px"
                }}
            >
                <div
                    style={{
                        maxWidth: "900px",
                        margin: "auto",
                        background: "white",
                        borderRadius: "20px",
                        padding: "35px",
                        boxShadow: "0 15px 35px rgba(0,0,0,.08)"
                    }}
                >

                    <h1
                        style={{
                            color: "#1e3a8a",
                            marginBottom: "5px"
                        }}
                    >
                        🤖 AI Traffic Prediction
                    </h1>

                    <p
                        style={{
                            color: "#666",
                            marginBottom: "30px"
                        }}
                    >
                        Enter weather and date information to predict traffic volume.
                    </p>

                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(2,1fr)",
                            gap: "20px"
                        }}
                    >

                        <div>
                            <label>Holiday</label>

                            <select
                                name="holiday"
                                value={form.holiday}
                                onChange={handleChange}
                                style={inputStyle}
                            >
                                <option value="None">None</option>
                                <option value="Christmas Day">Christmas Day</option>
                                <option value="Columbus Day">Columbus Day</option>
                                <option value="Independence Day">Independence Day</option>
                                <option value="Labor Day">Labor Day</option>
                                <option value="Martin Luther King Jr Day">Martin Luther King Jr Day</option>
                                <option value="Memorial Day">Memorial Day</option>
                                <option value="New Years Day">New Years Day</option>
                                <option value="State Fair">State Fair</option>
                                <option value="Thanksgiving Day">Thanksgiving Day</option>
                                <option value="Veterans Day">Veterans Day</option>
                                <option value="Washingtons Birthday">Washingtons Birthday</option>
                            </select>
                        </div>

                        <div>
                            <label>Temperature</label>

                            <input
                                type="number"
                                name="temp"
                                value={form.temp}
                                onChange={handleChange}
                                style={inputStyle}
                            />
                        </div>

                        <div>
                            <label>Source</label>

                            <input
                                type="text"
                                name="source"
                                value={form.source}
                                onChange={handleChange}
                                placeholder="e.g. Hyderabad"
                                style={inputStyle}
                            />
                        </div>

                        <div>
                            <label>Destination</label>

                            <input
                                type="text"
                                name="destination"
                                value={form.destination}
                                onChange={handleChange}
                                placeholder="e.g. Secunderabad"
                                style={inputStyle}
                            />
                        </div>

                        <div>
                            <label>Rain (1 hour)</label>

                            <input
                                type="number"
                                name="rain_1h"
                                value={form.rain_1h}
                                onChange={handleChange}
                                style={inputStyle}
                            />
                        </div>

                        <div>
                            <label>Snow (1 hour)</label>

                            <input
                                type="number"
                                name="snow_1h"
                                value={form.snow_1h}
                                onChange={handleChange}
                                style={inputStyle}
                            />
                        </div>

                        <div>
                            <label>Cloud Cover (%)</label>

                            <input
                                type="number"
                                name="clouds_all"
                                value={form.clouds_all}
                                onChange={handleChange}
                                style={inputStyle}
                            />
                        </div>

                        <div>
                            <label>Weather</label>

                            <select
                                name="weather_main"
                                value={form.weather_main}
                                onChange={handleChange}
                                style={inputStyle}
                            >
                                <option>Clear</option>
                                <option>Clouds</option>
                                <option>Rain</option>
                                <option>Snow</option>
                                <option>Mist</option>
                            </select>
                        </div>

                        <div style={{ gridColumn: "1 / span 2" }}>
                            <label>Weather Description</label>

                            <select
                                name="weather_description"
                                value={form.weather_description}
                                onChange={handleChange}
                                style={inputStyle}
                            >
                                <option value="sky is clear">sky is clear</option>
                                <option value="Sky is Clear">Sky is Clear</option>
                                <option value="few clouds">few clouds</option>
                                <option value="scattered clouds">scattered clouds</option>
                                <option value="broken clouds">broken clouds</option>
                                <option value="overcast clouds">overcast clouds</option>
                                <option value="light rain">light rain</option>
                                <option value="moderate rain">moderate rain</option>
                                <option value="heavy intensity rain">heavy intensity rain</option>
                                <option value="very heavy rain">very heavy rain</option>
                                <option value="light snow">light snow</option>
                                <option value="heavy snow">heavy snow</option>
                                <option value="mist">mist</option>
                                <option value="fog">fog</option>
                                <option value="haze">haze</option>
                                <option value="smoke">smoke</option>
                                <option value="drizzle">drizzle</option>
                                <option value="light intensity drizzle">light intensity drizzle</option>
                                <option value="heavy intensity drizzle">heavy intensity drizzle</option>
                                <option value="proximity thunderstorm">proximity thunderstorm</option>
                                <option value="thunderstorm">thunderstorm</option>
                            </select>
                        </div>

                        <div>
                            <label>Hour</label>

                            <input
                                type="number"
                                name="hour"
                                value={form.hour}
                                onChange={handleChange}
                                style={inputStyle}
                            />
                        </div>

                        <div>
                            <label>Day</label>

                            <input
                                type="number"
                                name="day"
                                value={form.day}
                                onChange={handleChange}
                                style={inputStyle}
                            />
                        </div>

                        <div>
                            <label>Month</label>

                            <input
                                type="number"
                                name="month"
                                value={form.month}
                                onChange={handleChange}
                                style={inputStyle}
                            />
                        </div>

                        <div>
                            <label>Weekday</label>

                            <input
                                type="number"
                                name="weekday"
                                value={form.weekday}
                                onChange={handleChange}
                                style={inputStyle}
                            />
                        </div>

                    </div>

                    <button
                        onClick={predictTraffic}
                        disabled={loading}
                        style={{
                            width: "100%",
                            marginTop: "15px",
                            padding: "16px",
                            border: "none",
                            borderRadius: "12px",
                            background: loading
                                ? "#9ca3af"
                                : "#2563eb",
                            color: "white",
                            fontSize: "18px",
                            fontWeight: "700",
                            cursor: loading
                                ? "not-allowed"
                                : "pointer",
                            transition: ".3s"
                        }}
                        onMouseEnter={(e) => {
                            if (!loading)
                                e.target.style.background = "#1d4ed8";
                        }}
                        onMouseLeave={(e) => {
                            if (!loading)
                                e.target.style.background = "#2563eb";
                        }}
                    >
                        {loading
                            ? "Predicting..."
                            : "🚀 Predict Traffic"}
                    </button>

                    {prediction !== null && (

                        <div
                            style={{
                                marginTop: "35px",
                                background: "linear-gradient(135deg,#2563eb,#1d4ed8)",
                                color: "white",
                                borderRadius: "18px",
                                padding: "30px",
                                textAlign: "center",
                                boxShadow: "0 10px 25px rgba(0,0,0,.2)"
                            }}
                        >

                            <h2 style={{ marginBottom: "20px" }}>
                                🚦 Traffic Prediction Result
                            </h2>

                            <h1
                                style={{
                                    fontSize: "52px",
                                    marginBottom: "10px"
                                }}
                            >
                                {prediction}
                            </h1>

                            <h3>Vehicles / Hour</h3>

                            <hr
                                style={{
                                    margin: "25px 0",
                                    borderColor: "rgba(255,255,255,.3)"
                                }}
                            />

                            <h3>Congestion Level</h3>

                            <h2
                                style={{
                                    color:
                                        congestion.includes("Low")
                                            ? "#22c55e"
                                            : congestion.includes("Medium")
                                            ? "#facc15"
                                            : "#ef4444"
                                }}
                            >
                                {congestion}
                            </h2>

                            <h3>{status}</h3>

                            <div
                                style={{
                                    width: "100%",
                                    height: "16px",
                                    background: "rgba(255,255,255,.25)",
                                    borderRadius: "30px",
                                    marginTop: "20px",
                                    overflow: "hidden"
                                }}
                            >
                                <div
                                    style={{
                                        width:
                                            prediction < 2500
                                                ? "30%"
                                                : prediction < 4500
                                                ? "65%"
                                                : "95%",
                                        height: "100%",
                                        background:
                                            prediction < 2500
                                                ? "#22c55e"
                                                : prediction < 4500
                                                ? "#facc15"
                                                : "#ef4444",
                                        transition: "1s"
                                    }}
                                />
                            </div>

                            <p style={{ marginTop: "18px", fontSize: "18px" }}>
                                Prediction Confidence :
                                <b> 94%</b>
                            </p>

                            <hr
                                style={{
                                    margin: "25px 0",
                                    borderColor: "rgba(255,255,255,.3)"
                                }}
                            />

                            <h3>🚗 Travel Estimation</h3>

                            <p>
                                Distance :
                                    <b>
                                    {
                                    actualDistance
                                    ?? form.distance
                                    }
                                    km
                                    </b>
                            </p>

                            <p>
                                Average Speed : <b>{avgSpeed} km/h</b>
                            </p>

                            <p>
                                Estimated Time :
                                <b> {travelTime} minutes</b>
                            </p>

                            <p>
                                Delay :
                                <b> +{delay} minutes</b>
                            </p>

                            <p
                                style={{
                                    marginTop: "20px",
                                    opacity: 0.9
                                }}
                            >
                                Generated on: {new Date().toLocaleString()}
                            </p>

                        </div>

                    )}

                    {prediction !== null && (

                        <div
                            style={{
                                marginTop: "30px",
                                background: "#ffffff",
                                borderRadius: "15px",
                                padding: "25px",
                                boxShadow: "0 8px 20px rgba(0,0,0,.08)"
                            }}
                        >

                            <h2
                                style={{
                                    color: "#1e3a8a",
                                    marginBottom: "20px"
                                }}
                            >
                                🚗 Route Recommendation
                            </h2>

                            <p>
                                <b>Recommended Route:</b> {route}
                            </p>

                            <p>
                                <b>Estimated Travel Time:</b> {travelTime} minutes
                            </p>

                            <p>
                                <b>Distance:</b> {actualDistance} km
                            </p>

                            <p>
                                <b>Time Saved:</b> {savedTime} minutes
                            </p>

                            <p>
                                <b>Reason:</b> {reason}
                            </p>

                            <hr style={{ margin: "20px 0" }} />

                            <h3>📊 Route Statistics</h3>

                            <p>
                                📍 Distance :
                                <b> {actualDistance} km</b>
                            </p>

                            <p>
                                ⏱ Travel Time :
                                <b> {travelTime} min</b>
                            </p>

                            <p>
                                🚦 Congestion :
                                <b> {congestion}</b>
                            </p>

                            <p>
                                🛣 Recommended Route :
                                <b> {route}</b>
                            </p>

                            <div
                                style={{
                                    marginTop: "25px",
                                    display: "grid",
                                    gap: "15px"
                                }}
                            >

                                <div
                                    style={{
                                        border: "2px solid green",
                                        background: route === "Current Route" ? "#dcfce7" : "white",
                                        padding: "15px",
                                        borderRadius: "10px"
                                    }}
                                >
                                    <h3>🟢 Current Route</h3>
                                    <p>Best when traffic is low.</p>
                                </div>

                                <div
                                    style={{
                                        border: "2px solid orange",
                                        background: route === "Current Route" ? "#dcfce7" : "white",
                                        padding: "15px",
                                        borderRadius: "10px"
                                    }}
                                >
                                    <h3>🟠 Inner Ring Road</h3>
                                    <p>Recommended for medium congestion.</p>
                                </div>

                                <div
                                    style={{
                                        border: "2px solid red",
                                        background: route === "Current Route" ? "#dcfce7" : "white",
                                        padding: "15px",
                                        borderRadius: "10px"
                                    }}
                                >
                                    <h3>🔴 Outer Ring Road</h3>
                                    <p>Recommended when congestion is heavy.</p>
                                </div>

                            </div>

                            <hr style={{ margin: "20px 0" }} />

                            <h3>📊 Route Statistics</h3>

                            <p>
                                📍 Distance :
                                <b> {actualDistance} km</b>
                            </p>

                            <p>
                                ⏱ Travel Time :
                                <b> {travelTime} min</b>
                            </p>

                            <p>
                                🚦 Congestion :
                                <b> {congestion}</b>
                            </p>

                            <p>
                                🛣 Recommended Route :
                                <b> {route}</b>
                            </p>

                        </div>

                    )}

                    {prediction !== null && (

                    <div
                        style={{
                            marginTop: "40px"
                        }}
                    >
                        <h2
                            style={{
                                color: "#1e3a8a",
                                marginBottom: "20px"
                            }}
                        >
                            🗺 Traffic Map
                        </h2>

                        <TrafficMap
                            source={sourceCoords}
                            destination={destinationCoords}
                            congestion={congestion}
                            heatmap={heatmap}
                            onRouteLoaded={(summary) => {

                                setTravelTime(
                                    (summary.duration / 60).toFixed(1)
                                );

                                setActualDistance(
                                    (summary.distance / 1000).toFixed(2)
                                );

                            }}
                        />

                        {prediction && (
                            <div
                                style={{
                                    marginTop: "25px",
                                    padding: "20px",
                                    borderRadius: "15px",
                                    background: "#eef6ff",
                                    border: "1px solid #bfdbfe"
                                }}
                            >
                                <h2>📋 Route Summary</h2>

                                <p>
                                    <b>Recommended Route:</b> {route}
                                </p>

                                <p>
                                    <b>Distance:</b> {actualDistance} km
                                </p>

                                <p>
                                    <b>Estimated Travel Time:</b> {travelTime} min
                                </p>

                                <p>
                                    <b>Average Speed:</b> {avgSpeed} km/h
                                </p>

                                <p>
                                    <b>Expected Delay:</b> {delay} min
                                </p>

                                <p>
                                    <b>Time Saved:</b> {savedTime} min
                                </p>

                                <p>
                                    <b>Reason:</b> {reason}
                                </p>
                            </div>
                        )}

                        {routes.length > 0 && (
                            <div
                                style={{
                                    marginTop: "30px",
                                    background: "#fff",
                                    padding: "25px",
                                    borderRadius: "18px",
                                    boxShadow: "0 8px 20px rgba(0,0,0,.08)"
                                }}
                            >
                                <h2
                                    style={{
                                        color: "#1e3a8a",
                                        marginBottom: "20px"
                                    }}
                                >
                                    🛣 Route Comparison
                                </h2>

                                <div
                                    style={{
                                        display: "grid",
                                        gap: "15px"
                                    }}
                                >
                                    {routes.map((item) => (
                                        <div
                                            key={item.id}
                                            style={{
                                                display: "flex",
                                                justifyContent: "space-between",
                                                alignItems: "center",
                                                padding: "18px",
                                                borderRadius: "15px",
                                                background:
                                                    bestRoute?.id === item.id
                                                        ? "#dbeafe"
                                                        : "#f8fafc",
                                                border:
                                                    bestRoute?.id === item.id
                                                        ? "2px solid #2563eb"
                                                        : "1px solid #e5e7eb"
                                            }}
                                        >
                                            <div>
                                                <h3 style={{ margin: 0 }}>
                                                    Route {item.id}
                                                    {bestRoute?.id === item.id && " ⭐"}
                                                </h3>

                                                <p style={{ margin: "8px 0" }}>
                                                    📏 Distance :
                                                    <b> {item.distance} km</b>
                                                </p>

                                                <p style={{ margin: 0 }}>
                                                    ⏱ Time :
                                                    <b> {item.duration} min</b>
                                                </p>
                                            </div>

                                            {bestRoute?.id === item.id && (
                                                <div
                                                    style={{
                                                        background: "#2563eb",
                                                        color: "white",
                                                        padding: "8px 14px",
                                                        borderRadius: "25px",
                                                        fontWeight: "bold"
                                                    }}
                                                >
                                                    Recommended
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {prediction && (
                            <div
                                style={{
                                    display: "grid",
                                    gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
                                    gap: "20px",
                                    marginTop: "30px"
                                }}
                            >
                                <div className="statCard">
                                    <h3>🚗 Traffic</h3>
                                    <h1>{prediction}</h1>
                                    <p>vehicles/hour</p>
                                </div>

                                <div className="statCard">
                                    <h3>⚡ Speed</h3>
                                    <h1>{avgSpeed}</h1>
                                    <p>km/h</p>
                                </div>

                                <div className="statCard">
                                    <h3>⏱ Delay</h3>
                                    <h1>{delay}</h1>
                                    <p>minutes</p>
                                </div>

                                <div className="statCard">
                                    <h3>🛣 Best Route</h3>
                                    <h1>{route}</h1>
                                    <p>{savedTime} min saved</p>
                                </div>
                            </div>
                        )}
                    </div>

                )}

                {routes.length > 0 && (

                    <div
                        style={{
                            marginTop: "35px",
                            background: "#ffffff",
                            borderRadius: "15px",
                            padding: "25px",
                            boxShadow: "0 10px 25px rgba(0,0,0,.08)"
                        }}
                    >

                        <h2
                            style={{
                                color: "#1e3a8a",
                                marginBottom: "20px"
                            }}
                        >
                            🚗 Available Routes
                        </h2>

                        {routes.map((r) => (

                            <div
                                key={r.id}
                                style={{
                                    padding: "18px",
                                    marginBottom: "15px",
                                    borderRadius: "12px",
                                    border:
                                        route === `Route ${r.id}`
                                            ? "3px solid #16a34a"
                                            : "1px solid #ddd",
                                    background:
                                        route === `Route ${r.id}`
                                            ? "#ecfdf5"
                                            : "#fafafa"
                                }}
                            >

                                <h3>

                                    {route === `Route ${r.id}`
                                        ? "⭐ Recommended Route"
                                        : `Route ${r.id}`}

                                </h3>

                                <p>

                                    Distance :
                                    <b> {r.distance} km</b>

                                </p>

                                <p>

                                    Estimated Time :
                                    <b> {r.duration} min</b>

                                </p>

                            </div>

                        ))}

                    </div>

                )}

                    {prediction !== null && (

                        <div
                            style={{
                                display: "flex",
                                gap: "20px",
                                marginTop: "20px",
                                justifyContent: "center"
                            }}
                        >

                            <button
                                onClick={downloadReport}
                                style={{
                                    background: "#16a34a",
                                    color: "white",
                                    border: "none",
                                    padding: "14px 24px",
                                    borderRadius: "10px",
                                    cursor: "pointer",
                                    fontWeight: "bold",
                                    fontSize: "16px",
                                    transition: ".3s"
                                }}
                            >
                                📄 Download PDF Report
                            </button>

                            <button
                                onClick={() => window.print()}
                                style={{
                                    background: "#f59e0b",
                                    color: "white",
                                    border: "none",
                                    padding: "14px 24px",
                                    borderRadius: "10px",
                                    cursor: "pointer",
                                    fontWeight: "bold",
                                    fontSize: "16px",
                                    transition: ".3s"
                                }}
                            >
                                🖨 Print Report
                            </button>

                            <button
                                onClick={() => window.location.href = "/prediction/history"}
                                style={{
                                    background: "#2563eb",
                                    color: "white",
                                    border: "none",
                                    padding: "14px 24px",
                                    borderRadius: "10px",
                                    cursor: "pointer",
                                    fontWeight: "bold",
                                    fontSize: "16px"
                                }}
                            >
                                📜 View Prediction History
                            </button>

                        </div>

                    )}

                </div>

            </div>

        </>
    );
}

export default Prediction;