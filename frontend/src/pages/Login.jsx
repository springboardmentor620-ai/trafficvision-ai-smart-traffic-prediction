import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { login, getCurrentUser } from "../services/auth";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleLogin(e) {
    e.preventDefault();

    try {
      // Login and receive JWT
      const data = await login(email, password);

      // Save token
      localStorage.setItem("token", data.access_token);

      // Fetch logged-in user
      const user = await getCurrentUser();
      localStorage.setItem("user", JSON.stringify(user));

      // Redirect based on role
      if (user.role === "admin") {
        navigate("/admin");
      } else if (user.role === "traffic_operator") {
        navigate("/operator");
      } else if (user.role === "commuter") {
        navigate("/commuter");
      } else {
        alert("Unknown user role");
      }

    } catch {
      alert("Invalid email or password");
    }
  }

  return (
    <div style={{ padding: "40px" }}>
      <h1>TrafficVision AI</h1>

      <form onSubmit={handleLogin}>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <br /><br />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <br /><br />

        <button type="submit">
          Login
        </button>

      </form>
    </div>
  );
}

export default Login;