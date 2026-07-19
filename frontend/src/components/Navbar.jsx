import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

function Navbar() {
    const navigate = useNavigate();

    const role = localStorage.getItem("role");
    const [user, setUser] = useState(null);

    const getAuthHeader = () => ({
        headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`
        }
    });

    useEffect(() => {
        loadUser();
    }, []);

    const loadUser = async () => {
        try {
            const response = await api.get(
                "/auth/me",
                getAuthHeader()
            );

            setUser(response.data);
        } catch (error) {
            console.error(error);
        }
    };

    const logout = () => {
        localStorage.removeItem("access_token");
        localStorage.removeItem("role");
        navigate("/");
    };

    return (
        <div
            style={{
                background: "#2563eb",
                color: "white",
                padding: "15px 30px",
                display: "flex",
                alignItems: "center",
                gap: "20px"
            }}
        >
            <h2 style={{ margin: 0 }}>
                🚦 TrafficVision AI
            </h2>

            <Link
                to="/dashboard"
                style={{
                    color: "white",
                    textDecoration: "none"
                }}
            >
                Dashboard
            </Link>

            <Link
                to="/analytics"
                style={{
                    color: "white",
                    textDecoration: "none"
                }}
            >
                Analytics
            </Link>

            <Link
                to="/prediction"
                style={{
                    color: "white",
                    textDecoration: "none"
                }}
            >
                Prediction
            </Link>

            {role === "admin" && (
                <Link
                    to="/traffic/add"
                    style={{
                        color: "white",
                        textDecoration: "none"
                    }}
                >
                    Add Traffic
                </Link>
            )}

            <Link
                to="/traffic/list"
                style={{
                    color: "white",
                    textDecoration: "none"
                }}
            >
                Traffic Records
            </Link>

            <div style={{ marginLeft: "auto" }}>
                {user && (
                    <>
                        👤 <strong>{user.name}</strong> | {user.role}
                    </>
                )}
            </div>

            <button
                onClick={logout}
                style={{
                    marginLeft: "20px",
                    padding: "8px 15px",
                    border: "none",
                    borderRadius: "5px",
                    background: "#dc2626",
                    color: "white",
                    cursor: "pointer"
                }}
            >
                Logout
            </button>
        </div>
    );
}

export default Navbar;