import "./Login.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();

    if (email.trim() === "" || password.trim() === "") {
      alert("Please enter Email and Password.");
      return;
    }

    // Dummy Login (Module 1)
    navigate("/dashboard");
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