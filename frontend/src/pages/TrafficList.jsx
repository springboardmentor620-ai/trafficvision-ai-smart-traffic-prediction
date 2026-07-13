import { useEffect, useState } from "react";
import api from "../services/api";
import Navbar from "../components/Navbar";

function TrafficList() {
    const [records, setRecords] = useState([]);

    const loadRecords = async () => {
        try {
            const response = await api.get(
                "/traffic",
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("access_token")}`
                    }
                }
            );

            setRecords(response.data);

        } catch (error) {
            console.log(error);
            alert("Failed to load records");
        }
    };

    useEffect(() => {
        loadRecords();
    }, []);

    return (
        <>
            <Navbar />

            <div style={{ padding: "30px" }}>
                <h1>Traffic Records</h1>

                <table border="1" cellPadding="10">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Location</th>
                            <th>Road</th>
                            <th>Vehicles</th>
                            <th>Speed</th>
                            <th>Congestion</th>
                        </tr>
                    </thead>

                    <tbody>
                        {records.map((record) => (
                            <tr key={record.id}>
                                <td>{record.id}</td>
                                <td>{record.location}</td>
                                <td>{record.road_name}</td>
                                <td>{record.vehicle_count}</td>
                                <td>{record.average_speed}</td>
                                <td>{record.congestion_level}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    );
}

export default TrafficList;