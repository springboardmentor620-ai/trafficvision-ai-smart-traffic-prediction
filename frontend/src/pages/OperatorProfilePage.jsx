import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { Card } from '../components/ui/Card';
import { StatusBadge } from '../components/common/StatusBadge';
import { useAuth } from '../contexts/AuthContext';
import apiClient from '../services/api';
import { 
  FaUserTie, 
  FaEnvelope, 
  FaPhone, 
  FaShieldAlt, 
  FaCalendarAlt, 
  FaClock, 
  FaRoad, 
  FaExclamationTriangle,
  FaSync,
  FaCheckCircle,
  FaLayerGroup
} from 'react-icons/fa';

export const OperatorProfilePage = () => {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfileDetails = async () => {
    setIsLoading(true);
    try {
      const data = await apiClient.get('/operator/dashboard-stats');
      setProfileData(data);
    } catch (err) {
      console.error('Failed to load profile stats:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileDetails();
  }, []);

  const assignedRoads = profileData?.assigned_roads_list || [];
  const activeAlerts = profileData?.active_alerts_list || [];

  return (
    <DashboardLayout role="Operator">
      <div className="space-y-6 animate-fade-in w-full">
        
        {/* Header Title */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
              <FaUserTie className="text-teal-400" />
              <span>Duty Operator Profile</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Authenticated Personnel Information, Assigned Corridors, and Live Alerts.
            </p>
          </div>
          <button 
            onClick={fetchProfileDetails} 
            className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-300 hover:text-white flex items-center gap-1.5"
          >
            <FaSync className={isLoading ? 'animate-spin' : ''} />
            <span>Refresh Profile</span>
          </button>
        </div>

        {/* Profile Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Card 1: Personal Information */}
          <Card title="Personal Information" className="lg:col-span-1">
            <div className="space-y-4 text-xs">
              <div className="flex items-center space-x-3.5 p-3.5 bg-slate-900 rounded-xl border border-slate-800">
                <img
                  src={user?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${(user?.name || 'Operator').replace(' ', '')}`}
                  alt={user?.name}
                  className="w-12 h-12 rounded-full bg-slate-950 border border-teal-500/40 p-0.5"
                />
                <div>
                  <h3 className="font-bold text-slate-100 text-sm">{user?.name}</h3>
                  <p className="text-teal-400 font-medium text-[11px]">{user?.designation || 'Senior Traffic Controller'}</p>
                  <StatusBadge status={user?.status || 'ACTIVE'} type="green" className="mt-1" />
                </div>
              </div>

              <div className="space-y-2.5 font-mono">
                <div className="flex justify-between py-2 border-b border-slate-800">
                  <span className="text-slate-400 flex items-center gap-2">
                    <FaEnvelope className="text-slate-500" /> Email:
                  </span>
                  <span className="text-slate-200">{user?.email}</span>
                </div>

                <div className="flex justify-between py-2 border-b border-slate-800">
                  <span className="text-slate-400 flex items-center gap-2">
                    <FaPhone className="text-slate-500" /> Phone:
                  </span>
                  <span className="text-slate-200">{user?.phone || 'N/A'}</span>
                </div>

                <div className="flex justify-between py-2 border-b border-slate-800">
                  <span className="text-slate-400 flex items-center gap-2">
                    <FaClock className="text-teal-400" /> Current Shift:
                  </span>
                  <span className="text-purple-300 font-bold">
                    {profileData?.metrics?.current_shift || user?.shift || 'Day Shift (08:00 - 16:00)'}
                  </span>
                </div>

                <div className="flex justify-between py-2 border-b border-slate-800">
                  <span className="text-slate-400 flex items-center gap-2">
                    <FaShieldAlt className="text-slate-500" /> System Role:
                  </span>
                  <span className="text-teal-400 font-bold">{user?.role}</span>
                </div>

                <div className="flex justify-between py-2 border-b border-slate-800">
                  <span className="text-slate-400 flex items-center gap-2">
                    <FaCalendarAlt className="text-slate-500" /> Registered Date:
                  </span>
                  <span className="text-slate-300">
                    {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Active Member'}
                  </span>
                </div>
              </div>
            </div>
          </Card>

          {/* Column 2 & 3: Assigned Zone, Roads & Alerts */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Assigned Corridors & Zone Card */}
            <Card title="Assigned Zone & Road Corridors" subtitle={`Scoped duty corridors in ${user?.zone || 'Primary Zone'}`}>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-slate-900 rounded-xl border border-slate-800 text-xs font-mono">
                  <span className="text-slate-400 flex items-center gap-1.5 font-sans font-semibold">
                    <FaLayerGroup className="text-teal-400" /> Primary Zone:
                  </span>
                  <span className="text-teal-300 font-bold">{user?.zone || 'Zone Alpha'}</span>
                </div>

                <div className="max-h-48 overflow-y-auto bg-slate-950 p-2.5 rounded-xl border border-slate-800 font-mono text-xs">
                  {assignedRoads.length === 0 ? (
                    <p className="text-slate-500 text-center py-4">No road corridors currently assigned to your account.</p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {assignedRoads.map((r) => (
                        <div key={r.id} className="p-2.5 bg-slate-900 rounded-lg border border-slate-800 space-y-1">
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-slate-100 font-sans">{r.road_name}</span>
                            <span className="text-[10px] text-teal-400">{r.road_code}</span>
                          </div>
                          <div className="flex justify-between text-[11px] text-slate-400">
                            <span>Vol: <strong className="text-teal-300">{r.current_vehicle_count} veh</strong></span>
                            <span>Speed: <strong className="text-slate-200">{r.current_speed} km/h</strong></span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </Card>

            {/* Recent Alerts & Activity Section */}
            <Card title="Active Alerts on Assigned Corridors" subtitle="Live alerts generated for your assigned roads">
              <div className="overflow-x-auto">
                {activeAlerts.length === 0 ? (
                  <div className="py-6 text-center text-xs font-mono text-slate-500">
                    No active alerts on your assigned corridors. All corridors operational.
                  </div>
                ) : (
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="text-[11px] uppercase bg-slate-900/80 text-slate-400 border-b border-slate-800">
                      <tr>
                        <th className="py-2.5 px-3">Corridor</th>
                        <th className="py-2.5 px-3">Alert Type</th>
                        <th className="py-2.5 px-3">Severity</th>
                        <th className="py-2.5 px-3">Status</th>
                        <th className="py-2.5 px-3">Created</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                      {activeAlerts.map((alt) => (
                        <tr key={alt.id} className="hover:bg-slate-900/40">
                          <td className="py-2.5 px-3 font-bold text-slate-200 font-sans">{alt.road_name}</td>
                          <td className="py-2.5 px-3 text-slate-300">{alt.alert_type}</td>
                          <td className="py-2.5 px-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              alt.severity === 'Critical' ? 'bg-rose-500/20 text-rose-400' :
                              alt.severity === 'High' ? 'bg-orange-500/20 text-orange-400' : 'bg-amber-500/20 text-amber-400'
                            }`}>{alt.severity}</span>
                          </td>
                          <td className="py-2.5 px-3 text-slate-400">{alt.status}</td>
                          <td className="py-2.5 px-3 text-slate-500">
                            {alt.created_at ? new Date(alt.created_at).toLocaleTimeString() : 'Recent'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </Card>

          </div>

        </div>

      </div>
    </DashboardLayout>
  );
};
