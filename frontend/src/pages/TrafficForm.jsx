import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import Navbar from "../components/Navbar";
import { toast } from "react-toastify";

function TrafficForm() {
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);

    const [traffic, setTraffic] = useState({
        location: "",
        road_name: "",
        vehicle_count: "",
        average_speed: "",
        congestion_level: "Low"
    });

    const inputStyle = {
        width: "100%",
        padding: "14px",
        marginTop: "8px",
        borderRadius: "10px",
        border: "1px solid #d1d5db",
        fontSize: "15px",
        boxSizing: "border-box",
        outline: "none",
        transition: "0.3s"
    };

    const handleChange = (e) => {
        setTraffic({
            ...traffic,
            [e.target.name]:
                e.target.name === "vehicle_count" ||
                e.target.name === "average_speed"
                    ? Number(e.target.value)
                    : e.target.value
        });
    };

    const submitTraffic = async () => {

        if (
            !traffic.location.trim() ||
            !traffic.road_name.trim() ||
            traffic.vehicle_count <= 0 ||
            traffic.average_speed <= 0
        ) {
            toast.error("Please fill all fields correctly.");
            return;
        }

        try {

            setLoading(true);

            await api.post(
                "/traffic",
                traffic,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("access_token")}`
                    }
                }
            );

            toast.success("Traffic Record Added Successfully!");

            navigate("/traffic/list");

        } catch (error) {

            console.log(error);
            toast.error("Failed to add traffic record.");

        } finally {

            setLoading(false);

        }
    };

    return (
        <>
            <Navbar />

            <div
                style={{
                    minHeight: "100vh",
                    background: "#f5f7fb",
                    padding: "40px"
                }}
            >
                <div
                    style={{
                        maxWidth: "750px",
                        margin: "0 auto",
                        background: "white",
                        borderRadius: "18px",
                        padding: "35px",
                        boxShadow: "0 12px 30px rgba(0,0,0,.08)"
                    }}
                >
                    <h1
                        style={{
                            textAlign: "center",
                            color: "#1e3a8a",
                            marginBottom: "10px"
                        }}
                    >
                        🚦 Add Traffic Record
                    </h1>

                    <p
                        style={{
                            textAlign: "center",
                            color: "#6b7280",
                            marginBottom: "35px"
                        }}
                    >
                        Enter the traffic details below to add a new traffic record.
                    </p>

                    <label><b>📍 Location</b></label>

                    <input
                        style={inputStyle}
                        placeholder="Ex: Hyderabad"
                        name="location"
                        value={traffic.location}
                        onChange={handleChange}
                    />

                    <br /><br />

                    <label><b>🛣 Road Name</b></label>

                    <input
                        style={inputStyle}
                        placeholder="Ex: ORR Road"
                        name="road_name"
                        value={traffic.road_name}
                        onChange={handleChange}
                    />

                    <br /><br />

                    <label><b>🚗 Vehicle Count</b></label>

                    <input
                        style={inputStyle}
                        type="number"
                        placeholder="Ex: 450"
                        name="vehicle_count"
                        value={traffic.vehicle_count}
                        onChange={handleChange}
                    />

                    <br /><br />

                    <label><b>⚡ Average Speed (km/h)</b></label>

                    <input
                        style={inputStyle}
                        type="number"
                        placeholder="Ex: 60"
                        name="average_speed"
                        value={traffic.average_speed}
                        onChange={handleChange}
                    />

                    <br /><br />

                    <label><b>🚥 Congestion Level</b></label>

                    <select
                        style={inputStyle}
                        name="congestion_level"
                        value={traffic.congestion_level}
                        onChange={handleChange}
                    >
                        <option value="Low">🟢 Low</option>
                        <option value="Medium">🟡 Medium</option>
                        <option value="High">🔴 High</option>
                    </select>

                    <br /><br /><br />

                    <button
                        onClick={submitTraffic}
                        disabled={loading}
                        style={{
                            width: "100%",
                            padding: "15px",
                            background: loading
                                ? "#94a3b8"
                                : "linear-gradient(90deg,#2563eb,#1d4ed8)",
                            color: "white",
                            border: "none",
                            borderRadius: "12px",
                            fontSize: "17px",
                            fontWeight: "bold",
                            cursor: loading ? "not-allowed" : "pointer",
                            transition: ".3s",
                            boxShadow: "0 10px 20px rgba(37,99,235,.25)"
                        }}
                    >
                        {loading
                            ? "Adding Traffic Record..."
                            : "➕ Add Traffic Record"}
                    </button>
                </div>
            </div>
        </>
    );
}

export default TrafficForm;