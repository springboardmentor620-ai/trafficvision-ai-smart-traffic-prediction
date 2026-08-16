import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Loader from "../components/Loader";
import api from "../services/api";
import {
    getUsers,
    suspendUser,
    restoreUser
} from "../services/adminService";
import { toast } from "react-toastify";

const ROLE_OPTIONS = ["operator", "admin", "super_admin"];
const STATUS_OPTIONS = ["active", "suspended", "deactivated"];
const PAGE_SIZE = 10;

function roleBadgeColor(role) {
    if (role === "super_admin") return "#7c3aed";
    if (role === "admin") return "#2563eb";
    return "#0f766e";
}

function statusBadgeColor(status) {
    if (status === "suspended") return "#dc2626";
    if (status === "deactivated") return "#6b7280";
    return "#16a34a";
}

function AdminDashboard() {
    const [users, setUsers] = useState([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [busyId, setBusyId] = useState(null);

    const [role, setRole] = useState("");
    const [status, setStatus] = useState("");
    const [searchInput, setSearchInput] = useState("");
    const [search, setSearch] = useState("");

    const [currentUser, setCurrentUser] = useState(null);

    const currentRole = localStorage.getItem("role");

    const getAuthHeader = () => ({
        headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`
        }
    });

    // Debounce the free-text search, same pattern as Alerts.jsx.
    useEffect(() => {
        const timer = setTimeout(() => setSearch(searchInput.trim()), 400);
        return () => clearTimeout(timer);
    }, [searchInput]);

    useEffect(() => {
        loadCurrentUser();
    }, []);

    useEffect(() => {
        loadUsers();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [role, status, search, page]);

    // Reset to page 1 whenever a filter changes so the user isn't
    // stranded on a page that no longer has results.
    useEffect(() => {
        setPage(1);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [role, status, search]);

    async function loadCurrentUser() {
        try {
            const response = await api.get("/auth/me", getAuthHeader());
            setCurrentUser(response.data);
        } catch (error) {
            console.log(error);
        }
    }

    async function loadUsers() {
        try {
            setLoading(true);

            const data = await getUsers({
                search,
                role,
                status,
                page,
                pageSize: PAGE_SIZE
            });

            setUsers(data.items);
            setTotal(data.total);

        } catch (error) {
            console.log(error);
            toast.error("Failed to load users.");
        } finally {
            setLoading(false);
        }
    }

    // Mirrors the backend's _assert_can_target_for_suspend_restore
    // authorization rules, purely so the buttons shown make sense -
    // the backend is the actual boundary regardless of what's shown
    // here; a rejected action still surfaces the real server error.
    function canActOn(targetUser) {
        if (!currentUser) return false;
        if (targetUser.id === currentUser.id) return false;
        if (targetUser.role === "super_admin") return false;
        if (targetUser.role === "admin" && currentRole !== "super_admin") return false;
        return true;
    }

    async function handleSuspend(userId) {
        const confirmSuspend = window.confirm(
            "Suspend this account? They will not be able to log in until restored."
        );
        if (!confirmSuspend) return;

        try {
            setBusyId(userId);
            await suspendUser(userId);
            toast.success("Account suspended.");
            loadUsers();
        } catch (error) {
            console.log(error);
            toast.error(
                error.response?.data?.detail || "Failed to suspend user."
            );
        } finally {
            setBusyId(null);
        }
    }

    async function handleRestore(userId) {
        try {
            setBusyId(userId);
            await restoreUser(userId);
            toast.success("Account restored.");
            loadUsers();
        } catch (error) {
            console.log(error);
            toast.error(
                error.response?.data?.detail || "Failed to restore user."
            );
        } finally {
            setBusyId(null);
        }
    }

    const totalPages = Math.max(Math.ceil(total / PAGE_SIZE), 1);

    if (loading && users.length === 0) {
        return <Loader />;
    }

    return (
        <div style={{ background: "#f5f7fb", minHeight: "100vh" }}>
            <Navbar />

            <div style={{ padding: "30px 35px" }}>

                <h1 style={{ color: "#1e3a8a", marginBottom: "6px" }}>
                    🛡️ Admin Dashboard
                </h1>

                <p style={{ color: "#64748b", marginBottom: "24px" }}>
                    User management - search, filter, suspend, and restore accounts.
                </p>

                {/* Filters */}
                <div
                    style={{
                        display: "flex",
                        gap: "12px",
                        flexWrap: "wrap",
                        marginBottom: "20px"
                    }}
                >
                    <input
                        type="text"
                        placeholder="Search by name or email..."
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        style={{
                            padding: "10px 14px",
                            borderRadius: "10px",
                            border: "1px solid #cbd5e1",
                            minWidth: "260px",
                            flex: 1
                        }}
                    />

                    <select
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        style={{
                            padding: "10px 14px",
                            borderRadius: "10px",
                            border: "1px solid #cbd5e1"
                        }}
                    >
                        <option value="">All roles</option>
                        {ROLE_OPTIONS.map((r) => (
                            <option key={r} value={r}>{r}</option>
                        ))}
                    </select>

                    <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        style={{
                            padding: "10px 14px",
                            borderRadius: "10px",
                            border: "1px solid #cbd5e1"
                        }}
                    >
                        <option value="">All statuses</option>
                        {STATUS_OPTIONS.map((s) => (
                            <option key={s} value={s}>{s}</option>
                        ))}
                    </select>
                </div>

                {/* Table */}
                <div
                    style={{
                        background: "white",
                        borderRadius: "16px",
                        overflow: "hidden",
                        boxShadow: "0 8px 25px rgba(0,0,0,.06)"
                    }}
                >
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                            <tr style={{ background: "#1e3a8a" }}>
                                {["ID", "Name", "Email", "Role", "Status", "Actions"].map((h) => (
                                    <th
                                        key={h}
                                        style={{
                                            color: "white",
                                            textAlign: "left",
                                            padding: "14px 18px",
                                            fontSize: "14px"
                                        }}
                                    >
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>

                        <tbody>
                            {users.map((u) => (
                                <tr
                                    key={u.id}
                                    style={{ borderBottom: "1px solid #eef2f7" }}
                                >
                                    <td style={{ padding: "12px 18px" }}>{u.id}</td>
                                    <td style={{ padding: "12px 18px" }}>{u.name}</td>
                                    <td style={{ padding: "12px 18px" }}>{u.email}</td>
                                    <td style={{ padding: "12px 18px" }}>
                                        <span
                                            style={{
                                                background: roleBadgeColor(u.role),
                                                color: "white",
                                                padding: "4px 10px",
                                                borderRadius: "8px",
                                                fontSize: "12px",
                                                fontWeight: 600
                                            }}
                                        >
                                            {u.role}
                                        </span>
                                    </td>
                                    <td style={{ padding: "12px 18px" }}>
                                        <span
                                            style={{
                                                background: statusBadgeColor(u.status),
                                                color: "white",
                                                padding: "4px 10px",
                                                borderRadius: "8px",
                                                fontSize: "12px",
                                                fontWeight: 600
                                            }}
                                        >
                                            {u.status}
                                        </span>
                                    </td>
                                    <td style={{ padding: "12px 18px" }}>
                                        {canActOn(u) && u.status === "active" && (
                                            <button
                                                onClick={() => handleSuspend(u.id)}
                                                disabled={busyId === u.id}
                                                style={{
                                                    background: "#dc2626",
                                                    color: "white",
                                                    border: "none",
                                                    padding: "8px 14px",
                                                    borderRadius: "8px",
                                                    cursor: "pointer",
                                                    fontWeight: 600
                                                }}
                                            >
                                                Suspend
                                            </button>
                                        )}

                                        {canActOn(u) && u.status === "suspended" && (
                                            <button
                                                onClick={() => handleRestore(u.id)}
                                                disabled={busyId === u.id}
                                                style={{
                                                    background: "#16a34a",
                                                    color: "white",
                                                    border: "none",
                                                    padding: "8px 14px",
                                                    borderRadius: "8px",
                                                    cursor: "pointer",
                                                    fontWeight: 600
                                                }}
                                            >
                                                Restore
                                            </button>
                                        )}

                                        {!canActOn(u) && (
                                            <span style={{ color: "#94a3b8", fontSize: "13px" }}>
                                                —
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            ))}

                            {users.length === 0 && !loading && (
                                <tr>
                                    <td
                                        colSpan={6}
                                        style={{
                                            padding: "30px",
                                            textAlign: "center",
                                            color: "#94a3b8"
                                        }}
                                    >
                                        No users match these filters.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "16px",
                        marginTop: "20px"
                    }}
                >
                    <button
                        onClick={() => setPage((p) => Math.max(p - 1, 1))}
                        disabled={page <= 1}
                        style={{
                            padding: "8px 16px",
                            borderRadius: "8px",
                            border: "1px solid #cbd5e1",
                            background: "white",
                            cursor: page <= 1 ? "default" : "pointer",
                            opacity: page <= 1 ? 0.5 : 1
                        }}
                    >
                        ← Prev
                    </button>

                    <span style={{ color: "#475569" }}>
                        Page {page} of {totalPages} ({total} total)
                    </span>

                    <button
                        onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                        disabled={page >= totalPages}
                        style={{
                            padding: "8px 16px",
                            borderRadius: "8px",
                            border: "1px solid #cbd5e1",
                            background: "white",
                            cursor: page >= totalPages ? "default" : "pointer",
                            opacity: page >= totalPages ? 0.5 : 1
                        }}
                    >
                        Next →
                    </button>
                </div>

            </div>
        </div>
    );
}

export default AdminDashboard;
