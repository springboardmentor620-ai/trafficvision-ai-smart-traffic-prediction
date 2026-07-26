import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MainLayout } from '../layouts/MainLayout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { FaTrafficLight, FaEnvelope, FaCheckCircle, FaArrowLeft } from 'react-icons/fa';

export const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email) {
      setIsSubmitted(true);
    }
  };

  return (
    <MainLayout>
      <div className="min-h-[calc(100vh-12rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">

          <div className="text-center mb-8">
            <div className="inline-flex p-3 rounded-2xl bg-slate-900 border border-slate-800 mb-3 text-teal-400">
              <FaTrafficLight className="text-3xl" />
            </div>
            <h2 className="text-2xl font-bold text-slate-100 tracking-tight">Password Reset Portal</h2>
            <p className="text-xs text-slate-400 mt-1">TrafficVision AI Security Administration</p>
          </div>

          <Card className="shadow-2xl">
            {isSubmitted ? (
              <div className="text-center py-4 space-y-4">
                <div className="inline-flex p-3 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                  <FaCheckCircle className="text-3xl" />
                </div>
                <h3 className="text-lg font-bold text-slate-100">Reset Request Dispatched</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Password reset instructions have been dispatched to <span className="text-teal-400 font-mono">{email}</span>. Please verify your inbox and follow the authorization link.
                </p>
                <div className="pt-4">
                  <Link to="/login">
                    <Button variant="secondary" className="w-full space-x-2">
                      <FaArrowLeft />
                      <span>Back to Sign In</span>
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <p className="text-xs text-slate-300 leading-relaxed">
                  Enter your registered personnel email address below. System administrators will issue a single-use authentication token.
                </p>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Registered Personnel Email</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 text-sm">
                      <FaEnvelope />
                    </div>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-9 pr-3.5 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 text-sm focus:outline-none focus:border-teal-500 transition-colors"
                      placeholder="operator@trafficvision.ai"
                    />
                  </div>
                </div>

                <div className="pt-2 space-y-3">
                  <Button type="submit" className="w-full">
                    Dispatch Reset Code
                  </Button>

                  <Link to="/login" className="block text-center text-xs text-slate-400 hover:text-slate-200 transition-colors">
                    Cancel & Return to Login
                  </Link>
                </div>
              </form>
            )}
          </Card>

        </div>
      </div>
    </MainLayout>
  );
};
