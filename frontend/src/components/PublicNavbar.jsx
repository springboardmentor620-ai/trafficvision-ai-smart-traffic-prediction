import { Link } from "react-router-dom";

function PublicNavbar() {
  return (
    <nav className="public-navbar">
      <div className="logo">
        <Link to="/">
          <h2>🚦 TrafficVision AI</h2>
        </Link>
      </div>

      <div className="nav-links">
        <Link to="/">Home</Link>

        <Link to="/login">Login</Link>

        <Link to="/register">
          <button className="register-btn">
            Register
          </button>
        </Link>
      </div>
    </nav>
  );
}

export default PublicNavbar;