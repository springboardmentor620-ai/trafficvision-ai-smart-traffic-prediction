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

// Milestone 3 & AI Pages
import AlertsDashboard from "./pages/AlertsDashboard";
import Accidents from "./pages/Accidents";
import Emergency from "./pages/Emergency";
import HeatmapDashboard from "./pages/HeatmapDashboard";
import AIReport from "./pages/AIReport";
import Notifications from "./pages/Notifications";
import Recommendations from "./pages/Recommendations";


function App() {
  return (
    <Router>
      <Routes>
        {/* Authentication */}
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Main Dashboard & Core Pages */}
        <Route path="/home" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/traffic" element={<Traffic />} />
        <Route path="/traffic-records" element={<TrafficRecords />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/traffic-trends" element={<TrafficTrends />} />
        <Route path="/route" element={<RoutePrediction />} />
        <Route path="/route-prediction" element={<RoutePrediction />} />

        {/* Maps */}
        <Route path="/map" element={<MapPage />} />
        <Route path="/heatmap" element={<HeatmapDashboard />} />

        {/* Alerts & Notifications */}
        <Route path="/alerts" element={<AlertsDashboard />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/accidents" element={<Accidents />} />
        <Route path="/emergency" element={<Emergency />} />

        {/* AI & Reports */}
        <Route path="/recommendations" element={<Recommendations />} />
        <Route path="/ai-recommendations" element={<Recommendations />} />
        <Route path="/ai-report" element={<AIReport />} />

        {/* Administration & Profile */}
        <Route path="/users" element={<UserManagement />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/operator-dashboard" element={<OperatorDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;