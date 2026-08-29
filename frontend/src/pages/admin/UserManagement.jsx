import { useEffect, useState, useMemo } from "react";
import AdminLayout from "../../components/dashboard/AdminLayout";
import {
  getUsers,
  getUserStats,
  createUser,
  updateUser,
  deleteUser,
  getCurrentUser,
} from "../../services/user";

function UserManagement() {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({
    total_users: 0,
    admin_count: 0,
    operator_count: 0,
    commuter_count: 0,
  });
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");

  // Modal States
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Form States
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "traffic_operator",
  });
  const [formError, setFormError] = useState("");
  const [formLoading, setFormLoading] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState({ text: "", type: "" });

  const loadData = async () => {
    try {
      setLoading(true);
      const [usersData, statsData, meData] = await Promise.all([
        getUsers(),
        getUserStats().catch(() => null),
        getCurrentUser().catch(() => null),
      ]);

      setUsers(usersData || []);
      if (statsData) {
        setStats(statsData);
      } else {
        // Fallback compute
        setStats({
          total_users: (usersData || []).length,
          admin_count: (usersData || []).filter((u) => u.role === "admin").length,
          operator_count: (usersData || []).filter((u) => u.role === "traffic_operator").length,
          commuter_count: (usersData || []).filter((u) => u.role === "commuter").length,
        });
      }
      if (meData) setCurrentUser(meData);
    } catch (err) {
      console.error("Failed to load user management data", err);
      showFeedback("Failed to load user accounts from server.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const showFeedback = (text, type = "success") => {
    setFeedbackMsg({ text, type });
    setTimeout(() => {
      setFeedbackMsg({ text: "", type: "" });
    }, 4500);
  };

  const handleOpenCreate = () => {
    setFormData({
      name: "",
      email: "",
      password: "",
      role: "traffic_operator",
    });
    setFormError("");
    setIsCreateOpen(true);
  };

  const handleOpenEdit = (user) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: "",
      role: user.role,
    });
    setFormError("");
    setIsEditOpen(true);
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!formData.name.trim() || !formData.email.trim() || !formData.password.trim()) {
      setFormError("All fields (Name, Email, Password) are required.");
      return;
    }

    try {
      setFormLoading(true);
      await createUser({
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        role: formData.role,
      });
      setIsCreateOpen(false);
      showFeedback(`User account '${formData.name}' created successfully!`, "success");
      await loadData();
    } catch (err) {
      const msg = err.response?.data?.detail || "Failed to create user account.";
      setFormError(typeof msg === "string" ? msg : JSON.stringify(msg));
    } finally {
      setFormLoading(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!formData.name.trim() || !formData.email.trim()) {
      setFormError("Name and Email are required.");
      return;
    }

    const payload = {
      name: formData.name.trim(),
      email: formData.email.trim().toLowerCase(),
      role: formData.role,
    };

    if (formData.password.trim()) {
      payload.password = formData.password.trim();
    }

    try {
      setFormLoading(true);
      await updateUser(editingUser.id, payload);
      setIsEditOpen(false);
      setEditingUser(null);
      showFeedback(`User account '${formData.name}' updated successfully!`, "success");
      await loadData();
    } catch (err) {
      const msg = err.response?.data?.detail || "Failed to update user account.";
      setFormError(typeof msg === "string" ? msg : JSON.stringify(msg));
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;

    try {
      setFormLoading(true);
      await deleteUser(deleteTarget.id);
      showFeedback(`User '${deleteTarget.name}' has been deleted.`, "success");
      setDeleteTarget(null);
      await loadData();
    } catch (err) {
      const msg = err.response?.data?.detail || "Failed to delete user.";
      showFeedback(typeof msg === "string" ? msg : "Delete operation failed", "error");
    } finally {
      setFormLoading(false);
    }
  };

  // Filtered users
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchesSearch =
        (u.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (u.email || "").toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole =
        roleFilter === "All" || u.role.toLowerCase() === roleFilter.toLowerCase();
      return matchesSearch && matchesRole;
    });
  }, [users, searchTerm, roleFilter]);

  const getRoleBadgeStyle = (role) => {
    switch (role) {
      case "admin":
        return {
          bg: "rgba(147, 51, 234, 0.12)",
          color: "#9333ea",
          border: "1px solid rgba(147, 51, 234, 0.3)",
          label: "🛡️ System Admin",
        };
      case "traffic_operator":
        return {
          bg: "rgba(37, 99, 235, 0.12)",
          color: "#2563eb",
          border: "1px solid rgba(37, 99, 235, 0.3)",
          label: "🚦 Traffic Operator",
        };
      case "commuter":
        return {
          bg: "rgba(16, 185, 129, 0.12)",
          color: "#10b981",
          border: "1px solid rgba(16, 185, 129, 0.3)",
          label: "🚗 Public Commuter",
        };
      default:
        return {
          bg: "rgba(100, 116, 139, 0.12)",
          color: "#64748b",
          border: "1px solid rgba(100, 116, 139, 0.3)",
          label: role,
        };
    }
  };

  return (
    <AdminLayout
      title="User & Access Management"
      subtitle="Govern system-wide users, grant operator/admin privileges, manage credentials, and audit access permissions."
    >
      {/* Toast Notification */}
      {feedbackMsg.text && (
        <div
          style={{
            padding: "14px 20px",
            marginBottom: "20px",
            borderRadius: "10px",
            backgroundColor:
              feedbackMsg.type === "error"
                ? "rgba(239, 68, 68, 0.12)"
                : "rgba(16, 185, 129, 0.12)",
            color:
              feedbackMsg.type === "error" ? "var(--danger)" : "var(--success)",
            border: `1px solid ${
              feedbackMsg.type === "error"
                ? "rgba(239, 68, 68, 0.3)"
                : "rgba(16, 185, 129, 0.3)"
            }`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: "14px",
            fontWeight: "600",
            animation: "fadeIn 0.3s ease",
          }}
        >
          <span>
            {feedbackMsg.type === "error" ? "⚠️ " : "✅ "}
            {feedbackMsg.text}
          </span>
          <button
            onClick={() => setFeedbackMsg({ text: "", type: "" })}
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              fontSize: "16px",
              color: "inherit",
            }}
          >
            ✕
          </button>
        </div>
      )}

      {/* KPI Stats Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "16px",
          marginBottom: "28px",
        }}
      >
        {/* Card 1: Total Users */}
        <div
          style={{
            background: "var(--bg-surface)",
            padding: "20px",
            borderRadius: "14px",
            border: "1px solid var(--border-color)",
            boxShadow: "var(--shadow-sm)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              color: "var(--text-muted)",
              fontSize: "12px",
              fontWeight: "700",
              textTransform: "uppercase",
              marginBottom: "8px",
            }}
          >
            <span>Total Registered Users</span>
            <span>👥</span>
          </div>
          <strong style={{ fontSize: "28px", color: "var(--text-primary)" }}>
            {stats.total_users}
          </strong>
          <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "4px" }}>
            Across all security clearance roles
          </div>
        </div>

        {/* Card 2: System Admins */}
        <div
          style={{
            background: "var(--bg-surface)",
            padding: "20px",
            borderRadius: "14px",
            border: "1px solid var(--border-color)",
            boxShadow: "var(--shadow-sm)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              color: "var(--text-muted)",
              fontSize: "12px",
              fontWeight: "700",
              textTransform: "uppercase",
              marginBottom: "8px",
            }}
          >
            <span>System Administrators</span>
            <span>🛡️</span>
          </div>
          <strong style={{ fontSize: "28px", color: "#9333ea" }}>
            {stats.admin_count}
          </strong>
          <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "4px" }}>
            Full system & topology governance
          </div>
        </div>

        {/* Card 3: Traffic Operators */}
        <div
          style={{
            background: "var(--bg-surface)",
            padding: "20px",
            borderRadius: "14px",
            border: "1px solid var(--border-color)",
            boxShadow: "var(--shadow-sm)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              color: "var(--text-muted)",
              fontSize: "12px",
              fontWeight: "700",
              textTransform: "uppercase",
              marginBottom: "8px",
            }}
          >
            <span>Traffic Operators</span>
            <span>🚦</span>
          </div>
          <strong style={{ fontSize: "28px", color: "#2563eb" }}>
            {stats.operator_count}
          </strong>
          <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "4px" }}>
            AI prediction & signal telemetry control
          </div>
        </div>

        {/* Card 4: Commuters */}
        <div
          style={{
            background: "var(--bg-surface)",
            padding: "20px",
            borderRadius: "14px",
            border: "1px solid var(--border-color)",
            boxShadow: "var(--shadow-sm)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              color: "var(--text-muted)",
              fontSize: "12px",
              fontWeight: "700",
              textTransform: "uppercase",
              marginBottom: "8px",
            }}
          >
            <span>Public Commuters</span>
            <span>🚗</span>
          </div>
          <strong style={{ fontSize: "28px", color: "var(--success)" }}>
            {stats.commuter_count}
          </strong>
          <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "4px" }}>
            Mobility portal & navigation users
          </div>
        </div>
      </div>

      {/* Toolbar: Search, Role Filter, Add User */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "14px",
          marginBottom: "20px",
          padding: "16px 20px",
          backgroundColor: "var(--bg-surface)",
          borderRadius: "14px",
          border: "1px solid var(--border-color)",
        }}
      >
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", flex: 1 }}>
          {/* Search Box */}
          <div style={{ position: "relative", minWidth: "260px", flex: 1 }}>
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 14px 10px 36px",
                borderRadius: "8px",
                border: "1px solid var(--border-color)",
                backgroundColor: "var(--bg-page)",
                color: "var(--text-primary)",
                fontSize: "13px",
                outline: "none",
              }}
            />
            <span
              style={{
                position: "absolute",
                left: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "var(--text-muted)",
                fontSize: "14px",
              }}
            >
              🔍
            </span>
          </div>

          {/* Role Filter Dropdown */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            style={{
              padding: "10px 16px",
              borderRadius: "8px",
              border: "1px solid var(--border-color)",
              backgroundColor: "var(--bg-page)",
              color: "var(--text-primary)",
              fontSize: "13px",
              fontWeight: "600",
              cursor: "pointer",
              outline: "none",
            }}
          >
            <option value="All">All Roles ({users.length})</option>
            <option value="admin">System Admin ({stats.admin_count})</option>
            <option value="traffic_operator">Traffic Operator ({stats.operator_count})</option>
            <option value="commuter">Public Commuter ({stats.commuter_count})</option>
          </select>

          {/* Refresh Button */}
          <button
            onClick={loadData}
            style={{
              padding: "10px 16px",
              borderRadius: "8px",
              border: "1px solid var(--border-color)",
              backgroundColor: "var(--bg-page)",
              color: "var(--text-primary)",
              fontSize: "13px",
              fontWeight: "600",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            🔄 Refresh
          </button>
        </div>

        {/* Create User Button */}
        <button
          onClick={handleOpenCreate}
          style={{
            padding: "10px 20px",
            borderRadius: "8px",
            border: "none",
            backgroundColor: "var(--primary)",
            color: "#ffffff",
            fontSize: "13px",
            fontWeight: "700",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            boxShadow: "0 2px 8px rgba(37, 99, 235, 0.3)",
          }}
        >
          <span>➕</span>
          <span>Create New User</span>
        </button>
      </div>

      {/* Users Table / Grid */}
      <div
        style={{
          backgroundColor: "var(--bg-surface)",
          borderRadius: "16px",
          border: "1px solid var(--border-color)",
          boxShadow: "var(--shadow-sm)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "18px 24px",
            borderBottom: "1px solid var(--border-color)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "700", color: "var(--text-primary)" }}>
              User Directory ({filteredUsers.length})
            </h3>
            <p style={{ margin: "2px 0 0 0", fontSize: "12px", color: "var(--text-muted)" }}>
              Active accounts configured with role-based access control (RBAC).
            </p>
          </div>
        </div>

        {loading ? (
          <div style={{ padding: "48px", textAlign: "center", color: "var(--text-muted)" }}>
            <p style={{ fontSize: "15px", fontWeight: "600" }}>Loading user directory...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div style={{ padding: "48px", textAlign: "center", color: "var(--text-muted)" }}>
            <p style={{ fontSize: "16px", fontWeight: "600" }}>No user accounts found.</p>
            <p style={{ fontSize: "13px" }}>
              {searchTerm || roleFilter !== "All"
                ? "Try adjusting your search criteria or role filters."
                : "Click 'Create New User' to add the first user account."}
            </p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: "13px",
                textAlign: "left",
              }}
            >
              <thead>
                <tr
                  style={{
                    borderBottom: "2px solid var(--border-color)",
                    color: "var(--text-muted)",
                    backgroundColor: "rgba(0, 0, 0, 0.02)",
                  }}
                >
                  <th style={{ padding: "14px 20px" }}>User</th>
                  <th style={{ padding: "14px 20px" }}>Email Address</th>
                  <th style={{ padding: "14px 20px" }}>Access Role</th>
                  <th style={{ padding: "14px 20px" }}>User ID</th>
                  <th style={{ padding: "14px 20px", textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => {
                  const badge = getRoleBadgeStyle(user.role);
                  const isSelf = currentUser && currentUser.id === user.id;

                  return (
                    <tr
                      key={user.id}
                      style={{
                        borderBottom: "1px solid var(--border-color)",
                        transition: "background-color 0.15s ease",
                      }}
                    >
                      {/* Name & Avatar */}
                      <td style={{ padding: "14px 20px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                          <div
                            style={{
                              width: "36px",
                              height: "36px",
                              borderRadius: "50%",
                              backgroundColor: badge.bg,
                              color: badge.color,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontWeight: "700",
                              fontSize: "14px",
                              border: badge.border,
                            }}
                          >
                            {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                          </div>
                          <div>
                            <div
                              style={{
                                fontWeight: "700",
                                color: "var(--text-primary)",
                                display: "flex",
                                alignItems: "center",
                                gap: "6px",
                              }}
                            >
                              <span>{user.name}</span>
                              {isSelf && (
                                <span
                                  style={{
                                    fontSize: "10px",
                                    padding: "2px 6px",
                                    borderRadius: "4px",
                                    backgroundColor: "rgba(16, 185, 129, 0.12)",
                                    color: "var(--success)",
                                    fontWeight: "700",
                                  }}
                                >
                                  You
                                </span>
                              )}
                            </div>
                            <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                              ID #{user.id}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td style={{ padding: "14px 20px", color: "var(--text-primary)", fontWeight: "500" }}>
                        {user.email}
                      </td>

                      {/* Role */}
                      <td style={{ padding: "14px 20px" }}>
                        <span
                          style={{
                            display: "inline-block",
                            padding: "4px 10px",
                            borderRadius: "6px",
                            backgroundColor: badge.bg,
                            color: badge.color,
                            border: badge.border,
                            fontSize: "12px",
                            fontWeight: "700",
                          }}
                        >
                          {badge.label}
                        </span>
                      </td>

                      {/* System Info */}
                      <td style={{ padding: "14px 20px", color: "var(--text-muted)" }}>
                        <code>#{user.id}</code>
                      </td>

                      {/* Action Buttons */}
                      <td style={{ padding: "14px 20px", textAlign: "right" }}>
                        <div style={{ display: "inline-flex", gap: "8px" }}>
                          <button
                            onClick={() => handleOpenEdit(user)}
                            style={{
                              padding: "6px 12px",
                              borderRadius: "6px",
                              border: "1px solid var(--border-color)",
                              backgroundColor: "var(--bg-page)",
                              color: "var(--text-primary)",
                              fontSize: "12px",
                              fontWeight: "600",
                              cursor: "pointer",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "4px",
                            }}
                            title="Edit Role or Credentials"
                          >
                            <span>✏️</span>
                            <span>Edit</span>
                          </button>

                          <button
                            onClick={() => setDeleteTarget(user)}
                            disabled={isSelf}
                            style={{
                              padding: "6px 12px",
                              borderRadius: "6px",
                              border: isSelf
                                ? "1px solid var(--border-color)"
                                : "1px solid rgba(239, 68, 68, 0.3)",
                              backgroundColor: isSelf
                                ? "var(--bg-page)"
                                : "rgba(239, 68, 68, 0.08)",
                              color: isSelf ? "var(--text-muted)" : "var(--danger)",
                              fontSize: "12px",
                              fontWeight: "600",
                              cursor: isSelf ? "not-allowed" : "pointer",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "4px",
                              opacity: isSelf ? 0.5 : 1,
                            }}
                            title={isSelf ? "You cannot delete your own admin account" : "Delete User Account"}
                          >
                            <span>🗑️</span>
                            <span>Delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: Create User */}
      {isCreateOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0, 0, 0, 0.6)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "20px",
          }}
        >
          <div
            style={{
              backgroundColor: "var(--bg-surface)",
              borderRadius: "16px",
              border: "1px solid var(--border-color)",
              width: "100%",
              maxWidth: "500px",
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.3)",
              overflow: "hidden",
              animation: "scaleUp 0.2s ease",
            }}
          >
            <div
              style={{
                padding: "20px 24px",
                borderBottom: "1px solid var(--border-color)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "700", color: "var(--text-primary)" }}>
                ➕ Create Privileged User
              </h3>
              <button
                onClick={() => setIsCreateOpen(false)}
                style={{
                  background: "transparent",
                  border: "none",
                  fontSize: "18px",
                  color: "var(--text-muted)",
                  cursor: "pointer",
                }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} style={{ padding: "24px" }}>
              {formError && (
                <div
                  style={{
                    padding: "10px 14px",
                    borderRadius: "8px",
                    backgroundColor: "rgba(239, 68, 68, 0.12)",
                    color: "var(--danger)",
                    border: "1px solid rgba(239, 68, 68, 0.3)",
                    fontSize: "13px",
                    fontWeight: "600",
                    marginBottom: "16px",
                  }}
                >
                  ⚠️ {formError}
                </div>
              )}

              <div style={{ marginBottom: "16px" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "13px",
                    fontWeight: "600",
                    color: "var(--text-primary)",
                    marginBottom: "6px",
                  }}
                >
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Indiranagar Corridor Operator"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: "8px",
                    border: "1px solid var(--border-color)",
                    backgroundColor: "var(--bg-page)",
                    color: "var(--text-primary)",
                    fontSize: "14px",
                    outline: "none",
                  }}
                />
              </div>

              <div style={{ marginBottom: "16px" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "13px",
                    fontWeight: "600",
                    color: "var(--text-primary)",
                    marginBottom: "6px",
                  }}
                >
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. operator2@trafficvision.ai"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: "8px",
                    border: "1px solid var(--border-color)",
                    backgroundColor: "var(--bg-page)",
                    color: "var(--text-primary)",
                    fontSize: "14px",
                    outline: "none",
                  }}
                />
              </div>

              <div style={{ marginBottom: "16px" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "13px",
                    fontWeight: "600",
                    color: "var(--text-primary)",
                    marginBottom: "6px",
                  }}
                >
                  Account Password
                </label>
                <input
                  type="password"
                  required
                  placeholder="Enter secure initial password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: "8px",
                    border: "1px solid var(--border-color)",
                    backgroundColor: "var(--bg-page)",
                    color: "var(--text-primary)",
                    fontSize: "14px",
                    outline: "none",
                  }}
                />
              </div>

              <div style={{ marginBottom: "24px" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "13px",
                    fontWeight: "600",
                    color: "var(--text-primary)",
                    marginBottom: "6px",
                  }}
                >
                  Assign Role & Security Clearance
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: "8px",
                    border: "1px solid var(--border-color)",
                    backgroundColor: "var(--bg-page)",
                    color: "var(--text-primary)",
                    fontSize: "14px",
                    fontWeight: "600",
                    outline: "none",
                    cursor: "pointer",
                  }}
                >
                  <option value="traffic_operator">🚦 Traffic Operator (Simulate ML, CCTV, Route Rerouting)</option>
                  <option value="admin">🛡️ System Administrator (Full City Grid & User Governance)</option>
                  <option value="commuter">🚗 Public Commuter (Citizen Mobility & City Traffic Map)</option>
                </select>
                <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "6px" }}>
                  {formData.role === "admin"
                    ? "Grants full administrative access including User Management, Road/Zone Topology, and all Operator modules."
                    : formData.role === "traffic_operator"
                    ? "Grants operator console, AI Congestion simulation workspace, incident dispatch, and reports."
                    : "Grants public mobility hub, live route finder, and city traffic map view."}
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  style={{
                    padding: "10px 18px",
                    borderRadius: "8px",
                    border: "1px solid var(--border-color)",
                    backgroundColor: "var(--bg-page)",
                    color: "var(--text-primary)",
                    fontSize: "13px",
                    fontWeight: "600",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  style={{
                    padding: "10px 22px",
                    borderRadius: "8px",
                    border: "none",
                    backgroundColor: "var(--primary)",
                    color: "#ffffff",
                    fontSize: "13px",
                    fontWeight: "700",
                    cursor: formLoading ? "wait" : "pointer",
                  }}
                >
                  {formLoading ? "Creating..." : "Create Account"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit User */}
      {isEditOpen && editingUser && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0, 0, 0, 0.6)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "20px",
          }}
        >
          <div
            style={{
              backgroundColor: "var(--bg-surface)",
              borderRadius: "16px",
              border: "1px solid var(--border-color)",
              width: "100%",
              maxWidth: "500px",
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.3)",
              overflow: "hidden",
              animation: "scaleUp 0.2s ease",
            }}
          >
            <div
              style={{
                padding: "20px 24px",
                borderBottom: "1px solid var(--border-color)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "700", color: "var(--text-primary)" }}>
                ✏️ Edit User #{editingUser.id}
              </h3>
              <button
                onClick={() => {
                  setIsEditOpen(false);
                  setEditingUser(null);
                }}
                style={{
                  background: "transparent",
                  border: "none",
                  fontSize: "18px",
                  color: "var(--text-muted)",
                  cursor: "pointer",
                }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleEditSubmit} style={{ padding: "24px" }}>
              {formError && (
                <div
                  style={{
                    padding: "10px 14px",
                    borderRadius: "8px",
                    backgroundColor: "rgba(239, 68, 68, 0.12)",
                    color: "var(--danger)",
                    border: "1px solid rgba(239, 68, 68, 0.3)",
                    fontSize: "13px",
                    fontWeight: "600",
                    marginBottom: "16px",
                  }}
                >
                  ⚠️ {formError}
                </div>
              )}

              <div style={{ marginBottom: "16px" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "13px",
                    fontWeight: "600",
                    color: "var(--text-primary)",
                    marginBottom: "6px",
                  }}
                >
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: "8px",
                    border: "1px solid var(--border-color)",
                    backgroundColor: "var(--bg-page)",
                    color: "var(--text-primary)",
                    fontSize: "14px",
                    outline: "none",
                  }}
                />
              </div>

              <div style={{ marginBottom: "16px" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "13px",
                    fontWeight: "600",
                    color: "var(--text-primary)",
                    marginBottom: "6px",
                  }}
                >
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: "8px",
                    border: "1px solid var(--border-color)",
                    backgroundColor: "var(--bg-page)",
                    color: "var(--text-primary)",
                    fontSize: "14px",
                    outline: "none",
                  }}
                />
              </div>

              <div style={{ marginBottom: "16px" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "13px",
                    fontWeight: "600",
                    color: "var(--text-primary)",
                    marginBottom: "6px",
                  }}
                >
                  Reset Password (Leave blank to keep current)
                </label>
                <input
                  type="password"
                  placeholder="Enter new password if changing"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: "8px",
                    border: "1px solid var(--border-color)",
                    backgroundColor: "var(--bg-page)",
                    color: "var(--text-primary)",
                    fontSize: "14px",
                    outline: "none",
                  }}
                />
              </div>

              <div style={{ marginBottom: "24px" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "13px",
                    fontWeight: "600",
                    color: "var(--text-primary)",
                    marginBottom: "6px",
                  }}
                >
                  Assigned Security Role
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: "8px",
                    border: "1px solid var(--border-color)",
                    backgroundColor: "var(--bg-page)",
                    color: "var(--text-primary)",
                    fontSize: "14px",
                    fontWeight: "600",
                    outline: "none",
                    cursor: "pointer",
                  }}
                >
                  <option value="traffic_operator">🚦 Traffic Operator</option>
                  <option value="admin">🛡️ System Administrator</option>
                  <option value="commuter">🚗 Public Commuter</option>
                </select>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditOpen(false);
                    setEditingUser(null);
                  }}
                  style={{
                    padding: "10px 18px",
                    borderRadius: "8px",
                    border: "1px solid var(--border-color)",
                    backgroundColor: "var(--bg-page)",
                    color: "var(--text-primary)",
                    fontSize: "13px",
                    fontWeight: "600",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  style={{
                    padding: "10px 22px",
                    borderRadius: "8px",
                    border: "none",
                    backgroundColor: "var(--primary)",
                    color: "#ffffff",
                    fontSize: "13px",
                    fontWeight: "700",
                    cursor: formLoading ? "wait" : "pointer",
                  }}
                >
                  {formLoading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Delete Confirmation */}
      {deleteTarget && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0, 0, 0, 0.6)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "20px",
          }}
        >
          <div
            style={{
              backgroundColor: "var(--bg-surface)",
              borderRadius: "16px",
              border: "1px solid var(--border-color)",
              width: "100%",
              maxWidth: "440px",
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.3)",
              padding: "24px",
              animation: "scaleUp 0.2s ease",
            }}
          >
            <div style={{ textAlign: "center", marginBottom: "20px" }}>
              <div
                style={{
                  width: "52px",
                  height: "52px",
                  borderRadius: "50%",
                  backgroundColor: "rgba(239, 68, 68, 0.12)",
                  color: "var(--danger)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "24px",
                  margin: "0 auto 12px auto",
                }}
              >
                ⚠️
              </div>
              <h3 style={{ margin: "0 0 6px 0", fontSize: "18px", color: "var(--text-primary)", fontWeight: "700" }}>
                Confirm User Deletion
              </h3>
              <p style={{ margin: 0, fontSize: "13px", color: "var(--text-muted)" }}>
                Are you sure you want to permanently delete the user account{" "}
                <strong style={{ color: "var(--text-primary)" }}>{deleteTarget.name}</strong> ({deleteTarget.email})?
              </p>
            </div>

            <div style={{ display: "flex", gap: "10px" }}>
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                style={{
                  flex: 1,
                  padding: "10px",
                  borderRadius: "8px",
                  border: "1px solid var(--border-color)",
                  backgroundColor: "var(--bg-page)",
                  color: "var(--text-primary)",
                  fontSize: "13px",
                  fontWeight: "600",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={formLoading}
                style={{
                  flex: 1,
                  padding: "10px",
                  borderRadius: "8px",
                  border: "none",
                  backgroundColor: "var(--danger)",
                  color: "#ffffff",
                  fontSize: "13px",
                  fontWeight: "700",
                  cursor: formLoading ? "wait" : "pointer",
                }}
              >
                {formLoading ? "Deleting..." : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

export default UserManagement;
