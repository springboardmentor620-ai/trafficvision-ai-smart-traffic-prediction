import { NavLink, useNavigate } from "react-router-dom";
import NotificationBell from "../NotificationBell";
import "../../styles/navbar.css";

function Navbar() {

  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  const role = localStorage.getItem("role");

  const logout = () => {

    localStorage.clear();

    navigate("/login");

  };

  return (

    <header className="navbar">

      {/* Logo */}

      <div className="logo">

        <div className="logo-circle">
          TV
        </div>

        <div>

          <h2>TrafficVision AI</h2>

          <span>
            Smart Traffic Management
          </span>

        </div>

      </div>

      {/* Navigation */}

      <nav>

        {!token ? (

          <>

            <NavLink to="/">Home</NavLink>

            <NavLink to="/objectives">Objectives</NavLink>

            <NavLink to="/modules">Modules</NavLink>

            <NavLink to="/workflow">Workflow</NavLink>

            <NavLink to="/techstack">Technology</NavLink>

          </>

        ) : (

          <>

            {role === "admin" ? (

              <>

                <NavLink to="/admin-dashboard">
                  Dashboard
                </NavLink>

              </>

            ) : (

              <>

                <NavLink to="/user-dashboard">
                  Dashboard
                </NavLink>

                <NavLink to="/prediction">
                  Prediction
                </NavLink>

                <NavLink to="/analytics">
                  Analytics
                </NavLink>

                <NavLink to="/recommendations">
                  Recommendations
                </NavLink>

                <NavLink to="/reports">
                  Reports
                </NavLink>

                <NavLink to="/heatmap">
                  Traffic Heatmap
                </NavLink>

                <NavLink to="/alerts">
                  Alerts
                </NavLink>
                <NavLink to="/admin/alerts">
                  Manage Alerts
                </NavLink>
              </>

            )}

          </>

        )}

      </nav>

      {/* Right Side */}

      {token ? (

        <div className="nav-buttons">

          {/* Notification Bell */}

          <NotificationBell />

          <span
            style={{
              marginLeft: "18px",
              marginRight: "18px",
              fontWeight: "600",
              color: "#2563eb",
            }}
          >
            {role === "admin"
              ? "👨‍💼 Admin"
              : "🚦 Traffic Operator"}
          </span>

          <button
            className="register-btn"
            onClick={logout}
          >
            Logout
          </button>

        </div>

      ) : (

        <div className="nav-buttons">

          <NavLink
            to="/login"
            className="login-btn"
          >
            Login
          </NavLink>

          <NavLink
            to="/register"
            className="register-btn"
          >
            Register
          </NavLink>

        </div>

      )}

    </header>

  );

}

export default Navbar;