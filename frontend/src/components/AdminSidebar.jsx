import { NavLink } from "react-router-dom";
import {
    LayoutDashboard,
    BarChart3,
    BrainCircuit,
    FileText,
    Bell,
    Users,
    ShieldAlert,
    LogOut
} from "lucide-react";

import "./AdminSidebar.css";

function AdminSidebar() {

    const menu = [

        {
            title: "Dashboard",
            icon: <LayoutDashboard size={20} />,
            path: "/admin"
        },

        {
            title: "Analytics",
            icon: <BarChart3 size={20} />,
            path: "/admin/analytics"
        },

        {
            title: "Predictions",
            icon: <BrainCircuit size={20} />,
            path: "/admin/predictions"
        },

        {
            title: "Reports",
            icon: <FileText size={20} />,
            path: "/admin/reports"
        },

        {
            title: "Alerts",
            icon: <ShieldAlert size={20} />,
            path: "/admin/alerts"
        },

        {
            title: "Notifications",
            icon: <Bell size={20} />,
            path: "/admin/notifications"
        },

        {
            title: "Users",
            icon: <Users size={20} />,
            path: "/admin/users"
        }

    ];

    return (

        <aside className="admin-sidebar">

            <div className="sidebar-logo">

                <div className="logo-circle">
                    🚦
                </div>

                <div>

                    <h2>TrafficVision</h2>

                    <span>Admin Panel</span>

                </div>

            </div>

            <div className="sidebar-menu">

                {

                    menu.map((item) => (

                        <NavLink
                            key={item.title}
                            to={item.path}
                            className={({ isActive }) =>
                                isActive
                                    ? "sidebar-link active"
                                    : "sidebar-link"
                            }
                        >

                            <span className="menu-icon">
                                {item.icon}
                            </span>

                            <span>
                                {item.title}
                            </span>

                        </NavLink>

                    ))

                }

            </div>

            <div className="sidebar-footer">

                <button className="logout-btn">

                    <LogOut size={18} />

                    Logout

                </button>

            </div>

        </aside>

    );

}

export default AdminSidebar;