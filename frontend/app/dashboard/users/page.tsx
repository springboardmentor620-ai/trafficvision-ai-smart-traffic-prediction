"use client";

import { useEffect, useState, useCallback } from "react";
import { DashboardShell } from "@/components/DashboardShell";
import { useAuth } from "@/lib/auth-context";
import * as api from "@/lib/api";
import { ShieldAlert, UserX, RefreshCw, Search } from "lucide-react";

const ROLE_STYLES: Record<string, { text: string; bg: string; label: string }> = {
  admin: { text: "text-congest", bg: "bg-congest/10", label: "Admin" },
  traffic_operator: { text: "text-signal", bg: "bg-signal/10", label: "Traffic operator" },
  public: { text: "text-muted", bg: "bg-surface2", label: "Public" },
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

function UserManagementContent() {
  const { token, user: currentUser } = useAuth();
  const [users, setUsers] = useState<api.ManagedUser[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [deactivatingId, setDeactivatingId] = useState<number | null>(null);

  const isAdmin = currentUser?.role === "admin";

  const fetchUsers = useCallback(async () => {
    if (!token || !isAdmin) return;
    try {
      const data = await api.listAllUsers(token);
      setUsers(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load users");
    }
  }, [token, isAdmin]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  async function handleRefresh() {
    setIsRefreshing(true);
    await fetchUsers();
    setIsRefreshing(false);
  }

  async function handleDeactivate(userId: number) {
    if (!token) return;
    setDeactivatingId(userId);
    try {
      await api.deactivateUser(token, userId);
      await fetchUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not deactivate user");
    } finally {
      setDeactivatingId(null);
    }
  }

  if (!isAdmin) {
    return (
      <div className="bg-surface border border-border rounded-xl p-8 flex flex-col items-center gap-3 text-center">
        <ShieldAlert className="w-8 h-8 text-congest" />
        <div className="text-sm text-ink">Admin access required</div>
        <p className="text-xs text-muted max-w-sm">
          Only admin accounts can view or manage users. If you believe this is a mistake, contact your traffic authority admin.
        </p>
      </div>
    );
  }

  const filtered =
    users?.filter(
      (u) =>
        search.trim() === "" ||
        u.full_name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase())
    ) ?? [];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-lg font-medium text-ink">User management</h1>
          <p className="text-sm text-muted">Admins, traffic operators, and public accounts</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-surface2 border border-border rounded-md px-2.5 py-1.5">
            <Search className="w-3.5 h-3.5 text-muted" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name or email..."
              className="bg-transparent text-xs text-ink placeholder:text-muted outline-none w-44"
            />
          </div>
          <button
            onClick={handleRefresh}
            className="flex items-center gap-1.5 text-xs text-muted hover:text-ink border border-border rounded-md px-2.5 py-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <p className="text-sm text-congest bg-congest/10 border border-congest/30 rounded-md px-3 py-2">{error}</p>
      )}

      <div className="bg-surface border border-border rounded-xl p-4">
        {users === null ? (
          <div className="h-40 flex items-center justify-center text-muted text-sm">Loading users...</div>
        ) : filtered.length === 0 ? (
          <div className="h-40 flex items-center justify-center text-muted text-sm">No users match your search</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-muted border-b border-border">
                  <th className="pb-2 font-normal">Name</th>
                  <th className="pb-2 font-normal">Email</th>
                  <th className="pb-2 font-normal">Role</th>
                  <th className="pb-2 font-normal">Status</th>
                  <th className="pb-2 font-normal">Joined</th>
                  <th className="pb-2 font-normal"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((u) => {
                  const roleStyle = ROLE_STYLES[u.role] ?? ROLE_STYLES.public;
                  const isSelf = u.id === currentUser?.id;
                  return (
                    <tr key={u.id} className={!u.is_active ? "opacity-50" : ""}>
                      <td className="py-2.5 text-ink">
                        {u.full_name}
                        {isSelf && <span className="text-muted text-xs"> (you)</span>}
                      </td>
                      <td className="py-2.5 text-muted">{u.email}</td>
                      <td className="py-2.5">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${roleStyle.text} ${roleStyle.bg}`}>
                          {roleStyle.label}
                        </span>
                      </td>
                      <td className="py-2.5">
                        <span className={`text-xs font-medium ${u.is_active ? "text-flow" : "text-muted"}`}>
                          {u.is_active ? "Active" : "Deactivated"}
                        </span>
                      </td>
                      <td className="py-2.5 text-xs text-muted">{formatDate(u.created_at)}</td>
                      <td className="py-2.5 text-right">
                        {u.is_active && !isSelf && (
                          <button
                            onClick={() => handleDeactivate(u.id)}
                            disabled={deactivatingId === u.id}
                            className="inline-flex items-center gap-1.5 text-xs text-congest hover:underline disabled:opacity-60"
                          >
                            <UserX className="w-3.5 h-3.5" />
                            {deactivatingId === u.id ? "Deactivating..." : "Deactivate"}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default function UserManagementPage() {
  return (
    <DashboardShell>
      <UserManagementContent />
    </DashboardShell>
  );
}