import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import NotificationPanel from "./NotificationPanel";

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
            console.log(error);
        }
    };

    const logout = () => {
        localStorage.removeItem("access_token");
        localStorage.removeItem("role");
        navigate("/");
    };

    const navLinkStyle = {
        color: "white",
        textDecoration: "none",
        fontWeight: "600",
        padding: "10px 16px",
        borderRadius: "10px",
        transition: "all .3s ease"
    };

    return (
        <div
            style={{
                background:
                    "linear-gradient(90deg,#1e3a8a,#2563eb)",
                padding: "16px 35px",
                display: "flex",
                alignItems: "center",
                gap: "12px",
                flexWrap: "wrap",
                position: "sticky",
                top: 0,
                zIndex: 999,
                boxShadow: "0 8px 25px rgba(0,0,0,.18)"
            }}
        >
            <Link
                to="/dashboard"
                style={{
                    color: "white",
                    textDecoration: "none",
                    fontSize: "28px",
                    fontWeight: "700",
                    marginRight: "25px"
                }}
            >
                🚦 TrafficVision AI
            </Link>

            <Link 
                to="/alerts"
                style={{
                    color: "white",
                    textDecoration: "none",
                    fontWeight: "600",
                    fontSize: "18px"
                }}
                >
                    Alerts
                </Link>

            <Link 
                to="/heatmap"
                style={{
                    color: "white",
                    textDecoration: "none",
                    fontWeight: "600",
                    fontSize: "18px"
                }}
                >
                    🔥 Heatmap
                </Link>     
            {[
                { name: "Dashboard", path: "/dashboard" },
                { name: "Analytics", path: "/analytics" },
                { name: "Trends", path: "/trends" },
                { name: "Prediction", path: "/prediction" },
                { name: "History", path: "/prediction/history" },
                ...(role === "admin"
                    ? [{ name: "Add Traffic", path: "/traffic/add" }]
                    : []),
                { name: "Traffic Records", path: "/traffic/list" }
            ].map((item) => (
                <Link
                    key={item.name}
                    to={item.path}
                    style={navLinkStyle}
                    onMouseEnter={(e) => {
                        e.target.style.background =
                            "rgba(255,255,255,.18)";
                    }}
                    onMouseLeave={(e) => {
                        e.target.style.background = "transparent";
                    }}
                >
                    {item.name}
                </Link>
            ))}

            <div
                style={{
                    marginLeft: "auto",
                    display: "flex",
                    alignItems: "center",
                    gap: "18px"
                }}
            >
                <NotificationPanel />

                {user && (
                    <Link
                        to="/profile"
                        style={{
                            background:
                                "rgba(255,255,255,.18)",
                            padding: "10px 18px",
                            borderRadius: "14px",
                            color: "white",
                            textAlign: "center",
                            minWidth: "150px",
                            textDecoration: "none",
                            cursor: "pointer"
                        }}
                    >
                        <div
                            style={{
                                fontWeight: "700",
                                fontSize: "16px"
                            }}
                        >
                            👤 {user.name}
                        </div>

                        <div
                            style={{
                                fontSize: "13px",
                                opacity: .9
                            }}
                        >
                            {user.role.toUpperCase()}
                        </div>
                    </Link>
                )}

                <button
                    onClick={logout}
                    onMouseEnter={(e) => {
                        e.target.style.background = "#b91c1c";
                        e.target.style.transform = "scale(1.05)";
                    }}
                    onMouseLeave={(e) => {
                        e.target.style.background = "#ef4444";
                        e.target.style.transform = "scale(1)";
                    }}
                    style={{
                        background: "#ef4444",
                        color: "white",
                        border: "none",
                        padding: "12px 20px",
                        borderRadius: "12px",
                        fontWeight: "600",
                        cursor: "pointer",
                        transition: "all .3s ease"
                    }}
                >
                    🚪 Logout
                </button>
            </div>
        </div>
    );
}

export default Navbar;