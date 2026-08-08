import { useEffect, useState } from "react";

import AdminLayout from "../../components/dashboard/AdminLayout";

import {

    getTrafficReport,

    downloadPDF,

} from "../../services/report";

function Reports() {

    const [report, setReport] = useState(null);

    useEffect(() => {

        let mounted = true;

        const loadReport = async () => {

            try {

                const data = await getTrafficReport();

                if (!mounted) return;

                setReport(data);

            }

            catch (err) {

                console.error(err);

            }

        };

        loadReport();

        return () => {

            mounted = false;

        };

    }, []);

    if (!report) {

        return (

            <AdminLayout
                title="Reports"
                subtitle="Generating report..."
            >

                Loading...

            </AdminLayout>

        );

    }

    return (

        <AdminLayout
            title="Traffic Report"
            subtitle="Current Traffic Summary"
        >

            <div className="stat-card">

                <h2>Total Roads</h2>

                <p>{report.summary.roads}</p>

            </div>

            <br />

            <div className="stat-card">

                <h2>Total Vehicles</h2>

                <p>{report.summary.vehicles}</p>

            </div>

            <br />

            <div className="stat-card">

                <h2>Average Speed</h2>

                <p>{report.summary.average_speed} km/h</p>

            </div>

            <br />

            <div className="stat-card">

                <h2>Heavy Congestion</h2>

                <p>{report.summary.heavy}</p>

            </div>

            <br />

            <button

                onClick={downloadPDF}

                style={{

                    marginTop: "30px",

                    padding: "12px 22px",

                    background: "#2563eb",

                    color: "#fff",

                    border: "none",

                    borderRadius: "8px",

                    cursor: "pointer",

                    fontSize: "16px",

                }}

            >

                Download PDF Report

            </button>

        </AdminLayout>

    );

}

export default Reports;