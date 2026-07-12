import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Objectives from "./pages/Objectives";
import Modules from "./pages/Modules";
import Workflow from "./pages/Workflow";
import TechStack from "./pages/TechStack";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import UserDashboard from "./pages/UserDashboard";
import AdminDashboard from "./pages/AdminDashboard";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<Home />} />

        <Route path="/objectives" element={<Objectives />} />

        <Route path="/modules" element={<Modules />} />

        <Route path="/workflow" element={<Workflow />} />

        <Route path="/techstack" element={<TechStack />} />

        <Route path="/login" element={<Login />} />

        <Route path="/register" element={<Register />} />

        <Route path="/dashboard" element={<Dashboard />} />

        <Route
          path="/user-dashboard"
          element={<UserDashboard />}
        />

        <Route
          path="/admin"
          element={<AdminDashboard />}
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;