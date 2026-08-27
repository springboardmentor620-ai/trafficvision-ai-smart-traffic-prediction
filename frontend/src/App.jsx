import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import { SidebarProvider } from "./context/SidebarContext";
import ProtectedRoute from "./components/ProtectedRoute";
import RoleProtectedRoute from "./components/RoleProtectedRoute";

// Lazy-loaded route components for on-demand bundle splitting
const Home = lazy(() => import("./pages/Home"));
const Register = lazy(() => import("./pages/Register"));
const Login = lazy(() => import("./pages/Login"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const AdminDashboard = lazy(() => import("./pages/admin/Dashboard"));
const Analytics = lazy(() => import("./pages/admin/Analytics"));
const Alerts = lazy(() => import("./pages/admin/Alerts"));
const Reports = lazy(() => import("./pages/admin/Reports"));
const RoadManagement = lazy(() => import("./pages/admin/RoadManagement"));
const ZoneManagement = lazy(() => import("./pages/admin/ZoneManagement"));
const TrafficMonitoring = lazy(() => import("./pages/admin/TrafficMonitoring"));
const RouteOptimization = lazy(() => import("./pages/admin/RouteOptimization"));
const Settings = lazy(() => import("./pages/admin/Settings"));
const HistoricalAnalytics = lazy(() => import("./pages/admin/HistoricalAnalytics"));
const UserManagement = lazy(() => import("./pages/admin/UserManagement"));
const OperatorDashboard = lazy(() => import("./pages/operator/Dashboard"));
const OperatorPrediction = lazy(() => import("./pages/operator/Prediction"));
const CommuterDashboard = lazy(() => import("./pages/commuter/Dashboard"));
const CityTrafficMap = lazy(() => import("./pages/commuter/CityTrafficMap"));

// Clean page transition loading spinner
function RouteLoadingFallback() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        backgroundColor: "var(--bg-primary, #0f172a)",
        color: "var(--text-primary, #f8fafc)",
        gap: "16px",
        fontFamily: "Inter, system-ui, sans-serif",
      }}
    >
      <div
        style={{
          width: "42px",
          height: "42px",
          border: "3px solid rgba(59, 130, 246, 0.2)",
          borderTopColor: "#3b82f6",
          borderRadius: "50%",
          animation: "spin 0.8s linear infinite",
        }}
      />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <span style={{ fontSize: "14px", fontWeight: "500", opacity: 0.8 }}>
        Loading TrafficVision AI...
      </span>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <SidebarProvider>
        <BrowserRouter>
          <Suspense fallback={<RouteLoadingFallback />}>
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
          </Suspense>
        </BrowserRouter>
      </SidebarProvider>
    </ThemeProvider>
  );
}

export default App;