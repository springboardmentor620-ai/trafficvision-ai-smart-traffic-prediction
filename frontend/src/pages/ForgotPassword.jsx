import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { toast } from "react-toastify";
import "../styles/auth.css";

function ForgotPassword() {

    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const submit = async () => {

        if (!email) {
            toast.error("Please enter your email.");
            return;
        }

        setLoading(true);

        try {

            const response = await api.post(
                "/auth/forgot-password",
                { email }
            );

            toast.success(response.data.message);

            // The backend never reveals whether the email exists, so the
            // success UI is shown the same way regardless.
            setSubmitted(true);

        } catch (error) {

            toast.error(
                error.response?.data?.detail ||
                "Something went wrong. Please try again."
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
                    Forgot Password
                </h1>

                <p className="subtitle">
                    {submitted
                        ? "Check your inbox for the reset link."
                        : "Enter your email and we'll send you a reset link."}
                </p>

                {!submitted && (

                    <>

                        <div className="input-group">

                            <label>Email</label>

                            <input
                                type="email"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") submit();
                                }}
                            />

                        </div>

                        <button
                            className="auth-btn"
                            onClick={submit}
                            disabled={loading}
                        >

                            {loading
                                ? "Sending..."
                                : "Send Reset Link"}

                        </button>

                    </>

                )}

                <div className="auth-link">

                    <Link to="/">
                        Back to Login
                    </Link>

                </div>

            </div>

        </div>

    );

}

export default ForgotPassword;
    