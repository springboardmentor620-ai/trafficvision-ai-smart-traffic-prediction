import { Link, NavLink } from "react-router-dom";
import { FaTrafficLight } from "react-icons/fa";
import Button from "../ui/Button";

function Navbar() {

    const navItem = ({ isActive }) =>

        `

        transition-all

        duration-300

        font-medium

        ${isActive

            ? "text-blue-600"

            : "text-slate-700 hover:text-blue-600"

        }

    `;

    return (

        <header

            className="

            sticky

            top-0

            z-50

            backdrop-blur-xl

            bg-white/80

            border-b

            border-gray-200

        "

        >

            <div

                className="

                max-w-7xl

                mx-auto

                h-20

                flex

                items-center

                justify-between

                px-8

            "

            >

                <Link

                    to="/"

                    className="flex items-center gap-3"

                >

                    <div

                        className="

                        w-12

                        h-12

                        rounded-xl

                        bg-blue-600

                        text-white

                        flex

                        items-center

                        justify-center

                    "

                    >

                        <FaTrafficLight size={24} />

                    </div>

                    <div>

                        <h1 className="text-2xl font-bold">

                            TrafficVision

                        </h1>

                        <p className="text-sm text-gray-500">

                            AI Platform

                        </p>

                    </div>

                </Link>

                <nav className="hidden md:flex gap-10">

                    <NavLink

                        to="/"

                        className={navItem}

                    >

                        Home

                    </NavLink>

                    <NavLink

                        to="/dashboard"

                        className={navItem}

                    >

                        Dashboard

                    </NavLink>

                    <NavLink

                        to="/prediction"

                        className={navItem}

                    >

                        Prediction

                    </NavLink>

                    <NavLink

                        to="/reports"

                        className={navItem}

                    >

                        Reports

                    </NavLink>

                    <NavLink

                        to="/contact"

                        className={navItem}

                    >

                        Contact

                    </NavLink>

                </nav>

                <div className="flex gap-3">

                    <Button variant="secondary">

                        Login

                    </Button>

                    <Button>

                        Get Started

                    </Button>

                </div>

            </div>

        </header>

    );

}

export default Navbar;