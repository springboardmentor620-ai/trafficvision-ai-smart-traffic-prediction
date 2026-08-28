import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaBell, FaCloudSun, FaUserCircle } from "react-icons/fa";
import { FiCheck, FiLogOut, FiSettings, FiUser } from "react-icons/fi";
import { getAlerts, getTrafficStatistics } from "../services/trafficService";
import { useToast } from "../context/toast";
import "../styles/Navbar.css";

function Navbar() {
  const [weather, setWeather] = useState("Loading..."); const [alerts, setAlerts] = useState([]); const [open, setOpen] = useState("");
  const [read, setRead] = useState(() => JSON.parse(localStorage.getItem("trafficvision-read-alerts") || "[]")); const navigate = useNavigate(); const { showToast } = useToast(); const box = useRef(null);
  useEffect(() => {
    let mounted = true;
    const refresh = async (initial = false) => {
      try {
        const [stats, notices] = await Promise.all([getTrafficStatistics(), getAlerts()]);
        if (!mounted) return;
        const latest = Array.isArray(notices) ? notices.slice(0, 10) : [];
        setWeather(stats.weather || "No data");
        setAlerts((current) => {
        if (!initial && latest.some((alert) => !current.some((existing) => existing.id === alert.id))) showToast("New traffic alert received.", "info");
          return latest;
        });
      } catch { if (mounted) setWeather("Unavailable"); }
    };
    refresh(true); const timer = window.setInterval(() => refresh(), 30000);
    return () => { mounted = false; window.clearInterval(timer); };
  }, [showToast]);
  useEffect(() => { const close = (event) => { if (!box.current?.contains(event.target)) setOpen(""); }; document.addEventListener("mousedown", close); return () => document.removeEventListener("mousedown", close); }, []);
  const unread = alerts.filter((alert) => !read.includes(alert.id)).length;
  const markRead = (id) => { const next = [...new Set([...read, id])]; setRead(next); localStorage.setItem("trafficvision-read-alerts", JSON.stringify(next)); };
  const markAllRead = () => { const next = [...new Set([...read, ...alerts.map((alert) => alert.id)])]; setRead(next); localStorage.setItem("trafficvision-read-alerts", JSON.stringify(next)); };
  const logout = () => { localStorage.removeItem("role"); localStorage.removeItem("user"); localStorage.removeItem("trafficvision-read-alerts"); showToast("You have been logged out successfully.", "success"); navigate("/", { replace: true }); };
  const email = localStorage.getItem("user") || "TrafficVision User"; const role = localStorage.getItem("role") || "Public User";
  return <header className="navbar" ref={box}><div className="navbar-left"><h2>TrafficVision AI Dashboard</h2><p>Smart Traffic Prediction & Congestion Management</p></div><div className="navbar-right"><div className="nav-card"><FaCloudSun className="nav-icon" /><div><span>Weather</span><h4>{weather}</h4></div></div><div className="nav-menu-wrap"><button type="button" className="nav-icon-button" onClick={() => setOpen(open === "alerts" ? "" : "alerts")} aria-label="Open notifications" aria-expanded={open === "alerts"}><FaBell />{unread > 0 && <b>{unread}</b>}</button>{open === "alerts" && <div className="nav-dropdown notifications"><header><strong>Notifications</strong><button type="button" onClick={markAllRead}><FiCheck /> Mark all read</button></header>{alerts.length ? alerts.map((alert) => <button type="button" className={`notice ${read.includes(alert.id) ? "is-read" : ""}`} onClick={() => markRead(alert.id)} key={alert.id}><span><b>{alert.alert_type}</b><small className={`severity severity-${alert.severity.toLowerCase()}`}>{alert.severity}</small><small>{alert.reason}</small></span><em>{new Date(alert.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</em></button>) : <p className="dropdown-empty">No notifications</p>}<button type="button" className="view-all" onClick={() => { setOpen(""); navigate("/alerts"); }}>View All Alerts</button></div>}</div><div className="nav-menu-wrap"><button type="button" className="nav-icon-button profile-button" onClick={() => setOpen(open === "profile" ? "" : "profile")}><FaUserCircle /></button>{open === "profile" && <div className="nav-dropdown profile-menu"><div className="profile-summary"><b>{email.split("@")[0]}</b><small>{email}</small><span>{role}</span></div><button onClick={() => { setOpen(""); navigate("/profile"); }}><FiUser /> My Profile</button><button onClick={() => showToast("Settings will be available in a future update.", "info")}><FiSettings /> Settings</button><button onClick={logout}><FiLogOut /> Logout</button></div>}</div></div></header>;
}
export default Navbar;
