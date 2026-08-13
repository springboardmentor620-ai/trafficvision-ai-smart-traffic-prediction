import { Navigate, useLocation } from "react-router-dom";

function ProtectedRoute({ children, roles }) {
  const location = useLocation();
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/" replace state={{ from: location.pathname }} />;
  }

  if (roles?.length) {
    let user = {};
    try {
      user = JSON.parse(localStorage.getItem("user") || "{}");
    } catch {
      user = {};
    }

    const role = String(user.role || "").toLowerCase();
    if (!roles.map((value) => value.toLowerCase()).includes(role)) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return children;
}

export default ProtectedRoute;
