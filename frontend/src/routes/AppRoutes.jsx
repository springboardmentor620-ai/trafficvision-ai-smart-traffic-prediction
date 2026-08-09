import {
    Routes,
    Route,
    Navigate
} from "react-router-dom";

import Landing from "../pages/Landing/Landing";
import Login from "../pages/Login/Login";
import Register from "../pages/Register/Register";

import Dashboard from "../pages/Dashboard/Dashboard";
import Prediction from "../pages/Prediction/Prediction";
import Reports from "../pages/Reports/Reports";
import Maps from "../pages/Maps/Maps";
import Analytics from "../pages/Analytics/Analytics";
import Alerts from "../pages/Alerts/Alerts";

import AuthService from "../services/authService";


function ProtectedRoute({ children }) {

    return AuthService.isAuthenticated()

        ? children

        : <Navigate
            to="/login"
            replace
        />;

}


function AppRoutes() {

    return (

        <Routes>

            {/* =================================================
                PUBLIC ROUTES
            ================================================= */}

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


            {/* =================================================
                PROTECTED ROUTES
            ================================================= */}

            <Route
                path="/dashboard"
                element={
                    <ProtectedRoute>
                        <Dashboard />
                    </ProtectedRoute>
                }
            />


            {/* MAPS & ROUTES */}

            <Route
                path="/maps"
                element={
                    <ProtectedRoute>
                        <Maps />
                    </ProtectedRoute>
                }
            />


            {/* PREDICTION */}

            <Route
                path="/prediction"
                element={
                    <ProtectedRoute>
                        <Prediction />
                    </ProtectedRoute>
                }
            />


            {/* ANALYTICS */}

            <Route
                path="/analytics"
                element={
                    <ProtectedRoute>
                        <Analytics />
                    </ProtectedRoute>
                }
            />


            {/* REPORTS */}

            <Route
                path="/reports"
                element={
                    <ProtectedRoute>
                        <Reports />
                    </ProtectedRoute>
                }
            />


            {/* ALERTS */}

            <Route
                path="/alerts"
                element={
                    <ProtectedRoute>
                        <Alerts />
                    </ProtectedRoute>
                }
            />


            {/* =================================================
                FALLBACK
            ================================================= */}

            <Route
                path="*"
                element={
                    <Navigate
                        to="/"
                        replace
                    />
                }
            />

        </Routes>

    );

}


export default AppRoutes;