import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import PublicNavbar from "../components/PublicNavbar";
import { login, getCurrentUser } from "../services/auth";
import "../styles/Login.css";

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  function handleChange(e) {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      const data = await login(
        formData.email,
        formData.password
      );

      localStorage.setItem("token", data.access_token);

      const user = await getCurrentUser();

      localStorage.setItem(
        "user",
        JSON.stringify(user)
      );

      if (user.role === "admin") {
        navigate("/admin");
      } else if (user.role === "traffic_operator") {
        navigate("/operator");
      } else if (user.role === "commuter") {
        navigate("/commuter");
      } else {
        alert("Unknown user role.");
      }

    } catch {
      alert("Invalid email or password.");
    }
  }

  return (
    <>
      <PublicNavbar />

      <div className="login-container">
        <div className="login-card">

          <h1>Welcome Back</h1>

          <p>
            Sign in to continue using TrafficVision AI.
          </p>

          <form onSubmit={handleSubmit}>

            <div className="form-group">
              <label>Email Address</label>

              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Password</label>

              <input
                type="password"
                name="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
              />
            </div>

            <button type="submit">
              Login
            </button>

          </form>

          <p className="auth-link">
            Don't have an account?{" "}
            <Link to="/register">
              Create Account
            </Link>
          </p>

        </div>
      </div>
    </>
  );
}

export default Login;