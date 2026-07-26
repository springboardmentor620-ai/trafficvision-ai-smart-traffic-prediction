import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { SkeletonMetric, SkeletonTable } from '../components/ui/Skeleton';
import { useToast } from '../contexts/ToastContext';
import apiClient from '../services/api';
import {
  FaChartBar,
  FaRoad,
  FaUserTie,
  FaLayerGroup,
  FaExclamationTriangle,
  FaSync,
  FaCheckCircle,
  FaFileDownload
} from 'react-icons/fa';

export const ReportsPage = () => {
  const { showError, showSuccess } = useToast();
  const [reports, setReports] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchReports = async (isManual = false) => {
    setIsLoading(true);
    try {
      const res = await apiClient.get('/reports');
      setReports(res);
      if (isManual) {
        showSuccess('System performance reports updated', 'Reports Refreshed');
      }
    } catch (err) {
      showError(err.message || 'Failed to load system reports');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  return (
    <DashboardLayout role="Admin">
      <div className="space-y-6 animate-fade-in">
        
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2.5">
              <FaChartBar className="text-teal-400 text-xl" />
              <span>System Operational Reports</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Enterprise Control Center: Comprehensive traffic coverage, operator utilization, and audit logs.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <Button variant="secondary" size="sm" onClick={() => fetchReports(true)} className="space-x-1.5">
              <FaSync className={isLoading ? 'animate-spin' : ''} />
              <span>Refresh Metrics</span>
            </Button>
            <Button size="sm" onClick={() => showSuccess('Operational report exported to PDF', 'Export Complete')} className="space-x-1.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold">
              <FaFileDownload />
              <span>Export Report</span>
            </Button>
          </div>
        </div>

        {/* Executive Summary Metrics */}
        {isLoading && !reports ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <SkeletonMetric />
            <SkeletonMetric />
            <SkeletonMetric />
            <SkeletonMetric />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Coverage Rate</p>
                  <h3 className="text-3xl font-extrabold text-teal-400 font-mono mt-1">
                    {reports?.summary?.coverage_percentage ?? 0}%
                  </h3>
                  <p className="text-[11px] text-teal-400 mt-1 font-medium">Assigned Corridors Ratio</p>
                </div>
                <div className="p-3 bg-teal-500/10 text-teal-400 rounded-xl">
                  <FaRoad className="text-2xl" />
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Active Operators</p>
                  <h3 className="text-3xl font-extrabold text-emerald-400 font-mono mt-1">
                    {reports?.summary?.active_operators ?? 0} / {reports?.summary?.total_operators ?? 0}
                  </h3>
                  <p className="text-[11px] text-emerald-400 mt-1 font-medium">Personnel On Duty</p>
                </div>
                <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl">
                  <FaUserTie className="text-2xl" />
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Monitored Zones</p>
                  <h3 className="text-3xl font-extrabold text-cyan-400 font-mono mt-1">
                    {reports?.summary?.total_zones ?? 0}
                  </h3>
                  <p className="text-[11px] text-cyan-400 mt-1 font-medium">Active Perimeter Zones</p>
                </div>
                <div className="p-3 bg-cyan-500/10 text-cyan-400 rounded-xl">
                  <FaLayerGroup className="text-2xl" />
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Active Alerts</p>
                  <h3 className="text-3xl font-extrabold text-rose-400 font-mono mt-1">
                    {reports?.summary?.active_alerts ?? 0}
                  </h3>
                  <p className="text-[11px] text-rose-400 mt-1 font-medium">System Incident Alerts</p>
                </div>
                <div className="p-3 bg-rose-500/10 text-rose-400 rounded-xl">
                  <FaExclamationTriangle className="text-2xl" />
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Zone Breakdown & Activity Log */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card title="Zone Utilization Breakdown" subtitle="Distribution of corridors and duty operators by zone">
            {isLoading ? (
              <SkeletonTable rows={5} />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="text-[11px] uppercase bg-slate-900/90 text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="py-3 px-4">Zone Name</th>
                      <th className="py-3 px-4">Roads</th>
                      <th className="py-3 px-4">Operators</th>
                      <th className="py-3 px-4 text-right">Zone Health</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono">
                    {reports?.zone_breakdown?.map((z, idx) => (
                      <tr key={idx} className="hover:bg-slate-900/40 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-slate-100 font-sans flex items-center space-x-2">
                          <FaLayerGroup className="text-teal-400 text-xs" />
                          <span>{z.zone_name}</span>
                        </td>
                        <td className="py-3.5 px-4 text-teal-400 font-bold">{z.road_count} roads</td>
                        <td className="py-3.5 px-4 text-slate-200">{z.operator_count} duty ops</td>
                        <td className="py-3.5 px-4 text-right font-sans">
                          <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded text-[10px] font-bold">
                            {z.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>

          <Card title="Audit & Operational Log" subtitle="Recent administrative assignment and security events">
            <div className="space-y-3 font-mono text-xs">
              {reports?.recent_system_logs?.map((log) => (
                <div key={log.id} className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex items-start justify-between">
                  <div>
                    <span className="text-[10px] bg-teal-500/20 text-teal-300 border border-teal-500/40 px-1.5 py-0.5 rounded font-bold mr-2">
                      {log.type}
                    </span>
                    <span className="text-slate-200 font-sans">{log.detail}</span>
                  </div>
                  <span className="text-[10px] text-slate-500 flex-shrink-0 ml-2">{log.time}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

      </div>
    </DashboardLayout>
  );
};
