import { Link } from "react-router-dom";

function PublicNavbar() {
  return (
    <nav>
      <h2>TrafficVision AI</h2>

      <div>
        <Link to="/">Home</Link>

        {" | "}

        <Link to="/login">Login</Link>

        {" | "}

        <Link to="/register">Register</Link>
      </div>
    </nav>
  );
}

export default PublicNavbar;