"use client";

import { useRouter } from "next/navigation";
import { logout } from "../utils/auth";

export default function Dashboard() {
  const router = useRouter();

  function handleLogout() {
    logout();
    router.push("/login");
  }

  return (
    <div className="min-h-screen bg-slate-100">

      {/* Navbar */}
      <nav className="bg-blue-700 text-white flex justify-between items-center px-8 py-4 shadow-lg">
        <h1 className="text-2xl font-bold">
          🚦 TrafficVision AI
        </h1>

        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg"
        >
          Logout
        </button>
      </nav>

      {/* Main Content */}
      <div className="p-8">

        <h2 className="text-3xl font-bold text-gray-800 mb-6">
          Dashboard
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-semibold text-blue-600">
              👤 User
            </h3>

            <p className="mt-3 text-gray-700">
              Logged in Successfully
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-semibold text-green-600">
              🔐 Authentication
            </h3>

            <p className="mt-3 text-gray-700">
              JWT Enabled
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-semibold text-red-600">
              🚦 Backend
            </h3>

            <p className="mt-3 text-gray-700">
              Connected Successfully
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}