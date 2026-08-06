import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { User, Mail, Lock, Shield, TrafficCone, ShieldAlert } from "lucide-react";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "operator"
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));

    if (name === "password") {
      if (value.length === 0) {
        setPasswordError("Password is required");
      } else if (value.length < 6) {
        setPasswordError("Password must be at least 6 characters");
      } else {
        setPasswordError("");
      }
    }
  };
  const handleRegister = async (e) => {
    e.preventDefault();

    if (formData.password.length < 6) {
      setErrorMsg("Password must be at least 6 characters.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    try {
      await api.post("/auth/register", {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
      });

      alert("Registration Successful.");
      navigate("/");
    } catch (error) {
      console.error(error);
      setErrorMsg(
        error.response?.data?.detail ||
        "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 font-sans text-slate-100 antialiased">
      {/* Background blobs */}
      <div className="absolute top-1/4 left-1/4 h-72 w-72 rounded-full bg-blue-600/10 blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 h-72 w-72 rounded-full bg-purple-600/10 blur-3xl" />

      <div className="relative z-10 w-full max-w-md glass-panel p-8 rounded-2xl border border-slate-800 shadow-2xl space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600/10 border border-blue-500/25 text-blue-500 mb-2">
            <TrafficCone className="h-6 w-6 animate-pulse" />
          </div>
          <h2 className="text-xl font-bold tracking-wider text-white">
            Traffic<span className="text-blue-500">Vision</span>AI
          </h2>
          <p className="text-xs text-slate-400">Request Operator / Administrator Account</p>
        </div>

        {errorMsg && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-400">
            <ShieldAlert className="h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-550" />
              <input
                type="text"
                name="name"
                required
                placeholder="e.g. Samuel Green"
                value={formData.name}
                onChange={handleChange}
                className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-700 bg-slate-800 text-slate-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-550" />
              <input
                type="email"
                name="email"
                required
                placeholder="sgreen@trafficvision.gov"
                value={formData.email}
                onChange={handleChange}
                className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-700 bg-slate-800 text-slate-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-555" />
                <input
                  type="password"
                  name="password"
                  required
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-700 bg-slate-800 text-slate-200 focus:outline-none focus:border-blue-500"
                />
                {passwordError && (
                  <p className="text-red-400 text-[11px] mt-1">
                    {passwordError}
                  </p>
                )}

                {!passwordError && formData.password.length >= 6 && (
                  <p className="text-green-400 text-[11px] mt-1">
                    ✓ Strong password
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-555" />
                <input
                  type="password"
                  name="confirmPassword"
                  required
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-700 bg-slate-800 text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Privilege Group</label>
            <div className="relative">
              <Shield className="absolute left-3 top-2.5 h-4 w-4 text-slate-555" />
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-700 bg-slate-800 text-slate-200 focus:outline-none focus:border-blue-500"
              >
                <option value="traffic_operator">Traffic Operator</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={
              loading ||
              formData.password.length < 6 ||
              formData.password !== formData.confirmPassword
            }
            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-lg font-semibold text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/25"
          >
            {loading ? (
              <>
                <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                Creating credentials...
              </>
            ) : (
              "Submit Registration"
            )}
          </button>
        </form>

        <div className="text-center pt-2">
          <Link
            to="/"
            className="text-xs text-blue-400 hover:text-blue-300 hover:underline transition-all"
          >
            Back to login screen
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Register;