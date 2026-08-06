import { useState } from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="min-h-screen bg-slate-950 font-sans text-slate-100 antialiased">
      {/* Sidebar navigation */}
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

      {/* Main Content Area */}
      <div className="flex flex-col md:pl-64 min-h-screen transition-all duration-300">
        {/* Top bar header */}
        <Navbar toggleSidebar={toggleSidebar} />

        {/* Content body wrapper */}
        <main className="flex-1 p-6 md:p-8 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 overflow-y-auto">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

export default Layout;