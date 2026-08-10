import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { GoogleLogin } from "@react-oauth/google";
import api from "../services/api";
import "../styles/auth.css";

function Register() {

    const navigate = useNavigate();

    const handleGoogleSignup = async (credentialResponse) => {

        try {

            const response = await api.post(
                "/auth/google",
                {
                    credential: credentialResponse.credential
                }
            );

            localStorage.setItem(
                "access_token",
                response.data.access_token
            );

            localStorage.setItem(
                "role",
                response.data.role
            );

            toast.success("Account created successfully!");

            navigate("/dashboard");

        } catch (error) {

            console.error(error);

            toast.error(
                error.response?.data?.detail ||
                "Google sign-up failed"
            );

        }

    };

    return (

        <div className="auth-container">

            <div className="auth-card">

                <div className="logo">
                    🚦
                </div>

                <h1 className="title">
                    Create Account
                </h1>

                <p className="subtitle">
                    Join TrafficVision AI
                </p>

                <p className="subtitle">
                    Sign up securely using your Google account
                </p>

                <div className="google-login">

                    <GoogleLogin
                        onSuccess={handleGoogleSignup}
                        onError={() => {
                            toast.error("Google sign-up failed");
                        }}
                    />

                </div>

                <div className="auth-link">

                    Already have an account?

                    <br /><br />

                    <Link to="/">
                        Login Here
                    </Link>

                </div>

            </div>

        </div>

    );
}

export default Register;