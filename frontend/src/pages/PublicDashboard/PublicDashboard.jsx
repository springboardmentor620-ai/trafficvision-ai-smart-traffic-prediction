import { Link } from "react-router-dom";

import {
    FaTrafficLight,
    FaUsers,
    FaShieldAlt,
    FaChartLine,
    FaExclamationTriangle,
    FaCar,
    FaRoute,
    FaClipboardList,
    FaMapMarkedAlt,
    FaBrain,
    FaArrowRight,
    FaUser
} from "react-icons/fa";

import cityTraffic from "../../assets/city-traffic.png";
import trafficMap from "../../assets/traffic-map.png";


function PublicDashboard() {
    return (
        <div className="min-h-screen bg-[#020817] text-white">

            {/* =====================================================
                NAVBAR
            ===================================================== */}

            <header className="relative z-50 h-[82px] border-b border-white/10 bg-[#020817]">

                <div className="mx-auto flex h-full max-w-[1500px] items-center justify-between px-8">

                    {/* LOGO */}

                    <Link
                        to="/"
                        className="flex items-center gap-3"
                    >

                        <div
                            className="
                                flex
                                h-11
                                w-11
                                items-center
                                justify-center
                                rounded-xl
                                bg-blue-600
                                text-white
                                shadow-lg
                                shadow-blue-600/30
                            "
                        >
                            <FaTrafficLight size={23} />
                        </div>

                        <div>

                            <h1 className="text-[21px] font-bold leading-none">
                                TrafficVision
                            </h1>

                            <p className="mt-1 text-xs text-slate-400">
                                AI Traffic Management
                            </p>

                        </div>

                    </Link>


                    {/* NAVIGATION */}

                    <nav className="hidden items-center gap-11 md:flex">

                        <a
                            href="#overview"
                            className="
                                border-b-2
                                border-blue-500
                                pb-2
                                text-sm
                                font-medium
                                text-blue-400
                            "
                        >
                            Overview
                        </a>

                        <a
                            href="#features"
                            className="
                                text-sm
                                font-medium
                                text-slate-100
                                transition
                                hover:text-blue-400
                            "
                        >
                            Features
                        </a>

                        <a
                            href="#how-it-works"
                            className="
                                text-sm
                                font-medium
                                text-slate-100
                                transition
                                hover:text-blue-400
                            "
                        >
                            How it works
                        </a>

                        <a
                            href="#about"
                            className="
                                text-sm
                                font-medium
                                text-slate-100
                                transition
                                hover:text-blue-400
                            "
                        >
                            About
                        </a>

                        <a
                            href="#contact"
                            className="
                                text-sm
                                font-medium
                                text-slate-100
                                transition
                                hover:text-blue-400
                            "
                        >
                            Contact
                        </a>

                    </nav>


                    {/* SIGN IN */}

                    <Link
                        to="/login"
                        className="
                            flex
                            items-center
                            gap-2
                            rounded-xl
                            border
                            border-blue-500/70
                            px-5
                            py-2.5
                            text-sm
                            font-semibold
                            text-white
                            transition
                            hover:bg-blue-500/10
                        "
                    >

                        <FaUser className="text-blue-400" />

                        Sign in

                    </Link>

                </div>

            </header>


            {/* =====================================================
                HERO SECTION
            ===================================================== */}

            <section
                id="overview"
                className="
                    relative
                    h-[590px]
                    overflow-hidden
                    border-b
                    border-white/10
                    bg-[#020817]
                "
            >

                {/* LEFT CITY IMAGE */}

                <div
                    className="
                        absolute
                        inset-y-0
                        left-0
                        w-[38%]
                        bg-cover
                        bg-center
                        bg-no-repeat
                    "
                    style={{
                        backgroundImage: `url(${cityTraffic})`
                    }}
                />


                {/* LEFT IMAGE GRADIENT */}

                <div
                    className="
                        pointer-events-none
                        absolute
                        inset-y-0
                        left-0
                        w-[50%]
                        bg-gradient-to-r
                        from-transparent
                        via-[#020817]/40
                        to-[#020817]
                    "
                />


                {/* RIGHT MAP IMAGE */}

                <div
                    className="
                        absolute
                        inset-y-0
                        right-0
                        w-[38%]
                        bg-cover
                        bg-center
                        bg-no-repeat
                    "
                    style={{
                        backgroundImage: `url(${trafficMap})`
                    }}
                />


                {/* RIGHT IMAGE GRADIENT */}

                <div
                    className="
                        pointer-events-none
                        absolute
                        inset-y-0
                        right-0
                        w-[50%]
                        bg-gradient-to-l
                        from-transparent
                        via-[#020817]/40
                        to-[#020817]
                    "
                />


                {/* SOFT CENTER BLEND */}

                <div
                    className="
                        pointer-events-none
                        absolute
                        inset-0
                        bg-gradient-to-r
                        from-[#020817]/10
                        via-[#020817]/75
                        to-[#020817]/10
                    "
                />


                {/* =================================================
                    HERO CONTENT
                ================================================= */}

                <div
                    className="
                        absolute
                        left-1/2
                        top-0
                        z-10
                        flex
                        h-full
                        w-full
                        max-w-[1200px]
                        -translate-x-1/2
                        flex-col
                        items-center
                        px-6
                        pt-[27px]
                    "
                >

                    {/* BADGE */}

                    <div
                        className="
                            inline-flex
                            items-center
                            gap-3
                            rounded-full
                            border
                            border-blue-400/20
                            bg-[#0b1b36]/90
                            px-5
                            py-2
                            text-sm
                            font-semibold
                            text-white
                            shadow-lg
                        "
                    >

                        <span
                            className="
                                h-3
                                w-3
                                rounded-full
                                bg-cyan-400
                                shadow-[0_0_12px_rgba(34,211,238,0.9)]
                            "
                        />

                        Intelligent Traffic Management

                    </div>


                    {/* MAIN HEADING */}

                    <h2
                        className="
                            mt-5
                            text-center
                            text-[52px]
                            font-extrabold
                            leading-[1.02]
                            tracking-tight
                            text-white
                        "
                    >

                        Smarter Roads.

                        <br />

                        <span className="text-blue-500">
                            Safer Journeys.
                        </span>

                    </h2>


                    {/* DESCRIPTION */}

                    <p
                        className="
                            mt-4
                            max-w-[690px]
                            text-center
                            text-[15px]
                            leading-6
                            text-slate-300
                        "
                    >

                        TrafficVision AI combines real-time traffic
                        monitoring, machine learning predictions, route
                        analysis and intelligent alerts to power better
                        traffic management decisions.

                    </p>


                    {/* =================================================
                        LOGIN OPTIONS
                    ================================================= */}

                    <div
                        className="
                            mt-6
                            flex
                            w-full
                            items-center
                            justify-center
                            gap-5
                        "
                    >

                        {/* OPERATOR */}

                        <LoginCard
                            type="operator"
                            icon={<FaUsers />}
                            title="Login as Operator"
                            description="Monitor traffic, predictions, maps and alerts in real-time."
                        />


                        {/* OR */}

                        <div
                            className="
                                z-20
                                flex
                                h-[58px]
                                w-[58px]
                                shrink-0
                                items-center
                                justify-center
                                rounded-full
                                border
                                border-white/15
                                bg-[#07152c]
                                text-sm
                                font-semibold
                                text-white
                                shadow-[0_8px_25px_rgba(0,0,0,0.45)]
                            "
                        >
                            OR
                        </div>


                        {/* ADMIN */}

                        <LoginCard
                            type="admin"
                            icon={<FaShieldAlt />}
                            title="Login as Admin"
                            description="Manage users, system controls and platform activity."
                        />

                    </div>


                    {/* =================================================
                        STATISTICS
                    ================================================= */}

                    <div
                        className="
                            absolute
                            bottom-3
                            left-1/2
                            flex
                            w-[1160px]
                            max-w-[calc(100%-40px)]
                            -translate-x-1/2
                            gap-3
                        "
                    >

                        <Stat
                            icon={<FaChartLine />}
                            value="256+"
                            label="Traffic Points"
                            sub="Monitored in real-time"
                            iconClass="bg-emerald-500/15 text-emerald-400"
                        />

                        <Stat
                            icon={<FaExclamationTriangle />}
                            value="18"
                            label="Active Alerts"
                            sub="Across all regions"
                            iconClass="bg-amber-500/15 text-amber-400"
                        />

                        <Stat
                            icon={<FaCar />}
                            value="72%"
                            label="Avg Traffic Flow"
                            sub="Current city average"
                            iconClass="bg-blue-500/15 text-blue-400"
                        />

                        <Stat
                            icon={<FaRoute />}
                            value="124"
                            label="Routes Analyzed"
                            sub="Today"
                            iconClass="bg-purple-500/15 text-purple-400"
                        />

                        <Stat
                            icon={<FaChartLine />}
                            value="98.6%"
                            label="System Uptime"
                            sub="Operational"
                            iconClass="bg-cyan-500/15 text-cyan-400"
                        />

                    </div>

                </div>

            </section>


            {/* =====================================================
                FEATURES
            ===================================================== */}

            <section
                id="features"
                className="
                    border-b
                    border-white/10
                    bg-[#020817]
                "
            >

                <div
                    className="
                        mx-auto
                        max-w-[1400px]
                        px-8
                        py-8
                    "
                >

                    <div className="text-center">

                        <p
                            className="
                                text-sm
                                font-bold
                                uppercase
                                tracking-[0.18em]
                                text-blue-400
                            "
                        >
                            Platform Capabilities
                        </p>

                        <h2
                            className="
                                mt-2
                                text-[28px]
                                font-bold
                                tracking-tight
                            "
                        >
                            Everything in one intelligent platform
                        </h2>

                        <p
                            className="
                                mt-1
                                text-sm
                                text-slate-400
                            "
                        >
                            Powerful features to help you manage and
                            analyze traffic effectively.
                        </p>

                    </div>


                    {/* FEATURE GRID */}

                    <div
                        className="
                            mt-5
                            grid
                            grid-cols-2
                            gap-3
                            md:grid-cols-3
                            lg:grid-cols-6
                        "
                    >

                        <Feature
                            icon={<FaMapMarkedAlt />}
                            title="Traffic Monitoring"
                            text="Real-time traffic monitoring across multiple locations."
                            color="green"
                        />

                        <Feature
                            icon={<FaBrain />}
                            title="AI Prediction"
                            text="Machine learning based traffic flow predictions."
                            color="blue"
                        />

                        <Feature
                            icon={<FaExclamationTriangle />}
                            title="Traffic Alerts"
                            text="Instant alerts for incidents and congestion."
                            color="orange"
                        />

                        <Feature
                            icon={<FaChartLine />}
                            title="Analytics"
                            text="Deep insights through advanced analytics."
                            color="purple"
                        />

                        <Feature
                            icon={<FaRoute />}
                            title="Route Intelligence"
                            text="Smart route suggestions and optimization."
                            color="cyan"
                        />

                        <Feature
                            icon={<FaClipboardList />}
                            title="Reports"
                            text="Generate detailed reports and export insights."
                            color="blue"
                        />

                    </div>

                </div>

            </section>


            {/* =====================================================
                HOW IT WORKS
            ===================================================== */}

            <section
                id="how-it-works"
                className="
                    border-b
                    border-white/10
                    bg-[#020817]
                "
            >

                <div
                    className="
                        mx-auto
                        max-w-[1200px]
                        px-8
                        py-12
                    "
                >

                    <div className="text-center">

                        <p
                            className="
                                text-sm
                                font-bold
                                uppercase
                                tracking-[0.18em]
                                text-blue-400
                            "
                        >
                            Simple Workflow
                        </p>

                        <h2
                            className="
                                mt-2
                                text-3xl
                                font-bold
                            "
                        >
                            From traffic data to intelligent decisions
                        </h2>

                    </div>


                    <div
                        className="
                            mt-6
                            grid
                            grid-cols-1
                            gap-4
                            md:grid-cols-3
                        "
                    >

                        <Step
                            number="01"
                            title="Access"
                            text="Choose your role and securely sign in."
                        />

                        <Step
                            number="02"
                            title="Analyse"
                            text="Use maps, predictions, analytics and alerts."
                        />

                        <Step
                            number="03"
                            title="Act"
                            text="Use intelligent insights to support traffic decisions."
                        />

                    </div>

                </div>

            </section>


            {/* =====================================================
                FOOTER
            ===================================================== */}

            <footer
                id="contact"
                className="
                    border-t
                    border-white/10
                    px-8
                    py-5
                "
            >

                <div
                    className="
                        mx-auto
                        flex
                        max-w-[1400px]
                        items-center
                        justify-between
                        text-sm
                        text-slate-500
                    "
                >

                    <span>
                        © 2026 TrafficVision AI
                    </span>

                    <span>
                        Smart Traffic Management Platform
                    </span>

                </div>

            </footer>

        </div>
    );
}


/* =============================================================
   LOGIN CARD
============================================================= */

function LoginCard({
    type,
    icon,
    title,
    description
}) {

    const isAdmin = type === "admin";

    return (

        <Link
            to="/login"
            state={{
                loginType: type
            }}
            className={`
                group
                relative
                h-[222px]
                w-[308px]
                shrink-0
                rounded-2xl
                border
                p-5
                transition-all
                duration-300

                ${
                    isAdmin
                        ? `
                            border-purple-500/50
                            bg-gradient-to-br
                            from-purple-600/30
                            via-purple-900/35
                            to-purple-950/50
                            hover:border-purple-400
                        `
                        : `
                            border-blue-400/70
                            bg-gradient-to-br
                            from-blue-600
                            via-blue-700
                            to-blue-900
                            shadow-[0_15px_40px_rgba(37,99,235,0.22)]
                            hover:border-blue-300
                        `
                }
            `}
        >

            {/* ICON + ARROW */}

            <div
                className="
                    flex
                    items-start
                    justify-between
                "
            >

                <div
                    className={`
                        flex
                        h-12
                        w-12
                        items-center
                        justify-center
                        rounded-full
                        text-xl

                        ${
                            isAdmin
                                ? "bg-purple-500/20 text-purple-200"
                                : "bg-blue-400/30 text-white"
                        }
                    `}
                >
                    {icon}
                </div>


                <FaArrowRight
                    className="
                        mt-1
                        text-xl
                        text-white
                        transition-transform
                        duration-300
                        group-hover:translate-x-1
                    "
                />

            </div>


            {/* TITLE */}

            <h3
                className="
                    mt-4
                    text-[19px]
                    font-bold
                    text-white
                "
            >
                {title}
            </h3>


            {/* DESCRIPTION */}

            <p
                className="
                    mt-1
                    max-w-[270px]
                    text-[14px]
                    leading-5
                    text-slate-200
                "
            >
                {description}
            </p>


            {/* LOGIN BUTTON */}

            <div
                className="
                    absolute
                    bottom-4
                    left-4
                    right-4
                    flex
                    h-[43px]
                    items-center
                    justify-center
                    gap-3
                    rounded-xl
                    bg-white
                    text-sm
                    font-bold
                    text-blue-700
                "
            >

                Login Now

                <FaArrowRight className="text-xs" />

            </div>

        </Link>

    );
}


/* =============================================================
   STAT CARD
============================================================= */

function Stat({
    icon,
    value,
    label,
    sub,
    iconClass
}) {

    return (

        <div
            className="
                h-[88px]
                flex-1
                rounded-2xl
                border
                border-white/10
                bg-[#0a1428]/95
                px-4
                py-3
                shadow-lg
            "
        >

            <div
                className="
                    flex
                    items-center
                    gap-3
                "
            >

                <div
                    className={`
                        flex
                        h-11
                        w-11
                        shrink-0
                        items-center
                        justify-center
                        rounded-full
                        text-lg
                        ${iconClass}
                    `}
                >
                    {icon}
                </div>


                <div>

                    <p
                        className="
                            text-[23px]
                            font-bold
                            leading-none
                        "
                    >
                        {value}
                    </p>

                    <p
                        className="
                            mt-1
                            text-xs
                            font-semibold
                        "
                    >
                        {label}
                    </p>

                    <p
                        className="
                            mt-0.5
                            text-[10px]
                            text-slate-400
                        "
                    >
                        {sub}
                    </p>

                </div>

            </div>

        </div>

    );
}


/* =============================================================
   FEATURE CARD
============================================================= */

function Feature({
    icon,
    title,
    text,
    color
}) {

    const styles = {
        green: "bg-emerald-500/15 text-emerald-400",
        blue: "bg-blue-500/15 text-blue-400",
        orange: "bg-amber-500/15 text-amber-400",
        purple: "bg-purple-500/15 text-purple-400",
        cyan: "bg-cyan-500/15 text-cyan-400"
    };

    return (

        <div
            className="
                min-h-[140px]
                rounded-2xl
                border
                border-white/10
                bg-[#0a1428]
                px-4
                py-4
                text-center
                transition
                duration-300
                hover:-translate-y-1
                hover:border-blue-500/30
            "
        >

            <div
                className={`
                    mx-auto
                    flex
                    h-11
                    w-11
                    items-center
                    justify-center
                    rounded-full
                    text-lg
                    ${styles[color]}
                `}
            >
                {icon}
            </div>


            <h3
                className="
                    mt-3
                    text-sm
                    font-bold
                "
            >
                {title}
            </h3>


            <p
                className="
                    mx-auto
                    mt-1.5
                    max-w-[180px]
                    text-xs
                    leading-5
                    text-slate-400
                "
            >
                {text}
            </p>

        </div>

    );
}


/* =============================================================
   WORKFLOW STEP
============================================================= */

function Step({
    number,
    title,
    text
}) {

    return (

        <div
            className="
                rounded-2xl
                border
                border-white/10
                bg-[#0a1428]
                p-5
                text-center
            "
        >

            <span
                className="
                    text-sm
                    font-bold
                    text-blue-400
                "
            >
                {number}
            </span>


            <h3
                className="
                    mt-2
                    text-xl
                    font-bold
                "
            >
                {title}
            </h3>


            <p
                className="
                    mt-1
                    text-sm
                    leading-6
                    text-slate-400
                "
            >
                {text}
            </p>

        </div>

    );
}


export default PublicDashboard;