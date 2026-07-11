import { Navigate } from "react-router-dom";

function ProtectedRoute({ children }) {

  const isAuthenticated = true;

  return isAuthenticated ? children : <Navigate to="/" />;

}

export default ProtectedRoute;