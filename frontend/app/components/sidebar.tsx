"use client";

import Link from "next/link";

export default function Sidebar() {
  return (
    <aside className="w-72 min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-blue-950 text-white shadow-2xl">

      <div className="text-center py-8 border-b border-slate-700">

        <h1 className="text-3xl font-extrabold tracking-wide">
          🚦 TrafficVision
        </h1>

        <p className="text-gray-400 text-sm mt-2">
          AI Traffic Management
        </p>

      </div>

      <nav className="mt-8 px-4 space-y-3">

        <Link href="/dashboard" className="block p-4 rounded-xl bg-blue-600 hover:bg-blue-500 hover:scale-105 duration-300 shadow-lg">
          🏠 Dashboard
        </Link>

        <Link href="#" className="block p-4 rounded-xl hover:bg-slate-700 hover:translate-x-2 duration-300">
          🚦 Live Traffic
        </Link>

        <Link href="#" className="block p-4 rounded-xl hover:bg-slate-700 hover:translate-x-2 duration-300">
          📊 Analytics
        </Link>

        <Link href="#" className="block p-4 rounded-xl hover:bg-slate-700 hover:translate-x-2 duration-300">
          👥 Users
        </Link>

        <Link href="#" className="block p-4 rounded-xl hover:bg-slate-700 hover:translate-x-2 duration-300">
          📄 Reports
        </Link>

        <Link href="#" className="block p-4 rounded-xl hover:bg-slate-700 hover:translate-x-2 duration-300">
          ⚙️ Settings
        </Link>

      </nav>

      <div className="absolute bottom-6 left-6 text-gray-400 text-sm">
        Version 1.0.0
      </div>

    </aside>
  );
}