import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getCurrentUser } from "../services/user";

function Navbar() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);

  useEffect(() => {
    getCurrentUser()
      .then((data) => setUser(data))
      .catch(() => {
        localStorage.removeItem("token");
        navigate("/");
      });
  }, [navigate]);

  function logout() {
    localStorage.removeItem("token");
    navigate("/");
  }

  return (
    <nav
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "15px 25px",
        background: "#0d6efd",
        color: "white",
      }}
    >
      <h2>TrafficVision AI</h2>

      <div>
        {user && (
          <>
            <strong>{user.name}</strong> ({user.role})
          </>
        )}

        <button
          onClick={logout}
          style={{
            marginLeft: "20px",
            padding: "8px 14px",
            cursor: "pointer",
          }}
        >
          Logout
        </button>
      </div>
    </nav>
  );
}

export default Navbar;