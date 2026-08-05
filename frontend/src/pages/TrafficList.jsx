import { useEffect, useState } from "react";
import api from "../services/api";
import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";
import { CSVLink } from "react-csv";
import { toast } from "react-toastify";

// Road condition monitoring: derived client-side from data the /traffic
// list endpoint already returns, using the same thresholds as the old
// (now removed) route-analysis service - just re-derived here instead of
// round-tripping to a second endpoint for a label built from fields we
// already have.
function roadConditionOf(record) {
    if (record.average_speed > 60 && record.congestion_level === "Low") {
        return { label: "Good", color: "#16a34a" };
    }

    if (record.average_speed >= 30 && record.congestion_level === "Medium") {
        return { label: "Moderate", color: "#f59e0b" };
    }

    return { label: "Poor", color: "#dc2626" };
}

function TrafficList() {
    const [records, setRecords] = useState([]);
    const [search, setSearch] = useState("");
    const [sortField, setSortField] = useState("");
    const [sortOrder, setSortOrder] = useState("asc");
    const [currentPage, setCurrentPage] = useState(1);
    const role = localStorage.getItem("role");
    const recordsPerPage = 5;
    const navigate = useNavigate();

    const getAuthHeader = () => ({
        headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`
        }
    });

    const loadRecords = async () => {
        try {
            const response = await api.get(
                "/traffic",
                getAuthHeader()
            );

            setRecords(response.data);

        } catch (error) {
            console.log(error);
            toast.error("Failed to load records");
        }
    };

    const deleteRecord = async (id) => {
        const confirmDelete = window.confirm(
            "Are you sure you want to delete this traffic record?"
        );

        if (!confirmDelete) return;

        try {
            await api.delete(
                `/traffic/${id}`,
                getAuthHeader()
            );

            toast.success("Record deleted successfully.");
            loadRecords();

        } catch (error) {
            console.log(error);
            toast.error("Failed to delete record.");
        }
    };

    useEffect(() => {
        loadRecords();
    }, []);

    const filteredRecords = records.filter((record) =>
        record.location.toLowerCase().includes(search.toLowerCase()) ||
        record.road_name.toLowerCase().includes(search.toLowerCase())
    );

    const sortRecords = (field) => {
        const order =
            sortField === field && sortOrder === "asc"
                ? "desc"
                : "asc";

        setSortField(field);
        setSortOrder(order);

        const sorted = [...records].sort((a, b) => {
            if (a[field] < b[field])
                return order === "asc" ? -1 : 1;

            if (a[field] > b[field])
                return order === "asc" ? 1 : -1;

            return 0;
        });

        setRecords(sorted);
    };

    const totalPages = Math.ceil(
        filteredRecords.length / recordsPerPage
    );

    const csvData = records.map((record) => ({
        ID: record.id,
        Location: record.location,
        Road: record.road_name,
        Vehicle_Count: record.vehicle_count,
        Average_Speed: record.average_speed,
        Congestion: record.congestion_level,
        Road_Condition: roadConditionOf(record).label
    }));

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
                <>
                    <h1
                        style={{
                            color: "#1e3a8a",
                            marginBottom: "5px"
                        }}
                    >
                        🚦 Traffic Records
                    </h1>

                    <p
                        style={{
                            color: "#666",
                            marginBottom: "30px",
                            fontSize: "17px"
                        }}
                    >
                        Manage, search, edit and export traffic records.
                    </p>
                </>

                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "25px",
                        flexWrap: "wrap",
                        gap: "15px"
                    }}
                >
                    <input
                        type="text"
                        placeholder="🔍 Search by Location or Road..."
                        value={search}
                        onFocus={(e) => {
                            e.target.style.border = "2px solid #2563eb";
                        }}

                        onBlur={(e) => {
                            e.target.style.border = "1px solid #d1d5db";
                        }}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setCurrentPage(1);
                        }}
                        style={{
                            width: "100%",
                            maxWidth: "380px",
                            flex: "1 1 260px",
                            padding: "14px 18px",
                            borderRadius: "12px",
                            border: "1px solid #d1d5db",
                            outline: "none",
                            fontSize: "15px",
                            background: "white",
                            boxShadow: "0 3px 10px rgba(0,0,0,.08)"
                        }}
                    />  

                    <CSVLink
                        data={csvData}
                        filename="traffic_records.csv"
                        onMouseEnter={(e) => {
                            e.target.style.background = "#15803d";
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.background = "#16a34a";
                        }}
                        style={{
                            background: "#16a34a",
                            color: "white",
                            padding: "14px 24px",
                            borderRadius: "12px",
                            textDecoration: "none",
                            fontWeight: "bold",
                            boxShadow: "0 6px 15px rgba(0,0,0,.12)",
                            transition: "0.3s"
                        }}
                    >
                        ⬇ Download CSV
                    </CSVLink>
                </div>

                <table
                    style={{
                        width:"100%",
                        borderCollapse:"collapse",
                        background:"white",
                        borderRadius:"18px",
                        overflow:"hidden",
                        boxShadow:"0 12px 30px rgba(0,0,0,.10)"
                    }}
                >
                    <thead
                        style={{
                            background: "#1e3a8a",
                            color: "white"
                        }}
                    >
                        <tr>
                            <th style={{ padding: "18px", fontSize: "16px" }}>ID</th>

                            <th
                                style={{ padding: "18px", cursor: "pointer" }}
                                onClick={() => sortRecords("location")}
                            >
                                Location ⇅
                            </th>

                            <th
                                style={{ padding: "18px", cursor: "pointer" }}
                                onClick={() => sortRecords("road_name")}
                            >
                                Road ⇅
                            </th>

                            <th
                                style={{ padding: "18px", cursor: "pointer" }}
                                onClick={() => sortRecords("vehicle_count")}
                            >
                                Vehicles ⇅
                            </th>

                            <th
                                style={{ padding: "18px", cursor: "pointer" }}
                                onClick={() => sortRecords("average_speed")}
                            >
                                Speed ⇅
                            </th>

                            <th
                                style={{ padding: "18px", cursor: "pointer" }}
                                onClick={() => sortRecords("congestion_level")}
                            >
                                Congestion ⇅
                            </th>

                            <th style={{ padding: "18px" }}>
                                Road Condition
                            </th>

                            <th style={{ padding: "18px" }}>
                                Actions
                            </th>
                        </tr>
                    </thead>

                    <tbody>
                        {filteredRecords
                            .slice(
                                (currentPage - 1) * recordsPerPage,
                                currentPage * recordsPerPage
                            )
                            .map((record, index) => (
                            <tr
                                key={record.id}
                                style={{
                                    borderBottom: "1px solid #eee",
                                    background:
                                        index % 2 === 0
                                            ? "#ffffff"
                                            : "#f9fafb",
                                    transition: "0.3s"
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = "#eef4ff";
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background =
                                        index % 2 === 0
                                            ? "#ffffff"
                                            : "#f9fafb";
                                }}
                            >
                                <td style={{ padding: "18px" }}>
                                    {record.id}
                                </td>

                                <td style={{ padding: "18px" }}>
                                    {record.location}
                                </td>

                                <td style={{ padding: "18px" }}>
                                    {record.road_name}
                                </td>

                                <td style={{ padding: "18px" }}>
                                    {record.vehicle_count}
                                </td>

                                <td style={{ padding: "18px" }}>
                                    {record.average_speed} km/h
                                </td>

                                <td style={{ padding: "18px" }}>
                                    <span
                                        style={{
                                            padding: "6px 14px",
                                            borderRadius: "20px",
                                            color: "white",
                                            fontWeight: "bold",
                                            background:
                                                record.congestion_level === "High"
                                                    ? "#dc2626"
                                                    : record.congestion_level === "Medium"
                                                    ? "#f59e0b"
                                                    : "#16a34a"
                                        }}
                                    >
                                        {record.congestion_level}
                                    </span>
                                </td>

                                <td style={{ padding: "18px" }}>
                                    <span
                                        style={{
                                            padding: "6px 14px",
                                            borderRadius: "20px",
                                            color: "white",
                                            fontWeight: "bold",
                                            background: roadConditionOf(record).color
                                        }}
                                    >
                                        {roadConditionOf(record).label}
                                    </span>
                                </td>

                                <td
                                    style={{
                                        padding: "18px",
                                        display: "flex",
                                        justifyContent: "center",
                                        alignItems: "center",
                                        gap: "10px"
                                    }}
                                >
                                    <button
                                        onClick={() =>
                                            navigate(`/traffic/edit/${record.id}`)
                                        }
                                        onMouseEnter={(e) => {
                                            e.target.style.background = "#1d4ed8";
                                        }}
                                        onMouseLeave={(e) => {
                                            e.target.style.background = "#2563eb";
                                        }}
                                        style={{
                                            background: "#2563eb",
                                            color: "white",
                                            border: "none",
                                            padding: "10px 18px",
                                            borderRadius: "8px",
                                            cursor: "pointer",
                                            fontWeight: "bold",
                                            transition: "0.3s",
                                        }}
                                    >
                                        ✏️ Edit
                                    </button>

                                    {role === "admin" && (
                                        <button
                                            onClick={() => deleteRecord(record.id)}
                                            onMouseEnter={(e) => {
                                                e.target.style.background = "#b91c1c";
                                            }}
                                            onMouseLeave={(e) => {
                                                e.target.style.background = "#dc2626";
                                            }}
                                            style={{
                                                background: "#dc2626",
                                                color: "white",
                                                border: "none",
                                                padding: "10px 18px",
                                                borderRadius: "8px",
                                                cursor: "pointer",
                                                fontWeight: "bold",
                                                transition: "0.3s"
                                            }}
                                        >
                                            🗑 Delete
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div
                    style={{
                        marginTop: "30px",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        gap: "20px"
                    }}
                >
                    <button
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(currentPage - 1)}
                        onMouseEnter={(e) => {
                            if (!e.target.disabled)
                                e.target.style.background = "#1d4ed8";
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.background = "#1e40af";
                        }}
                        style={{
                            padding: "10px 18px",
                            background: "#1e40af",
                            color: "white",
                            border: "none",
                            borderRadius: "6px",
                            cursor: "pointer",
                            opacity: currentPage === 1 ? 0.5 : 1,
                            transition: "0.3s"
                        }}
                    >
                        Previous
                    </button>

                    <h3
                        style={{
                            color: "#1e3a8a",
                            margin: 0
                        }}
                    >
                        Page {currentPage} of {totalPages || 1}
                    </h3>

                    <button
                        disabled={currentPage === totalPages || totalPages === 0}
                        onClick={() => setCurrentPage(currentPage + 1)}
                        onMouseEnter={(e) => {
                            if (!e.target.disabled)
                                e.target.style.background = "#1d4ed8";
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.background = "#1e40af";
                        }}
                        style={{
                            padding: "10px 18px",
                            background: "#1e40af",
                            color: "white",
                            border: "none",
                            borderRadius: "6px",
                            cursor: "pointer",
                            opacity:
                                currentPage === totalPages || totalPages === 0
                                    ? 0.5
                                    : 1,
                            transition: "0.3s"
                        }}
                    >
                        Next
                    </button>
                </div>
            </div>
        </>
    );
}

export default TrafficList;