import Sidebar from "./Sidebar";

function DashboardLayout({ children }) {

    return (

        <div
            className="
                min-h-screen
                w-full

                bg-slate-100

                dark:bg-[#07152f]

                lg:grid
                lg:grid-cols-[256px_minmax(0,1fr)]
            "
        >

            {/* SIDEBAR */}

            <Sidebar />


            {/* MAIN CONTENT */}

            <main
                className="
                    min-w-0
                    w-full
                    min-h-screen
                "
            >

                <div
                    className="
                        w-full
                        min-w-0

                        px-5
                        py-6

                        sm:px-7
                        sm:py-7

                        xl:px-9
                        xl:py-8
                    "
                >

                    {children}

                </div>

            </main>

        </div>

    );

}

export default DashboardLayout;