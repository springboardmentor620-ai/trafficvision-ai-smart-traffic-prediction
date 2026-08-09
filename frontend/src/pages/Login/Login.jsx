import AuthLayout from "../../components/auth/AuthLayout";
import LoginForm from "../../components/auth/LoginForm";

function Login() {
    return (
        <AuthLayout>

            <div className="w-full">

                {/* ================= PAGE INTRO ================= */}

                <div className="mb-9">

                    <p
                        className="
                            text-sm
                            font-semibold
                            text-blue-600
                            mb-3
                            tracking-wide
                        "
                    >
                        Traffic Intelligence Platform
                    </p>

                    <h1
                        className="
                            text-4xl
                            sm:text-[42px]
                            font-bold
                            text-slate-950
                            leading-[1.1]
                            tracking-tight
                        "
                    >
                        Welcome back
                    </h1>

                    <p
                        className="
                            mt-4
                            text-base
                            text-slate-500
                            leading-7
                            max-w-[440px]
                        "
                    >
                        Sign in to access your traffic dashboard,
                        predictions and route intelligence.
                    </p>

                </div>


                {/* ================= LOGIN FORM ================= */}

                <div className="w-full">

                    <LoginForm />

                </div>

            </div>

        </AuthLayout>
    );
}

export default Login;