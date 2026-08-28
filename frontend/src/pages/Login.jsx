import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authenticate } from "../services/trafficService";
import "../styles/Login.css";

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState(""); const [password, setPassword] = useState(""); const [role, setRole] = useState("Public User");
  const [signup, setSignup] = useState(false); const [error, setError] = useState(""); const [loading, setLoading] = useState(false);
  async function submit(event) { event.preventDefault(); setLoading(true); setError(""); try { const response = await authenticate({ email, password, role }, signup); if (response.status !== "success") throw new Error(response.message); if (signup) { setSignup(false); setPassword(""); return; } localStorage.setItem("role", response.role); localStorage.setItem("user", response.email); navigate("/dashboard"); } catch (e) { setError(e.message); } finally { setLoading(false); } }
  return <div className="login-container"><form className="login-card" onSubmit={submit}><h1>TrafficVision AI</h1><p className="subtitle">Smart Traffic Prediction & Congestion Management</p><h2>{signup ? "Create an account" : "Welcome back"}</h2><input type="email" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} required /><input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />{signup && <select value={role} onChange={(e) => setRole(e.target.value)}><option>Public User</option><option>Traffic Operator</option><option>Admin</option></select>}{error && <p className="error">{error}</p>}<button disabled={loading}>{loading ? "Please wait…" : signup ? "Sign up" : "Login"}</button>{!signup && <Link className="auth-link" to="/forgot-password">Forgot Password?</Link>}<button type="button" className="login-switch" onClick={() => { setSignup(!signup); setError(""); }}>{signup ? "Already have an account? Login" : "New here? Create an account"}</button></form></div>;
}
export default Login;
