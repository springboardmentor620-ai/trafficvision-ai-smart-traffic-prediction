import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import api from "../services/api";
import { toast } from "react-toastify";

function EditTraffic() {

    const { id } = useParams();
    const navigate = useNavigate();

    const [traffic, setTraffic] = useState({
        location: "",
        road_name: "",
        vehicle_count: "",
        average_speed: "",
        congestion_level: "Low"
    });

    const getAuthHeader = () => ({
        headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`
        }
    });

    const loadTraffic = async () => {
        try {

            const response = await api.get(
                `/traffic/${id}`,
                getAuthHeader()
            );

            setTraffic(response.data);

        } catch (error) {

            console.log(error);
            toast.error("Unable to load traffic record.");

        }
    };

    useEffect(() => {
        loadTraffic();
    }, []);

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

    const updateTraffic = async () => {

        try {

            await api.put(
                `/traffic/${id}`,
                traffic,
                getAuthHeader()
            );

            toast.success("Traffic record updated.");

            navigate("/traffic/list");

        } catch (error) {

            console.log(error);
            toast.error("Update failed.");

        }

    };

    return (
        <>
            <Navbar />

            <div
                style={{
                    maxWidth: "750px",
                    margin: "40px auto",
                    background: "white",
                    padding: "35px",
                    borderRadius: "20px",
                    boxShadow: "0 12px 30px rgba(0,0,0,.12)"
                }}
            >

                <h1
                    style={{
                        textAlign: "center",
                        color: "#1e3a8a",
                        marginBottom: "10px"
                    }}
                >
                    ✏️ Edit Traffic Record
                </h1>

                <p
                    style={{
                        textAlign: "center",
                        color: "#666",
                        marginBottom: "30px"
                    }}
                >
                    Update traffic information and save the latest details.
                </p>

                <label>Location</label>

                <input
                    name="location"
                    value={traffic.location}
                    onChange={handleChange}
                    style={{
                        width: "100%",
                        padding: "14px",
                        marginTop: "8px",
                        borderRadius: "10px",
                        border: "1px solid #d1d5db",
                        fontSize: "15px",
                        outline: "none",
                        boxSizing: "border-box"
                    }}
                />

                <br /><br />

                <label>Road Name</label>

                <input
                    name="road_name"
                    value={traffic.road_name}
                    onChange={handleChange}
                    style={{
                        width: "100%",
                        padding: "14px",
                        marginTop: "8px",
                        borderRadius: "10px",
                        border: "1px solid #d1d5db",
                        fontSize: "15px",
                        outline: "none",
                        boxSizing: "border-box"
                    }}
                />

                <br /><br />

                <label>Vehicle Count</label>

                <input
                    type="number"
                    name="vehicle_count"
                    value={traffic.vehicle_count}
                    onChange={handleChange}
                    style={{
                        width: "100%",
                        padding: "14px",
                        marginTop: "8px",
                        borderRadius: "10px",
                        border: "1px solid #d1d5db",
                        fontSize: "15px",
                        outline: "none",
                        boxSizing: "border-box"
                    }}
                />

                <br /><br />

                <label>Average Speed</label>

                <input
                    type="number"
                    name="average_speed"
                    value={traffic.average_speed}
                    onChange={handleChange}
                    style={{
                        width: "100%",
                        padding: "14px",
                        marginTop: "8px",
                        borderRadius: "10px",
                        border: "1px solid #d1d5db",
                        fontSize: "15px",
                        outline: "none",
                        boxSizing: "border-box"
                    }}
                />

                <br /><br />

                <label>Congestion Level</label>

                <select
                    name="congestion_level"
                    value={traffic.congestion_level}
                    onChange={handleChange}
                    style={{
                        width: "100%",
                        padding: "14px",
                        marginTop: "8px",
                        borderRadius: "10px",
                        border: "1px solid #d1d5db",
                        fontSize: "15px"
                    }}
                >
                    <option>Low</option>
                    <option>Medium</option>
                    <option>High</option>
                </select>

                <br /><br />

                <div
                    style={{
                        display: "flex",
                        gap: "15px",
                        marginTop: "25px"
                    }}
                >
                    <button
                        onClick={() => navigate("/traffic/list")}
                        style={{
                            flex: 1,
                            padding: "14px",
                            background: "#6b7280",
                            color: "white",
                            border: "none",
                            borderRadius: "10px",
                            cursor: "pointer",
                            fontWeight: "bold"
                        }}
                    >
                        Cancel
                    </button>

                    <button
                        onClick={updateTraffic}
                        style={{
                            flex: 2,
                            padding: "14px",
                            background: "#2563eb",
                            color: "white",
                            border: "none",
                            borderRadius: "10px",
                            cursor: "pointer",
                            fontWeight: "bold"
                        }}
                    >
                        💾 Update Record
                    </button>
                </div>  

            </div>

        </>
    );
}

export default EditTraffic;