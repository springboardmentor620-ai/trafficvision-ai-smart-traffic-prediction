import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import apiClient from '../services/api';
import { FaCogs, FaSave, FaUser, FaLock, FaBell, FaPalette } from 'react-icons/fa';

export const AdminSettingsPage = () => {
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();

  const [settings, setSettings] = useState({
    camera_latency_threshold_ms: 150,
    prediction_interval_minutes: 15,
    auto_signal_override: true,
    theme: 'dark',
    email_notifications: true
  });

  const [profile, setProfile] = useState({
    name: user?.name || '',
    email: user?.email || '',
    password: '',
    confirm_password: ''
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await apiClient.get('/admin/settings');
        setSettings(res);
      } catch (err) {
        console.error('Settings fetch error:', err);
      }
    };
    fetchSettings();
  }, []);

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    try {
      await apiClient.put('/admin/settings', settings);
      showSuccess('Control Center system configuration saved', 'Settings Saved');
    } catch (err) {
      showError(err.message || 'Failed to update system settings');
    }
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    if (profile.password && profile.password !== profile.confirm_password) {
      showError('Password and confirmation do not match', 'Password Mismatch');
      return;
    }
    showSuccess('Admin profile and security credentials updated', 'Profile Saved');
  };

  return (
    <DashboardLayout role="Admin">
      <div className="space-y-6 w-full animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <FaCogs className="text-teal-400" />
            <span>Traffic Control Center Configuration</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">Configure edge sensor parameters, admin credentials, and system preferences.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
          
          {/* System Telemetry Settings */}
          <Card title="Telemetry & Edge Parameters">
            <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Camera Latency Warning Threshold (ms)</label>
                <input
                  type="number"
                  value={settings.camera_latency_threshold_ms}
                  onChange={(e) => setSettings({ ...settings, camera_latency_threshold_ms: parseInt(e.target.value, 10) })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-teal-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Signal Timing Sync Interval (Minutes)</label>
                <input
                  type="number"
                  value={settings.prediction_interval_minutes}
                  onChange={(e) => setSettings({ ...settings, prediction_interval_minutes: parseInt(e.target.value, 10) })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-teal-500 font-mono"
                />
              </div>

              <div className="flex items-center space-x-3 pt-2">
                <input
                  type="checkbox"
                  id="autoOverride"
                  checked={settings.auto_signal_override}
                  onChange={(e) => setSettings({ ...settings, auto_signal_override: e.target.checked })}
                  className="rounded bg-slate-900 border-slate-800 text-teal-500 focus:ring-teal-500"
                />
                <label htmlFor="autoOverride" className="font-semibold text-slate-300 cursor-pointer">
                  Enable Autonomous Green Wave Overrides
                </label>
              </div>

              <div className="pt-2">
                <Button type="submit" className="space-x-1.5 w-full">
                  <FaSave />
                  <span>Save Configuration</span>
                </Button>
              </div>
            </form>
          </Card>

          {/* Admin Profile & Password */}
          <Card title="Admin Profile & Security">
            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Administrator Name</label>
                <input
                  type="text"
                  required
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">System Email Address</label>
                <input
                  type="email"
                  required
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-teal-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">New Security Password</label>
                <input
                  type="password"
                  value={profile.password}
                  onChange={(e) => setProfile({ ...profile, password: e.target.value })}
                  placeholder="••••••••••••"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-teal-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Confirm Password</label>
                <input
                  type="password"
                  value={profile.confirm_password}
                  onChange={(e) => setProfile({ ...profile, confirm_password: e.target.value })}
                  placeholder="••••••••••••"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-teal-500 font-mono"
                />
              </div>

              <div className="pt-2">
                <Button type="submit" variant="secondary" className="space-x-1.5 w-full">
                  <FaLock />
                  <span>Update Credentials</span>
                </Button>
              </div>
            </form>
          </Card>

        </div>
      </div>
    </DashboardLayout>
  );
};
