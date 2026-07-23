import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import TrafficRecords from "./pages/TrafficRecords";
import LiveMap from "./pages/LiveMap";
import "./App.css";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/traffic-records" element={<TrafficRecords />} />
      <Route path="/live-map" element={<LiveMap />} />
    </Routes>
  );
}

export default App;