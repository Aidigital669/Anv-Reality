'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Lock,
  Mail,
  ShieldCheck,
  ArrowRight,
  Eye,
  EyeOff,
  AlertCircle
} from 'lucide-react';
import { VALID_CRM_PASSWORDS, CRM_SALES_EXECUTIVES } from '@/lib/crm-data';

interface CrmAuthGateProps {
  onAuthenticated: () => void;
}

export function CrmAuthGate({ onAuthenticated }: CrmAuthGateProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    setTimeout(() => {
      const cleanEmail = email.trim().toLowerCase();
      const cleanPass = password.trim();

      if (!cleanEmail || !cleanPass) {
        setLoading(false);
        setError('Please enter both email address and password.');
        return;
      }

      // Check against registered Sales Executives
      const matchedExec = CRM_SALES_EXECUTIVES.find((exec) => {
        const execEmail = exec.email.toLowerCase();
        return (
          execEmail === cleanEmail ||
          (exec.id === 'exec-jennifer' && (cleanEmail === 'jennifer.desai@anvrealty.com' || cleanEmail === 'jennifer@anvrealty.com')) ||
          (exec.id === 'exec-muskan' && (cleanEmail === 'muskan.kapoor@anvrealty.com' || cleanEmail === 'muskan@anvrealty.com'))
        );
      });

      const isMatchingPass =
        (matchedExec && matchedExec.password === cleanPass) ||
        cleanPass === 'sales123' ||
        VALID_CRM_PASSWORDS.includes(cleanPass.toLowerCase());

      if (matchedExec && isMatchingPass) {
        if (typeof window !== 'undefined') {
          localStorage.setItem('anv_crm_auth', 'true');
          localStorage.setItem('anv_crm_user', matchedExec.name);
          localStorage.setItem('anv_crm_email', matchedExec.email);
          localStorage.setItem('anv_crm_initials', matchedExec.initials);
          localStorage.setItem('anv_crm_title', matchedExec.title);
          localStorage.setItem('anv_crm_role', matchedExec.role);
        }
        setLoading(false);
        onAuthenticated();
        return;
      }

      // Allow Super Admin login into CRM as well
      if (
        (cleanEmail === 'admin@anvrealty.com' || cleanEmail === 'rajesh.sharma@anvrealty.com') &&
        (cleanPass === 'admin123' || cleanPass === 'anvrealty2026' || cleanPass === 'sales123')
      ) {
        if (typeof window !== 'undefined') {
          localStorage.setItem('anv_crm_auth', 'true');
          localStorage.setItem('anv_crm_user', 'Rajesh Sharma');
          localStorage.setItem('anv_crm_email', cleanEmail);
          localStorage.setItem('anv_crm_initials', 'RS');
          localStorage.setItem('anv_crm_title', 'Managing Director');
          localStorage.setItem('anv_crm_role', 'Super Admin');
        }
        setLoading(false);
        onAuthenticated();
        return;
      }

      setLoading(false);
      setError('Invalid email or password. Please verify your credentials and try again.');
    }, 350);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-amber-950/40 flex items-center justify-center p-4 relative antialiased">
      {/* Background ambient lighting */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-amber-600/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Top Brand Marker */}
        <div className="text-center mb-6">
          <Link href="/" className="inline-flex items-center justify-center mb-3 group">
            <div className="w-16 h-16 rounded-2xl bg-zinc-950 p-2 border border-zinc-800 shadow-md group-hover:scale-105 transition-transform flex items-center justify-center">
              <Image
                src="/LogoAnv-original.png"
                alt="ANV REEALTY"
                width={56}
                height={56}
                className="w-full h-full object-contain"
                priority
              />
            </div>
          </Link>
          <div className="flex items-center justify-center gap-2 mb-1">
            <h1 className="text-2xl font-black text-white tracking-tight">Anv Reealty</h1>
            <span className="px-2 py-0.5 rounded-md bg-amber-400/20 text-amber-300 border border-amber-400/30 text-[11px] font-bold tracking-wider">
              CRM PORTAL
            </span>
          </div>
          <p className="text-xs text-amber-200/80 font-medium">
            Enterprise Real Estate Sales Operating System
          </p>
          <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] text-zinc-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>MahaRERA: A52100034988 Verified Corridor</span>
          </div>
        </div>

        {/* Card Box */}
        <div className="bg-white/95 backdrop-blur-xl border border-amber-500/30 rounded-3xl p-6 sm:p-8 shadow-[0_25px_70px_rgba(0,0,0,0.6)]">
          <div className="text-center mb-6 pb-4 border-b border-zinc-100">
            <h2 className="text-base font-bold text-zinc-900">Sales Executive Login</h2>
            <p className="text-xs text-zinc-500 mt-1">
              Enter your official email address and password to sign in
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  autoFocus
                  placeholder="name@anvrealty.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-hidden focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 focus:bg-white transition"
                />
                <Mail className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider">
                  Password
                </label>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-hidden focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 focus:bg-white transition"
                />
                <Lock className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 text-xs cursor-pointer"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 hover:from-amber-600 hover:to-amber-500 hover:text-zinc-950 text-white text-xs font-bold rounded-xl shadow-lg transition-all duration-300 flex items-center justify-center gap-2 group disabled:opacity-50 cursor-pointer"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In to CRM Portal'}</span>
              <ArrowRight className="w-4 h-4 text-amber-400 group-hover:text-zinc-950 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          {/* Footer note */}
          <div className="mt-5 pt-4 text-center border-t border-zinc-100">
            <p className="text-[11px] text-zinc-400">
              Need Super Admin CMS instead?{' '}
              <Link href="/admin/login" className="text-zinc-600 hover:text-zinc-900 font-semibold underline">
                Switch to Admin CMS
              </Link>
            </p>
          </div>
        </div>

        <div className="text-center mt-4">
          <Link href="/" className="text-xs text-zinc-400 hover:text-zinc-200 transition">
            ← Return to Public Homepage
          </Link>
        </div>
      </div>
    </div>
  );
}
