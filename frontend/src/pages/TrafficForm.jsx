import { useState } from "react";
import api from "../services/api";
import Navbar from "../components/Navbar";
import { toast } from "react-toastify";

function TrafficForm() {
    const [traffic, setTraffic] = useState({
        location: "",
        road_name: "",
        vehicle_count: "",
        average_speed: "",
        congestion_level: "Low"
    });

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
        try {
            await api.post(
                "/traffic",
                traffic,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("access_token")}`
                    }
                }
            );

            toast.success("Traffic record added successfully!");

            setTraffic({
                location: "",
                road_name: "",
                vehicle_count: "",
                average_speed: "",
                congestion_level: "Low"
            });

        } catch (error) {
            console.log(error);
            toast.error("Failed to add traffic record.");
        }
    };

    return (
        <>
            <Navbar />

            <div
                style={{
                    maxWidth: "700px",
                    margin: "40px auto",
                    background: "white",
                    padding: "30px",
                    borderRadius: "12px",
                    boxShadow: "0 4px 15px rgba(0,0,0,0.1)"
                }}
            >
                <h1 style={{ textAlign: "center" }}>
                    🚦 Add Traffic Record
                </h1>

                <label>Location</label>
                <input
                    name="location"
                    value={traffic.location}
                    onChange={handleChange}
                />

                <br /><br />

                <label>Road Name</label>
                <input
                    name="road_name"
                    value={traffic.road_name}
                    onChange={handleChange}
                />

                <br /><br />

                <label>Vehicle Count</label>
                <input
                    type="number"
                    name="vehicle_count"
                    value={traffic.vehicle_count}
                    onChange={handleChange}
                />

                <br /><br />

                <label>Average Speed (km/h)</label>
                <input
                    type="number"
                    name="average_speed"
                    value={traffic.average_speed}
                    onChange={handleChange}
                />

                <br /><br />

                <label>Congestion Level</label>
                <select
                    name="congestion_level"
                    value={traffic.congestion_level}
                    onChange={handleChange}
                >
                    <option>Low</option>
                    <option>Medium</option>
                    <option>High</option>
                </select>

                <br /><br />

                <button
                    onClick={submitTraffic}
                    style={{
                        width: "100%",
                        background: "#2563eb",
                        color: "white",
                        fontSize: "16px"
                    }}
                >
                    Add Traffic Record
                </button>
            </div>
        </>
    );
}

export default TrafficForm;