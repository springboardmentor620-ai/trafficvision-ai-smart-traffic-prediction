import {
    FaChartPie,
    FaCarCrash,
    FaFileAlt,
    FaMapMarkedAlt,
    FaBell,
    FaUserCircle,
    FaSignOutAlt,
    FaTrafficLight,
    FaChartLine
} from "react-icons/fa";

import { NavLink, useNavigate } from "react-router-dom";

import AuthService from "../../services/authService";


const mainMenus = [

    {
        title: "Dashboard",
        icon: <FaChartPie />,
        path: "/dashboard"
    },

    // Map comes BEFORE Prediction
    {
        title: "Maps & Routes",
        icon: <FaMapMarkedAlt />,
        path: "/maps"
    },

    {
        title: "Traffic Prediction",
        icon: <FaCarCrash />,
        path: "/prediction"
    },

    {
        title: "Analytics",
        icon: <FaChartLine />,
        path: "/analytics"
    },

    {
        title: "Reports",
        icon: <FaFileAlt />,
        path: "/reports"
    },

    {
        title: "Alerts",
        icon: <FaBell />,
        path: "/alerts"
    }

];


function Sidebar() {

    const navigate = useNavigate();


    function handleLogout() {

        AuthService.logout();

        navigate("/login");

    }


    return (

        <aside
            className="
                relative

                hidden
                lg:flex

                min-h-screen
                w-full

                flex-col

                border-r
                border-slate-200

                bg-white

                dark:border-slate-800
                dark:bg-[#0a1833]
            "
        >

            {/* ================= BRAND ================= */}

            <div
                className="
                    flex
                    h-24
                    shrink-0
                    items-center

                    border-b
                    border-slate-200

                    px-6

                    dark:border-slate-800
                "
            >

                <div
                    className="
                        flex
                        min-w-0
                        items-center
                        gap-3
                    "
                >

                    <div
                        className="
                            flex
                            h-11
                            w-11
                            shrink-0
                            items-center
                            justify-center

                            rounded-xl

                            bg-blue-600

                            text-white
                        "
                    >

                        <FaTrafficLight size={21} />

                    </div>


                    <div className="min-w-0">

                        <h1
                            className="
                                truncate

                                text-lg
                                font-bold

                                text-slate-900

                                dark:text-white
                            "
                        >
                            TrafficVision
                        </h1>

                        <p
                            className="
                                truncate

                                text-[11px]

                                text-slate-500

                                dark:text-slate-400
                            "
                        >
                            AI Traffic Intelligence
                        </p>

                    </div>

                </div>

            </div>


            {/* ================= MENU ================= */}

            <div
                className="
                    flex-1
                    overflow-y-auto

                    px-4
                    py-7
                "
            >

                <p
                    className="
                        mb-3
                        px-3

                        text-[10px]
                        font-semibold
                        uppercase
                        tracking-[0.18em]

                        text-slate-400
                    "
                >
                    Main Menu
                </p>


                <nav className="space-y-1.5">

                    {mainMenus.map((menu) => (

                        <NavLink
                            key={menu.path}
                            to={menu.path}

                            className={({ isActive }) => `

                                flex
                                min-h-[45px]
                                w-full

                                items-center
                                gap-3

                                rounded-xl

                                px-4

                                text-sm
                                font-medium

                                transition-all
                                duration-200

                                ${
                                    isActive

                                        ? `
                                            bg-blue-600
                                            text-white
                                            shadow-sm
                                          `

                                        : `
                                            text-slate-600

                                            hover:bg-slate-100
                                            hover:text-slate-900

                                            dark:text-slate-300
                                            dark:hover:bg-slate-800
                                            dark:hover:text-white
                                          `
                                }

                            `}
                        >

                            <span
                                className="
                                    flex
                                    w-5
                                    shrink-0
                                    justify-center
                                "
                            >
                                {menu.icon}
                            </span>


                            <span className="truncate">
                                {menu.title}
                            </span>

                        </NavLink>

                    ))}

                </nav>


                {/* ================= ACCOUNT ================= */}

                <p
                    className="
                        mb-3
                        mt-9
                        px-3

                        text-[10px]
                        font-semibold
                        uppercase
                        tracking-[0.18em]

                        text-slate-400
                    "
                >
                    Account
                </p>


                <NavLink
                    to="/profile"

                    className={({ isActive }) => `

                        flex
                        min-h-[45px]
                        w-full

                        items-center
                        gap-3

                        rounded-xl

                        px-4

                        text-sm
                        font-medium

                        transition-all

                        ${
                            isActive

                                ? `
                                    bg-blue-600
                                    text-white
                                  `

                                : `
                                    text-slate-600

                                    hover:bg-slate-100
                                    hover:text-slate-900

                                    dark:text-slate-300
                                    dark:hover:bg-slate-800
                                    dark:hover:text-white
                                  `
                        }

                    `}
                >

                    <span
                        className="
                            flex
                            w-5
                            shrink-0
                            justify-center
                        "
                    >
                        <FaUserCircle />
                    </span>

                    Profile

                </NavLink>

            </div>


            {/* ================= LOGOUT ================= */}

            <div
                className="
                    shrink-0

                    border-t
                    border-slate-200

                    p-4

                    dark:border-slate-800
                "
            >

                <button
                    type="button"
                    onClick={handleLogout}

                    className="
                        flex
                        min-h-[45px]
                        w-full

                        items-center
                        gap-3

                        rounded-xl

                        px-4

                        text-sm
                        font-medium

                        text-slate-500

                        transition

                        hover:bg-red-50
                        hover:text-red-600

                        dark:text-slate-400
                        dark:hover:bg-red-950/30
                        dark:hover:text-red-400
                    "
                >

                    <span
                        className="
                            flex
                            w-5
                            shrink-0
                            justify-center
                        "
                    >
                        <FaSignOutAlt />
                    </span>

                    Logout

                </button>

            </div>

        </aside>

    );

}


export default Sidebar;