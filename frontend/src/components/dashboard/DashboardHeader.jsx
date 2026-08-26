import {
    FaShieldAlt
} from "react-icons/fa";


function DashboardHeader({ isAdmin = false }) {

    return (

        <header
            className="
                flex

                flex-col
                gap-5

                sm:flex-row
                sm:items-end
                sm:justify-between
            "
        >

            <div>

                <p
                    className="
                        text-xs
                        font-semibold
                        uppercase
                        tracking-[0.16em]

                        text-blue-600

                        dark:text-blue-400
                    "
                >
                    {isAdmin
                        ? "Administrator Workspace"
                        : "Traffic Intelligence"
                    }
                </p>


                <h1
                    className="
                        mt-1

                        text-3xl
                        font-bold
                        tracking-tight

                        text-slate-900

                        dark:text-white
                    "
                >
                    {isAdmin
                        ? "Admin Dashboard"
                        : "Dashboard"
                    }
                </h1>


                <p
                    className="
                        mt-1.5

                        text-sm

                        text-slate-500

                        dark:text-slate-400
                    "
                >
                    {isAdmin
                        ? "Monitor traffic operations and manage the platform."
                        : "Traffic intelligence overview"
                    }
                </p>

            </div>


            <div
                className="
                    inline-flex
                    w-fit

                    items-center
                    gap-2

                    rounded-full

                    border
                    border-slate-200

                    bg-white

                    px-3
                    py-1.5

                    text-xs
                    font-medium

                    text-slate-600

                    shadow-sm

                    dark:border-slate-800
                    dark:bg-slate-900
                    dark:text-slate-300
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

                System Online


                {isAdmin && (

                    <>

                        <span
                            className="
                                mx-1

                                h-3
                                w-px

                                bg-slate-200

                                dark:bg-slate-700
                            "
                        />


                        <FaShieldAlt
                            className="
                                text-blue-500
                            "
                        />


                        Admin

                    </>

                )}

            </div>

        </header>

    );

}


export default DashboardHeader;