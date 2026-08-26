import {
    Navigate,
    Route,
    Routes
} from "react-router-dom";


import AuthService
    from "../services/authService";


/* =========================================================
   AUTH PAGES
========================================================= */

import PublicDashboard
    from "../pages/PublicDashboard/PublicDashboard";

import Login
    from "../pages/Login/Login";

import Register
    from "../pages/Register/Register";


/* =========================================================
   MAIN PAGES
========================================================= */

import Dashboard
    from "../pages/Dashboard/Dashboard";

import Alerts
    from "../pages/Alerts/Alerts";

import Analytics
    from "../pages/Analytics/Analytics";

import Maps
    from "../pages/Maps/Maps";

import Prediction
    from "../pages/Prediction/Prediction";

import Reports
    from "../pages/Reports/Reports";

import Profile
    from "../pages/Profile/Profile";

import Settings
    from "../pages/Settings/Settings";


/* =========================================================
   ADMIN PAGES
========================================================= */

import UserManagement
    from "../pages/UserManagement/UserManagement";

import SystemActivity
    from "../pages/SystemActivity/SystemActivity";

import SystemControls
    from "../pages/SystemControls/SystemControls";


/* =========================================================
   PROTECTED ROUTE
========================================================= */

function ProtectedRoute({ children }) {

    const authenticated =
        AuthService.isAuthenticated();


    if (!authenticated) {

        return (
            <Navigate
                to="/login"
                replace
            />
        );

    }


    return children;

}


/* =========================================================
   ADMIN ROUTE
========================================================= */

function AdminRoute({ children }) {

    const authenticated =
        AuthService.isAuthenticated();


    const role =
        AuthService.getRole();


    if (!authenticated) {

        return (
            <Navigate
                to="/login"
                replace
            />
        );

    }


    if (role !== "admin") {

        return (
            <Navigate
                to="/dashboard"
                replace
            />
        );

    }


    return children;

}


/* =========================================================
   APP ROUTES
========================================================= */

function AppRoutes() {

    return (

        <Routes>


            {/* =================================================
                PUBLIC ROUTES
            ================================================= */}

            <Route 
                path="/" 
                element={<PublicDashboard />} 
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
                PROTECTED — DASHBOARD
            ================================================= */}

            <Route
                path="/dashboard"
                element={
                    <ProtectedRoute>
                        <Dashboard />
                    </ProtectedRoute>
                }
            />


            {/* =================================================
                PROTECTED — PREDICTION
            ================================================= */}

            <Route
                path="/prediction"
                element={
                    <ProtectedRoute>
                        <Prediction />
                    </ProtectedRoute>
                }
            />


            {/* =================================================
                PROTECTED — MAPS
            ================================================= */}

            <Route
                path="/maps"
                element={
                    <ProtectedRoute>
                        <Maps />
                    </ProtectedRoute>
                }
            />


            {/* =================================================
                PROTECTED — ALERTS
            ================================================= */}

            <Route
                path="/alerts"
                element={
                    <ProtectedRoute>
                        <Alerts />
                    </ProtectedRoute>
                }
            />


            {/* =================================================
                PROTECTED — ANALYTICS
            ================================================= */}

            <Route
                path="/analytics"
                element={
                    <ProtectedRoute>
                        <Analytics />
                    </ProtectedRoute>
                }
            />


            {/* =================================================
                PROTECTED — REPORTS
            ================================================= */}

            <Route
                path="/reports"
                element={
                    <ProtectedRoute>
                        <Reports />
                    </ProtectedRoute>
                }
            />


            {/* =================================================
                PROTECTED — PROFILE
            ================================================= */}

            <Route
                path="/profile"
                element={
                    <ProtectedRoute>
                        <Profile />
                    </ProtectedRoute>
                }
            />


            {/* =================================================
                PROTECTED — SETTINGS
            ================================================= */}

            <Route
                path="/settings"
                element={
                    <ProtectedRoute>
                        <Settings />
                    </ProtectedRoute>
                }
            />


            {/* =================================================
                ADMIN — USER MANAGEMENT
            ================================================= */}

            <Route
                path="/users"
                element={
                    <AdminRoute>
                        <UserManagement />
                    </AdminRoute>
                }
            />


            {/* =================================================
                ADMIN — SYSTEM ACTIVITY
            ================================================= */}

            <Route
                path="/system-activity"
                element={
                    <AdminRoute>
                        <SystemActivity />
                    </AdminRoute>
                }
            />


            {/* =================================================
                ADMIN — SYSTEM CONTROLS
            ================================================= */}

            <Route
                path="/system-controls"
                element={
                    <AdminRoute>
                        <SystemControls />
                    </AdminRoute>
                }
            />


            {/* =================================================
                FALLBACK
            ================================================= */}

            <Route
                path="*"
                element={
                    <Navigate
                        to="/dashboard"
                        replace
                    />
                }
            />

        </Routes>

    );

}


export default AppRoutes;