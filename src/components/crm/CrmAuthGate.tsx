'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Lock,
  ShieldCheck,
  ArrowRight,
  User,
  Building2,
  KeyRound,
  AlertCircle,
  Sparkles
} from 'lucide-react';
import { VALID_CRM_PASSWORDS } from '@/lib/crm-data';

interface CrmAuthGateProps {
  onAuthenticated: () => void;
}

export function CrmAuthGate({ onAuthenticated }: CrmAuthGateProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    setTimeout(() => {
      const cleanPass = password.trim().toLowerCase();
      if (VALID_CRM_PASSWORDS.includes(cleanPass)) {
        if (typeof window !== 'undefined') {
          localStorage.setItem('anv_crm_auth', 'true');
          localStorage.setItem('anv_crm_user', 'Prem Sharma');
        }
        setLoading(false);
        onAuthenticated();
      } else {
        setLoading(false);
        setError('Invalid CRM password. Use "crm123" or "anvcrm2026" to access.');
      }
    }, 350);
  };

  const handleQuickUnlock = () => {
    setPassword('crm123');
    setTimeout(() => {
      if (typeof window !== 'undefined') {
        localStorage.setItem('anv_crm_auth', 'true');
        localStorage.setItem('anv_crm_user', 'Prem Sharma');
      }
      onAuthenticated();
    }, 200);
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
                src="/LogoAnv.png"
                alt="ANV REEALTY"
                width={56}
                height={56}
                className="w-full h-full object-contain"
                priority
              />
            </div>
          </Link>
          <div className="flex items-center justify-center gap-2 mb-1">
            <h1 className="text-2xl font-black text-white tracking-tight">Anv Reeality</h1>
            <span className="px-2 py-0.5 rounded-md bg-amber-400/20 text-amber-300 border border-amber-400/30 text-[11px] font-bold tracking-wider">
              CRM
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
          <div className="text-center mb-5 pb-4 border-b border-zinc-100">
            <h2 className="text-base font-bold text-zinc-900">Advisor Portal Unlock</h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              Enter your CRM security credentials to open the sales dashboard
            </p>
          </div>

          {/* Active Profile Info */}
          <div className="mb-5 p-3.5 bg-zinc-50 border border-zinc-200/80 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-zinc-950 text-white font-bold text-xs flex items-center justify-center border border-zinc-800 shadow-xs">
                PS
              </div>
              <div>
                <p className="text-xs font-bold text-zinc-900">Prem Sharma</p>
                <p className="text-[11px] text-zinc-500">Senior Sales Advisor • Pune West</p>
              </div>
            </div>
            <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-full flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Online
            </span>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider">
                  CRM Access Password
                </label>
                <span className="text-[11px] text-amber-700 font-medium">
                  Default: <code className="bg-amber-50 px-1 py-0.5 rounded text-amber-900 font-mono">crm123</code>
                </span>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoFocus
                  placeholder="Enter CRM password (e.g. crm123)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-hidden focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 focus:bg-white transition"
                />
                <KeyRound className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 text-xs"
                  tabIndex={-1}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            {/* Quick 1-Click Fill Helper */}
            <div className="flex items-center justify-between text-xs text-zinc-500 pt-1">
              <span>Quick Unlock Options:</span>
              <button
                type="button"
                onClick={handleQuickUnlock}
                className="text-amber-800 font-bold hover:underline flex items-center gap-1"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>Auto-Fill & Open</span>
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 hover:from-amber-600 hover:to-amber-500 hover:text-zinc-950 text-white text-xs font-bold rounded-xl shadow-lg transition-all duration-300 flex items-center justify-center gap-2 group disabled:opacity-50"
            >
              <span>{loading ? 'Validating CRM Access...' : 'Unlock & Open CRM Dashboard'}</span>
              <ArrowRight className="w-4 h-4 text-amber-400 group-hover:text-zinc-950 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          {/* Footer note */}
          <div className="mt-5 pt-4 text-center border-t border-zinc-100">
            <p className="text-[11px] text-zinc-400">
              Need admin CMS instead?{' '}
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
