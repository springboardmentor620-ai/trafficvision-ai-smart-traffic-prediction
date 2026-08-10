import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import api from "../services/api";
import { toast } from "react-toastify";
import "../styles/auth.css";

function ResetPassword() {

    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token");

    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const submit = async () => {

        if (!token) {
            toast.error("This reset link is missing its token. Please request a new one.");
            return;
        }

        if (!newPassword || !confirmPassword) {
            toast.error("Please fill in both password fields.");
            return;
        }

        if (newPassword !== confirmPassword) {
            toast.error("Passwords do not match.");
            return;
        }

        setLoading(true);

        try {

            const response = await api.post(
                "/auth/reset-password",
                {
                    token,
                    new_password: newPassword
                }
            );

            toast.success(response.data.message);

            navigate("/");

        } catch (error) {

            toast.error(
                error.response?.data?.detail ||
                "Invalid or expired reset link."
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
                    Reset Password
                </h1>

                <p className="subtitle">
                    Choose a new password for your account.
                </p>

                {!token && (
                    <p style={{ color: "#dc2626", fontSize: "14px", textAlign: "center" }}>
                        This reset link is missing its token. Please request a new one from
                        the Forgot Password page.
                    </p>
                )}

                <div className="input-group">

                    <label>New Password</label>

                    <input
                        type="password"
                        placeholder="Enter new password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") submit();
                        }}
                    />

                </div>

                <div className="input-group">

                    <label>Confirm Password</label>

                    <input
                        type="password"
                        placeholder="Confirm new password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
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
                        ? "Resetting..."
                        : "Reset Password"}

                </button>

                <div className="auth-link">

                    <Link to="/">
                        Back to Login
                    </Link>

                </div>

            </div>

        </div>

    );

}

export default ResetPassword;
