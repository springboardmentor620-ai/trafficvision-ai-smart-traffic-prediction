import { useEffect, useState } from "react";

function ZoneForm({
  open,
  editingZone,
  onClose,
  onSave,
}) {
  const [form, setForm] = useState({
    name: "",
    city: "Bengaluru",
    state: "Karnataka",
    status: "Normal",
    roads: 10,
  });

  useEffect(() => {
    if (editingZone) {
      setForm({
        name: editingZone.name || "",
        city: editingZone.city || "Bengaluru",
        state: editingZone.state || "Karnataka",
        status: editingZone.status || "Normal",
        roads: editingZone.roads || 10,
      });
    } else {
      setForm({
        name: "",
        city: "Bengaluru",
        state: "Karnataka",
        status: "Normal",
        roads: 10,
      });
    }
  }, [editingZone]);

  if (!open) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    onSave({
      ...form,
      roads: Number(form.roads) || 0,
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
          width: "90%",
          maxWidth: "500px",
          background: "var(--bg-surface)",
          color: "var(--text-primary)",
          borderRadius: "14px",
          padding: "28px",
          border: "1px solid var(--border-color)",
          boxShadow: "var(--shadow-lg)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <h2 style={{ color: "var(--text-primary)", margin: 0, fontSize: "18px", fontWeight: "700" }}>
            {editingZone ? "✏️ Edit Traffic Zone" : "➕ Add Traffic Management Zone"}
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
              Zone / Sector Name *
            </label>
            <input
              required
              placeholder="e.g. East IT Corridor (Whitefield & Bellandur)"
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
                Congestion Risk Level
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
                <option value="Normal">🟢 Normal Flow (Low Risk)</option>
                <option value="Moderate">🟡 Moderate Load (Medium Risk)</option>
                <option value="Heavy">🔴 Heavy Congestion (High Risk)</option>
              </select>
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "6px", fontSize: "13px", fontWeight: "600", color: "var(--text-secondary)" }}>
                Connected Arterial Roads
              </label>
              <input
                type="number"
                min="1"
                max="100"
                placeholder="12"
                value={form.roads}
                onChange={(e) => setForm({ ...form, roads: e.target.value })}
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
              {editingZone ? "Update Zone" : "Save Zone"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ZoneForm;