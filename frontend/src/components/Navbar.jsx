import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser } from "../services/auth";
import { useTheme } from "../context/ThemeContext";
import { useSidebar } from "../context/SidebarContext";

import NotificationPanel from "./common/NotificationPanel";
import Logo from "./common/Logo";


import {
    getNotifications,
} from "../services/notifications";

import "./../styles/navbar.css";

function Navbar() {

    const navigate = useNavigate();
    const { resolvedTheme, toggleTheme } = useTheme();
    const { toggleSidebar } = useSidebar();

    const [menuOpen, setMenuOpen] = useState(false);


    const menuRef = useRef(null);

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
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
                return "Public User";

            default:
                return role;

        }

    };

    return (

        <header className="navbar">

            <div className="navbar-left">

                <button
                    className="menu-button"
                    onClick={toggleSidebar}
                    title="Toggle Sidebar"
                    aria-label="Toggle navigation"
                >
                    ☰
                </button>

                <Logo
                    size="sm"
                    to={user?.role === "traffic_operator" ? "/operator" : user?.role === "commuter" ? "/commuter" : "/admin"}
                    style={{ marginRight: "12px" }}
                />

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
                        title="Notifications"
                        aria-label="View notifications"
                    >

                        🔔

                        {

                            notifications.filter(

                                notification => !notification.is_read

                            ).length > 0 && (

                                <span
                                    style={{
                                        position: "absolute",
                                        top: "-4px",
                                        right: "-4px",
                                        background: "var(--danger)",
                                        color: "#fff",
                                        borderRadius: "50%",
                                        minWidth: "18px",
                                        height: "18px",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        fontSize: "11px",
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

                <button 
                    className="icon-button theme-toggle-btn"
                    onClick={toggleTheme}
                    title={`Switch to ${resolvedTheme === "dark" ? "Light" : "Dark"} Mode`}
                    aria-label="Toggle dark mode"
                >
                    {resolvedTheme === "dark" ? "☀️" : "🌙"}
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

                                {user?.name ? user.name.replace(/^Senior\s+/i, "") : "User"}

                            </div>

                            <div className="role">


                                {user
                                    ? getRoleName(user.role)
                                    : ""}

                            </div>

                        </div>

                    </div>

                    {menuOpen && (

                        <div className="profile-dropdown">

                            <button
                                onClick={() => {
                                    setMenuOpen(false);
                                    navigate("/admin/settings");
                                }}
                            >
                                ⚙️ Settings
                            </button>

                            <button
                                onClick={() => {
                                    toggleTheme();
                                }}
                            >
                                {resolvedTheme === "dark" ? "☀️ Light Mode" : "🌙 Dark Mode"}
                            </button>

                            <button
                                onClick={logout}
                                className="logout-btn"
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
                        onClose={() => setShowNotifications(false)}
                    />
                )
            }

        </header>

    );

}

export default Navbar;