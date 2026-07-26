import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { MainLayout } from '../layouts/MainLayout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { FaTrafficLight, FaUser, FaShieldAlt, FaQuestionCircle } from 'react-icons/fa';

export const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { showSuccess, showError } = useToast();

  const [email, setEmail] = useState('operator1@trafficvision.ai');
  const [password, setPassword] = useState('opPass2026!');
  const [selectedRole, setSelectedRole] = useState('Operator');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    if (role === 'Admin') {
      setEmail('admin.chief@trafficvision.ai');
      setPassword('adminpass123');
    } else {
      setEmail('operator1@trafficvision.ai');
      setPassword('opPass2026!');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const userProfile = await login(email, password);
      showSuccess(`Welcome back, ${userProfile.name}!`, 'Authenticated');
      
      const roleUpper = (userProfile.role || '').toUpperCase();
      if (roleUpper === 'ADMIN') {
        navigate('/admin/dashboard', { replace: true });
      } else {
        navigate('/operator/dashboard', { replace: true });
      }
    } catch (err) {
      showError(err.message || 'Invalid authentication credentials', 'Sign-In Failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <MainLayout>
      <div className="min-h-[calc(100vh-12rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md animate-slide-up">
          
          <div className="text-center mb-8">
            <div className="inline-flex p-3 rounded-2xl bg-slate-900 border border-slate-800 mb-3 text-teal-400">
              <FaTrafficLight className="text-3xl" />
            </div>
            <h2 className="text-2xl font-bold text-slate-100 tracking-tight">System Authentication</h2>
            <p className="text-xs text-slate-400 mt-1">TrafficVision AI Portal Sign-In</p>
          </div>

          <Card className="shadow-2xl">
            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Role Presets */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Role Preset Quick Select
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => handleRoleSelect('Operator')}
                    className={`py-2 px-3 rounded-lg text-xs font-medium border flex items-center justify-center space-x-2 transition-all ${
                      selectedRole === 'Operator'
                        ? 'bg-teal-500/20 border-teal-500 text-teal-300'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <FaUser />
                    <span>Operator Login</span>
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => handleRoleSelect('Admin')}
                    className={`py-2 px-3 rounded-lg text-xs font-medium border flex items-center justify-center space-x-2 transition-all ${
                      selectedRole === 'Admin'
                        ? 'bg-teal-500/20 border-teal-500 text-teal-300'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <FaShieldAlt />
                    <span>Admin Login</span>
                  </button>
                </div>
              </div>

              {/* Email Input */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 text-sm focus:outline-none focus:border-teal-500 transition-colors"
                  placeholder="name@trafficvision.ai"
                />
              </div>

              {/* Password Input */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-medium text-slate-300">Password</label>
                  <Link to="/forgot-password" className="text-xs text-teal-400 hover:underline flex items-center gap-1">
                    <FaQuestionCircle className="text-[10px]" />
                    <span>Forgot Password?</span>
                  </Link>
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 text-sm focus:outline-none focus:border-teal-500 transition-colors"
                  placeholder="••••••••••••"
                />
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? 'Authenticating...' : 'Sign In & Access Console'}
                </Button>
              </div>

            </form>
          </Card>

        </div>
      </div>
    </MainLayout>
  );
};
