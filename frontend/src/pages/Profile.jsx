import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Loader from "../components/Loader";
import api from "../services/api";
import { toast } from "react-toastify";

const authHeader = () => ({
    headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
    },
});

function Profile() {
    const navigate = useNavigate();

    const [user, setUser] = useState(null);
    const [name, setName] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Delete account states
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        loadProfile();
    }, []);

    async function loadProfile() {
        try {
            setLoading(true);

            const response = await api.get(
                "/auth/me",
                authHeader()
            );

            setUser(response.data);
            setName(response.data.name);
        } catch (err) {
            console.log(err);
            toast.error("Failed to load your profile.");
        } finally {
            setLoading(false);
        }
    }

    async function saveName(e) {
        e.preventDefault();

        if (!name.trim()) {
            toast.error("Name can't be empty.");
            return;
        }

        try {
            setSaving(true);

            const response = await api.put(
                "/auth/me",
                {
                    name: name.trim(),
                },
                authHeader()
            );

            setUser(response.data);

            toast.success("Profile updated.");
        } catch (err) {
            console.log(err);

            toast.error(
                err.response?.data?.detail ||
                "Failed to update profile."
            );
        } finally {
            setSaving(false);
        }
    }

    async function deleteAccount() {
        try {
            setDeleting(true);

            await api.delete(
                "/auth/me",
                authHeader()
            );

            // Remove authentication information
            localStorage.removeItem("access_token");
            localStorage.removeItem("role");

            // Close modal
            setShowDeleteModal(false);

            toast.success("Your account has been deleted.");

            // Redirect to login
            setTimeout(() => {
                navigate("/login", { replace: true });
            }, 800);

        } catch (err) {
            console.log(err);

            toast.error(
                err.response?.data?.detail ||
                "Failed to delete your account."
            );

            setDeleting(false);
        }
    }

    if (loading) {
        return <Loader />;
    }

    return (
        <>
            <Navbar />

            <div
                style={{
                    padding: "30px",
                    background: "#f5f7fb",
                    minHeight: "100vh",
                }}
            >
                {/* Page Header */}
                <h1
                    style={{
                        color: "#1e3a8a",
                        marginBottom: "5px",
                    }}
                >
                    👤 My Profile
                </h1>

                <p
                    style={{
                        color: "#64748b",
                        marginBottom: "30px",
                    }}
                >
                    View your account details and update your display name.
                </p>

                {/* Profile Card */}
                <div
                    style={{
                        background: "white",
                        borderRadius: "18px",
                        padding: "30px",
                        boxShadow: "0 10px 25px rgba(0,0,0,.08)",
                        maxWidth: "480px",
                    }}
                >
                    {/* User Header */}
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "16px",
                            marginBottom: "25px",
                        }}
                    >
                        {/* Avatar */}
                        <div
                            style={{
                                width: "60px",
                                height: "60px",
                                borderRadius: "50%",
                                background:
                                    "linear-gradient(135deg,#1e3a8a,#2563eb)",
                                color: "white",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "24px",
                                fontWeight: "bold",
                                flexShrink: 0,
                            }}
                        >
                            {user?.name
                                ?.charAt(0)
                                .toUpperCase()}
                        </div>

                        {/* Name + Role */}
                        <div>
                            <div
                                style={{
                                    fontWeight: "bold",
                                    fontSize: "18px",
                                    color: "#1e293b",
                                }}
                            >
                                {user?.name}
                            </div>

                            <span
                                style={{
                                    display: "inline-block",
                                    marginTop: "4px",
                                    fontSize: "12px",
                                    fontWeight: 600,
                                    color: "#2563eb",
                                    background: "#eff6ff",
                                    borderRadius: "999px",
                                    padding: "2px 12px",
                                }}
                            >
                                {user?.role?.toUpperCase()}
                            </span>
                        </div>
                    </div>

                    {/* Email */}
                    <div
                        style={{
                            marginBottom: "20px",
                        }}
                    >
                        <label style={labelStyle}>
                            Email
                        </label>

                        <div
                            style={{
                                ...inputStyle,
                                background: "#f1f5f9",
                                color: "#64748b",
                            }}
                        >
                            {user?.email}
                        </div>

                        <p
                            style={{
                                fontSize: "12px",
                                color: "#94a3b8",
                                marginTop: "4px",
                            }}
                        >
                            Email is your login ID and can't be
                            changed here.
                        </p>
                    </div>

                    {/* Display Name */}
                    <form onSubmit={saveName}>
                        <label style={labelStyle}>
                            Display Name
                        </label>

                        <input
                            style={inputStyle}
                            value={name}
                            onChange={(e) =>
                                setName(e.target.value)
                            }
                        />

                        <button
                            type="submit"
                            disabled={saving}
                            style={{
                                marginTop: "20px",
                                background: saving
                                    ? "#93c5fd"
                                    : "#2563eb",
                                color: "white",
                                border: "none",
                                padding: "12px 24px",
                                borderRadius: "10px",
                                fontWeight: "bold",
                                cursor: saving
                                    ? "default"
                                    : "pointer",
                                width: "100%",
                            }}
                        >
                            {saving
                                ? "Saving..."
                                : "Save Changes"}
                        </button>
                    </form>

                    {/* Divider */}
                    <div
                        style={{
                            height: "1px",
                            background: "#e2e8f0",
                            margin: "30px 0 25px",
                        }}
                    />

                    {/* Danger Zone */}
                    <div>
                        <h3
                            style={{
                                color: "#991b1b",
                                fontSize: "16px",
                                marginBottom: "8px",
                            }}
                        >
                            Danger Zone
                        </h3>

                        <p
                            style={{
                                color: "#64748b",
                                fontSize: "13px",
                                lineHeight: "1.5",
                                marginBottom: "15px",
                            }}
                        >
                            Deleting your account is permanent.
                            Your account and associated data will
                            be removed and cannot be recovered.
                        </p>

                        <button
                            type="button"
                            onClick={() =>
                                setShowDeleteModal(true)
                            }
                            disabled={deleting}
                            style={{
                                width: "100%",
                                padding: "12px 20px",
                                borderRadius: "10px",
                                border: "1px solid #dc2626",
                                background: "white",
                                color: "#dc2626",
                                fontWeight: "bold",
                                cursor: "pointer",
                                transition: "all 0.2s ease",
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background =
                                    "#fef2f2";
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background =
                                    "white";
                            }}
                        >
                            🗑️ Delete My Account
                        </button>
                    </div>
                </div>
            </div>

            {/* ============================= */}
            {/* DELETE CONFIRMATION MODAL */}
            {/* ============================= */}

            {showDeleteModal && (
                <div
                    style={modalOverlayStyle}
                    onClick={() => {
                        if (!deleting) {
                            setShowDeleteModal(false);
                        }
                    }}
                >
                    <div
                        style={modalStyle}
                        onClick={(e) =>
                            e.stopPropagation()
                        }
                    >
                        {/* Warning Icon */}
                        <div style={warningIconStyle}>
                            ⚠️
                        </div>

                        {/* Title */}
                        <h2
                            style={{
                                margin: "0 0 10px",
                                color: "#1e293b",
                                fontSize: "22px",
                            }}
                        >
                            Delete Account?
                        </h2>

                        {/* Description */}
                        <p
                            style={{
                                color: "#64748b",
                                fontSize: "14px",
                                lineHeight: "1.6",
                                marginBottom: "20px",
                            }}
                        >
                            Are you sure you want to delete your
                            account?
                            <br />
                            <strong
                                style={{
                                    color: "#334155",
                                }}
                            >
                                This action cannot be undone.
                            </strong>
                        </p>

                        {/* Warning Box */}
                        <div
                            style={{
                                background: "#fef2f2",
                                border: "1px solid #fecaca",
                                borderRadius: "10px",
                                padding: "12px 14px",
                                marginBottom: "25px",
                                color: "#991b1b",
                                fontSize: "13px",
                                lineHeight: "1.5",
                            }}
                        >
                            Your profile and associated account
                            data will be permanently deleted.
                        </div>

                        {/* Buttons */}
                        <div
                            style={{
                                display: "flex",
                                gap: "12px",
                            }}
                        >
                            {/* Cancel */}
                            <button
                                type="button"
                                disabled={deleting}
                                onClick={() =>
                                    setShowDeleteModal(false)
                                }
                                style={{
                                    flex: 1,
                                    padding: "12px",
                                    borderRadius: "10px",
                                    border: "1px solid #cbd5e1",
                                    background: "white",
                                    color: "#334155",
                                    fontWeight: "600",
                                    cursor: deleting
                                        ? "default"
                                        : "pointer",
                                }}
                            >
                                Cancel
                            </button>

                            {/* Delete */}
                            <button
                                type="button"
                                disabled={deleting}
                                onClick={deleteAccount}
                                style={{
                                    flex: 1,
                                    padding: "12px",
                                    borderRadius: "10px",
                                    border: "none",
                                    background: deleting
                                        ? "#fca5a5"
                                        : "#dc2626",
                                    color: "white",
                                    fontWeight: "bold",
                                    cursor: deleting
                                        ? "default"
                                        : "pointer",
                                }}
                            >
                                {deleting
                                    ? "Deleting..."
                                    : "Yes, Delete Account"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

/* ============================= */
/* STYLES */
/* ============================= */

const labelStyle = {
    display: "block",
    fontSize: "13px",
    fontWeight: 600,
    color: "#475569",
    marginBottom: "6px",
};

const inputStyle = {
    width: "100%",
    padding: "12px 14px",
    borderRadius: "10px",
    border: "1px solid #d1d5db",
    outline: "none",
    fontSize: "14px",
    boxSizing: "border-box",
};

const modalOverlayStyle = {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(15, 23, 42, 0.55)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
    padding: "20px",
};

const modalStyle = {
    width: "100%",
    maxWidth: "420px",
    background: "white",
    borderRadius: "18px",
    padding: "30px",
    boxShadow: "0 25px 50px rgba(0,0,0,0.25)",
    textAlign: "center",
};

const warningIconStyle = {
    width: "55px",
    height: "55px",
    borderRadius: "50%",
    background: "#fef2f2",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "26px",
    margin: "0 auto 18px",
};

export default Profile;