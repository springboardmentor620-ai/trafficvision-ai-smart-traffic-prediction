import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { Card } from '../components/ui/Card';
import { StatusBadge } from '../components/common/StatusBadge';
import { useAuth } from '../contexts/AuthContext';
import apiClient from '../services/api';
import { FaRoad, FaMapMarkerAlt, FaSync } from 'react-icons/fa';

export const OperatorRoadsPage = () => {
  const { user } = useAuth();
  const [roads, setRoads] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchRoads = async () => {
    setIsLoading(true);
    try {
      const data = await apiClient.get('/operator/roads');
      setRoads(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRoads();
  }, []);

  return (
    <DashboardLayout role="Operator">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
              <FaRoad className="text-teal-400" />
              <span>Assigned Road Corridors</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Displaying ONLY roads assigned to <span className="text-teal-400">{user?.name}</span>.
            </p>
          </div>
          <button onClick={fetchRoads} className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-300 hover:text-white flex items-center gap-1.5">
            <FaSync className={isLoading ? 'animate-spin' : ''} />
            <span>Refresh Roads</span>
          </button>
        </div>

        {roads.length === 0 ? (
          <Card>
            <div className="py-12 text-center text-xs text-slate-400 space-y-2">
              <FaRoad className="text-3xl text-slate-700 mx-auto" />
              <p className="font-bold text-amber-400 text-sm">No roads have been assigned to you yet.</p>
              <p className="text-[11px]">Please contact a TrafficVision AI Administrator to assign road corridors to your operator account.</p>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {roads.map((r) => (
            <Card key={r.id} title={r.road_name} subtitle={r.zone}>
              <div className="space-y-2 text-xs text-slate-300 font-mono pt-1">
                <div className="flex justify-between">
                  <span className="text-slate-400">GPS Coordinates:</span>
                  <span>{r.latitude.toFixed(4)}, {r.longitude.toFixed(4)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Current Volume:</span>
                  <span className="text-teal-400 font-bold">{r.current_vehicle_count} vehicles</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Average Speed:</span>
                  <span>{r.current_speed} km/h</span>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="text-slate-400">Congestion Level:</span>
                  <StatusBadge status={r.congestion_level} type={r.congestion_level === 'High' || r.congestion_level === 'Critical' ? 'red' : 'green'} />
                </div>
              </div>
            </Card>
          ))}
        </div>
        )}
      </div>
    </DashboardLayout>
  );
};
