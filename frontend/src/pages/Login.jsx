import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/login.css";

function Login() {

  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {

    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });

  };

  const handleSubmit = async (e) => {

    e.preventDefault();

    setLoading(true);

    try {

      const response = await axios.post(
        "http://127.0.0.1:8000/api/auth/login",
        formData
      );

      if (response.data.success) {

        localStorage.setItem("token", response.data.access_token);
        localStorage.setItem("role", response.data.role);
        localStorage.setItem("name", response.data.name);
        localStorage.setItem("email", response.data.email);

        alert("Login Successful!");

        if (response.data.role === "admin") {

          navigate("/admin");

        } else {

          navigate("/user-dashboard");

        }

      }

    } catch (error) {

      console.log(error);

      alert(
        error.response?.data?.message ||
        "Invalid Email or Password"
      );

    }

    setLoading(false);

  };

  return (

    <div className="login-page">

      <div className="login-container">

        <div className="login-left">

          <h1>TrafficVision AI</h1>

          <p>
            Smart Traffic Prediction & Congestion Management System
          </p>

          <ul>

            <li>✔ AI-based Traffic Prediction</li>

            <li>✔ Real-Time Monitoring</li>

            <li>✔ Smart Dashboard</li>

            <li>✔ Secure Authentication</li>

          </ul>

        </div>

        <div className="login-right">

          <h2>Login</h2>

          <form onSubmit={handleSubmit}>

            <label>Email</label>

            <input
              type="email"
              name="email"
              placeholder="Enter Email"
              value={formData.email}
              onChange={handleChange}
              required
            />

            <label>Password</label>

            <input
              type="password"
              name="password"
              placeholder="Enter Password"
              value={formData.password}
              onChange={handleChange}
              required
            />

            <button
              type="submit"
              disabled={loading}
            >
              {loading ? "Logging In..." : "Login"}
            </button>

          </form>

          <p>

            Don't have an account?

            <Link to="/register">
              Register
            </Link>

          </p>

        </div>

      </div>

    </div>

  );

}

export default Login;