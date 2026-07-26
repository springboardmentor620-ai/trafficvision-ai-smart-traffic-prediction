import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { StatusBadge } from '../components/common/StatusBadge';
import { SkeletonMetric, SkeletonTable } from '../components/ui/Skeleton';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import apiClient from '../services/api';
import { 
  FaRoad, 
  FaCar, 
  FaTachometerAlt, 
  FaCheckCircle, 
  FaSync, 
  FaExclamationTriangle,
  FaClock,
  FaShieldAlt,
  FaExclamationCircle
} from 'react-icons/fa';

export const OperatorDashboard = () => {
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchOperatorStats = async (isManual = false) => {
    setIsLoading(true);
    try {
      const res = await apiClient.get('/operator/dashboard-stats');
      setStats(res);
      if (isManual) {
        showSuccess('Assigned corridor feeds refreshed from Supabase', 'Telemetry Updated');
      }
    } catch (err) {
      showError(err.message || 'Failed to fetch assigned corridor telemetry');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOperatorStats();

    // Auto-refresh every 5 seconds
    const timer = setInterval(() => {
      fetchOperatorStats();
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  const handleStatusUpdate = async (roadId, newStatus, roadName) => {
    setUpdatingId(roadId);
    try {
      await apiClient.put(`/operator/roads/${roadId}/status`, { status: newStatus });
      showSuccess(`Status for '${roadName}' updated to ${newStatus}`, 'Corridor Status Updated');
      fetchOperatorStats();
    } catch (err) {
      showError(err.message || 'Failed to update road status');
    } finally {
      setUpdatingId(null);
    }
  };

  const getBadgeType = (level) => {
    switch (level?.toUpperCase()) {
      case 'LOW': return 'green';
      case 'MODERATE': return 'amber';
      case 'HIGH':
      case 'CRITICAL': return 'red';
      default: return 'green';
    }
  };

  const hasAssignedRoads = stats && stats.metrics && stats.metrics.assigned_roads > 0;

  return (
    <DashboardLayout role="Operator">
      <div className="space-y-6 animate-fade-in">

        {/* Operator Control Desk Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 glass-panel p-4 rounded-xl border border-slate-800">
          <div>
            <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2.5">
              <FaShieldAlt className="text-teal-400" />
              <span>Operator Telemetry Control Desk</span>
              <StatusBadge 
                status={stats?.metrics?.current_shift || 'Duty Shift Active'} 
                type="cyan" 
              />
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Duty Operator: <span className="text-teal-400 font-bold">{user?.name}</span> ({user?.email}) • Scoped strictly to your assigned road corridors.
            </p>
          </div>

          <Button variant="secondary" size="sm" onClick={() => fetchOperatorStats(true)} className="space-x-1.5 w-fit">
            <FaSync className={isLoading ? 'animate-spin' : ''} />
            <span>Sync Assigned Feeds</span>
          </Button>
        </div>

        {/* 1. OPERATOR SCOPED METRIC CARDS (6 Cards Grid) */}
        {isLoading && !stats ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <SkeletonMetric />
            <SkeletonMetric />
            <SkeletonMetric />
            <SkeletonMetric />
            <SkeletonMetric />
            <SkeletonMetric />
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            
            {/* Metric 1: Assigned Roads */}
            <Card className="p-4">
              <div className="flex flex-col justify-between h-full">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Assigned Roads</p>
                  <div className="p-2 bg-teal-500/10 text-teal-400 rounded-lg">
                    <FaRoad className="text-lg" />
                  </div>
                </div>
                <div className="mt-2">
                  <h3 className="text-2xl font-extrabold text-slate-100 font-mono">
                    {stats?.metrics?.assigned_roads ?? 0}
                  </h3>
                  <p className="text-[10px] text-teal-400 mt-0.5 font-medium">Duty Corridors</p>
                </div>
              </div>
            </Card>

            {/* Metric 2: Vehicle Count */}
            <Card className="p-4">
              <div className="flex flex-col justify-between h-full">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Vehicle Count</p>
                  <div className="p-2 bg-cyan-500/10 text-cyan-400 rounded-lg">
                    <FaCar className="text-lg" />
                  </div>
                </div>
                <div className="mt-2">
                  <h3 className="text-2xl font-extrabold text-cyan-400 font-mono">
                    {stats?.metrics?.total_vehicle_count ?? 0}
                  </h3>
                  <p className="text-[10px] text-slate-400 mt-0.5 font-medium">Assigned Volume</p>
                </div>
              </div>
            </Card>

            {/* Metric 3: Active Alerts */}
            <Card className="p-4">
              <div className="flex flex-col justify-between h-full">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Active Alerts</p>
                  <div className={`p-2 rounded-lg ${(stats?.metrics?.active_alerts_count || 0) > 0 ? 'bg-rose-500/10 text-rose-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                    <FaExclamationTriangle className="text-lg" />
                  </div>
                </div>
                <div className="mt-2">
                  <h3 className={`text-2xl font-extrabold font-mono ${(stats?.metrics?.active_alerts_count || 0) > 0 ? 'text-rose-400' : 'text-slate-100'}`}>
                    {stats?.metrics?.active_alerts_count ?? 0}
                  </h3>
                  <p className="text-[10px] text-slate-400 mt-0.5 font-medium">Duty Incidents</p>
                </div>
              </div>
            </Card>

            {/* Metric 4: Road Status */}
            <Card className="p-4">
              <div className="flex flex-col justify-between h-full">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Road Status</p>
                  <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg">
                    <FaCheckCircle className="text-lg" />
                  </div>
                </div>
                <div className="mt-2">
                  <h3 className="text-xs font-bold text-slate-100 font-mono truncate" title={stats?.metrics?.road_status || 'Operational'}>
                    {stats?.metrics?.road_status || 'Operational'}
                  </h3>
                  <p className="text-[10px] text-emerald-400 mt-0.5 font-medium">Perimeter Overview</p>
                </div>
              </div>
            </Card>

            {/* Metric 5: Current Congestion */}
            <Card className="p-4">
              <div className="flex flex-col justify-between h-full">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Congestion</p>
                  <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg">
                    <FaTachometerAlt className="text-lg" />
                  </div>
                </div>
                <div className="mt-2">
                  <StatusBadge 
                    status={stats?.metrics?.congestion_status || 'Low'} 
                    type={getBadgeType(stats?.metrics?.congestion_status)} 
                  />
                  <p className="text-[10px] text-slate-400 mt-1 font-medium">Peak Severity</p>
                </div>
              </div>
            </Card>

            {/* Metric 6: Current Shift */}
            <Card className="p-4">
              <div className="flex flex-col justify-between h-full">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Current Shift</p>
                  <div className="p-2 bg-purple-500/10 text-purple-400 rounded-lg">
                    <FaClock className="text-lg" />
                  </div>
                </div>
                <div className="mt-2">
                  <span className="text-[11px] font-bold text-purple-300 block truncate" title={stats?.metrics?.current_shift || 'Duty Shift'}>
                    {stats?.metrics?.current_shift || 'Duty Shift'}
                  </span>
                  <p className="text-[10px] text-slate-400 mt-0.5 font-medium">Duty Window</p>
                </div>
              </div>
            </Card>

          </div>
        )}

        {/* EMPTY STATE OR TELEMETRY TABLE */}
        {!isLoading && !hasAssignedRoads ? (
          <div className="glass-panel p-12 rounded-2xl border border-amber-500/30 text-center space-y-4 animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 text-3xl mx-auto">
              <FaExclamationCircle />
            </div>
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-slate-100">No roads assigned.</h2>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                No road corridors have been assigned to your operator account (<span className="text-teal-400 font-mono">{user?.email}</span>) in Supabase.
              </p>
            </div>
            <div className="p-3 bg-slate-900/80 max-w-lg mx-auto rounded-xl border border-slate-800 text-[11px] text-slate-300">
              <p>Please contact an Administrator to assign road corridors and zones to your profile using the <strong>Assignment Management</strong> console.</p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            
            {/* 2. ASSIGNED ROADS TELEMETRY TABLE */}
            <Card title="Assigned Corridors Traffic Desk" subtitle={`Displaying ONLY roads assigned to ${user?.name}`}>
              {isLoading && !stats ? (
                <SkeletonTable rows={4} />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="text-[11px] uppercase bg-slate-900/90 text-slate-400 border-b border-slate-800">
                      <tr>
                        <th className="py-3.5 px-4">Assigned Road Corridor</th>
                        <th className="py-3.5 px-4">Road ID Code</th>
                        <th className="py-3.5 px-4">Zone</th>
                        <th className="py-3.5 px-4">Live Vehicle Count</th>
                        <th className="py-3.5 px-4">Congestion Level</th>
                        <th className="py-3.5 px-4">AI Status</th>
                        <th className="py-3.5 px-4">Updated Time</th>
                        <th className="py-3.5 px-4 text-right">Update Status Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 font-mono">
                      {stats?.assigned_roads_list?.map((road) => (
                        <tr key={road.id} className="hover:bg-slate-900/40 transition-colors">
                          <td className="py-3.5 px-4 font-bold text-slate-100 font-sans flex items-center space-x-2">
                            <FaRoad className="text-teal-400" />
                            <span>{road.road_name}</span>
                          </td>

                          <td className="py-3.5 px-4 text-teal-300 font-bold">
                            <span className="bg-slate-950 px-2 py-0.5 rounded border border-slate-800 text-[11px]">
                              {road.road_code || `RD-${road.id.toString().padStart(3, '0')}`}
                            </span>
                          </td>

                          <td className="py-3.5 px-4 text-slate-400 font-sans">
                            <span className="bg-slate-900 px-2 py-0.5 rounded border border-slate-800 text-[11px]">
                              {road.zone}
                            </span>
                          </td>

                          <td className="py-3.5 px-4 text-teal-400 font-bold">{road.current_vehicle_count} veh</td>
                          <td className="py-3.5 px-4 font-sans">
                            <StatusBadge 
                              status={road.congestion_level} 
                              type={getBadgeType(road.congestion_level)} 
                            />
                          </td>

                          <td className="py-3.5 px-4 font-sans">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                              road.ai_status === 'ACTIVE' 
                                ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30' 
                                : 'bg-slate-800/80 text-slate-400 border-slate-700'
                            }`}>
                              {road.ai_status || 'SEEDED'}
                            </span>
                          </td>

                          <td className="py-3.5 px-4 text-slate-300">
                            {road.timestamp ? new Date(road.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : 'N/A'}
                          </td>

                          <td className="py-3.5 px-4 text-right">
                            <select
                              disabled={updatingId === road.id}
                              value={road.congestion_level}
                              onChange={(e) => handleStatusUpdate(road.id, e.target.value, road.road_name)}
                              className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-teal-500 cursor-pointer disabled:opacity-50 font-sans"
                            >
                              <option value="Low">Set Status: Low</option>
                              <option value="Moderate">Set Status: Moderate</option>
                              <option value="High">Set Status: High</option>
                              <option value="Critical">Set Status: Critical</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>

            {/* 3. ACTIVE ALERTS FEED STRICTLY FOR ASSIGNED ROADS */}
            {stats?.active_alerts_list && stats.active_alerts_list.length > 0 && (
              <Card title="Active Duty Incidents & Alerts" subtitle="Alerts on your assigned road corridors">
                <div className="space-y-2">
                  {stats.active_alerts_list.map((alert) => (
                    <div 
                      key={alert.id} 
                      className="p-3 bg-slate-900/80 rounded-xl border border-rose-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-rose-500/10 text-rose-400 rounded-lg shrink-0">
                          <FaExclamationTriangle className="text-base" />
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-slate-100">{alert.road_name}</span>
                            <span className="bg-rose-500/10 text-rose-400 border border-rose-500/30 px-2 py-0.5 rounded text-[10px] font-bold">
                              {alert.alert_type}
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-400 font-mono">
                            Severity: {alert.severity} • {alert.created_at ? new Date(alert.created_at).toLocaleString() : 'Recent'}
                          </span>
                        </div>
                      </div>

                      <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2.5 py-1 rounded text-[11px] font-semibold w-fit">
                        Status: {alert.status}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>
            )}

          </div>
        )}

      </div>
    </DashboardLayout>
  );
};
