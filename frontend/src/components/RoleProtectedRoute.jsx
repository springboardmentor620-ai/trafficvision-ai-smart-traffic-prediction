import { Navigate } from "react-router-dom";

function RoleProtectedRoute({ children, allowedRole, allowedRoles }) {
  const userStr = localStorage.getItem("user");
  let user = null;
  if (userStr) {
    try {
      user = JSON.parse(userStr);
    } catch {
      user = null;
    }
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const validRoles = allowedRoles || (allowedRole ? [allowedRole] : []);

  if (validRoles.length > 0 && !validRoles.includes(user.role)) {
    // Graceful redirect to the user's corresponding portal
    if (user.role === "traffic_operator") {
      return <Navigate to="/operator" replace />;
    } else if (user.role === "commuter") {
      return <Navigate to="/commuter" replace />;
    }
    return <Navigate to="/admin" replace />;
  }

  return children;
}

export default RoleProtectedRoute;