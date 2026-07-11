import "./Navbar.css";
import { MdNotifications } from "react-icons/md";
import { useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate("/");
  };

  return (
    <div className="navbar">

      <div className="navbar-left">
        <h2>Traffic Dashboard</h2>
        <p>Real-Time Smart Traffic Monitoring System</p>
      </div>

      <div className="navbar-right">

        <input
          type="text"
          placeholder="Search Location..."
          className="search-box"
        />

        <button className="notification-btn">
          <MdNotifications />
        </button>

        <div className="admin-profile">
          Admin
        </div>

        <button
          className="logout-btn"
          onClick={handleLogout}
        >
          Logout
        </button>

      </div>

    </div>
  );
}

export default Navbar;