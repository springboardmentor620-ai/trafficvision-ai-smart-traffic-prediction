import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { getAlerts, deleteAlert } from "../services/alertService";
import { toast } from "react-toastify";
import SummaryCard from "../components/SummaryCard";

function Alerts() {

    const [alerts, setAlerts] = useState([]);
    const highAlerts = alerts.filter(a => a.severity === "High").length;
    const mediumAlerts = alerts.filter(a => a.severity === "Medium").length;
    const lowAlerts = alerts.filter(a => a.severity === "Low").length;

    useEffect(() => {
        loadAlerts();
    }, []);

    async function loadAlerts() {

        try {

            const data = await getAlerts();
            setAlerts(data);

        } catch (err) {

            console.log(err);
            toast.error("Failed to load alerts.");

        }

    }

    async function removeAlert(id) {

        try {

            await deleteAlert(id);

            setAlerts(alerts.filter(alert => alert.id !== id));

            toast.success("Alert deleted.");

        } catch (err) {

            console.log(err);
            toast.error("Delete failed.");

        }

    }

    return (

        <>
            <Navbar />

            <div
                style={{
                    padding: "30px",
                    background: "#f5f7fb",
                    minHeight: "100vh"
                }}
            >

                <h1 style={{ color: "#1e3a8a" }}>
                    🚨 Traffic Alerts
                </h1>

                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(4,1fr)",
                        gap: "20px",
                        marginTop: "25px",
                        marginBottom: "30px"
                    }}
                >

                    <SummaryCard
                        title="Total Alerts"
                        value={alerts.length}
                        color="#2563eb"
                    />

                    <SummaryCard
                        title="High"
                        value={highAlerts}
                        color="#ef4444"
                    />

                    <SummaryCard
                        title="Medium"
                        value={mediumAlerts}
                        color="#f59e0b"
                    />

                    <SummaryCard
                        title="Low"
                        value={lowAlerts}
                        color="#22c55e"
                    />

                </div>

                {alerts.length === 0 && (

                    <div
                        style={{
                            marginTop: "40px",
                            textAlign: "center"
                        }}
                    >
                        No Alerts Found
                    </div>

                )}

                {alerts.map(alert => (

                    <div

                        key={alert.id}

                        style={{
                            background:
                                alert.severity === "High"
                                    ? "#fee2e2"
                                    : alert.severity === "Medium"
                                    ? "#fef3c7"
                                    : "#dcfce7",
                            padding: "20px",
                            marginTop: "20px",
                            borderRadius: "15px",
                            boxShadow: "0 10px 25px rgba(0,0,0,.10)",
                                borderLeft:
                                    alert.severity === "High"
                                        ? "8px solid #ef4444"
                                        : alert.severity === "Medium"
                                        ? "8px solid #f59e0b"
                                        : "8px solid #22c55e"
                                                        }}

                    >

                        <h3>

                            {alert.severity === "High"
                                ? "🔴 High"

                                : alert.severity === "Medium"
                                ? "🟠 Medium"

                                : "🟢 Low"}

                        </h3>

                        <p>

                            📍 <b>Source:</b> {alert.source}

                        </p>

                        <p>

                            🏁 <b>Destination:</b> {alert.destination}

                        </p>

                        <p>

                            💬 <b>Message:</b> {alert.message}

                        </p>

                        <p>
                            <b>Created:</b>{" "}
                            {new Date(alert.created_at).toLocaleString()}
                        </p>

                        <p>

                            🛣️ <b>Recommended Route:</b>

                            {" "}

                            {alert.recommended_route}

                        </p>

                        <p>
                            <b>Estimated Delay:</b> {alert.delay} min
                        </p>

                        <p>
                            <b>Congestion:</b> {alert.congestion}
                        </p>

                        <button

                            onClick={() => {

                                if(window.confirm("Delete this alert?")){

                                    removeAlert(alert.id);

                                }

                            }}

                            style={{

                                marginTop: "10px",

                                background: "#ef4444",

                                color: "white",

                                border: "none",

                                padding: "10px 20px",

                                borderRadius: "8px",

                                cursor: "pointer"

                            }}

                        >

                            Delete

                        </button>

                    </div>

                ))}

            </div>

        </>

    );

}

export default Alerts;