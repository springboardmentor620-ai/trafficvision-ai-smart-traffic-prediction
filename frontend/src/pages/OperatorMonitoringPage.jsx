import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { StatusBadge } from '../components/common/StatusBadge';
import { RoadDetailsSidePanel } from '../components/common/RoadDetailsSidePanel';
import { SkeletonTable } from '../components/ui/Skeleton';

import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import apiClient from '../services/api';
import { 
  FaVideo, 
  FaSync, 
  FaSearch, 
  FaFilter, 
  FaSort, 
  FaSortUp, 
  FaSortDown, 
  FaRoad, 
  FaEye, 
  FaTimes, 
  FaMapMarkerAlt, 
  FaUserTie, 
  FaClock, 
  FaFileDownload,
  FaCar,
  FaTachometerAlt,
  FaExclamationTriangle,
  FaChartLine,
  FaShieldAlt,
  FaExclamationCircle
} from 'react-icons/fa';

export const OperatorMonitoringPage = () => {
  const { user } = useAuth();
  const { showError, showSuccess } = useToast();
  
  // Render count tracking for performance auditing
  const renderCountRef = useRef(0);
  renderCountRef.current += 1;
  console.log(`[RENDER LOG] OperatorMonitoringPage rendered (Count: ${renderCountRef.current})`);

  // Telemetry Data States
  const [trafficData, setTrafficData] = useState([]);
  const [zones, setZones] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [lastRefreshed, setLastRefreshed] = useState(new Date());

  // Search, Filter, Sort State
  const [search, setSearch] = useState('');
  const [selectedZone, setSelectedZone] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [sortBy, setSortBy] = useState('road_name');
  const [sortOrder, setSortOrder] = useState('asc');

  // Selected Inspector Road (Preserved on scroll & background refresh)
  const [selectedRoadId, setSelectedRoadId] = useState(null);
  const selectedRoadIdRef = useRef(selectedRoadId);
  selectedRoadIdRef.current = selectedRoadId;

  // Side Information Panel State
  const [selectedRoadDetails, setSelectedRoadDetails] = useState(null);
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [panelError, setPanelError] = useState(null);

  // Concurrency Guard to prevent parallel duplicate API requests (Task 7)
  const isFetchingRef = useRef(false);

  // Fetch Operator Assigned Telemetry (Silent background update prevents skeleton toggle & scroll reload)
  const fetchAssignedMonitoring = useCallback(async (isSilent = false, isManual = false) => {
    if (isFetchingRef.current) {
      console.log('[PERF GUARD] Request already in progress. Ignoring duplicate concurrent call.');
      return;
    }
    isFetchingRef.current = true;

    const startTime = performance.now();
    console.log(`[API LOG] fetchAssignedMonitoring started (isSilent: ${isSilent}, isManual: ${isManual})`);

    if (!isSilent) {
      setIsLoading(true);
    }
    setFetchError(null);

    try {
      const params = {
        search,
        zone: selectedZone,
        status: selectedStatus,
        sort_by: sortBy,
        order: sortOrder,
        page: 1,
        page_size: 100
      };
      const res = await apiClient.get('/traffic/monitoring', { params });
      const items = res.items || [];
      setTrafficData(items);
      setLastRefreshed(new Date());

      // Preserve existing selectedRoadId or auto-select first corridor if none selected
      if (!selectedRoadIdRef.current && items.length > 0) {
        setSelectedRoadId(items[0].id);
      }

      const elapsed = Math.round(performance.now() - startTime);
      console.log(`[API LOG] fetchAssignedMonitoring completed in ${elapsed} ms (Items: ${items.length})`);

      if (isManual) {
        showSuccess('Assigned corridor feeds synced from Supabase', 'Telemetry Updated');
      }
    } catch (err) {
      console.error('[API ERROR] fetchAssignedMonitoring error:', err);
      setFetchError(err.message || 'Failed to fetch assigned corridor telemetry');
      if (!isSilent) {
        showError(err.message || 'Failed to fetch assigned corridor telemetry');
      }
    } finally {
      isFetchingRef.current = false;
      if (!isSilent) {
        setIsLoading(false);
      }
    }
  }, [search, selectedZone, selectedStatus, sortBy, sortOrder]);

  // Fetch Zone List once
  useEffect(() => {
    apiClient.get('/zones')
      .then((res) => {
        const list = Array.isArray(res) ? res : (res.items || []);
        setZones(list.map(z => z.zone_name));
      })
      .catch(() => {
        setZones(['Zone Alpha', 'Zone Beta', 'Zone Gamma', 'Zone Delta']);
      });
  }, []);

  // Initial Fetch & Silent 5-Second Interval Polling
  useEffect(() => {
    // Initial load (with skeleton indicator if no data)
    fetchAssignedMonitoring(false, false);

    // Silent background poll every 1.5 seconds for real-time telemetry synchronization
    const timer = setInterval(() => {
      fetchAssignedMonitoring(true, false);
    }, 1500);

    return () => clearInterval(timer);
  }, [fetchAssignedMonitoring]);

  const handleSort = (columnKey) => {
    if (sortBy === columnKey) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(columnKey);
      setSortOrder('asc');
    }
  };

  // Compute Summary Metrics for Assigned Corridors
  const summaryMetrics = useMemo(() => {
    const totalVehicles = trafficData.reduce((acc, r) => acc + (r.vehicle_count || 0), 0);
    const avgSpeed = trafficData.length
      ? Math.round(trafficData.reduce((acc, r) => acc + (r.average_speed || 0), 0) / trafficData.length)
      : 0;
    
    const criticalCount = trafficData.filter(r => (r.congestion_level || '').toUpperCase() === 'HIGH' || (r.congestion_level || '').toUpperCase() === 'CRITICAL').length;
    const congestionSeverity = criticalCount > 1 ? 'High' : (criticalCount > 0 ? 'Moderate' : 'Low');

    return { totalVehicles, avgSpeed, congestionSeverity, criticalCount };
  }, [trafficData]);

  // Selected Inspector Road
  const inspectorRoad = useMemo(() => {
    return trafficData.find(r => r.id === selectedRoadId) || trafficData[0] || null;
  }, [trafficData, selectedRoadId]);

  // Open Side Information Panel
  const handleOpenSidePanel = async (roadId) => {
    setSelectedRoadId(roadId);
    setIsSidePanelOpen(true);
    setIsLoadingDetails(true);
    setPanelError(null);
    try {
      const data = await apiClient.get(`/traffic/roads/${roadId}`);
      setSelectedRoadDetails(data);
    } catch (err) {
      setPanelError(err.message || 'Failed to fetch road telemetry specifications');
      showError(err.message || 'Failed to fetch road telemetry specifications');
    } finally {
      setIsLoadingDetails(false);
    }
  };

  // Export CSV Handler
  const handleExportCSV = () => {
    if (!trafficData.length) {
      showError('No telemetry records available to export', 'Export Error');
      return;
    }

    const headers = ['Road ID', 'Road Name', 'Road Code', 'Zone', 'Vehicle Count', 'Average Speed (km/h)', 'Congestion Level'];
    const rows = trafficData.map(r => [
      r.id,
      `"${r.road_name.replace(/"/g, '""')}"`,
      `"${(r.road_code || '').replace(/"/g, '""')}"`,
      `"${(r.zone || '').replace(/"/g, '""')}"`,
      r.vehicle_count || 0,
      r.average_speed || 0,
      `"${(r.congestion_level || 'Low').replace(/"/g, '""')}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `operator_assigned_telemetry_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showSuccess(`Exported ${trafficData.length} assigned telemetry records to CSV`, 'Export Complete');
  };

  const getCongestionBadgeType = (level) => {
    switch ((level || '').toUpperCase()) {
      case 'LOW': return 'green';
      case 'MODERATE': return 'amber';
      case 'HIGH':
      case 'CRITICAL': return 'red';
      default: return 'green';
    }
  };

  return (
    <DashboardLayout role="Operator">
      <div className="space-y-6 animate-fade-in w-full">

        {/* Header Console */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2.5">
              <FaVideo className="text-teal-400 text-xl" />
              <span>Assigned Corridors Traffic Desk</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Duty Console: Displaying real-time telemetry feeds for road corridors assigned strictly to <span className="text-teal-400 font-semibold">{user?.name}</span> in Supabase.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <span className="text-[11px] text-slate-400 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg font-mono flex items-center gap-1.5">
              <FaClock className="text-teal-400 text-[10px]" />
              <span>Last synced: {lastRefreshed.toLocaleTimeString()}</span>
            </span>

            <Button variant="secondary" size="sm" onClick={() => fetchAssignedMonitoring(false, true)} className="space-x-1.5">
              <FaSync className={isLoading ? 'animate-spin' : ''} />
              <span>Sync Feeds</span>
            </Button>

            <Button size="sm" onClick={handleExportCSV} className="space-x-1.5 bg-slate-900 border border-slate-800 text-slate-200 hover:text-white">
              <FaFileDownload />
              <span>Export CSV</span>
            </Button>
          </div>
        </div>

        {/* 4 Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          
          <Card className="p-4 border-slate-800 hover:border-slate-700 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Assigned Corridors</span>
              <div className="p-2.5 bg-teal-500/10 text-teal-400 rounded-xl border border-teal-500/20">
                <FaRoad className="text-base" />
              </div>
            </div>
            <div className="mt-2">
              <h3 className="text-2xl font-extrabold text-slate-100 font-mono">{trafficData.length}</h3>
              <p className="text-[10px] text-teal-400 font-medium">Active Duty Corridors</p>
            </div>
          </Card>

          <Card className="p-4 border-slate-800 hover:border-slate-700 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Assigned Volume</span>
              <div className="p-2.5 bg-cyan-500/10 text-cyan-400 rounded-xl border border-cyan-500/20">
                <FaCar className="text-base" />
              </div>
            </div>
            <div className="mt-2">
              <h3 className="text-2xl font-extrabold text-cyan-400 font-mono">{summaryMetrics.totalVehicles}</h3>
              <p className="text-[10px] text-slate-400 font-medium">Vehicle Throughput</p>
            </div>
          </Card>

          <Card className="p-4 border-slate-800 hover:border-slate-700 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Average Speed</span>
              <div className="p-2.5 bg-teal-500/10 text-teal-400 rounded-xl border border-teal-500/20">
                <FaTachometerAlt className="text-base" />
              </div>
            </div>
            <div className="mt-2">
              <h3 className="text-2xl font-extrabold text-slate-100 font-mono">
                {summaryMetrics.avgSpeed} <span className="text-xs font-normal text-slate-500">km/h</span>
              </h3>
              <p className="text-[10px] text-teal-400 font-medium">Assigned Corridors Avg</p>
            </div>
          </Card>

          <Card className="p-4 border-slate-800 hover:border-slate-700 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Peak Severity</span>
              <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
                <FaExclamationTriangle className="text-base" />
              </div>
            </div>
            <div className="mt-2">
              <StatusBadge status={summaryMetrics.congestionSeverity} type={getCongestionBadgeType(summaryMetrics.congestionSeverity)} />
              <p className="text-[10px] text-slate-400 font-medium mt-1">Duty Perimeter Congestion</p>
            </div>
          </Card>

        </div>

        {/* Error State Banner */}
        {fetchError && (
          <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <FaExclamationCircle className="text-base" />
              <span>{fetchError}</span>
            </div>
            <Button size="sm" variant="secondary" onClick={() => fetchAssignedMonitoring(false, true)}>Retry</Button>
          </div>
        )}

        {/* Empty State if 0 Assigned Roads */}
        {trafficData.length === 0 && !isLoading ? (
          <div className="glass-panel p-12 rounded-2xl border border-slate-800 text-center space-y-4">
            <FaShieldAlt className="text-5xl text-teal-500/40 mx-auto" />
            <div>
              <h3 className="text-lg font-bold text-slate-100">No Road Corridors Assigned</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
                No road corridors have been assigned to your operator account (<span className="text-teal-400 font-mono">{user?.email}</span>) in Supabase.
              </p>
            </div>
            <div className="p-3 bg-slate-900/80 max-w-lg mx-auto rounded-xl border border-slate-800 text-xs text-slate-300">
              Please contact an Administrator to assign road corridors and zones to your profile using the <strong>Assignment Management</strong> console.
            </div>
          </div>
        ) : (
          /* 12-Column Responsive Architecture */
          <div className="grid grid-cols-12 gap-6">

            {/* Left Column: Assigned Corridors Telemetry Table (col-span-12 lg:col-span-8) */}
            <div className="col-span-12 lg:col-span-8 space-y-4">
              <Card title="Assigned Corridors Live Telemetry Table" subtitle={`Displaying ONLY roads assigned to ${user?.name}`}>
                
                {/* Search & Filters Toolbar */}
                <div className="p-4 border-b border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
                  
                  {/* Search */}
                  <div className="relative w-full sm:w-64">
                    <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs" />
                    <input
                      type="text"
                      placeholder="Search assigned road name or code..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="w-full pl-9 pr-4 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-teal-500"
                    />
                    {search && (
                      <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                        <FaTimes />
                      </button>
                    )}
                  </div>

                  {/* Filters */}
                  <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                    <select
                      value={selectedZone}
                      onChange={(e) => setSelectedZone(e.target.value)}
                      className="bg-slate-900 border border-slate-800 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-teal-500 cursor-pointer"
                    >
                      <option value="ALL">All Zones</option>
                      {zones.map(z => <option key={z} value={z}>{z}</option>)}
                    </select>

                    <select
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                      className="bg-slate-900 border border-slate-800 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-teal-500 cursor-pointer"
                    >
                      <option value="ALL">All Congestion</option>
                      <option value="Low">Low</option>
                      <option value="Moderate">Moderate</option>
                      <option value="High">High</option>
                      <option value="Critical">Critical</option>
                    </select>
                  </div>

                </div>

                {/* Table Body & States */}
                {isLoading && trafficData.length === 0 ? (
                  <SkeletonTable rows={5} />
                ) : trafficData.length === 0 ? (
                  <div className="py-12 text-center space-y-3">
                    <FaRoad className="text-4xl text-slate-700 mx-auto" />
                    <p className="text-sm font-medium text-slate-400">No assigned road corridors match the search or filter criteria.</p>
                    <Button size="sm" variant="secondary" onClick={() => { setSearch(''); setSelectedZone('ALL'); setSelectedStatus('ALL'); }}>
                      Reset Filters
                    </Button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-slate-300">
                      <thead className="text-[11px] uppercase bg-slate-900/90 text-slate-400 border-b border-slate-800">
                        <tr>
                          <th className="py-3 px-4 cursor-pointer" onClick={() => handleSort('road_name')}>
                            Road Name {sortBy === 'road_name' && (sortOrder === 'asc' ? <FaSortUp className="inline text-teal-400" /> : <FaSortDown className="inline text-teal-400" />)}
                          </th>
                          <th className="py-3 px-4">Road Code</th>
                          <th className="py-3 px-4">Zone</th>
                          <th className="py-3 px-4 cursor-pointer" onClick={() => handleSort('vehicle_count')}>
                            Vehicle Count {sortBy === 'vehicle_count' && (sortOrder === 'asc' ? <FaSortUp className="inline text-teal-400" /> : <FaSortDown className="inline text-teal-400" />)}
                          </th>
                          <th className="py-3 px-4">Congestion</th>
                          <th className="py-3 px-4">AI Status</th>
                          <th className="py-3 px-4">Updated Time</th>
                          <th className="py-3 px-4 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60 font-sans">
                        {trafficData.map((road) => {
                          const isSelected = selectedRoadId === road.id;
                          return (
                            <tr 
                              key={road.id} 
                              onClick={() => setSelectedRoadId(road.id)}
                              className={`cursor-pointer transition-colors ${isSelected ? 'bg-teal-500/10 border-l-2 border-l-teal-400' : 'hover:bg-slate-900/50'}`}
                            >
                              <td className="py-3 px-4 font-bold text-slate-100">{road.road_name}</td>
                              <td className="py-3 px-4 font-mono text-teal-400 text-[11px]">{road.road_code || `RD-${road.id}`}</td>
                              <td className="py-3 px-4 text-slate-300">{road.zone}</td>
                              <td className="py-3 px-4 font-mono font-bold text-teal-400">{road.vehicle_count} veh</td>
                              <td className="py-3 px-4">
                                <StatusBadge status={road.congestion_level || 'Low'} type={getCongestionBadgeType(road.congestion_level)} />
                              </td>
                              <td className="py-3 px-4">
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                                  road.ai_status === 'ACTIVE' 
                                    ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30' 
                                    : 'bg-slate-800/80 text-slate-400 border-slate-700'
                                }`}>
                                  {road.ai_status || 'SEEDED'}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-slate-300 font-mono">
                                {road.timestamp ? new Date(road.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : 'N/A'}
                              </td>
                              <td className="py-3 px-4 text-right">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleOpenSidePanel(road.id);
                                  }}
                                  className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-teal-400 hover:border-teal-500/40 transition-colors"
                                  title="Inspect Full Telemetry Side Panel"
                                >
                                  <FaEye />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}

              </Card>
            </div>

            {/* Right Column: Duty Corridor Inspector Card (col-span-12 lg:col-span-4) */}
            <div className="col-span-12 lg:col-span-4">
              <Card className="p-5 h-full flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                      <FaRoad className="text-teal-400" /> Duty Corridor Inspector
                    </h3>
                    <span className="text-[10px] text-teal-400 font-mono bg-teal-500/10 px-2 py-0.5 rounded border border-teal-500/20">
                      Live Scoped
                    </span>
                  </div>

                  {/* Road Selector Dropdown */}
                  <div className="space-y-1 mb-4">
                    <label className="text-[11px] text-slate-400 font-semibold uppercase">Select Assigned Corridor</label>
                    <select
                      value={selectedRoadId || ''}
                      onChange={(e) => setSelectedRoadId(parseInt(e.target.value, 10))}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-teal-500 cursor-pointer"
                    >
                      {trafficData.map((r) => (
                        <option key={r.id} value={r.id}>{r.road_name} ({r.road_code || `RD-${r.id}`}) - [{r.zone}]</option>
                      ))}
                    </select>
                  </div>

                  {/* Live Inspector Details */}
                  {inspectorRoad && (
                    <div className="p-4 bg-slate-900/90 rounded-xl border border-slate-800 space-y-3 font-sans">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-bold text-slate-100 text-sm">{inspectorRoad.road_name}</h4>
                          <p className="text-[10px] text-slate-400 font-mono">{inspectorRoad.road_code || `RD-${inspectorRoad.id}`} • {inspectorRoad.zone}</p>
                        </div>
                        <StatusBadge status={inspectorRoad.congestion_level || 'Low'} type={getCongestionBadgeType(inspectorRoad.congestion_level)} />
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-center font-mono">
                        <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800">
                          <span className="text-[9px] text-slate-500 block uppercase font-sans">Volume</span>
                          <span className="text-base font-extrabold text-teal-400">{inspectorRoad.vehicle_count} veh</span>
                        </div>
                        <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800">
                          <span className="text-[9px] text-slate-500 block uppercase font-sans">AI Status</span>
                          <span className={`text-[11px] font-bold block mt-1 ${inspectorRoad.ai_status === 'ACTIVE' ? 'text-cyan-400' : 'text-slate-400'}`}>
                            {inspectorRoad.ai_status || 'SEEDED'}
                          </span>
                        </div>
                      </div>

                      <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800/80 space-y-1.5 text-xs text-slate-300 font-mono">
                        <div className="flex justify-between">
                          <span className="text-[9px] text-slate-500 uppercase font-sans">Updated Time</span>
                          <span>
                            {inspectorRoad.timestamp ? new Date(inspectorRoad.timestamp).toLocaleTimeString() : 'N/A'}
                          </span>
                        </div>
                      </div>

                    </div>
                  )}
                </div>

                {inspectorRoad && (
                  <Button 
                    size="sm" 
                    onClick={() => handleOpenSidePanel(inspectorRoad.id)} 
                    className="w-full bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold space-x-1.5"
                  >
                    <FaEye />
                    <span>Inspect Telemetry Side Panel</span>
                  </Button>
                )}
              </Card>
            </div>

          </div>
        )}

        {/* Side Information Panel Drawer */}
        <RoadDetailsSidePanel
          isOpen={isSidePanelOpen}
          onClose={() => setIsSidePanelOpen(false)}
          roadData={selectedRoadDetails}
          isLoading={isLoadingDetails}
          error={panelError}
          onRetry={() => selectedRoadId && handleOpenSidePanel(selectedRoadId)}
        />

      </div>
    </DashboardLayout>
  );
};
