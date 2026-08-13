import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  BarChart3,
  Database,
  Brain,
  Map,
  Users,
  User,
  LogOut,
  TrafficCone,
  AlertTriangle,
  Siren,
  FileText,
  Layers,
  TrendingUp,
  Bell,
  Cpu,
  Gauge
} from "lucide-react";

function Sidebar({ isOpen, toggleSidebar }) {
  const location = useLocation();
  const navigate = useNavigate();

  const role = JSON.parse(
    localStorage.getItem("user") || "{}"
  ).role;

  const menuItems = [
    {
      name: "Dashboard",
      path: role === "admin"
        ? "/dashboard"
        : "/operator-dashboard",
      icon: LayoutDashboard,
      role: "any"
    },

    {
      name: "Traffic Analytics",
      path: "/analytics",
      icon: BarChart3,
      role: "any"
    },

    {
      name: "Traffic Records",
      path: "/traffic-records",
      icon: Database,
      role: "any"
    },

    {
      name: "Traffic Alerts",
      path: "/alerts",
      icon: TrafficCone,
      role: "any"
    },

    {
      name: "Notifications",
      path: "/notifications",
      icon: Bell,
      role: "any"
    },

    {
      name: "Route Planner",
      path: "/route",
      icon: Brain,
      role: "any"
    },

    {
      name: "Map Monitoring",
      path: "/map",
      icon: Map,
      role: "any"
    },

    {
      name: "AI Recommendations",
      path: "/recommendations",
      icon: Cpu,
      role: "any"
    },

    // ============================================================
    // NEW — TRAFFIC PREDICTION
    // ============================================================

    {
      name: "Traffic Prediction",
      path: "/prediction",
      icon: Gauge,
      role: "any"
    },

    {
      name: "Traffic Reports",
      path: "/ai-report",
      icon: FileText,
      role: "any"
    },

    {
      name: "User Management",
      path: "/users",
      icon: Users,
      role: "admin"
    },

    {
      name: "Profile",
      path: "/profile",
      icon: User,
      role: "any"
    }
  ];

  const secondaryItems = [
    {
      name: "Live Heatmap",
      path: "/heatmap",
      icon: Layers
    },

    {
      name: "Accident Alerts",
      path: "/accidents",
      icon: AlertTriangle
    },

    {
      name: "Emergency Response",
      path: "/emergency",
      icon: Siren
    },

    {
      name: "Traffic Trends",
      path: "/traffic-trends",
      icon: TrendingUp
    }
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("name");
    localStorage.removeItem("role");
    localStorage.removeItem("assigned_junction");
    navigate("/");
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={toggleSidebar}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 border-r border-slate-800 bg-[#0F172A]/95 backdrop-blur-md transition-transform duration-300 md:translate-x-0 overflow-y-auto ${isOpen
          ? "translate-x-0"
          : "-translate-x-full"
          }`}
      >

        {/* Brand Header */}
        <div className="flex h-16 items-center gap-2 px-6 border-b border-slate-800 sticky top-0 bg-[#0F172A] z-10">

          <TrafficCone className="h-6 w-6 text-blue-500 animate-pulse" />

          <span className="text-lg font-bold tracking-wider text-white">
            Traffic
            <span className="text-blue-500">
              Vision
            </span>
            AI
          </span>

        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-1 p-4 justify-between min-h-[calc(100vh-4rem)]">

          <div className="space-y-4">

            {/* ======================================================
                MAIN NAVIGATION
            ====================================================== */}

            <div>

              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-3 mb-2">
                Main Navigation
              </p>

              <ul className="space-y-1">

                {menuItems.map((item) => {

                  if (
                    item.role === "admin" &&
                    role !== "admin"
                  ) {
                    return null;
                  }

                  const Icon = item.icon;

                  const isActive =
                    location.pathname === item.path;

                  return (
                    <li key={item.name}>

                      <Link
                        to={item.path}
                        onClick={() => {
                          if (
                            window.innerWidth < 768
                          ) {
                            toggleSidebar();
                          }
                        }}
                        className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 group ${isActive
                          ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                          : "text-slate-400 hover:bg-slate-800/60 hover:text-white"
                          }`}
                      >

                        <Icon
                          className={`h-4 w-4 transition-transform duration-200 group-hover:scale-110 ${isActive
                            ? "text-white"
                            : "text-slate-400 group-hover:text-blue-400"
                            }`}
                        />

                        {item.name}

                      </Link>

                    </li>
                  );
                })}

              </ul>

            </div>

            {/* ======================================================
                LIVE MODULES
            ====================================================== */}

            <div>

              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-3 mb-2">
                Live Modules
              </p>

              <ul className="space-y-1">

                {secondaryItems.map((item) => {

                  const Icon = item.icon;

                  const isActive =
                    location.pathname === item.path;

                  return (
                    <li key={item.name}>

                      <Link
                        to={item.path}
                        onClick={() => {
                          if (
                            window.innerWidth < 768
                          ) {
                            toggleSidebar();
                          }
                        }}
                        className={`flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-medium transition-all duration-200 group ${isActive
                          ? "bg-slate-800 text-blue-400 font-semibold border border-slate-700"
                          : "text-slate-400 hover:bg-slate-800/40 hover:text-white"
                          }`}
                      >

                        <Icon
                          className="h-3.5 w-3.5 text-slate-400 group-hover:text-blue-400"
                        />

                        {item.name}

                      </Link>

                    </li>
                  );
                })}

              </ul>

            </div>

          </div>

          {/* ======================================================
              LOGOUT
          ====================================================== */}

          <div className="pt-4 border-t border-slate-800">

            <Link
              to="/"
              onClick={handleLogout}
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all duration-200 group"
            >

              <LogOut className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />

              Logout

            </Link>

          </div>

        </nav>

      </aside>
    </>
  );
}

export default Sidebar;