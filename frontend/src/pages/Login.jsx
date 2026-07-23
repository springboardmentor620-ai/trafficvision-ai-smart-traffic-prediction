import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Login.css";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = () => {

    if (!email || !password) {
      setError("Please enter email and password.");
      return;
    }

    // Admin Login
    if (
      email === "admin@trafficvision.com" &&
      password === "admin123"
    ) {
      localStorage.setItem("role", "Admin");
      navigate("/dashboard");
      return;
    }

    // User Login
    if (
      email === "user@trafficvision.com" &&
      password === "user123"
    ) {
      localStorage.setItem("role", "User");
      navigate("/dashboard");
      return;
    }

    setError("Invalid Email or Password");
  };

  return (
    <div className="login-container">
      <div className="login-card">

        <h1>🚦 TrafficVision AI</h1>

        <p className="subtitle">
          Smart Traffic Prediction & Congestion Management
        </p>

        <input
          type="email"
          placeholder="Enter Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Enter Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && <p className="error">{error}</p>}

        <button onClick={handleLogin}>
          Login
        </button>

      </div>
    </div>
  );
}

export default Login;