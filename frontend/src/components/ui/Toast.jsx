import React, { useEffect } from 'react';
import { FaCheckCircle, FaExclamationCircle, FaInfoCircle, FaExclamationTriangle, FaTimes } from 'react-icons/fa';

export const Toast = ({ id, type = 'info', title, message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(id);
    }, 4000);
    return () => clearTimeout(timer);
  }, [id, onClose]);

  const styles = {
    success: {
      bg: 'bg-slate-900 border-emerald-500/40 text-emerald-400',
      icon: <FaCheckCircle className="text-emerald-400 text-lg shrink-0" />,
    },
    error: {
      bg: 'bg-slate-900 border-rose-500/40 text-rose-400',
      icon: <FaExclamationCircle className="text-rose-400 text-lg shrink-0" />,
    },
    warning: {
      bg: 'bg-slate-900 border-amber-500/40 text-amber-400',
      icon: <FaExclamationTriangle className="text-amber-400 text-lg shrink-0" />,
    },
    info: {
      bg: 'bg-slate-900 border-teal-500/40 text-teal-400',
      icon: <FaInfoCircle className="text-teal-400 text-lg shrink-0" />,
    },
  };

  const currentStyle = styles[type] || styles.info;

  return (
    <div className={`flex items-start space-x-3 p-3.5 rounded-xl border shadow-xl backdrop-blur-md min-w-[280px] max-w-md animate-fade-in ${currentStyle.bg}`}>
      {currentStyle.icon}
      <div className="flex-1 text-xs">
        {title && <h4 className="font-bold text-slate-100 mb-0.5">{title}</h4>}
        <p className="text-slate-300 leading-relaxed">{message}</p>
      </div>
      <button
        onClick={() => onClose(id)}
        className="text-slate-400 hover:text-slate-200 p-1 rounded-md transition-colors"
      >
        <FaTimes className="text-xs" />
      </button>
    </div>
  );
};
