'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/AuthContext';
import { auth, dbMode } from '@/lib/db';
import { Wallet, Mail, Lock, Loader2, Sparkles, Check, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const { refreshUser } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const { error: signInErr } = await auth.signIn(email, password);
      if (signInErr) {
        setError(signInErr.message);
      } else {
        await refreshUser();
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during sign in');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      localStorage.setItem('demo_mode', 'true');
      window.location.href = '/dashboard';
    } catch (err: any) {
      setError(err.message || 'An error occurred during demo login');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#0F172A] text-slate-100 font-sans">
      {/* Left Panel - Desktop Only */}
      <div className="hidden md:flex md:w-1/2 flex-col justify-between p-12 bg-gradient-to-br from-[#0F172A] to-[#064E3B] relative overflow-hidden">
        {/* Background decorations for a premium look */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -mr-40 -mt-40"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-slate-900/40 rounded-full blur-3xl pointer-events-none -ml-40 -mb-40"></div>
        
        {/* Logo/Brand Info */}
        <div className="flex items-center gap-3 relative z-10">
          <div className="bg-emerald-500/15 p-2.5 rounded-xl border border-emerald-500/20">
            <Wallet className="h-6 w-6 text-emerald-400" />
          </div>
          <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-emerald-400 to-emerald-200 bg-clip-text text-transparent">
            SpendSmart
          </span>
        </div>

        {/* Center content */}
        <div className="my-auto space-y-8 relative z-10 max-w-md">
          <h2 className="text-4xl font-extrabold tracking-tight leading-tight text-white">
            Take Control of Your Money
          </h2>
          <p className="text-slate-300 text-lg leading-relaxed">
            Track expenses, set savings goals and build better financial habits.
          </p>
          
          {/* Features List */}
          <div className="space-y-4 pt-4">
            {[
              'Track every rupee automatically',
              'Beautiful charts and insights',
              'Set and achieve savings goals',
            ].map((feature, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <div className="bg-emerald-500/20 text-emerald-400 p-1 rounded-full border border-emerald-500/30">
                  <Check className="h-4 w-4" />
                </div>
                <span className="text-slate-200 font-medium">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer branding */}
        <div className="text-xs text-slate-450 relative z-10">
          © {new Date().getFullYear()} SpendSmart. All rights reserved.
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-6 sm:p-12 bg-[#0F172A] relative overflow-hidden">
        {/* Mobile top bar with logo */}
        <div className="absolute top-6 left-6 flex md:hidden items-center gap-2">
          <Wallet className="h-6 w-6 text-emerald-400" />
          <span className="text-lg font-bold text-slate-100">SpendSmart</span>
        </div>
        
        <div className="w-full max-w-md space-y-8">
          {/* Welcome Header */}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-white tracking-tight">
              Welcome Back
            </h1>
            <p className="text-sm text-slate-400">
              Sign in to your account
            </p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm text-center">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center pointer-events-none">
                  <Mail className="h-[16px] w-[16px] text-[#64748B]" />
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#1E293B] border border-[#334155] focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981] rounded-[10px] py-3 pl-11 pr-4 text-white text-sm placeholder-[#64748B] outline-none transition-all"
                  placeholder="name@example.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                  Password
                </label>
                <Link
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    alert("For password reset, please contact support or use Supabase dashboard reset.");
                  }}
                  className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
                >
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center pointer-events-none">
                  <Lock className="h-[16px] w-[16px] text-[#64748B]" />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#1E293B] border border-[#334155] focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981] rounded-[10px] py-3 pl-11 pr-11 text-white text-sm placeholder-[#64748B] outline-none transition-all"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center text-[#64748B] hover:text-slate-200 transition-colors cursor-pointer"
                >
                  {showPassword ? (
                    <EyeOff className="h-[16px] w-[16px]" />
                  ) : (
                    <Eye className="h-[16px] w-[16px]" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-[#10B981] hover:bg-[#059669] active:scale-[0.98] text-white py-3 rounded-xl font-bold text-sm transition-all duration-150 shadow-lg shadow-emerald-500/10 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* OR Divider */}
          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-slate-800"></div>
            <span className="flex-shrink mx-4 text-slate-500 text-xs uppercase tracking-widest font-bold">Or</span>
            <div className="flex-grow border-t border-slate-800"></div>
          </div>

          {/* Demo Sign In */}
          <button
            onClick={handleDemoLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-transparent hover:bg-slate-800/40 text-slate-200 py-3 rounded-xl font-semibold text-sm transition-all duration-150 border border-slate-700 hover:border-slate-600 cursor-pointer"
          >
            <Sparkles className="h-4 w-4 text-amber-400" />
            <span>Sign In with Demo Account</span>
          </button>

          {/* Sign Up Link */}
          <div className="text-center pt-2">
            <p className="text-sm text-slate-400">
              Don't have an account?{' '}
              <Link href="/auth/signup" className="text-emerald-400 hover:text-emerald-300 hover:underline font-semibold transition-colors">
                Sign up
              </Link>
            </p>
          </div>

          {dbMode === 'demo' && (
            <p className="text-[10px] text-center text-slate-650">
              * Currently running in mock mode. You can log in with any email and password.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

