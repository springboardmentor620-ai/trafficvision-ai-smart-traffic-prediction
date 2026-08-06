import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../services/authService";
import { Mail, Lock, TrafficCone, ShieldAlert } from "lucide-react";

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg("Please fill in both fields.");
      return;
    }

    setLoading(true);
    setErrorMsg("");
    try {
      const response = await loginUser({ email, password });

      localStorage.setItem("token", response.access_token);

      const role = response.role?.toLowerCase();

      localStorage.setItem(
        "user",
        JSON.stringify({
          name: response.name,
          role: role,
          email: response.email
        })
      );

      if (role === "admin") {
        navigate("/home");
      } else if (
        role === "traffic_operator" ||
        role === "traffic operator" ||
        role === "operator"
      ) {
        navigate("/operator-dashboard");
      } else {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setErrorMsg("Unauthorized role.");
      }
    } catch (error) {
      console.error(error);
      setErrorMsg(error.response?.data?.detail || "Invalid municipal credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 font-sans text-slate-100 antialiased">
      {/* Background design elements */}
      <div className="absolute top-1/4 left-1/4 h-72 w-72 rounded-full bg-blue-600/10 blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 h-72 w-72 rounded-full bg-purple-600/10 blur-3xl" />

      <div className="relative z-10 w-full max-w-md glass-panel p-8 rounded-2xl border border-slate-800 shadow-2xl space-y-6">
        {/* Brand/Logo Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600/10 border border-blue-500/25 text-blue-500 mb-2">
            <TrafficCone className="h-6 w-6 animate-pulse" />
          </div>
          <h2 className="text-xl font-bold tracking-wider text-white">
            Traffic<span className="text-blue-500">Vision</span>AI
          </h2>
          <p className="text-xs text-slate-400">Smart Municipal Traffic Control Console</p>
        </div>

        {errorMsg && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-400">
            <ShieldAlert className="h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form inputs */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Municipal Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
              <input
                type="email"
                required
                placeholder="operator@trafficvision.gov"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 text-xs rounded-lg border border-slate-700 bg-slate-800 text-slate-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Access Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-550" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 text-xs rounded-lg border border-slate-700 bg-slate-800 text-slate-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-lg font-semibold text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-600/25"
          >
            {loading ? (
              <>
                <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                Verifying Credentials...
              </>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        <div className="text-center pt-3 border-t border-slate-800">
          <p className="text-xs text-slate-400">
            Don't have an account?
          </p>

          <Link
            to="/register"
            className="inline-block mt-2 px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-all shadow-lg shadow-emerald-600/20"
          >
            Create an Account
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Login;
