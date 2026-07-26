import React, { useState, useEffect, useMemo } from 'react';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { StatusBadge } from '../components/common/StatusBadge';
import { SkeletonTable } from '../components/ui/Skeleton';
import { useToast } from '../contexts/ToastContext';
import apiClient from '../services/api';
import {
  FaLayerGroup,
  FaRoad,
  FaPlus,
  FaEdit,
  FaTrash,
  FaSync,
  FaTimes,
  FaSearch,
  FaCheckCircle,
  FaTools,
  FaBan,
  FaEye,
  FaLink,
  FaExclamationTriangle,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaCheck,
  FaFilter,
  FaUserTie,
  FaFileDownload,
  FaArchive,
  FaUndo,
  FaTachometerAlt,
  FaCar
} from 'react-icons/fa';

export const ZoneManagementPage = () => {
  const { showSuccess, showError } = useToast();
  const [zones, setZones] = useState([]);
  const [allRoads, setAllRoads] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [activeZone, setActiveZone] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    zone_name: '',
    zone_code: '',
    description: '',
    status: 'Active',
    center_latitude: 12.9716,
    center_longitude: 77.5946,
    selected_road_ids: []
  });

  const [assignRoadIds, setAssignRoadIds] = useState([]);

  // Fetch zones and all roads from API
  const fetchAllData = async () => {
    setIsLoading(true);
    try {
      const [zonesRes, roadsRes] = await Promise.all([
        apiClient.get('/zones'),
        apiClient.get('/roads')
      ]);

      const zonesList = Array.isArray(zonesRes) ? zonesRes : (zonesRes.items || []);
      const roadsList = Array.isArray(roadsRes) ? roadsRes : (roadsRes.items || []);

      setZones(zonesList);
      setAllRoads(roadsList);
    } catch (err) {
      showError(err.message || 'Failed to load zones and roads from database');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // Compute summary dashboard metrics
  const stats = useMemo(() => {
    const totalZones = zones.length;
    const activeZones = zones.filter(z => (z.status || 'Active').toLowerCase() === 'active').length;
    const archivedZones = zones.filter(z => (z.status || '').toLowerCase() === 'archived').length;
    const totalLinkedRoads = zones.reduce((acc, z) => acc + (z.road_count || 0), 0);
    const totalOperators = new Set(zones.flatMap(z => (z.operators || []).map(o => o.id))).size;
    const totalVehicles = zones.reduce((acc, z) => acc + (z.total_vehicles || 0), 0);
    
    const validSpeeds = zones.filter(z => z.average_speed && z.average_speed > 0);
    const systemAvgSpeed = validSpeeds.length ? (validSpeeds.reduce((acc, z) => acc + z.average_speed, 0) / validSpeeds.length).toFixed(1) : '0.0';

    const congestionCounts = { Critical: 0, High: 0, Moderate: 0, Low: 0 };
    zones.forEach(z => {
      const c = z.average_congestion || 'Low';
      if (congestionCounts[c] !== undefined) congestionCounts[c]++;
      else congestionCounts.Low++;
    });
    
    let dominantCongestion = 'Optimal';
    if (congestionCounts.Critical > 0) dominantCongestion = 'Critical';
    else if (congestionCounts.High > 0) dominantCongestion = 'High';
    else if (congestionCounts.Moderate > 0) dominantCongestion = 'Moderate';
    else dominantCongestion = 'Low';

    return { totalZones, activeZones, archivedZones, totalLinkedRoads, totalOperators, totalVehicles, systemAvgSpeed, dominantCongestion };
  }, [zones]);

  // Filtered zones list
  const filteredZones = useMemo(() => {
    return zones.filter((z) => {
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch = 
        !query ||
        z.zone_name.toLowerCase().includes(query) ||
        (z.zone_code && z.zone_code.toLowerCase().includes(query)) ||
        (z.description && z.description.toLowerCase().includes(query));
      
      const matchesStatus = 
        statusFilter === 'ALL' || 
        (z.status && z.status.toLowerCase() === statusFilter.toLowerCase());

      return matchesSearch && matchesStatus;
    });
  }, [zones, searchQuery, statusFilter]);

  // Form Reset
  const resetForm = () => {
    setFormData({
      zone_name: '',
      zone_code: '',
      description: '',
      status: 'Active',
      center_latitude: 12.9716,
      center_longitude: 77.5946,
      selected_road_ids: []
    });
  };

  // Duplicate Check Validation
  const validateZoneForm = (isEdit = false, currentId = null) => {
    const nameTrim = formData.zone_name.trim();
    const codeTrim = formData.zone_code.trim();

    if (!nameTrim) {
      showError('Zone Name is required.', 'Validation Error');
      return false;
    }

    // Duplicate Zone Name check
    const duplicateName = zones.find(z => 
      z.zone_name.toLowerCase().trim() === nameTrim.toLowerCase() && 
      (!isEdit || z.id !== currentId)
    );
    if (duplicateName) {
      showError(`Zone Name '${nameTrim}' already exists. Zone names must be unique.`, 'Duplicate Name Error');
      return false;
    }

    // Duplicate Zone Code check
    if (codeTrim) {
      const duplicateCode = zones.find(z => 
        z.zone_code && z.zone_code.toLowerCase().trim() === codeTrim.toLowerCase() && 
        (!isEdit || z.id !== currentId)
      );
      if (duplicateCode) {
        showError(`Zone Code '${codeTrim}' already exists. Zone codes must be unique.`, 'Duplicate Code Error');
        return false;
      }
    }

    return true;
  };

  // Create Zone Submit
  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!validateZoneForm(false)) return;

    try {
      const payload = {
        zone_name: formData.zone_name.trim(),
        zone_code: formData.zone_code.trim() || undefined,
        description: formData.description.trim() || undefined,
        status: formData.status,
        center_latitude: parseFloat(formData.center_latitude) || 12.9716,
        center_longitude: parseFloat(formData.center_longitude) || 77.5946,
        road_ids: formData.selected_road_ids
      };

      await apiClient.post('/zones', payload);
      showSuccess(`Zone '${payload.zone_name}' created successfully in Supabase`, 'Zone Created');
      setIsCreateModalOpen(false);
      resetForm();
      fetchAllData();
    } catch (err) {
      showError(err.message || 'Failed to create perimeter zone');
    }
  };

  // Open Edit Modal
  const handleOpenEdit = (zone) => {
    setActiveZone(zone);
    setFormData({
      zone_name: zone.zone_name || '',
      zone_code: zone.zone_code || '',
      description: zone.description || '',
      status: zone.status || 'Active',
      center_latitude: zone.center_latitude || 12.9716,
      center_longitude: zone.center_longitude || 77.5946,
      selected_road_ids: (zone.roads || []).map(r => r.id)
    });
    setIsEditModalOpen(true);
  };

  // Edit Zone Submit
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!activeZone || !validateZoneForm(true, activeZone.id)) return;

    try {
      const payload = {
        zone_name: formData.zone_name.trim(),
        zone_code: formData.zone_code.trim() || undefined,
        description: formData.description.trim() || undefined,
        status: formData.status,
        center_latitude: parseFloat(formData.center_latitude) || 12.9716,
        center_longitude: parseFloat(formData.center_longitude) || 77.5946,
        road_ids: formData.selected_road_ids
      };

      await apiClient.put(`/zones/${activeZone.id}`, payload);
      showSuccess(`Zone '${payload.zone_name}' updated in Supabase`, 'Zone Updated');
      setIsEditModalOpen(false);
      setActiveZone(null);
      resetForm();
      fetchAllData();
    } catch (err) {
      showError(err.message || 'Failed to update perimeter zone');
    }
  };

  // Archive 1-Click Toggle
  const handleArchiveZone = async (zoneObj) => {
    try {
      await apiClient.put(`/zones/${zoneObj.id}/archive`);
      showSuccess(`Zone '${zoneObj.zone_name}' archived successfully`, 'Zone Archived');
      fetchAllData();
    } catch (err) {
      showError(err.message || 'Failed to archive zone');
    }
  };

  // Restore 1-Click Toggle
  const handleRestoreZone = async (zoneObj) => {
    try {
      await apiClient.put(`/zones/${zoneObj.id}/restore`);
      showSuccess(`Zone '${zoneObj.zone_name}' restored to Active status`, 'Zone Restored');
      fetchAllData();
    } catch (err) {
      showError(err.message || 'Failed to restore zone');
    }
  };

  // Open Assign Roads Modal
  const handleOpenAssign = (zone) => {
    setActiveZone(zone);
    setAssignRoadIds((zone.roads || []).map(r => r.id));
    setIsAssignModalOpen(true);
  };

  // Submit Road Assignments (Link/Unlink Roads)
  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    if (!activeZone) return;

    try {
      await apiClient.put(`/zones/${activeZone.id}/assign-roads`, {
        road_ids: assignRoadIds
      });

      showSuccess(`Updated road assignments for zone '${activeZone.zone_name}'`, 'Road Assignment Updated');
      setIsAssignModalOpen(false);
      setActiveZone(null);
      fetchAllData();
    } catch (err) {
      showError(err.message || 'Failed to update road assignment for zone');
    }
  };

  // Confirm Delete Zone
  const handleConfirmDelete = async () => {
    if (!activeZone) return;

    try {
      await apiClient.delete(`/zones/${activeZone.id}`);
      showSuccess(`Zone '${activeZone.zone_name}' deleted from Supabase`, 'Zone Deleted');
      setIsDeleteModalOpen(false);
      setActiveZone(null);
      fetchAllData();
    } catch (err) {
      showError(err.message || 'Failed to delete perimeter zone');
    }
  };

  // Export CSV Handler
  const handleExportCSV = () => {
    if (!filteredZones.length) {
      showError('No zone records available to export', 'Export Error');
      return;
    }

    const headers = ['ID', 'Zone Name', 'Zone Code', 'Description', 'Status', 'Road Count', 'Operator Count', 'Traffic Status', 'Avg Congestion', 'Center Lat', 'Center Lng', 'Created Date'];
    const rows = filteredZones.map(z => [
      z.id,
      `"${z.zone_name.replace(/"/g, '""')}"`,
      `"${(z.zone_code || '').replace(/"/g, '""')}"`,
      `"${(z.description || '').replace(/"/g, '""')}"`,
      `"${(z.status || 'Active').replace(/"/g, '""')}"`,
      z.road_count || 0,
      z.operator_count || 0,
      `"${(z.traffic_status || 'Optimal').replace(/"/g, '""')}"`,
      `"${(z.average_congestion || 'Low').replace(/"/g, '""')}"`,
      z.center_latitude || 12.9716,
      z.center_longitude || 77.5946,
      z.created_at ? new Date(z.created_at).toISOString().split('T')[0] : ''
    ]);

    const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `city_zones_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showSuccess(`Exported ${filteredZones.length} zone records to CSV`, 'Export Complete');
  };

  const getStatusBadgeType = (status) => {
    switch ((status || '').toUpperCase()) {
      case 'ACTIVE': return 'green';
      case 'MAINTENANCE': return 'amber';
      case 'INACTIVE': return 'red';
      case 'ARCHIVED': return 'slate';
      default: return 'green';
    }
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
    <DashboardLayout role="Admin">
      <div className="space-y-6 animate-fade-in w-full">

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2.5">
              <FaLayerGroup className="text-teal-400 text-xl" />
              <span>City Zone Management</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Admin Console: Manage traffic perimeter zones, map center coordinates, road linkings, and assigned operators in Supabase.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <Button variant="secondary" size="sm" onClick={fetchAllData} className="space-x-1.5">
              <FaSync className={isLoading ? 'animate-spin' : ''} />
              <span>Refresh Zones</span>
            </Button>

            <Button size="sm" onClick={handleExportCSV} className="space-x-1.5 bg-slate-900 border border-slate-800 text-slate-200 hover:text-white">
              <FaFileDownload />
              <span>Export CSV</span>
            </Button>

            <Button size="sm" onClick={() => { resetForm(); setIsCreateModalOpen(true); }} className="space-x-1.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold">
              <FaPlus />
              <span>Create Zone</span>
            </Button>
          </div>
        </div>

        {/* Summary Dashboard Widgets */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <div className="glass-panel p-3.5 rounded-xl border border-slate-800 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Total Roads</p>
              <h3 className="text-xl font-bold text-cyan-400 mt-0.5 font-mono">{stats.totalLinkedRoads}</h3>
            </div>
            <div className="p-2.5 bg-cyan-500/10 text-cyan-400 rounded-xl">
              <FaRoad className="text-lg" />
            </div>
          </div>

          <div className="glass-panel p-3.5 rounded-xl border border-slate-800 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Assigned Operators</p>
              <h3 className="text-xl font-bold text-purple-400 mt-0.5 font-mono">{stats.totalOperators}</h3>
            </div>
            <div className="p-2.5 bg-purple-500/10 text-purple-400 rounded-xl">
              <FaUserTie className="text-lg" />
            </div>
          </div>

          <div className="glass-panel p-3.5 rounded-xl border border-slate-800 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Vehicle Count</p>
              <h3 className="text-xl font-bold text-teal-400 mt-0.5 font-mono">{stats.totalVehicles}</h3>
            </div>
            <div className="p-2.5 bg-teal-500/10 text-teal-400 rounded-xl">
              <FaCar className="text-lg" />
            </div>
          </div>

          <div className="glass-panel p-3.5 rounded-xl border border-slate-800 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Average Speed</p>
              <h3 className="text-xl font-bold text-slate-100 mt-0.5 font-mono">{stats.systemAvgSpeed} <span className="text-xs font-normal">km/h</span></h3>
            </div>
            <div className="p-2.5 bg-slate-800 text-slate-300 rounded-xl">
              <FaTachometerAlt className="text-lg" />
            </div>
          </div>

          <div className="glass-panel p-3.5 rounded-xl border border-slate-800 flex items-center justify-between col-span-2 md:col-span-1">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Congestion Summary</p>
              <div className="mt-1">
                <StatusBadge status={stats.dominantCongestion} type={getCongestionBadgeType(stats.dominantCongestion)} />
              </div>
            </div>
            <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-xl">
              <FaExclamationTriangle className="text-lg" />
            </div>
          </div>
        </div>

        {/* Search & Filter Toolbar */}
        <Card className="p-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            
            {/* Search Input */}
            <div className="relative w-full sm:w-80">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs" />
              <input
                type="text"
                placeholder="Search zone name, code, or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-teal-500 transition-colors"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                  <FaTimes />
                </button>
              )}
            </div>

            {/* Status Filter Dropdown */}
            <div className="flex items-center space-x-3 w-full sm:w-auto">
              <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                <FaFilter className="text-teal-400 text-[10px]" /> Status:
              </span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-900 border border-slate-800 text-slate-200 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-teal-500 cursor-pointer"
              >
                <option value="ALL">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Inactive">Inactive</option>
                <option value="Archived">Archived</option>
              </select>

              {(searchQuery || statusFilter !== 'ALL') && (
                <Button variant="ghost" size="sm" onClick={() => { setSearchQuery(''); setStatusFilter('ALL'); }} className="text-xs text-rose-400 hover:text-rose-300">
                  Reset
                </Button>
              )}
            </div>

          </div>
        </Card>

        {/* Main Zone Directory Table */}
        <Card title="City Perimeter Monitoring Zones" subtitle={`Displaying ${filteredZones.length} of ${zones.length} total zones in Supabase`}>
          {isLoading ? (
            <SkeletonTable rows={6} />
          ) : filteredZones.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <FaLayerGroup className="text-4xl text-slate-700 mx-auto" />
              <p className="text-sm font-medium text-slate-400">No perimeter zones found matching search or filter parameters.</p>
              <Button size="sm" variant="secondary" onClick={() => { setSearchQuery(''); setStatusFilter('ALL'); }}>
                Reset Filters
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="text-[11px] uppercase bg-slate-900/90 text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="py-3.5 px-4">Zone Name & Code</th>
                    <th className="py-3.5 px-4">Description</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Linked Roads</th>
                    <th className="py-3.5 px-4">Duty Operators</th>
                    <th className="py-3.5 px-4">Traffic Status</th>
                    <th className="py-3.5 px-4">Avg Congestion</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-sans">
                  {filteredZones.map((z) => {
                    const isArchived = (z.status || '').toLowerCase() === 'archived';

                    return (
                      <tr key={z.id} className="hover:bg-slate-900/50 transition-colors">
                        
                        {/* Zone Name & Code */}
                        <td className="py-3.5 px-4 font-bold text-slate-100 flex items-center space-x-2.5">
                          <FaLayerGroup className="text-teal-400 shrink-0" />
                          <div>
                            <span className="text-slate-100 block">{z.zone_name}</span>
                            <span className="text-[10px] text-teal-300 font-mono font-semibold">
                              {z.zone_code || `Z-${String(z.id).padStart(3, '0')}`}
                            </span>
                          </div>
                        </td>

                        {/* Description */}
                        <td className="py-3.5 px-4 text-slate-400 max-w-xs truncate">
                          {z.description || 'Traffic perimeter zone'}
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-4">
                          <StatusBadge status={z.status || 'Active'} type={getStatusBadgeType(z.status)} />
                        </td>

                        {/* Road Count */}
                        <td className="py-3.5 px-4 font-mono font-bold text-cyan-400">
                          {z.road_count || 0} roads
                        </td>

                        {/* Operator Count */}
                        <td className="py-3.5 px-4 text-slate-300 font-mono">
                          <span className="flex items-center gap-1 text-[11px]">
                            <FaUserTie className="text-purple-400 text-[10px]" />
                            {z.operator_count || 0} personnel
                          </span>
                        </td>

                        {/* Traffic Status */}
                        <td className="py-3.5 px-4 text-slate-200 font-medium">
                          {z.traffic_status || 'Optimal Flow'}
                        </td>

                        {/* Avg Congestion */}
                        <td className="py-3.5 px-4">
                          <StatusBadge status={z.average_congestion || 'Low'} type={getCongestionBadgeType(z.average_congestion)} />
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right space-x-1.5">
                          {/* View Details */}
                          <button
                            onClick={() => { setActiveZone(z); setIsViewModalOpen(true); }}
                            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-teal-400 hover:border-teal-500/40 transition-colors"
                            title="View Zone Specifications & Linked Roads"
                          >
                            <FaEye />
                          </button>

                          {/* Assign Roads */}
                          <button
                            onClick={() => handleOpenAssign(z)}
                            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-cyan-400 hover:border-cyan-500/40 transition-colors"
                            title="Assign / Reassign Roads to Zone"
                          >
                            <FaLink />
                          </button>

                          {/* Edit Zone */}
                          <button
                            onClick={() => handleOpenEdit(z)}
                            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-purple-400 hover:border-purple-500/40 transition-colors"
                            title="Edit Zone Specifications"
                          >
                            <FaEdit />
                          </button>

                          {/* Archive / Restore Toggle */}
                          {isArchived ? (
                            <button
                              onClick={() => handleRestoreZone(z)}
                              className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-emerald-400 hover:border-emerald-500/40 transition-colors"
                              title="Restore Zone to Active Status"
                            >
                              <FaUndo />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleArchiveZone(z)}
                              className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-amber-400 hover:border-amber-500/40 transition-colors"
                              title="Archive Zone"
                            >
                              <FaArchive />
                            </button>
                          )}

                          {/* Delete Zone */}
                          <button
                            onClick={() => { setActiveZone(z); setIsDeleteModalOpen(true); }}
                            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-rose-400 hover:border-rose-500/40 transition-colors"
                            title="Delete Zone"
                          >
                            <FaTrash />
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

        {/* MODAL 1: CREATE ZONE MODAL */}
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="max-w-xl w-full glass-panel p-6 rounded-2xl border border-slate-800 space-y-4 animate-slide-up max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <FaPlus className="text-teal-400" /> Create New Perimeter Zone
                </h3>
                <button onClick={() => setIsCreateModalOpen(false)} className="text-slate-400 hover:text-slate-200">
                  <FaTimes />
                </button>
              </div>

              <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  
                  {/* Zone Name */}
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Zone Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Zone Epsilon"
                      value={formData.zone_name}
                      onChange={(e) => setFormData({ ...formData, zone_name: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-teal-500"
                    />
                  </div>

                  {/* Zone Code */}
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Zone Code (Unique)</label>
                    <input
                      type="text"
                      placeholder="e.g. Z-005 (Optional)"
                      value={formData.zone_code}
                      onChange={(e) => setFormData({ ...formData, zone_code: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-teal-500 font-mono"
                    />
                  </div>

                  {/* Status */}
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Initial Status *</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-teal-500 cursor-pointer"
                    >
                      <option value="Active">Active</option>
                      <option value="Maintenance">Maintenance</option>
                      <option value="Inactive">Inactive</option>
                      <option value="Archived">Archived</option>
                    </select>
                  </div>

                  {/* Center Latitude */}
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Center Latitude *</label>
                    <input
                      type="number"
                      step="any"
                      required
                      value={formData.center_latitude}
                      onChange={(e) => setFormData({ ...formData, center_latitude: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-teal-500 font-mono"
                    />
                  </div>

                  {/* Center Longitude */}
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Center Longitude *</label>
                    <input
                      type="number"
                      step="any"
                      required
                      value={formData.center_longitude}
                      onChange={(e) => setFormData({ ...formData, center_longitude: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-teal-500 font-mono"
                    />
                  </div>

                </div>

                {/* Description */}
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Perimeter Description</label>
                  <textarea
                    rows="2"
                    placeholder="Enter zone perimeter details or coverage boundaries..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-teal-500"
                  />
                </div>

                {/* Select Initial Roads */}
                <div>
                  <label className="block text-slate-300 font-semibold mb-1.5">Link City Roads (Optional)</label>
                  <div className="max-h-36 overflow-y-auto bg-slate-900 p-2.5 rounded-lg border border-slate-800 space-y-1.5">
                    {allRoads.map((road) => {
                      const isChecked = formData.selected_road_ids.includes(road.id);
                      return (
                        <label key={road.id} className="flex items-center space-x-2.5 text-xs text-slate-300 cursor-pointer hover:bg-slate-800/60 p-1 rounded">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFormData({ ...formData, selected_road_ids: [...formData.selected_road_ids, road.id] });
                              } else {
                                setFormData({ ...formData, selected_road_ids: formData.selected_road_ids.filter(id => id !== road.id) });
                              }
                            }}
                            className="rounded border-slate-700 text-teal-500 focus:ring-teal-500 bg-slate-950"
                          />
                          <span className="font-medium text-slate-200">{road.road_name}</span>
                          <span className="text-[10px] text-teal-400 font-mono">({road.road_code || `RD-${road.id}`})</span>
                          <span className="text-[10px] text-slate-500">[{road.zone || 'Unassigned'}]</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 flex justify-end space-x-2">
                  <Button type="button" variant="secondary" onClick={() => setIsCreateModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-teal-500 hover:bg-teal-600 text-slate-950 font-bold">
                    Create Zone
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL 2: EDIT ZONE MODAL */}
        {isEditModalOpen && activeZone && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="max-w-xl w-full glass-panel p-6 rounded-2xl border border-slate-800 space-y-4 animate-slide-up max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <FaEdit className="text-purple-400" /> Edit Zone Specifications #{activeZone.id}
                </h3>
                <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-slate-200">
                  <FaTimes />
                </button>
              </div>

              <form onSubmit={handleEditSubmit} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  
                  {/* Zone Name */}
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Zone Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.zone_name}
                      onChange={(e) => setFormData({ ...formData, zone_name: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-teal-500"
                    />
                  </div>

                  {/* Zone Code */}
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Zone Code</label>
                    <input
                      type="text"
                      value={formData.zone_code}
                      onChange={(e) => setFormData({ ...formData, zone_code: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-teal-500 font-mono"
                    />
                  </div>

                  {/* Status */}
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Status *</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-teal-500 cursor-pointer"
                    >
                      <option value="Active">Active</option>
                      <option value="Maintenance">Maintenance</option>
                      <option value="Inactive">Inactive</option>
                      <option value="Archived">Archived</option>
                    </select>
                  </div>

                  {/* Center Latitude */}
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Center Latitude *</label>
                    <input
                      type="number"
                      step="any"
                      required
                      value={formData.center_latitude}
                      onChange={(e) => setFormData({ ...formData, center_latitude: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-teal-500 font-mono"
                    />
                  </div>

                  {/* Center Longitude */}
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Center Longitude *</label>
                    <input
                      type="number"
                      step="any"
                      required
                      value={formData.center_longitude}
                      onChange={(e) => setFormData({ ...formData, center_longitude: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-teal-500 font-mono"
                    />
                  </div>

                </div>

                {/* Description */}
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Perimeter Description</label>
                  <textarea
                    rows="2"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div className="pt-3 border-t border-slate-800 flex justify-end space-x-2">
                  <Button type="button" variant="secondary" onClick={() => setIsEditModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-teal-500 hover:bg-teal-600 text-slate-950 font-bold">
                    Save Changes
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL 3: ASSIGN ROADS TO ZONE MODAL */}
        {isAssignModalOpen && activeZone && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="max-w-lg w-full glass-panel p-6 rounded-2xl border border-slate-800 space-y-4 animate-slide-up max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <FaLink className="text-cyan-400" /> Assign Roads to '{activeZone.zone_name}'
                </h3>
                <button onClick={() => setIsAssignModalOpen(false)} className="text-slate-400 hover:text-slate-200">
                  <FaTimes />
                </button>
              </div>

              <p className="text-xs text-slate-400">
                Select or deselect city road corridors to assign or remove them from <strong>{activeZone.zone_name}</strong>.
              </p>

              <form onSubmit={handleAssignSubmit} className="space-y-4 text-xs">
                <div className="max-h-60 overflow-y-auto bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-2">
                  {allRoads.map((road) => {
                    const isChecked = assignRoadIds.includes(road.id);
                    return (
                      <label key={road.id} className={`flex items-center justify-between p-2 rounded-lg border transition-all cursor-pointer ${
                        isChecked ? 'bg-teal-500/10 border-teal-500/30 text-slate-100' : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}>
                        <div className="flex items-center space-x-2.5">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setAssignRoadIds([...assignRoadIds, road.id]);
                              } else {
                                setAssignRoadIds(assignRoadIds.filter(id => id !== road.id));
                              }
                            }}
                            className="rounded border-slate-700 text-teal-500 focus:ring-teal-500 bg-slate-950"
                          />
                          <div>
                            <span className="font-bold block text-slate-200">{road.road_name}</span>
                            <span className="text-[10px] font-mono text-teal-400">{road.road_code || `RD-${road.id}`}</span>
                          </div>
                        </div>

                        <span className="text-[10px] text-slate-400 font-mono">
                          Current: {road.zone || 'Unassigned'}
                        </span>
                      </label>
                    );
                  })}
                </div>

                <div className="pt-2 flex justify-between items-center border-t border-slate-800">
                  <span className="text-[11px] text-teal-400 font-mono font-semibold">
                    {assignRoadIds.length} roads selected
                  </span>
                  <div className="flex space-x-2">
                    <Button type="button" variant="secondary" onClick={() => setIsAssignModalOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" className="bg-teal-500 hover:bg-teal-600 text-slate-950 font-bold">
                      Save Road Assignments
                    </Button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL 4: VIEW ZONE DETAILS MODAL */}
        {isViewModalOpen && activeZone && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="max-w-xl w-full glass-panel p-6 rounded-2xl border border-slate-800 space-y-4 animate-slide-up max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <FaEye className="text-teal-400" /> Zone Details & Telemetry #{activeZone.id}
                </h3>
                <button onClick={() => setIsViewModalOpen(false)} className="text-slate-400 hover:text-slate-200">
                  <FaTimes />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                
                {/* Zone Name & Code */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                    <span className="text-slate-400 text-[10px] block uppercase font-semibold">Zone Name</span>
                    <span className="font-bold text-slate-100 text-sm block mt-0.5">{activeZone.zone_name}</span>
                  </div>

                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                    <span className="text-slate-400 text-[10px] block uppercase font-semibold">Zone Code</span>
                    <span className="font-mono font-bold text-teal-300 text-sm block mt-0.5">
                      {activeZone.zone_code || `Z-${String(activeZone.id).padStart(3, '0')}`}
                    </span>
                  </div>
                </div>

                {/* Map Center Coordinates */}
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
                  <span className="text-slate-400 text-[10px] block uppercase font-semibold">Map Center Coordinates</span>
                  <p className="text-slate-200 font-mono text-xs flex items-center gap-1.5">
                    <FaMapMarkerAlt className="text-rose-400" />
                    <span>Latitude: {activeZone.center_latitude || 12.9716}, Longitude: {activeZone.center_longitude || 77.5946}</span>
                  </p>
                </div>

                {/* Live Telemetry Aggregates */}
                <div className="p-3.5 bg-slate-900/90 rounded-xl border border-slate-800 space-y-2">
                  <span className="text-slate-400 text-[10px] block uppercase font-bold tracking-wider">Perimeter Traffic Metrics</span>
                  <div className="grid grid-cols-3 gap-2 text-center font-mono">
                    <div className="p-2 bg-slate-950 rounded-lg border border-slate-800">
                      <span className="text-[10px] text-slate-500 block">Vehicles</span>
                      <span className="text-base font-bold text-teal-400">{activeZone.total_vehicles || 0}</span>
                    </div>

                    <div className="p-2 bg-slate-950 rounded-lg border border-slate-800">
                      <span className="text-[10px] text-slate-500 block">Avg Speed</span>
                      <span className="text-base font-bold text-slate-100">{activeZone.average_speed || 0} km/h</span>
                    </div>

                    <div className="p-2 bg-slate-950 rounded-lg border border-slate-800">
                      <span className="text-[10px] text-slate-500 block">Congestion</span>
                      <span className="text-sm font-bold text-amber-400 block mt-0.5">{activeZone.average_congestion || 'Low'}</span>
                    </div>
                  </div>
                </div>

                {/* Linked Roads */}
                <div>
                  <h4 className="font-bold text-slate-200 mb-1.5 flex items-center gap-1.5">
                    <FaRoad className="text-teal-400" />
                    <span>Linked Road Corridors ({activeZone.road_count || 0})</span>
                  </h4>

                  <div className="max-h-36 overflow-y-auto bg-slate-950 p-2 rounded-xl border border-slate-800 font-mono text-[11px]">
                    {(activeZone.roads || []).length === 0 ? (
                      <p className="text-slate-500 text-center py-3">No roads currently assigned to this zone.</p>
                    ) : (
                      <table className="w-full text-left text-slate-300">
                        <thead className="bg-slate-900 text-slate-400 border-b border-slate-800 text-[10px] uppercase">
                          <tr>
                            <th className="py-1.5 px-2">Road Name</th>
                            <th className="py-1.5 px-2">Road Code</th>
                            <th className="py-1.5 px-2">Operator</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                          {(activeZone.roads || []).map((r) => (
                            <tr key={r.id} className="hover:bg-slate-900/60">
                              <td className="py-1 px-2 font-bold text-slate-200">{r.road_name}</td>
                              <td className="py-1 px-2 text-teal-400">{r.road_code || `RD-${r.id}`}</td>
                              <td className="py-1 px-2 text-slate-400">{r.assigned_operator_name || 'Unassigned'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>

                {/* Duty Operators */}
                <div>
                  <h4 className="font-bold text-slate-200 mb-1.5 flex items-center gap-1.5">
                    <FaUserTie className="text-purple-400" />
                    <span>Assigned Duty Operators ({activeZone.operator_count || 0})</span>
                  </h4>

                  <div className="max-h-28 overflow-y-auto bg-slate-950 p-2 rounded-xl border border-slate-800 font-mono text-[11px]">
                    {(activeZone.operators || []).length === 0 ? (
                      <p className="text-slate-500 text-center py-2">No operators currently assigned to roads in this zone.</p>
                    ) : (
                      <ul className="divide-y divide-slate-800">
                        {(activeZone.operators || []).map((op) => (
                          <li key={op.id} className="py-1 px-2 flex justify-between items-center">
                            <span className="font-bold text-purple-300">{op.name}</span>
                            <span className="text-slate-400 text-[10px]">{op.email}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>

                {/* Current Zone Alerts */}
                <div>
                  <h4 className="font-bold text-slate-200 mb-1.5 flex items-center gap-1.5">
                    <FaExclamationTriangle className="text-amber-400" />
                    <span>Current Zone Alerts ({(activeZone.alerts || []).length})</span>
                  </h4>

                  <div className="max-h-32 overflow-y-auto bg-slate-950 p-2 rounded-xl border border-slate-800 font-mono text-[11px]">
                    {(activeZone.alerts || []).length === 0 ? (
                      <p className="text-slate-500 text-center py-2">No active alerts reported for corridors in this zone.</p>
                    ) : (
                      <table className="w-full text-left text-slate-300">
                        <thead className="bg-slate-900 text-slate-400 border-b border-slate-800 text-[10px] uppercase">
                          <tr>
                            <th className="py-1.5 px-2">Corridor</th>
                            <th className="py-1.5 px-2">Alert Type</th>
                            <th className="py-1.5 px-2">Severity</th>
                            <th className="py-1.5 px-2">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                          {(activeZone.alerts || []).map((alt) => (
                            <tr key={alt.id} className="hover:bg-slate-900/60">
                              <td className="py-1 px-2 font-bold text-slate-200">{alt.road_name}</td>
                              <td className="py-1 px-2 text-slate-300 font-sans font-bold">{alt.alert_type}</td>
                              <td className="py-1 px-2">
                                <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                  alt.severity === 'Critical' ? 'bg-rose-500/20 text-rose-400' :
                                  alt.severity === 'High' ? 'bg-orange-500/20 text-orange-400' : 'bg-amber-500/20 text-amber-400'
                                }`}>{alt.severity}</span>
                              </td>
                              <td className="py-1 px-2 text-slate-400">{alt.status}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>

              </div>

              <div className="pt-2 flex justify-end border-t border-slate-800">
                <Button variant="secondary" onClick={() => setIsViewModalOpen(false)}>Close Specifications</Button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL 5: DELETE CONFIRMATION MODAL */}
        {isDeleteModalOpen && activeZone && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="max-w-md w-full glass-panel p-6 rounded-2xl border border-rose-500/30 space-y-4 animate-slide-up">
              <div className="flex items-center space-x-3 text-rose-400">
                <div className="p-3 bg-rose-500/10 rounded-xl border border-rose-500/20">
                  <FaTrash className="text-2xl" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-100">Delete Perimeter Zone?</h3>
                  <p className="text-xs text-rose-400/80">This action will remove the zone and reset linked road zone pointers.</p>
                </div>
              </div>

              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-1">
                <p>Are you sure you want to delete <strong className="text-slate-100">'{activeZone.zone_name}'</strong> ({activeZone.zone_code || `Z-${activeZone.id}`})?</p>
                <p className="text-[11px] text-slate-400">Linked Roads: {activeZone.road_count || 0}</p>
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <Button variant="secondary" onClick={() => setIsDeleteModalOpen(false)}>Cancel</Button>
                <Button onClick={handleConfirmDelete} className="bg-rose-500 hover:bg-rose-600 text-white font-bold">
                  Delete Perimeter Zone
                </Button>
              </div>
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
};
