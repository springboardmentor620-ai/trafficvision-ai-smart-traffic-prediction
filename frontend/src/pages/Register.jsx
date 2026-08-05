import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import { toast } from "react-toastify";
import "../styles/auth.css";

function Register() {

    const navigate = useNavigate();

    const [user, setUser] = useState({
        name: "",
        email: "",
        password: ""
    });

    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setUser({
            ...user,
            [e.target.name]: e.target.value
        });
    };

    const register = async () => {

        setLoading(true);

        try {

            await api.post("/auth/register", user);

            toast.success("Registration Successful!");

            navigate("/");

        } catch (error) {

            toast.error(
                error.response?.data?.detail ||
                "Registration Failed"
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
                    Create Account
                </h1>

                <p className="subtitle">
                    Join TrafficVision AI
                </p>

                <div className="input-group">

                    <label>Full Name</label>

                    <input
                        name="name"
                        placeholder="Enter your name"
                        value={user.name}
                        onChange={handleChange}
                    />

                </div>

                <div className="input-group">

                    <label>Email</label>

                    <input
                        type="email"
                        name="email"
                        placeholder="Enter your email"
                        value={user.email}
                        onChange={handleChange}
                    />

                </div>

                <div className="input-group">

                    <label>Password</label>

                    <input
                        type="password"
                        name="password"
                        placeholder="Create password"
                        value={user.password}
                        onChange={handleChange}
                    />

                </div>

                <div className="input-group">

                    <label>Role</label>

                    <input
                        value="Operator"
                        disabled
                        title="New accounts are created as Operator. Admin accounts are provisioned separately."
                    />

                </div>

                <button
                    className="auth-btn"
                    onClick={register}
                    disabled={loading}
                >

                    {loading
                        ? "Creating Account..."
                        : "Register"}

                </button>

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