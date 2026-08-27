import { useEffect, useState, useMemo } from "react";

import AdminLayout from "../../components/dashboard/AdminLayout";
import RoadCard from "../../components/roads/RoadCard";
import RoadForm from "../../components/roads/RoadForm";

import {
  getRoads,
  createRoad,
  updateRoad,
  deleteRoad,
} from "../../services/roads";

function RoadManagement() {
  const [roads, setRoads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [editingRoad, setEditingRoad] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const loadRoads = async () => {
    try {
      setLoading(true);
      const data = await getRoads();
      setRoads(data);
    } catch (err) {
      console.error("Failed to load roads", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRoads();
  }, []);

  const handleSave = async (road) => {
    try {
      if (editingRoad) {
        await updateRoad(editingRoad.id, road);
      } else {
        await createRoad(road);
      }
      setOpen(false);
      setEditingRoad(null);
      await loadRoads();
    } catch (err) {
      console.error("Failed to save road", err);
    }
  };

  const handleEdit = (road) => {
    setEditingRoad(road);
    setOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to remove this road corridor from telemetry tracking?")) {
      try {
        await deleteRoad(id);
        await loadRoads();
      } catch (err) {
        console.error("Failed to delete road", err);
      }
    }
  };

  // Filtered roads based on search and status
  const filteredRoads = useMemo(() => {
    return roads.filter((r) => {
      const matchesSearch =
        r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.city.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus =
        statusFilter === "All" || r.status.toLowerCase() === statusFilter.toLowerCase();
      return matchesSearch && matchesStatus;
    });
  }, [roads, searchTerm, statusFilter]);

  // Derived statistics
  const totalRoads = roads.length;
  const heavyRoads = roads.filter((r) => r.status === "Heavy").length;
  const normalRoads = roads.filter((r) => r.status === "Normal").length;
  const avgSpeedLimit =
    totalRoads > 0
      ? Math.round(roads.reduce((acc, r) => acc + (r.speed_limit || 60), 0) / totalRoads)
      : 60;

  return (
    <AdminLayout
      title="Road Management"
      subtitle="Configure, monitor, and manage arterial roadway corridors, speed limits, and telemetry nodes"
    >
      {/* Top Metric Summary Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "16px",
          marginBottom: "24px",
        }}
      >
        <div
          style={{
            background: "var(--bg-surface)",
            padding: "18px 22px",
            borderRadius: "14px",
            border: "1px solid var(--border-color)",
            boxShadow: "var(--shadow-sm)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
            <span style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: "600" }}>
              MONITORED CORRIDORS
            </span>
            <span style={{ fontSize: "18px" }}>🛣️</span>
          </div>
          <strong style={{ fontSize: "22px", color: "var(--text-primary)" }}>
            {totalRoads} Corridors
          </strong>
        </div>

        <div
          style={{
            background: "var(--bg-surface)",
            padding: "18px 22px",
            borderRadius: "14px",
            border: "1px solid var(--border-color)",
            boxShadow: "var(--shadow-sm)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
            <span style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: "600" }}>
              AVG SPEED LIMIT
            </span>
            <span style={{ fontSize: "18px" }}>⚡</span>
          </div>
          <strong style={{ fontSize: "22px", color: "var(--primary)" }}>
            {avgSpeedLimit} km/h
          </strong>
        </div>

        <div
          style={{
            background: "var(--bg-surface)",
            padding: "18px 22px",
            borderRadius: "14px",
            border: "1px solid var(--border-color)",
            boxShadow: "var(--shadow-sm)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
            <span style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: "600" }}>
              HIGH DENSITY / HEAVY
            </span>
            <span style={{ fontSize: "18px" }}>🚨</span>
          </div>
          <strong style={{ fontSize: "22px", color: "var(--danger)" }}>
            {heavyRoads} Corridors
          </strong>
        </div>

        <div
          style={{
            background: "var(--bg-surface)",
            padding: "18px 22px",
            borderRadius: "14px",
            border: "1px solid var(--border-color)",
            boxShadow: "var(--shadow-sm)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
            <span style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: "600" }}>
              FREE FLOWING / NORMAL
            </span>
            <span style={{ fontSize: "18px" }}>🟢</span>
          </div>
          <strong style={{ fontSize: "22px", color: "var(--success)" }}>
            {normalRoads} Corridors
          </strong>
        </div>
      </div>

      {/* Action & Filter Toolbar */}
      <div
        style={{
          background: "var(--bg-surface)",
          padding: "18px 24px",
          borderRadius: "14px",
          border: "1px solid var(--border-color)",
          boxShadow: "var(--shadow-sm)",
          marginBottom: "24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "16px",
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "flex", gap: "12px", flex: 1, minWidth: "280px", flexWrap: "wrap" }}>
          {/* Search Box */}
          <input
            placeholder="🔍 Search corridor by name or city..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              flex: 1,
              minWidth: "200px",
              height: "40px",
              padding: "0 14px",
              borderRadius: "8px",
              border: "1px solid var(--border-color)",
              backgroundColor: "var(--bg-input)",
              color: "var(--text-primary)",
              fontSize: "14px",
            }}
          />

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              height: "40px",
              padding: "0 14px",
              borderRadius: "8px",
              border: "1px solid var(--border-color)",
              backgroundColor: "var(--bg-surface)",
              color: "var(--text-primary)",
              fontSize: "14px",
              cursor: "pointer",
            }}
          >
            <option value="All">All Traffic Statuses</option>
            <option value="Heavy">🔴 Heavy Congestion</option>
            <option value="Moderate">🟡 Moderate Load</option>
            <option value="Normal">🟢 Normal Flow</option>
          </select>
        </div>

        {/* Add Road Action */}
        <button
          onClick={() => {
            setEditingRoad(null);
            setOpen(true);
          }}
          style={{
            padding: "10px 20px",
            background: "var(--primary)",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            fontWeight: "600",
            fontSize: "14px",
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            transition: "all 0.2s",
            whiteSpace: "nowrap",
          }}
        >
          ➕ Add New Road Corridor
        </button>
      </div>

      {/* Road Cards List */}
      {loading ? (
        <div style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>
          Loading monitored roadway corridors...
        </div>
      ) : filteredRoads.length === 0 ? (
        <div
          style={{
            background: "var(--bg-surface)",
            padding: "40px",
            textAlign: "center",
            borderRadius: "14px",
            border: "1px solid var(--border-color)",
            color: "var(--text-muted)",
          }}
        >
          No road corridors matched your search criteria.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {filteredRoads.map((road) => (
            <RoadCard
              key={road.id}
              road={road}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      <RoadForm
        open={open}
        editingRoad={editingRoad}
        onClose={() => {
          setOpen(false);
          setEditingRoad(null);
        }}
        onSave={handleSave}
      />
    </AdminLayout>
  );
}

export default RoadManagement;