import { Navigate, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import TrafficRecords from "./pages/TrafficRecords";
import LiveMap from "./pages/LiveMap";

import MainLayout from "./layouts/MainLayout";

import "./App.css";

const protectedRoutes = [
  { path: "/dashboard", element: <Dashboard /> },
  { path: "/traffic-records", element: <TrafficRecords /> },
  { path: "/live-map", element: <LiveMap /> },
  { path: "/navigation", element: <Navigate to="/live-map" replace /> },
  { path: "/analytics", element: <Navigate to="/dashboard" replace /> },
  { path: "/reports", element: <Navigate to="/dashboard" replace /> },
  { path: "/profile", element: <Navigate to="/dashboard" replace /> },
];

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />

      <Route element={<MainLayout />}>
        {protectedRoutes.map(({ path, element }) => (
          <Route key={path} path={path} element={element} />
        ))}
      </Route>
    </Routes>
  );
}

export default App;
