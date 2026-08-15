import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { GoogleLogin } from "@react-oauth/google";
import api from "../services/api";
import "../styles/auth.css";

function Register() {

    const navigate = useNavigate();

    // -------------------------------------------------------------
    // NORMAL SIGNUP (name + email + password)
    //
    // This is the missing piece: the backend already exposes
    // POST /auth/register (see UserCreate schema / routes/auth.py),
    // but this page previously had no form for it at all - it only
    // rendered the Google button. That's why normal signup looked
    // "broken": the endpoint existed but nothing on the frontend
    // ever called it.
    // -------------------------------------------------------------

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const register = async () => {

        if (!name.trim() || !email.trim() || !password) {
            toast.error("Please fill in your name, email and password.");
            return;
        }

        if (password !== confirmPassword) {
            toast.error("Passwords do not match.");
            return;
        }

        setLoading(true);

        try {

            // Role is never sent from the client - the backend
            // always assigns "operator" for public registration
            // regardless of what (if anything) is sent here.
            await api.post("/auth/register", {
                name: name.trim(),
                email: email.trim(),
                password
            });

            toast.success("Account created! Logging you in...");

            // Immediately log the new user in so signup -> dashboard
            // feels like one step, using the existing /auth/login
            // endpoint (no backend changes needed for this).
            const formData = new URLSearchParams({
                username: email.trim(),
                password: password
            });

            const loginResponse = await api.post(
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
                loginResponse.data.access_token
            );

            localStorage.setItem(
                "role",
                loginResponse.data.role
            );

            navigate("/dashboard");

        } catch (error) {

            console.error(error);

            toast.error(
                error.response?.data?.detail ||
                "Failed to create account."
            );

        } finally {
            setLoading(false);
        }
    };

    // -------------------------------------------------------------
    // GOOGLE SIGNUP
    // -------------------------------------------------------------

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

                {/* Name */}
                <div className="input-group">

                    <label>Name</label>

                    <input
                        type="text"
                        placeholder="Enter your full name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />

                </div>

                {/* Email */}
                <div className="input-group">

                    <label>Email</label>

                    <input
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />

                </div>

                {/* Password */}
                <div className="input-group">

                    <label>Password</label>

                    <input
                        type="password"
                        placeholder="Create a password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />

                </div>

                {/* Confirm Password */}
                <div className="input-group">

                    <label>Confirm Password</label>

                    <input
                        type="password"
                        placeholder="Re-enter your password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") register();
                        }}
                    />

                </div>

                {/* Normal Signup */}
                <button
                    className="auth-btn"
                    onClick={register}
                    disabled={loading}
                >
                    {loading
                        ? "Creating account..."
                        : "Create Account"}
                </button>

                {/* Divider */}
                <div className="google-divider">
                    <span>OR</span>
                </div>

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