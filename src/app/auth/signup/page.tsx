'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import { auth } from '@/lib/db';
import { Wallet, Mail, Lock, Loader2, Check, Eye, EyeOff, User } from 'lucide-react';

export default function SignupPage() {
  const { refreshUser } = useAuth();
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return { score: 0, label: '', color: 'bg-slate-800', width: 'w-0' };
    let score = 0;
    if (pwd.length >= 6) score += 1;
    if (pwd.length >= 10) score += 1;
    if (/[A-Z]/.test(pwd)) score += 1;
    if (/[0-9]/.test(pwd)) score += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1;

    if (score <= 2) return { score, label: 'Weak', color: 'bg-red-500', width: 'w-[33%]' };
    if (score <= 4) return { score, label: 'Medium', color: 'bg-amber-500', width: 'w-[66%]' };
    return { score, label: 'Strong', color: 'bg-[#10B981]', width: 'w-full' };
  };

  const strength = getPasswordStrength(password);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const { user, error: signUpErr } = await auth.signUp(email, password);
      if (signUpErr) {
        setError(signUpErr.message);
      } else if (user) {
        const { error: signInErr } = await auth.signIn(email, password);
        if (signInErr) {
          setError(signInErr.message);
        } else {
          setSuccess('Account created successfully! Welcome to SpendSmart');
          await refreshUser();
          router.replace('/dashboard');
        }
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during sign up');
    } finally {
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

      {/* Right Panel - Signup Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-6 sm:p-12 bg-[#0F172A] relative overflow-hidden">
        {/* Mobile top bar with logo */}
        <div className="absolute top-6 left-6 flex md:hidden items-center gap-2">
          <Wallet className="h-6 w-6 text-emerald-400" />
          <span className="text-lg font-bold text-slate-100">SpendSmart</span>
        </div>
        
        <div className="w-full max-w-md space-y-6">
          {/* Header */}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-white tracking-tight">
              Create Account
            </h1>
            <p className="text-sm text-slate-400">
              Get started with your free account today
            </p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm text-center">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-4 py-3 rounded-xl text-sm text-center">
              {success}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSignup} className="space-y-4">
            {/* Full Name Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                Full Name
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center pointer-events-none">
                  <User className="h-[16px] w-[16px] text-[#64748B]" />
                </span>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-[#1E293B] border border-[#334155] focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981] rounded-[10px] py-3 pl-10 pr-4 text-white text-sm placeholder-[#64748B] outline-none transition-all"
                  placeholder="John Doe"
                  required
                />
              </div>
            </div>

            {/* Email Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center pointer-events-none">
                  <Mail className="h-[16px] w-[16px] text-[#64748B]" />
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#1E293B] border border-[#334155] focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981] rounded-[10px] py-3 pl-10 pr-4 text-white text-sm placeholder-[#64748B] outline-none transition-all"
                  placeholder="name@example.com"
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                Password
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center pointer-events-none">
                  <Lock className="h-[16px] w-[16px] text-[#64748B]" />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#1E293B] border border-[#334155] focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981] rounded-[10px] py-3 pl-10 pr-10 text-white text-sm placeholder-[#64748B] outline-none transition-all"
                  placeholder="At least 6 characters"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center text-[#64748B] hover:text-slate-200 transition-colors cursor-pointer"
                >
                  {showPassword ? (
                    <EyeOff className="h-[16px] w-[16px]" />
                  ) : (
                    <Eye className="h-[16px] w-[16px]" />
                  )}
                </button>
              </div>
              
              {/* Password strength bar */}
              {password && (
                <div className="space-y-1.5 pt-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400 font-medium">Password strength</span>
                    <span className={`font-semibold ${
                      strength.score <= 2 ? 'text-red-400' : strength.score <= 4 ? 'text-amber-400' : 'text-emerald-400'
                    }`}>
                      {strength.label}
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div className={`h-full transition-all duration-300 ${strength.color} ${strength.width}`}></div>
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                Confirm Password
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center pointer-events-none">
                  <Lock className="h-[16px] w-[16px] text-[#64748B]" />
                </span>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-[#1E293B] border border-[#334155] focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981] rounded-[10px] py-3 pl-10 pr-10 text-white text-sm placeholder-[#64748B] outline-none transition-all"
                  placeholder="Repeat your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center text-[#64748B] hover:text-slate-200 transition-colors cursor-pointer"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-[16px] w-[16px]" />
                  ) : (
                    <Eye className="h-[16px] w-[16px]" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-[#10B981] hover:bg-[#059669] active:scale-[0.98] text-white py-3 rounded-xl font-bold text-sm transition-all duration-150 shadow-lg shadow-emerald-500/10 cursor-pointer disabled:opacity-50 mt-2"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          {/* Sign In Link */}
          <div className="text-center pt-2">
            <p className="text-sm text-slate-400">
              Already have an account?{' '}
              <Link href="/auth/login" className="text-emerald-400 hover:text-emerald-300 hover:underline font-semibold transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
