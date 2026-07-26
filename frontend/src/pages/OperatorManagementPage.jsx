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
  FaUserPlus,
  FaEdit,
  FaTrash,
  FaCheckCircle,
  FaBan,
  FaSync,
  FaTimes,
  FaRoad,
  FaSearch,
  FaFilter,
  FaEye,
  FaCopy,
  FaKey,
  FaPhone,
  FaEnvelope,
  FaCheck,
  FaExclamationTriangle,
  FaLayerGroup,
  FaToggleOn,
  FaToggleOff,
  FaCalendarAlt,
  FaLock,
  FaFileDownload,
  FaClock,
  FaShieldAlt
} from 'react-icons/fa';

export const OperatorManagementPage = () => {
  const { showSuccess, showError } = useToast();
  
  // Data States
  const [operators, setOperators] = useState([]);
  const [allRoads, setAllRoads] = useState([]);
  const [allZones, setAllZones] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedZoneFilter, setSelectedZoneFilter] = useState('ALL');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('ALL');

  // Modal Visibility States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isAssignRoadsModalOpen, setIsAssignRoadsModalOpen] = useState(false);
  const [isTempPasswordModalOpen, setIsTempPasswordModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Selected Operator & Generated Temp Password State
  const [activeOperator, setActiveOperator] = useState(null);
  const [generatedTempPassword, setGeneratedTempPassword] = useState('');
  const [passwordModalTitle, setPasswordModalTitle] = useState('New Operator Credentials');
  const [hasCopiedPassword, setHasCopiedPassword] = useState(false);

  // Form States
  const [createFormData, setCreateFormData] = useState({
    name: '',
    email: '',
    phone: '',
    zone: 'Zone Alpha',
    shift: 'Day Shift (08:00 - 16:00)',
    designation: 'Senior Traffic Controller',
    assigned_roads: [],
    status: 'ACTIVE'
  });

  const [editFormData, setEditFormData] = useState({
    id: null,
    name: '',
    email: '',
    phone: '',
    zone: '',
    shift: 'Day Shift (08:00 - 16:00)',
    designation: 'Senior Traffic Controller',
    status: 'ACTIVE'
  });

  const [assignRoadsData, setAssignRoadsData] = useState({
    operator_id: null,
    road_ids: []
  });

  // Fetch Operators, Roads, and Zones
  const fetchAllData = async () => {
    setIsLoading(true);
    try {
      const [opsRes, roadsRes, zonesRes] = await Promise.all([
        apiClient.get('/operators'),
        apiClient.get('/roads'),
        apiClient.get('/zones').catch(() => [])
      ]);

      const opsList = Array.isArray(opsRes) ? opsRes : (opsRes.items || []);
      const roadsList = Array.isArray(roadsRes) ? roadsRes : (roadsRes.items || []);
      const zonesList = Array.isArray(zonesRes) ? zonesRes : (zonesRes.items || []);

      setOperators(opsList);
      setAllRoads(roadsList);

      if (zonesList.length > 0) {
        setAllZones(zonesList.map(z => z.zone_name));
      } else {
        const uniqueZones = Array.from(new Set(opsList.map(o => o.zone).filter(Boolean)));
        setAllZones(uniqueZones.length ? uniqueZones : ['Zone Alpha', 'Zone Beta', 'Zone Gamma', 'Zone Delta']);
      }
    } catch (err) {
      showError(err.message || 'Failed to load operator roster from database');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // Compute summary metrics
  const stats = useMemo(() => {
    const total = operators.length;
    const active = operators.filter(o => (o.status || 'ACTIVE').toUpperCase() === 'ACTIVE').length;
    const inactive = operators.filter(o => (o.status || '').toUpperCase() === 'INACTIVE').length;
    const totalRoadsAssigned = operators.reduce((acc, o) => acc + (o.assigned_road_count || 0), 0);
    return { total, active, inactive, totalRoadsAssigned };
  }, [operators]);

  // Filtered operators
  const filteredOperators = useMemo(() => {
    return operators.filter(op => {
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch = 
        !query ||
        op.name.toLowerCase().includes(query) ||
        op.email.toLowerCase().includes(query) ||
        (op.phone && op.phone.toLowerCase().includes(query)) ||
        (op.zone && op.zone.toLowerCase().includes(query)) ||
        (op.shift && op.shift.toLowerCase().includes(query));

      const matchesZone = 
        selectedZoneFilter === 'ALL' ||
        (op.zone && op.zone.toLowerCase() === selectedZoneFilter.toLowerCase());

      const matchesStatus = 
        selectedStatusFilter === 'ALL' ||
        (op.status && op.status.toUpperCase() === selectedStatusFilter.toUpperCase());

      return matchesSearch && matchesZone && matchesStatus;
    });
  }, [operators, searchQuery, selectedZoneFilter, selectedStatusFilter]);

  // Unique email & phone validation helper
  const validateOperatorForm = (email, phone, isEdit = false, currentId = null) => {
    const emailTrim = email.trim().toLowerCase();
    const phoneTrim = phone.trim();

    if (!emailTrim) {
      showError('Email is required', 'Validation Error');
      return false;
    }

    // Email duplicate check
    const duplicateEmail = operators.find(o => 
      o.email.toLowerCase().trim() === emailTrim && 
      (!isEdit || o.id !== currentId)
    );
    if (duplicateEmail) {
      showError(`Email '${emailTrim}' already exists. Emails must be unique.`, 'Duplicate Email Error');
      return false;
    }

    // Phone duplicate check
    if (phoneTrim && phoneTrim !== 'N/A') {
      const duplicatePhone = operators.find(o => 
        o.phone && o.phone.trim() === phoneTrim && 
        (!isEdit || o.id !== currentId)
      );
      if (duplicatePhone) {
        showError(`Phone number '${phoneTrim}' already exists. Phone numbers must be unique.`, 'Duplicate Phone Error');
        return false;
      }
    }

    return true;
  };

  // Create Operator Submit
  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!validateOperatorForm(createFormData.email, createFormData.phone, false)) return;

    try {
      const payload = {
        name: createFormData.name.trim(),
        email: createFormData.email.trim().toLowerCase(),
        phone: createFormData.phone.trim() || undefined,
        zone: createFormData.zone,
        shift: createFormData.shift,
        designation: createFormData.designation,
        assigned_roads: createFormData.assigned_roads,
        status: createFormData.status
      };

      const res = await apiClient.post('/admin/operators', payload);
      
      const createdOp = res.operator || res;
      const tempPass = res.temporary_password || 'OpPass#8f2a';

      showSuccess(`Operator '${createdOp.name}' provisioned successfully in Supabase`, 'Operator Created');

      setIsCreateModalOpen(false);
      setGeneratedTempPassword(tempPass);
      setPasswordModalTitle(`Temporary Credentials for ${createdOp.name}`);
      setHasCopiedPassword(false);
      setIsTempPasswordModalOpen(true);

      setCreateFormData({
        name: '',
        email: '',
        phone: '',
        zone: allZones[0] || 'Zone Alpha',
        shift: 'Day Shift (08:00 - 16:00)',
        designation: 'Senior Traffic Controller',
        assigned_roads: [],
        status: 'ACTIVE'
      });

      fetchAllData();
    } catch (err) {
      showError(err.message || 'Failed to create operator');
    }
  };

  // Open Edit Modal
  const handleOpenEdit = (op) => {
    setActiveOperator(op);
    setEditFormData({
      id: op.id,
      name: op.name || '',
      email: op.email || '',
      phone: op.phone && op.phone !== 'N/A' ? op.phone : '',
      zone: op.zone || 'Zone Alpha',
      shift: op.shift || 'Day Shift (08:00 - 16:00)',
      designation: op.designation || 'Senior Traffic Controller',
      status: op.status || 'ACTIVE'
    });
    setIsEditModalOpen(true);
  };

  // Edit Operator Submit
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!activeOperator || !validateOperatorForm(editFormData.email, editFormData.phone, true, activeOperator.id)) return;

    try {
      const payload = {
        name: editFormData.name.trim(),
        email: editFormData.email.trim().toLowerCase(),
        phone: editFormData.phone.trim() || undefined,
        zone: editFormData.zone,
        shift: editFormData.shift,
        designation: editFormData.designation,
        status: editFormData.status
      };

      await apiClient.put(`/admin/operators/${activeOperator.id}`, payload);
      showSuccess(`Updated profile for operator '${payload.name}'`, 'Profile Updated');
      setIsEditModalOpen(false);
      setActiveOperator(null);
      fetchAllData();
    } catch (err) {
      showError(err.message || 'Failed to update operator profile');
    }
  };

  // 1-Click Activate / Deactivate Toggle
  const handleToggleStatus = async (op) => {
    const newStatus = (op.status || 'ACTIVE').toUpperCase() === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      await apiClient.put(`/admin/operators/${op.id}/status`, { status: newStatus });
      showSuccess(`Operator '${op.name}' account is now ${newStatus}`, 'Status Updated');
      fetchAllData();
    } catch (err) {
      showError(err.message || 'Failed to update operator status');
    }
  };

  // Reset Password Handler
  const handleResetPassword = async (op) => {
    try {
      const res = await apiClient.post(`/admin/operators/${op.id}/reset-password`);
      const tempPass = res.temporary_password || 'ResetPass#7f3b';

      setGeneratedTempPassword(tempPass);
      setPasswordModalTitle(`Password Reset for ${op.name}`);
      setHasCopiedPassword(false);
      setIsTempPasswordModalOpen(true);
      showSuccess(`Password reset generated for '${op.name}'`, 'Password Reset');
    } catch (err) {
      showError(err.message || 'Failed to reset operator password');
    }
  };

  // Confirm Delete Operator
  const handleConfirmDelete = async () => {
    if (!activeOperator) return;

    try {
      await apiClient.delete(`/admin/operators/${activeOperator.id}`);
      showSuccess(`Operator '${activeOperator.name}' removed from Supabase`, 'Operator Deleted');
      setIsDeleteModalOpen(false);
      setActiveOperator(null);
      fetchAllData();
    } catch (err) {
      showError(err.message || 'Failed to delete operator');
    }
  };

  // Copy Password to Clipboard
  const handleCopyPassword = () => {
    navigator.clipboard.writeText(generatedTempPassword);
    setHasCopiedPassword(true);
    showSuccess('Temporary password copied to clipboard', 'Copied!');
  };

  // Export CSV Handler
  const handleExportCSV = () => {
    if (!filteredOperators.length) {
      showError('No operator records available to export', 'Export Error');
      return;
    }

    const headers = ['ID', 'Name', 'Email', 'Phone', 'Zone', 'Designation', 'Shift', 'Assigned Roads Count', 'Status', 'Created Date'];
    const rows = filteredOperators.map(o => [
      o.id,
      `"${o.name.replace(/"/g, '""')}"`,
      `"${o.email.replace(/"/g, '""')}"`,
      `"${(o.phone || '').replace(/"/g, '""')}"`,
      `"${(o.zone || '').replace(/"/g, '""')}"`,
      `"${(o.designation || '').replace(/"/g, '""')}"`,
      `"${(o.shift || '').replace(/"/g, '""')}"`,
      o.assigned_road_count || 0,
      `"${(o.status || 'ACTIVE').replace(/"/g, '""')}"`,
      o.created_at ? new Date(o.created_at).toISOString().split('T')[0] : ''
    ]);

    const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `traffic_operators_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showSuccess(`Exported ${filteredOperators.length} operator records to CSV`, 'Export Complete');
  };

  return (
    <DashboardLayout role="Admin">
      <div className="space-y-6 animate-fade-in w-full">

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2.5">
              <FaUserTie className="text-teal-400 text-xl" />
              <span>Traffic Control Operators Management</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Admin Console: Manage personnel roster, temporary bcrypt password resets, shift assignments, and duty scoping in Supabase.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <Button variant="secondary" size="sm" onClick={fetchAllData} className="space-x-1.5">
              <FaSync className={isLoading ? 'animate-spin' : ''} />
              <span>Refresh Roster</span>
            </Button>

            <Button size="sm" onClick={handleExportCSV} className="space-x-1.5 bg-slate-900 border border-slate-800 text-slate-200 hover:text-white">
              <FaFileDownload />
              <span>Export CSV</span>
            </Button>

            <Button size="sm" onClick={() => setIsCreateModalOpen(true)} className="space-x-1.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold">
              <FaUserPlus />
              <span>Create Operator</span>
            </Button>
          </div>
        </div>

        {/* Summary Dashboard Widgets */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="glass-panel p-3.5 rounded-xl border border-slate-800 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Total Roster</p>
              <h3 className="text-xl font-bold text-slate-100 mt-0.5 font-mono">{stats.total}</h3>
            </div>
            <div className="p-2.5 bg-teal-500/10 text-teal-400 rounded-xl">
              <FaUserTie className="text-lg" />
            </div>
          </div>

          <div className="glass-panel p-3.5 rounded-xl border border-slate-800 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Active Accounts</p>
              <h3 className="text-xl font-bold text-emerald-400 mt-0.5 font-mono">{stats.active}</h3>
            </div>
            <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl">
              <FaCheckCircle className="text-lg" />
            </div>
          </div>

          <div className="glass-panel p-3.5 rounded-xl border border-slate-800 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Deactivated</p>
              <h3 className="text-xl font-bold text-rose-400 mt-0.5 font-mono">{stats.inactive}</h3>
            </div>
            <div className="p-2.5 bg-rose-500/10 text-rose-400 rounded-xl">
              <FaBan className="text-lg" />
            </div>
          </div>

          <div className="glass-panel p-3.5 rounded-xl border border-slate-800 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Assigned Corridors</p>
              <h3 className="text-xl font-bold text-purple-400 mt-0.5 font-mono">{stats.totalRoadsAssigned}</h3>
            </div>
            <div className="p-2.5 bg-purple-500/10 text-purple-400 rounded-xl">
              <FaRoad className="text-lg" />
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
                placeholder="Search name, email, phone, zone, or shift..."
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
                  {allZones.map((z) => (
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
                  <option value="INACTIVE">INACTIVE</option>
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

        {/* Complete 9-Column Operator Table */}
        <Card title="Traffic Operators Roster" subtitle={`Displaying ${filteredOperators.length} of ${operators.length} total operators in Supabase`}>
          {isLoading ? (
            <SkeletonTable rows={6} />
          ) : filteredOperators.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <FaUserTie className="text-4xl text-slate-700 mx-auto" />
              <p className="text-sm font-medium text-slate-400">No traffic operators found matching current search or filters.</p>
              <Button size="sm" variant="secondary" onClick={() => { setSearchQuery(''); setSelectedZoneFilter('ALL'); setSelectedStatusFilter('ALL'); }}>
                Reset Filters
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="text-[11px] uppercase bg-slate-900/90 text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="py-3.5 px-4">Operator Name</th>
                    <th className="py-3.5 px-4">Email Address</th>
                    <th className="py-3.5 px-4">Phone</th>
                    <th className="py-3.5 px-4">Zone</th>
                    <th className="py-3.5 px-4">Assigned Roads</th>
                    <th className="py-3.5 px-4">Shift Schedule</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Last Login</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-sans">
                  {filteredOperators.map((op) => {
                    const isActive = (op.status || 'ACTIVE').toUpperCase() === 'ACTIVE';

                    return (
                      <tr key={op.id} className="hover:bg-slate-900/50 transition-colors">
                        
                        {/* 1. Name Column */}
                        <td className="py-3.5 px-4 font-bold text-slate-100 flex items-center space-x-2.5">
                          <img
                            src={op.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${op.name.replace(' ', '')}`}
                            alt={op.name}
                            className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 shrink-0"
                          />
                          <div>
                            <span className="text-slate-100 block">{op.name}</span>
                            <span className="text-[10px] text-teal-400 font-normal block">{op.designation || 'Senior Traffic Controller'}</span>
                          </div>
                        </td>

                        {/* 2. Email Column */}
                        <td className="py-3.5 px-4 font-mono text-slate-300">
                          {op.email}
                        </td>

                        {/* 3. Phone Column */}
                        <td className="py-3.5 px-4 font-mono text-slate-400">
                          {op.phone || 'N/A'}
                        </td>

                        {/* 4. Zone Column */}
                        <td className="py-3.5 px-4 text-slate-200">
                          <span className="bg-slate-900 border border-slate-800 px-2 py-0.5 rounded text-[11px]">
                            {op.zone || 'Zone Alpha'}
                          </span>
                        </td>

                        {/* 5. Assigned Roads Column */}
                        <td className="py-3.5 px-4 font-mono font-bold text-cyan-400">
                          {op.assigned_road_count || 0} corridors
                        </td>

                        {/* 6. Shift Column */}
                        <td className="py-3.5 px-4 text-slate-300 text-[11px]">
                          <span className="bg-slate-900/90 border border-slate-800 px-2 py-0.5 rounded flex items-center gap-1 w-fit">
                            <FaClock className="text-teal-400 text-[10px]" />
                            {op.shift || 'Day Shift'}
                          </span>
                        </td>

                        {/* 7. Status Column */}
                        <td className="py-3.5 px-4">
                          <StatusBadge status={isActive ? 'ACTIVE' : 'INACTIVE'} type={isActive ? 'green' : 'red'} />
                        </td>

                        {/* 8. Last Login Column */}
                        <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">
                          {op.last_login ? new Date(op.last_login).toLocaleTimeString() : 'Active Recently'}
                        </td>

                        {/* 9. Actions Column */}
                        <td className="py-3.5 px-4 text-right space-x-1.5">
                          {/* View Profile */}
                          <button
                            onClick={() => { setActiveOperator(op); setIsViewModalOpen(true); }}
                            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-teal-400 hover:border-teal-500/40 transition-colors"
                            title="View Full Operator Profile & Performance"
                          >
                            <FaEye />
                          </button>

                          {/* Edit Operator */}
                          <button
                            onClick={() => handleOpenEdit(op)}
                            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-purple-400 hover:border-purple-500/40 transition-colors"
                            title="Edit Operator Profile"
                          >
                            <FaEdit />
                          </button>

                          {/* Activate / Deactivate Toggle */}
                          <button
                            onClick={() => handleToggleStatus(op)}
                            className={`p-1.5 rounded-lg bg-slate-900 border border-slate-800 transition-colors ${
                              isActive ? 'text-emerald-400 hover:text-rose-400 hover:border-rose-500/40' : 'text-rose-400 hover:text-emerald-400 hover:border-emerald-500/40'
                            }`}
                            title={isActive ? 'Deactivate Operator Account' : 'Activate Operator Account'}
                          >
                            {isActive ? <FaToggleOn className="text-base" /> : <FaToggleOff className="text-base" />}
                          </button>

                          {/* Reset Password */}
                          <button
                            onClick={() => handleResetPassword(op)}
                            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-amber-400 hover:border-amber-500/40 transition-colors"
                            title="Reset Operator Password (Temporary)"
                          >
                            <FaKey />
                          </button>

                          {/* Delete Operator */}
                          <button
                            onClick={() => { setActiveOperator(op); setIsDeleteModalOpen(true); }}
                            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-rose-400 hover:border-rose-500/40 transition-colors"
                            title="Delete Operator Account"
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

        {/* MODAL 1: CREATE OPERATOR MODAL */}
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="max-w-xl w-full glass-panel p-6 rounded-2xl border border-slate-800 space-y-4 animate-slide-up max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <FaUserPlus className="text-teal-400" /> Provision New Traffic Operator
                </h3>
                <button onClick={() => setIsCreateModalOpen(false)} className="text-slate-400 hover:text-slate-200">
                  <FaTimes />
                </button>
              </div>

              <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  
                  {/* Name */}
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Sarah Jenkins"
                      value={createFormData.name}
                      onChange={(e) => setCreateFormData({ ...createFormData, name: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-teal-500"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Email Address (Unique) *</label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. sjenkins@trafficvision.ai"
                      value={createFormData.email}
                      onChange={(e) => setCreateFormData({ ...createFormData, email: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-teal-500 font-mono"
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Phone Number (Unique)</label>
                    <input
                      type="text"
                      placeholder="e.g. +91 9876543210"
                      value={createFormData.phone}
                      onChange={(e) => setCreateFormData({ ...createFormData, phone: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-teal-500 font-mono"
                    />
                  </div>

                  {/* Zone */}
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Assigned Primary Zone *</label>
                    <select
                      value={createFormData.zone}
                      onChange={(e) => setCreateFormData({ ...createFormData, zone: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-teal-500 cursor-pointer"
                    >
                      {allZones.map(z => (
                        <option key={z} value={z}>{z}</option>
                      ))}
                    </select>
                  </div>

                  {/* Shift */}
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Shift Schedule *</label>
                    <select
                      value={createFormData.shift}
                      onChange={(e) => setCreateFormData({ ...createFormData, shift: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-teal-500 cursor-pointer"
                    >
                      <option value="Day Shift (08:00 - 16:00)">Day Shift (08:00 - 16:00)</option>
                      <option value="Evening Shift (16:00 - 00:00)">Evening Shift (16:00 - 00:00)</option>
                      <option value="Night Shift (00:00 - 08:00)">Night Shift (00:00 - 08:00)</option>
                    </select>
                  </div>

                  {/* Designation */}
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Designation</label>
                    <input
                      type="text"
                      placeholder="e.g. Senior Traffic Controller"
                      value={createFormData.designation}
                      onChange={(e) => setCreateFormData({ ...createFormData, designation: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-teal-500"
                    />
                  </div>

                </div>

                {/* Assign Initial Roads */}
                <div>
                  <label className="block text-slate-300 font-semibold mb-1.5">Assign Initial Road Corridors (Optional)</label>
                  <div className="max-h-36 overflow-y-auto bg-slate-900 p-2.5 rounded-lg border border-slate-800 space-y-1.5">
                    {allRoads.map((road) => {
                      const isChecked = createFormData.assigned_roads.includes(road.id);
                      return (
                        <label key={road.id} className="flex items-center space-x-2.5 text-xs text-slate-300 cursor-pointer hover:bg-slate-800/60 p-1 rounded">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setCreateFormData({ ...createFormData, assigned_roads: [...createFormData.assigned_roads, road.id] });
                              } else {
                                setCreateFormData({ ...createFormData, assigned_roads: createFormData.assigned_roads.filter(id => id !== road.id) });
                              }
                            }}
                            className="rounded border-slate-700 text-teal-500 focus:ring-teal-500 bg-slate-950"
                          />
                          <span className="font-medium text-slate-200">{road.road_name}</span>
                          <span className="text-[10px] text-teal-400 font-mono">({road.road_code || `RD-${road.id}`})</span>
                          <span className="text-[10px] text-slate-500">[{road.zone}]</span>
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
                    Provision Operator
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL 2: EDIT OPERATOR MODAL */}
        {isEditModalOpen && activeOperator && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="max-w-xl w-full glass-panel p-6 rounded-2xl border border-slate-800 space-y-4 animate-slide-up max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <FaEdit className="text-purple-400" /> Edit Operator Profile #{activeOperator.id}
                </h3>
                <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-slate-200">
                  <FaTimes />
                </button>
              </div>

              <form onSubmit={handleEditSubmit} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  
                  {/* Name */}
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={editFormData.name}
                      onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-teal-500"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Email Address *</label>
                    <input
                      type="email"
                      required
                      value={editFormData.email}
                      onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-teal-500 font-mono"
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Phone Number</label>
                    <input
                      type="text"
                      value={editFormData.phone}
                      onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-teal-500 font-mono"
                    />
                  </div>

                  {/* Zone */}
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Primary Zone *</label>
                    <select
                      value={editFormData.zone}
                      onChange={(e) => setEditFormData({ ...editFormData, zone: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-teal-500 cursor-pointer"
                    >
                      {allZones.map(z => (
                        <option key={z} value={z}>{z}</option>
                      ))}
                    </select>
                  </div>

                  {/* Shift */}
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Shift Schedule *</label>
                    <select
                      value={editFormData.shift}
                      onChange={(e) => setEditFormData({ ...editFormData, shift: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-teal-500 cursor-pointer"
                    >
                      <option value="Day Shift (08:00 - 16:00)">Day Shift (08:00 - 16:00)</option>
                      <option value="Evening Shift (16:00 - 00:00)">Evening Shift (16:00 - 00:00)</option>
                      <option value="Night Shift (00:00 - 08:00)">Night Shift (00:00 - 08:00)</option>
                    </select>
                  </div>

                  {/* Designation */}
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Designation</label>
                    <input
                      type="text"
                      value={editFormData.designation}
                      onChange={(e) => setEditFormData({ ...editFormData, designation: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-teal-500"
                    />
                  </div>

                  {/* Status */}
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Account Status *</label>
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

        {/* MODAL 3: VIEW OPERATOR PROFILE MODAL */}
        {isViewModalOpen && activeOperator && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="max-w-2xl w-full glass-panel p-6 rounded-2xl border border-slate-800 space-y-4 animate-slide-up max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <FaEye className="text-teal-400" /> Operator Profile Specs #{activeOperator.id}
                </h3>
                <button onClick={() => setIsViewModalOpen(false)} className="text-slate-400 hover:text-slate-200">
                  <FaTimes />
                </button>
              </div>

              <div className="space-y-4 text-xs">
                
                {/* Header Card with Avatar */}
                <div className="p-4 bg-slate-900/90 rounded-xl border border-slate-800 flex items-center space-x-4">
                  <img
                    src={activeOperator.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${activeOperator.name.replace(' ', '')}`}
                    alt={activeOperator.name}
                    className="w-16 h-16 rounded-full bg-slate-950 border-2 border-teal-500/40 p-0.5 shadow-lg shrink-0"
                  />
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold text-slate-100">{activeOperator.name}</h3>
                      <StatusBadge status={activeOperator.status || 'ACTIVE'} type={(activeOperator.status || 'ACTIVE').toUpperCase() === 'ACTIVE' ? 'green' : 'red'} />
                    </div>
                    <p className="text-teal-400 font-medium">{activeOperator.designation || 'Senior Traffic Controller'}</p>
                    <p className="text-slate-400 font-mono flex items-center gap-2 text-[11px]">
                      <span><FaEnvelope className="inline mr-1 text-slate-500" />{activeOperator.email}</span>
                      <span>•</span>
                      <span><FaPhone className="inline mr-1 text-slate-500" />{activeOperator.phone || 'N/A'}</span>
                    </p>
                  </div>
                </div>

                {/* Specs Grid */}
                <div className="grid grid-cols-3 gap-3 font-mono text-center">
                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-500 block uppercase font-sans">Assigned Zone</span>
                    <span className="font-bold text-slate-100 text-sm block mt-0.5">{activeOperator.zone || 'Zone Alpha'}</span>
                  </div>

                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-500 block uppercase font-sans">Corridors</span>
                    <span className="font-bold text-teal-400 text-sm block mt-0.5">{activeOperator.assigned_road_count || 0} roads</span>
                  </div>

                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-500 block uppercase font-sans">Shift Schedule</span>
                    <span className="font-bold text-purple-300 text-xs block mt-1">{activeOperator.shift || 'Day Shift'}</span>
                  </div>
                </div>

                {/* Assigned Corridors List */}
                <div>
                  <h4 className="font-bold text-slate-200 mb-2 flex items-center gap-2">
                    <FaRoad className="text-teal-400" />
                    <span>Assigned Corridors ({activeOperator.assigned_road_count || 0})</span>
                  </h4>

                  <div className="max-h-36 overflow-y-auto bg-slate-950 p-2.5 rounded-xl border border-slate-800 font-mono text-[11px]">
                    {(activeOperator.assigned_roads || []).length === 0 ? (
                      <p className="text-slate-500 text-center py-3">No roads currently assigned to this operator.</p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {(activeOperator.assigned_roads || []).map((r) => (
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

                {/* Recent Alerts */}
                <div>
                  <h4 className="font-bold text-slate-200 mb-2 flex items-center gap-2">
                    <FaExclamationTriangle className="text-amber-400" />
                    <span>Recent Corridor Alerts ({(activeOperator.recent_alerts || []).length})</span>
                  </h4>

                  <div className="max-h-32 overflow-y-auto bg-slate-950 p-2.5 rounded-xl border border-slate-800 font-mono text-[11px]">
                    {(activeOperator.recent_alerts || []).length === 0 ? (
                      <p className="text-slate-500 text-center py-2">No alerts generated on assigned corridors.</p>
                    ) : (
                      <table className="w-full text-left text-slate-300">
                        <thead className="bg-slate-900 text-slate-400 border-b border-slate-800 text-[10px] uppercase">
                          <tr>
                            <th className="py-1 px-2">Corridor</th>
                            <th className="py-1 px-2">Alert Type</th>
                            <th className="py-1 px-2">Severity</th>
                            <th className="py-1 px-2">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                          {(activeOperator.recent_alerts || []).map((alt) => (
                            <tr key={alt.id} className="hover:bg-slate-900/60">
                              <td className="py-1 px-2 font-bold text-slate-200">{alt.road_name}</td>
                              <td className="py-1 px-2 text-slate-300 font-sans">{alt.alert_type}</td>
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

                {/* Activity History */}
                <div>
                  <h4 className="font-bold text-slate-200 mb-2 flex items-center gap-2">
                    <FaClock className="text-cyan-400" />
                    <span>Activity History & Event Logs</span>
                  </h4>

                  <div className="max-h-28 overflow-y-auto bg-slate-950 p-2.5 rounded-xl border border-slate-800 font-mono text-[11px]">
                    {(activeOperator.activity_history || activeOperator.recent_activity || []).length === 0 ? (
                      <p className="text-slate-500 text-center py-2">No recent activity logged for operator.</p>
                    ) : (
                      <ul className="space-y-1.5">
                        {(activeOperator.activity_history || activeOperator.recent_activity || []).map((act, index) => (
                          <li key={index} className="flex justify-between items-center bg-slate-900/60 p-1.5 rounded border border-slate-800/80">
                            <span className="text-slate-300 font-sans">{act.text}</span>
                            <span className="text-[10px] text-teal-400 font-mono">{act.timestamp}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>

              </div>

              <div className="pt-2 flex justify-end border-t border-slate-800">
                <Button variant="secondary" onClick={() => setIsViewModalOpen(false)}>Close Profile</Button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL 4: TEMPORARY PASSWORD DISPLAY MODAL */}
        {isTempPasswordModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="max-w-md w-full glass-panel p-6 rounded-2xl border border-teal-500/40 space-y-4 animate-slide-up">
              <div className="flex items-center space-x-3 text-teal-400">
                <div className="p-3 bg-teal-500/10 rounded-xl border border-teal-500/20">
                  <FaShieldAlt className="text-2xl" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-100">{passwordModalTitle}</h3>
                  <p className="text-xs text-slate-400">Secure temporary password generated & bcrypt hashed in Supabase.</p>
                </div>
              </div>

              <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 text-center space-y-2">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block">Temporary Password (Share with Operator)</span>
                <div className="text-xl font-mono font-extrabold text-teal-300 bg-slate-950 py-2.5 px-4 rounded-lg border border-teal-500/30 select-all tracking-wider">
                  {generatedTempPassword}
                </div>
                <p className="text-[11px] text-rose-400/90 italic">
                  Note: Only the bcrypt hash is stored in Supabase. Store or communicate this temporary password securely.
                </p>
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <Button onClick={handleCopyPassword} className="space-x-1.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold">
                  {hasCopiedPassword ? <FaCheck /> : <FaCopy />}
                  <span>{hasCopiedPassword ? 'Copied!' : 'Copy Password'}</span>
                </Button>
                <Button variant="secondary" onClick={() => setIsTempPasswordModalOpen(false)}>
                  Done
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL 5: DELETE CONFIRMATION MODAL */}
        {isDeleteModalOpen && activeOperator && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="max-w-md w-full glass-panel p-6 rounded-2xl border border-rose-500/30 space-y-4 animate-slide-up">
              <div className="flex items-center space-x-3 text-rose-400">
                <div className="p-3 bg-rose-500/10 rounded-xl border border-rose-500/20">
                  <FaTrash className="text-2xl" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-100">Delete Operator Account?</h3>
                  <p className="text-xs text-rose-400/80">This action will remove the operator record and unassign their roads in Supabase.</p>
                </div>
              </div>

              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-1">
                <p>Are you sure you want to delete <strong className="text-slate-100">'{activeOperator.name}'</strong> ({activeOperator.email})?</p>
                <p className="text-[11px] text-slate-400">Assigned Corridors: {activeOperator.assigned_road_count || 0}</p>
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <Button variant="secondary" onClick={() => setIsDeleteModalOpen(false)}>Cancel</Button>
                <Button onClick={handleConfirmDelete} className="bg-rose-500 hover:bg-rose-600 text-white font-bold">
                  Delete Operator
                </Button>
              </div>
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
};
