import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import TrafficForm from "./pages/TrafficForm";
import TrafficList from "./pages/TrafficList";
import ProtectedRoute from "./components/ProtectedRoute";
import EditTraffic from "./pages/EditTraffic";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route
                    path="/"
                    element={<Login />}
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
                    path="/traffic/add"
                    element={
                        <ProtectedRoute>
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
                        <ProtectedRoute>
                            <EditTraffic />
                        </ProtectedRoute>
                    }
                />
            </Routes>
        </BrowserRouter>
    );
}

export default App;