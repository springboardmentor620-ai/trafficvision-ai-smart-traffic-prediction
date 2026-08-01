import Sidebar from "./Sidebar";

function DashboardLayout({

    children

}) {

    return (

        <div className="bg-slate-100 min-h-screen">

            <Sidebar />

            <main

                className="

                    ml-72

                    p-10

                "

            >

                {children}

            </main>

        </div>

    );

}

export default DashboardLayout;