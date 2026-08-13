import { Link } from "react-router-dom";
import { AlertTriangle, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center glass-panel rounded-2xl border border-slate-800 p-8">
        <AlertTriangle className="mx-auto h-10 w-10 text-amber-400" />
        <h1 className="mt-4 text-2xl font-bold">Page not found</h1>
        <p className="mt-2 text-sm text-slate-400">
          The page you requested does not exist or may have moved.
        </p>
        <Link
          to={localStorage.getItem("token") ? "/dashboard" : "/"}
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500"
        >
          <ArrowLeft className="h-4 w-4" />
          Go back
        </Link>
      </div>
    </div>
  );
}
