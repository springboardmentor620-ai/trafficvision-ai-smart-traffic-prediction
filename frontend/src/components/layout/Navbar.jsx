import { NavLink, useNavigate } from "react-router-dom";
import "../../styles/navbar.css";

function Navbar() {

  const navigate = useNavigate();

    const token = localStorage.getItem("token");
    const name = localStorage.getItem("name");
    const role = localStorage.getItem("role");

  const logout = () => {

    localStorage.clear();

    navigate("/login");

  };

  return (

    <header className="navbar">

      <div className="logo">

        <div className="logo-circle">TV</div>

        <div>

          <h2>TrafficVision AI</h2>

          <span>Smart Traffic Management</span>

        </div>

      </div>

      <nav>

        <NavLink to="/">Home</NavLink>

        <NavLink to="/objectives">Objectives</NavLink>

        <NavLink to="/modules">Modules</NavLink>

        <NavLink to="/workflow">Workflow</NavLink>

        <NavLink to="/techstack">Technology</NavLink>

      </nav>

      {

        token ?

        <div className="nav-buttons">

          <span
            style={{
              marginRight: "15px",
              fontWeight: "bold"
            }}
          >
            {role === "admin"
              ? `Admin `
              : `Traffic Operator `}
          </span>

          <button
            className="register-btn"
            onClick={logout}
          >
            Logout
          </button>

        </div>

        :

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

      }

    </header>

  );

}

export default Navbar;