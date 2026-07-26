import React, { useState, useEffect, useMemo } from 'react';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { StatusBadge } from '../components/common/StatusBadge';
import { SkeletonTable } from '../components/ui/Skeleton';
import { useToast } from '../contexts/ToastContext';
import apiClient from '../services/api';
import {
  FaUserTie,
  FaRoad,
  FaExchangeAlt,
  FaUserCheck,
  FaUserTimes,
  FaSearch,
  FaFilter,
  FaSync,
  FaEye,
  FaEdit,
  FaTrash,
  FaTimes,
  FaLayerGroup,
  FaPlus,
  FaCheck,
  FaPhone,
  FaExclamationTriangle,
  FaCalendarAlt,
  FaUserShield,
  FaCheckCircle,
  FaClock,
  FaFileDownload,
  FaArrowRight
} from 'react-icons/fa';

export const AssignmentManagementPage = () => {
  const { showSuccess, showError } = useToast();

  // Data States
  const [assignments, setAssignments] = useState([]);
  const [operators, setOperators] = useState([]);
  const [allRoads, setAllRoads] = useState([]);
  const [zones, setZones] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedZoneFilter, setSelectedZoneFilter] = useState('ALL');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('ALL');

  // Modal Visibility States
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);

  const [activeAssignment, setActiveAssignment] = useState(null);
  const [roadSearchTerm, setRoadSearchTerm] = useState('');
  const [selectedOperatorIds, setSelectedOperatorIds] = useState([]);

  // Form Data States
  const [assignData, setAssignData] = useState({
    operator_id: '',
    zone: 'Zone Alpha',
    road_ids: []
  });

  const [transferData, setTransferData] = useState({
    source_operator_id: '',
    target_operator_id: '',
    road_ids: []
  });

  const [bulkData, setBulkData] = useState({
    operator_ids: [],
    zone: 'Zone Alpha',
    road_ids: [],
    action: 'ASSIGN'
  });

  // Fetch All Data from Supabase REST APIs
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [assignmentsRes, operatorsRes, roadsRes, zonesRes] = await Promise.all([
        apiClient.get('/assignments'),
        apiClient.get('/operators'),
        apiClient.get('/roads'),
        apiClient.get('/zones').catch(() => [])
      ]);

      const assignList = Array.isArray(assignmentsRes) ? assignmentsRes : (assignmentsRes.items || []);
      const opsList = Array.isArray(operatorsRes) ? operatorsRes : (operatorsRes.items || []);
      const roadsList = Array.isArray(roadsRes) ? roadsRes : (roadsRes.items || []);
      const zonesList = Array.isArray(zonesRes) ? zonesRes : (zonesRes.items || []);

      setAssignments(assignList);
      setOperators(opsList);
      setAllRoads(roadsList);

      if (zonesList.length > 0) {
        setZones(zonesList.map(z => z.zone_name));
      } else {
        const uniqueZones = Array.from(new Set(roadsList.map(r => r.zone).filter(Boolean)));
        setZones(uniqueZones.length ? uniqueZones : ['Zone Alpha', 'Zone Beta', 'Zone Gamma', 'Zone Delta']);
      }
    } catch (err) {
      showError(err.message || 'Failed to load assignment management data from database');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Compute Summary Metrics
  const stats = useMemo(() => {
    const totalAssignments = assignments.length;
    const activeOperators = assignments.filter(a => a.assigned_road_count > 0).length;
    const totalAssignedRoads = assignments.reduce((acc, a) => acc + (a.assigned_road_count || 0), 0);
    const unassignedRoads = allRoads.filter(r => !r.assigned_operator_id).length;
    return { totalAssignments, activeOperators, totalAssignedRoads, unassignedRoads };
  }, [assignments, allRoads]);

  // Filtered Assignments List
  const filteredAssignments = useMemo(() => {
    return assignments.filter(a => {
      const query = searchQuery.toLowerCase().trim();
      const opName = a.operator?.name || '';
      const opEmail = a.operator?.email || '';
      const zoneName = a.assigned_zone || '';
      const roadsMatch = (a.assigned_roads || []).some(r => 
        r.road_name.toLowerCase().includes(query) || 
        (r.road_code && r.road_code.toLowerCase().includes(query))
      );

      const matchesSearch = !query || opName.toLowerCase().includes(query) || opEmail.toLowerCase().includes(query) || zoneName.toLowerCase().includes(query) || roadsMatch;
      const matchesZone = selectedZoneFilter === 'ALL' || zoneName.toLowerCase() === selectedZoneFilter.toLowerCase();
      const matchesStatus = selectedStatusFilter === 'ALL' || (a.assignment_status || '').toUpperCase() === selectedStatusFilter.toUpperCase();

      return matchesSearch && matchesZone && matchesStatus;
    });
  }, [assignments, searchQuery, selectedZoneFilter, selectedStatusFilter]);

  // Open Create/Edit Assignment Modal
  const handleOpenAssign = (existingAssign = null) => {
    if (existingAssign) {
      setActiveAssignment(existingAssign);
      setAssignData({
        operator_id: existingAssign.operator.id,
        zone: existingAssign.assigned_zone || 'Zone Alpha',
        road_ids: (existingAssign.assigned_roads || []).map(r => r.id)
      });
    } else {
      setActiveAssignment(null);
      setAssignData({
        operator_id: operators[0]?.id || '',
        zone: zones[0] || 'Zone Alpha',
        road_ids: []
      });
    }
    setRoadSearchTerm('');
    setIsAssignModalOpen(true);
  };

  // Submit Assign / Edit Assignment Form
  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    if (!assignData.operator_id) {
      showError('Please select an operator to assign', 'Validation Error');
      return;
    }

    try {
      if (activeAssignment) {
        await apiClient.put(`/assignments/${activeAssignment.operator.id}`, {
          zone: assignData.zone,
          road_ids: assignData.road_ids
        });
        showSuccess(`Updated road assignments for operator #${activeAssignment.operator.id}`, 'Assignments Updated');
      } else {
        await apiClient.post('/assignments', {
          operator_id: parseInt(assignData.operator_id, 10),
          zone: assignData.zone,
          road_ids: assignData.road_ids
        });
        showSuccess(`Road assignment saved in Supabase`, 'Assignments Saved');
      }

      setIsAssignModalOpen(false);
      setActiveAssignment(null);
      fetchData();
    } catch (err) {
      showError(err.message || 'Failed to save road assignment');
    }
  };

  // Open Transfer Roads Modal
  const handleOpenTransfer = (sourceOp = null) => {
    const srcId = sourceOp ? sourceOp.operator.id : (operators[0]?.id || '');
    const tgtId = operators.find(o => o.id !== srcId)?.id || '';
    const srcAssign = assignments.find(a => a.operator.id === srcId);
    
    setTransferData({
      source_operator_id: srcId,
      target_operator_id: tgtId,
      road_ids: (srcAssign?.assigned_roads || []).map(r => r.id)
    });
    setIsTransferModalOpen(true);
  };

  // Submit Transfer Roads Form
  const handleTransferSubmit = async (e) => {
    e.preventDefault();
    if (!transferData.source_operator_id || !transferData.target_operator_id) {
      showError('Please select both Source and Target operators', 'Validation Error');
      return;
    }
    if (transferData.source_operator_id === transferData.target_operator_id) {
      showError('Source and Target operators must be different', 'Validation Error');
      return;
    }
    if (!transferData.road_ids.length) {
      showError('Please select at least one road corridor to transfer', 'Validation Error');
      return;
    }

    try {
      await apiClient.post('/assignments/transfer', {
        source_operator_id: parseInt(transferData.source_operator_id, 10),
        target_operator_id: parseInt(transferData.target_operator_id, 10),
        road_ids: transferData.road_ids
      });

      showSuccess(`Transferred ${transferData.road_ids.length} road corridors in Supabase`, 'Transfer Complete');
      setIsTransferModalOpen(false);
      fetchData();
    } catch (err) {
      showError(err.message || 'Failed to transfer road corridors');
    }
  };

  // Confirm Delete / Remove Assignment
  const handleConfirmDelete = async () => {
    if (!activeAssignment) return;

    try {
      await apiClient.delete(`/assignments/${activeAssignment.operator.id}`);
      showSuccess(`Removed all road assignments for '${activeAssignment.operator.name}'`, 'Assignments Removed');
      setIsDeleteModalOpen(false);
      setActiveAssignment(null);
      fetchData();
    } catch (err) {
      showError(err.message || 'Failed to remove assignment');
    }
  };

  // Bulk Operations Handlers
  const handleSelectAllOperators = (e) => {
    if (e.target.checked) {
      setSelectedOperatorIds(filteredAssignments.map(a => a.operator.id));
    } else {
      setSelectedOperatorIds([]);
    }
  };

  const handleToggleSelectOperator = (opId) => {
    if (selectedOperatorIds.includes(opId)) {
      setSelectedOperatorIds(selectedOperatorIds.filter(id => id !== opId));
    } else {
      setSelectedOperatorIds([...selectedOperatorIds, opId]);
    }
  };

  const handleOpenBulk = (presetOpIds = null) => {
    const targetOps = presetOpIds || (selectedOperatorIds.length ? selectedOperatorIds : operators.map(o => o.id));
    setBulkData({
      operator_ids: targetOps,
      zone: zones[0] || 'Zone Alpha',
      road_ids: [],
      action: 'ASSIGN'
    });
    setRoadSearchTerm('');
    setIsBulkModalOpen(true);
  };

  const handleBulkSubmit = async (e) => {
    e.preventDefault();
    if (!bulkData.operator_ids.length) {
      showError('Please select at least one operator for bulk assignment', 'Validation Error');
      return;
    }

    try {
      const res = await apiClient.post('/assignments/bulk', bulkData);
      showSuccess(res.message || 'Bulk assignment executed successfully', 'Bulk Action Complete');
      setIsBulkModalOpen(false);
      setSelectedOperatorIds([]);
      fetchData();
    } catch (err) {
      showError(err.message || 'Failed to execute bulk assignment');
    }
  };

  const handleBulkRemoveSelected = async () => {
    if (!selectedOperatorIds.length) return;
    if (!window.confirm(`Are you sure you want to remove all assignments for ${selectedOperatorIds.length} selected operators?`)) return;

    try {
      const res = await apiClient.post('/assignments/bulk', {
        operator_ids: selectedOperatorIds,
        action: 'UNASSIGN'
      });
      showSuccess(res.message || 'Bulk removal executed', 'Assignments Removed');
      setSelectedOperatorIds([]);
      fetchData();
    } catch (err) {
      showError(err.message || 'Failed to perform bulk unassign');
    }
  };

  // Export CSV Handler
  const handleExportCSV = () => {
    if (!filteredAssignments.length) {
      showError('No assignment records available to export', 'Export Error');
      return;
    }

    const headers = ['Operator ID', 'Operator Name', 'Email', 'Primary Zone', 'Assigned Roads Count', 'Assigned Roads', 'Status', 'Assigned By', 'Assigned Date'];
    const rows = filteredAssignments.map(a => [
      a.operator.id,
      `"${a.operator.name.replace(/"/g, '""')}"`,
      `"${a.operator.email.replace(/"/g, '""')}"`,
      `"${(a.assigned_zone || '').replace(/"/g, '""')}"`,
      a.assigned_road_count || 0,
      `"${(a.assigned_roads || []).map(r => r.road_name).join('; ').replace(/"/g, '""')}"`,
      `"${(a.assignment_status || 'ACTIVE').replace(/"/g, '""')}"`,
      `"${(a.assigned_by || 'Admin').replace(/"/g, '""')}"`,
      a.assigned_at ? new Date(a.assigned_at).toISOString().split('T')[0] : ''
    ]);

    const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `operator_assignments_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showSuccess(`Exported ${filteredAssignments.length} assignment records to CSV`, 'Export Complete');
  };

  const getStatusBadgeType = (status) => {
    switch ((status || '').toUpperCase()) {
      case 'ACTIVE': return 'green';
      case 'PENDING': return 'amber';
      case 'UNASSIGNED': return 'red';
      default: return 'green';
    }
  };

  // Source operator's assigned roads for transfer modal
  const sourceAssignedRoads = useMemo(() => {
    if (!transferData.source_operator_id) return [];
    const srcOp = assignments.find(a => a.operator.id === parseInt(transferData.source_operator_id, 10));
    return srcOp ? (srcOp.assigned_roads || []) : [];
  }, [assignments, transferData.source_operator_id]);

  return (
    <DashboardLayout role="Admin">
      <div className="space-y-6 animate-fade-in w-full">

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2.5">
              <FaExchangeAlt className="text-teal-400 text-xl" />
              <span>Operator Assignment Management</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Admin Console: Connect Admin & Operator workflows by assigning duty operators to city zones & road corridors in Supabase.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button variant="secondary" size="sm" onClick={fetchData} className="space-x-1.5">
              <FaSync className={isLoading ? 'animate-spin' : ''} />
              <span>Refresh Roster</span>
            </Button>

            <Button size="sm" onClick={handleExportCSV} className="space-x-1.5 bg-slate-900 border border-slate-800 text-slate-200 hover:text-white">
              <FaFileDownload />
              <span>Export CSV</span>
            </Button>

            <Button size="sm" onClick={() => handleOpenBulk()} className="space-x-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold">
              <FaLayerGroup />
              <span>Bulk Assignment</span>
            </Button>

            <Button size="sm" onClick={() => handleOpenTransfer()} className="space-x-1.5 bg-purple-600 hover:bg-purple-500 text-white font-bold">
              <FaExchangeAlt />
              <span>Transfer Corridors</span>
            </Button>

            <Button size="sm" onClick={() => handleOpenAssign()} className="space-x-1.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold">
              <FaPlus />
              <span>Assign Operator</span>
            </Button>
          </div>
        </div>

        {/* Summary Widgets */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="glass-panel p-3.5 rounded-xl border border-slate-800 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Total Roster</p>
              <h3 className="text-xl font-bold text-slate-100 mt-0.5 font-mono">{stats.totalAssignments}</h3>
            </div>
            <div className="p-2.5 bg-teal-500/10 text-teal-400 rounded-xl">
              <FaUserTie className="text-lg" />
            </div>
          </div>

          <div className="glass-panel p-3.5 rounded-xl border border-slate-800 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Active Duty</p>
              <h3 className="text-xl font-bold text-emerald-400 mt-0.5 font-mono">{stats.activeOperators}</h3>
            </div>
            <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl">
              <FaUserCheck className="text-lg" />
            </div>
          </div>

          <div className="glass-panel p-3.5 rounded-xl border border-slate-800 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Assigned Corridors</p>
              <h3 className="text-xl font-bold text-cyan-400 mt-0.5 font-mono">{stats.totalAssignedRoads}</h3>
            </div>
            <div className="p-2.5 bg-cyan-500/10 text-cyan-400 rounded-xl">
              <FaRoad className="text-lg" />
            </div>
          </div>

          <div className="glass-panel p-3.5 rounded-xl border border-slate-800 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Unassigned Roads</p>
              <h3 className="text-xl font-bold text-amber-400 mt-0.5 font-mono">{stats.unassignedRoads}</h3>
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
                placeholder="Search operator, email, zone, or road name..."
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

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
              
              {/* Zone Filter */}
              <div className="flex items-center space-x-2">
                <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                  <FaFilter className="text-teal-400 text-[10px]" /> Zone:
                </span>
                <select
                  value={selectedZoneFilter}
                  onChange={(e) => setSelectedZoneFilter(e.target.value)}
                  className="bg-slate-900 border border-slate-800 text-slate-200 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-teal-500 cursor-pointer"
                >
                  <option value="ALL">All Zones</option>
                  {zones.map((z) => (
                    <option key={z} value={z}>{z}</option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <div className="flex items-center space-x-2">
                <span className="text-xs text-slate-400 font-medium">Status:</span>
                <select
                  value={selectedStatusFilter}
                  onChange={(e) => setSelectedStatusFilter(e.target.value)}
                  className="bg-slate-900 border border-slate-800 text-slate-200 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-teal-500 cursor-pointer"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="PENDING">PENDING</option>
                  <option value="UNASSIGNED">UNASSIGNED</option>
                </select>
              </div>

              {(searchQuery || selectedZoneFilter !== 'ALL' || selectedStatusFilter !== 'ALL') && (
                <Button variant="ghost" size="sm" onClick={() => { setSearchQuery(''); setSelectedZoneFilter('ALL'); setSelectedStatusFilter('ALL'); }} className="text-xs text-rose-400 hover:text-rose-300">
                  Reset
                </Button>
              )}
            </div>

          </div>
        </Card>

        {/* Bulk Action Bar when operators are selected */}
        {selectedOperatorIds.length > 0 && (
          <div className="bg-indigo-950/80 border border-indigo-500/40 p-3 rounded-xl flex items-center justify-between animate-fade-in">
            <div className="flex items-center space-x-2 text-xs text-indigo-200">
              <FaCheckCircle className="text-indigo-400" />
              <span className="font-bold">{selectedOperatorIds.length} Operator(s) Selected</span>
            </div>
            <div className="flex items-center space-x-2">
              <Button size="sm" onClick={() => handleOpenBulk(selectedOperatorIds)} className="bg-indigo-500 hover:bg-indigo-400 text-slate-950 font-bold text-xs py-1">
                Bulk Assign Zone & Roads
              </Button>
              <Button size="sm" onClick={handleBulkRemoveSelected} className="bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs py-1">
                Bulk Remove
              </Button>
              <button onClick={() => setSelectedOperatorIds([])} className="text-xs text-slate-400 hover:text-slate-200 px-2 py-1">
                Cancel Selection
              </button>
            </div>
          </div>
        )}

        {/* Complete 7-Column Assignment Table */}
        <Card title="City Operator Road Assignments Table" subtitle={`Displaying ${filteredAssignments.length} of ${assignments.length} total assignment records in Supabase`}>
          {isLoading ? (
            <SkeletonTable rows={6} />
          ) : filteredAssignments.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <FaExchangeAlt className="text-4xl text-slate-700 mx-auto" />
              <p className="text-sm font-medium text-slate-400">No operator road assignments found matching current search or filters.</p>
              <Button size="sm" variant="secondary" onClick={() => { setSearchQuery(''); setSelectedZoneFilter('ALL'); setSelectedStatusFilter('ALL'); }}>
                Reset Filters
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="text-[11px] uppercase bg-slate-900/90 text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="py-3.5 px-3 w-8">
                      <input
                        type="checkbox"
                        checked={filteredAssignments.length > 0 && selectedOperatorIds.length === filteredAssignments.length}
                        onChange={handleSelectAllOperators}
                        className="rounded border-slate-700 text-indigo-500 focus:ring-indigo-500 bg-slate-950 cursor-pointer"
                      />
                    </th>
                    <th className="py-3.5 px-4">Operator</th>
                    <th className="py-3.5 px-4">Zone</th>
                    <th className="py-3.5 px-4">Assigned Roads</th>
                    <th className="py-3.5 px-4">Assignment Date</th>
                    <th className="py-3.5 px-4">Assigned By</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-sans">
                  {filteredAssignments.map((a) => {
                    const roadList = a.assigned_roads || [];
                    const isRowSelected = selectedOperatorIds.includes(a.operator.id);

                    return (
                      <tr key={a.id} className={`transition-colors ${isRowSelected ? 'bg-indigo-950/30' : 'hover:bg-slate-900/50'}`}>
                        
                        {/* Checkbox Column */}
                        <td className="py-3.5 px-3">
                          <input
                            type="checkbox"
                            checked={isRowSelected}
                            onChange={() => handleToggleSelectOperator(a.operator.id)}
                            className="rounded border-slate-700 text-indigo-500 focus:ring-indigo-500 bg-slate-950 cursor-pointer"
                          />
                        </td>

                        {/* 1. Operator Column */}
                        <td className="py-3.5 px-4 font-bold text-slate-100 flex items-center space-x-2.5">
                          <div className="w-8 h-8 rounded-full bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 font-bold shrink-0">
                            {a.operator.name.charAt(0)}
                          </div>
                          <div>
                            <span className="text-slate-100 block">{a.operator.name}</span>
                            <span className="text-[10px] text-slate-400 font-mono font-normal block">{a.operator.email}</span>
                          </div>
                        </td>

                        {/* 2. Zone Column */}
                        <td className="py-3.5 px-4 text-slate-300 font-medium">
                          <span className="bg-slate-900 border border-slate-800 px-2 py-0.5 rounded text-[11px]">
                            {a.assigned_zone || 'Zone Alpha'}
                          </span>
                        </td>

                        {/* 3. Assigned Roads Column */}
                        <td className="py-3.5 px-4 max-w-xs">
                          {roadList.length === 0 ? (
                            <span className="text-slate-500 font-mono text-[11px] italic">No roads assigned.</span>
                          ) : (
                            <div className="flex flex-wrap gap-1">
                              {roadList.slice(0, 3).map(r => (
                                <span key={r.id} className="bg-teal-500/10 text-teal-300 border border-teal-500/20 px-1.5 py-0.5 rounded text-[10px] font-mono">
                                  {r.road_name} ({r.road_code || `RD-${r.id}`})
                                </span>
                              ))}
                              {roadList.length > 3 && (
                                <span className="bg-slate-900 text-slate-400 px-1.5 py-0.5 rounded text-[10px] font-mono border border-slate-800">
                                  +{roadList.length - 3} more
                                </span>
                              )}
                            </div>
                          )}
                        </td>

                        {/* 4. Assignment Date Column */}
                        <td className="py-3.5 px-4 font-mono text-slate-400 text-[11px]">
                          {a.assigned_at ? new Date(a.assigned_at).toLocaleDateString() : 'Recent'}
                        </td>

                        {/* 5. Assigned By Column */}
                        <td className="py-3.5 px-4 text-slate-300 text-[11px]">
                          <span className="flex items-center gap-1">
                            <FaUserShield className="text-teal-400 text-[10px]" />
                            {a.assigned_by || 'Admin Chief Controller'}
                          </span>
                        </td>

                        {/* 6. Status Column */}
                        <td className="py-3.5 px-4">
                          <StatusBadge status={a.assignment_status || 'ACTIVE'} type={getStatusBadgeType(a.assignment_status)} />
                        </td>

                        {/* 7. Actions Column */}
                        <td className="py-3.5 px-4 text-right space-x-1.5">
                          {/* View Specs */}
                          <button
                            onClick={() => { setActiveAssignment(a); setIsViewModalOpen(true); }}
                            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-teal-400 hover:border-teal-500/40 transition-colors"
                            title="View Full Assignment Record"
                          >
                            <FaEye />
                          </button>

                          {/* Edit Assignment */}
                          <button
                            onClick={() => handleOpenAssign(a)}
                            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-cyan-400 hover:border-cyan-500/40 transition-colors"
                            title="Edit Assignment & Road Corridors"
                          >
                            <FaEdit />
                          </button>

                          {/* Transfer Roads */}
                          <button
                            onClick={() => handleOpenTransfer(a)}
                            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-purple-400 hover:border-purple-500/40 transition-colors"
                            title="Transfer Road Corridors to Another Operator"
                          >
                            <FaExchangeAlt />
                          </button>

                          {/* Delete / Remove Assignment */}
                          <button
                            onClick={() => { setActiveAssignment(a); setIsDeleteModalOpen(true); }}
                            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-rose-400 hover:border-rose-500/40 transition-colors"
                            title="Remove All Assignments for this Operator"
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

        {/* MODAL 1: ASSIGN / EDIT ASSIGNMENT MODAL (Assignment Dialog) */}
        {isAssignModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="max-w-xl w-full glass-panel p-6 rounded-2xl border border-slate-800 space-y-4 animate-slide-up max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <FaPlus className="text-teal-400" /> {activeAssignment ? `Edit Assignments for '${activeAssignment.operator.name}'` : 'Assign Operator'}
                </h3>
                <button onClick={() => setIsAssignModalOpen(false)} className="text-slate-400 hover:text-slate-200">
                  <FaTimes />
                </button>
              </div>

              <form onSubmit={handleAssignSubmit} className="space-y-4 text-xs">
                
                {/* Operator Dropdown */}
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Operator Dropdown *</label>
                  <select
                    disabled={!!activeAssignment}
                    value={assignData.operator_id}
                    onChange={(e) => setAssignData({ ...assignData, operator_id: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-teal-500 cursor-pointer disabled:opacity-60"
                  >
                    {operators.map(op => (
                      <option key={op.id} value={op.id}>{op.name} ({op.email}) - {op.zone || 'Zone Alpha'}</option>
                    ))}
                  </select>
                </div>

                {/* Zone Dropdown */}
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Zone Dropdown *</label>
                  <select
                    value={assignData.zone}
                    onChange={(e) => setAssignData({ ...assignData, zone: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-teal-500 cursor-pointer"
                  >
                    {zones.map(z => (
                      <option key={z} value={z}>{z}</option>
                    ))}
                  </select>
                </div>

                {/* Multi-select Roads with Search */}
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-slate-300 font-semibold">Multi-select Roads</label>
                    <span className="text-[10px] text-teal-400 font-mono">{assignData.road_ids.length} selected</span>
                  </div>

                  <input
                    type="text"
                    placeholder="Search available roads..."
                    value={roadSearchTerm}
                    onChange={(e) => setRoadSearchTerm(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 mb-2 focus:outline-none focus:border-teal-500"
                  />

                  <div className="max-h-48 overflow-y-auto bg-slate-900 p-2.5 rounded-lg border border-slate-800 space-y-1.5">
                    {allRoads
                      .filter(r => !roadSearchTerm || r.road_name.toLowerCase().includes(roadSearchTerm.toLowerCase()) || (r.road_code && r.road_code.toLowerCase().includes(roadSearchTerm.toLowerCase())))
                      .map((road) => {
                        const isChecked = assignData.road_ids.includes(road.id);
                        const isAssignedElsewhere = road.assigned_operator_id && road.assigned_operator_id !== parseInt(assignData.operator_id, 10);

                        return (
                          <label key={road.id} className={`flex items-center justify-between p-1.5 rounded cursor-pointer transition-colors ${
                            isChecked ? 'bg-teal-500/10 border border-teal-500/30 text-slate-100' : 'hover:bg-slate-800/60 text-slate-300'
                          }`}>
                            <div className="flex items-center space-x-2.5">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setAssignData({ ...assignData, road_ids: [...assignData.road_ids, road.id] });
                                  } else {
                                    setAssignData({ ...assignData, road_ids: assignData.road_ids.filter(id => id !== road.id) });
                                  }
                                }}
                                className="rounded border-slate-700 text-teal-500 focus:ring-teal-500 bg-slate-950"
                              />
                              <div>
                                <span className="font-semibold block">{road.road_name}</span>
                                <span className="text-[10px] text-teal-400 font-mono">({road.road_code || `RD-${road.id}`})</span>
                              </div>
                            </div>

                            {isAssignedElsewhere && (
                              <span className="text-[10px] text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                                Assigned to other (will reassign)
                              </span>
                            )}
                          </label>
                        );
                      })}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 flex justify-end space-x-2">
                  <Button type="button" variant="secondary" onClick={() => setIsAssignModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-teal-500 hover:bg-teal-600 text-slate-950 font-bold">
                    Assign
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL 2: TRANSFER ROADS MODAL */}
        {isTransferModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="max-w-xl w-full glass-panel p-6 rounded-2xl border border-slate-800 space-y-4 animate-slide-up max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <FaExchangeAlt className="text-purple-400" /> Transfer Road Ownership
                </h3>
                <button onClick={() => setIsTransferModalOpen(false)} className="text-slate-400 hover:text-slate-200">
                  <FaTimes />
                </button>
              </div>

              <form onSubmit={handleTransferSubmit} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  
                  {/* Source Operator */}
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Source Operator (Transfer From) *</label>
                    <select
                      value={transferData.source_operator_id}
                      onChange={(e) => {
                        const newSrc = e.target.value;
                        const srcAssign = assignments.find(a => a.operator.id === parseInt(newSrc, 10));
                        setTransferData({
                          ...transferData,
                          source_operator_id: newSrc,
                          road_ids: (srcAssign?.assigned_roads || []).map(r => r.id)
                        });
                      }}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-purple-500 cursor-pointer"
                    >
                      {operators.map(op => (
                        <option key={op.id} value={op.id}>{op.name} ({op.email})</option>
                      ))}
                    </select>
                  </div>

                  {/* Target Operator */}
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Target Operator (Transfer To) *</label>
                    <select
                      value={transferData.target_operator_id}
                      onChange={(e) => setTransferData({ ...transferData, target_operator_id: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-purple-500 cursor-pointer"
                    >
                      {operators
                        .filter(op => op.id !== parseInt(transferData.source_operator_id, 10))
                        .map(op => (
                          <option key={op.id} value={op.id}>{op.name} ({op.email})</option>
                        ))}
                    </select>
                  </div>

                </div>

                {/* Road Checkboxes to Transfer */}
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-slate-300 font-semibold">Select Corridors to Transfer</label>
                    <span className="text-[10px] text-purple-400 font-mono">{transferData.road_ids.length} selected</span>
                  </div>

                  <div className="max-h-48 overflow-y-auto bg-slate-900 p-2.5 rounded-lg border border-slate-800 space-y-1.5">
                    {sourceAssignedRoads.length === 0 ? (
                      <p className="text-slate-500 text-center py-4">Selected source operator has no assigned road corridors.</p>
                    ) : (
                      sourceAssignedRoads.map((road) => {
                        const isChecked = transferData.road_ids.includes(road.id);
                        return (
                          <label key={road.id} className="flex items-center space-x-2.5 text-xs text-slate-300 cursor-pointer hover:bg-slate-800/60 p-1.5 rounded">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setTransferData({ ...transferData, road_ids: [...transferData.road_ids, road.id] });
                                } else {
                                  setTransferData({ ...transferData, road_ids: transferData.road_ids.filter(id => id !== road.id) });
                                }
                              }}
                              className="rounded border-slate-700 text-purple-500 focus:ring-purple-500 bg-slate-950"
                            />
                            <span className="font-bold text-slate-100">{road.road_name}</span>
                            <span className="text-[10px] text-teal-400 font-mono">({road.road_code || `RD-${road.id}`})</span>
                            <span className="text-[10px] text-slate-500 font-mono">[{road.zone}]</span>
                          </label>
                        );
                      })
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 flex justify-end space-x-2">
                  <Button type="button" variant="secondary" onClick={() => setIsTransferModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-purple-600 hover:bg-purple-500 text-white font-bold">
                    Confirm Transfer
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL 3: VIEW ASSIGNMENT RECORD MODAL */}
        {isViewModalOpen && activeAssignment && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="max-w-xl w-full glass-panel p-6 rounded-2xl border border-slate-800 space-y-4 animate-slide-up max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <FaEye className="text-teal-400" /> Assignment Record Specifications #{activeAssignment.id}
                </h3>
                <button onClick={() => setIsViewModalOpen(false)} className="text-slate-400 hover:text-slate-200">
                  <FaTimes />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
                  <span className="text-slate-400 text-[10px] block uppercase font-semibold">Duty Operator</span>
                  <p className="font-bold text-slate-100 text-sm">{activeAssignment.operator.name}</p>
                  <p className="text-[11px] text-slate-400 font-mono">{activeAssignment.operator.email}</p>
                </div>

                <div className="grid grid-cols-2 gap-3 font-mono">
                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-400 block font-sans uppercase font-semibold">Assigned Primary Zone</span>
                    <span className="font-bold text-teal-300 text-sm block mt-0.5">{activeAssignment.assigned_zone || 'Zone Alpha'}</span>
                  </div>

                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-400 block font-sans uppercase font-semibold">Assigned By</span>
                    <span className="font-bold text-slate-200 text-xs block mt-1">{activeAssignment.assigned_by || 'Admin Chief Controller'}</span>
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-slate-200 mb-1.5 flex items-center gap-1.5">
                    <FaRoad className="text-teal-400" />
                    <span>Assigned Corridors ({activeAssignment.assigned_road_count || 0})</span>
                  </h4>

                  <div className="max-h-40 overflow-y-auto bg-slate-950 p-2.5 rounded-xl border border-slate-800 font-mono text-[11px]">
                    {(activeAssignment.assigned_roads || []).length === 0 ? (
                      <p className="text-slate-500 text-center py-3 italic">No roads currently assigned to this operator.</p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {(activeAssignment.assigned_roads || []).map((r) => (
                          <div key={r.id} className="p-2 bg-slate-900 rounded-lg border border-slate-800 flex justify-between items-center">
                            <div>
                              <span className="font-bold text-slate-200 block">{r.road_name}</span>
                              <span className="text-[10px] text-teal-400">{r.road_code || `RD-${r.id}`}</span>
                            </div>
                            <span className="text-[10px] text-slate-400 bg-slate-950 px-1.5 py-0.5 rounded">{r.zone}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

              </div>

              <div className="pt-2 flex justify-end border-t border-slate-800">
                <Button variant="secondary" onClick={() => setIsViewModalOpen(false)}>Close Record</Button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL 4: DELETE CONFIRMATION MODAL */}
        {isDeleteModalOpen && activeAssignment && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="max-w-md w-full glass-panel p-6 rounded-2xl border border-rose-500/30 space-y-4 animate-slide-up">
              <div className="flex items-center space-x-3 text-rose-400">
                <div className="p-3 bg-rose-500/10 rounded-xl border border-rose-500/20">
                  <FaTrash className="text-2xl" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-100">Remove All Assignments?</h3>
                  <p className="text-xs text-rose-400/80">This action will unassign all road corridors from this operator in Supabase.</p>
                </div>
              </div>

              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-1">
                <p>Are you sure you want to remove all assignments for <strong className="text-slate-100">'{activeAssignment.operator.name}'</strong>?</p>
                <p className="text-[11px] text-slate-400">Corridors to unassign: {activeAssignment.assigned_road_count || 0}</p>
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <Button variant="secondary" onClick={() => setIsDeleteModalOpen(false)}>Cancel</Button>
                <Button onClick={handleConfirmDelete} className="bg-rose-500 hover:bg-rose-600 text-white font-bold">
                  Remove Assignments
                </Button>
              </div>
            </div>
          </div>
        )}
        {/* MODAL 5: BULK ASSIGNMENT MODAL */}
        {isBulkModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="max-w-xl w-full glass-panel p-6 rounded-2xl border border-slate-800 space-y-4 animate-slide-up max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <FaLayerGroup className="text-indigo-400" /> Bulk Assignment Management
                </h3>
                <button onClick={() => setIsBulkModalOpen(false)} className="text-slate-400 hover:text-slate-200">
                  <FaTimes />
                </button>
              </div>

              <form onSubmit={handleBulkSubmit} className="space-y-4 text-xs">
                {/* Operators Selection */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-slate-300 font-semibold">Select Target Operators *</label>
                    <span className="text-[10px] text-indigo-400 font-mono">{bulkData.operator_ids.length} selected</span>
                  </div>
                  <div className="max-h-36 overflow-y-auto bg-slate-900 p-2.5 rounded-lg border border-slate-800 space-y-1">
                    {operators.map(op => (
                      <label key={op.id} className="flex items-center space-x-2.5 text-slate-300 hover:bg-slate-800/60 p-1.5 rounded cursor-pointer">
                        <input
                          type="checkbox"
                          checked={bulkData.operator_ids.includes(op.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setBulkData({ ...bulkData, operator_ids: [...bulkData.operator_ids, op.id] });
                            } else {
                              setBulkData({ ...bulkData, operator_ids: bulkData.operator_ids.filter(id => id !== op.id) });
                            }
                          }}
                          className="rounded border-slate-700 text-indigo-500 focus:ring-indigo-500 bg-slate-950"
                        />
                        <span className="font-bold text-slate-100">{op.name}</span>
                        <span className="text-[10px] text-slate-400 font-mono">({op.email})</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Zone Dropdown */}
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Zone Dropdown *</label>
                  <select
                    value={bulkData.zone}
                    onChange={(e) => setBulkData({ ...bulkData, zone: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
                  >
                    {zones.map(z => (
                      <option key={z} value={z}>{z}</option>
                    ))}
                  </select>
                </div>

                {/* Multi-select Roads */}
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-slate-300 font-semibold">Multi-select Roads</label>
                    <span className="text-[10px] text-indigo-400 font-mono">{bulkData.road_ids.length} selected</span>
                  </div>

                  <input
                    type="text"
                    placeholder="Search available roads..."
                    value={roadSearchTerm}
                    onChange={(e) => setRoadSearchTerm(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 mb-2 focus:outline-none focus:border-indigo-500"
                  />

                  <div className="max-h-40 overflow-y-auto bg-slate-900 p-2.5 rounded-lg border border-slate-800 space-y-1">
                    {allRoads
                      .filter(r => !roadSearchTerm || r.road_name.toLowerCase().includes(roadSearchTerm.toLowerCase()) || (r.road_code && r.road_code.toLowerCase().includes(roadSearchTerm.toLowerCase())))
                      .map((road) => {
                        const isChecked = bulkData.road_ids.includes(road.id);
                        return (
                          <label key={road.id} className={`flex items-center justify-between p-1.5 rounded cursor-pointer transition-colors ${
                            isChecked ? 'bg-indigo-500/10 border border-indigo-500/30 text-slate-100' : 'hover:bg-slate-800/60 text-slate-300'
                          }`}>
                            <div className="flex items-center space-x-2.5">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setBulkData({ ...bulkData, road_ids: [...bulkData.road_ids, road.id] });
                                  } else {
                                    setBulkData({ ...bulkData, road_ids: bulkData.road_ids.filter(id => id !== road.id) });
                                  }
                                }}
                                className="rounded border-slate-700 text-indigo-500 focus:ring-indigo-500 bg-slate-950"
                              />
                              <div>
                                <span className="font-semibold block">{road.road_name}</span>
                                <span className="text-[10px] text-teal-400 font-mono">({road.road_code || `RD-${road.id}`})</span>
                              </div>
                            </div>
                          </label>
                        );
                      })}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 flex justify-end space-x-2">
                  <Button type="button" variant="secondary" onClick={() => setIsBulkModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold">
                    Assign
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
};
