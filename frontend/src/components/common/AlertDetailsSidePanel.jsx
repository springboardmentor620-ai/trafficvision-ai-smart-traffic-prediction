import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import { StatusBadge } from './StatusBadge';
import { Button } from '../ui/Button';
import { 
  FaExclamationTriangle, 
  FaTimes, 
  FaRoad, 
  FaMapMarkerAlt, 
  FaUserTie, 
  FaClock, 
  FaHistory, 
  FaStickyNote, 
  FaPaperclip, 
  FaCheckCircle, 
  FaShieldAlt,
  FaFileAlt,
  FaExternalLinkAlt
} from 'react-icons/fa';

export const AlertDetailsSidePanel = ({ isOpen, onClose, alertData, isLoading, user }) => {
  // Lock body overflow & listen for ESC key
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const timeline = alertData?.timeline || alertData?.history || [];
  const resolutionHistory = alertData?.resolution_history || [];
  const road = alertData?.road;
  const assignedOp = alertData?.assigned_operator;

  const getSeverityBadgeType = (sev) => {
    switch ((sev || '').toUpperCase()) {
      case 'CRITICAL':
      case 'HIGH': return 'red';
      case 'MEDIUM':
      case 'MODERATE': return 'amber';
      case 'LOW': return 'green';
      default: return 'amber';
    }
  };

  const getStatusBadgeType = (st) => {
    switch ((st || '').toUpperCase()) {
      case 'ACTIVE': return 'red';
      case 'IN_PROGRESS':
      case 'IN PROGRESS': return 'amber';
      case 'RESOLVED': return 'green';
      default: return 'amber';
    }
  };

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-[9999] overflow-hidden pointer-events-auto">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity duration-300 animate-fade-in"
      />

      {/* Slide-over Right Panel */}
      <div 
        onClick={(e) => e.stopPropagation()}
        className="absolute inset-y-0 right-0 max-w-full flex pl-10"
      >
        <div className="w-screen max-w-md sm:max-w-xl bg-slate-950/95 border-l border-slate-800/80 backdrop-blur-xl shadow-2xl flex flex-col h-full animate-slide-left font-sans">
          
          {/* Header */}
          <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-900/60 shrink-0">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <FaExclamationTriangle className="text-xl" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h2 className="text-base font-bold text-slate-100 font-mono">
                    #ALT-{alertData?.id ? alertData.id.toString().padStart(3, '0') : '000'}
                  </h2>
                  <span className="text-[11px] font-semibold text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                    {alertData?.alert_type || 'Incident'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Corridor: <strong className="text-slate-200">{road?.road_name || 'City Road'}</strong> ({road?.zone || 'Zone Alpha'})
                </p>
              </div>
            </div>

            <button 
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-900 border border-transparent hover:border-slate-800 transition-colors"
              title="Close Panel (ESC)"
            >
              <FaTimes className="text-base" />
            </button>
          </div>

          {/* Scrollable Body */}
          <div className="flex-1 overflow-y-auto p-5 space-y-5 text-xs">
            
            {isLoading || !alertData ? (
              <div className="py-20 text-center space-y-3 text-slate-400">
                <FaClock className="animate-spin text-3xl text-amber-400 mx-auto" />
                <p className="text-xs font-semibold text-slate-300">Fetching incident alert specifications...</p>
              </div>
            ) : (
              <>
                {/* STATUS & SEVERITY SUMMARY */}
                <div className="glass-panel p-4 rounded-xl border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block mb-1">Current Status</span>
                    <StatusBadge status={alertData.status || 'ACTIVE'} type={getStatusBadgeType(alertData.status)} />
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block mb-1">Severity Rating</span>
                    <StatusBadge status={alertData.severity || 'High'} type={getSeverityBadgeType(alertData.severity)} />
                  </div>
                </div>

                {/* SECTION 1: ROAD & OPERATOR METADATA */}
                <div className="glass-panel p-4 rounded-xl border border-slate-800 space-y-3">
                  <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                    <FaRoad className="text-amber-400 text-sm" />
                    <span>Location & Duty Operator Specifications</span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]">
                    <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800 space-y-1">
                      <span className="text-slate-400 font-semibold block text-[10px] uppercase">Corridor Name</span>
                      <p className="font-bold text-slate-100 text-sm">{road?.road_name || 'City Corridor'}</p>
                      <p className="text-[10px] text-teal-400 font-mono">Code: {road?.road_code || `RD-${road?.id}`}</p>
                      <p className="text-[10px] text-slate-400 font-mono">Zone: {road?.zone || 'Zone Alpha'}</p>
                    </div>

                    <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800 space-y-1">
                      <span className="text-slate-400 font-semibold block text-[10px] uppercase">Assigned Duty Operator</span>
                      {assignedOp ? (
                        <div>
                          <p className="font-bold text-teal-300 text-sm flex items-center gap-1">
                            <FaUserTie className="text-teal-400" />
                            <span>{assignedOp.name}</span>
                          </p>
                          <p className="text-[10px] text-slate-400 font-mono truncate">{assignedOp.email}</p>
                        </div>
                      ) : (
                        <p className="text-slate-500 font-mono italic">Unassigned (System Sensor Alert)</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* SECTION 2: TIMELINE */}
                <div className="glass-panel p-4 rounded-xl border border-slate-800 space-y-3">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                      <FaHistory className="text-teal-400 text-sm" />
                      <span>Incident Event Timeline</span>
                    </h3>
                    <span className="text-[10px] font-mono text-slate-500">{timeline.length} Events</span>
                  </div>

                  <div className="space-y-2 max-h-44 overflow-y-auto bg-slate-950 p-2.5 rounded-xl border border-slate-800 font-mono text-[11px]">
                    {timeline.length === 0 ? (
                      <p className="text-slate-500 text-center py-2 italic">No event logs recorded.</p>
                    ) : (
                      timeline.map((evt, idx) => (
                        <div key={idx} className="p-2 bg-slate-900/90 rounded-lg border border-slate-800/80 flex justify-between items-start">
                          <div>
                            <span className="font-bold text-slate-200 block text-xs font-sans">{evt.event || evt.action}</span>
                            {evt.details && <span className="text-[10px] text-slate-400 block font-sans">{evt.details}</span>}
                            <span className="text-[9px] text-teal-400/80 block mt-0.5">Author: {evt.author || 'System'}</span>
                          </div>
                          <span className="text-[10px] text-slate-400 shrink-0">
                            {evt.timestamp ? new Date(evt.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recent'}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* SECTION 3: OPERATIONAL NOTES */}
                <div className="glass-panel p-4 rounded-xl border border-slate-800 space-y-2.5">
                  <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                    <FaStickyNote className="text-amber-400 text-sm" />
                    <span>Operational Resolution Notes</span>
                  </h3>

                  <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800 text-xs text-slate-200 leading-relaxed italic">
                    {alertData.notes ? (
                      <p className="not-italic font-sans">{alertData.notes}</p>
                    ) : (
                      <p className="text-slate-500">No operational resolution notes entered yet by duty operator.</p>
                    )}
                  </div>
                </div>

                {/* SECTION 4: ATTACHMENTS */}
                <div className="glass-panel p-4 rounded-xl border border-slate-800 space-y-2.5">
                  <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                    <FaPaperclip className="text-cyan-400 text-sm" />
                    <span>Incident Attachments & Visual Proof</span>
                  </h3>

                  {alertData.attachment_url ? (
                    <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-2 text-cyan-300 font-mono">
                        <FaFileAlt className="text-base" />
                        <span className="truncate max-w-[200px]">{alertData.attachment_url}</span>
                      </div>
                      <a 
                        href={alertData.attachment_url} 
                        target="_blank" 
                        rel="noreferrer"
                        className="px-2.5 py-1 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 rounded-lg font-bold text-[10px] flex items-center gap-1"
                      >
                        <span>View Attachment</span>
                        <FaExternalLinkAlt />
                      </a>
                    </div>
                  ) : (
                    <div className="p-3 bg-slate-900/50 rounded-xl border border-slate-800/60 text-slate-500 font-mono text-[11px] text-center">
                      No document or image attachments uploaded for this incident.
                    </div>
                  )}
                </div>

                {/* SECTION 5: RESOLUTION HISTORY */}
                <div className="glass-panel p-4 rounded-xl border border-slate-800 space-y-3">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                      <FaCheckCircle className="text-emerald-400 text-sm" />
                      <span>Resolution History Log</span>
                    </h3>
                    <span className="text-[10px] font-mono text-slate-500">{resolutionHistory.length} Updates</span>
                  </div>

                  <div className="space-y-2 max-h-40 overflow-y-auto font-mono text-[11px]">
                    {resolutionHistory.length === 0 ? (
                      <p className="text-slate-500 text-center py-2 italic bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                        No previous resolution edits recorded.
                      </p>
                    ) : (
                      resolutionHistory.map((res, idx) => (
                        <div key={idx} className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-emerald-400 font-sans">Status: {res.status}</span>
                            <span className="text-[10px] text-slate-400">{res.updated_at ? new Date(res.updated_at).toLocaleString() : 'Recent'}</span>
                          </div>
                          {res.notes && <p className="text-slate-300 font-sans text-xs">{res.notes}</p>}
                          <span className="text-[9px] text-slate-500 block">Updated by: {res.updated_by}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

              </>
            )}

          </div>

          {/* Footer */}
          <div className="p-4 border-t border-slate-800 bg-slate-900/80 flex justify-between items-center shrink-0">
            <span className="text-[10px] text-slate-500 font-mono">Supabase PostgreSQL Alerts v1.0</span>
            <Button variant="secondary" size="sm" onClick={onClose}>
              Close Panel
            </Button>
          </div>

        </div>
      </div>
    </div>,
    document.body
  );
};
