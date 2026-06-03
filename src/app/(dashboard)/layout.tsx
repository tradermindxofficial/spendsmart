'use client';

import React from 'react';
import { useAuth } from '../../lib/AuthContext';
import Sidebar from '../../components/Sidebar';

import { Loader2 } from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { loading, user } = useAuth();

  // Show a premium, centered loading spinner while checking auth session
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-955 text-slate-100">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 text-emerald-400 animate-spin" />
          <p className="text-sm font-semibold tracking-wider text-slate-450 uppercase animate-pulse">
            Loading SpendSmart...
          </p>
        </div>
      </div>
    );
  }

  // If not logged in, we shouldn't render the dashboard page content
  // (the AuthProvider useEffect handles routing them back to /auth/login)
  if (!user) {
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100">

      <div className="flex flex-1 relative">
        {/* Responsive Sidebar */}
        <Sidebar />

        {/* Main Content Area */}
        <main className="flex-1 overflow-x-hidden pb-20 md:pb-6 p-4 sm:p-6 md:p-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
