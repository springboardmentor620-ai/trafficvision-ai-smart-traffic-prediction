import { useEffect, useState, useMemo } from "react";

import AdminLayout from "../../components/dashboard/AdminLayout";
import ZoneCard from "../../components/zones/ZoneCard";
import ZoneForm from "../../components/zones/ZoneForm";

import {
  getZones,
  createZone,
  updateZone,
  deleteZone,
} from "../../services/zones";

function ZoneManagement() {
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [editingZone, setEditingZone] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const loadZones = async () => {
    try {
      setLoading(true);
      const data = await getZones();
      setZones(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load zones", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadZones();
  }, []);

  const handleSave = async (zone) => {
    try {
      if (editingZone) {
        await updateZone(editingZone.id, zone);
      } else {
        await createZone(zone);
      }
      setOpen(false);
      setEditingZone(null);
      await loadZones();
    } catch (err) {
      console.error("Failed to save zone", err);
    }
  };

  const handleEdit = (zone) => {
    setEditingZone(zone);
    setOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to remove this traffic management zone?")) {
      try {
        await deleteZone(id);
        await loadZones();
      } catch (err) {
        console.error("Failed to delete zone", err);
      }
    }
  };

  const filteredZones = useMemo(() => {
    return (Array.isArray(zones) ? zones : []).filter((z) => {
      const name = (z?.name || "").toLowerCase();
      const city = (z?.city || "").toLowerCase();
      const status = (z?.status || "").toLowerCase();
      const term = (searchTerm || "").toLowerCase();
      const matchesSearch = name.includes(term) || city.includes(term);
      const matchesStatus =
        statusFilter === "All" || status === statusFilter.toLowerCase();
      return matchesSearch && matchesStatus;
    });
  }, [zones, searchTerm, statusFilter]);

  // Derived statistics
  const totalZones = zones.length;
  const highRiskZones = zones.filter((z) => z.status === "Heavy" || z.status === "High").length;
  const totalArterials = zones.reduce((acc, z) => acc + (z.roads || 0), 0);

  return (
    <AdminLayout
      title="Zone Management"
      subtitle="Supervise urban traffic zones, regional signal coordination sectors, and arterial grid policies"
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
              ACTIVE MANAGEMENT ZONES
            </span>
            <span style={{ fontSize: "18px" }}>🗺️</span>
          </div>
          <strong style={{ fontSize: "22px", color: "var(--text-primary)" }}>
            {totalZones} Sectors
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
              HIGH RISK SECTORS
            </span>
            <span style={{ fontSize: "18px" }}>🚨</span>
          </div>
          <strong style={{ fontSize: "22px", color: "var(--danger)" }}>
            {highRiskZones} Zones
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
              TOTAL CONNECTED ARTERIALS
            </span>
            <span style={{ fontSize: "18px" }}>🛣️</span>
          </div>
          <strong style={{ fontSize: "22px", color: "var(--primary)" }}>
            {totalArterials} Corridors
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
              AI SIGNAL POLICY
            </span>
            <span style={{ fontSize: "18px" }}>⚡</span>
          </div>
          <strong style={{ fontSize: "18px", color: "var(--success)" }}>
            Dynamic Green Wave
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
            placeholder="🔍 Search zone by sector name or city..."
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
            <option value="All">All Risk Tiers</option>
            <option value="Heavy">🔴 High Congestion Risk</option>
            <option value="Moderate">🟡 Moderate Load</option>
            <option value="Normal">🟢 Normal Free Flow</option>
          </select>
        </div>

        {/* Add Zone Action */}
        <button
          onClick={() => {
            setEditingZone(null);
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
          ➕ Add New Traffic Zone
        </button>
      </div>

      {/* Zones Card List */}
      {loading ? (
        <div style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>
          Loading traffic management sectors...
        </div>
      ) : filteredZones.length === 0 ? (
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
          No traffic management zones matched your search criteria.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {filteredZones.map((zone) => (
            <ZoneCard
              key={zone.id}
              zone={zone}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      <ZoneForm
        open={open}
        editingZone={editingZone}
        onClose={() => {
          setOpen(false);
          setEditingZone(null);
        }}
        onSave={handleSave}
      />
    </AdminLayout>
  );
}

export default ZoneManagement;