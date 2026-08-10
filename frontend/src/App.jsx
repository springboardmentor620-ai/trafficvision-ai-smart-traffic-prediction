import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import TrafficForm from "./pages/TrafficForm";
import TrafficList from "./pages/TrafficList";
import EditTraffic from "./pages/EditTraffic";
import Analytics from "./pages/Analytics";
import Prediction from "./pages/Prediction";
import PredictionHistory from "./pages/PredictionHistory";
import Alerts from "./pages/Alerts";
import Heatmap from "./pages/Heatmap";
import Trends from "./pages/Trends";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";

import ProtectedRoute from "./components/ProtectedRoute";

function App() {
    return (
        <BrowserRouter>
            <Routes>

                <Route
                    path="/"
                    element={<Login />}
                />

                <Route
                    path="/register"
                    element={<Register />}
                />

                <Route
                    path="/forgot-password"
                    element={<ForgotPassword />}
                />

                <Route
                    path="/reset-password"
                    element={<ResetPassword />}
                />

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
                    path="/prediction/history"
                    element={
                        <ProtectedRoute>
                            <PredictionHistory />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/analytics"
                    element={
                        <ProtectedRoute>
                            <Analytics />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/heatmap"
                    element={
                        <ProtectedRoute>
                            <Heatmap />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/trends"
                    element={
                        <ProtectedRoute>
                            <Trends />
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

                <Route
                    path="/alerts"
                    element={
                        <ProtectedRoute>
                            <Alerts />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/traffic/add"
                    element={
                        <ProtectedRoute allowedRoles={["admin"]}>
                            <TrafficForm />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/traffic/list"
                    element={
                        <ProtectedRoute>
                            <TrafficList />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/traffic/edit/:id"
                    element={
                        <ProtectedRoute allowedRoles={["admin"]}>
                            <EditTraffic />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="*"
                    element={<NotFound />}
                />

            </Routes>
        </BrowserRouter>
    );
}

export default App;