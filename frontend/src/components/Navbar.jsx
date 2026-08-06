import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Menu,
  Bell,
  User,
  LogOut,
  Shield,
  ChevronDown
} from "lucide-react";

function Navbar({ toggleSidebar }) {

  const navigate = useNavigate();
  const location = useLocation();

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const name = user.name || "Operator";
  const role = user.role || "operator";

  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const [notifications, setNotifications] = useState([]);

  useEffect(() => {

    loadNotifications();

  }, []);

  const loadNotifications = async () => {

    try {

      const response = await fetch(
        "http://127.0.0.1:8000/notifications/?limit=10"
      );

      const data = await response.json();

      // GET /notifications/ returns { unread_count, total_count, notifications: [...] },
      // not a bare array — using `data` directly here used to make
      // notifications.map(...) throw as soon as the dropdown was opened.
      setNotifications(data.notifications || []);

    }

    catch (error) {

      console.log(error);

    }

  };

  const getPageTitle = () => {

    switch (location.pathname) {

      case "/dashboard":
        return "Control Center Dashboard";

      case "/analytics":
        return "Traffic Insights & Analytics";

      case "/traffic-records":
        return "System Traffic Records";

      case "/traffic":
        return "Live Traffic Management";

      case "/route":
        return "AI Route & Congestion Predictor";

      case "/map":
        return "Smart City Map Monitoring";

      case "/users":
        return "Admin User Console";

      case "/profile":
        return "User Profile Settings";

      default:
        return "TrafficVisionAI Monitor";

    }

  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  const getDotColor = (type) => {

    if (type === "Accident")
      return "bg-red-500 animate-pulse";

    if (type === "Congestion")
      return "bg-yellow-500";

    return "bg-blue-500";

  };

  return (

    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-800 bg-[#0F172A]/85 backdrop-blur-md px-6 shadow-sm">

      {/* Left */}

      <div className="flex items-center gap-4">

        <button
          onClick={toggleSidebar}
          className="text-slate-400 hover:text-white md:hidden"
        >

          <Menu className="h-6 w-6" />

        </button>

        <h1 className="text-lg font-semibold text-slate-100 hidden sm:block">

          {getPageTitle()}

        </h1>

      </div>

      {/* Right */}

      <div className="flex items-center gap-4">

        {/* Notification */}

        <div className="relative">

          <button

            onClick={() => {

              setShowNotifications(!showNotifications);
              setShowProfileDropdown(false);

            }}

            className="relative p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"

          >

            <Bell className="h-5 w-5" />

            {

              notifications.length > 0 &&

              <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500"></span>

            }

          </button>

          {

            showNotifications &&

            <div className="absolute right-0 mt-2 w-80 rounded-xl border border-slate-700 bg-slate-900 shadow-xl z-50">

              <div className="flex justify-between items-center border-b border-slate-700 p-3">

                <span className="text-white font-semibold">

                  Notifications

                </span>

                <button

                  className="text-blue-400 text-xs"

                  onClick={() => setNotifications([])}

                >

                  Clear All

                </button>

              </div>

              <div className="max-h-72 overflow-y-auto">

                {

                  notifications.length === 0 ?

                    <p className="text-center text-slate-500 py-5">

                      No Notifications

                    </p>

                    :

                    notifications.map((notif) => (

                      <div

                        key={notif.id}

                        className="border-b border-slate-800 p-3 hover:bg-slate-800"

                      >

                        <div className="flex items-center gap-2">

                          <span

                            className={`h-3 w-3 rounded-full ${getDotColor(notif.type)}`}

                          ></span>

                          <span className="font-semibold text-white">

                            {notif.type}

                          </span>

                        </div>

                        <p className="text-slate-300 mt-2">

                          {notif.title}

                        </p>

                        <p className="text-slate-400 text-sm">

                          {notif.message}

                        </p>

                        <p className="text-blue-400 text-xs mt-1">

                          {notif.timestamp ? new Date(notif.timestamp).toLocaleTimeString() : ""}

                        </p>

                      </div>

                    ))

                }

              </div>

            </div>

          }

        </div>

        {/* Profile */}

        <div className="relative">

          <button

            onClick={() => {

              setShowProfileDropdown(!showProfileDropdown);
              setShowNotifications(false);

            }}

            className="flex items-center gap-2"

          >

            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white">

              {name.charAt(0).toUpperCase()}

            </div>

            <div className="hidden md:flex flex-col">

              <span className="text-white text-sm">

                {name}

              </span>

              <span className="text-xs text-slate-400 capitalize">

                {role}

              </span>

            </div>

            <ChevronDown className="h-4 w-4 text-slate-400" />

          </button>

          {

            showProfileDropdown &&

            <div className="absolute right-0 mt-2 w-48 rounded-xl border border-slate-700 bg-slate-900 shadow-xl">

              <div className="p-3 border-b border-slate-700">

                <p className="text-xs text-slate-400">

                  Signed in as

                </p>

                <p className="text-white">

                  {name}

                </p>

                <div className="flex items-center gap-1 mt-1">

                  <Shield className="h-3 w-3 text-blue-400" />

                  <span className="text-xs text-blue-400">

                    {role}

                  </span>

                </div>

              </div>

              <Link

                to="/profile"

                className="flex items-center gap-2 px-3 py-2 text-slate-300 hover:bg-slate-800"

              >

                <User className="h-4 w-4" />

                My Profile

              </Link>

              <button

                onClick={handleLogout}

                className="flex w-full items-center gap-2 px-3 py-2 text-red-400 hover:bg-red-500/10"

              >

                <LogOut className="h-4 w-4" />

                Logout

              </button>

            </div>

          }

        </div>

      </div>

    </header>

  );

}

export default Navbar;