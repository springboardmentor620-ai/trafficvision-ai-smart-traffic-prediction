import { lazy, Suspense } from "react";
import { Navigate, Routes, Route, Outlet } from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import TrafficRecords from "./pages/TrafficRecords";
import LiveMap from "./pages/LiveMap";
import Alerts from "./pages/Alerts";
import HeatMap from "./pages/HeatMap";
import AIInsights from "./pages/AIInsights";
import Prediction from "./pages/Prediction";
import Reports from "./pages/Reports";

import MainLayout from "./layouts/MainLayout";

import "./App.css";

const Analytics = lazy(() => import("./pages/Analytics"));

const protectedRoutes = [
  { path: "/dashboard", element: <Dashboard /> },
  { path: "/traffic-records", element: <TrafficRecords /> },
  { path: "/live-map", element: <LiveMap /> },
  { path: "/alerts", element: <Alerts /> },
  { path: "/navigation", element: <LiveMap /> },
  { path: "/analytics", element: <Suspense fallback={<div className="page-loading">Loading analytics...</div>}><Analytics /></Suspense> },
  { path: "/heatmap", element: <HeatMap /> },
  { path: "/ai-insights", element: <AIInsights /> },
  { path: "/prediction", element: <Prediction /> },
  { path: "/reports", element: <Reports /> },
  { path: "/profile", element: <Navigate to="/dashboard" replace /> },
];

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />

      <Route element={<ProtectedLayout />}>
        {protectedRoutes.map(({ path, element }) => (
          <Route key={path} path={path} element={element} />
        ))}
      </Route>
    </Routes>
  );
}

function ProtectedLayout() {
  return localStorage.getItem("role") ? <MainLayout><Outlet /></MainLayout> : <Navigate to="/" replace />;
}

export default App;
