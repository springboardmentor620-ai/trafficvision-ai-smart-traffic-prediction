import { useState } from "react";
import api from "../services/api";
import Navbar from "../components/Navbar";

function TrafficForm() {
    const [formData, setFormData] = useState({
        location: "",
        road_name: "",
        vehicle_count: "",
        average_speed: "",
        congestion_level: "Low"
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const saveRecord = async () => {
        try {
            await api.post(
                "/traffic",
                {
                    ...formData,
                    vehicle_count: Number(formData.vehicle_count),
                    average_speed: Number(formData.average_speed)
                },
                {
                    headers: {
                        Authorization:
                            `Bearer ${localStorage.getItem("access_token")}`
                    }
                }
            );

            alert("Traffic Record Added Successfully!");

            setFormData({
                location: "",
                road_name: "",
                vehicle_count: "",
                average_speed: "",
                congestion_level: "Low"
            });

        } catch (error) {
            console.log(error);
            alert("Failed to save record");
        }
    };

    return (
        <>
            <Navbar />

            <div style={{ padding: "30px" }}>
                <h1>Add Traffic Record</h1>

                <input
                    name="location"
                    placeholder="Location"
                    value={formData.location}
                    onChange={handleChange}
                />

                <br /><br />

                <input
                    name="road_name"
                    placeholder="Road Name"
                    value={formData.road_name}
                    onChange={handleChange}
                />

                <br /><br />

                <input
                    type="number"
                    name="vehicle_count"
                    placeholder="Vehicle Count"
                    value={formData.vehicle_count}
                    onChange={handleChange}
                />

                <br /><br />

                <input
                    type="number"
                    name="average_speed"
                    placeholder="Average Speed"
                    value={formData.average_speed}
                    onChange={handleChange}
                />

                <br /><br />

                <select
                    name="congestion_level"
                    value={formData.congestion_level}
                    onChange={handleChange}
                >
                    <option>Low</option>
                    <option>Medium</option>
                    <option>High</option>
                </select>

                <br /><br />

                <button onClick={saveRecord}>
                    Save Traffic Record
                </button>
            </div>
        </>
    );
}

export default TrafficForm;