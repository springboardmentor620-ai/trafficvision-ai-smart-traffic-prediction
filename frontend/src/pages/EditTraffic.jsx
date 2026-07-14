import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import Navbar from "../components/Navbar";
import { toast } from "react-toastify";

function EditTraffic() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [traffic, setTraffic] = useState({
        location: "",
        road_name: "",
        vehicle_count: "",
        average_speed: "",
        congestion_level: ""
    });

    const getAuthHeader = () => ({
        headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`
        }
    });

    useEffect(() => {
        loadTraffic();
    }, []);

    const loadTraffic = async () => {
        try {
            const response = await api.get(
                `/traffic/${id}`,
                getAuthHeader()
            );

            setTraffic(response.data);

        } catch (error) {
            console.log(error);
            toast.error("Failed to load traffic record.");
        }
    };

    const updateTraffic = async () => {
        try {
            await api.put(
                `/traffic/${id}`,
                traffic,
                getAuthHeader()
            );

            toast.success("Traffic record updated successfully!");

            setTimeout(() => {
                navigate("/traffic/list");
            }, 1500);

        } catch (error) {
            console.log(error);
            toast.error("Failed to update traffic record.");
        }
    };

    return (
        <>
            <Navbar />

            <div style={{ padding: "30px" }}>
                <h1>Edit Traffic Record</h1>

                <input
                    placeholder="Location"
                    value={traffic.location}
                    onChange={(e) =>
                        setTraffic({
                            ...traffic,
                            location: e.target.value
                        })
                    }
                />

                <br /><br />

                <input
                    placeholder="Road Name"
                    value={traffic.road_name}
                    onChange={(e) =>
                        setTraffic({
                            ...traffic,
                            road_name: e.target.value
                        })
                    }
                />

                <br /><br />

                <input
                    type="number"
                    placeholder="Vehicle Count"
                    value={traffic.vehicle_count}
                    onChange={(e) =>
                        setTraffic({
                            ...traffic,
                            vehicle_count: Number(e.target.value)
                        })
                    }
                />

                <br /><br />

                <input
                    type="number"
                    placeholder="Average Speed"
                    value={traffic.average_speed}
                    onChange={(e) =>
                        setTraffic({
                            ...traffic,
                            average_speed: Number(e.target.value)
                        })
                    }
                />

                <br /><br />

                <input
                    placeholder="Congestion Level"
                    value={traffic.congestion_level}
                    onChange={(e) =>
                        setTraffic({
                            ...traffic,
                            congestion_level: e.target.value
                        })
                    }
                />

                <br /><br />

                <button onClick={updateTraffic}>
                    Update
                </button>
            </div>
        </>
    );
}

export default EditTraffic;