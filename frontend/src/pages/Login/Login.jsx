import { useLocation } from "react-router-dom";

import AuthLayout from "../../components/auth/AuthLayout";
import LoginForm from "../../components/auth/LoginForm";


function Login() {

    const location = useLocation();

    const loginType =
        location.state?.loginType;


    const isAdmin =
        loginType === "admin";


    return (

        <AuthLayout>

            <div className="w-full">

                {/* PAGE INTRO */}

                <div className="mb-9">

                    <p
                        className="
                            mb-3
                            text-sm
                            font-semibold
                            tracking-wide
                            text-blue-600
                        "
                    >

                        {isAdmin
                            ? "TrafficVision Administration"
                            : "Traffic Intelligence Platform"
                        }

                    </p>


                    <h1
                        className="
                            text-4xl
                            font-bold
                            leading-[1.1]
                            tracking-tight
                            text-slate-950
                            sm:text-[42px]
                        "
                    >

                        Welcome back

                    </h1>


                    <p
                        className="
                            mt-4
                            max-w-[440px]
                            text-base
                            leading-7
                            text-slate-500
                        "
                    >

                        {isAdmin

                            ? "Sign in with your administrator account to access system management features."

                            : "Sign in to access your traffic dashboard, predictions and route intelligence."

                        }

                    </p>


                    {/* SELECTED ROLE INDICATOR */}

                    {loginType && (

                        <div className="
                            mt-5
                            inline-flex
                            items-center
                            rounded-full
                            border
                            border-blue-100
                            bg-blue-50
                            px-4
                            py-2
                            text-sm
                            font-semibold
                            text-blue-700
                        ">

                            {isAdmin
                                ? "Administrator Login"
                                : "Operator Login"
                            }

                        </div>

                    )}

                </div>


                {/* LOGIN FORM */}

                <div className="w-full">

                    <LoginForm />

                </div>

            </div>

        </AuthLayout>

    );

}


export default Login;