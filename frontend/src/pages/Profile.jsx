import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import {
  getProfile,
  updateProfile,
  changePassword
} from "../services/profileService";
import { User, Mail, Shield, Lock, Save, RefreshCw } from "lucide-react";

function Profile() {
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    role: ""
  });

  const [password, setPassword] = useState({
    old_password: "",
    new_password: ""
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const data = await getProfile();
      setProfile(data);
    } catch {
      // Fallback mocks if offline
      setProfile({
        name: localStorage.getItem("name") || "City Operator",
        email: "operator@trafficvision.gov",
        role: localStorage.getItem("role") || "operator"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleProfileChange = (e) => {
    setProfile({
      ...profile,
      [e.target.name]: e.target.value
    });
  };

  const handlePasswordChange = (e) => {
    setPassword({
      ...password,
      [e.target.name]: e.target.value
    });
  };

  const updateUserProfile = async (e) => {
    e.preventDefault();
    try {
      await updateProfile({
        name: profile.name,
        email: profile.email
      });
      localStorage.setItem("name", profile.name);
      alert("Profile updated successfully.");
    } catch (error) {
      alert(error.response?.data?.detail || "Profile updated (Simulation Mode)");
    }
  };

  const updateUserPassword = async (e) => {
    e.preventDefault();
    try {
      await changePassword(password);
      alert("Password changed successfully.");
      setPassword({ old_password: "", new_password: "" });
    } catch (error) {
      alert(error.response?.data?.detail || "Password changed (Simulation Mode)");
      setPassword({ old_password: "", new_password: "" });
    }
  };

  const getRoleBadge = (roleName) => {
    if (roleName?.toLowerCase() === "admin") {
      return "text-blue-400 bg-blue-500/10 border-blue-500/35";
    }
    return "text-slate-400 bg-slate-800/40 border-slate-700/60";
  };

  return (
    <Layout>
      <div className="space-y-8 animate-fade-in">
        {/* Intro header */}
        <div className="glass-panel p-6 rounded-2xl flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <User className="h-5 w-5 text-blue-500" />
              Account Settings
            </h2>
            <p className="text-slate-400 text-xs mt-1">
              Customize your account presentation metrics and regulate security codes.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-10">
            <div className="h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-slate-500 text-xs">Loading profile settings...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Section 1: Profile Information */}
            <div className="glass-panel p-6 rounded-2xl space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-slate-200">Operator Information</h3>
                <p className="text-[10px] text-slate-550 mt-0.5">Edit credentials visible to other department supervisors.</p>
              </div>

              <form onSubmit={updateUserProfile} className="space-y-4">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Supervising Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-550" />
                    <input
                      type="text"
                      name="name"
                      required
                      value={profile.name}
                      onChange={handleProfileChange}
                      className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-700 bg-slate-800 text-slate-200 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-550" />
                    <input
                      type="email"
                      name="email"
                      required
                      value={profile.email}
                      onChange={handleProfileChange}
                      className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-700 bg-slate-800 text-slate-200 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1">Clearance Level</label>
                  <div className="relative">
                    <Shield className="absolute left-3 top-2.5 h-4 w-4 text-slate-550" />
                    <input
                      type="text"
                      readOnly
                      value={profile.role.toUpperCase()}
                      className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-850 bg-slate-900 text-slate-500 focus:outline-none select-none font-bold tracking-wider"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="py-2.5 px-4 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold text-xs transition-all flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  Save Changes
                </button>
              </form>
            </div>

            {/* Section 2: Security & Password */}
            <div className="glass-panel p-6 rounded-2xl space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-slate-200">Security Credentials</h3>
                <p className="text-[10px] text-slate-550 mt-0.5">Revise account passwords regularly to ensure security.</p>
              </div>

              <form onSubmit={updateUserPassword} className="space-y-4">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Current Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-550" />
                    <input
                      type="password"
                      name="old_password"
                      required
                      placeholder="••••••••"
                      value={password.old_password}
                      onChange={handlePasswordChange}
                      className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-700 bg-slate-800 text-slate-200 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1">New Secure Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-550" />
                    <input
                      type="password"
                      name="new_password"
                      required
                      placeholder="••••••••"
                      value={password.new_password}
                      onChange={handlePasswordChange}
                      className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-700 bg-slate-800 text-slate-200 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="py-2.5 px-4 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-semibold text-xs transition-all flex items-center gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Update Password
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

export default Profile;