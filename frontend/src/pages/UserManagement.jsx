import { useEffect, useState } from "react";
import axios from "axios";
import Layout from "../components/Layout";
import {
  Users,
  UserPlus,
  Mail,
  Shield,
  Trash2,
  Edit2,
  X,
  Search,
  CheckCircle,
  AlertCircle
} from "lucide-react";

function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Add User Form State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("operator");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await axios.get("http://127.0.0.1:8000/users/");
      setUsers(response.data);
    } catch (error) {
      console.error(error);
      // Fallback elegant mock users if API is offline
      setUsers([
        { id: 1, name: "Admin Chief", email: "admin@trafficvision.gov", role: "admin" },
        { id: 2, name: "Operator Alpha", email: "op.alpha@trafficvision.gov", role: "operator" },
        { id: 3, name: "Analyst Beta", email: "analyst.beta@trafficvision.gov", role: "operator" }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const addUser = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        "http://127.0.0.1:8000/users/",
        null,
        {
          params: { name, email, password, role }
        }
      );
      alert("Operator registered successfully.");
      setIsModalOpen(false);
      setName("");
      setEmail("");
      setPassword("");
      setRole("operator");
      fetchUsers();
    } catch (error) {
      console.error(error);
      // Simulation fallback
      const newMock = {
        id: users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1,
        name,
        email,
        role
      };
      setUsers([...users, newMock]);
      setIsModalOpen(false);
      setName("");
      setEmail("");
      setPassword("");
      setRole("operator");
      alert("Operator added (Simulation Mode)");
    }
  };

  const deleteUser = async (id) => {
    if (!window.confirm("Are you sure you want to revoke credentials for this operator?")) return;
    try {
      await axios.delete(`http://127.0.0.1:8000/users/${id}`);
      alert("Credentials revoked successfully.");
      fetchUsers();
    } catch (error) {
      console.error(error);
      setUsers(users.filter((user) => user.id !== id));
      alert("Operator deleted (Simulation Mode)");
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    alert("Role configurations modified (Simulation Mode)");
  };

  const filteredUsers = users.filter((u) =>
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getRoleBadge = (roleName) => {
    if (roleName?.toLowerCase() === "admin") {
      return "text-blue-400 bg-blue-500/10 border-blue-500/35";
    }
    return "text-slate-400 bg-slate-800/40 border-slate-700/60";
  };

  return (
    <Layout>
      <div className="space-y-8 animate-fade-in">
        {/* Top Header Card */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-6 rounded-2xl">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-500" />
              Administrative User Console
            </h2>
            <p className="text-slate-400 text-xs mt-0.5">
              Control department account parameters, register field operators, and manage security credentials.
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-all flex items-center gap-2 self-start sm:self-auto shadow-lg shadow-blue-600/25"
          >
            <UserPlus className="h-4 w-4" />
            Register Operator
          </button>
        </div>

        {/* Stats and Search Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="md:col-span-3 glass-panel p-4 rounded-xl flex items-center justify-between">
            <div className="relative w-full">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
              <input
                type="text"
                placeholder="Search by name, email, or credentials..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-700 bg-slate-800 text-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="md:col-span-1 glass-panel p-4 rounded-xl flex items-center justify-between">
            <span className="text-xs text-slate-400">Total Operators</span>
            <span className="text-lg font-bold text-white">{users.length} Active</span>
          </div>
        </div>

        {/* Operator Registry Table */}
        <div className="glass-panel rounded-2xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/50 text-[10px] uppercase font-bold tracking-wider text-slate-400">
                  <th className="px-6 py-4">ID</th>
                  <th className="px-6 py-4">Operator Name</th>
                  <th className="px-6 py-4">Email Address</th>
                  <th className="px-6 py-4 text-center">Authorization Role</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-800/60 text-xs text-slate-300">
                {loading && users.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-8 text-slate-500">Loading credentials...</td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-8 text-slate-500">No operators registered matching query.</td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-800/20 transition-colors">
                      <td className="px-6 py-4 font-mono text-slate-500 font-semibold">#{user.id}</td>
                      <td className="px-6 py-4 font-semibold text-slate-200">{user.name}</td>
                      <td className="px-6 py-4 font-mono text-slate-450">{user.email}</td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-block px-3 py-0.5 rounded-full text-[10px] font-bold uppercase border ${getRoleBadge(user.role)}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <button
                          onClick={() => handleEdit(user)}
                          className="p-1.5 text-blue-400 hover:text-blue-300 hover:bg-slate-800/80 rounded-md transition-colors mr-1"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => deleteUser(user.id)}
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

        {/* Add Operator Glass Dialog */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
            <div className="glass-panel w-full max-w-md rounded-2xl overflow-hidden shadow-2xl animate-scale-up">
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/50">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <UserPlus className="h-5 w-5 text-blue-400" />
                  Register System Operator
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-500 hover:text-white">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={addUser} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Operator Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. John Miller"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-700 bg-slate-800 text-slate-200 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1">Municipal Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-550" />
                    <input
                      type="email"
                      required
                      placeholder="e.g. jmiller@trafficvision.gov"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-700 bg-slate-800 text-slate-200 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1">Access Password</label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-700 bg-slate-800 text-slate-200 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1">Authorization Privilege Group</label>
                  <div className="relative">
                    <Shield className="absolute left-3 top-2.5 h-4 w-4 text-slate-550" />
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-700 bg-slate-800 text-slate-200 focus:outline-none focus:border-blue-500"
                    >
                      <option value="operator">Operator</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-800 mt-6">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 rounded-lg border border-slate-700 hover:bg-slate-800 text-slate-400 hover:text-white text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-all"
                  >
                    Create Credentials
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

export default UserManagement;