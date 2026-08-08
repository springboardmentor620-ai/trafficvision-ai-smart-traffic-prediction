import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser } from "../services/auth";

import NotificationPanel from "./common/NotificationPanel";

import {
    getNotifications,
} from "../services/notifications";

import "./../styles/navbar.css";

function Navbar() {

    const navigate = useNavigate();

    const [menuOpen, setMenuOpen] = useState(false);

    const menuRef = useRef(null);

    const logout = () => {

        localStorage.removeItem("token");

        navigate("/login");

    };

    useEffect(() => {

        const closeMenu = (e) => {

            if (
                menuRef.current &&
                !menuRef.current.contains(e.target)
            ) {

                setMenuOpen(false);

            }

        };

        document.addEventListener("click", closeMenu);

        return () =>
            document.removeEventListener(
                "click",
                closeMenu
            );

    }, []);
    
    const [user, setUser] = useState(null);

    const [notifications, setNotifications] = useState([]);

    const [showNotifications, setShowNotifications] = useState(false);

    const loadNotifications = async () => {

        try {

            const data = await getNotifications();

            setNotifications(data);

        }

        catch (err) {

            console.error(err);

        }

    };

    useEffect(() => {

        const loadUser = async () => {

            try {

                const currentUser = await getCurrentUser();

                setUser(currentUser);

            }

            catch (err) {

                console.error(err);

            }

        };

        loadUser();

    }, []);

    useEffect(() => {

        loadNotifications();

        const timer = setInterval(() => {

            loadNotifications();

        }, 5000);

        return () => clearInterval(timer);

    }, []);

    const getRoleName = (role) => {

        switch (role) {

            case "admin":
                return "System Administrator";

            case "traffic_operator":
                return "Traffic Operator";

            case "commuter":
                return "Commuter";

            default:
                return role;

        }

    };

    return (

        <header className="navbar">

            <div className="navbar-left">

                <button className="menu-button">
                    ☰
                </button>

                <input
                    className="search-box"
                    placeholder="Search traffic, reports, zones..."
                />

            </div>

            <div className="navbar-right">

                <div
                    style={{
                        position: "relative",
                    }}
                >

                    <button
                        className="icon-button"
                        onClick={() =>
                            setShowNotifications(!showNotifications)
                        }
                    >

                        🔔

                        {

                            notifications.filter(

                                notification => !notification.is_read

                            ).length > 0 && (

                                <span
                                    style={{
                                        position: "absolute",
                                        top: "-6px",
                                        right: "-6px",
                                        background: "#ef4444",
                                        color: "#fff",
                                        borderRadius: "50%",
                                        minWidth: "20px",
                                        height: "20px",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        fontSize: "12px",
                                        fontWeight: "bold",
                                    }}
                                >
                                    {

                                        notifications.filter(

                                            notification => !notification.is_read

                                        ).length

                                    }
                                </span>

                            )

                        }

                    </button>

                </div>    

                <button className="icon-button">
                    🌙
                </button>

                <div
                    className="profile"
                    ref={menuRef}
                >

                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            cursor: "pointer",
                            gap: "12px",
                        }}
                        onClick={() => setMenuOpen(!menuOpen)}
                    >

                        <div className="avatar">

                            {user?.name
                                ? user.name.charAt(0).toUpperCase()
                                : "?"}

                        </div>

                        <div>

                            <div className="username">

                                {user?.name || "Loading..."}

                            </div>

                            <div className="role">

                                {user
                                    ? getRoleName(user.role)
                                    : ""}

                            </div>

                        </div>

                    </div>

                    {menuOpen && (

                        <div
                            style={{
                                position: "absolute",
                                right: 20,
                                top: 70,
                                background: "#fff",
                                borderRadius: "10px",
                                boxShadow: "0 5px 20px rgba(0,0,0,.15)",
                                minWidth: "180px",
                                overflow: "hidden",
                                zIndex: 999,
                            }}
                        >

                            <button
                                style={{
                                    width: "100%",
                                    border: "none",
                                    background: "white",
                                    padding: "14px",
                                    cursor: "pointer",
                                    textAlign: "left",
                                }}
                            >
                                👤 Profile
                            </button>

                            <button
                                style={{
                                    width: "100%",
                                    border: "none",
                                    background: "white",
                                    padding: "14px",
                                    cursor: "pointer",
                                    textAlign: "left",
                                }}
                            >
                                ⚙ Settings
                            </button>

                            <button
                                onClick={logout}
                                style={{
                                    width: "100%",
                                    border: "none",
                                    background: "#ef4444",
                                    color: "white",
                                    padding: "14px",
                                    cursor: "pointer",
                                    textAlign: "left",
                                }}
                            >
                                🚪 Logout
                            </button>

                        </div>

                    )}

                </div>
                
            </div>

            {

                showNotifications && (

                    <NotificationPanel

                        notifications={notifications}

                        refresh={loadNotifications}

                    />

                )

            }


        </header>

    );

}

export default Navbar;