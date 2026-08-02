    import { BrowserRouter, Routes, Route } from "react-router-dom";

    import Login from "./pages/Login";
    import Dashboard from "./pages/Dashboard";
    import TrafficForm from "./pages/TrafficForm";
    import TrafficList from "./pages/TrafficList";
    import EditTraffic from "./pages/EditTraffic";
    import Analytics from "./pages/Analytics";
    import Prediction from "./pages/Prediction";
    import Register from "./pages/Register";
    import NotFound from "./pages/NotFound";
    import PredictionHistory from "./pages/PredictionHistory";

    import Alerts from "./pages/Alerts";

    import ProtectedRoute from "./components/ProtectedRoute";
    import Heatmap from "./pages/Heatmap";

    function App() {
        return (
            <BrowserRouter>
                <Routes>

                    <Route path="/alerts" element={<Alerts />} />

                    <Route
                        path="/"
                        element={<Login />}
                    />

                    <Route
                        path="/register"
                        element={<Register />}
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
                            <ProtectedRoute allowedRoles={["admin"]}>
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
                            <ProtectedRoute allowedRoles={["admin"]}>
                                <EditTraffic />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/analytics"
                        element={
                            <ProtectedRoute>
                                <Analytics />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/prediction"
                        element={
                            <ProtectedRoute>
                                <Prediction />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/prediction/history"
                        element={
                            <ProtectedRoute>
                                <PredictionHistory />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="*"
                        element={<NotFound />}
                    />

                    <Route path="/heatmap" element={<Heatmap />} />

                </Routes>
            </BrowserRouter>
        );
    }

    export default App;