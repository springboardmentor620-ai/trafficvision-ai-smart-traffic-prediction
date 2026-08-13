import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Traffic from "./pages/Traffic";
import TrafficRecords from "./pages/TrafficRecords";
import Analytics from "./pages/Analytics";
import TrafficTrends from "./pages/TrafficTrends";
import RoutePrediction from "./pages/RoutePrediction";
import MapPage from "./pages/MapPage";
import UserManagement from "./pages/UserManagement";
import Profile from "./pages/Profile";
import OperatorDashboard from "./pages/OperatorDashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import NotFound from "./pages/NotFound";

// Milestone 3 & AI Pages
import AlertsDashboard from "./pages/AlertsDashboard";
import Accidents from "./pages/Accidents";
import Emergency from "./pages/Emergency";
import HeatmapDashboard from "./pages/HeatmapDashboard";
import AIReport from "./pages/AIReport";
import Notifications from "./pages/Notifications";
import Recommendations from "./pages/Recommendations";
import Prediction from "./pages/Prediction";

function App() {
  return (
    <Router>
      <Routes>
        {/* Authentication */}
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Main Dashboard & Core Pages */}
        <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/traffic" element={<ProtectedRoute><Traffic /></ProtectedRoute>} />
        <Route path="/traffic-records" element={<ProtectedRoute><TrafficRecords /></ProtectedRoute>} />
        <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
        <Route path="/traffic-trends" element={<ProtectedRoute><TrafficTrends /></ProtectedRoute>} />
        <Route path="/route-prediction" element={<ProtectedRoute><RoutePrediction /></ProtectedRoute>} />
        <Route path="/route" element={<ProtectedRoute><RoutePrediction /></ProtectedRoute>} />

        {/* Maps */}
        <Route path="/map" element={<ProtectedRoute><MapPage /></ProtectedRoute>} />
        <Route path="/heatmap" element={<ProtectedRoute><HeatmapDashboard /></ProtectedRoute>} />

        {/* Alerts & Notifications */}
        <Route path="/alerts" element={<ProtectedRoute><AlertsDashboard /></ProtectedRoute>} />
        <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
        <Route path="/accidents" element={<ProtectedRoute><Accidents /></ProtectedRoute>} />
        <Route path="/emergency" element={<ProtectedRoute><Emergency /></ProtectedRoute>} />

        {/* AI & Reports */}
        <Route path="/recommendations" element={<ProtectedRoute><Recommendations /></ProtectedRoute>} />
        <Route path="/ai-report" element={<ProtectedRoute><AIReport /></ProtectedRoute>} />

        {/* Administration & Profile */}
        <Route path="/users" element={<ProtectedRoute roles={["admin"]}><UserManagement /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/operator-dashboard" element={<ProtectedRoute><OperatorDashboard /></ProtectedRoute>} />
        <Route
          path="/prediction"
          element={<ProtectedRoute><Prediction /></ProtectedRoute>}
        />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;