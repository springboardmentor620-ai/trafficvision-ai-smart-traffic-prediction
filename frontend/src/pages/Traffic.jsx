import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import {
  getAllTraffic,
  addTraffic,
  updateTraffic,
  deleteTraffic
} from "../services/trafficService";
import {
  Plus,
  Edit2,
  Trash2,
  MapPin,
  Car,
  AlertTriangle,
  Activity,
  CheckCircle,
  HelpCircle
} from "lucide-react";

function Traffic() {
  const [trafficList, setTrafficList] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    location: "",
    vehicle_count: "",
    congestion_level: "Low",
    road_status: "Open"
  });

  useEffect(() => {
    loadTraffic();
  }, []);

  const loadTraffic = async () => {
    setLoading(true);
    try {
      const data = await getAllTraffic();
      setTrafficList(Array.isArray(data) ? data : []);
      setError("");
    } catch (error) {
      console.error(error);
      setError(error.response?.data?.detail || "Unable to load traffic records.");
      setTrafficList([]);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.location || !form.vehicle_count) {
      alert("Please fill in all required fields.");
      return;
    }

    try {
      if (editingId === null) {
        await addTraffic(form);
        alert("Traffic Node Added Successfully");
      } else {
        await updateTraffic(editingId, form);
        alert("Traffic Node Updated Successfully");
        setEditingId(null);
      }

      setForm({
        location: "",
        vehicle_count: "",
        congestion_level: "Low",
        road_status: "Open"
      });
      loadTraffic();
    } catch (error) {
      console.error(error);
      setError(error.response?.data?.detail || "Unable to save the traffic record.");
    }
  };

  const handleEdit = (traffic) => {
    setEditingId(traffic.id);
    setForm({
      location: traffic.location,
      vehicle_count: traffic.vehicle_count.toString(),
      congestion_level: traffic.congestion_level,
      road_status: traffic.road_status
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to remove this traffic intersection?")) return;
    try {
      await deleteTraffic(id);
      loadTraffic();
    } catch (error) {
      console.error(error);
      setError(error.response?.data?.detail || "Unable to delete the traffic record.");
    }
  };

  const getCongestionBadge = (level) => {
    switch (level?.toLowerCase()) {
      case "high":
        return "text-red-500 bg-red-500/10 border-red-500/20";
      case "medium":
        return "text-amber-500 bg-amber-500/10 border-amber-500/20";
      default:
        return "text-emerald-500 bg-emerald-500/10 border-emerald-500/20";
    }
  };

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case "closed":
        return "text-red-400 border-red-500/20 bg-red-950/20";
      case "busy":
      case "under maintenance":
        return "text-amber-400 border-amber-500/20 bg-amber-950/20";
      default:
        return "text-emerald-400 border-emerald-500/20 bg-emerald-950/20";
    }
  };

  return (
    <Layout>
      <div className="space-y-8 animate-fade-in">
        {/* Intro */}
        <div className="glass-panel p-6 rounded-2xl">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Activity className="h-5 w-5 text-blue-500 animate-pulse" />
            Live Traffic Management
          </h2>
          <p className="text-slate-400 text-xs mt-1">
            Register new traffic intersections or modify status codes dynamically, pushing configurations to automated traffic light modules.
          </p>
        </div>

        {error && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Node Registration Form Card */}
          <div className="glass-panel p-6 rounded-2xl h-fit lg:col-span-1 space-y-6">
            <div>
              <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                <Plus className="h-4 w-4 text-blue-500" />
                {editingId ? "Modify Traffic Node" : "Register Traffic Node"}
              </h3>
              <p className="text-slate-400 text-[10px] mt-0.5">
                Set intersection location details, real-time load density indicators, and lanes configurations.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Intersection Location</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                  <input
                    type="text"
                    name="location"
                    required
                    placeholder="e.g. Junction 12 - Airport Rd"
                    value={form.location}
                    onChange={handleChange}
                    className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-700 bg-slate-800 text-slate-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Vehicle Count</label>
                <div className="relative">
                  <Car className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                  <input
                    type="number"
                    name="vehicle_count"
                    required
                    placeholder="e.g. 150"
                    value={form.vehicle_count}
                    onChange={handleChange}
                    className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-700 bg-slate-800 text-slate-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Congestion Level</label>
                  <select
                    name="congestion_level"
                    value={form.congestion_level}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-700 bg-slate-800 text-slate-200 focus:outline-none focus:border-blue-500"
                  >
                    <option>Low</option>
                    <option>Medium</option>
                    <option>High</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Road Status</label>
                  <select
                    name="road_status"
                    value={form.road_status}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-700 bg-slate-800 text-slate-200 focus:outline-none focus:border-blue-500"
                  >
                    <option>Open</option>
                    <option>Closed</option>
                    <option>Under Maintenance</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                {editingId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingId(null);
                      setForm({
                        location: "",
                        vehicle_count: "",
                        congestion_level: "Low",
                        road_status: "Open"
                      });
                    }}
                    className="flex-1 py-2 text-xs font-semibold text-slate-400 hover:text-white border border-slate-700 hover:bg-slate-800 rounded-lg transition-all"
                  >
                    Cancel
                  </button>
                )}
                <button
                  type="submit"
                  className="flex-1 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-all"
                >
                  {editingId ? "Update Node" : "Register Node"}
                </button>
              </div>
            </form>
          </div>

          {/* Active Nodes Register Table */}
          <div className="glass-panel p-6 rounded-2xl lg:col-span-2 space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-200">Active Node Registries</h3>
              <p className="text-slate-400 text-[10px] mt-0.5">
                Current active sensors broadcasting live city feeds to controllers.
              </p>
            </div>

            <div className="overflow-x-auto border border-slate-800 rounded-xl">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-900/50 text-[10px] uppercase font-bold tracking-wider text-slate-400">
                    <th className="px-4 py-3">ID</th>
                    <th className="px-4 py-3">Location</th>
                    <th className="px-4 py-3">Vehicles</th>
                    <th className="px-4 py-3">Congestion</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-800/60 text-xs text-slate-300">
                  {loading && trafficList.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center py-6 text-slate-500">Loading Nodes...</td>
                    </tr>
                  ) : trafficList.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center py-6 text-slate-500">No active nodes registered.</td>
                    </tr>
                  ) : (
                    trafficList.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-800/20 transition-colors">
                        <td className="px-4 py-3 text-slate-500 font-mono">#{item.id}</td>
                        <td className="px-4 py-3 font-semibold text-slate-200">{item.location}</td>
                        <td className="px-4 py-3 font-mono">{item.vehicle_count}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-semibold border ${getCongestionBadge(item.congestion_level)}`}>
                            {item.congestion_level}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-block px-2 py-0.5 rounded-md text-[9px] font-medium border ${getStatusBadge(item.road_status)}`}>
                            {item.road_status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right whitespace-nowrap">
                          <button
                            onClick={() => handleEdit(item)}
                            className="p-1.5 text-blue-400 hover:text-blue-300 hover:bg-slate-800/80 rounded-md transition-colors mr-1"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="p-1.5 text-red-400 hover:text-red-300 hover:bg-slate-800/80 rounded-md transition-colors"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default Traffic;