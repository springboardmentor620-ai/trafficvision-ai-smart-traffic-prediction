import React from 'react';
import { FaShieldAlt, FaTerminal } from 'react-icons/fa';

export const Footer = () => {
  return (
    <footer className="border-t border-slate-800 bg-slate-950 py-8 px-4 sm:px-6 lg:px-8 mt-auto">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0 text-xs text-slate-400">
        <div className="flex items-center space-x-2">
          <FaShieldAlt className="text-teal-400" />
          <span>TrafficVision AI Enterprise System &copy; {new Date().getFullYear()}</span>
        </div>
        <div className="flex items-center space-x-6">
          <span className="flex items-center gap-1">
            <FaTerminal className="text-slate-400" /> API v1.0 Ready
          </span>
          <a href="#" className="hover:text-slate-200 transition-colors">Documentation</a>
          <a href="#" className="hover:text-slate-200 transition-colors">System Diagnostics</a>
        </div>
      </div>
    </footer>
  );
};
