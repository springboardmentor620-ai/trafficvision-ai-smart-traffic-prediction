import React from 'react';
import { Link } from 'react-router-dom';
import { MainLayout } from '../layouts/MainLayout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { FaTrafficLight, FaExclamationTriangle, FaHome } from 'react-icons/fa';

export const NotFoundPage = () => {
  return (
    <MainLayout>
      <div className="min-h-[calc(100vh-12rem)] flex items-center justify-center py-12 px-4 text-center">
        <div className="max-w-md w-full">
          <Card className="p-8">
            <div className="inline-flex p-4 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 mb-4">
              <FaExclamationTriangle className="text-4xl" />
            </div>
            
            <h1 className="text-6xl font-extrabold font-mono text-slate-100 mb-2">404</h1>
            <h2 className="text-xl font-bold text-slate-200 mb-2">Route Detour: Page Not Found</h2>
            <p className="text-xs text-slate-400 mb-6">
              The requested traffic monitoring endpoint or view does not exist in the TrafficVision system index.
            </p>

            <Link to="/">
              <Button className="w-full space-x-2">
                <FaHome />
                <span>Return to Central Overview</span>
              </Button>
            </Link>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};
