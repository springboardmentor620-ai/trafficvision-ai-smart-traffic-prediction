import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import api from "../services/api";
import { toast } from "react-toastify";

function PredictionHistory() {

    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {

        try {

            const response = await api.get(
                "/prediction/history",
                {
                    headers: {
                        Authorization:
                            `Bearer ${localStorage.getItem("access_token")}`
                    }
                }
            );

            setHistory(response.data);

        } catch (error) {

            console.log(error);
            toast.error("Unable to load prediction history.");

        } finally {

            setLoading(false);

        }
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
                        maxWidth: "1200px",
                        margin: "auto",
                        background: "white",
                        padding: "30px",
                        borderRadius: "20px",
                        boxShadow: "0 15px 35px rgba(0,0,0,.08)"
                    }}
                >

                    <h1
                        style={{
                            color: "#1e3a8a",
                            marginBottom: "25px"
                        }}
                    >
                        📜 Prediction History
                    </h1>

                    {loading ? (

                        <h3>Loading...</h3>

                    ) : history.length === 0 ? (

                        <h3>No predictions found.</h3>

                    ) : (

                        <table
                            style={{
                                width: "100%",
                                borderCollapse: "collapse"
                            }}
                        >

                            <thead>

                                <tr
                                    style={{
                                        background: "#2563eb",
                                        color: "white"
                                    }}
                                >

                                    <th style={{ padding: "12px" }}>Date</th>
                                    <th>Holiday</th>
                                    <th>Traffic</th>
                                    <th>Congestion</th>
                                    <th>Route</th>

                                </tr>

                            </thead>

                            <tbody>

                                {history.map((item) => (

                                    <tr
                                        key={item.id}
                                        style={{
                                            textAlign: "center",
                                            borderBottom: "1px solid #ddd"
                                        }}
                                    >

                                        <td style={{ padding: "12px" }}>
                                            {new Date(item.created_at).toLocaleString()}
                                        </td>

                                        <td>{item.holiday}</td>

                                        <td>{item.predicted_traffic}</td>

                                        <td>{item.congestion}</td>

                                        <td>{item.recommended_route}</td>

                                    </tr>

                                ))}

                            </tbody>

                        </table>

                    )}

                </div>

            </div>
        </>
    );
}

export default PredictionHistory;