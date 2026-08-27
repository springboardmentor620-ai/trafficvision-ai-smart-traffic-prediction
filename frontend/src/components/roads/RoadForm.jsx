import { useEffect, useState } from "react";

function RoadForm({
  open,
  onClose,
  onSave,
  editingRoad,
}) {
  const [form, setForm] = useState({
    name: "",
    city: "Bengaluru",
    state: "Karnataka",
    status: "Normal",
    speed_limit: 60,
    latitude: 12.9716,
    longitude: 77.5946,
  });

  useEffect(() => {
    if (editingRoad) {
      setForm({
        name: editingRoad.name || "",
        city: editingRoad.city || "Bengaluru",
        state: editingRoad.state || "Karnataka",
        status: editingRoad.status || "Normal",
        speed_limit: editingRoad.speed_limit || 60,
        latitude: editingRoad.latitude || 12.9716,
        longitude: editingRoad.longitude || 77.5946,
      });
    } else {
      setForm({
        name: "",
        city: "Bengaluru",
        state: "Karnataka",
        status: "Normal",
        speed_limit: 60,
        latitude: 12.9716,
        longitude: 77.5946,
      });
    }
  }, [editingRoad]);

  if (!open) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    onSave({
      ...form,
      speed_limit: Number(form.speed_limit) || 60,
      latitude: Number(form.latitude) || 12.9716,
      longitude: Number(form.longitude) || 77.5946,
    });
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "var(--bg-modal-overlay, rgba(0, 0, 0, 0.7))",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 9999,
        backdropFilter: "blur(4px)",
      }}
    >
      <div
        style={{
          background: "var(--bg-surface)",
          color: "var(--text-primary)",
          width: "90%",
          maxWidth: "520px",
          borderRadius: "14px",
          padding: "28px",
          border: "1px solid var(--border-color)",
          boxShadow: "var(--shadow-lg)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <h2 style={{ color: "var(--text-primary)", margin: 0, fontSize: "18px", fontWeight: "700" }}>
            {editingRoad ? "✏️ Edit Road Corridor" : "➕ Add New Road Corridor"}
          </h2>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              color: "var(--text-muted)",
              fontSize: "18px",
              cursor: "pointer",
            }}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div>
            <label style={{ display: "block", marginBottom: "6px", fontSize: "13px", fontWeight: "600", color: "var(--text-secondary)" }}>
              Corridor Name *
            </label>
            <input
              required
              placeholder="e.g. Outer Ring Road (ORR)"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              style={{
                width: "100%",
                height: "42px",
                padding: "0 12px",
                borderRadius: "8px",
                border: "1px solid var(--border-color)",
                backgroundColor: "var(--bg-input)",
                color: "var(--text-primary)",
                fontSize: "14px",
              }}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div>
              <label style={{ display: "block", marginBottom: "6px", fontSize: "13px", fontWeight: "600", color: "var(--text-secondary)" }}>
                City
              </label>
              <input
                placeholder="e.g. Bengaluru"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                style={{
                  width: "100%",
                  height: "42px",
                  padding: "0 12px",
                  borderRadius: "8px",
                  border: "1px solid var(--border-color)",
                  backgroundColor: "var(--bg-input)",
                  color: "var(--text-primary)",
                  fontSize: "14px",
                }}
              />
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "6px", fontSize: "13px", fontWeight: "600", color: "var(--text-secondary)" }}>
                State
              </label>
              <input
                placeholder="e.g. Karnataka"
                value={form.state}
                onChange={(e) => setForm({ ...form, state: e.target.value })}
                style={{
                  width: "100%",
                  height: "42px",
                  padding: "0 12px",
                  borderRadius: "8px",
                  border: "1px solid var(--border-color)",
                  backgroundColor: "var(--bg-input)",
                  color: "var(--text-primary)",
                  fontSize: "14px",
                }}
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div>
              <label style={{ display: "block", marginBottom: "6px", fontSize: "13px", fontWeight: "600", color: "var(--text-secondary)" }}>
                Traffic Status
              </label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                style={{
                  width: "100%",
                  height: "42px",
                  padding: "0 12px",
                  borderRadius: "8px",
                  border: "1px solid var(--border-color)",
                  backgroundColor: "var(--bg-surface)",
                  color: "var(--text-primary)",
                  fontSize: "14px",
                }}
              >
                <option value="Normal">🟢 Normal Flow</option>
                <option value="Moderate">🟡 Moderate Load</option>
                <option value="Heavy">🔴 Heavy Congestion</option>
              </select>
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "6px", fontSize: "13px", fontWeight: "600", color: "var(--text-secondary)" }}>
                Speed Limit (km/h)
              </label>
              <input
                type="number"
                min="20"
                max="120"
                placeholder="60"
                value={form.speed_limit}
                onChange={(e) => setForm({ ...form, speed_limit: e.target.value })}
                style={{
                  width: "100%",
                  height: "42px",
                  padding: "0 12px",
                  borderRadius: "8px",
                  border: "1px solid var(--border-color)",
                  backgroundColor: "var(--bg-input)",
                  color: "var(--text-primary)",
                  fontSize: "14px",
                }}
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div>
              <label style={{ display: "block", marginBottom: "6px", fontSize: "13px", fontWeight: "600", color: "var(--text-secondary)" }}>
                GPS Latitude (°)
              </label>
              <input
                type="number"
                step="0.0001"
                placeholder="12.9716"
                value={form.latitude}
                onChange={(e) => setForm({ ...form, latitude: e.target.value })}
                style={{
                  width: "100%",
                  height: "42px",
                  padding: "0 12px",
                  borderRadius: "8px",
                  border: "1px solid var(--border-color)",
                  backgroundColor: "var(--bg-input)",
                  color: "var(--text-primary)",
                  fontSize: "14px",
                }}
              />
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "6px", fontSize: "13px", fontWeight: "600", color: "var(--text-secondary)" }}>
                GPS Longitude (°)
              </label>
              <input
                type="number"
                step="0.0001"
                placeholder="77.5946"
                value={form.longitude}
                onChange={(e) => setForm({ ...form, longitude: e.target.value })}
                style={{
                  width: "100%",
                  height: "42px",
                  padding: "0 12px",
                  borderRadius: "8px",
                  border: "1px solid var(--border-color)",
                  backgroundColor: "var(--bg-input)",
                  color: "var(--text-primary)",
                  fontSize: "14px",
                }}
              />
            </div>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "12px",
              marginTop: "16px",
            }}
          >
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: "10px 18px",
                borderRadius: "8px",
                border: "1px solid var(--border-color)",
                backgroundColor: "var(--bg-surface-secondary)",
                color: "var(--text-primary)",
                fontWeight: "600",
                fontSize: "14px",
                cursor: "pointer",
              }}
            >
              Cancel
            </button>

            <button
              type="submit"
              style={{
                padding: "10px 20px",
                borderRadius: "8px",
                border: "none",
                backgroundColor: "var(--primary)",
                color: "#ffffff",
                fontWeight: "600",
                fontSize: "14px",
                cursor: "pointer",
              }}
            >
              {editingRoad ? "Update Road" : "Save Road"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default RoadForm;