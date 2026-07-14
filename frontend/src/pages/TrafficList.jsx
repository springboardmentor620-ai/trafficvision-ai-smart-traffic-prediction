import { useEffect, useState } from "react";
import api from "../services/api";
import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";
import { CSVLink } from "react-csv";
import { toast } from "react-toastify";

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
        Congestion: record.congestion_level
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
                <h1>🚦 Traffic Records</h1>

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
                        onChange={(e) => setSearch(e.target.value)}
                        style={{
                            width: "350px",
                            padding: "12px 15px",
                            borderRadius: "8px",
                            border: "1px solid #ccc",
                            outline: "none",
                            fontSize: "15px"
                        }}
                    />

                    <CSVLink
                        data={csvData}
                        filename="traffic_records.csv"
                        style={{
                            background: "#16a34a",
                            color: "white",
                            padding: "12px 20px",
                            textDecoration: "none",
                            borderRadius: "8px",
                            fontWeight: "bold",
                            boxShadow: "0 4px 10px rgba(0,0,0,0.15)"
                        }}
                    >
                        ⬇ Download CSV
                    </CSVLink>
                </div>

                <table
                    style={{
                        width: "100%",
                        borderCollapse: "collapse",
                        background: "white",
                        borderRadius: "12px",
                        overflow: "hidden",
                        boxShadow: "0 6px 18px rgba(0,0,0,0.12)"
                    }}
                >
                    <thead
                        style={{
                            background: "#2563eb",
                            color: "white"
                        }}
                    >
                        <tr>
                            <th style={{ padding: "15px" }}>ID</th>

                            <th
                                style={{ padding: "15px", cursor: "pointer" }}
                                onClick={() => sortRecords("location")}
                            >
                                Location ⇅
                            </th>

                            <th
                                style={{ padding: "15px", cursor: "pointer" }}
                                onClick={() => sortRecords("road_name")}
                            >
                                Road ⇅
                            </th>

                            <th
                                style={{ padding: "15px", cursor: "pointer" }}
                                onClick={() => sortRecords("vehicle_count")}
                            >
                                Vehicles ⇅
                            </th>

                            <th
                                style={{ padding: "15px", cursor: "pointer" }}
                                onClick={() => sortRecords("average_speed")}
                            >
                                Speed ⇅
                            </th>

                            <th
                                style={{ padding: "15px", cursor: "pointer" }}
                                onClick={() => sortRecords("congestion_level")}
                            >
                                Congestion ⇅
                            </th>

                            <th style={{ padding: "15px" }}>
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
                                            : "#f9fafb"
                                }}
                            >
                                <td style={{ padding: "15px" }}>
                                    {record.id}
                                </td>

                                <td style={{ padding: "15px" }}>
                                    {record.location}
                                </td>

                                <td style={{ padding: "15px" }}>
                                    {record.road_name}
                                </td>

                                <td style={{ padding: "15px" }}>
                                    {record.vehicle_count}
                                </td>

                                <td style={{ padding: "15px" }}>
                                    {record.average_speed} km/h
                                </td>

                                <td style={{ padding: "15px" }}>
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

                                <td
                                    style={{
                                        padding: "15px",
                                        textAlign: "center"
                                    }}
                                >
                                    <button
                                        onClick={() =>
                                            navigate(`/traffic/edit/${record.id}`)
                                        }
                                        style={{
                                            background: "#2563eb",
                                            color: "white",
                                            border: "none",
                                            padding: "8px 16px",
                                            borderRadius: "6px",
                                            cursor: "pointer",
                                            marginRight: "10px",
                                            fontWeight: "bold"
                                        }}
                                    >
                                        Edit
                                    </button>

                                    {role === "admin" && (
                                        <button
                                            onClick={() => deleteRecord(record.id)}
                                            style={{
                                                background: "#dc2626",
                                                color: "white",
                                                border: "none",
                                                padding: "8px 16px",
                                                borderRadius: "6px",
                                                cursor: "pointer",
                                                fontWeight: "bold"
                                            }}
                                        >
                                            Delete
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div
                    style={{
                        marginTop: "25px",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        gap: "20px"
                    }}
                >
                    <button
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(currentPage - 1)}
                        style={{
                            padding: "10px 18px",
                            background: "#2563eb",
                            color: "white",
                            border: "none",
                            borderRadius: "6px",
                            cursor: "pointer",
                            opacity: currentPage === 1 ? 0.5 : 1
                        }}
                    >
                        Previous
                    </button>

                    <h3>
                        Page {currentPage} of {totalPages || 1}
                    </h3>

                    <button
                        disabled={currentPage === totalPages || totalPages === 0}
                        onClick={() => setCurrentPage(currentPage + 1)}
                        style={{
                            padding: "10px 18px",
                            background: "#2563eb",
                            color: "white",
                            border: "none",
                            borderRadius: "6px",
                            cursor: "pointer",
                            opacity:
                                currentPage === totalPages || totalPages === 0
                                    ? 0.5
                                    : 1
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