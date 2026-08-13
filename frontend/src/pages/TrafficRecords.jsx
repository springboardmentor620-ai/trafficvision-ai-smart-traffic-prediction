import { useEffect, useState, useMemo } from "react";
import api from "../api/axios";
import Layout from "../components/Layout";
import {
  Search, SlidersHorizontal, ChevronLeft, ChevronRight,
  ArrowUpDown, Edit2, Trash2, Plus, X, CheckCircle,
  AlertTriangle, Download, Eye, FileText, Database
} from "lucide-react";


export default function TrafficRecords() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter
  const [searchTerm, setSearchTerm]             = useState("");
  const [congestionFilter, setCongestionFilter] = useState("All");
  const [statusFilter, setStatusFilter]         = useState("All");
  const [sortField, setSortField]               = useState("id");
  const [sortDirection, setSortDirection]       = useState("desc");
  const [currentPage, setCurrentPage]           = useState(1);
  const itemsPerPage = 10;

  // Modals
  const [selectedDetail, setSelectedDetail]   = useState(null);
  const [editRecord, setEditRecord]           = useState(null);
  const [isModalOpen, setIsModalOpen]         = useState(false);

  const fetchTraffic = async () => {
    setLoading(true);
    try {
      const response = await api.get("/traffic/");
      setRecords(response.data);
    } catch (error) {
      console.error("Fetch traffic failed", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTraffic(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this record?")) return;
    try {
      await api.delete(`/traffic/${id}`);
      setRecords(records.filter(r => r.id !== id));
    } catch (error) {
      console.error(error);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/traffic/${editRecord.id}`, editRecord);
      setIsModalOpen(false);
      fetchTraffic();
    } catch (error) {
      console.error(error);
    }
  };

  const handleSort = (field) => {
    const isAsc = sortField === field && sortDirection === "asc";
    setSortDirection(isAsc ? "desc" : "asc");
    setSortField(field);
  };

  // Filtered & Sorted
  const processedRecords = useMemo(() => {
    return records
      .filter((r) => {
        const matchesSearch = (r.location || "").toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCongestion = congestionFilter === "All" || r.congestion_level === congestionFilter;
        const matchesStatus = statusFilter === "All" || r.road_status === statusFilter;
        return matchesSearch && matchesCongestion && matchesStatus;
      })
      .sort((a, b) => {
        let valA = a[sortField];
        let valB = b[sortField];
        if (typeof valA === "string") valA = valA.toLowerCase();
        if (typeof valB === "string") valB = valB.toLowerCase();
        if (valA < valB) return sortDirection === "asc" ? -1 : 1;
        if (valA > valB) return sortDirection === "asc" ? 1 : -1;
        return 0;
      });
  }, [records, searchTerm, congestionFilter, statusFilter, sortField, sortDirection]);

  // Pagination
  const totalPages = Math.ceil(processedRecords.length / itemsPerPage) || 1;
  const paginatedRecords = processedRecords.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Export CSV
  const exportCSV = () => {
    const headers = ["ID,Location,Vehicle Count,Congestion Level,Road Status,Latitude,Longitude"];
    const rows = processedRecords.map(r =>
      `"${r.id}","${r.location}",${r.vehicle_count},"${r.congestion_level}","${r.road_status}",${r.latitude},${r.longitude}`
    );
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Traffic_Records_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export PDF (Print formatted view)
  const exportPDF = () => {
    window.print();
  };

  return (
    <Layout>
      <div className="space-y-6 animate-fade-in print:p-0">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Database className="w-7 h-7 text-blue-400" />
              Traffic Records Repository
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Search, filter, manage and export citywide traffic records
            </p>
          </div>

          <div className="flex gap-2 flex-wrap">
            <button onClick={exportCSV}
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-slate-800 text-slate-200 border border-slate-700 hover:bg-slate-700 transition-colors">
              <Download className="w-4 h-4 text-emerald-400" /> Export CSV
            </button>
            <button onClick={exportPDF}
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-slate-800 text-slate-200 border border-slate-700 hover:bg-slate-700 transition-colors">
              <FileText className="w-4 h-4 text-purple-400" /> Export PDF
            </button>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="rounded-2xl bg-slate-900/70 border border-slate-800 p-4 flex flex-col md:flex-row gap-4 items-center justify-between print:hidden">
          {/* Search Bar */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search by location..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-3 items-center w-full md:w-auto">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
              <SlidersHorizontal className="w-4 h-4 text-slate-400" />
              <span>Filters:</span>
            </div>

            <select
              value={congestionFilter}
              onChange={(e) => { setCongestionFilter(e.target.value); setCurrentPage(1); }}
              className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-white focus:outline-none"
            >
              <option value="All">All Congestion</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
              className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-white focus:outline-none"
            >
              <option value="All">All Road Status</option>
              <option value="Open">Open</option>
              <option value="Busy">Busy</option>
              <option value="Closed">Closed</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="rounded-2xl bg-slate-900/70 border border-slate-800 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-slate-300">
              <thead className="text-xs uppercase bg-slate-900/90 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="px-6 py-4 cursor-pointer hover:text-white" onClick={() => handleSort("id")}>
                    <div className="flex items-center gap-1.5">ID <ArrowUpDown className="w-3 h-3" /></div>
                  </th>
                  <th className="px-6 py-4 cursor-pointer hover:text-white" onClick={() => handleSort("location")}>
                    <div className="flex items-center gap-1.5">Location <ArrowUpDown className="w-3 h-3" /></div>
                  </th>
                  <th className="px-6 py-4 cursor-pointer hover:text-white text-center" onClick={() => handleSort("vehicle_count")}>
                    <div className="flex items-center justify-center gap-1.5">Vehicle Count <ArrowUpDown className="w-3 h-3" /></div>
                  </th>
                  <th className="px-6 py-4 text-center">Congestion</th>
                  <th className="px-6 py-4 text-center">Road Status</th>
                  <th className="px-6 py-4 text-center print:hidden">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {loading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={6} className="h-12 bg-slate-800/30" />
                    </tr>
                  ))
                ) : paginatedRecords.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-slate-500">
                      No records match the selected criteria.
                    </td>
                  </tr>
                ) : (
                  paginatedRecords.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-400">#{r.id}</td>
                      <td className="px-6 py-4 font-semibold text-white">{r.location}</td>
                      <td className="px-6 py-4 text-center font-bold text-blue-400">{r.vehicle_count}</td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold text-white ${
                          r.congestion_level === "High" ? "bg-red-500" :
                          r.congestion_level === "Medium" ? "bg-yellow-500 text-black" : "bg-green-600"
                        }`}>
                          {r.congestion_level}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`text-xs font-semibold ${
                          r.road_status === "Closed" ? "text-red-400" :
                          r.road_status === "Busy" ? "text-amber-400" : "text-emerald-400"
                        }`}>
                          {r.road_status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center print:hidden">
                        <div className="flex items-center justify-center gap-2">
                          <button onClick={() => setSelectedDetail(r)} title="View Details"
                            className="p-2 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border border-blue-500/30 transition-colors">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button onClick={() => { setEditRecord(r); setIsModalOpen(true); }} title="Edit Record"
                            className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDelete(r.id)} title="Delete Record"
                            className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/30 transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="px-6 py-4 bg-slate-900/90 border-t border-slate-800 flex items-center justify-between print:hidden">
            <span className="text-xs text-slate-400">
              Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, processedRecords.length)} of {processedRecords.length} entries
            </span>

            <div className="flex gap-2 items-center">
              <button
                onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-40 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs font-bold text-white px-2">Page {currentPage} of {totalPages}</span>
              <button
                onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-40 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* View Details Modal */}
        {selectedDetail && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-md space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Database className="w-5 h-5 text-blue-400" /> Record #{selectedDetail.id} Details
                </h3>
                <button onClick={() => setSelectedDetail(null)} className="text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400 font-semibold">Location:</span>
                  <span className="text-white font-bold">{selectedDetail.location}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400 font-semibold">Vehicle Count:</span>
                  <span className="text-blue-400 font-bold">{selectedDetail.vehicle_count}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400 font-semibold">Congestion Level:</span>
                  <span className="text-white font-bold">{selectedDetail.congestion_level}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400 font-semibold">Road Status:</span>
                  <span className="text-emerald-400 font-bold">{selectedDetail.road_status}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400 font-semibold">Coordinates:</span>
                  <span className="text-slate-300 font-mono">{selectedDetail.latitude}, {selectedDetail.longitude}</span>
                </div>
              </div>
              <button onClick={() => setSelectedDetail(null)} className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs transition-colors">
                Close Details
              </button>
            </div>
          </div>
        )}

        {/* Edit Record Modal */}
        {isModalOpen && editRecord && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-md space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-base font-bold text-white">Edit Record #{editRecord.id}</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleUpdate} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Location</label>
                  <input
                    type="text"
                    value={editRecord.location}
                    onChange={(e) => setEditRecord({...editRecord, location: e.target.value})}
                    className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Vehicle Count</label>
                  <input
                    type="number"
                    value={editRecord.vehicle_count}
                    onChange={(e) => setEditRecord({...editRecord, vehicle_count: parseInt(e.target.value)})}
                    className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Congestion Level</label>
                  <select
                    value={editRecord.congestion_level}
                    onChange={(e) => setEditRecord({...editRecord, congestion_level: e.target.value})}
                    className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Road Status</label>
                  <select
                    value={editRecord.road_status}
                    onChange={(e) => setEditRecord({...editRecord, road_status: e.target.value})}
                    className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white"
                  >
                    <option value="Open">Open</option>
                    <option value="Busy">Busy</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>
                <button type="submit" className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs transition-colors">
                  Save Changes
                </button>
              </form>
            </div>
          </div>
        )}

      </div>
    </Layout>
  );
}