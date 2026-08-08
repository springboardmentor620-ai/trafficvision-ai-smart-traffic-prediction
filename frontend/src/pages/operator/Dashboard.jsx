import { useEffect, useState } from "react";

import { getTrafficData } from "../../services/traffic";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";

import DashboardHeader from "../../components/dashboard/DashboardHeader";
import DashboardCards from "../../components/dashboard/DashboardCards";
import DashboardContent from "../../components/dashboard/DashboardContent";
import PredictionPanel from "../../components/dashboard/PredictionPanel";
import TrafficMap from "../../components/dashboard/TrafficMap";

import api from "../../services/api";

import "../../styles/chart.css";

function Dashboard() {

    const [backendStatus, setBackendStatus] = useState("Checking...");

    const [trafficData, setTrafficData] = useState([]);

    useEffect(() => {

        api.get("/health")
            .then((response) => {

                setBackendStatus(response.data.message);

            })
            .catch(() => {

                setBackendStatus("Backend Connection Failed");

            });

    }, []);

    useEffect(() => {

        getTrafficData()
            .then((data) => {

                setTrafficData(data);

            })
            .catch((err) => {

                console.error(err);

            });

    }, []);

    return (

        <>

            <Navbar />

            <div style={{ display: "flex" }}>

                <Sidebar />

                <main
                    style={{
                        flex: 1,
                        padding: "20px",
                        background: "#f5f7fa",
                        minHeight: "100vh"
                    }}
                >

                    <DashboardHeader
                        title="Traffic Operator Dashboard"
                        subtitle="Monitor traffic conditions, predict congestion, and manage routes."
                    />

                    <p>

                        <strong>Backend Status :</strong> {backendStatus}

                    </p>

                    <br />

                    <DashboardCards trafficData={trafficData} />

                    <br />

                    <PredictionPanel />

                    <br />

                    <TrafficMap />

                    <br />

                    <DashboardContent trafficData={trafficData} />

                </main>

            </div>

        </>

    );

}

export default Dashboard;