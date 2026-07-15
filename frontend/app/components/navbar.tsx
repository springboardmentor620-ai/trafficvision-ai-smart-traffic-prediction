"use client";

export default function Navbar() {
  return (
    <nav className="h-16 bg-gradient-to-r from-blue-700 via-cyan-600 to-blue-900 flex items-center justify-between px-8 shadow-xl">

      <h1 className="text-3xl font-bold text-white tracking-wide hover:scale-105 duration-300">
        🚦 TrafficVision AI
      </h1>

      <div className="flex items-center gap-5">

        <div className="flex items-center gap-2 text-white">
          <span className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></span>
          Online
        </div>

        <div className="text-white font-semibold">
          👤 Hima Bindu
        </div>

        <button className="bg-red-500 hover:bg-red-700 hover:scale-110 duration-300 px-5 py-2 rounded-xl text-white shadow-lg">
          Logout
        </button>

      </div>

    </nav>
  );
}