import AuthBranding from "./AuthBranding";

function AuthLayout({ children }) {
    return (
        <div
            style={{
                minHeight: "100vh",
                width: "100%",
                overflow: "hidden",
                background: "#eef3fb"
            }}
        >

            <div
                style={{
                    minHeight: "100vh",
                    width: "100%",
                    display: "grid",
                    gridTemplateColumns: "44% 56%"
                }}
            >

                {/* ================= LEFT LOGIN ================= */}

                <section
                    style={{
                        minHeight: "100vh",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "70px 8%",
                        background:
                            "linear-gradient(135deg, #eef5ff 0%, #e8f1ff 50%, #f4f8ff 100%)"
                    }}
                >

                    <div
                        style={{
                            width: "100%",
                            maxWidth: "540px"
                        }}
                    >
                        {children}
                    </div>

                </section>


                {/* ================= RIGHT PANEL ================= */}

                <section
                    style={{
                        minHeight: "100vh",
                        width: "100%",
                        background: "#061536",
                        overflow: "hidden"
                    }}
                >

                    <AuthBranding />

                </section>

            </div>

        </div>
    );
}

export default AuthLayout;