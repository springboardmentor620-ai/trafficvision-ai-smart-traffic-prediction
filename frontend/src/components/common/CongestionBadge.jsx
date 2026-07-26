import React from 'react';

/**
 * CongestionBadge implements the exact requested color scheme:
 * - Green (Low)
 * - Yellow (Moderate)
 * - Orange (High)
 * - Red (Critical)
 */
export const CongestionBadge = ({ level = 'Low' }) => {
  const getBadgeStyle = (levelStr) => {
    switch (levelStr?.toLowerCase()) {
      case 'low':
        return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/40 shadow-emerald-500/10';
      case 'moderate':
        return 'bg-yellow-500/15 text-yellow-400 border-yellow-500/40 shadow-yellow-500/10';
      case 'high':
        return 'bg-orange-500/15 text-orange-400 border-orange-500/40 shadow-orange-500/10';
      case 'critical':
        return 'bg-rose-500/15 text-rose-400 border-rose-500/40 shadow-rose-500/10';
      default:
        return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/40';
    }
  };

  const getDotColor = (levelStr) => {
    switch (levelStr?.toLowerCase()) {
      case 'low': return 'bg-emerald-400';
      case 'moderate': return 'bg-yellow-400';
      case 'high': return 'bg-orange-400';
      case 'critical': return 'bg-rose-400';
      default: return 'bg-emerald-400';
    }
  };

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full border shadow-sm ${getBadgeStyle(level)}`}>
      <span className={`h-2 w-2 rounded-full animate-pulse ${getDotColor(level)}`} />
      {level} Congestion
    </span>
  );
};
