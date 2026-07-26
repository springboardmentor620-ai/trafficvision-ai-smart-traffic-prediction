import React from 'react';

export const SkeletonMetric = () => {
  return (
    <div className="glass-panel rounded-xl p-5 space-y-3">
      <div className="flex justify-between items-center">
        <div className="h-3 w-24 bg-slate-800 rounded skeleton-shimmer" />
        <div className="h-9 w-9 bg-slate-800 rounded-xl skeleton-shimmer" />
      </div>
      <div className="h-7 w-16 bg-slate-800 rounded skeleton-shimmer" />
      <div className="h-3 w-28 bg-slate-800 rounded skeleton-shimmer" />
    </div>
  );
};

export const SkeletonCard = () => {
  return (
    <div className="glass-panel rounded-xl p-5 space-y-4">
      <div className="flex justify-between items-center pb-3 border-b border-slate-800">
        <div className="space-y-1.5">
          <div className="h-4 w-36 bg-slate-800 rounded skeleton-shimmer" />
          <div className="h-3 w-24 bg-slate-800/80 rounded skeleton-shimmer" />
        </div>
        <div className="h-6 w-20 bg-slate-800 rounded-full skeleton-shimmer" />
      </div>
      <div className="grid grid-cols-2 gap-3 py-2">
        <div className="h-14 bg-slate-800/60 rounded-lg skeleton-shimmer" />
        <div className="h-14 bg-slate-800/60 rounded-lg skeleton-shimmer" />
      </div>
    </div>
  );
};

export const SkeletonTable = ({ rows = 5 }) => {
  return (
    <div className="space-y-3 p-4 glass-panel rounded-xl">
      <div className="h-6 w-48 bg-slate-800 rounded skeleton-shimmer mb-4" />
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center justify-between py-2.5 border-b border-slate-800/60 gap-4">
          <div className="h-4 w-1/4 bg-slate-800 rounded skeleton-shimmer" />
          <div className="h-4 w-1/6 bg-slate-800 rounded skeleton-shimmer" />
          <div className="h-4 w-1/6 bg-slate-800 rounded skeleton-shimmer" />
          <div className="h-5 w-20 bg-slate-800 rounded-full skeleton-shimmer" />
        </div>
      ))}
    </div>
  );
};
