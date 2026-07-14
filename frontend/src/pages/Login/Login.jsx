import "./Login.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/api";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    if (email.trim() === "" || password.trim() === "") {
      alert("Please enter Email and Password.");
      return;
    }

    try {
      const response = await api.post("/auth/login", {
        email,
        password,
      });

      localStorage.setItem("token", response.data.access_token);

      alert("Login Successful!");

      navigate("/dashboard");
    } catch (error) {
      alert("Invalid Email or Password");
      console.error(error);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>TrafficVision AI</h1>

        <p>AI Smart Traffic Prediction & Congestion Management System</p>

        <form onSubmit={handleLogin}>
          <div className="input-group">
            <label>Email</label>

            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="input-group">
            <label>Password</label>

            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button type="submit">
            Login
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;