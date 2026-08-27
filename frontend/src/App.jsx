import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import { SidebarProvider } from "./context/SidebarContext";

import Home from "./pages/Home";
import Register from "./pages/Register";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import AdminDashboard from "./pages/admin/Dashboard";
import Analytics from "./pages/admin/Analytics";
import Alerts from "./pages/admin/Alerts";
import Reports from "./pages/admin/Reports";
import RoadManagement from "./pages/admin/RoadManagement";
import ZoneManagement from "./pages/admin/ZoneManagement";
import TrafficMonitoring from "./pages/admin/TrafficMonitoring";
import RouteOptimization from "./pages/admin/RouteOptimization";
import Settings from "./pages/admin/Settings";
import HistoricalAnalytics from "./pages/admin/HistoricalAnalytics";
import UserManagement from "./pages/admin/UserManagement";
import OperatorDashboard from "./pages/operator/Dashboard";

import OperatorPrediction from "./pages/operator/Prediction";
import CommuterDashboard from "./pages/commuter/Dashboard";
import CityTrafficMap from "./pages/commuter/CityTrafficMap";
import ProtectedRoute from "./components/ProtectedRoute";
import RoleProtectedRoute from "./components/RoleProtectedRoute";


function App() {
  return (
    <ThemeProvider>
      <SidebarProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Landing & Authentication */}
            <Route path="/" element={<Home />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            {/* Admin Root Dashboard */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <RoleProtectedRoute allowedRole="admin">
                    <AdminDashboard />
                  </RoleProtectedRoute>
                </ProtectedRoute>
              }
            />

            {/* Admin User Management Center (Admin Only) */}
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute>
                  <RoleProtectedRoute allowedRole="admin">
                    <UserManagement />
                  </RoleProtectedRoute>
                </ProtectedRoute>
              }
            />

            {/* Real-time Traffic Monitoring Center (Admin, Operator, Commuter) */}
            <Route
              path="/admin/traffic"
              element={
                <ProtectedRoute>
                  <RoleProtectedRoute allowedRoles={["admin", "traffic_operator", "commuter"]}>
                    <TrafficMonitoring />
                  </RoleProtectedRoute>
                </ProtectedRoute>
              }
            />

            {/* Real-time Traffic Monitoring Alias */}
            <Route
              path="/admin/traffic-monitoring"
              element={
                <ProtectedRoute>
                  <RoleProtectedRoute allowedRoles={["admin", "traffic_operator", "commuter"]}>
                    <TrafficMonitoring />
                  </RoleProtectedRoute>
                </ProtectedRoute>
              }
            />

            {/* Deep Analytics (Admin & Operator) */}
            <Route
              path="/admin/analytics"
              element={
                <ProtectedRoute>
                  <RoleProtectedRoute allowedRoles={["admin", "traffic_operator"]}>
                    <Analytics />
                  </RoleProtectedRoute>
                </ProtectedRoute>
              }
            />

            {/* Alerts & Incidents Center (All Roles) */}
            <Route
              path="/admin/alerts"
              element={
                <ProtectedRoute>
                  <RoleProtectedRoute allowedRoles={["admin", "traffic_operator", "commuter"]}>
                    <Alerts />
                  </RoleProtectedRoute>
                </ProtectedRoute>
              }
            />

            {/* Municipal & Traffic Reports (Admin & Operator) */}
            <Route
              path="/admin/reports"
              element={
                <ProtectedRoute>
                  <RoleProtectedRoute allowedRoles={["admin", "traffic_operator"]}>
                    <Reports />
                  </RoleProtectedRoute>
                </ProtectedRoute>
              }
            />

            {/* Road Management Inventory (Admin & Operator) */}
            <Route
              path="/admin/roads"
              element={
                <ProtectedRoute>
                  <RoleProtectedRoute allowedRoles={["admin", "traffic_operator"]}>
                    <RoadManagement />
                  </RoleProtectedRoute>
                </ProtectedRoute>
              }
            />

            {/* Zone Management Topology (Admin & Operator) */}
            <Route
              path="/admin/zones"
              element={
                <ProtectedRoute>
                  <RoleProtectedRoute allowedRoles={["admin", "traffic_operator"]}>
                    <ZoneManagement />
                  </RoleProtectedRoute>
                </ProtectedRoute>
              }
            />

            {/* Route Optimization & Bypass Planner (All Roles) */}
            <Route
              path="/admin/routes"
              element={
                <ProtectedRoute>
                  <RoleProtectedRoute allowedRoles={["admin", "traffic_operator", "commuter"]}>
                    <RouteOptimization />
                  </RoleProtectedRoute>
                </ProtectedRoute>
              }
            />

            {/* Historical Telemetry & Trends (Admin & Operator) */}
            <Route
              path="/admin/history"
              element={
                <ProtectedRoute>
                  <RoleProtectedRoute allowedRoles={["admin", "traffic_operator"]}>
                    <HistoricalAnalytics />
                  </RoleProtectedRoute>
                </ProtectedRoute>
              }
            />

            {/* Settings & Profile Governance (All Roles) */}
            <Route
              path="/admin/settings"
              element={
                <ProtectedRoute>
                  <RoleProtectedRoute allowedRoles={["admin", "traffic_operator", "commuter"]}>
                    <Settings />
                  </RoleProtectedRoute>
                </ProtectedRoute>
              }
            />

            {/* Operator Console (Admin & Operator) */}
            <Route
              path="/operator"
              element={
                <ProtectedRoute>
                  <RoleProtectedRoute allowedRoles={["admin", "traffic_operator"]}>
                    <OperatorDashboard />
                  </RoleProtectedRoute>
                </ProtectedRoute>
              }
            />

            {/* AI Prediction Workspace (Admin & Operator) */}
            <Route
              path="/operator/prediction"
              element={
                <ProtectedRoute>
                  <RoleProtectedRoute allowedRoles={["admin", "traffic_operator"]}>
                    <OperatorPrediction />
                  </RoleProtectedRoute>
                </ProtectedRoute>
              }
            />

            {/* Admin AI Prediction Alias */}
            <Route
              path="/admin/prediction"
              element={
                <ProtectedRoute>
                  <RoleProtectedRoute allowedRoles={["admin", "traffic_operator"]}>
                    <OperatorPrediction />
                  </RoleProtectedRoute>
                </ProtectedRoute>
              }
            />

            {/* Public Commuter Mobility Portal */}
            <Route
              path="/commuter"
              element={
                <ProtectedRoute>
                  <RoleProtectedRoute allowedRole="commuter">
                    <CommuterDashboard />
                  </RoleProtectedRoute>
                </ProtectedRoute>
              }
            />

            {/* Public Commuter Interactive City Traffic Map */}
            <Route
              path="/commuter/map"
              element={
                <ProtectedRoute>
                  <RoleProtectedRoute allowedRoles={["admin", "traffic_operator", "commuter"]}>
                    <CityTrafficMap />
                  </RoleProtectedRoute>
                </ProtectedRoute>
              }
            />


            {/* Catch-all fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </SidebarProvider>
    </ThemeProvider>
  );
}

export default App;