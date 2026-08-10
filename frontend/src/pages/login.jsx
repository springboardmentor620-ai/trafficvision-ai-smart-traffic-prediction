import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import { toast } from "react-toastify";
import "../styles/auth.css";

function Login() {

    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const login = async () => {

        setLoading(true);

        try {

            const formData = new URLSearchParams({
                username: email,
                password: password
            });

            const response = await api.post(
                "/auth/login",
                formData.toString(),
                {
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded"
                    }
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

            toast.success("Welcome back!");

            navigate("/dashboard");

        } catch (error) {

            toast.error(
                error.response?.data?.detail ||
                "Invalid email or password"
            );

        } finally {

            setLoading(false);

        }

    };

    return (

        <div className="auth-container">

            <div className="auth-card">

                <div className="logo">
                    🚦
                </div>

                <h1 className="title">
                    TrafficVision AI
                </h1>

                <p className="subtitle">
                    Smart Traffic Prediction System
                </p>

                <div className="input-group">

                    <label>Email</label>

                    <input
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") login();
                        }}
                    />

                </div>

                <div className="input-group">

                    <label>Password</label>

                    <input
                        type="password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") login();
                        }}
                    />

                </div>

                <div className="auth-link">

                    <Link to="/forgot-password">
                        Forgot Password?
                    </Link>

                </div>

                <button
                    className="auth-btn"
                    onClick={login}
                    disabled={loading}
                >

                    {loading
                        ? "Logging in..."
                        : "Login"}

                </button>

                <div className="auth-link">

                    Don't have an account?

                    <br /><br />

                    <Link to="/register">
                        Create Account
                    </Link>

                </div>

            </div>

        </div>

    );

}

export default Login;