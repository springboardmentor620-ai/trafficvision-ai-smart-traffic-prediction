import AuthBranding from "./AuthBranding";

function AuthLayout({

    children

}) {

    return (

        <div
            className="
                min-h-screen
                grid
                lg:grid-cols-2
                bg-slate-100
            "
        >

            <AuthBranding />

            <div
                className="
                    flex
                    justify-center
                    items-center
                    p-8
                "
            >

                <div
                    className="
                        w-full
                        max-w-md
                        bg-white
                        rounded-3xl
                        shadow-xl
                        p-10
                    "
                >

                    {children}

                </div>

            </div>

        </div>

    );

}

export default AuthLayout;