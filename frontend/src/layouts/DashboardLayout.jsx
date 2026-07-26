import React from 'react';
import { Navbar } from '../components/common/Navbar';
import { Sidebar } from '../components/common/Sidebar';
import { Footer } from '../components/common/Footer';

export const DashboardLayout = ({ children, role = 'Operator' }) => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 w-full">
      <Navbar />
      <div className="flex flex-1 w-full min-h-0">
        <Sidebar role={role} />
        <main className="flex-1 px-6 py-6 w-full min-w-0">
          {children}
        </main>
      </div>
      <Footer />
    </div>
  );
};

