import AuthLayout from "../../components/auth/AuthLayout";
import LoginForm from "../../components/auth/LoginForm";

function Login() {

    return (

        <AuthLayout>

            <div className="mb-10">

                <h1
                    className="
                        text-4xl
                        font-bold
                    "
                >

                    Welcome Back

                </h1>

                <p
                    className="
                        text-slate-500
                        mt-3
                    "
                >

                    Login to continue using
                    TrafficVision AI

                </p>

            </div>

            <LoginForm />

        </AuthLayout>

    );

}

export default Login;