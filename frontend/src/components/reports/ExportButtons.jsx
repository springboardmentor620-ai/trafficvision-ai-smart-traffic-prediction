import {
    FaFilePdf,
    FaFileExcel,
    FaFileCsv
} from "react-icons/fa";


function ExportButtons({
    data = [],
    onExport
}) {


    function escapeCsv(value) {

        if (
            value === null ||
            value === undefined
        ) {

            return "";

        }

        const text = String(value);

        if (
            text.includes(",") ||
            text.includes('"') ||
            text.includes("\n")
        ) {

            return `"${text.replace(/"/g, '""')}"`;

        }

        return text;

    }


    function getRows() {

        return data.map((item) => {

            return {

                Date:
                    item.created_at ||
                    item.createdAt ||
                    item.date ||
                    "-",

                City:
                    item.city ||
                    "-",

                State:
                    item.state ||
                    "-",

                Severity:
                    item.predicted_severity ||
                    "-",

                Risk:
                    item.predicted_risk_score !== undefined
                        ? `${Math.round(
                            Number(item.predicted_risk_score) * 100
                        )}%`
                        : "-",

                Alert:
                    item.traffic_alert ||
                    "-",

                Emergency:
                    item.emergency_level ||
                    "-",

                Recommendation:
                    item.recommendation ||
                    "-"

            };

        });

    }


    function downloadFile(
        content,
        fileName,
        type
    ) {

        const blob = new Blob(
            [content],
            {
                type
            }
        );


        const url =
            URL.createObjectURL(blob);


        const link =
            document.createElement("a");


        link.href = url;

        link.download = fileName;

        document.body.appendChild(link);

        link.click();

        link.remove();

        URL.revokeObjectURL(url);

    }


    function exportCSV() {

        const rows = getRows();


        const headers = [

            "Date",
            "City",
            "State",
            "Severity",
            "Risk",
            "Traffic Alert",
            "Emergency Level",
            "Recommendation"

        ];


        const csvRows = [

            headers.join(","),

            ...rows.map((row) => (

                [

                    row.Date,
                    row.City,
                    row.State,
                    row.Severity,
                    row.Risk,
                    row.Alert,
                    row.Emergency,
                    row.Recommendation

                ]
                    .map(escapeCsv)
                    .join(",")

            ))

        ];


        downloadFile(

            csvRows.join("\n"),

            "traffic-report.csv",

            "text/csv;charset=utf-8;"

        );


        if (onExport) {

            onExport("CSV");

        }

    }


    function exportExcel() {

        const rows = getRows();


        const tableRows = rows.map((row) => `

            <tr>

                <td>${row.Date}</td>

                <td>${row.City}</td>

                <td>${row.State}</td>

                <td>${row.Severity}</td>

                <td>${row.Risk}</td>

                <td>${row.Alert}</td>

                <td>${row.Emergency}</td>

                <td>${row.Recommendation}</td>

            </tr>

        `).join("");


        const html = `

            <html>

                <head>

                    <meta charset="UTF-8">

                    <style>

                        table {
                            border-collapse: collapse;
                            width: 100%;
                            font-family: Arial;
                        }

                        th,
                        td {
                            border: 1px solid #cccccc;
                            padding: 8px;
                            text-align: left;
                        }

                        th {
                            background: #2563eb;
                            color: white;
                        }

                    </style>

                </head>

                <body>

                    <h2>TrafficVision Traffic Report</h2>

                    <table>

                        <thead>

                            <tr>

                                <th>Date</th>
                                <th>City</th>
                                <th>State</th>
                                <th>Severity</th>
                                <th>Risk</th>
                                <th>Traffic Alert</th>
                                <th>Emergency</th>
                                <th>Recommendation</th>

                            </tr>

                        </thead>

                        <tbody>

                            ${tableRows}

                        </tbody>

                    </table>

                </body>

            </html>

        `;


        downloadFile(

            html,

            "traffic-report.xls",

            "application/vnd.ms-excel"

        );


        if (onExport) {

            onExport("Excel");

        }

    }


    function exportPDF() {

        const rows = getRows();


        const tableRows = rows.map((row) => `

            <tr>

                <td>${row.Date}</td>

                <td>${row.City}</td>

                <td>${row.State}</td>

                <td>${row.Severity}</td>

                <td>${row.Risk}</td>

                <td>${row.Alert}</td>

                <td>${row.Emergency}</td>

            </tr>

        `).join("");


        const printWindow =
            window.open(
                "",
                "_blank",
                "width=1100,height=750"
            );


        if (!printWindow) {

            alert(
                "Please allow pop-ups to export the PDF."
            );

            return;

        }


        printWindow.document.write(`

            <!DOCTYPE html>

            <html>

                <head>

                    <title>
                        TrafficVision Report
                    </title>

                    <style>

                        body {
                            font-family: Arial, sans-serif;
                            padding: 40px;
                            color: #111827;
                        }

                        h1 {
                            margin-bottom: 8px;
                        }

                        p {
                            color: #6b7280;
                            margin-bottom: 30px;
                        }

                        table {
                            width: 100%;
                            border-collapse: collapse;
                        }

                        th,
                        td {
                            border: 1px solid #d1d5db;
                            padding: 10px;
                            text-align: left;
                            font-size: 12px;
                        }

                        th {
                            background: #2563eb;
                            color: white;
                        }

                    </style>

                </head>

                <body>

                    <h1>
                        TrafficVision Traffic Report
                    </h1>

                    <p>
                        Generated from prediction history
                    </p>

                    <table>

                        <thead>

                            <tr>

                                <th>Date</th>
                                <th>City</th>
                                <th>State</th>
                                <th>Severity</th>
                                <th>Risk</th>
                                <th>Traffic Alert</th>
                                <th>Emergency</th>

                            </tr>

                        </thead>

                        <tbody>

                            ${tableRows}

                        </tbody>

                    </table>

                </body>

            </html>

        `);


        printWindow.document.close();


        printWindow.focus();


        setTimeout(() => {

            printWindow.print();

        }, 300);


        if (onExport) {

            onExport("PDF");

        }

    }


    return (

        <div
            className="
                flex
                w-full
                flex-col
                gap-4

                sm:flex-row
                sm:flex-wrap
            "
        >

            <button
                type="button"
                onClick={exportPDF}

                className="
                    flex
                    min-h-[48px]
                    flex-1

                    items-center
                    justify-center
                    gap-3

                    rounded-xl

                    border
                    border-red-500/20

                    bg-red-500/10

                    px-5
                    py-3

                    text-sm
                    font-semibold

                    text-red-400

                    transition

                    hover:bg-red-500/20

                    sm:flex-none
                "
            >

                <FaFilePdf />

                Export PDF

            </button>


            <button
                type="button"
                onClick={exportExcel}

                className="
                    flex
                    min-h-[48px]
                    flex-1

                    items-center
                    justify-center
                    gap-3

                    rounded-xl

                    border
                    border-emerald-500/20

                    bg-emerald-500/10

                    px-5
                    py-3

                    text-sm
                    font-semibold

                    text-emerald-400

                    transition

                    hover:bg-emerald-500/20

                    sm:flex-none
                "
            >

                <FaFileExcel />

                Export Excel

            </button>


            <button
                type="button"
                onClick={exportCSV}

                className="
                    flex
                    min-h-[48px]
                    flex-1

                    items-center
                    justify-center
                    gap-3

                    rounded-xl

                    border
                    border-blue-500/20

                    bg-blue-500/10

                    px-5
                    py-3

                    text-sm
                    font-semibold

                    text-blue-400

                    transition

                    hover:bg-blue-500/20

                    sm:flex-none
                "
            >

                <FaFileCsv />

                Export CSV

            </button>

        </div>

    );

}


export default ExportButtons;