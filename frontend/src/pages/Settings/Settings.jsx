import { useEffect, useState } from "react";

import {
    FaPalette,
    FaBell,
    FaShieldAlt,
    FaDatabase,
    FaSun,
    FaMoon,
    FaDesktop,
    FaCheck,
    FaChevronRight
} from "react-icons/fa";

import DashboardLayout from "../../components/layout/DashboardLayout";


function Settings() {

    /* =========================================================
       THEME
    ========================================================= */

    const [theme, setTheme] = useState(() => {

        const savedTheme =
            localStorage.getItem("trafficvision-theme");

        return savedTheme || "dark";

    });


    /* =========================================================
       NOTIFICATIONS
    ========================================================= */

    const [notifications, setNotifications] = useState(() => {

        const saved =
            localStorage.getItem(
                "trafficvision-notifications"
            );

        if (!saved) {

            return {
                congestion: true,
                accident: true,
                delay: true,
                emergency: true
            };

        }

        try {

            return JSON.parse(saved);

        } catch {

            return {
                congestion: true,
                accident: true,
                delay: true,
                emergency: true
            };

        }

    });


    /* =========================================================
       APPLY THEME
    ========================================================= */

    function applyTheme(selectedTheme) {

        const root = document.documentElement;


        if (selectedTheme === "light") {

            root.classList.remove("dark");

            root.style.colorScheme = "light";

            return;

        }


        if (selectedTheme === "dark") {

            root.classList.add("dark");

            root.style.colorScheme = "dark";

            return;

        }


        /* SYSTEM THEME */

        const systemPreference =
            window.matchMedia(
                "(prefers-color-scheme: dark)"
            );


        root.classList.toggle(
            "dark",
            systemPreference.matches
        );


        root.style.colorScheme =
            systemPreference.matches
                ? "dark"
                : "light";

    }


    /* =========================================================
       THEME EFFECT
    ========================================================= */

    useEffect(() => {

        localStorage.setItem(
            "trafficvision-theme",
            theme
        );

        applyTheme(theme);

    }, [theme]);


    /* =========================================================
       NOTIFICATION EFFECT
    ========================================================= */

    useEffect(() => {

        localStorage.setItem(
            "trafficvision-notifications",
            JSON.stringify(notifications)
        );

    }, [notifications]);


    /* =========================================================
       TOGGLE NOTIFICATION
    ========================================================= */

    function toggleNotification(key) {

        setNotifications((previous) => ({

            ...previous,

            [key]: !previous[key]

        }));

    }


    return (

        <DashboardLayout>

            <main
                className="
                    min-h-screen
                    w-full

                    px-6
                    py-10

                    sm:px-8
                    sm:py-12

                    lg:px-10
                    lg:py-14
                "
            >

                <div
                    className="
                        mx-auto
                        w-full
                        max-w-6xl
                    "
                >

                    {/* =================================================
                        HEADER
                    ================================================= */}

                    <header className="mb-12">

                        <p
                            className="
                                text-xs
                                font-semibold
                                uppercase
                                tracking-[0.2em]

                                text-blue-500
                            "
                        >
                            Preferences
                        </p>


                        <div
                            className="
                                mt-3

                                flex
                                flex-col
                                gap-4

                                md:flex-row
                                md:items-end
                                md:justify-between
                            "
                        >

                            <div>

                                <h1
                                    className="
                                        text-3xl
                                        font-semibold
                                        tracking-tight

                                        text-slate-900

                                        dark:text-white

                                        sm:text-4xl
                                    "
                                >
                                    Settings
                                </h1>


                                <p
                                    className="
                                        mt-3

                                        max-w-2xl

                                        text-sm
                                        leading-6

                                        text-slate-500

                                        dark:text-slate-400

                                        sm:text-base
                                    "
                                >
                                    Manage your appearance,
                                    notifications and account
                                    preferences.
                                </p>

                            </div>


                            <div
                                className="
                                    flex
                                    items-center
                                    gap-2

                                    text-xs
                                    font-medium

                                    text-emerald-500
                                "
                            >

                                <span
                                    className="
                                        h-2
                                        w-2
                                        rounded-full
                                        bg-emerald-500
                                    "
                                />

                                Settings saved automatically

                            </div>

                        </div>

                    </header>


                    {/* =================================================
                        APPEARANCE
                    ================================================= */}

                    <SettingsCard
                        icon={<FaPalette />}
                        title="Appearance"
                        description="
                            Choose how TrafficVisionAI
                            looks across the application.
                        "
                    >

                        <div
                            className="
                                grid
                                grid-cols-1
                                gap-4

                                md:grid-cols-3
                            "
                        >

                            <ThemeOption
                                icon={<FaSun />}
                                title="Light"
                                description="
                                    Bright interface for daytime use.
                                "
                                active={
                                    theme === "light"
                                }
                                onClick={() =>
                                    setTheme("light")
                                }
                            />


                            <ThemeOption
                                icon={<FaMoon />}
                                title="Dark"
                                description="
                                    Comfortable interface for low-light use.
                                "
                                active={
                                    theme === "dark"
                                }
                                onClick={() =>
                                    setTheme("dark")
                                }
                            />


                            <ThemeOption
                                icon={<FaDesktop />}
                                title="System"
                                description="
                                    Follow your device appearance.
                                "
                                active={
                                    theme === "system"
                                }
                                onClick={() =>
                                    setTheme("system")
                                }
                            />

                        </div>

                    </SettingsCard>


                    {/* =================================================
                        TWO COLUMN SECTION
                    ================================================= */}

                    <div
                        className="
                            grid
                            grid-cols-1
                            gap-8

                            xl:grid-cols-2
                        "
                    >

                        {/* =================================================
                            NOTIFICATIONS
                        ================================================= */}

                        <SettingsCard
                            icon={<FaBell />}
                            title="Notifications"
                            description="
                                Choose which traffic events
                                should notify you.
                            "
                        >

                            <NotificationRow
                                title="Congestion alerts"
                                description="
                                    Heavy or abnormal traffic.
                                "
                                enabled={
                                    notifications.congestion
                                }
                                onClick={() =>
                                    toggleNotification(
                                        "congestion"
                                    )
                                }
                            />


                            <NotificationRow
                                title="Accident notifications"
                                description="
                                    Accident incidents or high risk.
                                "
                                enabled={
                                    notifications.accident
                                }
                                onClick={() =>
                                    toggleNotification(
                                        "accident"
                                    )
                                }
                            />


                            <NotificationRow
                                title="Route delay warnings"
                                description="
                                    Increased expected travel time.
                                "
                                enabled={
                                    notifications.delay
                                }
                                onClick={() =>
                                    toggleNotification(
                                        "delay"
                                    )
                                }
                            />


                            <NotificationRow
                                title="Emergency alerts"
                                description="
                                    Critical traffic conditions.
                                "
                                enabled={
                                    notifications.emergency
                                }
                                onClick={() =>
                                    toggleNotification(
                                        "emergency"
                                    )
                                }
                            />

                        </SettingsCard>


                        {/* =================================================
                            ACCOUNT SECURITY
                        ================================================= */}

                        <SettingsCard
                            icon={<FaShieldAlt />}
                            title="Account & Security"
                            description="
                                Manage the security of your account.
                            "
                        >

                            <ActionRow
                                title="Password"
                                description="
                                    Update your account password.
                                "
                                action="Change password"
                            />


                            <ActionRow
                                title="Active sessions"
                                description="
                                    Review devices signed in to your account.
                                "
                                action="Manage sessions"
                            />

                        </SettingsCard>

                    </div>


                    {/* =================================================
                        DATA & PRIVACY
                    ================================================= */}

                    <div className="mt-8">

                        <SettingsCard
                            icon={<FaDatabase />}
                            title="Data & Privacy"
                            description="
                                Manage your TrafficVisionAI
                                prediction data.
                            "
                        >

                            <div
                                className="
                                    grid
                                    grid-cols-1
                                    gap-4

                                    md:grid-cols-2
                                "
                            >

                                <ActionTile
                                    title="Prediction history"
                                    description="
                                        View your saved traffic predictions.
                                    "
                                    action="View history"
                                />


                                <ActionTile
                                    title="Export your data"
                                    description="
                                        Download your available application data.
                                    "
                                    action="Export data"
                                />

                            </div>

                        </SettingsCard>

                    </div>


                    {/* =================================================
                        FOOTER
                    ================================================= */}

                    <div
                        className="
                            pb-12
                            pt-6

                            text-center

                            text-xs
                            text-slate-400
                        "
                    >
                        TrafficVisionAI
                    </div>

                </div>

            </main>

        </DashboardLayout>

    );

}


/* =============================================================
   SETTINGS CARD
============================================================= */

function SettingsCard({
    icon,
    title,
    description,
    children
}) {

    return (

        <section
            className="
                mb-8

                rounded-2xl

                border
                border-slate-200

                bg-white

                p-7

                shadow-sm

                sm:p-8

                dark:border-slate-800
                dark:bg-slate-900
                dark:shadow-none
            "
        >

            <div
                className="
                    mb-8

                    flex
                    items-start
                    gap-4
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

                        bg-blue-500/10

                        text-blue-500
                    "
                >
                    {icon}
                </div>


                <div>

                    <h2
                        className="
                            text-lg
                            font-semibold

                            text-slate-900

                            dark:text-white
                        "
                    >
                        {title}
                    </h2>


                    <p
                        className="
                            mt-2

                            text-sm
                            leading-6

                            text-slate-500

                            dark:text-slate-400
                        "
                    >
                        {description}
                    </p>

                </div>

            </div>


            {children}

        </section>

    );

}


/* =============================================================
   THEME OPTION
============================================================= */

function ThemeOption({
    icon,
    title,
    description,
    active,
    onClick
}) {

    return (

        <button
            type="button"
            onClick={onClick}

            className={`
                flex
                min-h-[125px]
                w-full

                flex-col

                rounded-xl
                border

                p-5

                text-left

                transition-all
                duration-200

                ${
                    active

                        ? `
                            border-blue-500
                            bg-blue-50

                            dark:bg-blue-500/10
                          `

                        : `
                            border-slate-200
                            bg-white

                            hover:border-blue-300
                            hover:bg-slate-50

                            dark:border-slate-800
                            dark:bg-slate-950
                            dark:hover:border-slate-700
                          `
                }
            `}
        >

            <div
                className="
                    flex
                    items-center
                    justify-between
                "
            >

                <span
                    className={`
                        flex
                        h-10
                        w-10

                        items-center
                        justify-center

                        rounded-lg

                        ${
                            active
                                ? `
                                    bg-blue-600
                                    text-white
                                  `
                                : `
                                    bg-slate-100
                                    text-slate-500

                                    dark:bg-slate-800
                                    dark:text-slate-400
                                  `
                        }
                    `}
                >
                    {icon}
                </span>


                {active && (

                    <span
                        className="
                            flex
                            h-6
                            w-6

                            items-center
                            justify-center

                            rounded-full

                            bg-blue-600

                            text-[10px]
                            text-white
                        "
                    >
                        <FaCheck />
                    </span>

                )}

            </div>


            <div className="mt-auto pt-5">

                <p
                    className="
                        text-sm
                        font-semibold

                        text-slate-900

                        dark:text-white
                    "
                >
                    {title}
                </p>


                <p
                    className="
                        mt-1

                        text-xs
                        leading-5

                        text-slate-500

                        dark:text-slate-400
                    "
                >
                    {description}
                </p>

            </div>

        </button>

    );

}


/* =============================================================
   NOTIFICATION ROW
============================================================= */

function NotificationRow({
    title,
    description,
    enabled,
    onClick
}) {

    return (

        <div
            className="
                flex
                min-h-[86px]

                items-center
                justify-between

                gap-8

                border-b
                border-slate-100

                py-5

                last:border-b-0

                dark:border-slate-800
            "
        >

            <div className="min-w-0">

                <p
                    className="
                        text-sm
                        font-semibold

                        text-slate-800

                        dark:text-slate-200
                    "
                >
                    {title}
                </p>


                <p
                    className="
                        mt-2

                        text-xs
                        leading-5

                        text-slate-500

                        dark:text-slate-400
                    "
                >
                    {description}
                </p>

            </div>


            {/* MODERN TOGGLE */}

            <button
                type="button"
                onClick={onClick}

                aria-pressed={enabled}

                className="
                    relative

                    h-7
                    w-12

                    shrink-0

                    rounded-full

                    outline-none

                    transition-all
                    duration-200

                    focus:ring-2
                    focus:ring-blue-500/30
                "
            >

                <span
                    className={`
                        absolute
                        inset-0

                        rounded-full

                        transition-colors
                        duration-200

                        ${
                            enabled
                                ? "bg-blue-600"
                                : "bg-slate-300 dark:bg-slate-700"
                        }
                    `}
                />


                <span
                    className={`
                        absolute
                        left-0
                        top-1/2

                        h-5
                        w-5

                        -translate-y-1/2

                        rounded-full

                        bg-white

                        shadow-md

                        transition-transform
                        duration-200

                        ${
                            enabled
                                ? "translate-x-6"
                                : "translate-x-1"
                        }
                    `}
                />

            </button>

        </div>

    );

}


/* =============================================================
   ACTION ROW
============================================================= */

function ActionRow({
    title,
    description,
    action
}) {

    return (

        <div
            className="
                flex
                min-h-[100px]

                items-center
                justify-between

                gap-6

                border-b
                border-slate-100

                py-5

                last:border-b-0

                dark:border-slate-800
            "
        >

            <div>

                <p
                    className="
                        text-sm
                        font-semibold

                        text-slate-800

                        dark:text-slate-200
                    "
                >
                    {title}
                </p>


                <p
                    className="
                        mt-2

                        text-xs
                        leading-5

                        text-slate-500

                        dark:text-slate-400
                    "
                >
                    {description}
                </p>

            </div>


            <button
                type="button"

                className="
                    inline-flex
                    shrink-0

                    items-center
                    gap-2

                    rounded-lg

                    border
                    border-slate-200

                    px-4
                    py-2.5

                    text-xs
                    font-medium

                    text-slate-600

                    transition

                    hover:border-blue-500
                    hover:text-blue-500

                    dark:border-slate-700
                    dark:text-slate-300

                    dark:hover:border-blue-500
                    dark:hover:text-blue-400
                "
            >

                {action}

                <FaChevronRight
                    className="text-[9px]"
                />

            </button>

        </div>

    );

}


/* =============================================================
   ACTION TILE
============================================================= */

function ActionTile({
    title,
    description,
    action
}) {

    return (

        <div
            className="
                flex
                min-h-[130px]

                flex-col
                justify-between

                rounded-xl

                border
                border-slate-200

                bg-slate-50

                p-5

                dark:border-slate-800
                dark:bg-slate-950
            "
        >

            <div>

                <p
                    className="
                        text-sm
                        font-semibold

                        text-slate-900

                        dark:text-white
                    "
                >
                    {title}
                </p>


                <p
                    className="
                        mt-2

                        text-xs
                        leading-5

                        text-slate-500

                        dark:text-slate-400
                    "
                >
                    {description}
                </p>

            </div>


            <button
                type="button"

                className="
                    mt-5

                    flex
                    w-fit

                    items-center
                    gap-2

                    text-xs
                    font-medium

                    text-blue-600

                    hover:text-blue-700

                    dark:text-blue-400
                    dark:hover:text-blue-300
                "
            >

                {action}

                <FaChevronRight
                    className="text-[9px]"
                />

            </button>

        </div>

    );

}


export default Settings;