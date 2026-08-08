import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Register from "./pages/Register";
import Login from "./pages/Login";
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
import OperatorDashboard from "./pages/operator/Dashboard";
import CommuterDashboard from "./pages/commuter/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import RoleProtectedRoute from "./components/RoleProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />

        <Route path="/register" element={<Register />} />

        <Route path="/login" element={<Login />} />

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

        <Route
          path="/admin/traffic"
          element={
            <ProtectedRoute>
              <RoleProtectedRoute allowedRole="admin">
                <TrafficMonitoring />
              </RoleProtectedRoute>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/analytics"
          element={
            <ProtectedRoute>
              <RoleProtectedRoute allowedRole="admin">
                <Analytics />
              </RoleProtectedRoute>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/alerts"
          element={
            <ProtectedRoute>
              <RoleProtectedRoute allowedRole="admin">
                <Alerts />
              </RoleProtectedRoute>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/reports"
          element={
            <ProtectedRoute>
              <RoleProtectedRoute allowedRole="admin">
                <Reports />
              </RoleProtectedRoute>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/roads"
          element={
            <ProtectedRoute>
              <RoleProtectedRoute allowedRole="admin">
                <RoadManagement />
              </RoleProtectedRoute>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/zones"
          element={
            <ProtectedRoute>
              <RoleProtectedRoute allowedRole="admin">
                <ZoneManagement />
              </RoleProtectedRoute>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/routes"
          element={
            <ProtectedRoute>
              <RoleProtectedRoute allowedRole="admin">
                <RouteOptimization />
              </RoleProtectedRoute>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/settings"
          element={
            <ProtectedRoute>
              <RoleProtectedRoute allowedRole="admin">
                <Settings />
              </RoleProtectedRoute>
            </ProtectedRoute>
          }
        />
        
        <Route
            path="/admin/history"
            element={
                <ProtectedRoute>
                    <RoleProtectedRoute allowedRole="admin">
                        <HistoricalAnalytics />
                    </RoleProtectedRoute>
                </ProtectedRoute>
            }
        />
        
        <Route
          path="/operator"
          element={
            <ProtectedRoute>
              <RoleProtectedRoute allowedRole="traffic_operator">
                <OperatorDashboard />
              </RoleProtectedRoute>
            </ProtectedRoute>
          }
        />

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
        
      </Routes>
    </BrowserRouter>
  );
}

export default App;