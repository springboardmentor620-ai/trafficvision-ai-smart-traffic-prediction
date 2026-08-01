import { Routes, Route, Navigate } from "react-router-dom";

import Landing from "../pages/Landing/Landing";
import Login from "../pages/Login/Login";
import Register from "../pages/Register/Register";

import Dashboard from "../pages/Dashboard/Dashboard";
import Prediction from "../pages/Prediction/Prediction";
import Reports from "../pages/Reports/Reports";

// Uncomment these when we create them
// import Heatmap from "../pages/Heatmap/Heatmap";
// import Alerts from "../pages/Alerts/Alerts";
// import Profile from "../pages/Profile/Profile";

import AuthService from "../services/authService";

function ProtectedRoute({ children }) {

    return AuthService.isAuthenticated()

        ? children

        : <Navigate to="/login" replace />;

}

function AppRoutes() {

    return (

        <Routes>

            {/* Public Routes */}

            <Route

                path="/"

                element={<Landing />}

            />

            <Route

                path="/login"

                element={<Login />}

            />

            <Route

                path="/register"

                element={<Register />}

            />

            {/* Protected Routes */}

            <Route

                path="/dashboard"

                element={

                    <ProtectedRoute>

                        <Dashboard />

                    </ProtectedRoute>

                }

            />

            <Route

                path="/prediction"

                element={

                    <ProtectedRoute>

                        <Prediction />

                    </ProtectedRoute>

                }

            />

            <Route

                path="/reports"

                element={

                    <ProtectedRoute>

                        <Reports />

                    </ProtectedRoute>

                }

            />

            {/*
            <Route

                path="/heatmap"

                element={

                    <ProtectedRoute>

                        <Heatmap />

                    </ProtectedRoute>

                }

            />

            <Route

                path="/alerts"

                element={

                    <ProtectedRoute>

                        <Alerts />

                    </ProtectedRoute>

                }

            />

            <Route

                path="/profile"

                element={

                    <ProtectedRoute>

                        <Profile />

                    </ProtectedRoute>

                }

            />
            */}

            <Route

                path="*"

                element={<Navigate to="/" replace />}

            />

        </Routes>

    );

}

export default AppRoutes;