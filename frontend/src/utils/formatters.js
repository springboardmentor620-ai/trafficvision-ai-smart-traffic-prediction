/**
 * Format congestion score into human readable status label & color class
 */
export const formatCongestionLevel = (score) => {
  if (score < 30) {
    return { label: 'Low Congestion', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' };
  } else if (score < 70) {
    return { label: 'Moderate Congestion', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30' };
  } else {
    return { label: 'High Congestion', color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/30' };
  }
};

/**
 * Format timestamps into localized string
 */
export const formatTimestamp = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
};
