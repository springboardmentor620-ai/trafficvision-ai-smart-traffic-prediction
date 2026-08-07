// import { BrowserRouter, Routes, Route } from "react-router-dom";

// import Home from "./pages/Home";
// import Objectives from "./pages/Objectives";
// import Modules from "./pages/Modules";
// import Workflow from "./pages/Workflow";
// import TechStack from "./pages/TechStack";
// import Login from "./pages/Login";
// import Register from "./pages/Register";
// import Dashboard from "./pages/Dashboard";
// import UserDashboard from "./pages/UserDashboard";
// import AdminDashboard from "./pages/AdminDashboard";
// import Prediction from "./pages/Prediction";
// import Analytics from "./pages/Analytics";
// import Recommendations from "./pages/Recommendations";
// import Reports from "./pages/Reports";
// import Heatmap from "./pages/Heatmap";
// import Alerts from "./pages/Alerts";
// import AdminAnalytics from "./pages/AdminAnalytics";


// function App() {
//   return (
//     <BrowserRouter>
//       <Routes>

//         <Route path="/" element={<Home />} />

//         <Route path="/objectives" element={<Objectives />} />

//         <Route path="/modules" element={<Modules />} />

//         <Route path="/workflow" element={<Workflow />} />

//         <Route path="/techstack" element={<TechStack />} />

//         <Route path="/login" element={<Login />} />

//         <Route path="/register" element={<Register />} />
//         <Route path="/alerts" element={<Alerts />} />
//         <Route path="/dashboard" element={<Dashboard />} />
//         <Route path="/prediction" element={<Prediction />} />
//         <Route path="/analytics" element={<Analytics />} />
//         <Route path="/recommendations" element={<Recommendations />} />
//         <Route path="/heatmap" element={<Heatmap />} />
//         <Route path="/reports" element={<Reports />} />
//         <Route
//           path="/user-dashboard"
//           element={<UserDashboard />}
//         />
//         <Route path="/admin" element={<AdminDashboard/>}/>

//         <Route path="/admin/analytics" element={<AdminAnalytics/>}/>

//         <Route path="/admin/predictions" element={<AdminPredictionHistory/>}/>

//         <Route path="/admin/reports" element={<AdminReports/>}/>

//         <Route path="/admin/alerts" element={<AdminAlerts/>}/>

//         <Route path="/admin/notifications" element={<AdminNotifications/>}/>

//         <Route path="/admin/users" element={<AdminUsers/>}/>
//         <Route
//           path="/admin-dashboard"
//           element={<AdminDashboard />}
//         />

//       </Routes>
//     </BrowserRouter>
//   );
// }

// export default App;

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
import Prediction from "./pages/Prediction";
import Analytics from "./pages/Analytics";
import Recommendations from "./pages/Recommendations";
import Reports from "./pages/Reports";
import Heatmap from "./pages/Heatmap";
import Alerts from "./pages/Alerts";
import AdminPredictionHistory from "./pages/AdminPredictionHistory";
import AdminReports from "./pages/AdminReports";
import AdminAlerts from "./pages/AdminAlerts";
import AdminNotifications from "./pages/AdminNotifications";
import AdminUsers from "./pages/AdminUsers";
// Only if this page actually exists
import AdminAnalytics from "./pages/AdminAnalytics";

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
        <Route path="/user-dashboard" element={<UserDashboard />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />

        <Route path="/prediction" element={<Prediction />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/recommendations" element={<Recommendations />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/heatmap" element={<Heatmap />} />
        <Route path="/alerts" element={<Alerts />} />

        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/analytics" element={<AdminAnalytics />} />

        {/* Uncomment these after creating the pages */}

        
        <Route path="/admin/predictions" element={<AdminPredictionHistory />} />
        <Route path="/admin/reports" element={<AdminReports />} />
        <Route path="/admin/alerts" element={<AdminAlerts />} />
        <Route path="/admin/notifications" element={<AdminNotifications />} />
        <Route path="/admin/users" element={<AdminUsers />} />
        

      </Routes>
    </BrowserRouter>
  );
}

export default App;