import { useEffect, useState } from "react";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import AdminLayout from "../../components/dashboard/AdminLayout";

import { getPredictionHistory } from "../../services/predictionHistory";

const COLORS = [

    "#ef4444",

    "#f59e0b",

    "#22c55e",

    "#3b82f6",

];

function HistoricalAnalytics() {

    const [history, setHistory] = useState([]);
    
    const averagePrediction =
        history.length > 0
            ? (
                history.reduce(

                    (sum, item) => sum + item.predicted_congestion,

                    0

                ) / history.length
            ).toFixed(1)
            : 0;

    const highPredictions = history.filter(

        item => item.prediction_level === "High"

    ).length;

    const moderatePredictions = history.filter(

        item => item.prediction_level === "Moderate"

    ).length;

    const lowPredictions = history.filter(

        item => item.prediction_level === "Low"

    ).length;

    const distribution = [

        {
            name: "High",
            value: highPredictions,
        },

        {
            name: "Moderate",
            value: moderatePredictions,
        },

        {
            name: "Low",
            value: lowPredictions,
        },

    ];
    
    useEffect(() => {

        async function loadHistory() {

            try {

                const data = await getPredictionHistory();

                console.log(data);

                setHistory(data);

            }

            catch (err) {

                console.error(err);

            }

        }

        loadHistory();

    }, []);

    const exportCSV = () => {

        const headers = [
            "Road",
            "Vehicles",
            "Average Speed",
            "Status",
        ];

        const rows = history.map((item) => [

            item.road,

            item.vehicles,

            item.average_speed,

            item.status,

        ]);

        const csvContent =

            [
                headers.join(","),

                ...rows.map((r) => r.join(",")),

            ].join("\n");

        const blob = new Blob(

            [csvContent],

            {

                type: "text/csv;charset=utf-8;",

            }

        );

        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");

        link.href = url;

        link.download = "traffic_history.csv";

        link.click();

    };
    
    const exportPDF = () => {

        const doc = new jsPDF();

        doc.setFontSize(20);

        doc.text(

            "TrafficVision AI",

            14,

            18

        );

        doc.setFontSize(14);

        doc.text(

            "Historical Analytics Report",

            14,

            28

        );

        doc.setFontSize(10);

        doc.text(

            `Generated: ${new Date().toLocaleString()}`,

            14,

            36

        );

        autoTable(doc, {

            startY: 45,

            head: [[

                "Road",

                "Vehicles",

                "Speed",

                "Status"

            ]],

            body: history.map((item) => [

                item.road,

                item.vehicles,

                item.average_speed,

                item.status,

            ]),

            styles: {

                halign: "center",

            },

            headStyles: {

                fillColor: [37,99,235],

            },

        });

        doc.save("traffic_history_report.pdf");

    };
    
    return (

        <AdminLayout

            title="Historical Analytics"

            subtitle="Traffic statistics and trends"

        >

            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
                    gap: "20px",
                    marginBottom: "30px",
                }}
            >

                <div className="dashboard-card">

                    <h4>🤖 Average Prediction</h4>

                    <h2>

                        {averagePrediction} %

                    </h2>

                </div>

                <div className="dashboard-card">

                    <h4>🔴 High Congestion</h4>

                    <h2>

                        {highPredictions}

                    </h2>

                </div>

                <div className="dashboard-card">

                    <h4>🟠 Moderate Congestion</h4>

                    <h2>

                        {moderatePredictions}

                    </h2>

                </div>

                <div className="dashboard-card">

                    <h4>🟢 Low Congestion</h4>

                    <h2>

                        {lowPredictions}

                    </h2>

                </div>

            </div>

            <div

                style={{

                    height: 350,

                    background: "#fff",

                    padding: 20,

                    borderRadius: 12,

                }}

            >

                <h2>

                    Vehicle Count

                </h2>

                <ResponsiveContainer>

                    <BarChart
                        data={history}
                    >

                        <CartesianGrid strokeDasharray="3 3" />

                        <XAxis
                            dataKey="area_name"
                        />

                        <YAxis />

                        <Tooltip />

                        <Legend />

                        <Bar
                            dataKey="predicted_congestion"
                            fill="#2563eb"
                            name="Predicted Congestion (%)"
                        />

                    </BarChart>

                </ResponsiveContainer>

            </div>

            <br />

            <div
                style={{
                    height: 350,
                    background: "#fff",
                    padding: 20,
                    borderRadius: 12,
                }}
            >

                <h2>

                    Average Speed

                </h2>

                <ResponsiveContainer>

                    <LineChart
                        data={history}
                    >

                        <CartesianGrid strokeDasharray="3 3" />

                        <XAxis
                            dataKey="timestamp"
                        />

                        <YAxis />

                        <Tooltip />

                        <Legend />

                        <Line
                            type="monotone"
                            dataKey="predicted_congestion"
                            stroke="#16a34a"
                            strokeWidth={3}
                            name="Prediction"
                        />

                    </LineChart>

                </ResponsiveContainer>

            </div>

            <div

                style={{

                    height: 400,

                    background: "#fff",

                    padding: 20,

                    borderRadius: 12,

                }}

            >

                <h2>

                    Congestion Distribution

                </h2>

                <ResponsiveContainer>

                    <PieChart>

                        <Pie

                            data={distribution}

                            dataKey="value"

                            nameKey="name"

                            outerRadius={120}

                            label

                        >

                            {

                                distribution.map(

                                    (

                                        entry,

                                        index,

                                    ) => (

                                        <Cell

                                            key={index}

                                            fill={

                                                COLORS[

                                                    index %

                                                    COLORS.length

                                                ]

                                            }

                                        />

                                    )

                                )

                            }

                        </Pie>

                        <Tooltip />

                        <Legend />

                    </PieChart>

                </ResponsiveContainer>

            </div>

            <br />

            <div
                style={{
                    background:"#fff",
                    padding:"20px",
                    borderRadius:"12px",
                    boxShadow:"0 5px 15px rgba(0,0,0,.08)",
                }}
            >

                <h2>

                    Historical Traffic Data

                </h2>

                <table
                    style={{
                        width:"100%",
                        borderCollapse:"collapse",
                        marginTop:"20px"
                    }}
                >

                    <thead>

                        <tr>

                            <th>Road</th>

                            <th>Vehicles</th>

                            <th>Speed</th>

                            <th>Status</th>

                        </tr>

                    </thead>

                    <tbody>

                        {
                            history.map((road)=>(

                                <tr key={road.road}>

                                    <td>{road.road}</td>

                                    <td>{road.vehicles}</td>

                                    <td>{road.average_speed}</td>

                                    <td>{road.status}</td>

                                </tr>

                            ))
                        }

                    </tbody>

                </table>

            </div>

            <br />

            <div
                style={{
                    display:"flex",
                    gap:"20px"
                }}
>

                <button
                    onClick={exportCSV}
                    style={{
                        padding:"12px 18px",
                        background:"#2563eb",
                        color:"#fff",
                        border:"none",
                        borderRadius:"8px",
                        cursor:"pointer",
                        fontWeight:"600",
                    }}
                >
                    ⬇ Export CSV
                </button>

                <button
                    onClick={exportPDF}
                    style={{
                        padding:"12px 18px",
                        background:"#dc2626",
                        color:"#fff",
                        border:"none",
                        borderRadius:"8px",
                        cursor:"pointer",
                        fontWeight:"600",
                    }}
                >
                    📄 Export PDF
                </button>

            </div>

        </AdminLayout>

    );

}

export default HistoricalAnalytics;