import { Link } from "react-router-dom";

function Home() {
  return (
    <div>
      <h1>TrafficVision AI</h1>

      <p>Smart Traffic Management System</p>

      <Link to="/login">
        <button>Login</button>
      </Link>

      <Link to="/register">
        <button>Register</button>
      </Link>
    </div>
  );
}

export default Home;