import { Link } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import Logo from "./common/Logo";

function PublicNavbar() {
  const { resolvedTheme, toggleTheme } = useTheme();

  return (
    <nav className="public-navbar">
      <div className="logo">
        <Logo size="md" to="/" />
      </div>

      <div className="nav-links">
        <a href="#features">Capabilities</a>
        <a href="#how-it-works">Architecture</a>
        <a href="#roles">Portals</a>

        <button
          onClick={toggleTheme}
          style={{
            background: "var(--bg-surface)",
            color: "var(--text-primary)",
            border: "1px solid var(--border-color)",
            borderRadius: "50%",
            width: "38px",
            height: "38px",
            fontSize: "18px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.2s ease",
          }}
          title={`Switch to ${resolvedTheme === "dark" ? "Light" : "Dark"} Mode`}
          aria-label="Toggle dark mode"
        >
          {resolvedTheme === "dark" ? "☀️" : "🌙"}
        </button>

        <Link to="/login" style={{ fontWeight: "600", fontSize: "14px" }}>
          Sign In
        </Link>

        <Link to="/register">
          <button className="register-btn">Get Started Free</button>
        </Link>
      </div>
    </nav>
  );
}

export default PublicNavbar;