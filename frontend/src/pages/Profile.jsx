import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Loader from "../components/Loader";
import api from "../services/api";
import { toast } from "react-toastify";

const authHeader = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` },
});

function Profile() {
    const [user, setUser] = useState(null);
    const [name, setName] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        loadProfile();
    }, []);

    async function loadProfile() {
        try {
            setLoading(true);
            const response = await api.get("/auth/me", authHeader());
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
            const response = await api.put("/auth/me", { name: name.trim() }, authHeader());
            setUser(response.data);
            toast.success("Profile updated.");
        } catch (err) {
            console.log(err);
            toast.error(err.response?.data?.detail || "Failed to update profile.");
        } finally {
            setSaving(false);
        }
    }

    if (loading) return <Loader />;

    return (
        <>
            <Navbar />

            <div style={{ padding: "30px", background: "#f5f7fb", minHeight: "100vh" }}>
                <h1 style={{ color: "#1e3a8a", marginBottom: "5px" }}>👤 My Profile</h1>
                <p style={{ color: "#64748b", marginBottom: "30px" }}>
                    View your account details and update your display name.
                </p>

                <div
                    style={{
                        background: "white",
                        borderRadius: "18px",
                        padding: "30px",
                        boxShadow: "0 10px 25px rgba(0,0,0,.08)",
                        maxWidth: "480px",
                    }}
                >
                    <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "25px" }}>
                        <div
                            style={{
                                width: "60px",
                                height: "60px",
                                borderRadius: "50%",
                                background: "linear-gradient(135deg,#1e3a8a,#2563eb)",
                                color: "white",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "24px",
                                fontWeight: "bold",
                                flexShrink: 0,
                            }}
                        >
                            {user?.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <div style={{ fontWeight: "bold", fontSize: "18px", color: "#1e293b" }}>
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

                    <div style={{ marginBottom: "20px" }}>
                        <label style={labelStyle}>Email</label>
                        <div style={{ ...inputStyle, background: "#f1f5f9", color: "#64748b" }}>
                            {user?.email}
                        </div>
                        <p style={{ fontSize: "12px", color: "#94a3b8", marginTop: "4px" }}>
                            Email is your login ID and can't be changed here.
                        </p>
                    </div>

                    <form onSubmit={saveName}>
                        <label style={labelStyle}>Display Name</label>
                        <input
                            style={inputStyle}
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />

                        <button
                            type="submit"
                            disabled={saving}
                            style={{
                                marginTop: "20px",
                                background: saving ? "#93c5fd" : "#2563eb",
                                color: "white",
                                border: "none",
                                padding: "12px 24px",
                                borderRadius: "10px",
                                fontWeight: "bold",
                                cursor: saving ? "default" : "pointer",
                                width: "100%",
                            }}
                        >
                            {saving ? "Saving..." : "Save Changes"}
                        </button>
                    </form>
                </div>
            </div>
        </>
    );
}

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

export default Profile;
