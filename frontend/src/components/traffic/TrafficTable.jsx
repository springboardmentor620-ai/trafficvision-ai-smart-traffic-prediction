import React from 'react';
import { Link } from 'react-router-dom';
import { CongestionBadge } from '../common/CongestionBadge';
import { FaRoad, FaClock, FaArrowRight } from 'react-icons/fa';

export const TrafficTable = ({ roads = [] }) => {
  const safeRoads = Array.isArray(roads) ? roads : [];

  if (safeRoads.length === 0) {
    return (
      <div className="py-8 text-center text-xs text-slate-400">
        No traffic telemetry records available to display.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-xs text-slate-300">
        <thead className="text-[11px] uppercase bg-slate-900/90 text-slate-400 border-b border-slate-800">
          <tr>
            <th className="py-3 px-4">Road Corridor</th>
            <th className="py-3 px-4">Vehicle Count</th>
            <th className="py-3 px-4">Average Speed</th>
            <th className="py-3 px-4">Congestion Level</th>
            <th className="py-3 px-4">Road Status</th>
            <th className="py-3 px-4">Last Timestamp</th>
            <th className="py-3 px-4 text-right">Details</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/60 font-mono">
          {safeRoads.map((r, index) => {
            if (!r) return null;

            const roadId = r?.road_id ?? r?.id ?? index;
            const roadName = r?.road_name ?? 'Unknown Corridor';
            const zoneName = r?.zone ?? 'Unassigned Zone';
            const vehicleCount = r?.vehicle_count ?? r?.current_vehicle_count ?? 0;
            const averageSpeed = r?.average_speed ?? r?.current_speed ?? 0.0;
            const congestionLevel = r?.congestion_level ?? 'Low';
            const roadStatus = r?.road_status ?? 'OPERATIONAL';
            const formattedTime = r?.timestamp
              ? new Date(r.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
              : 'N/A';

            return (
              <tr key={roadId} className="hover:bg-slate-900/60 transition-colors group">
                <td className="py-3.5 px-4 font-semibold text-slate-100 flex items-center space-x-2 font-sans">
                  <FaRoad className="text-teal-400" />
                  <div>
                    <span>{roadName}</span>
                    <span className="block text-[10px] text-slate-400 font-normal">{zoneName}</span>
                  </div>
                </td>
                <td className="py-3.5 px-4 font-mono text-teal-400 font-bold">
                  {vehicleCount} vehicles
                </td>
                <td className="py-3.5 px-4 font-mono text-slate-300">
                  {averageSpeed} km/h
                </td>
                <td className="py-3.5 px-4 font-sans">
                  <CongestionBadge level={congestionLevel} />
                </td>
                <td className="py-3.5 px-4 font-mono text-slate-300 font-sans">
                  <span className="bg-slate-900 border border-slate-800 px-2 py-1 rounded text-[11px]">
                    {roadStatus}
                  </span>
                </td>
                <td className="py-3.5 px-4 font-mono text-slate-400">
                  <span className="flex items-center gap-1">
                    <FaClock className="text-slate-500 text-[10px]" />
                    {formattedTime}
                  </span>
                </td>
                <td className="py-3.5 px-4 text-right font-sans">
                  <Link
                    to={`/roads/${roadId}`}
                    className="text-xs text-teal-400 hover:text-teal-300 font-medium inline-flex items-center gap-1"
                  >
                    <span>View</span>
                    <FaArrowRight className="text-[10px]" />
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
