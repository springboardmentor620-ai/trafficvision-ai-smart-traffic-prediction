import {
    FaChartPie,
    FaCarCrash,
    FaFileAlt,
    FaMapMarkedAlt,
    FaBell,
    FaUserCircle,
    FaSignOutAlt,
    FaTrafficLight
} from "react-icons/fa";

import { NavLink } from "react-router-dom";

const menus = [

    {
        title: "Dashboard",
        icon: <FaChartPie />,
        path: "/dashboard"
    },

    {
        title: "Prediction",
        icon: <FaCarCrash />,
        path: "/prediction"
    },

    {
        title: "Reports",
        icon: <FaFileAlt />,
        path: "/reports"
    },

    {
        title: "Heatmap",
        icon: <FaMapMarkedAlt />,
        path: "/heatmap"
    },

    {
        title: "Alerts",
        icon: <FaBell />,
        path: "/alerts"
    },

    {
        title: "Profile",
        icon: <FaUserCircle />,
        path: "/profile"
    }

];

function Sidebar() {

    return (

        <aside

            className="

                h-screen

                w-72

                bg-slate-900

                text-white

                flex

                flex-col

                fixed

                left-0

                top-0

            "

        >

            <div

                className="

                    h-24

                    flex

                    items-center

                    justify-center

                    border-b

                    border-slate-700

                "

            >

                <div className="flex items-center gap-4">

                    <FaTrafficLight size={34} />

                    <div>

                        <h1 className="font-bold text-xl">

                            TrafficVision

                        </h1>

                        <p className="text-xs text-slate-400">

                            AI Platform

                        </p>

                    </div>

                </div>

            </div>

            <div

                className="

                    flex-1

                    p-5

                    space-y-2

                "

            >

                {

                    menus.map((menu) => (

                        <NavLink

                            key={menu.title}

                            to={menu.path}

                            className={({ isActive }) =>

                                `

                                flex

                                items-center

                                gap-4

                                px-5

                                py-4

                                rounded-xl

                                transition

                                ${

                                    isActive

                                    ?

                                    "bg-blue-600"

                                    :

                                    "hover:bg-slate-800"

                                }

                                `

                            }

                        >

                            <span className="text-xl">

                                {menu.icon}

                            </span>

                            <span>

                                {menu.title}

                            </span>

                        </NavLink>

                    ))

                }

            </div>

            <div

                className="

                    border-t

                    border-slate-700

                    p-5

                "

            >

                <button

                    className="

                        flex

                        items-center

                        gap-4

                        px-5

                        py-4

                        rounded-xl

                        hover:bg-red-600

                        transition

                        w-full

                    "

                >

                    <FaSignOutAlt />

                    Logout

                </button>

            </div>

        </aside>

    );

}

export default Sidebar;