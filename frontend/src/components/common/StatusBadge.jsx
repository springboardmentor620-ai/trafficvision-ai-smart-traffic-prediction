import React from 'react';

export const StatusBadge = ({ status = 'Normal', type = 'green' }) => {
  const styles = {
    green: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 pulse-glow-green',
    amber: 'bg-amber-500/10 text-amber-400 border-amber-500/30 pulse-glow-amber',
    red: 'bg-rose-500/10 text-rose-400 border-rose-500/30 pulse-glow-red',
    cyan: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
  };

  const dots = {
    green: 'bg-emerald-400',
    amber: 'bg-amber-400',
    red: 'bg-rose-400',
    cyan: 'bg-cyan-400',
  };

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full border ${styles[type] || styles.green}`}>
      <span className={`h-2 w-2 rounded-full animate-pulse ${dots[type] || dots.green}`} />
      {status}
    </span>
  );
};
