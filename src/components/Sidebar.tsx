'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../lib/AuthContext';
import { 
  LayoutDashboard, 
  ArrowLeftRight, 
  PlusCircle, 
  Target, 
  BarChart3, 
  LogOut, 
  Wallet,
  User
} from 'lucide-react';

const MENU_ITEMS = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Transactions', path: '/transactions', icon: ArrowLeftRight },
  { name: 'Add New', path: '/add-transaction', icon: PlusCircle },
  { name: 'Savings Goals', path: '/goals', icon: Target },
  { name: 'Reports', path: '/reports', icon: BarChart3 },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();

  return (
    <>
      {/* Desktop Sidebar (hidden on mobile) */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-900 border-r border-slate-800 text-slate-300 h-screen sticky top-0 shrink-0">
        {/* Logo Section */}
        <div className="p-6 border-b border-slate-800 flex items-center gap-3">
          <div className="bg-emerald-500/10 p-2 rounded-lg border border-emerald-500/25">
            <Wallet className="h-6 w-6 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-emerald-200 bg-clip-text text-transparent">
              SpendSmart
            </h1>
            <p className="text-[10px] text-slate-500 leading-tight">Save smarter</p>
          </div>
        </div>

        {/* Navigation Section */}
        <nav className="flex-1 px-4 py-6 space-y-1">
          {MENU_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 group ${
                  isActive
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : 'hover:bg-slate-800/50 hover:text-white border border-transparent'
                }`}
              >
                <Icon className={`h-5 w-5 shrink-0 transition-colors ${
                  isActive ? 'text-emerald-400' : 'text-slate-400 group-hover:text-slate-200'
                }`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* User Info & Sign Out Section */}
        <div className="p-4 border-t border-slate-800 space-y-2">
          {user && (
            <div className="flex items-center gap-3 px-3 py-2 bg-slate-850 rounded-lg border border-slate-800/80">
              <div className="bg-slate-800 p-1.5 rounded-full shrink-0">
                <User className="h-4 w-4 text-slate-400" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-slate-200 truncate">{user.email}</p>
                <span className="inline-block text-[9px] uppercase tracking-wider font-extrabold px-1.5 py-0.2 bg-emerald-500/10 text-emerald-400 rounded-full border border-emerald-500/25 leading-normal">
                  {user.subscription_status}
                </span>
              </div>
            </div>
          )}
          <button
            onClick={() => signOut()}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:bg-red-500/10 hover:text-red-400 border border-transparent hover:border-red-500/20 transition-all duration-200"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Navigation (hidden on desktop) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-slate-900 border-t border-slate-800 text-slate-400 px-2 py-1 flex justify-around items-center shadow-lg">
        {MENU_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.path;
          return (
            <Link
              key={item.path}
              href={item.path}
              className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-lg text-[10px] font-medium transition-all ${
                isActive ? 'text-emerald-400 bg-emerald-500/5' : 'hover:text-slate-200'
              }`}
            >
              <Icon className={`h-5 w-5 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
              <span className="truncate">{item.name === 'Savings Goals' ? 'Goals' : item.name}</span>
            </Link>
          );
        })}
        
        {/* Mobile Log Out icon button */}
        <button
          onClick={() => signOut()}
          className="flex flex-col items-center gap-0.5 py-1 px-3 rounded-lg text-[10px] font-medium text-slate-400 hover:text-red-400"
          title="Sign Out"
        >
          <LogOut className="h-5 w-5" />
          <span>Exit</span>
        </button>
      </nav>
    </>
  );
}
