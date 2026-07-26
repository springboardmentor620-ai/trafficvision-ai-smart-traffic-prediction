import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { SkeletonTable } from '../components/ui/Skeleton';
import { useToast } from '../contexts/ToastContext';
import apiClient from '../services/api';
import {
  FaRoad,
  FaUserTie,
  FaSearch,
  FaFilter,
  FaSync,
  FaCheckCircle,
  FaBan,
  FaEdit,
  FaEye,
  FaTimes,
  FaLayerGroup,
  FaPhone,
  FaCheck,
  FaExchangeAlt
} from 'react-icons/fa';

export const RoadAssignmentPage = () => {
  const { showSuccess, showError } = useToast();

  // Data States
  const [operators, setOperators] = useState([]);
  const [allRoads, setAllRoads] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedZoneFilter, setSelectedZoneFilter] = useState('ALL');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('ALL');

  // Modal Visibility States
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Active Selected States
  const [selectedOperator, setSelectedOperator] = useState(null);
  const [modalSearchQuery, setModalSearchQuery] = useState('');

  // Form Input States
  const [assignData, setAssignData] = useState({
    operator_id: null,
    operator_name: '',
    zone: '',
    road_ids: []
  });

  const [editFormData, setEditFormData] = useState({
    id: null,
    name: '',
    email: '',
    phone: '',
    zone: '',
    status: 'ACTIVE'
  });

  const availableZones = [
    'Zone Alpha - Financial District',
    'Zone Beta - Midtown Hub',
    'Zone Gamma - Harbor Expressway',
    'Zone Delta - Suburban Arterial'
  ];

  // Fetch Operators & Roads
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const params = {};
      if (searchQuery.trim()) params.search = searchQuery.trim();
      if (selectedZoneFilter !== 'ALL') params.zone = selectedZoneFilter;
      if (selectedStatusFilter !== 'ALL') params.status = selectedStatusFilter;

      const [operatorsData, roadsData] = await Promise.all([
        apiClient.get('/admin/operators', { params }),
        apiClient.get('/admin/roads')
      ]);

      setOperators(operatorsData);
      setAllRoads(roadsData);
    } catch (err) {
      showError(err.message || 'Failed to load road assignment roster');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedZoneFilter, selectedStatusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchData();
  };

  // --- 1. OPEN ASSIGN ROADS MODAL ---
  const handleOpenAssignModal = (op) => {
    setSelectedOperator(op);
    const currentlyAssignedIds = op.assigned_roads ? op.assigned_roads.map((r) => r.id) : [];
    setAssignData({
      operator_id: op.id,
      operator_name: op.name,
      zone: op.zone || availableZones[0],
      road_ids: currentlyAssignedIds
    });
    setModalSearchQuery('');
    setIsAssignModalOpen(true);
  };

  const handleToggleRoadSelection = (roadId) => {
    setAssignData((prev) => {
      const exists = prev.road_ids.includes(roadId);
      const updatedIds = exists
        ? prev.road_ids.filter((id) => id !== roadId)
        : [...prev.road_ids, roadId];
      return { ...prev, road_ids: updatedIds };
    });
  };

  const handleAssignSave = async (e) => {
    e.preventDefault();
    try {
      await apiClient.put(`/admin/operators/${assignData.operator_id}/assign-roads`, {
        zone: assignData.zone,
        road_ids: assignData.road_ids
      });

      showSuccess(
        `Assigned ${assignData.road_ids.length} road corridor(s) to '${assignData.operator_name}'`,
        'Road Assignments Saved'
      );
      setIsAssignModalOpen(false);
      fetchData();
    } catch (err) {
      showError(err.message || 'Failed to update road corridor assignments');
    }
  };

  // --- 2. VIEW ASSIGNED ROADS MODAL ---
  const handleOpenViewModal = (op) => {
    setSelectedOperator(op);
    setIsViewModalOpen(true);
  };

  // --- 3. EDIT OPERATOR PROFILE ---
  const handleOpenEditModal = (op) => {
    setEditFormData({
      id: op.id,
      name: op.name,
      email: op.email,
      phone: op.phone === 'N/A' ? '' : op.phone,
      zone: op.zone,
      status: op.status || 'ACTIVE'
    });
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await apiClient.put(`/admin/operators/${editFormData.id}`, {
        name: editFormData.name,
        email: editFormData.email,
        phone: editFormData.phone,
        zone: editFormData.zone,
        status: editFormData.status
      });

      showSuccess(`Operator '${editFormData.name}' profile updated successfully`, 'Operator Profile Updated');
      setIsEditModalOpen(false);
      fetchData();
    } catch (err) {
      showError(err.message || 'Failed to update operator details');
    }
  };

  // --- 4. TOGGLE STATUS (DEACTIVATE / ACTIVATE) ---
  const handleToggleStatus = async (op) => {
    const nextStatus = op.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    const actionText = nextStatus === 'ACTIVE' ? 'activate' : 'deactivate';

    if (!window.confirm(`Are you sure you want to ${actionText} operator '${op.name}'?`)) return;

    try {
      await apiClient.put(`/admin/operators/${op.id}/status`, { status: nextStatus });
      showSuccess(`Operator '${op.name}' status set to ${nextStatus}`, `Operator ${nextStatus}`);
      fetchData();
    } catch (err) {
      showError(err.message || `Failed to ${actionText} operator account`);
    }
  };

  // Filter available roads inside assign modal
  const filteredModalRoads = allRoads.filter((r) => {
    if (!modalSearchQuery.trim()) return true;
    const query = modalSearchQuery.toLowerCase();
    return (
      r.road_name.toLowerCase().includes(query) ||
      r.zone.toLowerCase().includes(query) ||
      (r.assigned_operator_name && r.assigned_operator_name.toLowerCase().includes(query))
    );
  });

  return (
    <DashboardLayout role="Admin">
      <div className="space-y-6 animate-fade-in">

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2.5">
              <FaExchangeAlt className="text-teal-400 text-xl" />
              <span>Road Corridor Assignment Console</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Control Center: Assign city traffic corridors and primary monitoring zones to duty operators.
            </p>
          </div>

          <Button variant="secondary" size="sm" onClick={fetchData} className="space-x-1.5 w-fit">
            <FaSync className={isLoading ? 'animate-spin' : ''} />
            <span>Refresh Assignments</span>
          </Button>
        </div>

        {/* Filter Toolbar */}
        <Card className="bg-slate-900/60 border-slate-800 p-4">
          <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search Operator */}
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Search Roster
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Operator Name, Email..."
                  className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 text-xs focus:outline-none focus:border-teal-500"
                />
                <FaSearch className="absolute left-3 top-3 text-slate-500 text-xs" />
              </div>
            </div>

            {/* Zone Filter */}
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Assigned Zone
              </label>
              <select
                value={selectedZoneFilter}
                onChange={(e) => setSelectedZoneFilter(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 text-xs focus:outline-none focus:border-teal-500 cursor-pointer"
              >
                <option value="ALL">All Zones</option>
                {availableZones.map((z) => (
                  <option key={z} value={z}>{z}</option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Account Status
              </label>
              <select
                value={selectedStatusFilter}
                onChange={(e) => setSelectedStatusFilter(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 text-xs focus:outline-none focus:border-teal-500 cursor-pointer"
              >
                <option value="ALL">All Statuses</option>
                <option value="ACTIVE">ACTIVE</option>
                <option value="INACTIVE">INACTIVE</option>
              </select>
            </div>

            {/* Filter Action Buttons */}
            <div className="flex items-end space-x-2">
              <Button type="submit" size="sm" className="w-full space-x-1">
                <FaFilter />
                <span>Filter Roster</span>
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedZoneFilter('ALL');
                  setSelectedStatusFilter('ALL');
                }}
              >
                Reset
              </Button>
            </div>
          </form>
        </Card>

        {/* Operator Roster Table */}
        <Card title="Traffic Operators & Corridor Mapping" subtitle={`Showing ${operators.length} registered personnel`}>
          {isLoading ? (
            <SkeletonTable rows={7} />
          ) : operators.length === 0 ? (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <FaUserTie className="mx-auto text-4xl text-slate-600" />
              <p className="text-sm font-semibold">No operators found matching filter criteria.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="text-[11px] uppercase bg-slate-900/90 text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="py-3.5 px-4">Operator Name</th>
                    <th className="py-3.5 px-4">Email</th>
                    <th className="py-3.5 px-4">Assigned Zone</th>
                    <th className="py-3.5 px-4">Assigned Roads Count</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {operators.map((op) => {
                    const isActive = (op.status || 'ACTIVE').toUpperCase() === 'ACTIVE';
                    const roadCount = op.assigned_road_count || (op.assigned_roads ? op.assigned_roads.length : 0);

                    return (
                      <tr key={op.id} className="hover:bg-slate-900/50 transition-colors">
                        
                        {/* Operator Name */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 rounded-full bg-teal-500/20 text-teal-400 font-bold flex items-center justify-center text-xs border border-teal-500/30">
                              {op.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-bold text-slate-100">{op.name}</div>
                              {op.phone && op.phone !== 'N/A' && (
                                <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                                  <FaPhone className="text-[8px] text-slate-500" /> {op.phone}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Email */}
                        <td className="py-3.5 px-4 font-mono text-slate-300">
                          {op.email}
                        </td>

                        {/* Assigned Zone */}
                        <td className="py-3.5 px-4">
                          <span className="inline-flex items-center gap-1 bg-slate-900 px-2.5 py-1 rounded border border-slate-800 text-teal-300 font-medium text-[11px]">
                            <FaLayerGroup className="text-teal-400 text-[10px]" />
                            {op.zone || 'Unassigned'}
                          </span>
                        </td>

                        {/* Assigned Roads Count */}
                        <td className="py-3.5 px-4 font-mono">
                          {roadCount > 0 ? (
                            <span className="inline-flex items-center gap-1.5 text-teal-400 bg-teal-500/10 border border-teal-500/30 px-2.5 py-1 rounded-md text-xs font-bold">
                              <FaRoad className="text-[10px]" /> {roadCount} Road Corridors
                            </span>
                          ) : (
                            <span className="text-amber-400/90 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-md text-[11px] font-semibold">
                              0 Corridors Assigned
                            </span>
                          )}
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-4">
                          {isActive ? (
                            <span className="inline-flex items-center gap-1 text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 rounded-md text-[11px] font-semibold">
                              <FaCheckCircle className="text-[10px]" /> ACTIVE
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-rose-400 bg-rose-500/10 border border-rose-500/30 px-2.5 py-1 rounded-md text-[11px] font-semibold">
                              <FaBan className="text-[10px]" /> INACTIVE
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end space-x-1.5">
                            
                            {/* Assign Roads Button */}
                            <Button
                              size="sm"
                              onClick={() => handleOpenAssignModal(op)}
                              className="bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 border border-teal-500/40 text-[11px] space-x-1 px-2.5 py-1"
                            >
                              <FaRoad className="text-[10px]" />
                              <span>Assign Roads</span>
                            </Button>

                            {/* View Assigned Roads */}
                            <button
                              onClick={() => handleOpenViewModal(op)}
                              className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-teal-400 hover:border-teal-500/40 transition-colors"
                              title="View Assigned Corridors"
                            >
                              <FaEye />
                            </button>

                            {/* Edit */}
                            <button
                              onClick={() => handleOpenEditModal(op)}
                              className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-sky-400 hover:border-sky-500/40 transition-colors"
                              title="Edit Operator Profile"
                            >
                              <FaEdit />
                            </button>

                            {/* Deactivate / Activate */}
                            <button
                              onClick={() => handleToggleStatus(op)}
                              className={`p-1.5 rounded-lg bg-slate-900 border border-slate-800 transition-colors ${
                                isActive ? 'text-slate-300 hover:text-rose-400 hover:border-rose-500/40' : 'text-slate-300 hover:text-emerald-400 hover:border-emerald-500/40'
                              }`}
                              title={isActive ? 'Deactivate Operator' : 'Activate Operator'}
                            >
                              {isActive ? <FaBan /> : <FaCheckCircle />}
                            </button>

                          </div>
                        </td>

                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* MODAL 1: ASSIGN ROADS (SEARCHABLE MULTI-SELECT) */}
        {isAssignModalOpen && selectedOperator && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="max-w-xl w-full glass-panel p-6 rounded-2xl border border-slate-800 space-y-4 animate-slide-up shadow-2xl">
              
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <div>
                  <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                    <FaRoad className="text-teal-400" /> Assign Roads to '{assignData.operator_name}'
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Assigned Zone: <span className="text-teal-300 font-semibold">{assignData.zone}</span>
                  </p>
                </div>
                <button onClick={() => setIsAssignModalOpen(false)} className="text-slate-400 hover:text-slate-200">
                  <FaTimes />
                </button>
              </div>

              <form onSubmit={handleAssignSave} className="space-y-4 text-xs">
                
                {/* Zone Selection */}
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Primary Assigned Zone</label>
                  <select
                    value={assignData.zone}
                    onChange={(e) => setAssignData({ ...assignData, zone: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-teal-500 cursor-pointer"
                  >
                    {availableZones.map((z) => (
                      <option key={z} value={z}>{z}</option>
                    ))}
                  </select>
                </div>

                {/* Searchable Multi-Select Road List */}
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-slate-300 font-medium">
                      Select Road Corridors ({assignData.road_ids.length} Selected)
                    </label>
                    <button
                      type="button"
                      onClick={() => setAssignData((prev) => ({ ...prev, road_ids: [] }))}
                      className="text-[11px] text-teal-400 hover:underline font-medium"
                    >
                      Clear All Selections
                    </button>
                  </div>

                  {/* Search input for roads */}
                  <div className="relative mb-2">
                    <input
                      type="text"
                      value={modalSearchQuery}
                      onChange={(e) => setModalSearchQuery(e.target.value)}
                      placeholder="Search available roads by name or zone..."
                      className="w-full pl-8 pr-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-200 text-xs focus:outline-none focus:border-teal-500"
                    />
                    <FaSearch className="absolute left-2.5 top-2.5 text-slate-500 text-xs" />
                  </div>

                  {/* Road items scroll box */}
                  <div className="max-h-60 overflow-y-auto bg-slate-950 p-2 rounded-xl border border-slate-800 space-y-1.5">
                    {filteredModalRoads.length === 0 ? (
                      <p className="text-slate-500 text-center py-4">No roads match search query.</p>
                    ) : (
                      filteredModalRoads.map((r) => {
                        const isSelected = assignData.road_ids.includes(r.id);
                        const isAssignedToOther =
                          r.assigned_operator_id && r.assigned_operator_id !== assignData.operator_id;

                        return (
                          <label
                            key={r.id}
                            className={`flex items-center justify-between p-2.5 rounded-lg border text-xs cursor-pointer transition-colors ${
                              isSelected
                                ? 'bg-teal-500/10 border-teal-500/50 text-slate-100'
                                : 'bg-slate-900/50 border-slate-800 text-slate-300 hover:border-slate-700'
                            }`}
                          >
                            <div className="flex items-center space-x-2.5">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => handleToggleRoadSelection(r.id)}
                                className="accent-teal-500 rounded"
                              />
                              <div>
                                <span className="font-bold text-slate-200">{r.road_name}</span>
                                <span className="text-[10px] text-slate-400 block">{r.zone}</span>
                              </div>
                            </div>

                            <div className="text-right">
                              {isAssignedToOther ? (
                                <span className="text-[10px] bg-amber-500/10 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded font-mono">
                                  Assigned to: {r.assigned_operator_name}
                                </span>
                              ) : isSelected ? (
                                <span className="text-[10px] bg-teal-500/20 text-teal-300 border border-teal-500/40 px-2 py-0.5 rounded font-mono flex items-center gap-1">
                                  <FaCheck className="text-[9px]" /> Selected
                                </span>
                              ) : (
                                <span className="text-[10px] bg-slate-900 text-slate-400 border border-slate-800 px-2 py-0.5 rounded font-mono">
                                  Unassigned
                                </span>
                              )}
                            </div>
                          </label>
                        );
                      })
                    )}
                  </div>
                </div>

                <div className="pt-2 flex justify-end space-x-2 border-t border-slate-800">
                  <Button type="button" variant="secondary" onClick={() => setIsAssignModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold">
                    Save Assignment
                  </Button>
                </div>

              </form>
            </div>
          </div>
        )}

        {/* MODAL 2: VIEW ASSIGNED ROADS DETAILS */}
        {isViewModalOpen && selectedOperator && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="max-w-md w-full glass-panel p-6 rounded-2xl border border-slate-800 space-y-4 animate-slide-up">
              
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <FaEye className="text-teal-400" /> Corridors Assigned to '{selectedOperator.name}'
                </h3>
                <button onClick={() => setIsViewModalOpen(false)} className="text-slate-400 hover:text-slate-200">
                  <FaTimes />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block">Primary Zone</span>
                    <span className="font-bold text-teal-300">{selectedOperator.zone}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-500 uppercase block">Total Corridors</span>
                    <span className="font-bold font-mono text-teal-400 text-sm">
                      {selectedOperator.assigned_roads ? selectedOperator.assigned_roads.length : 0}
                    </span>
                  </div>
                </div>

                <div>
                  <h5 className="font-semibold text-slate-200 mb-1.5">Assigned Corridors List</h5>
                  {selectedOperator.assigned_roads && selectedOperator.assigned_roads.length > 0 ? (
                    <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
                      {selectedOperator.assigned_roads.map((r) => (
                        <div key={r.id} className="p-2.5 bg-slate-900 rounded-lg border border-slate-800 flex items-center justify-between">
                          <span className="font-semibold text-slate-200">{r.road_name}</span>
                          <span className="text-[10px] text-slate-400 bg-slate-950 px-2 py-0.5 rounded font-mono">{r.zone}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-300 text-center">
                      No roads have been assigned to this operator yet.
                    </div>
                  )}
                </div>

              </div>

              <div className="pt-2 flex justify-end">
                <Button variant="secondary" onClick={() => setIsViewModalOpen(false)}>
                  Close
                </Button>
              </div>

            </div>
          </div>
        )}

        {/* MODAL 3: EDIT OPERATOR PROFILE */}
        {isEditModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="max-w-md w-full glass-panel p-6 rounded-2xl border border-slate-800 space-y-4 animate-slide-up">
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <FaEdit className="text-teal-400" /> Edit Operator Profile
                </h3>
                <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-slate-200">
                  <FaTimes />
                </button>
              </div>

              <form onSubmit={handleEditSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={editFormData.name}
                    onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={editFormData.email}
                    onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={editFormData.phone}
                    onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                    placeholder="+1 (555) 000-0000"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Assigned Zone</label>
                    <select
                      value={editFormData.zone}
                      onChange={(e) => setEditFormData({ ...editFormData, zone: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-teal-500 cursor-pointer"
                    >
                      {availableZones.map((z) => (
                        <option key={z} value={z}>{z}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Status</label>
                    <select
                      value={editFormData.status}
                      onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-teal-500 cursor-pointer"
                    >
                      <option value="ACTIVE">ACTIVE</option>
                      <option value="INACTIVE">INACTIVE</option>
                    </select>
                  </div>
                </div>

                <div className="pt-2 flex justify-end space-x-2">
                  <Button type="button" variant="secondary" onClick={() => setIsEditModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Save Changes</Button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
};
