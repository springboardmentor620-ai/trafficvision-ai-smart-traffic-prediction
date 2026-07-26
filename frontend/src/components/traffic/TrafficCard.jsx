import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../ui/Card';
import { CongestionBadge } from '../common/CongestionBadge';
import { FaRoad, FaCar, FaTachometerAlt, FaClock, FaArrowRight } from 'react-icons/fa';

export const TrafficCard = ({ road }) => {
  if (!road) return null;

  const roadId = road?.road_id ?? road?.id ?? '';
  const roadName = road?.road_name ?? 'Unknown Corridor';
  const zoneName = road?.zone ?? 'Unassigned Zone';
  const vehicleCount = road?.vehicle_count ?? road?.current_vehicle_count ?? 0;
  const averageSpeed = road?.average_speed ?? road?.current_speed ?? 0.0;
  const congestionLevel = road?.congestion_level ?? 'Low';
  const timestamp = road?.timestamp;

  const formattedTime = timestamp
    ? new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    : 'N/A';

  return (
    <Card className="hover:border-teal-500/40 transition-all duration-200 flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex items-start justify-between mb-3 border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <FaRoad className="text-teal-400 text-sm" />
              <span>{roadName}</span>
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">{zoneName}</p>
          </div>
          <CongestionBadge level={congestionLevel} />
        </div>

        {/* Telemetry Metrics */}
        <div className="grid grid-cols-2 gap-3 py-2 text-xs font-mono">
          <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block flex items-center gap-1">
              <FaCar className="text-teal-400" /> Vehicle Count
            </span>
            <span className="text-lg font-bold text-teal-400 mt-1 block">
              {vehicleCount} veh
            </span>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block flex items-center gap-1">
              <FaTachometerAlt className="text-cyan-400" /> Average Speed
            </span>
            <span className="text-lg font-bold text-cyan-400 mt-1 block">
              {averageSpeed} km/h
            </span>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px]">
        <div className="flex items-center space-x-1.5 text-slate-400 font-mono">
          <FaClock className="text-slate-500" />
          <span>{formattedTime}</span>
        </div>

        {roadId ? (
          <Link
            to={`/roads/${roadId}`}
            className="text-teal-400 hover:text-teal-300 font-medium flex items-center gap-1 transition-colors"
          >
            <span>Corridor Details</span>
            <FaArrowRight className="text-[10px]" />
          </Link>
        ) : (
          <span className="text-slate-500 font-mono text-[10px]">No ID</span>
        )}
      </div>
    </Card>
  );
};
