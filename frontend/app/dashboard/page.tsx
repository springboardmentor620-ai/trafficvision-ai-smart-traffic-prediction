"use client";
import { useEffect, useState } from "react";
import { getDashboardStats } from "../services/api";
import Sidebar from "../components/sidebar";
import Navbar from "../components/navbar";
export default function Dashboard() {

  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    getDashboardStats().then((data) => {
      setStats(data);
    });
  }, []);
  return (
    <div className="flex min-h-screen bg-gray-100">

      <Sidebar />

      <div className="flex-1">

        <Navbar />

        <div className="p-8">

          <h1 className="text-3xl font-bold text-black">
            TrafficVision Dashboard
          </h1>

          <div className="grid grid-cols-2 gap-6 mt-8">

            <div className="bg-white p-6 rounded-xl shadow">
              <h2 className="text-xl font-bold text-black">Vehicles</h2>
              <p className="text-4xl text-blue-600 mt-3">{stats?.total_records}</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow">
              <h2 className="text-xl font-bold text-black">Traffic Signals</h2>
              <p className="text-4xl text-green-600 mt-3">{stats?.junctions}</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow">
              <h2 className="text-xl font-bold text-black">Alerts</h2>
              <p className="text-4xl text-red-600 mt-3">{stats?.average_vehicles}</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow">
              <h2 className="text-xl font-bold text-black">Congestion</h2>
              <p className="text-4xl text-purple-600 mt-3">{stats?.maximum_vehicles}</p>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}